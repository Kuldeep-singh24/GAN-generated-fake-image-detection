# server/app.py
import io
import base64
import os
import numpy as np
from PIL import Image, ImageFilter
from typing import List, Dict
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import torch.nn as nn
import torchvision.transforms as T
from torchvision.models import efficientnet_b2, EfficientNet_B2_Weights
import cv2

app = FastAPI(title="Fake-vs-Real Inference API")

# allow CORS from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173",
                   "http://localhost:5175", "http://localhost:5176"],  # frontend dev origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- CONFIG ----------
CHECKPOINT_PATH = "best_effb2_gen_1_.pth"  # put your trained checkpoint here
DEVICE = "mps" if (hasattr(torch.backends, "mps")
                   and torch.backends.mps.is_available()) else "cpu"
MODEL_INPUT_SIZE = 224
# ----------------------------

# ---------- MODEL LOADING ----------


def load_model(path: str):
    # Build model
    weights = EfficientNet_B2_Weights.IMAGENET1K_V1
    model = efficientnet_b2(weights=weights)
    # replace head
    in_f = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_f, 2)

    # load saved weights (handle dict shapes)
    ckpt = torch.load(path, map_location="cpu")
    if isinstance(ckpt, dict) and ("model_state" in ckpt or "model" in ckpt):
        state = ckpt.get("model_state", ckpt.get("model", ckpt))
    else:
        state = ckpt
    try:
        model.load_state_dict(state)
    except RuntimeError:
        # try strict=False if shapes mismatch
        model.load_state_dict(state, strict=False)

    model.eval()
    return model


if not os.path.exists(CHECKPOINT_PATH):
    raise FileNotFoundError(f"Place your checkpoint at: {CHECKPOINT_PATH}")

model = load_model(CHECKPOINT_PATH)
model.to(DEVICE)
print("Model loaded on", DEVICE)

# transforms (same as training)
transform = T.Compose([
    T.Resize(int(MODEL_INPUT_SIZE * 1.15)),
    T.CenterCrop(MODEL_INPUT_SIZE),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
])

# ---------- GRAD-CAM helpers ----------
# We'll register hooks on the last conv features
target_layer = None
for n, m in model.named_modules():
    # choose last convolutional block typical to EfficientNet
    if isinstance(m, nn.Conv2d):
        target_layer = m

if target_layer is None:
    raise RuntimeError(
        "Could not find a Conv2d layer to attach Grad-CAM hooks to.")


class GradCAM:
    def __init__(self, model, layer):
        self.model = model
        self.layer = layer
        self.activations = None
        self.gradients = None
        layer.register_forward_hook(self._forward_hook)
        layer.register_backward_hook(self._backward_hook)

    def _forward_hook(self, module, inp, out):
        self.activations = out.detach()

    def _backward_hook(self, module, grad_in, grad_out):
        self.gradients = grad_out[0].detach()

    def __call__(self, input_tensor, class_idx=None):
        # forward
        out = self.model(input_tensor)
        if class_idx is None:
            class_idx = int(out.argmax(dim=1).item())
        # backward to get gradients for class_idx
        self.model.zero_grad()
        score = out[0, class_idx]
        score.backward(retain_graph=True)

        # pooled gradients
        grads = self.gradients  # [C,H,W]
        acts = self.activations  # [N,C,H,W] or [C,H,W] depending
        if acts is None or grads is None:
            raise RuntimeError(
                "GradCAM hooks didn't capture activations/gradients")

        # if activations shape [N,C,H,W]
        if acts.dim() == 4:
            acts = acts[0]

        weights = torch.mean(grads, dim=(1, 2))
        cam = torch.zeros(acts.shape[1:], dtype=torch.float32)  # HxW
        for i, w in enumerate(weights):
            cam += w.cpu() * acts[i].cpu()
        cam = np.maximum(cam.numpy(), 0)
        if cam.max() > 0:
            cam = cam / cam.max()
        else:
            cam = cam
        return cam, class_idx


gradcam = GradCAM(model, target_layer)

# ---------- ANALYSIS heuristics for "why fake" ----------


def laplacian_var(np_im: np.ndarray) -> float:
    gray = cv2.cvtColor(np_im, cv2.COLOR_RGB2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()


def noise_level(np_im: np.ndarray) -> float:
    # estimate noise by high-pass (image - gaussian blur)
    img = cv2.cvtColor(np_im, cv2.COLOR_RGB2GRAY).astype(np.float32)/255.0
    blur = cv2.GaussianBlur(img, (3, 3), 0)
    noise = img - blur
    return float(np.std(noise))


def compression_artifact_score(np_im: np.ndarray) -> float:
    # heuristic: strong blockiness increases power at certain frequencies
    # compute DCT blockiness proxy: variance of 8x8 block means
    h, w, _ = np_im.shape
    h8 = (h // 8) * 8
    w8 = (w // 8) * 8
    crop = np_im[:h8, :w8]
    blocks = crop.reshape(h8//8, 8, w8//8, 8, 3).mean(axis=(1, 3, 4))
    return float(np.var(blocks))


def explain_heuristics(np_im: np.ndarray, cam: np.ndarray, label: int, conf: float) -> List[str]:
    # label 1 => fake, 0 => real
    notes = []
    lv = laplacian_var(np_im)
    nl = noise_level(np_im)
    ca = compression_artifact_score(np_im)
    # thresholds tuned loosely; these are heuristics
    if lv < 20:
        notes.append("Low sharpness / possible upsampling or blur.")
    if nl > 0.03:
        notes.append(
            "High local noise; may indicate synthesis artifacts or aggressive denoising.")
    if ca > 0.0005:
        notes.append("Blocky/compression-like artifacts detected.")
    # Grad-CAM insight: measure cam concentration near edges vs interior
    cam_resized = cv2.resize(cam, (np_im.shape[1], np_im.shape[0]))
    # focus ratio: fraction of mass in top 20% pixels
    flat = cam_resized.flatten()
    top_mass = np.sum(np.sort(flat)[-int(0.2*len(flat)):])
    if top_mass / (flat.sum()+1e-9) > 0.5:
        notes.append(
            "Model attention is strongly localized (e.g., eyes/hairline) — may indicate localized synthesis artifacts.")
    # final summary
    if label == 1 and len(notes) == 0:
        notes.append(
            "Model predicts fake — no single dominant heuristic found; suspicious texture and subtle artefacts likely.")
    if label == 0:
        notes = [
            "Model predicts the image is Real (no major synthetic indicators detected)."]
    return notes

# ---------- utility to convert cam -> base64 png ----------


def cam_to_base64(cam: np.ndarray, orig_pil: Image.Image) -> str:
    # cam: [H,W] normalized 0..1
    cam_resized = cv2.resize(cam, orig_pil.size)
    heatmap = (cam_resized*255).astype(np.uint8)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    overlay = np.clip(np.array(orig_pil).astype(
        np.float32)*0.6 + heatmap.astype(np.float32)*0.4, 0, 255).astype(np.uint8)
    # convert overlay to PNG bytes
    pil = Image.fromarray(overlay)
    buf = io.BytesIO()
    pil.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return b64

# ---------- endpoint ----------


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        data = await file.read()
        pil = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as e:
        return JSONResponse({"error": "invalid_image", "detail": str(e)}, status_code=400)

    # preprocess
    input_tensor = transform(pil).unsqueeze(0).to(DEVICE)

    # inference
    with torch.no_grad():
        out = model(input_tensor)
        probs = torch.softmax(out, dim=1)[0].cpu().numpy()
    real_prob, fake_prob = float(probs[0]), float(probs[1])
    label_idx = int(np.argmax(probs))
    conf = float(probs[label_idx])

    # Grad-CAM (needs a backward pass, so re-run on CPU if MPS problematic)
    # Move model and input to CPU if MPS unstable for backward hooks
    # We'll move tensors to device and call gradcam which uses the model with hooks
    cam = None
    try:
        # ensure model on DEVICE
        cam_arr, class_idx = gradcam(input_tensor, label_idx)
        cam = cam_arr
    except Exception as e:
        # fallback: produce flat cam
        cam = np.zeros(
            (MODEL_INPUT_SIZE//4, MODEL_INPUT_SIZE//4), dtype=np.float32)
        print("GradCAM failed:", e)

    # create explanation heuristics using original image converted to numpy
    np_im = np.array(pil)
    explanation = explain_heuristics(np_im, cam, label_idx, conf)

    # gradcam overlay as base64
    gradcam_b64 = cam_to_base64(cam, pil)

    resp = {
        "label": "Fake" if label_idx == 1 else "Real",
        "confidence": conf,
        "probs": {"Real": real_prob, "Fake": fake_prob},
        "explanation": explanation,
        "gradcam": gradcam_b64
    }
    return resp

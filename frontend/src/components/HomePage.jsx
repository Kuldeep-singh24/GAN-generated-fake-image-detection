import React, { useState, useRef, useEffect } from 'react';
import Navbar from './Navbar';
import defaultPreview from '../imgs/preview_img.png';
import '../styles/Buttons.css';

function HomePage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(defaultPreview);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showNavbar, setShowNavbar] = useState(true);
  const resultRef = useRef(null);

  const handleFile = (e) => {
    setResult(null);
    setError(null);
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  // Hide/show Navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Show Navbar if near top, hide if scrolled past 100px
      if (window.scrollY < 100) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function classify() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const resp = await fetch(
  "https://gan-generated-fake-image-detection.onrender.com/predict",
  {
    method: "POST",
    body: form,
  }
);

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "Server error");
      }
      const data = await resp.json();
      setResult(data);

      // Hide Navbar and scroll to results after a short delay for smoothness
      setTimeout(() => {
        setShowNavbar(false);
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#040A2A] bg-[radial-gradient(circle_at_20%_70%,rgba(160,50,255,0.85),rgba(91,10,191,0.45),rgba(4,10,42,1))]">
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${showNavbar ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-16 pointer-events-none'}`}
      >
        <Navbar />
      </div>
      <div className="flex min-h-screen">
        {/* Left half */}
        <div className="w-3/5 items-center justify-start flex">
          <div className="text-left px-10 text-white">
            <h1 className="uppercase font-bold font-founders text-8xl">Detect</h1>
            <h1
              className="uppercase font-bold font-founders text-8xl text-zinc-900"
              style={{ WebkitTextStroke: '1px white' }}
            >
              GAN generated
            </h1>
            <h1 className="uppercase font-bold font-founders text-8xl">Images Easily. </h1>
          </div>
        </div>
        {/* Right half */}
        <div className="w-2/5 flex flex-col items-center justify-center pt-[100px]">
          <div className="bg-white w-5/6 min-h-[340px] rounded-3xl shadow-2xl shadow-zinc-900 flex flex-col items-center justify-center p-8">
            
            {previewUrl && (
              <div className="mt-2 flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-96 max-w-full rounded-lg border border-gray-300 shadow"
                />
              </div>
            )}
          </div>
          {/* Classify Button */}
          <div className='flex flex-row  gap-4 mt-4'>
            <button
                className= 'px-3 py-2 mt-3 bg-purple-600 w-1/2 text-white rounded-lg font-semibold text-lg shadow hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-500 hover:scale-105 transition-all duration-300 flex items-center justify-center'
                style={{ minWidth: 180 }}
                onClick={classify}
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Classifying...
                  </>
                ) : (
                  "Classify"
                )}
              </button>
              {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
                <label className="mt-5 relative inline-block cursor-pointer w-1/2">
                  <span className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-500 hover:scale-105 transition-all duration-300">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div ref={resultRef} className="min-h-screen flex flex-col items-center justify-center font-founders bg-[#040A2A] bg-[radial-gradient(circle_at_20%_70%,rgba(160,50,255,0.85),rgba(91,10,191,0.45),rgba(4,10,42,1))] py-6">
        {result && (
          <div className="w-full max-w-7/8 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-5xl font-extrabold mb-10 text-center  uppercase">Prediction Result</h2>
            <div className="text-center mb-8">
              <span className="text-6xl font-semibold">
                Prediction:{" "}
                <span className={result.label === 'Real' ? 'text-green-600 uppercase' : 'text-red-600 uppercase'}>
                  {result.label}
                </span>
                {" "}({(result.confidence * 100).toFixed(2)}%)
              </span>
            </div>
            <div className='flex flex-row'>
                <div className="mb-4 w-1/2 items-center justify-center text-3xl">
                  <strong className='uppercase'>Why:</strong>
                  <ul className="list-disc list-outside pl-6 mt-2 text-gray-600">
                    {result.explanation.map((s, i) => (
                      <li key={i} className="wrap-break-word leading-relaxed">{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="w-0.5 h-auto bg-zinc-800 mx-6"></div> {/* Vertical line */}
                <div className='w-1/2 items-center justify-center text-center text-3xl'>
                  <strong className=''>Inverse Grad-CAM (model attention):</strong>
                  <div className="flex justify-center mt-4">
                    <img
                      src={`data:image/png;base64,${result.gradcam}`}
                      alt="gradcam"
                      className="rounded-lg border shadow max-w-full "
                      style={{ width: 400 }}
                    />
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;

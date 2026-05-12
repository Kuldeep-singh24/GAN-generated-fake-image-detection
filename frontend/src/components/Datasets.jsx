import React, { useState } from 'react';
import Navbar from './Navbar';

// Import images so Vite/React bundles them correctly
import ffhq1 from '../imgs/ffhq/ffhq_1.jpg';
import ffhq2 from '../imgs/ffhq/ffhq_2.jpg';
import ffhq3 from '../imgs/ffhq/ffhq_3.jpg';
import ffhq4 from '../imgs/ffhq/ffhq_4.jpg';

import sd1 from '../imgs/sd/sd_1.jpg';
import sd2 from '../imgs/sd/sd_2.jpg';
import sd3 from '../imgs/sd/sd_3.jpg';
import sd4 from '../imgs/sd/sd_4.jpg';

import gan1 from '../imgs/gan/gan_1.png';
import gan2 from '../imgs/gan/gan_2.png';
import gan3 from '../imgs/gan/gan_3.png';
import gan4 from '../imgs/gan/gan_4.png';

// Dataset config
const datasets = [
  {
    name: 'GAN Generated Dataset Images',
    description: '21,300 GAN-generated images: ProGAN, StyleGAN2, StyleGAN3 (7,100 each).',
    samples: [gan1, gan2, gan3, gan4],
    link: 'https://github.com/NVlabs/stylegan3',
    tags: ['ProGAN', 'StyleGAN2', 'StyleGAN3'],
  },
  {
    name: 'Stable Diffusion Dataset',
    description: '9,000 fake faces generated using Stable Diffusion, diverse synthetic facial features.',
    samples: [sd1, sd2, sd3, sd4],
    link: 'https://huggingface.co/datasets/lambdalabs/pokemon-blip-captions',
    tags: ['Stable Diffusion', 'Fake Faces'],
  },
  {
    name: 'FFHQ - Flickr Faces High Quality',
    description: '50,000 high-quality real face images, used as the baseline for GAN training.',
    samples: [ffhq1, ffhq2, ffhq3, ffhq4],
    link: 'https://github.com/NVlabs/ffhq-dataset',
    tags: ['FFHQ', 'Real Faces'],
  },
];

function Datasets() {
  // 🔥 PREVIEW STATE (new)
  const [previewImg, setPreviewImg] = useState(null);

  return (
    <div className="min-h-screen h-full pb-10 font-founders bg-[#040A2A] bg-[radial-gradient(circle_at_20%_70%,rgba(160,50,255,0.85),rgba(91,10,191,0.45),rgba(4,10,42,1))]">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="pt-30 pb-16 min-h-screen w-full flex flex-row gap-20">
        <div className="flex flex-col justify-center w-1/2">
          <div className="bg-black w-full">
            <h1 className="px-10 text-8xl md:text-8xl font-extrabold text-white text-left tracking-wider drop-shadow-lg uppercase mt-10">
              Datasets
            </h1>
          </div>
          <div className="bg-purple-200 w-4/5">
            <h1 className="px-10 mt-6 text-6xl md:text-8xl font-extrabold text-black text-left tracking-wider drop-shadow-lg uppercase">
              Used
            </h1>
          </div>
        </div>

        <div className="card max-w-1/2 h-auto mr-10 rounded-4xl mt-4 drop-shadow-xl drop-shadow-amber-400 flex flex-col items-center justify-center">
          <div className="bg-white w-5/6 h-5/6 rounded-3xl shadow-3xl shadow-zinc-200 text-center flex justify-center items-center p-10">
            <p className="text-[18px]">
              Our model has been trained using a carefully curated collection of real and AI-generated (fake) images
              sourced from multiple publicly available datasets. These datasets include high-resolution real human
              faces, GAN-generated images, and Stable Diffusion–generated samples. The goal behind combining multiple
              sources is to ensure that the model learns to detect a wide range of synthetic artifacts — from subtle
              texture inconsistencies to complex generative distortions — making it robust against modern AI-image
              generation techniques.
              <br />
              <br />
              If you want to explore the datasets individually, click the “Know More” button below. It will take you to
              the full data cards, dataset descriptions, and official download links.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center -mt-3">
        <button className="uppercase text-2xl -mt-5 text-center font-extrabold text-white">
          Scroll to know more <span className="font-extrabold ml-2">&#8595;</span>
        </button>
      </div>

      {/* CARDS */}
      <div className="w-full max-w-8xl px-4 mt-20 mb-16">
        <div className="flex flex-col md:grid md:grid-cols-3 gap-10 overflow-x-auto snap-x snap-mandatory">
          {datasets.map((ds, idx) => (
            <div
              key={ds.name}
              className="relative group rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl border border-purple-400 hover:border-amber-400 transition-all duration-500 p-8 flex flex-col items-center snap-center animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.15 + 0.1}s` }}
            >
              <div className="absolute inset-0 rounded-3xl pointer-events-none border-2 border-transparent group-hover:border-amber-400 transition-all duration-500"></div>

              <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wide uppercase drop-shadow-lg text-center">
                {ds.name}
              </h2>

              <div className="flex flex-row flex-wrap justify-center gap-2 mb-4">
                {ds.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-2 bg-gradient-to-r from-amber-400 to-purple-500 text-black rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg animate-glow"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-lg text-blue-200 mb-4 text-center min-h-[60px]">{ds.description}</p>

              {/* 🔥 SAMPLE IMAGES WITH PREVIEW */}
              <div className="flex flex-row justify-center gap-2 mb-6">
                {ds.samples.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setPreviewImg(img)}
                    className="cursor-pointer w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white/40 bg-zinc-900 transform hover:scale-110 hover:z-10 transition-transform duration-300"
                  >
                    <img
                      src={img}
                      alt={`sample-${i}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>

              <a
                href={ds.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-auto px-7 py-2 rounded-lg font-bold text-lg text-black bg-gradient-to-r from-amber-500 to-purple-500 shadow-lg uppercase tracking-wider overflow-hidden transition-all duration-300 hover:from-purple-500 hover:to-blue-600 hover:scale-105 before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-blue-400 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500"
              >
                <span className="relative z-10">View Dataset</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      
      {previewImg && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            className="max-w-[85%] max-h-[85%] rounded-3xl shadow-2xl border-4 border-white"
          />
        </div>
      )}
    </div>
  );
}

export default Datasets;
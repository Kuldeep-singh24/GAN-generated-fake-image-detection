import React from 'react';
import Navbar from './Navbar';

function Datasets() {
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
              faces, GAN-generated images, and Stable Diffusion–generated samples.
              <br />
              <br />
              The goal behind combining multiple sources is to ensure that the model learns to detect a wide range of
              synthetic artifacts and generative distortions, making it robust against modern AI-image generation
              techniques.
            </p>

          </div>

        </div>
      </div>

     

    </div>
  );
}

export default Datasets;

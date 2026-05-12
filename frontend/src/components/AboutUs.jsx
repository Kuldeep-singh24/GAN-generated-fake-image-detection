import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

// Example team data (replace with your real info and images)
const team = [
  {
    name: 'Sneh Patel',
    reg: '20223170',
    position: 'Team Lead',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Saurabh Chaudhary',
    reg: '20223242',
    position: 'Team Member 1',
    img: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
  {
    name: 'Ravi Kumar Meena',
    reg: '20223200',
    position: 'Team Member 2',
    img: 'https://randomuser.me/api/portraits/men/47.jpg',
  },
  {
    name: 'Shibu',
    reg: '20223500',
    position: 'Team Member 3',
    img: 'https://randomuser.me/api/portraits/women/47.jpg',
  },
];

function AboutUs() {
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-founders bg-[#040A2A] bg-[radial-gradient(circle_at_20%_70%,rgba(160,50,255,0.85),rgba(91,10,191,0.45),rgba(4,10,42,1))] flex flex-col items-center">
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${showNavbar ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-16 pointer-events-none'}`}
      >
        <Navbar />
      </div>
      <div className="pt-32 pb-16 w-full flex flex-col items-center">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white text-center mb-12 tracking-widest animate-pulse drop-shadow-lg uppercase mt-8">Meet the Team</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 w-full max-w-7xl px-6">
          {team.map((member, idx) => (
            <div
              key={member.reg}
              className="group bg-white/10 border-2 border-purple-400 rounded-3xl p-6 flex flex-col items-center shadow-xl hover:scale-105 hover:border-blue-400 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none">
                <div className="w-full h-full bg-linear-to-br from-purple-500/30 to-blue-500/30 blur-2xl animate-blob" />
              </div>
              <img
                src={member.img}
                alt={member.name}
                className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
              />
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-wide group-hover:text-purple-300 transition-colors duration-300 uppercase drop-shadow">{member.name}</h2>
                <div className="text-lg text-blue-200 mb-1 tracking-widest animate-pulse">{member.reg}</div>
                <div className="text-xl font-semibold text-purple-200 group-hover:text-blue-300 transition-colors duration-300 uppercase">{member.position}</div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 blur-sm opacity-70 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
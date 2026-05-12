import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css"


function Navbar() {
  const [active, setActive] = useState("");
  const navigate = useNavigate();

  const handleClick = (item) => {
    setActive(item);
    switch (item) {
      case "Deepfake Detector":
        navigate("/");
        break;
      case "Datasets":
        navigate("/datasets");
        break;
      default:
        navigate("/");
    }
  };

  const menuItems = ["Deepfake Detector", "Datasets"];

  return (
    <div className="fixed mt-6 w-full z-50 ">
      <div className="
        flex flex-row justify-center gap-10 p-4 font-semibold 
        text-white backdrop-blur-xl bg-white/10 shadow-lg 
        border-b border-white/20 font-founders text-2xl
      ">
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => handleClick(item)}
            className={`
              relative px-3 py-1 transition-all duration-300 uppercase
              hover:text-amber-300
              active:scale-95
              after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full 
              after:bg-amber-400 after:scale-x-0 after:origin-left 
              after:transition-transform after:duration-300
              hover:after:scale-x-100
              ${active === item ? "text-amber-300 after:scale-x-100" : ""}
            `}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Navbar;

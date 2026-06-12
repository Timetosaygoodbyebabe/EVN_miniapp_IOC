import React from "react";
import { Icon } from "zmp-ui";

const LiquidGlass = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-6 relative overflow-hidden">
      
      {/* Background decoration to show off the blur effect */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* 1. Card lớn (Liquid Glass Card) */}
      <div className="relative z-10 w-full max-w-sm rounded-[32px] p-8 flex flex-col gap-8 items-center
        backdrop-blur-[24px] bg-gradient-to-br from-white/40 via-white/10 to-transparent
        border-t border-l border-t-white/60 border-l-white/40 border-b border-r border-b-white/10 border-r-white/10
        shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),_0_20px_40px_rgba(0,0,0,0.1)]
      ">
        
        <div className="text-center">
          <h2 className="text-3xl font-black text-white drop-shadow-md tracking-tight mb-2">Liquid Glass</h2>
          <p className="text-white/80 font-medium text-sm drop-shadow-sm">Thiết kế tinh tế mang đậm phong cách Apple</p>
        </div>

        {/* 2. Cụm Button (Capsule & Circle) */}
        <div className="flex items-center gap-4">
          
          {/* Button dạng Capsule */}
          <button className="relative group overflow-hidden rounded-full px-8 py-4 
            backdrop-blur-xl bg-gradient-to-br from-white/30 via-white/10 to-transparent
            border-t border-l border-t-white/60 border-l-white/40 border-b border-r border-b-white/10 border-r-white/10
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),_0_8px_16px_rgba(0,0,0,0.1)]
            transition-all duration-300 ease-out
            hover:bg-white/40 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),_0_12px_24px_rgba(0,0,0,0.15)] hover:-translate-y-0.5
            active:scale-[0.97] active:translate-y-0
          ">
            <span className="relative z-10 font-bold text-white tracking-widest text-sm drop-shadow-md">
              LIQUID GLASS
            </span>
          </button>

          {/* Nút tròn Play */}
          <button className="relative group overflow-hidden rounded-full w-14 h-14 flex items-center justify-center
            backdrop-blur-xl bg-gradient-to-br from-white/30 via-white/10 to-transparent
            border-t border-l border-t-white/60 border-l-white/40 border-b border-r border-b-white/10 border-r-white/10
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),_0_8px_16px_rgba(0,0,0,0.1)]
            transition-all duration-300 ease-out
            hover:bg-white/40 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),_0_12px_24px_rgba(0,0,0,0.15)] hover:-translate-y-0.5
            active:scale-[0.95] active:translate-y-0
          ">
            <div className="relative z-10 text-white drop-shadow-md ml-1">
              {/* Sử dụng Icon Play của ZMP UI hoặc SVG tự custom */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default LiquidGlass;

"use client";
import React, { useRef } from 'react';

interface AdvancedImportButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
}

export default function AdvancedImportButton({ onFileChange, accept, multiple = true }: AdvancedImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative group">
      {/* Animated glowing border effect */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-purple-600 rounded-xl opacity-50 group-hover:opacity-100 blur-[3px] transition-all duration-500 group-hover:animate-pulse"></div>
      
      {/* Outer wrapper */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="relative flex items-center justify-center px-6 py-2.5 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden transition-colors duration-300"
      >
        {/* Sci-fi tech grid background */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(6,182,212,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.15)_1px,transparent_1px)] bg-[size:6px_6px] group-hover:opacity-50 transition-opacity duration-500"></div>
        
        {/* Animated laser scanline */}
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent -translate-y-full group-hover:translate-y-[50px] transition-transform duration-[1.5s] ease-in-out shadow-[0_0_15px_#22d3ee] opacity-0 group-hover:opacity-100"></div>

        <div className="relative flex items-center gap-3 z-10">
          {/* Animated Icon */}
          <div className="relative flex items-center justify-center w-7 h-7">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping shadow-[0_0_10px_rgba(6,182,212,0.4)]"></div>
            <svg className="w-4 h-4 text-cyan-400 relative z-10 group-hover:-rotate-45 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-[9px] font-mono text-cyan-500/80 tracking-[0.25em] uppercase leading-none mb-1 group-hover:text-cyan-400 transition-colors drop-shadow-[0_0_2px_rgba(6,182,212,0.5)]">
              Secure Uplink
            </span>
            <span className="text-sm font-bold font-sans text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-widest uppercase group-hover:from-cyan-100 group-hover:to-purple-200 transition-all drop-shadow-md">
              Import Data
            </span>
          </div>
        </div>
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple={multiple} 
        accept={accept || "image/*,application/pdf,text/plain"}
        onChange={onFileChange}
      />
    </div>
  );
}

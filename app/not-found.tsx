"use client";
import Link from 'next/link';
import Navbar from './components/Navbar';
import UnifiedBackground from './components/UnifiedBackground';
import { useEffect, useState } from 'react';

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Pre-generate stable matrix rain columns (won't flicker on re-render)
const matrixColumns = Array.from({ length: 20 }, (_, i) => ({
  left: i * 5,
  speed: 3 + (((i * 7 + 3) % 11) / 11) * 4,
  delay: (((i * 13 + 5) % 17) / 17) * 3,
  chars: Array.from({ length: 30 }, (_, j) => GLITCH_CHARS[((i * 31 + j * 17 + 7) % GLITCH_CHARS.length)]),
}));

export default function NotFound() {
  const [glitchText, setGlitchText] = useState("404");

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText("404".split("").map((char) => 
        Math.random() > 0.7 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : char
      ).join(""));
    }, 100);
    const timeout = setTimeout(() => setGlitchText("404"), 200);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans relative overflow-hidden">
      <UnifiedBackground />
      <Navbar />

      {/* Matrix rain effect - stable characters */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-10">
        {matrixColumns.map((col, i) => (
          <div
            key={i}
            className="absolute text-[10px] font-mono text-cyan-400 whitespace-nowrap"
            style={{
              left: `${col.left}%`,
              animation: `matrix-fall ${col.speed}s linear infinite`,
              animationDelay: `${col.delay}s`,
            }}
          >
            {col.chars.map((char, j) => (
              <div key={j} className="leading-5">{char}</div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-6 relative z-10">
        <div className="text-center">
          {/* Glitch 404 */}
          <div className="relative mb-8">
            <div className="text-[150px] md:text-[220px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-white/[0.03] select-none glitch-text" data-text={glitchText}>
              {glitchText}
            </div>
            <div className="absolute inset-0 text-[150px] md:text-[220px] font-black tracking-tighter leading-none text-cyan-400/10 select-none glitch-layer-1" aria-hidden="true">404</div>
            <div className="absolute inset-0 text-[150px] md:text-[220px] font-black tracking-tighter leading-none text-fuchsia-400/10 select-none glitch-layer-2" aria-hidden="true">404</div>
          </div>

          <div className="w-full max-w-md mx-auto h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-8 animate-scan-horizontal" />

          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Lost in the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">
              Matrix
            </span>
          </h1>

          <p className="text-gray-500 text-lg max-w-md mx-auto mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved to another dimension.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/"
              className="group relative px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:scale-[1.02] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Return Home
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" /></svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/optimizer"
              className="group px-8 py-4 rounded-xl font-bold border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center gap-2"
            >
              Go to Optimizer
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>


    </div>
  );
}

"use client";
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { userId } = useAuth();
  const pathname = usePathname(); // Jis page par hain, usko highlight karne ke liye

  return (
    <nav className="w-full bg-[#020203]/80 backdrop-blur-2xl border-b border-white/[0.03] fixed top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        {/* 🔥 Main Logo 🔥 */}
        <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter text-white hover:scale-105 transition-transform duration-300">
          Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">AI.</span>
        </Link>

        {/* 💻 Desktop Navigation Links (Premium Glassmorphism Pill) 💻 */}
        <div className="hidden md:flex items-center gap-8 px-8 py-2.5 rounded-full border border-white/10 bg-white/[0.02] shadow-[0_0_30px_rgba(255,255,255,0.02)] backdrop-blur-md">
          <Link 
            href="/optimizer" 
            className={`text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${pathname === '/optimizer' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-gray-400 hover:text-white'}`}
          >
            Optimizer
          </Link>
          <Link 
            href="/flashcards" 
            className={`text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${pathname === '/flashcards' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'text-gray-400 hover:text-white'}`}
          >
            Flashcards
          </Link>
          <Link 
            href="/analyzer" 
            className={`text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${pathname === '/analyzer' ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'text-gray-400 hover:text-white'}`}
          >
            Skill Gap
          </Link>
        </div>

        {/* 🚀 RIGHT SECTION: PRO Button + Auth Buttons 🚀 */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* 🌟 NEW PRO BUTTON (Spinning Gradient with Pinging Dot) 🌟 */}
          <Link href="/billing">
            <button className="relative group overflow-hidden rounded-full p-[1.5px] focus:outline-none active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-0.5">
              {/* Spinning Light Border */}
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              
              {/* Inner Dark Pill */}
              <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#050505] px-4 md:px-5 py-1.5 text-xs md:text-sm font-black text-white backdrop-blur-3xl transition-colors group-hover:bg-[#0a0a0f]">
                <span className="tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mr-2">PRO</span>
                
                {/* Pinging Dot */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500 shadow-[0_0_10px_#d946ef]"></span>
                </span>
              </span>
            </button>
          </Link>

          {/* 🔐 AUTH BUTTONS 🔐 */}
          {!userId ? (
            <>
              <SignInButton mode="modal">
                <button className="hidden md:block text-sm font-bold text-gray-400 hover:text-white transition-colors px-2 py-2">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="relative px-5 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold text-black bg-white rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-2 group">
                  Sign Up
                  <svg className="hidden md:block w-4 h-4 text-black group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </button>
              </SignUpButton>
            </>
          ) : (
            /* Logged in Avatar Ring Glow */
            <div className="p-[2px] rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 hover:from-cyan-500/60 hover:to-purple-500/60 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 md:w-9 md:h-9" } }} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
"use client";
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { userId } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`w-full fixed top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-[#020203]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        {/* 🔥 Main Logo 🔥 */}
        <Link href="/" className="group flex items-center gap-2.5 hover:scale-105 transition-transform duration-300">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center group-hover:border-cyan-500/30 transition-all duration-300">
            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">E</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white">
            Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">AI.</span>
          </span>
        </Link>

        {/* 💻 Desktop Navigation Links (Premium Glassmorphism Pill) 💻 */}
        <div className="hidden md:flex items-center gap-1 px-3 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm shadow-[0_0_30px_rgba(255,255,255,0.01)]">
          {[
            { href: "/optimizer", label: "Optimizer", color: "cyan" },
            { href: "/flashcards", label: "Flashcards", color: "purple" },
            { href: "/analyzer", label: "Skill Gap", color: "pink" },
          ].map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`relative px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 ${
                  isActive 
                    ? `text-${link.color}-400 drop-shadow-[0_0_8px_rgba(var(--tw-shadow-color),0.8)] bg-white/[0.05]` 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
                style={isActive ? { 
                  color: link.color === 'cyan' ? '#22d3ee' : link.color === 'purple' ? '#c084fc' : '#f472b6',
                  textShadow: `0 0 8px ${link.color === 'cyan' ? 'rgba(34,211,238,0.8)' : link.color === 'purple' ? 'rgba(192,132,252,0.8)' : 'rgba(244,114,182,0.8)'}`
                } : {}}
              >
                {link.label}
                {isActive && (
                  <span 
                    className="absolute -bottom-px left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ backgroundColor: link.color === 'cyan' ? '#22d3ee' : link.color === 'purple' ? '#c084fc' : '#f472b6' }}
                  />
                )}
              </Link>
            );
          })}
          
          <div className="w-px h-5 bg-white/[0.08] mx-1"></div>
          
          {userId && (
            <Link 
              href="/dashboard" 
              className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 ${
                pathname?.startsWith('/dashboard') 
                  ? 'text-cyan-400 bg-white/[0.05]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              Dashboard
            </Link>
          )}
          

        </div>

        {/* RIGHT SECTION: PRO Button + Auth Buttons */}
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* 🌟 NEW PRO BUTTON (Spinning Gradient with Pinging Dot) 🌟 */}
          <Link href="/billing">
            <button className="relative group overflow-hidden rounded-full p-[1.5px] focus:outline-none active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-0.5">
              {/* Spinning Light Border */}
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-60 group-hover:opacity-100 transition-opacity" />
              
              {/* Inner Dark Pill */}
              <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#050505] px-4 md:px-5 py-1.5 text-xs md:text-sm font-black text-white transition-colors group-hover:bg-[#0a0a0f]">
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
                <button className="hidden md:block text-sm font-bold text-gray-400 hover:text-white transition-all duration-300 px-3 py-2 rounded-lg hover:bg-white/[0.03]">
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
            <div className="p-[2px] rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 hover:from-cyan-500/50 hover:to-purple-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 md:w-9 md:h-9" } }} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
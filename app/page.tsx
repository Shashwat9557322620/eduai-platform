"use client";

import Link from "next/link";
import Navbar from "./components/Navbar";
import MagneticCursor from "./components/MagneticCursor";
import Footer from "./components/footer";
import Testimonials from "./components/Testimonials";
import OnboardingTour from "./components/OnboardingTour";
import UnifiedBackground from "./components/UnifiedBackground";
import GlitchText from "./components/GlitchText";
import { useParallax } from "./hooks/useParallax";
import { useEffect, useRef } from "react";

const CARDS = [
  {
    href: "/optimizer",
    accent: "#06b6d4",
    accentRgb: "6, 182, 212",
    tag: "Module 01",
    title: "Curriculum Engine",
    desc: "Automated synthesis of dense academic structures into executable daily protocols.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    href: "/flashcards",
    accent: "#a855f7",
    accentRgb: "168, 85, 247",
    tag: "Module 02",
    title: "Neural Flashcards",
    desc: "Instantaneous extraction and conversion of raw text into high-retention data modules.",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    href: "/analyzer",
    accent: "#ec4899",
    accentRgb: "236, 72, 153",
    tag: "Module 03",
    title: "Skill Diagnostic",
    desc: "Cross-referencing personal capabilities against global industry requirements.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

export default function Home() {
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  useParallax();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent, card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Spotlight position
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
      
      // 3D tilt physics (subtle, premium feel)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
      const rotateY = ((x - centerX) / centerX) * 6;
      
      card.style.setProperty("--rx", `${rotateX}deg`);
      card.style.setProperty("--ry", `${rotateY}deg`);
    };

    const handleMouseLeave = (card: HTMLElement) => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--mouse-x", "-999px");
      card.style.setProperty("--mouse-y", "-999px");
    };

    cardsRef.current.forEach((card) => {
      if (!card) return;
      const onMove = (e: MouseEvent) => handleMouseMove(e, card);
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", () => handleMouseLeave(card));
    });

    return () => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        // cleanup handled by closure, but safe to leave as is since component unmounts
      });
    };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-primary,#020203)] text-white font-sans relative overflow-hidden selection:bg-white/20">
        
        <UnifiedBackground />
        <MagneticCursor />
        <Navbar />
        <OnboardingTour />

      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto text-center relative z-10 flex flex-col items-center justify-center min-h-screen">
        
        {/* Hero typography with tighter tracking */}
        <h1 
          className="text-[clamp(2.5rem,6vw,5.5rem)] font-black tracking-tight leading-[1.05] mb-7 parallax-slow"
          style={{ animation: 'hero-weight 4s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate' }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-400 animate-gradient-x">
            EduAI.
          </span>
        </h1>

        <p className="text-white/40 text-lg md:text-xl max-w-xl mx-auto mb-20 font-light tracking-wide leading-relaxed">
          Advanced algorithmic deconstruction of your curriculum and career path.
        </p>

        {/* PREMIUM CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-6xl mx-auto text-left w-full perspective-[2000px]">
          {CARDS.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="group relative block h-[320px] rounded-3xl overflow-hidden cursor-pointer card-enter"
              style={{ 
                animationDelay: `${0.1 + i * 0.15}s`,
                "--card-accent": card.accent,
                "--card-accent-rgb": card.accentRgb,
              } as React.CSSProperties}
            >
              {/* Card base with glass and depth */}
              <div className="absolute inset-0 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out group-hover:border-white/[0.12] group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_30px_60px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(var(--card-accent-rgb),0.15)]" />
              
              {/* Ambient glow behind card (always visible but subtle) */}
              <div 
                className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10"
                style={{ background: `radial-gradient(circle at 50% 0%, ${card.accent}20, transparent 70%)` }}
              />

              {/* Mouse-tracking spotlight overlay */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                style={{
                  background: `radial-gradient(600px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(var(--card-accent-rgb), 0.08), transparent 40%)`
                }}
              />

              {/* 3D Tilt container */}
              <div 
                className="absolute inset-[1px] rounded-[22px] overflow-hidden z-10 transition-transform duration-100 ease-out will-change-transform"
                style={{
                  transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(20px)"
                }}
              >
                {/* Inner gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
                
                {/* Content */}
                <div className="relative h-full p-7 flex flex-col">
                  
                  {/* Icon with ambient glow */}
                  <div className="relative mb-5">
                    <div 
                      className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                      style={{ background: card.accent }}
                    />
                    <div className="relative w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-white/[0.15] group-hover:bg-white/[0.07] transition-all duration-300">
                      <svg width="20" height="20" fill="none" stroke={card.accent} strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                      </svg>
                    </div>
                  </div>

                  {/* Tag */}
                  <div 
                    className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2.5 opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                    style={{ color: card.accent }}
                  >
                    {card.tag}
                  </div>

                  {/* Title */}
                  <h3 className="text-[1.35rem] font-bold text-white/90 tracking-tight mb-3 group-hover:text-white transition-colors duration-300">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[0.85rem] text-white/30 leading-[1.7] flex-grow group-hover:text-white/45 transition-colors duration-300">
                    {card.desc}
                  </p>

                  {/* Footer / Deploy */}
                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-white/[0.06] group-hover:border-white/[0.1] transition-colors duration-300">
                    <span 
                      className="text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 group-hover:tracking-[0.25em]"
                      style={{ color: card.accent }}
                    >
                      Deploy
                    </span>
                    
                    <div className="relative w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center overflow-hidden group-hover:border-white/[0.15] group-hover:bg-white/[0.1] transition-all duration-300">
                      <svg 
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" 
                        fill="none" 
                        stroke={card.accent} 
                        strokeWidth="2.5" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Holographic sheen sweep on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12 pointer-events-none" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      </div>

      <Testimonials />

      <Footer />
    </>
  );
}
import pathlib

path = pathlib.Path("app/page.tsx")
path.unlink(missing_ok=True)

content = '''"use client";

import Link from "next/link";
import Navbar from "./components/Navbar";
import MouseTrail from "./components/MouseTrail";
import { useEffect, useRef } from "react";
import ScrollReveal from "./components/ScrollReveal";

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
    accent: "#f472b6",
    accentRgb: "244, 114, 182",
    tag: "Module 03",
    title: "Skill Gap Analyzer",
    desc: "Cross-reference your current capabilities against global industry benchmarks.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

export default function Home() {
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent, card: HTMLAnchorElement) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.setProperty("--rx", `${rotateX}deg`);
      card.style.setProperty("--ry", `${rotateY}deg`);
    };

    const handleMouseLeave = (card: HTMLAnchorElement) => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--mouse-x", "50%");
      card.style.setProperty("--mouse-y", "50%");
    };

    cardsRef.current.forEach((card) => {
      if (!card) return;
      const onMove = (e: MouseEvent) => handleMouseMove(e, card);
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", () => handleMouseLeave(card));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans relative overflow-hidden selection:bg-white/20">
      
      {/* Ultra-premium background atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/[0.03] blur-[120px] animate-breathe" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/[0.03] blur-[120px] animate-breathe delay-1000" />
        <div className="absolute top-[60%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-pink-500/[0.02] blur-[100px] animate-breathe delay-2000" />
      </div>

      <div className="hidden md:block"><MouseTrail /></div>
      <Navbar />

      <ScrollReveal direction="up" duration={800}>
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto text-center relative z-10 flex flex-col items-center justify-center min-h-screen">
        
        {/* Premium Pill Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.02] border border-white/[0.08] text-xs font-bold tracking-widest mb-8 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></span>
          </span>
          <span className="text-gray-300 uppercase">Next-Gen AI Study Arsenal</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8 max-w-5xl">
          <span className="text-white">Your Personal</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">
            AI Study Engine
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-medium">
          Advanced algorithmic deconstruction of your curriculum.
          <br />
          We transform raw syllabus into executable, high-retention daily protocols.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/billing"
            className="group relative px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Launch Your Arsenal
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          <Link
            href="/optimizer"
            className="px-8 py-4 rounded-xl font-bold border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300"
          >
            Explore Tools
          </Link>
        </div>
      </div>
      </ScrollReveal>

      {/* Premium Cards Grid */}
      <div className="px-6 max-w-7xl mx-auto pb-32 relative z-10">
        <ScrollReveal direction="up" delay={300} duration={800}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <Link
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              href={card.href}
              className="group relative bg-[#0a0a0c]/80 border border-white/[0.06] rounded-2xl p-8 transition-all duration-500 overflow-hidden"
              style={{
                transform: "perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
                transition: "transform 0.1s ease-out, border-color 0.4s, box-shadow 0.4s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.setProperty("--accent", card.accent);
                el.style.borderColor = `${card.accent}40`;
                el.style.boxShadow = `0 0 40px ${card.accent}15`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "rgba(255,255,255,0.06)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Spotlight effect */}
              <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `radial-gradient(250px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${card.accent}15, transparent 80%)`,
                }}
              />

              {/* Icon */}
              <div
                className="relative w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 transition-all duration-300"
                style={{
                  backgroundColor: `${card.accent}10`,
                  borderColor: `${card.accent}30`,
                }}
              >
                <svg
                  className="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: card.accent }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>

              {/* Tag */}
              <div
                className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest mb-4"
                style={{
                  backgroundColor: `${card.accent}10`,
                  color: card.accent,
                }}
              >
                {card.tag}
              </div>

              {/* Title */}
              <h3
                className="text-xl font-bold mb-3 transition-colors duration-300"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>

              {/* Hover arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                <svg className="w-5 h-5" style={{ color: card.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
        </ScrollReveal>
      </div>

      <style jsx global>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          33% { opacity: 0.5; transform: scale(1.05); }
          66% { opacity: 0.35; transform: scale(0.95); }
        }
        .delay-1000 { animation-delay: 1000ms; }
        .delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </div>
  );
}
'''

with open(path, 'w', newline='\n') as f:
    f.write(content)

print(f"Written {len(content)} bytes")

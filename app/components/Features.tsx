"use client";
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, useCallback, useState, useEffect } from 'react';

const FEATURES = [
  {
    title: "Curriculum Engine",
    desc: "Automated synthesis of dense academic structures into executable daily protocols.",
    accent: "#06b6d4",
    href: "/optimizer",
    tag: "Module 01",
    stats: "12K+",
    statsLabel: "Plans",
    icon: "⚡",
  },
  {
    title: "Neural Flashcards",
    desc: "Instantaneous extraction and conversion of raw text into high-retention data modules.",
    accent: "#a855f7",
    href: "/flashcards",
    tag: "Module 02",
    stats: "1.2M",
    statsLabel: "Cards",
    icon: "🧠",
  },
  {
    title: "Skill Diagnostic",
    desc: "Cross-referencing personal capabilities against global industry requirements.",
    accent: "#ec4899",
    href: "/analyzer",
    tag: "Module 03",
    stats: "8.5K",
    statsLabel: "Analyses",
    icon: "📊",
  },
  {
    title: "AI Tutor",
    desc: "Ask anything — get personalized, step-by-step explanations on any topic.",
    accent: "#10b981",
    href: "/tutor",
    tag: "Module 04",
    stats: "24/7",
    statsLabel: "Available",
    icon: "💬",
  }
];

function useCountUp(target: string, inView: boolean) {
  const [display, setDisplay] = useState(target);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!inView || hasRun.current) return;
    hasRun.current = true;

    // Extract number and suffix
    const match = target.match(/^([\d.]+)(.*)$/);
    if (!match) { setDisplay(target); return; }

    const numTarget = parseFloat(match[1]);
    const suffix = match[2];
    const duration = 1200;
    const steps = 30;
    const increment = numTarget / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(current + increment, numTarget);
      const formatted = numTarget >= 100
        ? Math.round(current).toLocaleString()
        : current % 1 === 0
        ? Math.round(current).toString()
        : current.toFixed(1);
      setDisplay(formatted + suffix);
      if (step >= steps) {
        clearInterval(interval);
        setDisplay(target);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [inView, target]);

  return display;
}

function CinematicCourseCard({ card, index }: { card: typeof FEATURES[0], index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: -999, my: -999 });
  const [isMobile, setIsMobile] = useState(false);
  const statDisplay = useCountUp(card.stats, inView);
  
  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTilt({
      mx: x,
      my: y,
      rx: ((y - centerY) / centerY) * -5,
      ry: ((x - centerX) / centerX) * 5
    });
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    setTilt({ rx: 0, ry: 0, mx: -999, my: -999 });
  }, [isMobile]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        ref={cardRef}
        href={card.href}
        data-cursor="card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative block h-[400px] rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/[0.06] transition-all duration-300 hover:scale-[1.02] hover:border-white/[0.12]"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${tilt.rx === 0 ? 0 : 10}px)`,
          boxShadow: tilt.rx === 0 ? "0 10px 30px rgba(0,0,0,0.5)" : "0 30px 60px rgba(0,0,0,0.7)",
          transformStyle: "preserve-3d",
          willChange: "transform",
          borderTopColor: `${card.accent}40`,
          borderTopWidth: "2px",
        }}
      >
        {/* Top border glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ boxShadow: `0 0 30px 2px ${card.accent}60, 0 0 60px 4px ${card.accent}30` }}
        />

        {/* Large background icon */}
        <div
          className="absolute top-6 right-6 text-6xl opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500 select-none pointer-events-none"
          style={{ filter: `drop-shadow(0 0 20px ${card.accent})` }}
        >
          {card.icon}
        </div>

        {/* Spotlight */}
        {!isMobile && (
          <div 
            className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(600px circle at ${tilt.mx}px ${tilt.my}px, ${card.accent}15, transparent 40%)`
            }}
          />
        )}

        {/* Shimmer sweep on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-12 z-20 pointer-events-none" />

        <div className="relative h-full p-8 flex flex-col z-10 transition-transform duration-300" style={{ transform: `translateZ(${isMobile ? 0 : 30}px)` }}>
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 opacity-70" style={{ color: card.accent }}>
            {card.tag}
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-4 group-hover:text-white transition-colors duration-300">
            {card.title}
          </h3>
          <p className="text-sm text-white/50 leading-relaxed flex-grow">
            {card.desc}
          </p>
          <div className="flex items-center justify-between border-t border-white/[0.08] pt-6 group-hover:border-white/[0.15] transition-colors">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black" style={{ color: card.accent, textShadow: `0 0 20px ${card.accent}50` }}>
                {statDisplay}
              </span>
              <span className="text-xs font-medium text-white/30 uppercase tracking-wider">{card.statsLabel}</span>
            </div>
            <span className="text-xs font-bold tracking-[0.1em] uppercase flex items-center gap-1 group-hover:gap-2 transition-all underline-sweep" style={{ color: card.accent }}>
              Explore
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32 relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400/80 mb-6 label-pop-in">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 live-pulse-dot" />
            Core Modules
          </div>
          <h2 className="text-fluid-section font-playfair font-black tracking-tight mb-6">
            The Arsenal.
          </h2>
          <p className="text-white/50 text-lg max-w-xl leading-relaxed">
            Every tool required to master the modern curriculum. Uncompromising quality. Unparalleled speed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 feature-card-stagger">
          {FEATURES.map((feature, i) => (
            <CinematicCourseCard key={feature.title} card={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
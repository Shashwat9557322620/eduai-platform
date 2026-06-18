"use client";

import Link from "next/link";
import Navbar from "./components/Navbar";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParallax } from "./hooks/useParallax";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  wordContainer,
  wordReveal,
  fadeInItem,
  staggerContainer,
  cardReveal,
  headingReveal,
} from "./lib/animation";

const MagneticCursor = dynamic(() => import("./components/MagneticCursor"), {
  ssr: false,
});
const Footer = dynamic(() => import("./components/footer"));
const Testimonials = dynamic(() => import("./components/Testimonials"));
const OnboardingTour = dynamic(() => import("./components/OnboardingTour"), {
  ssr: false,
});
// Replaced ThreeHeroBackground with a pure CSS cinematic background to ensure rendering
function CinematicCSSBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020203]">
      
      {/* MASSIVE GLOWING ORBS */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 blur-[150px] rounded-full mix-blend-screen"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* INSANE PERSPECTIVE GRID */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[70vh] opacity-40"
        style={{
          transform: 'perspective(1000px) rotateX(75deg) translateY(100px) scale(3)',
          transformOrigin: 'bottom center',
          background: 'linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)'
        }}
      />
      
      {/* FLOATING GEOMETRIC HUD ELEMENTS */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <motion.div 
          className="w-[800px] h-[800px] border-[1px] border-cyan-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] border-[1px] border-purple-500/20 rounded-full border-dashed"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

    </div>
  );
}
const GlitchText = dynamic(() => import("./components/GlitchText"));
const Features = dynamic(() => import("./components/Features"));
const UpcomingFeatures = dynamic(() => import("./components/UpcomingFeatures"));

// ─── Deterministic Particle Positions ────────────────────────────────────────
const PARTICLE_POSITIONS = [
  { left: 66.4, top: 9.7, duration: 6.7, delay: 2.4 },
  { left: 17.4, top: 19.5, duration: 8.3, delay: 1.7 },
  { left: 47.7, top: 59.7, duration: 7.2, delay: 0.3 },
  { left: 92.7, top: 33.3, duration: 7.4, delay: 0.3 },
  { left: 94.4, top: 44.4, duration: 7.8, delay: 2.5 },
  { left: 53.9, top: 14.5, duration: 9.3, delay: 3.4 },
  { left: 50.5, top: 12.8, duration: 7.4, delay: 1.5 },
  { left: 36.7, top: 53.4, duration: 7.4, delay: 0.7 },
  { left: 9.1, top: 84.9, duration: 8.7, delay: 0.7 },
  { left: 74.9, top: 99.9, duration: 7.4, delay: 1.0 },
  { left: 73.3, top: 45.7, duration: 6.2, delay: 3.7 },
  { left: 66.4, top: 56.0, duration: 9.4, delay: 4.3 },
  { left: 40.4, top: 48.6, duration: 8.5, delay: 0.9 },
  { left: 87.6, top: 77.4, duration: 9.3, delay: 3.5 },
  { left: 82.5, top: 71.9, duration: 6.7, delay: 0.5 },
  { left: 48.8, top: 25.9, duration: 9.5, delay: 2.0 },
  { left: 81.1, top: 40.6, duration: 7.0, delay: 1.0 },
  { left: 95.1, top: 0.6, duration: 6.0, delay: 0.1 },
  { left: 27.2, top: 61.4, duration: 6.3, delay: 1.4 },
  { left: 22.6, top: 36.4, duration: 9.1, delay: 4.8 },
];

// ─── Ambient Orbs Config ─────────────────────────────────────────────────────
const DESKTOP_ORBS = [
  {
    className: "ambient-orb-1",
    size: 600,
    x: "15%",
    y: "10%",
    color: "rgba(99,102,241,0.12)",
    blur: 120,
  },
  {
    className: "ambient-orb-2",
    size: 500,
    x: "75%",
    y: "5%",
    color: "rgba(168,85,247,0.10)",
    blur: 100,
  },
  {
    className: "ambient-orb-3",
    size: 450,
    x: "50%",
    y: "40%",
    color: "rgba(34,211,238,0.08)",
    blur: 90,
  },
  {
    className: "ambient-orb-4",
    size: 380,
    x: "85%",
    y: "50%",
    color: "rgba(236,72,153,0.07)",
    blur: 80,
  },
  {
    className: "ambient-orb-5",
    size: 350,
    x: "5%",
    y: "60%",
    color: "rgba(129,140,248,0.09)",
    blur: 90,
  },
  {
    className: "ambient-orb-6",
    size: 300,
    x: "40%",
    y: "70%",
    color: "rgba(168,85,247,0.08)",
    blur: 70,
  },
];

const MOBILE_ORBS = [
  {
    className: "ambient-orb-1",
    size: 300,
    x: "10%",
    y: "5%",
    color: "rgba(99,102,241,0.10)",
    blur: 80,
  },
  {
    className: "ambient-orb-2",
    size: 250,
    x: "70%",
    y: "15%",
    color: "rgba(168,85,247,0.08)",
    blur: 70,
  },
  {
    className: "ambient-orb-3",
    size: 200,
    x: "45%",
    y: "55%",
    color: "rgba(34,211,238,0.07)",
    blur: 60,
  },
];

// ─── Card Data ────────────────────────────────────────────────────────────────
const CARDS = [
  {
    href: "/optimizer",
    accent: "#06b6d4",
    accentRgb: "6, 182, 212",
    tag: "Module 01",
    title: "Curriculum Engine",
    desc: "Automated synthesis of dense academic structures into executable daily protocols.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    stats: "12K+ Plans",
    rating: "4.9",
  },
  {
    href: "/flashcards",
    accent: "#a855f7",
    accentRgb: "168, 85, 247",
    tag: "Module 02",
    title: "Neural Flashcards",
    desc: "Instantaneous extraction and conversion of raw text into high-retention data modules.",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    stats: "1.2M Cards",
    rating: "4.8",
  },
  {
    href: "/analyzer",
    accent: "#ec4899",
    accentRgb: "236, 72, 153",
    tag: "Module 03",
    title: "Skill Diagnostic",
    desc: "Cross-referencing personal capabilities against global industry requirements.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    stats: "8.5K Analyses",
    rating: "4.9",
  },
  {
    href: "/tutor",
    accent: "#10b981",
    accentRgb: "16, 185, 129",
    tag: "Module 04",
    title: "AI Tutor",
    desc: "Ask anything — get personalized, step-by-step explanations on any topic.",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    stats: "24/7 Available",
    rating: "5.0",
  },
  {
    href: "/groups",
    accent: "#f59e0b",
    accentRgb: "245, 158, 11",
    tag: "Module 05",
    title: "Study Groups",
    desc: "Collaborate with classmates in real-time chat and shared notes.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    stats: "Collaborative",
    rating: "4.7",
  },
];

// ─── Stats Data ───────────────────────────────────────────────────────────────
const STATS = [
  {
    value: 50000,
    label: "Active Students",
    display: "50K+",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    value: 1200000,
    label: "Cards Generated",
    display: "1.2M",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    value: 99.9,
    label: "Uptime",
    display: "99.9%",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    value: 4.9,
    label: "User Rating",
    display: "4.9★",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
];

// ─── Ambient Orbs Component ───────────────────────────────────────────────────
function AmbientOrbs() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const orbs = isMobile ? MOBILE_ORBS : DESKTOP_ORBS;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={orb.className}
          style={{
            position: "absolute",
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated Hero Headline ───────────────────────────────────────────────────
function AnimatedHeadline({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  if (shouldReduceMotion) {
    return (
      <h1 className="text-7xl md:text-[10rem] font-playfair font-black tracking-tight leading-[0.9] mb-8 text-white text-center w-full uppercase">
        EduAI.
      </h1>
    );
  }

  return (
    <motion.div 
      className="relative group cursor-default mb-8 w-full flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="text-[clamp(5rem,18vw,16rem)] font-playfair font-black tracking-tighter leading-[0.8] text-center uppercase relative">
        <span className="text-edge-outline block">EDUAI.</span>
        <span className="text-edge-outline-filled block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">EDUAI.</span>
      </h1>
    </motion.div>
  );
}

// ─── Count-up Hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!shouldStart || hasRun.current) return;
    hasRun.current = true;

    const startTime = performance.now();
    // Easing: decelerate at end
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(easeOut(progress) * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };

    requestAnimationFrame(tick);
  }, [shouldStart, target, duration]);

  return count;
}

// ─── Stat Item ────────────────────────────────────────────────────────────────
function StatItem({
  stat,
  index,
  shouldReduceMotion,
}: {
  stat: (typeof STATS)[0];
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCountUp(stat.value, 2000, inView && !shouldReduceMotion);

  const formatDisplay = (val: number) => {
    if (stat.label === "Active Students") {
      return val >= 1000 ? `${Math.round(val / 1000)}K+` : `${val}`;
    }
    if (stat.label === "Cards Generated") {
      return val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val}`;
    }
    if (stat.label === "Uptime") return `${val.toFixed(1)}%`;
    if (stat.label === "User Rating") return `${val.toFixed(1)}★`;
    return `${val}`;
  };

  return (
    <motion.div
      ref={ref}
      className="text-center group cursor-default"
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-center mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5 transition-all duration-300">
          <svg
            className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
          </svg>
        </div>
      </div>
      <div
        className="text-2xl md:text-3xl font-black text-white/90 mb-1 tabular-nums"
        aria-label={`${stat.display} ${stat.label}`}
      >
        {shouldReduceMotion ? stat.display : formatDisplay(count)}
      </div>
      <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
        {stat.label}
      </div>
    </motion.div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({
  card,
  index,
}: {
  card: (typeof CARDS)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const cardLinkRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = cardLinkRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    el.style.setProperty("--rx", `${((y - centerY) / centerY) * -8}deg`);
    el.style.setProperty("--ry", `${((x - centerX) / centerX) * 8}deg`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardLinkRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mouse-x", "-999px");
    el.style.setProperty("--mouse-y", "-999px");
  }, []);

  return (
    <div ref={ref}>
      <motion.div
        variants={cardReveal}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        custom={index}
        transition={{ delay: index * 0.1 }}
      >
        <Link
          href={card.href}
          ref={cardLinkRef}
          className="group relative block h-[360px] rounded-[2rem] overflow-hidden cursor-pointer"
          style={
            {
              "--card-accent": card.accent,
              "--card-accent-rgb": card.accentRgb,
            } as React.CSSProperties
          }
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Card base */}
          <div className="absolute inset-0 rounded-[2rem] bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out group-hover:border-white/[0.12] group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_30px_60px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(var(--card-accent-rgb),0.15)]" />

          {/* Indigo glow on hover */}
          <div
            className="absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${card.accent}25, transparent 70%)`,
            }}
          />

          {/* Mouse-tracking spotlight */}
          <div
            className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
            style={{
              background: `radial-gradient(600px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(var(--card-accent-rgb), 0.1), transparent 40%)`,
            }}
          />

          {/* 3D Tilt container */}
          <div
            className="absolute inset-[1px] rounded-[26px] overflow-hidden z-10 transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform:
                "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(20px)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />

            {/* Content */}
            <div className="relative h-full p-8 flex flex-col">
              {/* Icon */}
              <div className="relative mb-6">
                <div
                  className="absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                  style={{ background: card.accent }}
                />
                <div className="relative w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-white/[0.15] group-hover:bg-white/[0.07] transition-all duration-300">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke={card.accent}
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                  </svg>
                </div>
              </div>

              {/* Tag */}
              <div
                className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3 opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                style={{ color: card.accent }}
              >
                {card.tag}
              </div>

              {/* Title */}
              <h3 className="text-[1.4rem] font-bold text-white/90 tracking-tight mb-3 group-hover:text-white transition-colors duration-300">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-[0.85rem] text-white/30 leading-[1.7] flex-grow group-hover:text-white/45 transition-colors duration-300">
                {card.desc}
              </p>

              {/* Stats Row */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-semibold text-white/40 group-hover:text-white/60 transition-colors">
                  {card.stats}
                </span>
                <span className="text-xs font-semibold" style={{ color: card.accent }}>
                  {card.rating}★
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/[0.06] group-hover:border-white/[0.1] transition-colors duration-300 pt-5">
                <span
                  className="text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 group-hover:tracking-[0.25em]"
                  style={{ color: card.accent }}
                >
                  Launch
                </span>
                <div className="relative w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center overflow-hidden group-hover:border-white/[0.15] group-hover:bg-white/[0.1] transition-all duration-300">
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
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

            {/* Holographic sheen sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-12 pointer-events-none" />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  useParallax();

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-primary,#020203)] text-white font-sans relative overflow-hidden selection:bg-white/20">
        {/* Background */}
        <CinematicCSSBackground />
        <MagneticCursor />
        <Navbar />
        <OnboardingTour />

        {/* Premium Floating Particles */}
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
          {PARTICLE_POSITIONS.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-400/30"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `float ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>

        {/* ── Hero Section ─────────────────────────────────────────── */}
        <div className="pt-36 pb-24 px-6 max-w-7xl mx-auto text-center relative z-10 flex flex-col items-center justify-center min-h-screen">
          {/* Premium Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm mb-8"
            variants={shouldReduceMotion ? fadeInItem : undefined}
            initial={shouldReduceMotion ? "hidden" : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? "visible" : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-xs font-semibold text-gray-300 tracking-wider uppercase">
              Next-Gen AI Study Platform
            </span>
            <svg
              className="w-4 h-4 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </motion.div>

          {/* Animated Hero Headline */}
          <AnimatedHeadline shouldReduceMotion={shouldReduceMotion} />

          {/* Subheading */}
          <motion.p
            className="text-white/60 text-xl md:text-3xl max-w-3xl mx-auto mb-6 font-playfair italic tracking-wide leading-relaxed"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Advanced algorithmic deconstruction of your curriculum.
          </motion.p>

          <motion.p
            className="text-white/30 text-base md:text-lg max-w-2xl mx-auto mb-16 font-light leading-relaxed"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Transform raw syllabus into executable study protocols. Master any subject
            with AI-powered flashcards and skill diagnostics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 mb-20"
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Link href="/optimizer">
              <button
                suppressHydrationWarning
                className="group relative px-8 py-4 rounded-2xl font-bold text-black bg-white hover:bg-gray-100 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 btn-shimmer-hover min-h-[44px]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Learning Free
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </span>
              </button>
            </Link>
            <Link href="/about">
              <button
                suppressHydrationWarning
                className="group px-8 py-4 rounded-2xl font-bold text-gray-300 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 hover:scale-105 active:scale-95 btn-slide-fill min-h-[44px]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  See How It Works
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </button>
            </Link>
          </motion.div>

          {/* Cards Grid — Phase 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-left w-full perspective-[2000px]">
            {CARDS.map((card, i) => (
              <CourseCard key={card.href} card={card} index={i} />
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {STATS.map((stat, i) => (
              <StatItem
                key={stat.label}
                stat={stat}
                index={i}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </div>
        </div>
      </div>

      <Features />
      <UpcomingFeatures />
      <Testimonials />
      <Footer />
    </>
  );
}

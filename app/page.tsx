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

import { Hero } from "./components/landing/Hero";


const Footer = dynamic(() => import("./components/footer"));
const Testimonials = dynamic(() => import("./components/Testimonials"));
const OnboardingTour = dynamic(() => import("./components/OnboardingTour"), {
  ssr: false,
});

// Replaced ThreeHeroBackground with a pure CSS cinematic background to ensure rendering
function CinematicCSSBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020203]">
      
      {/* STATIC GLOWING ORBS (Optimized for performance) */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen opacity-50"
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen opacity-40"
      />
      
      {/* STATIC PERSPECTIVE GRID */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[70vh] opacity-30"
        style={{
          transform: 'perspective(1000px) rotateX(75deg) translateY(100px) scale(3) translateZ(0)',
          transformOrigin: 'bottom center',
          background: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)'
        }}
      />
    </div>
  );
}
const GlitchText = dynamic(() => import("./components/GlitchText"));
const Features = dynamic(() => import("./components/Features"));
const UpcomingFeatures = dynamic(() => import("./components/UpcomingFeatures"));
const HowItWorks = dynamic(() => import("./components/HowItWorks"));

// ─── Deterministic Particle Positions ───────────────────────────────────────────────────────────
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

// ─── Ambient Orbs Config ───────────────────────────────────────────────────────────
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



// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  useParallax();

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans selection:bg-white/20">
      {/* Film grain noise overlay — sits above everything but is pointer-events-none */}
      <div className="page-noise-overlay" aria-hidden="true" />

      {/* Fixed ambient background */}
      <CinematicCSSBackground />

      {/* Fixed nav */}
      <Navbar />
      <OnboardingTour />

      {/* Premium Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
        {PARTICLE_POSITIONS.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-400/30"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {/* Page Content */}
      <main className="relative z-10">
        <Hero />

        {/* Section Divider */}
        <div className="section-divider-premium max-w-7xl mx-auto" aria-hidden="true" />

        <HowItWorks />

        {/* Section Divider */}
        <div className="section-divider-premium max-w-7xl mx-auto" aria-hidden="true" />

        <Features />

        {/* Section Divider */}
        <div className="section-divider-premium max-w-7xl mx-auto" aria-hidden="true" />

        <UpcomingFeatures />

        {/* Section Divider */}
        <div className="section-divider-premium max-w-7xl mx-auto" aria-hidden="true" />

        <Testimonials />

        {/* Section Divider */}
        <div className="section-divider-premium" aria-hidden="true" />

        <Footer />
      </main>
    </div>
  );
}

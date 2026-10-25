"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles } from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useReducedMotionSafe } from "../../hooks/useReducedMotionSafe";
import { MagneticButton } from "../ui/MagneticButton";

// Lazy load Three.js to keep initial bundle small
const HeroSphere = dynamic(() => import("../three/HeroSphere"), { ssr: false });
import { Canvas } from "@react-three/fiber";

const TAGLINES = [
  "Diagnose your skill gaps before they cost you.",
  "Compress your syllabus into daily protocols.",
  "Generate flashcards in 4 seconds.",
];

export function Hero() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotionSafe();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax planes
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const ySphere = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const yTypography = useTransform(scrollYProgress, [0, 1], ["0%", "85%"]);
  const yForeground = useTransform(scrollYProgress, [0, 1], ["0%", "110%"]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const wordmark = "EDUAI.";
  const show3D = mounted && !isMobile && !prefersReducedMotion && window.matchMedia("(min-width: 1024px)").matches;

  return (
    <section ref={containerRef} className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden pt-24 md:pt-32 pb-safe px-4 md:px-8">
      
      {/* z-0: Ambient background */}
      <div className="absolute inset-0 z-0">
        {!show3D && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.15),transparent_50%)] blur-[100px] animate-pulse-glow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_50%)] blur-[100px]" />
          </div>
        )}
      </div>

      {/* z-10: Blurred abstract shapes (parallax yBg) */}
      <motion.div style={{ y: isMobile ? 0 : yBg }} className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full mix-blend-screen" />
      </motion.div>

      {/* z-20: 3D sphere / visual content (parallax ySphere) */}
      {show3D && (
        <motion.div style={{ y: ySphere }} className="absolute inset-0 z-20 pointer-events-none opacity-60">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <HeroSphere />
          </Canvas>
        </motion.div>
      )}

      {/* z-30: Massive typography (parallax yTypography) */}
      <motion.div style={{ y: isMobile ? 0 : yTypography }} className="relative z-30 w-full max-w-7xl mx-auto flex flex-col items-center mt-12 md:mt-0 pointer-events-none">
        {/* Animated Wordmark */}
        <h1 className="text-fluid-hero font-playfair font-black tracking-tighter uppercase leading-none flex overflow-hidden mb-6">
          {wordmark.split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.06,
              }}
            >
              <span 
                className="animate-hero-fill"
                style={{ animationDelay: `${index * 0.4}s` }}
              >
                {char}
              </span>
            </motion.span>
          ))}
        </h1>

        {/* Typewriter Tagline */}
        <div className="h-16 md:h-12 flex items-center justify-center mb-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={taglineIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-lg md:text-2xl font-light text-white/70 text-center max-w-2xl px-4"
            >
              {TAGLINES[taglineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* z-40: Foreground glass UI (parallax yForeground) */}
      <motion.div style={{ y: isMobile ? 0 : yForeground }} className="relative z-40 w-full max-w-7xl mx-auto flex flex-col items-center pointer-events-auto">
        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4"
        >
          <MagneticButton variant="primary" className="w-full sm:w-auto h-14 flex items-center justify-center gap-2 group cta-shimmer">
            <Sparkles className="w-4 h-4" />
            <span>Start Learning Free</span>
          </MagneticButton>
          
          <MagneticButton variant="glass" className="w-full sm:w-auto h-14 flex items-center justify-center gap-2 group">
            <span>Analyze My Skills</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </MagneticButton>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-20 w-full max-w-4xl"
        >
          {isMobile ? (
            /* Mobile Horizontal Snap Scroll */
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 gap-4">
              {[
                { v: "2M+", l: "Sessions", i: "🧠" },
                { v: "94%", l: "Pass Rate", i: "🎯" },
                { v: "50+", l: "Subjects", i: "📚" },
                { v: "4.9★", l: "Rating", i: "⭐" },
              ].map((stat, i) => (
                <div key={i} className="snap-center flex-none w-[140px] bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center">
                  <span className="text-xl mb-1">{stat.i}</span>
                  <span className="text-2xl font-mono font-bold text-white">{stat.v}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">{stat.l}</span>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop Grid */
            <div className="grid grid-cols-4 gap-4 bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
              {[
                { v: "2M+", l: "Study Sessions", i: "🧠" },
                { v: "94%", l: "Pass Rate Boost", i: "🎯" },
                { v: "50+", l: "Subjects Covered", i: "📚" },
                { v: "4.9★", l: "Student Rating", i: "⭐" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center group relative">
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{stat.i}</span>
                  <span className="text-3xl font-mono font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors duration-300">{stat.v}</span>
                  <span className="text-xs uppercase tracking-widest text-white/40">{stat.l}</span>
                  {/* Hover separator */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

    </section>
  );
}

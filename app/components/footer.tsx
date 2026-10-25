"use client";

import Link from "next/link";
import AmbientBackground from './AmbientBackground';
import { 
  motion, 
  useInView, 
  useMotionValue, 
  AnimatePresence,
  type Variants
} from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { 
  Zap, 
  BrainCircuit, 
  BarChart3, 
  ArrowUpRight,
  MapPin,
  Mail,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Shield,
  FileText,
  RefreshCcw,
  ChevronRight,
  ExternalLink,
  Users,
  Briefcase,
  type LucideIcon
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════
interface SocialIconProps {
  href: string;
  label: string;
  children: React.ReactNode;
  color: "cyan" | "purple" | "blue";
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  icon: LucideIcon;
  color?: "cyan" | "purple";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CUSTOM SOCIAL SVG ICONS (No brand icon dependency issues)
// ═══════════════════════════════════════════════════════════════════════
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#22d3ee", "#818cf8", "#34d399", "#a78bfa"];
    const particleCount = 150;

    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Constant movement
        p.x += p.vx;
        p.y += p.vy;

        // Mouse interaction (push away)
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          const force = (100 - dist) / 100;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }

        // Screen wrap
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - cdist / 80) * 0.12;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ opacity: 0.5 }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DARK MODE TOGGLE
// ═══════════════════════════════════════════════════════════════════════
function DarkModeToggle() {
  const [isDark, setIsDark] = useState(true);
  const toggle = () => setIsDark(!isDark);

  return (
    <motion.button
      suppressHydrationWarning
      onClick={toggle}
      className="relative flex items-center justify-center w-12 h-12 rounded-2xl border overflow-hidden group"
      style={{ 
        backgroundColor: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.08)"
      }}
      whileHover={{ scale: 1.08, borderColor: "rgba(255,255,255,0.2)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Moon className="w-5 h-5 text-cyan-400" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Sun className="w-5 h-5 text-amber-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TEXT SCRAMBLE
// ═══════════════════════════════════════════════════════════════════════
function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  const scramble = useCallback(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) return text[index];
            if (char === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 0.5;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span 
      className={className} 
      onMouseEnter={scramble}
      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
    >
      {display}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════
// SOCIAL ICON (Using custom SVGs instead of lucide brand icons)
// ═══════════════════════════════════════════════════════════════════════
function SocialIcon({ href, label, children, color }: SocialIconProps) {
  const colorMap: Record<string, string> = {
    cyan: "#22d3ee",
    purple: "#a78bfa", 
    blue: "#60a5fa",
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative group flex items-center justify-center w-11 h-11 rounded-xl overflow-hidden"
      style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      whileHover={{ 
        scale: 1.12, 
        y: -3,
        borderColor: `${colorMap[color]}40`,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.25, type: "spring", stiffness: 400 }}
      title={label}
    >
      <div className="w-[18px] h-[18px] text-gray-500 group-hover:text-gray-300 transition-colors duration-300 relative z-10">
        {children}
      </div>

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: `${colorMap[color]}15` }}
      />

      <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.a>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FOOTER LINK
// ═══════════════════════════════════════════════════════════════════════
function FooterLink({ href, children, icon: Icon, color = "cyan" }: FooterLinkProps) {
  const bgColor = color === "cyan" ? "rgba(34,211,238,0.05)" : "rgba(167,139,250,0.05)";
  const borderColor = color === "cyan" ? "rgba(34,211,238,0.1)" : "rgba(167,139,250,0.1)";
  const iconColor = color === "cyan" ? "rgba(34,211,238,0.7)" : "rgba(167,139,250,0.7)";
  const underlineFrom = color === "cyan" ? "#22d3ee" : "#a78bfa";
  const underlineTo = color === "cyan" ? "#0891b2" : "#7c3aed";

  return (
    <motion.li variants={itemVariants}>
      <Link href={href} className="group block">
        <motion.div
          className="flex items-center gap-3 text-gray-500 hover:text-white text-sm font-medium transition-colors duration-300 py-1.5 -mx-2 px-2 rounded-lg hover:bg-white/[0.03]"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <span 
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            <Icon 
              className="w-3.5 h-3.5 transition-colors duration-300" 
              style={{ color: iconColor }}
            />
          </span>
          <span className="relative">
            {children}
            <span 
              className="absolute -bottom-px left-0 w-0 h-px group-hover:w-full transition-all duration-400 ease-out"
              style={{
                background: `linear-gradient(to right, ${underlineFrom}, ${underlineTo})`,
              }}
            />
          </span>
          <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gray-600 ml-auto" />
        </motion.div>
      </Link>
    </motion.li>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION TITLE
// ═══════════════════════════════════════════════════════════════════════
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-7">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
        <div className="w-6 h-px bg-gradient-to-r from-cyan-500/60 to-transparent" />
      </div>
      <h3 className="text-white/80 font-bold uppercase tracking-[0.25em] text-[10px]">
        {children}
      </h3>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAGNETIC BUTTON
// ═══════════════════════════════════════════════════════════════════════
function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TILT CARD (Fixed - accepts style prop properly)
// ═══════════════════════════════════════════════════════════════════════
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  cardStyle?: React.CSSProperties;
}

function TiltCard({ children, className, cardStyle }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setRotateX((y - 0.5) * -10);
    setRotateY((x - 0.5) * 10);
    setGlowX(x * 100);
    setGlowY(y * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowX(50);
    setGlowY(50);
  };

  const dynamicBg = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(34,211,238,0.06) 0%, transparent 60%)`;

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        background: `${dynamicBg}, rgba(255,255,255,0.02)`,
        ...cardStyle,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN FOOTER
// ═══════════════════════════════════════════════════════════════════════
export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [hoveredLegal, setHoveredLegal] = useState<string | null>(null);

  return (
    <footer className="relative bg-[#020203] border-t border-white/[0.03] pt-28 pb-14 overflow-hidden">

      {/* Background Effects */}
      <AmbientBackground />
      <ParticleField />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "80px 80px"
        }}
      />

      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-40"
          animate={{ opacity: [0.2, 0.6, 0.2], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        ref={ref}
        className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >

        {/* Header Row with Dark Mode Toggle */}
        <motion.div 
          className="flex items-center justify-between mb-16"
          variants={itemVariants}
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em]">Footer Navigation</span>
          </div>
          <MagneticButton>
            <DarkModeToggle />
          </MagneticButton>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-14 lg:gap-10">

          {/* Column 1: Brand */}
          <motion.div className="lg:col-span-4 flex flex-col space-y-8" variants={itemVariants}>
            <MagneticButton className="inline-block w-fit">
              <Link href="/" className="inline-block group">
                <motion.div 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-4xl font-black tracking-tighter text-white">
                    Edu
                  </h2>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-indigo-400 font-black text-4xl tracking-tighter">
                    AI.
                  </span>
                  <motion.div
                    className="w-2 h-2 rounded-full bg-cyan-400 ml-1"
                    animate={{ 
                      boxShadow: [
                        "0 0 0px rgba(34,211,238,0)",
                        "0 0 16px rgba(34,211,238,0.7)",
                        "0 0 0px rgba(34,211,238,0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </Link>
            </MagneticButton>

            <p className="text-gray-500/80 text-sm leading-relaxed max-w-sm">
              Advanced algorithmic deconstruction of your curriculum. We transform raw syllabus into executable, high-retention daily protocols.
            </p>

            {/* Status Badge */}
            <motion.div 
              className="flex items-center gap-3 w-fit px-5 py-2.5 rounded-full animate-shimmer-overlay"
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
              whileHover={{ 
                borderColor: "rgba(16,185,129,0.2)",
                backgroundColor: "rgba(16,185,129,0.03)",
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <motion.span 
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <span 
                  className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"
                  style={{ boxShadow: "0 0 10px rgba(16,185,129,0.6)" }}
                />
              </span>
              <ScrambleText 
                text="Systems Operational" 
                className="text-[11px] font-mono text-gray-400 uppercase tracking-[0.15em]"
              />
            </motion.div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 pt-2">
              {[
                { value: "50K+", label: "Students" },
                { value: "1.2M", label: "Flashcards" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <div className="text-lg font-bold text-white/90">{stat.value}</div>
                  <div className="text-[10px] text-gray-600 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Platform */}
          <div className="lg:col-span-2">
            <SectionTitle>Platform</SectionTitle>
            <ul className="space-y-1">
              <FooterLink href="/optimizer" icon={Zap} color="cyan">
                Curriculum Optimizer
              </FooterLink>
              <FooterLink href="/flashcards" icon={BrainCircuit} color="cyan">
                Neural Flashcards
              </FooterLink>
              <FooterLink href="/analyzer" icon={BarChart3} color="cyan">
                Skill Gap Analyzer
              </FooterLink>
              <FooterLink href="/institutes" icon={Users} color="cyan">
                Group Pricing
              </FooterLink>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="lg:col-span-2">
            <SectionTitle>Company</SectionTitle>
            <ul className="space-y-1">
              <FooterLink href="/about" icon={Globe} color="purple">
                About Us
              </FooterLink>
              <FooterLink href="/faq" icon={ExternalLink} color="purple">
                FAQ
              </FooterLink>
              <FooterLink href="/privacy-policy" icon={Shield} color="purple">
                Privacy
              </FooterLink>
              <FooterLink href="/blog" icon={FileText} color="purple">
                Blog
              </FooterLink>
              <FooterLink href="/affiliate" icon={Briefcase} color="purple">
                Affiliate Program
              </FooterLink>
            </ul>
          </div>

          {/* Column 4: Legal & HQ */}
          <div className="lg:col-span-4">
            <SectionTitle>Legal & Operations</SectionTitle>
            <div className="grid grid-cols-2 gap-5">
              {/* Legal Links */}
              <motion.ul className="space-y-1" variants={containerVariants}>
                {[
                  { href: "/privacy-policy", label: "Privacy Policy", icon: Shield },
                  { href: "/terms-of-service", label: "Terms of Service", icon: FileText },
                  { href: "/refund-policy", label: "Refund Policy", icon: RefreshCcw },
                ].map((link) => (
                  <motion.li key={link.href} variants={itemVariants}>
                    <Link 
                      href={link.href} 
                      className="group flex items-center gap-2.5 text-gray-500 hover:text-white text-sm transition-all duration-300 py-1.5 -mx-2 px-2 rounded-lg hover:bg-white/[0.03]"
                      onMouseEnter={() => setHoveredLegal(link.href)}
                      onMouseLeave={() => setHoveredLegal(null)}
                    >
                      <link.icon 
                        className="w-3.5 h-3.5 transition-colors duration-300" 
                        style={{ color: hoveredLegal === link.href ? "#22d3ee" : "#374151" }}
                      />
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-px left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-cyan-600 group-hover:w-full transition-all duration-400 ease-out" />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              {/* HQ Card with Tilt */}
              <TiltCard 
                className="p-5 rounded-2xl transition-all duration-500 hover:border-white/[0.12]"
                cardStyle={{
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                  <h4 className="text-[10px] text-cyan-400/80 font-mono uppercase tracking-[0.2em]">EduAI HQ</h4>
                </div>
                <p className="text-xs text-gray-500/80 leading-relaxed">
                  Teachers Colony, Shanti Nagar<br />
                  Mathura, UP, India<br />
                </p>
                <motion.a 
                  href="mailto:support@eduai.com" 
                  className="text-xs text-gray-400 hover:text-cyan-400 transition-colors mt-4 inline-flex items-center gap-2 group/mail px-3 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: "rgba(34,211,238,0.2)",
                  }}
                >
                  <Mail className="w-3 h-3" />
                  <span className="relative">
                    support@eduai.com
                    <span className="absolute -bottom-px left-0 w-0 h-px bg-cyan-400 group-hover/mail:w-full transition-all duration-300" />
                  </span>
                </motion.a>
              </TiltCard>
            </div>
          </div>

        </div>

        {/* CTA Strip */}
        <motion.div 
          className="mt-20 mb-16 p-8 rounded-3xl relative overflow-hidden"
          style={{
            background: "linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
          variants={itemVariants}
        >
          <div 
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ backgroundColor: "rgba(34,211,238,0.04)" }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-bold text-lg mb-1">Ready to transform your learning?</h4>
              <p className="text-gray-500 text-sm">Join 50,000+ students already using EduAI.</p>
            </div>
            <Link href="/billing">
              <motion.button
                suppressHydrationWarning
                className="px-8 py-3 rounded-xl text-cyan-300 text-sm font-semibold relative overflow-hidden group"
                style={{
                  background: "linear-gradient(to right, rgba(34,211,238,0.2), rgba(99,102,241,0.2))",
                  border: "1px solid rgba(34,211,238,0.3)",
                }}
                whileHover={{ scale: 1.05, borderColor: "rgba(34,211,238,0.5)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, rgba(34,211,238,0.1), rgba(99,102,241,0.1))" }}
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="pt-8 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center"
              style={{
                background: "linear-gradient(to bottom right, rgba(34,211,238,0.2), rgba(99,102,241,0.2))",
              }}
              whileHover={{ rotate: 10, scale: 1.1 }}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </motion.div>
            <div className="flex items-center gap-3">
              <p className="text-gray-600 text-xs font-mono">
                © {new Date().getFullYear()} EduAI
              </p>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span className="text-[10px] text-gray-700 font-mono">Built by Shashwat Mishra</span>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span className="text-[10px] text-gray-700 font-mono uppercase tracking-wider">All rights reserved</span>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <SocialIcon href="#" label="Twitter" color="cyan">
              <TwitterIcon className="w-full h-full" />
            </SocialIcon>
            <SocialIcon href="#" label="GitHub" color="purple">
              <GithubIcon className="w-full h-full" />
            </SocialIcon>
            <SocialIcon href="#" label="LinkedIn" color="blue">
              <LinkedinIcon className="w-full h-full" />
            </SocialIcon>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}

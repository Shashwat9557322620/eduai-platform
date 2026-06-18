"use client";
import { useState, useEffect, useRef } from "react";

const BOOT_PHASES = [
  { label: "INITIALIZING QUANTUM CORE", icon: "◆" },
  { label: "LOADING NEURAL SUBSTRATE", icon: "▲" },
  { label: "SYNCING ORBITAL MEMORY", icon: "●" },
  { label: "CALIBRATING AI MATRICES", icon: "⬡" },
  { label: "DEPLOYING ENERGY FIELDS", icon: "✦" },
  { label: "SYSTEM OPERATIONAL", icon: "✓" },
];
const GLITCH_CHARS = "!@#$%^&*01";

export default function HolographicLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [glitchText, setGlitchText] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const particlesRef = useRef<{
    x: number; y: number; vx: number; vy: number;
    size: number; opacity: number; color: string;
    targetX: number; targetY: number;
  }[]>([]);

  // Fast progress: completes in ~1.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2.5 + Math.random() * 3;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onCompleteRef.current(), 400);
          }, 200);
          return 100;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    progressRef.current = progress;
    const phaseIndex = Math.min(
      Math.floor(progress / (100 / BOOT_PHASES.length)),
      BOOT_PHASES.length - 1
    );
    setPhase(phaseIndex);
  }, [progress]);

  useEffect(() => {
    const interval = setInterval(() => {
      const len = 8 + Math.floor(Math.random() * 16);
      let text = "";
      for (let i = 0; i < len; i++) {
        text += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
      setGlitchText(text);
      setTimeout(() => setGlitchText(""), 50);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#22d3ee", "#a855f7", "#34d399", "#f472b6", "#fbbf24"];
    const cx = w / 2;
    const cy = h / 2;
    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0, vy: 0,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      targetX: cx + (Math.random() - 0.5) * 100,
      targetY: cy + (Math.random() - 0.5) * 100,
    }));
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const t = Date.now() * 0.001;
      const convergence = Math.min(progressRef.current / 100, 1);
      for (const p of particlesRef.current) {
        const tx = p.x + (p.targetX - p.x) * convergence * 0.02;
        const ty = p.y + (p.targetY - p.y) * convergence * 0.02;
        p.vx += (tx - p.x) * 0.001;
        p.vy += (ty - p.y) * 0.001;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx + Math.sin(t + p.x * 0.01) * 0.3;
        p.y += p.vy + Math.cos(t + p.y * 0.01) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * (1 - convergence * 0.5);
        ctx.fill();
      }
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x; const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.globalAlpha = (1 - dist / 100) * 0.1;
            ctx.strokeStyle = "#22d3ee";
            ctx.lineWidth = 0.3;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      const glowRadius = 40 + convergence * 60;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      glow.addColorStop(0, "rgba(34, 211, 238, " + (0.15 + convergence * 0.2) + ")");
      glow.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.fillRect(cx - glowRadius, cy - glowRadius, glowRadius * 2, glowRadius * 2);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "#020203", opacity: fadeOut ? 0 : 1, transition: "opacity 0.4s ease-out" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.6 }} />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative w-28 h-28">
          <svg width="112" height="112" className="rotate-[-90deg]">
            <circle cx="56" cy="56" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
            <circle
              cx="56" cy="56" r="42"
              stroke="url(#loaderGrad)"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.05s ease-out" }}
            />
            <defs>
              <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-white font-mono" style={{ textShadow: "0 0 20px rgba(34,211,238,0.5)" }}>
              {Math.floor(progress)}
            </span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="text-white">Edu</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">AI.</span>
          </h1>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/80 tracking-widest">
            <span className="text-lg" style={{ filter: "drop-shadow(0 0 6px currentColor)" }}>{BOOT_PHASES[phase].icon}</span>
            <span>{BOOT_PHASES[phase].label}</span>
          </div>
          {glitchText && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-mono text-cyan-500/20 tracking-[0.3em] pointer-events-none">
              {glitchText}
            </div>
          )}
        </div>
        <div className="w-72 space-y-1 mt-4">
          {BOOT_PHASES.slice(0, phase + 1).map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-mono" style={{ opacity: i === phase ? 1 : 0.3 }}>
              <span className={i < phase ? "text-emerald-500" : "text-cyan-400"}>{i < phase ? "[OK]" : "[..]"}</span>
              <span className="text-gray-500">{p.label}</span>
            </div>
          ))}
        </div>
        <div className="absolute w-64 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" style={{ animation: "scan-line 2s linear infinite" }} />
      </div>
    </div>
  );
}

"use client";
import { useRef, useEffect, useCallback, useState } from "react";

const FORMULAS = [
  "E = mc²", "F = ma", "∇ × B = μ₀J", "PV = nRT", "ΔG = ΔH - TΔS",
  "ψ(x,t)", "λ = h/p", "σ = F/A", "∫ eˣ dx", "∑ n²", "H₂O",
  "∂²ψ/∂t²", "∇²φ = ρ/ε₀", "S = k ln W", "iħ∂ψ/∂t = Ĥψ",
  "C₆H₁₂O₆", "Fe₂O₃", "E = hf", "τ = r × F", "ω = 2πf",
  "Σ Fᵢ = 0", "∬ F·dS", "√(2gh)", "λₙ = 2L/n", "NaCl",
  "CO₂ → C + O₂", "V = IR", "P = IV", "KE = ½mv²",
  "a² + b² = c²", "lim(x→0)", "d/dx[xⁿ]", "∂²u/∂t² = c²∇²u",
  "C = 2πr", "A = πr²", "Fg = Gm₁m₂/r²", "ATP → ADP + Pᵢ",
];

const MATRIX_CHARS = "イウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01";

interface RainDrop { x: number; y: number; speed: number; chars: string[]; opacity: number; fontSize: number; }
interface FloatingFormula { x: number; y: number; text: string; speed: number; opacity: number; angle: number; angularSpeed: number; scale: number; color: string; }
interface HUDElement { x: number; y: number; radius: number; rotation: number; opacity: number; pulsePhase: number; }

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export default function SciFiOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);
  const prefersReduced = usePrefersReducedMotion();

  const initRain = useCallback((w: number, h: number): RainDrop[] => {
    const columns = Math.floor(w / 22);
    return Array.from({ length: columns }, (_, i) => ({
      x: i * 22 + Math.random() * 10,
      y: Math.random() * h * 2 - h,
      speed: 0.5 + Math.random() * 2,
      chars: Array.from({ length: 15 + Math.floor(Math.random() * 10) }, () =>
        MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
      ),
      opacity: 0.03 + Math.random() * 0.07,
      fontSize: 10 + Math.random() * 4,
    }));
  }, []);

  const initFormulas = useCallback((w: number, h: number): FloatingFormula[] => {
    const colors = ["#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#fbbf24", "#818cf8"];
    return Array.from({ length: 18 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      text: FORMULAS[Math.floor(Math.random() * FORMULAS.length)],
      speed: 0.15 + Math.random() * 0.4,
      opacity: 0.04 + Math.random() * 0.08,
      angle: (Math.random() - 0.5) * 0.3,
      angularSpeed: (Math.random() - 0.5) * 0.002,
      scale: 0.7 + Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  const initHUD = useCallback((w: number, h: number): HUDElement[] => {
    return Array.from({ length: 5 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 30 + Math.random() * 60,
      rotation: Math.random() * Math.PI * 2,
      opacity: 0.03 + Math.random() * 0.05,
      pulsePhase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rain: RainDrop[] = [];
    let formulas: FloatingFormula[] = [];
    let hudElements: HUDElement[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rain = initRain(w, h);
      formulas = initFormulas(w, h);
      hudElements = initHUD(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      timeRef.current += 1;
      const t = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      ctx.clearRect(0, 0, w, h);

      for (const drop of rain) {
        drop.y += drop.speed;
        if (drop.y > h + 200) { drop.y = -200; drop.speed = 0.5 + Math.random() * 2; }
        for (let i = 0; i < drop.chars.length; i++) {
          const cy = drop.y + i * 14;
          if (cy < -20 || cy > h + 20) continue;
          const fade = 1 - i / drop.chars.length;
          ctx.globalAlpha = drop.opacity * fade;
          ctx.fillStyle = i === 0 ? "#22d3ee" : "#0ea5e9";
          ctx.font = `${drop.fontSize}px 'Courier New', monospace`;
          ctx.fillText(drop.chars[i], drop.x, cy);
          if (Math.random() < 0.02) drop.chars[i] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        }
      }

      for (const f of formulas) {
        f.y -= f.speed;
        f.x += Math.sin(t * 0.005 + f.angle * 10) * 0.3;
        f.angle += f.angularSpeed;
        if (f.y < -60) { f.y = h + 60; f.x = Math.random() * w; f.text = FORMULAS[Math.floor(Math.random() * FORMULAS.length)]; }
        const fdx = f.x - mx; const fdy = f.y - my; const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
        if (fdist < 150 && fdist > 0) { const force = (150 - fdist) / 150; f.x += (fdx / fdist) * force * 3; f.y += (fdy / fdist) * force * 3; }
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.angle); ctx.scale(f.scale, f.scale);
        ctx.globalAlpha = f.opacity; ctx.fillStyle = f.color;
        ctx.font = "italic 13px 'Courier New', monospace";
        ctx.fillText(f.text, 0, 0); ctx.restore();
      }

      for (const hud of hudElements) {
        const pulse = Math.sin(t * 0.02 + hud.pulsePhase) * 0.5 + 0.5;
        const r = hud.radius * (0.9 + pulse * 0.2);
        ctx.save(); ctx.translate(hud.x, hud.y); ctx.rotate(hud.rotation + t * 0.003);
        ctx.globalAlpha = hud.opacity * (0.5 + pulse * 0.5);
        ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        const chLen = r * 0.3;
        ctx.beginPath();
        ctx.moveTo(-r - chLen, 0); ctx.lineTo(-r + chLen, 0);
        ctx.moveTo(r - chLen, 0); ctx.lineTo(r + chLen, 0);
        ctx.moveTo(0, -r - chLen); ctx.lineTo(0, -r + chLen);
        ctx.moveTo(0, r - chLen); ctx.lineTo(0, r + chLen);
        ctx.stroke();
        ctx.globalAlpha = hud.opacity * pulse;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      for (let i = 0; i < formulas.length; i++) {
        for (let j = i + 1; j < formulas.length; j++) {
          const dx = formulas[i].x - formulas[j].x;
          const dy = formulas[i].y - formulas[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ctx.globalAlpha = (1 - dist / 200) * 0.03;
            ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 0.3;
            ctx.beginPath(); ctx.moveTo(formulas[i].x, formulas[i].y); ctx.lineTo(formulas[j].x, formulas[j].y); ctx.stroke();
          }
        }
      }

      const scanY = (t * 0.5) % (h + 100) - 50;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGrad.addColorStop(0, "rgba(34, 211, 238, 0)");
      scanGrad.addColorStop(0.5, "rgba(34, 211, 238, 0.04)");
      scanGrad.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.globalAlpha = 1; ctx.fillStyle = scanGrad; ctx.fillRect(0, scanY - 30, w, 60);
      ctx.globalAlpha = 0.08; ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke();

      if (mx > 0 && my > 0) {
        const radarPhase = (t * 0.03) % (Math.PI * 2);
        for (let ring = 0; ring < 3; ring++) {
          ctx.globalAlpha = 0.06 * (1 - ring / 3);
          ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.arc(mx, my, 40 + ring * 35, radarPhase, radarPhase + Math.PI * 0.6); ctx.stroke();
        }
      }

      ctx.globalAlpha = 0.06; ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 1;
      const bs = 40; const bp = 30;
      ctx.beginPath(); ctx.moveTo(bp, bp + bs); ctx.lineTo(bp, bp); ctx.lineTo(bp + bs, bp); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - bp - bs, bp); ctx.lineTo(w - bp, bp); ctx.lineTo(w - bp, bp + bs); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bp, h - bp - bs); ctx.lineTo(bp, h - bp); ctx.lineTo(bp + bs, h - bp); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - bp - bs, h - bp); ctx.lineTo(w - bp, h - bp); ctx.lineTo(w - bp, h - bp - bs); ctx.stroke();

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [initRain, initFormulas, initHUD, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.7, zIndex: 1 }}
    />
  );
}

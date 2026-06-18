"use client";

import { useEffect, useRef, useCallback } from "react";

interface Pulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export default function AITutorBrainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const pulsesRef = useRef<Pulse[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  const handleMouse = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse, { passive: true });

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // Neural pulse effect - emanate from mouse
      if (Math.random() < 0.03) {
        pulsesRef.current.push({
          x: mouseRef.current.x || w * 0.5,
          y: mouseRef.current.y || h * 0.5,
          radius: 0,
          maxRadius: 150 + Math.random() * 100,
          alpha: 0.15,
          speed: 1.5 + Math.random(),
        });
      }

      // Update and draw pulses
      pulsesRef.current = pulsesRef.current.filter((p) => {
        p.radius += p.speed;
        p.alpha *= 0.98;
        if (p.radius > p.maxRadius || p.alpha < 0.001) return false;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(6, 182, 212, 0)`);
        gradient.addColorStop(0.7, `rgba(6, 182, 212, ${p.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(6, 182, 212, 0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
        return true;
      });

      // Brain-like neural network in center
      const cx = w * 0.5;
      const cy = h * 0.45;
      const brainRadius = Math.min(w, h) * 0.25;

      // Draw brain nodes
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2 + t * 0.1;
        const r = brainRadius * (0.3 + Math.sin(angle * 3 + t) * 0.15);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        // Pulsing glow
        const pulseSize = 3 + Math.sin(t * 2 + i) * 1.5;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 4);
        glow.addColorStop(0, "rgba(168, 85, 247, 0.2)");
        glow.addColorStop(1, "rgba(168, 85, 247, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(168, 85, 247, ${0.4 + Math.sin(t * 2 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Connect to nearby nodes
        for (let j = i + 1; j < Math.min(i + 5, 30); j++) {
          const angle2 = (j / 30) * Math.PI * 2 + t * 0.1;
          const r2 = brainRadius * (0.3 + Math.sin(angle2 * 3 + t) * 0.15);
          const x2 = cx + Math.cos(angle2) * r2;
          const y2 = cy + Math.sin(angle2) * r2;
          const dist = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.08;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // Data flow particles orbiting the brain
      for (let i = 0; i < 12; i++) {
        const angle = t * 0.3 + (i / 12) * Math.PI * 2;
        const orbitR = brainRadius * 0.8 + Math.sin(t + i) * 20;
        const px = cx + Math.cos(angle) * orbitR;
        const py = cy + Math.sin(angle) * orbitR;

        ctx.fillStyle = `rgba(6, 182, 212, ${0.3 + Math.sin(t * 3 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [handleMouse]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#020203]" />
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 40%, rgba(168,85,247,0.06), transparent)," +
            "radial-gradient(ellipse 40% 30% at 50% 50%, rgba(6,182,212,0.04), transparent)," +
            "radial-gradient(ellipse at center, transparent 40%, #020203 100%)",
        }}
      />
    </div>
  );
}

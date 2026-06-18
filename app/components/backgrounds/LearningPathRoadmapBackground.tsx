"use client";

import { useEffect, useRef } from "react";

interface Milestone {
  x: number;
  y: number;
  active: boolean;
  pulse: number;
}

export default function LearningPathRoadmapBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let milestones: Milestone[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);

      const w = window.innerWidth;
      const h = window.innerHeight;
      milestones = Array.from({ length: 8 }, (_, i) => ({
        x: w * 0.1 + (i / 7) * w * 0.8,
        y: h * 0.4 + Math.sin(i * 0.8) * h * 0.15,
        active: i < 3,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += 0.01;

      ctx.clearRect(0, 0, w, h);

      // Draw path connecting milestones
      ctx.strokeStyle = "rgba(16, 185, 129, 0.06)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      milestones.forEach((m, i) => {
        if (i === 0) ctx.moveTo(m.x, m.y);
        else {
          const prev = milestones[i - 1];
          const cpx = (prev.x + m.x) / 2;
          const cpy = (prev.y + m.y) / 2 - 20;
          ctx.quadraticCurveTo(prev.x + (m.x - prev.x) * 0.5, cpy, m.x, m.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw milestones
      milestones.forEach((m, i) => {
        m.pulse += 0.02;
        const pulseScale = Math.sin(m.pulse) * 0.3 + 1;

        // Glow
        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 20 * pulseScale);
        const color = m.active ? "16, 185, 129" : "255, 255, 255";
        glow.addColorStop(0, `rgba(${color}, ${m.active ? 0.2 : 0.05})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 20 * pulseScale, 0, Math.PI * 2);
        ctx.fill();

        // Node
        ctx.fillStyle = m.active
          ? `rgba(16, 185, 129, ${0.5 + Math.sin(m.pulse) * 0.2})`
          : "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.arc(m.x, m.y, 4 * pulseScale, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = m.active ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Progress particle traveling along path
      const progress = (time * 0.1) % 1;
      const idx = Math.floor(progress * (milestones.length - 1));
      const nextIdx = Math.min(idx + 1, milestones.length - 1);
      const localProgress = (progress * (milestones.length - 1)) % 1;

      if (milestones[idx] && milestones[nextIdx]) {
        const px = milestones[idx].x + (milestones[nextIdx].x - milestones[idx].x) * localProgress;
        const py = milestones[idx].y + (milestones[nextIdx].y - milestones[idx].y) * localProgress;

        const trailGlow = ctx.createRadialGradient(px, py, 0, px, py, 12);
        trailGlow.addColorStop(0, "rgba(16, 185, 129, 0.4)");
        trailGlow.addColorStop(1, "rgba(16, 185, 129, 0)");
        ctx.fillStyle = trailGlow;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#020203]" />
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(16,185,129,0.04), transparent)," +
            "radial-gradient(ellipse at center, transparent 50%, #020203 100%)",
        }}
      />
    </div>
  );
}

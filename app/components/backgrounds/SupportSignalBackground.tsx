"use client";

import { useEffect, useRef } from "react";

interface Signal {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export default function SupportSignalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let signals: Signal[] = [];
    let time = 0;

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

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += 0.01;

      ctx.clearRect(0, 0, w, h);

      // Generate signals periodically
      if (Math.random() < 0.02) {
        signals.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 0,
          maxRadius: 80 + Math.random() * 60,
          alpha: 0.1,
        });
      }

      // Update and draw signals
      signals = signals.filter((s) => {
        s.radius += 0.8;
        s.alpha *= 0.99;
        if (s.radius > s.maxRadius || s.alpha < 0.005) return false;

        // Concentric rings
        for (let r = 0; r < 3; r++) {
          const ringRadius = s.radius - r * 15;
          if (ringRadius > 0) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${s.alpha * (1 - r * 0.3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(s.x, s.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        return true;
      });

      // Global connection lines
      const hubX = w * 0.5;
      const hubY = h * 0.3;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.1;
        const dist = 150 + Math.sin(time + i) * 50;
        const x = hubX + Math.cos(angle) * dist;
        const y = hubY + Math.sin(angle) * dist;

        const pulsePos = (time * 0.3 + i * 0.15) % 1;
        const px = hubX + (x - hubX) * pulsePos;
        const py = hubY + (y - hubY) * pulsePos;

        ctx.fillStyle = `rgba(6, 182, 212, ${0.15 + Math.sin(time + i) * 0.05})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(6, 182, 212, 0.03)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(hubX, hubY);
        ctx.lineTo(x, y);
        ctx.stroke();
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
            "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(6,182,212,0.04), transparent)," +
            "radial-gradient(ellipse at center, transparent 50%, #020203 100%)",
        }}
      />
    </div>
  );
}

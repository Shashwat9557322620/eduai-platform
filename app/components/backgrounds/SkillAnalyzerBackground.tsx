"use client";

import { useEffect, useRef } from "react";

export default function SkillAnalyzerBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
      time += 0.008;

      ctx.clearRect(0, 0, w, h);

      // Radar/spider web pattern
      const cx = w * 0.5;
      const cy = h * 0.4;
      const maxR = Math.min(w, h) * 0.25;
      const rings = 5;
      const spokes = 8;

      // Draw rings
      for (let r = 1; r <= rings; r++) {
        const radius = (r / rings) * maxR;
        const alpha = 0.04 + Math.sin(time + r * 0.5) * 0.02;
        ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw spokes
      for (let i = 0; i < spokes; i++) {
        const angle = (i / spokes) * Math.PI * 2 + time * 0.05;
        const x = cx + Math.cos(angle) * maxR;
        const y = cy + Math.sin(angle) * maxR;

        ctx.strokeStyle = "rgba(236, 72, 153, 0.04)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Data point on spoke
        const dataR = maxR * (0.4 + Math.sin(time * 0.5 + i) * 0.3);
        const px = cx + Math.cos(angle) * dataR;
        const py = cy + Math.sin(angle) * dataR;

        ctx.fillStyle = `rgba(236, 72, 153, ${0.3 + Math.sin(time + i) * 0.15})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 8);
        glow.addColorStop(0, "rgba(236, 72, 153, 0.2)");
        glow.addColorStop(1, "rgba(236, 72, 153, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connect data points
      ctx.strokeStyle = "rgba(236, 72, 153, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= spokes; i++) {
        const idx = i % spokes;
        const angle = (idx / spokes) * Math.PI * 2 + time * 0.05;
        const dataR = maxR * (0.4 + Math.sin(time * 0.5 + idx) * 0.3);
        const px = cx + Math.cos(angle) * dataR;
        const py = cy + Math.sin(angle) * dataR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Scanning line
      const scanAngle = time * 0.3;
      const scanX = cx + Math.cos(scanAngle) * maxR;
      const scanY = cy + Math.sin(scanAngle) * maxR;
      const scanGrad = ctx.createLinearGradient(cx, cy, scanX, scanY);
      scanGrad.addColorStop(0, "rgba(236, 72, 153, 0)");
      scanGrad.addColorStop(0.5, "rgba(236, 72, 153, 0.08)");
      scanGrad.addColorStop(1, "rgba(236, 72, 153, 0)");
      ctx.strokeStyle = scanGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(scanX, scanY);
      ctx.stroke();

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
            "radial-gradient(ellipse 50% 40% at 50% 40%, rgba(236,72,153,0.05), transparent)," +
            "radial-gradient(ellipse at center, transparent 45%, #020203 100%)",
        }}
      />
    </div>
  );
}

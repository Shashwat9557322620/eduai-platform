"use client";

import { useEffect, useRef } from "react";

export default function BlogArticleBackground() {
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
      time += 0.005;

      ctx.clearRect(0, 0, w, h);

      // Floating text lines
      for (let i = 0; i < 12; i++) {
        const x = w * 0.1 + Math.sin(time * 0.2 + i) * 20;
        const y = h * 0.15 + i * h * 0.06;
        const lineWidth = 60 + Math.sin(time + i * 0.5) * 30;

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + Math.sin(time + i) * 0.01})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + lineWidth, y);
        ctx.stroke();
      }

      // Word particles
      for (let i = 0; i < 20; i++) {
        const x = (i * 67 + time * 5) % w;
        const y = h * 0.4 + Math.sin(time * 0.3 + i * 1.5) * h * 0.2;

        ctx.fillStyle = `rgba(99, 102, 241, ${0.04 + Math.sin(time + i) * 0.02})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
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
            "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(99,102,241,0.04), transparent)," +
            "radial-gradient(ellipse at center, transparent 50%, #020203 100%)",
        }}
      />
    </div>
  );
}

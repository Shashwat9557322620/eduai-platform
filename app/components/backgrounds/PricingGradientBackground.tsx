"use client";

import { useEffect, useRef } from "react";

export default function PricingGradientBackground() {
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
      time += 0.003;

      ctx.clearRect(0, 0, w, h);

      // Elegant geometric shapes
      const shapes = [
        { x: w * 0.2, y: h * 0.3, size: 80, color: "6, 182, 212" },
        { x: w * 0.8, y: h * 0.4, size: 60, color: "168, 85, 247" },
        { x: w * 0.5, y: h * 0.7, size: 70, color: "236, 72, 153" },
      ];

      shapes.forEach((shape, i) => {
        const s = shape.size + Math.sin(time + i) * 10;
        const rotation = time * 0.1 + i;

        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(rotation);

        // Hexagon
        ctx.strokeStyle = `rgba(${shape.color}, 0.04)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2;
          const x = Math.cos(angle) * s;
          const y = Math.sin(angle) * s;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner hexagon
        ctx.strokeStyle = `rgba(${shape.color}, 0.02)`;
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2 + Math.PI / 6;
          const x = Math.cos(angle) * s * 0.6;
          const y = Math.sin(angle) * s * 0.6;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
      });

      // Floating particles
      for (let i = 0; i < 20; i++) {
        const x = (time * 15 + i * 90) % (w + 50) - 25;
        const y = h * 0.2 + Math.sin(time * 0.5 + i * 1.5) * h * 0.3;
        const alpha = 0.1 + Math.sin(time + i) * 0.05;

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
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
            "radial-gradient(ellipse 50% 40% at 30% 30%, rgba(6,182,212,0.04), transparent)," +
            "radial-gradient(ellipse 50% 40% at 70% 50%, rgba(168,85,247,0.04), transparent)," +
            "radial-gradient(ellipse 50% 40% at 50% 80%, rgba(236,72,153,0.03), transparent)," +
            "radial-gradient(ellipse at center, transparent 50%, #020203 100%)",
        }}
      />
    </div>
  );
}

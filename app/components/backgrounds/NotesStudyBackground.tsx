"use client";

import { useEffect, useRef } from "react";

export default function NotesStudyBackground() {
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

    const symbols = ["∑", "∫", "∂", "∞", "π", "√", "Δ", "λ", "θ", "α", "β", "φ"];

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += 0.005;

      ctx.clearRect(0, 0, w, h);

      // Floating paper layers
      for (let i = 0; i < 6; i++) {
        const x = w * (0.15 + i * 0.14);
        const y = h * 0.3 + Math.sin(time * 0.3 + i) * 30;
        const rotation = Math.sin(time * 0.2 + i * 1.5) * 0.05;
        const alpha = 0.02 + Math.sin(time + i) * 0.01;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Paper shape
        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(-30, -40, 60, 80, 4);
        ctx.stroke();

        // Lines on paper
        for (let j = 0; j < 5; j++) {
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(-20, -25 + j * 12);
          ctx.lineTo(20, -25 + j * 12);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Floating educational symbols
      symbols.forEach((sym, i) => {
        const x = (time * 10 + i * 100) % (w + 50) - 25;
        const y = h * 0.5 + Math.sin(time * 0.4 + i * 2) * h * 0.25;
        const alpha = 0.06 + Math.sin(time + i) * 0.03;

        ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillText(sym, x, y);
      });

      // Knowledge particles
      for (let i = 0; i < 30; i++) {
        const x = (i * 47 + time * 8) % w;
        const y = (i * 31 + Math.sin(time + i) * 20) % h;
        const size = 1 + Math.sin(time * 2 + i) * 0.5;

        ctx.fillStyle = `rgba(99, 102, 241, ${0.1 + Math.sin(time + i) * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
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
            "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(99,102,241,0.04), transparent)," +
            "radial-gradient(ellipse at center, transparent 50%, #020203 100%)",
        }}
      />
    </div>
  );
}

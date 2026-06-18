"use client";

import { useEffect, useRef } from "react";

export default function PodcastWaveBackground() {
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
      time += 0.02;

      ctx.clearRect(0, 0, w, h);

      // Sound wave visualization
      const waves = 5;
      for (let wave = 0; wave < waves; wave++) {
        const waveY = h * 0.3 + wave * h * 0.1;
        const color = wave % 2 === 0 ? "6, 182, 212" : "168, 85, 247";

        ctx.strokeStyle = `rgba(${color}, ${0.06 - wave * 0.008})`;
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let x = 0; x < w; x += 2) {
          const amplitude = 20 + Math.sin(time + wave) * 10;
          const frequency = 0.02 + wave * 0.005;
          const y = waveY + Math.sin(x * frequency + time + wave * 0.5) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      // Audio bars
      const barCount = 40;
      const barWidth = w / barCount - 4;
      for (let i = 0; i < barCount; i++) {
        const barH = 10 + Math.sin(time * 2 + i * 0.3) * 15 + Math.cos(time * 1.5 + i * 0.5) * 10;
        const x = i * (barWidth + 4) + 2;
        const y = h * 0.7 - barH / 2;

        const alpha = 0.05 + Math.sin(time + i) * 0.02;
        ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.fillRect(x, y, barWidth, barH);
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
            "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(168,85,247,0.04), transparent)," +
            "radial-gradient(ellipse 50% 40% at 50% 70%, rgba(6,182,212,0.03), transparent)," +
            "radial-gradient(ellipse at center, transparent 50%, #020203 100%)",
        }}
      />
    </div>
  );
}

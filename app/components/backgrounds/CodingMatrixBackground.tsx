"use client";

import { useEffect, useRef } from "react";

export default function CodingMatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    const columns: { x: number; y: number; speed: number; chars: string[] }[] = [];
    const codeChars = "01{}[]<>/=;:()const let var fn async await import export return if else while for class new this";

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);

      columns.length = 0;
      const colCount = Math.floor(window.innerWidth / 30);
      for (let i = 0; i < colCount; i++) {
        columns.push({
          x: i * 30 + 15,
          y: Math.random() * window.innerHeight,
          speed: 0.5 + Math.random() * 1.5,
          chars: Array.from({ length: 15 }, () =>
            codeChars[Math.floor(Math.random() * codeChars.length)]
          ),
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += 0.016;

      ctx.clearRect(0, 0, w, h);

      // Matrix rain
      columns.forEach((col) => {
        col.y += col.speed;
        if (col.y > h + 200) {
          col.y = -200;
          col.chars = Array.from({ length: 15 }, () =>
            codeChars[Math.floor(Math.random() * codeChars.length)]
          );
        }

        ctx.font = '11px "JetBrains Mono", monospace';
        col.chars.forEach((char, i) => {
          const charY = col.y + i * 16;
          if (charY < 0 || charY > h) return;

          const fade = i === 0 ? 0.6 : Math.max(0, 0.15 - i * 0.01);
          ctx.fillStyle = `rgba(6, 182, 212, ${fade})`;
          ctx.fillText(char, col.x, charY);
        });
      });

      // Circuit board pattern
      ctx.strokeStyle = "rgba(6, 182, 212, 0.03)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 60) {
        for (let y = 0; y < h; y += 60) {
          if (Math.sin(x * 0.01 + time) > 0.7) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 30, y);
            ctx.stroke();
          }
          if (Math.cos(y * 0.01 + time) > 0.7) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 30);
            ctx.stroke();
          }
        }
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
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(6,182,212,0.04), transparent)," +
            "radial-gradient(ellipse at center, transparent 45%, #020203 100%)",
        }}
      />
    </div>
  );
}

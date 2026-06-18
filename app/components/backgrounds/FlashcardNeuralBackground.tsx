"use client";

import { useEffect, useRef } from "react";

interface Card {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  alpha: number;
  speed: number;
}

export default function FlashcardNeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cards: Card[] = [];
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);

      cards = Array.from({ length: 12 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 0.5 - 0.25,
        scale: 0.5 + Math.random() * 0.5,
        alpha: 0.03 + Math.random() * 0.04,
        speed: 0.2 + Math.random() * 0.3,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += 0.01;

      ctx.clearRect(0, 0, w, h);

      // Floating card shapes
      cards.forEach((card, i) => {
        card.y -= card.speed;
        card.x += Math.sin(time + i) * 0.3;
        if (card.y < -100) {
          card.y = h + 100;
          card.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(card.x, card.y);
        ctx.rotate(card.rotation + Math.sin(time + i) * 0.1);
        ctx.scale(card.scale, card.scale);

        // Card shape
        const cw = 80;
        const ch = 50;
        ctx.strokeStyle = `rgba(168, 85, 247, ${card.alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 6);
        ctx.stroke();

        // Flip line
        const flipProgress = (Math.sin(time * 0.5 + i * 2) + 1) / 2;
        ctx.strokeStyle = `rgba(6, 182, 212, ${card.alpha * flipProgress})`;
        ctx.beginPath();
        ctx.moveTo(-cw / 2 + 5, 0);
        ctx.lineTo(-cw / 2 + 5 + (cw - 10) * flipProgress, 0);
        ctx.stroke();

        ctx.restore();
      });

      // Neural connection nodes
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + time * 0.2;
        const r = 150 + Math.sin(time + i) * 50;
        const x = w * 0.5 + Math.cos(angle) * r;
        const y = h * 0.4 + Math.sin(angle) * r;

        const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(168, 85, 247, ${0.1 + pulse * 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Connection to center
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.03 + pulse * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.4);
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
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(168,85,247,0.06), transparent)," +
            "radial-gradient(ellipse 50% 40% at 30% 70%, rgba(6,182,212,0.04), transparent)," +
            "radial-gradient(ellipse at center, transparent 45%, #020203 100%)",
        }}
      />
    </div>
  );
}

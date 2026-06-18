"use client";

import { useEffect, useRef } from "react";

export default function AuthFlowBackground() {
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

      // Flowing gradient orbs
      const orbs = [
        { x: 0.3, y: 0.4, r: 200, color: "6, 182, 212", speed: 0.3 },
        { x: 0.7, y: 0.6, r: 180, color: "168, 85, 247", speed: 0.4 },
        { x: 0.5, y: 0.3, r: 150, color: "236, 72, 153", speed: 0.2 },
      ];

      orbs.forEach((orb) => {
        const ox = w * orb.x + Math.sin(time * orb.speed) * 50;
        const oy = h * orb.y + Math.cos(time * orb.speed * 0.7) * 40;

        const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        glow.addColorStop(0, `rgba(${orb.color}, 0.04)`);
        glow.addColorStop(1, `rgba(${orb.color}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Lock/security particles
      for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2 + time * 0.1;
        const dist = 100 + Math.sin(time + i) * 30;
        const x = w * 0.5 + Math.cos(angle) * dist;
        const y = h * 0.4 + Math.sin(angle) * dist;

        ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + Math.sin(time + i) * 0.015})`;
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
            "radial-gradient(ellipse at center, transparent 40%, #020203 100%)",
        }}
      />
    </div>
  );
}

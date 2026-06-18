"use client";

import { useEffect, useRef } from "react";

export default function AboutGlobeBackground() {
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

      const cx = w * 0.5;
      const cy = h * 0.4;
      const radius = Math.min(w, h) * 0.2;

      // Globe wireframe
      ctx.strokeStyle = "rgba(99, 102, 241, 0.06)";
      ctx.lineWidth = 0.5;

      // Horizontal rings
      for (let i = 0; i < 8; i++) {
        const y = cy - radius + (i / 7) * radius * 2;
        const ringRadius = Math.sqrt(Math.max(0, radius * radius - (y - cy) * (y - cy)));
        if (ringRadius > 0) {
          ctx.beginPath();
          ctx.ellipse(cx, y, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Vertical meridians
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI + time * 0.1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * Math.cos(angle), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Connection points on globe
      const points = Array.from({ length: 12 }, (_, i) => {
        const lat = ((i / 12) * Math.PI - Math.PI / 2) * 0.8;
        const lon = time * 0.2 + (i / 12) * Math.PI * 2;
        const x = cx + Math.cos(lat) * Math.cos(lon) * radius * 0.9;
        const y = cy + Math.sin(lat) * radius * 0.9;
        const z = Math.cos(lat) * Math.sin(lon);
        return { x, y, z, visible: z > -0.2 };
      });

      points.forEach((p) => {
        if (!p.visible) return;
        const alpha = 0.2 + p.z * 0.3;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
        glow.addColorStop(0, `rgba(99, 102, 241, ${alpha})`);
        glow.addColorStop(1, `rgba(99, 102, 241, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(99, 102, 241, ${alpha + 0.1})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Signal arcs between visible points
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        if (!p1.visible) continue;
        const p2 = points[(i + 3) % points.length];
        if (!p2.visible) continue;

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 30;
        const alpha = Math.min(p1.z, p2.z) * 0.3 + 0.1;

        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
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
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.05), transparent)," +
            "radial-gradient(ellipse at center, transparent 45%, #020203 100%)",
        }}
      />
    </div>
  );
}

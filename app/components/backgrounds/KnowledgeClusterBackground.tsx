"use client";

import { useEffect, useRef } from "react";

interface Cluster {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  satellites: { angle: number; dist: number; speed: number; size: number }[];
}

const COLORS = ["#06b6d4", "#a855f7", "#ec4899", "#6366f1", "#10b981"];

function createClusters(w: number, h: number): Cluster[] {
  return Array.from({ length: 8 }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    radius: Math.random() * 3 + 2,
    color: COLORS[i % COLORS.length],
    satellites: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 30 + 15,
      speed: (Math.random() - 0.5) * 0.02,
      size: Math.random() * 1.5 + 0.5,
    })),
  }));
}

export default function KnowledgeClusterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clusters: Cluster[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      clusters = createClusters(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Draw constellation lines between nearby clusters
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const dx = clusters[i].x - clusters[j].x;
          const dy = clusters[i].y - clusters[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            const alpha = (1 - dist / 300) * 0.08;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            ctx.moveTo(clusters[i].x, clusters[i].y);
            ctx.lineTo(clusters[j].x, clusters[j].y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      // Draw clusters and satellites
      clusters.forEach((cluster) => {
        cluster.x += cluster.vx;
        cluster.y += cluster.vy;
        if (cluster.x < 50 || cluster.x > w - 50) cluster.vx *= -1;
        if (cluster.y < 50 || cluster.y > h - 50) cluster.vy *= -1;

        // Glow
        const glow = ctx.createRadialGradient(
          cluster.x, cluster.y, 0,
          cluster.x, cluster.y, cluster.radius * 8
        );
        glow.addColorStop(0, cluster.color + "30");
        glow.addColorStop(1, cluster.color + "00");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cluster.x, cluster.y, cluster.radius * 8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = cluster.color + "90";
        ctx.beginPath();
        ctx.arc(cluster.x, cluster.y, cluster.radius, 0, Math.PI * 2);
        ctx.fill();

        // Satellites
        cluster.satellites.forEach((sat) => {
          sat.angle += sat.speed;
          const sx = cluster.x + Math.cos(sat.angle) * sat.dist;
          const sy = cluster.y + Math.sin(sat.angle) * sat.dist;

          ctx.fillStyle = cluster.color + "50";
          ctx.beginPath();
          ctx.arc(sx, sy, sat.size, 0, Math.PI * 2);
          ctx.fill();

          // Connection line to parent
          ctx.strokeStyle = cluster.color + "15";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(cluster.x, cluster.y);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        });
      });

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
            "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(6,182,212,0.06), transparent)," +
            "radial-gradient(ellipse 60% 40% at 70% 70%, rgba(168,85,247,0.05), transparent)," +
            "radial-gradient(ellipse at center, transparent 50%, #020203 100%)",
        }}
      />
    </div>
  );
}

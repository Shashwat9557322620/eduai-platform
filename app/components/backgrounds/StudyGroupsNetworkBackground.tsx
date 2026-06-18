"use client";

import { useEffect, useRef, useCallback } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
}

const COLORS = ["#06b6d4", "#a855f7", "#ec4899", "#f59e0b", "#34d399", "#6366f1"];

export default function StudyGroupsNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const handleMouse = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let nodes: Node[] = [];
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);

      nodes = Array.from({ length: 25 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        radius: 2 + Math.random() * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse, { passive: true });

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += 0.01;

      ctx.clearRect(0, 0, w, h);

      // Update nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        // Mouse attraction
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          node.vx += (dx / dist) * 0.01;
          node.vy += (dy / dist) * 0.01;
        }

        node.vx *= 0.99;
        node.vy *= 0.99;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.1;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Pulse traveling along connection
            const pulsePos = (time * 0.5 + i * 0.1) % 1;
            const px = nodes[i].x + (nodes[j].x - nodes[i].x) * pulsePos;
            const py = nodes[i].y + (nodes[j].y - nodes[i].y) * pulsePos;
            ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 2})`;
            ctx.beginPath();
            ctx.arc(px, py, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        const pulse = Math.sin(time * 2 + node.x * 0.01) * 0.5 + 0.5;

        // Glow
        const glow = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 5
        );
        glow.addColorStop(0, node.color + "25");
        glow.addColorStop(1, node.color + "00");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = node.color + "80";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (0.8 + pulse * 0.4), 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [handleMouse]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#020203]" />
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(245,158,11,0.04), transparent)," +
            "radial-gradient(ellipse 50% 40% at 30% 60%, rgba(6,182,212,0.04), transparent)," +
            "radial-gradient(ellipse at center, transparent 50%, #020203 100%)",
        }}
      />
    </div>
  );
}

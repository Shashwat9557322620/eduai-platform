"use client";

import { useEffect, useRef, useCallback } from "react";

const NODE_COUNT = 45;
const CONNECTION_DISTANCE = 180;
const MOUSE_RADIUS = 200;

function createNodes(width: number, height: number) {
  return Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: Math.random() * 2 + 1,
    pulse: Math.random() * Math.PI * 2,
  }));
}

export default function NeuralHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const nodesRef = useRef<ReturnType<typeof createNodes>>([]);

  const handleMouse = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      if (nodesRef.current.length === 0) {
        nodesRef.current = createNodes(window.innerWidth, window.innerHeight);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse, { passive: true });

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const time = Date.now() * 0.001;

      nodes.forEach((node) => {
        node.pulse += 0.02;
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.02;
          node.vx += dx * force;
          node.vy += dy * force;
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
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            const gradient = ctx.createLinearGradient(
              nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y
            );
            gradient.addColorStop(0, `rgba(6, 182, 212, ${alpha})`);
            gradient.addColorStop(1, `rgba(168, 85, 247, ${alpha})`);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        const pulseScale = Math.sin(node.pulse) * 0.5 + 1;
        const r = node.radius * pulseScale;

        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 6);
        glow.addColorStop(0, "rgba(6, 182, 212, 0.3)");
        glow.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(6, 182, 212, ${0.6 + Math.sin(node.pulse) * 0.3})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw flowing data streams
      for (let i = 0; i < 5; i++) {
        const streamX = (time * 30 + i * 200) % (w + 200) - 100;
        const streamY = h * 0.3 + Math.sin(time * 0.5 + i) * h * 0.2;
        const streamGrad = ctx.createLinearGradient(streamX - 80, streamY, streamX + 80, streamY);
        streamGrad.addColorStop(0, "rgba(6, 182, 212, 0)");
        streamGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.06)");
        streamGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(streamX - 80, streamY);
        ctx.lineTo(streamX + 80, streamY);
        ctx.stroke();
      }

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
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(6,182,212,0.08), transparent)," +
            "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(168,85,247,0.05), transparent)," +
            "radial-gradient(ellipse at center, transparent 40%, #020203 100%)",
        }}
      />
    </div>
  );
}

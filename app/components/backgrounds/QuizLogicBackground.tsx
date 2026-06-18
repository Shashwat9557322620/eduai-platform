"use client";

import { useEffect, useRef } from "react";

interface LogicNode {
  x: number;
  y: number;
  connected: number[];
  pulse: number;
}

export default function QuizLogicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let nodes: LogicNode[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);

      const w = window.innerWidth;
      const h = window.innerHeight;
      nodes = Array.from({ length: 15 }, (_, i) => ({
        x: w * 0.1 + Math.random() * w * 0.8,
        y: h * 0.2 + Math.random() * h * 0.6,
        connected: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
          Math.floor(Math.random() * 15)
        ).filter((j) => j !== i),
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += 0.01;

      ctx.clearRect(0, 0, w, h);

      // Draw connections
      nodes.forEach((node, i) => {
        node.connected.forEach((j) => {
          if (j >= nodes.length) return;
          const other = nodes[j];
          const alpha = 0.04 + Math.sin(time + i) * 0.02;
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();

          // Data pulse
          const pulsePos = (time * 0.3 + i * 0.2) % 1;
          const px = node.x + (other.x - node.x) * pulsePos;
          const py = node.y + (other.y - node.y) * pulsePos;
          ctx.fillStyle = `rgba(168, 85, 247, ${alpha * 3})`;
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        node.pulse += 0.02;
        const scale = Math.sin(node.pulse) * 0.3 + 1;

        // Glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12 * scale);
        glow.addColorStop(0, "rgba(168, 85, 247, 0.15)");
        glow.addColorStop(1, "rgba(168, 85, 247, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Node
        ctx.fillStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(node.pulse) * 0.15})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mathematical symbols
      const mathSymbols = ["+", "-", "×", "÷", "=", "?", "✓", "✗"];
      mathSymbols.forEach((sym, i) => {
        const x = w * 0.1 + (i / mathSymbols.length) * w * 0.8;
        const y = h * 0.9 + Math.sin(time + i) * 5;
        ctx.fillStyle = `rgba(168, 85, 247, ${0.04 + Math.sin(time + i) * 0.02})`;
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(sym, x, y);
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
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(168,85,247,0.04), transparent)," +
            "radial-gradient(ellipse at center, transparent 50%, #020203 100%)",
        }}
      />
    </div>
  );
}

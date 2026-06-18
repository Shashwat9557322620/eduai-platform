"use client";
import { useEffect, useRef } from 'react';

interface Node { id: string; label: string; group: number; radius?: number; }
interface Link { source: string; target: string; value: number; }
interface KnowledgeGraphProps {
  data: { nodes: Node[]; links: Link[] };
  width?: number;
  height?: number;
}

export default function KnowledgeGraph({ data, width = 600, height = 400 }: KnowledgeGraphProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = ref.current;
    svg.innerHTML = '';

    // Simple force-directed layout (no d3 dependency)
    const nodes = data.nodes.map(n => ({ ...n, x: width / 2 + (Math.random() - 0.5) * 200, y: height / 2 + (Math.random() - 0.5) * 200, vx: 0, vy: 0 }));
    const links = data.links;

    const colors = ['#22d3ee', '#a855f7', '#ec4899'];
    let animFrame: number;

    function simulate() {
      // Simple force simulation
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = -200 / (dist * dist);
          nodes[i].vx += dx / dist * force;
          nodes[i].vy += dy / dist * force;
          nodes[j].vx -= dx / dist * force;
          nodes[j].vy -= dy / dist * force;
        }
      }
      // Link attraction
      for (const link of links) {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) continue;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 100) * 0.005;
        source.vx += dx / dist * force;
        source.vy += dy / dist * force;
        target.vx -= dx / dist * force;
        target.vy -= dy / dist * force;
      }
      // Center gravity
      for (const node of nodes) {
        node.vx += (width / 2 - node.x) * 0.001;
        node.vy += (height / 2 - node.y) * 0.001;
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;
      }
      render();
      animFrame = requestAnimationFrame(simulate);
    }

    function render() {
      svg.innerHTML = '';
      // Links
      for (const link of links) {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) continue;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(source.x));
        line.setAttribute('y1', String(source.y));
        line.setAttribute('x2', String(target.x));
        line.setAttribute('y2', String(target.y));
        line.setAttribute('stroke', 'rgba(34,211,238,0.2)');
        line.setAttribute('stroke-width', String(Math.sqrt(link.value)));
        svg.appendChild(line);
      }
      // Nodes
      for (const node of nodes) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${node.x},${node.y})`);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', String(node.radius || 20));
        circle.setAttribute('fill', colors[node.group % 3]);
        circle.setAttribute('opacity', '0.8');
        g.appendChild(circle);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = node.label;
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '10px');
        text.setAttribute('font-family', 'monospace');
        text.setAttribute('dy', '4');
        g.appendChild(text);
        svg.appendChild(g);
      }
    }

    simulate();
    return () => cancelAnimationFrame(animFrame);
  }, [data, width, height]);

  return <svg ref={ref} width={width} height={height} className="w-full h-full" />;
}

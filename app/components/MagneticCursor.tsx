"use client";
import { useEffect, useRef, useState, useCallback } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
  size: number;
  opacity: number;
  hue: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export default function MagneticCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const prevPos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const trailRef = useRef<TrailPoint[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseDownRef = useRef(false);
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'click' | 'text'>('default');
  const hoverElementsRef = useRef<Set<Element>>(new Set());

  const lerp = useCallback((a: number, b: number, t: number) => a + (b - a) * t, []);

  const createRipple = useCallback((x: number, y: number) => {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 3,
        color: `hsl(${180 + Math.random() * 60}, 80%, 60%)`,
      });
    }
  }, []);

  const createTrailParticle = useCallback((x: number, y: number, velocity: number) => {
    const hue = 180 + Math.sin(Date.now() * 0.001) * 40;
    trailRef.current.push({
      x,
      y,
      age: 0,
      size: Math.min(4 + velocity * 0.5, 12),
      opacity: Math.min(0.6 + velocity * 0.05, 1),
      hue,
    });
    if (trailRef.current.length > 50) {
      trailRef.current.shift();
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      prevPos.current = { ...pos.current };
      pos.current = { x: e.clientX, y: e.clientY };
      
      const dx = pos.current.x - prevPos.current.x;
      const dy = pos.current.y - prevPos.current.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);
      
      if (velocity > 2) {
        createTrailParticle(pos.current.x, pos.current.y, velocity);
      }
    };

    const onDown = (e: MouseEvent) => {
      mouseDownRef.current = true;
      setCursorState('click');
      createRipple(e.clientX, e.clientY);
    };

    const onUp = () => {
      mouseDownRef.current = false;
      setCursorState('default');
    };

    const onEnterInteractive = () => setCursorState('hover');
    const onLeaveInteractive = () => setCursorState('default');

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    const interactiveSelectors = 'a, button, [role="button"], input, textarea, select, label, [data-cursor="pointer"], .cursor-pointer';
    
    const observeInteractives = () => {
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        if (!hoverElementsRef.current.has(el)) {
          el.addEventListener('mouseenter', onEnterInteractive);
          el.addEventListener('mouseleave', onLeaveInteractive);
          hoverElementsRef.current.add(el);
        }
      });
    };
    
    observeInteractives();
    const observer = new MutationObserver(observeInteractives);
    observer.observe(document.body, { childList: true, subtree: true });

    const tick = () => {
      // Smooth ring follow
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);

      // Update main cursor elements
      if (dotRef.current) {
        const dotScale = cursorState === 'click' ? 0.5 : cursorState === 'hover' ? 1.5 : 1;
        dotRef.current.style.transform = `translate3d(${pos.current.x - 4}px, ${pos.current.y - 4}px, 0) scale(${dotScale})`;
      }
      if (ringRef.current) {
        const ringScale = cursorState === 'click' ? 0.6 : cursorState === 'hover' ? 1.8 : 1;
        const ringSize = cursorState === 'hover' ? 60 : 40;
        ringRef.current.style.transform = `translate3d(${ring.current.x - ringSize/2}px, ${ring.current.y - ringSize/2}px, 0) scale(${ringScale})`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pos.current.x - 50}px, ${pos.current.y - 50}px, 0)`;
      }

      // Canvas rendering
      if (ctx && canvas) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Draw trail
        trailRef.current.forEach((point, i) => {
          point.age += 0.02;
          const progress = point.age;
          const alpha = Math.max(0, point.opacity * (1 - progress));
          const size = point.size * (1 - progress * 0.5);

          if (alpha > 0) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${point.hue}, 80%, 60%, ${alpha * 0.4})`;
            ctx.fill();

            // Inner glow
            ctx.beginPath();
            ctx.arc(point.x, point.y, size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${point.hue}, 90%, 70%, ${alpha * 0.6})`;
            ctx.fill();
          }
        });

        // Clean up dead trail points
        trailRef.current = trailRef.current.filter(p => p.age < 1);

        // Draw and update particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.life -= 0.02;

          if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('hsl', 'hsla');
            ctx.fill();
          }
        });

        // Clean up dead particles
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);

        // Draw connecting lines between trail points
        if (trailRef.current.length > 1) {
          ctx.beginPath();
          ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
          for (let i = 1; i < trailRef.current.length; i++) {
            const p = trailRef.current[i];
            ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      hoverElementsRef.current.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterInteractive);
        el.removeEventListener('mouseleave', onLeaveInteractive);
      });
    };
  }, [lerp, createRipple, createTrailParticle, cursorState]);

  const getCursorColor = () => {
    switch (cursorState) {
      case 'hover': return 'from-cyan-400 to-purple-500';
      case 'click': return 'from-pink-400 to-red-500';
      case 'text': return 'from-blue-400 to-cyan-400';
      default: return 'from-cyan-400 to-blue-500';
    }
  };

  const getGlowColor = () => {
    switch (cursorState) {
      case 'hover': return 'rgba(168, 85, 247, 0.3)';
      case 'click': return 'rgba(236, 72, 153, 0.4)';
      case 'text': return 'rgba(59, 130, 246, 0.3)';
      default: return 'rgba(34, 211, 238, 0.2)';
    }
  };

  return (
    <>
      {/* Canvas for trail particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[996] pointer-events-none"
        style={{ willChange: 'transform' }}
      />

      {/* Outer glow */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 z-[997] pointer-events-none w-[100px] h-[100px] rounded-full mix-blend-screen transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${getGlowColor()}, transparent 70%)`,
          willChange: 'transform',
        }}
      />

      {/* Main cursor dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 z-[999] pointer-events-none w-2 h-2 rounded-full bg-gradient-to-r ${getCursorColor()} mix-blend-difference transition-all duration-150`}
        style={{
          willChange: 'transform',
          boxShadow: `0 0 10px ${getGlowColor()}, 0 0 20px ${getGlowColor()}`,
        }}
      />

      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[998] pointer-events-none rounded-full mix-blend-difference transition-all duration-300"
        style={{
          width: cursorState === 'hover' ? '60px' : '40px',
          height: cursorState === 'hover' ? '60px' : '40px',
          border: `1.5px solid ${cursorState === 'hover' ? 'rgba(168, 85, 247, 0.6)' : cursorState === 'click' ? 'rgba(236, 72, 153, 0.6)' : 'rgba(255, 255, 255, 0.3)'}`,
          boxShadow: `0 0 15px ${getGlowColor()}, inset 0 0 15px ${getGlowColor()}`,
          willChange: 'transform',
          transform: `translate3d(${ring.current.x - 20}px, ${ring.current.y - 20}px, 0)`,
        }}
      />

      {/* Click ripple effect */}
      {cursorState === 'click' && (
        <div
          className="fixed z-[995] pointer-events-none animate-ping"
          style={{
            left: pos.current.x - 20,
            top: pos.current.y - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid rgba(236, 72, 153, 0.5)',
          }}
        />
      )}
    </>
  );
}
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

// --- Types & Constants ---
type CursorMode = 'default' | 'hover' | 'click' | 'text' | 'magnetic' | 'loading';

type Point = { x: number; y: number };

const LERP = {
  ring: 0.18,
  halo: 0.08,
  glow: 0.04
};

const TRAIL_LIFETIME = 300; // ms
const VELOCITY_THRESHOLD = 15; // pixels per frame roughly

export default function CursorSystem() {
  const [mode, setMode] = useState<CursorMode>('default');
  const [label, setLabel] = useState<string | null>(null);
  const [isHoverDevice, setIsHoverDevice] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const pathname = usePathname();

  const shouldReduceMotion = useReducedMotion();

  // DOM Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Physics State (Mutable to avoid re-renders)
  const state = useRef({
    target: { x: -100, y: -100 },
    ring: { x: -100, y: -100 },
    halo: { x: -100, y: -100 },
    glow: { x: -100, y: -100 },
    lastTarget: { x: -100, y: -100 },
    magneticCenter: null as Point | null,
    magneticElement: null as HTMLElement | null,
    trails: [] as { x: number, y: number, birth: number }[],
    mode: 'default' as CursorMode,
    isDown: false,
    label: null as string | null
  });

  const rafId = useRef<number>(0);

  // 1. Device Detection
  useEffect(() => {
    const checkDevice = () => {
      setIsHoverDevice(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 2. Main Physics Loop
  useEffect(() => {
    if (!isHoverDevice || shouldReduceMotion) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const s = state.current;
      const dt = time - lastTime;
      lastTime = time;

      // Update actual target (incorporate magnetic pull if active)
      let currentTarget = { ...s.target };
      if (s.mode === 'magnetic' && s.magneticCenter) {
        // Strong pull towards center
        currentTarget.x = s.target.x + (s.magneticCenter.x - s.target.x) * 0.5;
        currentTarget.y = s.target.y + (s.magneticCenter.y - s.target.y) * 0.5;
      } else if (s.magneticElement) {
        // Release magnetic element
        s.magneticElement.style.transform = `translate(0px, 0px)`;
        s.magneticElement = null;
      }

      // Lerp calculations
      s.ring.x += (currentTarget.x - s.ring.x) * LERP.ring;
      s.ring.y += (currentTarget.y - s.ring.y) * LERP.ring;
      
      s.halo.x += (currentTarget.x - s.halo.x) * LERP.halo;
      s.halo.y += (currentTarget.y - s.halo.y) * LERP.halo;

      s.glow.x += (currentTarget.x - s.glow.x) * LERP.glow;
      s.glow.y += (currentTarget.y - s.glow.y) * LERP.glow;

      // Velocity for trail
      const dx = currentTarget.x - s.lastTarget.x;
      const dy = currentTarget.y - s.lastTarget.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);

      if (velocity > VELOCITY_THRESHOLD && s.mode !== 'text' && !s.isDown) {
        s.trails.push({ x: currentTarget.x, y: currentTarget.y, birth: time });
      }

      s.lastTarget = { ...currentTarget };

      // Write CSS Variables
      if (containerRef.current) {
        const style = containerRef.current.style;
        style.setProperty('--tx', `${currentTarget.x}px`);
        style.setProperty('--ty', `${currentTarget.y}px`);
        style.setProperty('--rx', `${s.ring.x}px`);
        style.setProperty('--ry', `${s.ring.y}px`);
        style.setProperty('--hx', `${s.halo.x}px`);
        style.setProperty('--hy', `${s.halo.y}px`);
        style.setProperty('--gx', `${s.glow.x}px`);
        style.setProperty('--gy', `${s.glow.y}px`);
      }

      // Draw Canvas Trail
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Filter alive trails
          s.trails = s.trails.filter(t => time - t.birth < TRAIL_LIFETIME);
          
          for (let i = 0; i < s.trails.length; i++) {
            const t = s.trails[i];
            const age = time - t.birth;
            const progress = age / TRAIL_LIFETIME;
            const radius = 3 * (1 - progress);
            const alpha = 0.5 * (1 - progress);
            
            ctx.beginPath();
            ctx.arc(t.x, t.y, Math.max(0.1, radius), 0, Math.PI * 2);
            // Cyan to Indigo gradient feel based on index
            ctx.fillStyle = `rgba(${34 + 29 * progress}, ${211 - 145 * progress}, ${238 + 3 * progress}, ${alpha})`;
            ctx.fill();
          }
        }
      }

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(rafId.current);
  }, [isHoverDevice, shouldReduceMotion]);

  // 3. Canvas Resizing
  useEffect(() => {
    if (!isHoverDevice || shouldReduceMotion) return;
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isHoverDevice, shouldReduceMotion]);

  // 4. Context Detection & Event Listeners
  useEffect(() => {
    if (!isHoverDevice || shouldReduceMotion) return;

    const s = state.current;

    const onMouseMove = (e: MouseEvent) => {
      if (!hasEntered) setHasEntered(true);
      s.target = { x: e.clientX, y: e.clientY };

      // Determine Context
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!el) return;

      // If dragging/clicking
      if (s.isDown) return;

      let newMode: CursorMode = 'default';
      let newLabel: string | null = null;

      const interactive = el.closest('a, button, [role="button"], input, textarea, select, label, [data-cursor]');
      
      if (interactive) {
        const tagName = interactive.tagName.toLowerCase();
        const dataCursor = interactive.getAttribute('data-cursor');
        
        if (dataCursor === 'magnetic') {
          newMode = 'magnetic';
          const rect = interactive.getBoundingClientRect();
          s.magneticCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          s.magneticElement = interactive as HTMLElement;
          
          // Magnetic element shift
          const dx = e.clientX - s.magneticCenter.x;
          const dy = e.clientY - s.magneticCenter.y;
          s.magneticElement.style.transform = `translate(${dx * 0.1}px, ${dy * 0.1}px)`;
        } 
        else if (tagName === 'input' || tagName === 'textarea' || window.getComputedStyle(el).cursor === 'text') {
          newMode = 'text';
        } 
        else {
          newMode = 'hover';
          if (dataCursor && dataCursor !== 'true') {
            newLabel = dataCursor;
          } else if (tagName === 'a') {
            newLabel = 'GO';
          } else if (tagName === 'button') {
            // Only use inner text if it's short and mostly text
            const text = (interactive as HTMLElement).innerText?.trim();
            newLabel = text && text.length < 10 ? text : 'CLICK';
          } else {
            newLabel = 'EXPLORE';
          }
        }
      } else {
        // Reset magnetic
        s.magneticCenter = null;
        if (s.magneticElement) {
          s.magneticElement.style.transform = 'translate(0, 0)';
          s.magneticElement = null;
        }
      }

      if (s.mode !== newMode) {
        s.mode = newMode;
        setMode(newMode);
      }
      if (s.label !== newLabel) {
        s.label = newLabel;
        setLabel(newLabel);
      }
    };

    const onMouseDown = () => {
      s.isDown = true;
      s.mode = 'click';
      setMode('click');
      
      // Emit ripple dots
      const t = performance.now();
      for(let i=0; i<3; i++) {
        s.trails.push({ 
          x: s.target.x + (Math.random() - 0.5) * 20, 
          y: s.target.y + (Math.random() - 0.5) * 20, 
          birth: t 
        });
      }
    };

    const onMouseUp = () => {
      s.isDown = false;
      // Re-trigger context detection
      const e = new MouseEvent('mousemove', { clientX: s.target.x, clientY: s.target.y });
      onMouseMove(e);
    };

    const onMouseLeave = () => setHasEntered(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isHoverDevice, shouldReduceMotion, hasEntered]);

  // Page Transition compression
  useEffect(() => {
    setHasEntered(false);
    setTimeout(() => setHasEntered(true), 300);
  }, [pathname]);


  // Render logic
  if (!isHoverDevice) return null;

  if (shouldReduceMotion) {
    // Only render the core dot
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
      >
        <div className="absolute w-[5px] h-[5px] bg-white rounded-full translate-x-[var(--tx)] translate-y-[var(--ty)] -ml-[2.5px] -mt-[2.5px]" />
      </div>
    );
  }

  // Generate CSS classes based on mode
  const isHover = mode === 'hover' || mode === 'magnetic';
  const isClick = mode === 'click';
  const isText = mode === 'text';
  const isMagnetic = mode === 'magnetic';
  const isLoading = mode === 'loading';

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-500 ${hasEntered ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Layer 5: Canvas Trail */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Layer 4: Ambient Glow */}
      <div 
        className={`absolute rounded-full transition-all duration-700 ease-out translate-x-[var(--gx)] translate-y-[var(--gy)]
          ${isHover ? 'w-[200px] h-[200px] -ml-[100px] -mt-[100px] opacity-100' : 
            isText ? 'w-[60px] h-[60px] -ml-[30px] -mt-[30px] opacity-10' :
            'w-[120px] h-[120px] -ml-[60px] -mt-[60px] opacity-60'}
        `}
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          willChange: 'transform, width, height'
        }}
      />

      {/* Layer 3: Outer Halo (Counter-clockwise rotation) */}
      <div 
        className={`absolute flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] translate-x-[var(--hx)] translate-y-[var(--hy)]
          ${isHover ? 'w-[72px] h-[72px] -ml-[36px] -mt-[36px] border-cyan-400 opacity-100 rounded-full border-[1px]' : 
            isMagnetic ? 'w-[100px] h-[100px] -ml-[50px] -mt-[50px] border-cyan-400 opacity-30 rounded-full border-[1px]' :
            isClick ? 'w-[40px] h-[40px] -ml-[20px] -mt-[20px] border-cyan-400 opacity-50 rounded-full border-[1px]' :
            isText ? 'w-0 h-0 opacity-0' :
            'w-[48px] h-[48px] -ml-[24px] -mt-[24px] border-cyan-400/30 rounded-full border-[1px]'}
        `}
        style={{ willChange: 'transform, width, height, opacity' }}
      >
        <div className="w-full h-full animate-[spin_5s_linear_infinite_reverse] rounded-full absolute inset-0 border-inherit" />
        
        {/* Label */}
        <span 
          className={`absolute text-[8px] tracking-[0.2em] font-light uppercase text-cyan-200 transition-opacity duration-300 delay-100
            ${isHover && label ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {label}
        </span>
      </div>

      {/* Layer 2: Inner Ring (Clockwise rotation) */}
      <div 
        className={`absolute transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] translate-x-[var(--rx)] translate-y-[var(--ry)]
          ${isHover ? 'w-[36px] h-[36px] -ml-[18px] -mt-[18px] rounded-full border-indigo-500 border-[1.5px] animate-[spin_1s_linear_infinite]' : 
            isClick ? 'w-[14px] h-[14px] -ml-[7px] -mt-[7px] rounded-full border-indigo-500 border-[1.5px]' :
            isText ? 'w-[2px] h-[20px] -ml-[1px] -mt-[10px] rounded-none bg-indigo-500 border-none' :
            isLoading ? 'w-[20px] h-[20px] -ml-[10px] -mt-[10px] rounded-full border-indigo-500 border-[1.5px] border-t-transparent animate-spin' :
            'w-[20px] h-[20px] -ml-[10px] -mt-[10px] rounded-full border-[#6366f1] border-[1.5px] animate-[spin_3s_linear_infinite]'}
        `}
        style={{ willChange: 'transform, width, height, border-radius' }}
      />

      {/* Layer 1: Core Dot */}
      <div 
        className={`absolute transition-all duration-300 translate-x-[var(--tx)] translate-y-[var(--ty)]
          ${isHover ? 'w-[8px] h-[8px] -ml-[4px] -mt-[4px] bg-cyan-400 rounded-full' : 
            isClick ? 'w-[3px] h-[3px] -ml-[1.5px] -mt-[1.5px] bg-white rounded-full' :
            isText ? 'w-0 h-0 opacity-0' :
            'w-[5px] h-[5px] -ml-[2.5px] -mt-[2.5px] bg-white rounded-full'}
        `}
        style={{ willChange: 'transform, width, height, background-color' }}
      />
    </div>
  );
}

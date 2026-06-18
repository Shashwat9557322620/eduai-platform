'use client';
import { useRef, useEffect } from 'react';

export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      el.style.transform = `translate(${(e.clientX - cx) * strength}px, ${(e.clientY - cy) * strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = 'translate(0,0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [strength]);
  return ref;
}

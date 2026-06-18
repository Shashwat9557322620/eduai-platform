'use client';
import { useEffect } from 'react';

export function useParallax() {
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      document.querySelectorAll('.parallax-slow').forEach(el => { (el as HTMLElement).style.transform = `translate3d(0, ${y * 0.15}px, 0)`; });
      document.querySelectorAll('.parallax-fast').forEach(el => { (el as HTMLElement).style.transform = `translate3d(0, ${y * 0.3}px, 0)`; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

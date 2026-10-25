"use client";

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from 'framer-motion';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mobile check removed to allow smooth scrolling on all devices
  }, []);

  useEffect(() => {
    // Disable Lenis ONLY for users who explicitly request reduced motion
    if (shouldReduceMotion) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2, // Only applies if it's a touch laptop that still gets lenis
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [shouldReduceMotion, isMobile]);

  return <>{children}</>;
}

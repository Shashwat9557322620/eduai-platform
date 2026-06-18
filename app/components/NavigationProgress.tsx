"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";

/**
 * NavigationProgress — thin top bar that tracks Next.js route changes.
 * Animates 0→70% quickly, then shoots to 100% on completion, then fades.
 * Uses CSS transforms only (no width animation) for 60fps performance.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
  };

  // Start progress when pathname changes
  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    if (shouldReduceMotion) return;

    clear();
    setVisible(true);
    setProgress(0);

    // Quickly jump to ~15% then ease to 70%
    requestAnimationFrame(() => {
      setProgress(15);
      timerRef.current = setTimeout(() => setProgress(70), 150);
    });

    // After transition completes, shoot to 100% and fade out
    timerRef.current = setTimeout(() => {
      setProgress(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }, 400);

    return clear;
  }, [pathname, shouldReduceMotion]);

  if (!visible || shouldReduceMotion) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #6366f1, #22d3ee, #a855f7)",
          transition:
            progress === 100
              ? "width 0.3s cubic-bezier(0.22,1,0.36,1)"
              : "width 0.6s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 0 12px rgba(99,102,241,0.8), 0 0 24px rgba(34,211,238,0.4)",
          animation: "nprogress-glow 1.5s ease-in-out infinite",
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}

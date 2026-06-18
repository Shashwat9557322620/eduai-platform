"use client";
import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * useScrollReveal — returns a ref and Framer Motion animation props.
 * Triggers once when the element enters viewport.
 * Respects prefers-reduced-motion: falls back to simple opacity fade.
 *
 * Usage:
 * const { ref, initial, animate, transition } = useScrollReveal();
 * <motion.div ref={ref} initial={initial} animate={animate} transition={transition}>
 */
export function useScrollReveal(threshold: number = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const initial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 28, filter: "blur(4px)" };

  const animate = inView
    ? { opacity: 1, y: 0, filter: "blur(0px)" }
    : initial;

  const transition = {
    duration: shouldReduceMotion ? 0.3 : 0.8,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  return { ref, initial, animate, transition, inView };
}

"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useAnimation, useReducedMotion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "glass";
  strength?: number;
}

export function MagneticButton({ children, className, variant = "primary", strength = 30, ...props }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile || prefersReducedMotion) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * (strength / width), y: middleY * (strength / height) });
  };

  const handleMouseLeave = () => {
    if (isMobile || prefersReducedMotion) return;
    setPosition({ x: 0, y: 0 });
    controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
  };

  const variants = {
    primary: "bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]",
    ghost: "bg-transparent text-white border border-white/20 hover:bg-white/5",
    glass: "bg-white/[0.03] text-white border border-white/10 backdrop-blur-md hover:bg-white/[0.08]"
  };

  return (
    <motion.button
      suppressHydrationWarning
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      whileTap={{ scale: 0.95, transition: { stiffness: 400, damping: 25 } }}
      className={cn(
        "relative rounded-full px-6 py-3 font-semibold uppercase tracking-wider text-sm transition-colors duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

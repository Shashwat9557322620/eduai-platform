"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  staggerDelay?: number;
  type?: "text" | "card" | "number";
  className?: string;
  delay?: number;
}

export function ScrollReveal({
  children,
  staggerDelay = 0.08,
  type = "text",
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariantsText = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const itemVariantsCard = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const itemVariantsNumber = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: "easeOut" as const },
    },
  };

  const getVariants = () => {
    switch (type) {
      case "card":
        return itemVariantsCard;
      case "number":
        return itemVariantsNumber;
      default:
        return itemVariantsText;
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {/* 
        This is a container that expects motion.div children. 
        If children are not motion elements, we map over them and wrap them.
      */}
      {Array.isArray(children) ? (
        children.map((child, idx) => (
          <motion.div key={idx} variants={getVariants()}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={getVariants()}>{children}</motion.div>
      )}
    </motion.div>
  );
}

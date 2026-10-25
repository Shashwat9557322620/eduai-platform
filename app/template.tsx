"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import HolographicLoader from "./components/HolographicLoader";

// Module-level flag — persists across soft navigations within the same JS session
// Resets only on full page reload (unlike sessionStorage which can be cleared)
let hasBooted = false;

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
    transitionEnd: {
      filter: "none",
      transform: "none",
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(4px)",
    transition: {
      duration: 0.3,
      ease: "easeIn" as const,
    },
  },
};

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // If already booted in this JS session, start as false immediately
  const [loading, setLoading] = useState(!hasBooted);

  useEffect(() => {
    // Check sessionStorage as a secondary signal
    const hasVisited = sessionStorage.getItem("eduai-booted");
    if (hasVisited || hasBooted) {
      hasBooted = true;
      setLoading(false);
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem("eduai-booted", "1");
    hasBooted = true;
    setLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: "fixed", inset: 0, zIndex: 9999 }}
          >
            <HolographicLoader onComplete={handleBootComplete} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

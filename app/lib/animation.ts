/**
 * EduAI — Central Animation Configuration
 * All Framer Motion variants, spring presets, and easing curves live here.
 * Import from this file in every component — never define ad-hoc variants.
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Easing Curves ────────────────────────────────────────────────────────────

export const ease = {
  /** Apple-like smooth deceleration */
  cinematic: [0.16, 1, 0.3, 1] as const,
  /** General smooth in-out */
  smooth: [0.4, 0, 0.2, 1] as const,
  /** Entrance — fast in, gentle settle */
  entrance: [0.22, 1, 0.36, 1] as const,
  /** Exit — quick elegant departure */
  exit: [0.4, 0, 1, 1] as const,
  /** Spring-feel without overshoot */
  spring: [0.34, 1.56, 0.64, 1] as const,
} as const;

// ─── Duration Constants ───────────────────────────────────────────────────────

export const duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  medium: 0.4,
  slow: 0.5,
  xslow: 0.7,
  cinematic: 0.9,
} as const;

// ─── Spring Presets (for use in transition objects) ───────────────────────────

export const spring = {
  /** Smooth, no overshoot — navigation, layout */
  smooth: { type: 'spring', stiffness: 300, damping: 35, mass: 0.8 } as const,
  /** Snappy response — buttons, small elements */
  snappy: { type: 'spring', stiffness: 500, damping: 40, mass: 0.6 } as const,
  /** Bouncy — avatars, icons, badges */
  bouncy: { type: 'spring', stiffness: 400, damping: 20, mass: 0.8 } as const,
  /** Slow settle — hero elements, large cards */
  slow: { type: 'spring', stiffness: 150, damping: 30, mass: 1 } as const,
} as const;

// ─── Page Transition ─────────────────────────────────────────────────────────

/** Cinematic blur-fade page transition (~0.4s) */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: duration.medium,
      ease: ease.entrance,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(4px)',
    transition: {
      duration: duration.normal,
      ease: ease.exit,
    },
  },
};

// ─── Stagger Container ────────────────────────────────────────────────────────

/** Wrap lists of items. Controls stagger delay between children. */
export function staggerContainer(
  staggerChildren = 0.08,
  delayChildren = 0.1
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

// ─── Item Variants ────────────────────────────────────────────────────────────

/** Fade up from below with blur clearing — the core reveal animation */
export const fadeUpItem: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: duration.cinematic,
      ease: ease.cinematic,
    },
  },
};

/** Fade in only — for reduced-motion fallback */
export const fadeInItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: ease.smooth },
  },
};

/** Slide in from right — user chat messages */
export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.normal, ease: ease.entrance },
  },
};

/** Slide up — AI chat messages */
export const slideUpFade: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: ease.entrance },
  },
};

/** Card lift on scroll reveal */
export const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
    scale: 0.97,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: duration.cinematic,
      ease: ease.cinematic,
    },
  },
};

/** Section heading reveal */
export const headingReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.cinematic },
  },
};

// ─── Word-by-word Animation ───────────────────────────────────────────────────

/** Container for word-by-word headline animation */
export const wordContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/** Individual word — blur-up reveal */
export const wordReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: ease.cinematic,
    },
  },
};

// ─── Overlay / Mobile Menu ────────────────────────────────────────────────────

/** Full-screen overlay entrance */
export const overlayVariants: Variants = {
  hidden: {
    clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)',
    opacity: 0,
  },
  visible: {
    clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)',
    opacity: 1,
    transition: {
      clipPath: { duration: 0.5, ease: ease.cinematic },
      opacity: { duration: 0.1 },
    },
  },
  exit: {
    clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)',
    opacity: 0,
    transition: {
      clipPath: { duration: 0.4, ease: ease.exit },
      opacity: { duration: 0.2, delay: 0.2 },
    },
  },
};

/** Staggered mobile nav links */
export const mobileNavContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

export const mobileNavItem: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: ease.entrance },
  },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

// ─── Transition Helpers ───────────────────────────────────────────────────────

/** Quick spring transition for small interactive elements */
export const quickSpring: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 40,
};

/** Smooth layout transition for animated pills / layoutId elements */
export const layoutTransition: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 35,
};

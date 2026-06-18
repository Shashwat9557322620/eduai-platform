"use client";

import { useState } from 'react';

/**
 * Skip-to-content link for keyboard accessibility.
 * Visually hidden until focused via Tab key.
 * Allows keyboard users to bypass navigation and jump to main content.
 */
export default function SkipToContent() {
  const [focused, setFocused] = useState(false);

  return (
    <a
      href="#main-content"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`fixed top-4 left-4 z-[9999] px-6 py-3 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#020203]
        ${focused ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}
      style={{ willChange: 'transform, opacity' }}
    >
      Skip to main content
    </a>
  );
}

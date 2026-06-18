"use client";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  overlayVariants,
  mobileNavContainer,
  mobileNavItem,
  quickSpring,
} from "../lib/animation";

const NAV_LINKS = [
  { href: "/optimizer", label: "Optimizer", color: "#22d3ee" },
  { href: "/flashcards", label: "Flashcards", color: "#c084fc" },
  { href: "/analyzer", label: "Skill Gap", color: "#f472b6" },
  { href: "/tutor", label: "AI Tutor", color: "#4ade80" },
  { href: "/groups", label: "Groups", color: "#fbbf24" },
  { href: "/blog", label: "Blog", color: "#4ade80" },
] as const;

function useTrapFocus(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const el = ref.current;
    const focusable = Array.from(
      el.querySelectorAll<HTMLElement>(focusableSelectors)
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Focus first element when menu opens
    setTimeout(() => first?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  return ref;
}

export default function Navbar() {
  const { userId } = useAuth();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [scrollY, setScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const trapRef = useTrapFocus(mobileOpen);
  const lastScrollY = useRef(0);
  const [visible, setVisible] = useState(true);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    // Hide navbar when scrolling down fast, show when scrolling up
    if (y > lastScrollY.current + 8 && y > 80) {
      setVisible(false);
    } else if (y < lastScrollY.current - 4) {
      setVisible(true);
    }
    lastScrollY.current = y;
    setScrollY(y);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Compute scroll-driven glass intensity (0 at top, 1 at 100px+ scroll)
  const scrollProgress = Math.min(scrollY / 100, 1);
  const bgOpacity = 0.4 + scrollProgress * 0.45;
  const blurAmount = 12 + scrollProgress * 20;

  const activeColor = (href: string) => {
    const link = NAV_LINKS.find((l) => l.href === href);
    return link?.color ?? "#22d3ee";
  };

  // Reduced-motion: skip clip-path animation, use simple fade
  const resolvedOverlayVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : overlayVariants;

  return (
    <>
      {/* ── Floating Navbar ──────────────────────────────────────── */}
      <motion.nav
        aria-label="Main navigation"
        role="navigation"
        animate={{
          y: visible ? 0 : -120,
          opacity: visible ? 1 : 0,
        }}
        transition={quickSpring}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl"
        style={{ willChange: "transform, opacity" }}
      >
        <div
          className="rounded-2xl border transition-all duration-300"
          style={{
            background: `rgba(2, 2, 3, ${bgOpacity})`,
            backdropFilter: `blur(${blurAmount}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${blurAmount}px) saturate(180%)`,
            borderColor:
              scrollProgress > 0.3
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.05)",
            boxShadow:
              scrollProgress > 0.2
                ? "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.05)"
                : "none",
          }}
        >
          <div className="px-4 md:px-5 h-14 flex items-center justify-between gap-3">
            {/* Logo */}
            <Link
              href="/"
              aria-label="EduAI Home"
              className="group flex items-center gap-2 shrink-0 hover:scale-105 transition-transform duration-300"
            >
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center group-hover:border-cyan-500/30 transition-all duration-300">
                <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                  E
                </span>
              </div>
              <span className="text-lg font-black tracking-tighter text-white">
                Edu
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                  AI.
                </span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div
              suppressHydrationWarning
              className="hidden md:flex items-center gap-0.5 flex-1 justify-center"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    suppressHydrationWarning
                    aria-current={isActive ? "page" : undefined}
                    className="relative px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-colors duration-200 group"
                    style={{ color: isActive ? link.color : undefined }}
                  >
                    {/* Hover bg */}
                    <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-200" />

                    <span
                      className="relative"
                      style={{
                        color: isActive ? link.color : "rgba(255,255,255,0.55)",
                        textShadow: isActive
                          ? `0 0 12px ${link.color}99`
                          : undefined,
                      }}
                    >
                      {link.label}
                    </span>

                    {/* Animated underline from center */}
                    <span
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[1.5px] rounded-full transition-all duration-300"
                      style={{
                        width: isActive ? "60%" : "0%",
                        backgroundColor: link.color,
                        boxShadow: isActive ? `0 0 6px ${link.color}` : "none",
                      }}
                    />

                    {/* Hover underline */}
                    {!isActive && (
                      <span
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[1.5px] rounded-full bg-white/25 transition-all duration-300"
                        style={{ width: "0%" }}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}

              <div className="w-px h-4 bg-white/[0.08] mx-1" />

              {userId && (
                <>
                  <Link
                    href="/dashboard"
                    suppressHydrationWarning
                    className="relative px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-colors duration-200"
                    style={{
                      color: pathname?.startsWith("/dashboard")
                        ? "#22d3ee"
                        : "rgba(255,255,255,0.55)",
                    }}
                    aria-current={
                      pathname?.startsWith("/dashboard") ? "page" : undefined
                    }
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/podcast"
                    suppressHydrationWarning
                    className="relative px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-colors duration-200"
                    style={{
                      color: pathname?.startsWith("/podcast")
                        ? "#fb923c"
                        : "rgba(255,255,255,0.55)",
                    }}
                  >
                    Podcast
                  </Link>
                </>
              )}

              {userId && userId === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
                <Link
                  href="/admin"
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    pathname?.startsWith("/admin")
                      ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                      : "text-gray-400 hover:text-amber-400 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Admin
                  </span>
                </Link>
              )}
            </div>

            {/* Right Section */}
            <div
              className="flex items-center gap-2 md:gap-3 shrink-0"
              role="group"
              aria-label="Account actions"
            >
              {/* Tour Button */}
              <button
                suppressHydrationWarning
                onClick={() => {
                  localStorage.removeItem("eduai_tour_seen");
                  window.dispatchEvent(new CustomEvent("eduai:tour:trigger"));
                }}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
                title="Restart Onboarding Tour"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tour
              </button>

              {/* PRO Button */}
              <Link href="/billing">
                <button
                  suppressHydrationWarning
                  className="relative group overflow-hidden rounded-full p-[1.5px] focus:outline-none active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-0.5"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#050505] px-3.5 md:px-4 py-1.5 text-xs font-black text-white transition-colors group-hover:bg-[#0a0a0f]">
                    <span className="tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mr-1.5">
                      PRO
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500 shadow-[0_0_10px_#d946ef]" />
                    </span>
                  </span>
                </button>
              </Link>

              {/* Auth */}
              {!userId ? (
                <>
                  <SignInButton mode="modal">
                    <button
                      suppressHydrationWarning
                      className="hidden md:block text-sm font-semibold text-gray-400 hover:text-white transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
                    >
                      Log In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      suppressHydrationWarning
                      className="relative px-4 py-1.5 text-xs md:text-sm font-bold text-black bg-white rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-1.5 group"
                    >
                      Sign Up
                      <svg
                        className="hidden md:block w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <div className="p-[2px] rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 hover:from-cyan-500/50 hover:to-purple-500/50 transition-all duration-300">
                  <UserButton
                    appearance={{ elements: { avatarBox: "w-7 h-7 md:w-8 md:h-8" } }}
                  />
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                suppressHydrationWarning
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all duration-200"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                <div className="w-4 h-3 flex flex-col justify-between">
                  <motion.span
                    className="block h-[1.5px] rounded-full bg-white origin-left"
                    animate={
                      mobileOpen
                        ? { rotate: 45, y: 0, width: "100%" }
                        : { rotate: 0, y: 0 }
                    }
                    transition={quickSpring}
                  />
                  <motion.span
                    className="block h-[1.5px] rounded-full bg-white"
                    animate={mobileOpen ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="block h-[1.5px] rounded-full bg-white origin-left"
                    animate={
                      mobileOpen
                        ? { rotate: -45, y: 0, width: "100%" }
                        : { rotate: 0, y: 0 }
                    }
                    transition={quickSpring}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Full-Screen Overlay ───────────────────────────── */}
      <AnimatePresence mode="wait">
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            ref={trapRef}
            role="dialog"
            aria-label="Mobile navigation menu"
            aria-modal="true"
            className="fixed inset-0 z-40 md:hidden"
            variants={resolvedOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Dark backdrop */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "rgba(2, 2, 3, 0.96)",
                backdropFilter: "blur(32px) saturate(180%)",
                WebkitBackdropFilter: "blur(32px) saturate(180%)",
              }}
            />

            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all duration-200"
              aria-label="Close menu"
            >
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                animate={mobileOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </motion.svg>
            </button>

            {/* Links */}
            <motion.nav
              className="absolute inset-0 flex flex-col items-start justify-center px-8 gap-2"
              variants={mobileNavContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <motion.div key={link.href} variants={mobileNavItem}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 py-3 text-3xl font-black tracking-tight transition-all duration-200 hover:pl-2"
                      style={{ color: isActive ? link.color : "rgba(255,255,255,0.7)" }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                      {isActive && (
                        <span
                          className="text-xs font-mono px-2 py-1 rounded-full border"
                          style={{
                            color: link.color,
                            borderColor: `${link.color}40`,
                            background: `${link.color}15`,
                          }}
                        >
                          Active
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {userId && (
                <>
                  <motion.div variants={mobileNavItem}>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 py-3 text-3xl font-black tracking-tight text-white/70 hover:text-cyan-400 hover:pl-2 transition-all duration-200"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div variants={mobileNavItem}>
                    <Link
                      href="/podcast"
                      className="flex items-center gap-3 py-3 text-3xl font-black tracking-tight text-white/70 hover:text-orange-400 hover:pl-2 transition-all duration-200"
                      onClick={() => setMobileOpen(false)}
                    >
                      Podcast
                    </Link>
                  </motion.div>
                </>
              )}

              <motion.div
                variants={mobileNavItem}
                className="mt-4 pt-4 border-t border-white/[0.06] w-full"
              >
                {!userId ? (
                  <div className="flex gap-3">
                    <SignInButton mode="modal">
                      <button className="px-6 py-3 text-sm font-bold text-white/70 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-all min-h-[44px]">
                        Log In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="px-6 py-3 text-sm font-bold text-black bg-white rounded-xl hover:bg-gray-100 transition-all min-h-[44px]">
                        Sign Up Free
                      </button>
                    </SignUpButton>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <UserButton
                      appearance={{ elements: { avatarBox: "w-10 h-10" } }}
                    />
                    <Link
                      href="/billing"
                      className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all min-h-[44px] flex items-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Upgrade to PRO
                    </Link>
                  </div>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

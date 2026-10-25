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
import { Settings } from "lucide-react";
import SettingsModal from "./SettingsModal";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  overlayVariants,
  mobileNavContainer,
  mobileNavItem,
  quickSpring,
} from "../lib/animation";

const NAV_LINKS = [
  { href: "/optimizer", label: "Optimizer" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/analyzer", label: "Skill Gap" },
  { href: "/tutor", label: "AI Tutor" },
  { href: "/blog", label: "Blog" },
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const trapRef = useTrapFocus(mobileOpen);

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const resolvedOverlayVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : overlayVariants;

  return (
    <>
      <motion.nav
        aria-label="Main navigation"
        role="navigation"
        animate={{ y: 0, opacity: 1 }}
        transition={quickSpring}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] lg:w-max"
        style={{ willChange: "transform, opacity" }}
      >
        <div className={`rounded-full nav-pill-glass transition-all duration-500 ${scrollY > 20 ? 'scrolled' : ''}`}>
          <div className="px-5 lg:px-8 h-[56px] flex items-center justify-between gap-6 lg:gap-8">
            
            {/* Logo */}
            <Link
              href="/"
              aria-label="EduAI Home"
              className="group flex items-center gap-2.5 shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00c6ff] to-[#0072ff] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                <span className="text-[14px] font-black text-white leading-none tracking-tighter">
                  E
                </span>
              </div>
              <span className="text-[18px] font-bold tracking-tight animate-text-fill-empty">
                EduAI
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1.5 flex-1 justify-center whitespace-nowrap">
              {NAV_LINKS.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-2 text-[14px] font-medium rounded-full transition-all duration-200 group underline-sweep text-gray-300 hover:text-white ${isActive ? 'nav-active-glow text-white' : ''}`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-white/[0.07] border border-white/[0.08]" />
                    )}
                    {!isActive && (
                      <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-200" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-5 shrink-0">
              
              {/* PRO Button */}
              <Link href="/billing" className="hidden lg:block">
                <button
                  suppressHydrationWarning
                  className="relative group overflow-hidden rounded-full p-[1.5px] focus:outline-none active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 cursor-pointer"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#050505] px-3 md:px-4 py-1.5 text-xs font-black text-white transition-colors group-hover:bg-[#0a0a0f]">
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

              {!userId ? (
                <div className="hidden lg:flex items-center gap-5">
                  <div className="w-[1px] h-4 bg-white/20" />
                  <SignInButton mode="modal">
                    <button suppressHydrationWarning className="text-[14px] font-medium text-gray-300 hover:text-white transition-colors duration-200">
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button suppressHydrationWarning className="px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-300">
                      Sign up
                    </button>
                  </SignUpButton>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="hidden lg:block w-[1px] h-4 bg-white/20" />
                  <Link href="/dashboard" className="hidden lg:block text-[14px] font-medium text-gray-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white transition-colors p-1" aria-label="Settings">
                    <Settings className="w-5 h-5" />
                  </button>
                  <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors duration-200"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                <div className="w-4 h-3 flex flex-col justify-between">
                  <motion.span
                    className="block h-[1.5px] rounded-full bg-white origin-left"
                    animate={ mobileOpen ? { rotate: 45, y: 0, width: "100%" } : { rotate: 0, y: 0 } }
                    transition={quickSpring}
                  />
                  <motion.span
                    className="block h-[1.5px] rounded-full bg-white"
                    animate={mobileOpen ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="block h-[1.5px] rounded-full bg-white origin-left"
                    animate={ mobileOpen ? { rotate: -45, y: 0, width: "100%" } : { rotate: 0, y: 0 } }
                    transition={quickSpring}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence mode="wait">
        {mobileOpen && (
          <motion.div
            ref={trapRef}
            className="fixed inset-0 z-[100] lg:hidden bg-[#050505]/95 backdrop-blur-3xl flex flex-col"
            variants={resolvedOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
              <Link
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00c6ff] to-[#0072ff] flex items-center justify-center shadow-inner">
                  <span className="text-[14px] font-black text-white leading-none tracking-tighter">E</span>
                </div>
                <span className="text-[17px] font-bold tracking-tight text-white">EduAI</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors duration-200"
                aria-label="Close menu"
              >
                <motion.svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" animate={mobileOpen ? { rotate: 90 } : { rotate: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
              </button>
            </div>

            {/* Links */}
            <motion.nav className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 gap-6" variants={mobileNavContainer} initial="hidden" animate="visible" exit="exit">
              {NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={mobileNavItem}>
                  <Link
                    href={link.href}
                    className="text-3xl font-bold tracking-tight text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {userId && (
                <motion.div variants={mobileNavItem}>
                  <Link href="/dashboard" className="text-3xl font-bold tracking-tight text-gray-300 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                </motion.div>
              )}

              {/* Mobile PRO Button */}
              <motion.div variants={mobileNavItem} className="mt-4">
                <Link href="/billing" onClick={() => setMobileOpen(false)}>
                  <button className="relative group overflow-hidden rounded-full p-[1.5px] focus:outline-none transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-80" />
                    <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#050505] px-8 py-2.5 text-sm font-black text-white">
                      <span className="tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mr-2">
                        PRO
                      </span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500 shadow-[0_0_10px_#d946ef]" />
                      </span>
                    </span>
                  </button>
                </Link>
              </motion.div>

              <motion.div variants={mobileNavItem} className="mt-4 flex flex-col gap-4 w-full max-w-xs">
                {!userId ? (
                  <>
                    <SignInButton mode="modal">
                      <button suppressHydrationWarning className="w-full py-3.5 text-[15px] font-semibold text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        Log in
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button suppressHydrationWarning className="w-full py-3.5 text-[15px] font-semibold text-black bg-white rounded-full hover:bg-gray-100 transition-colors">
                        Sign up
                      </button>
                    </SignUpButton>
                  </>
                ) : (
                  <div className="flex justify-center">
                    <UserButton appearance={{ elements: { avatarBox: "w-12 h-12" } }} />
                  </div>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Brain, FileText, Zap, Settings, LogOut, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";

const SIDEBAR_LINKS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", color: "#22d3ee" },
  { href: "/tutor", icon: Brain, label: "AI Tutor", color: "#4ade80" },
  { href: "/flashcards", icon: FileText, label: "Flashcards", color: "#a855f7" },
  { href: "/optimizer", icon: Zap, label: "Optimizer", color: "#fbbf24" },
  { href: "/dashboard/affiliate", icon: DollarSign, label: "Affiliate", color: "#f43f5e" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", color: "#94a3b8" },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050510] flex text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />

      {/* Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-screen shrink-0 border-r border-white/[0.06] bg-[#0a0a16]/50 backdrop-blur-xl flex flex-col relative z-20"
      >
        <div className="h-20 flex items-center px-6 gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shrink-0">
            <span className="font-bold text-white text-sm">E</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg tracking-tight whitespace-nowrap"
              >
                EduAI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-2 relative">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href || (pathname !== '/dashboard' && pathname?.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium z-10 group"
                style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-pill"
                    className="absolute inset-0 rounded-xl bg-white/[0.04] border border-white/[0.08] z-[-1]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <link.icon 
                  className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "" : "group-hover:text-white"}`} 
                  style={{ color: isActive ? link.color : undefined }} 
                />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap transition-colors group-hover:text-white"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white/[0.1] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.2] transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3 text-white/70" /> : <ChevronLeft className="w-3 h-3 text-white/70" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

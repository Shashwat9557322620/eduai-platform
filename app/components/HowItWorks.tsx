"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Upload, Brain, Target, ArrowRight, Sparkles } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Upload,
    title: "Upload",
    headline: "Feed the Engine",
    desc: "Paste your syllabus, notes, or raw textbook content. Any subject, any format — our parser extracts the academic DNA instantly.",
    accent: "#06b6d4",
    accentRgb: "6,182,212",
  },
  {
    num: "02",
    icon: Brain,
    title: "Process",
    headline: "AI Builds Your Protocol",
    desc: "Our neural engine maps knowledge gaps, structures optimal learning sequences, and generates adaptive study plans calibrated to your goals.",
    accent: "#a855f7",
    accentRgb: "168,85,247",
  },
  {
    num: "03",
    icon: Target,
    title: "Execute",
    headline: "Dominate Your Exams",
    desc: "Follow your precision study protocol. Track real-time progress. Walk into exams with surgical confidence backed by data.",
    accent: "#10b981",
    accentRgb: "16,185,129",
  },
];

/* ─── NUMBER REVEAL ─────────────────────────────── */
function BigNumber({ num, accent, accentRgb, isActive }: {
  num: string; accent: string; accentRgb: string; isActive: boolean;
}) {
  return (
    <motion.span
      className="text-[8rem] md:text-[11rem] font-black leading-none select-none pointer-events-none"
      style={{
        WebkitTextStroke: `1.5px rgba(${accentRgb},${isActive ? 0.35 : 0.1})`,
        WebkitTextFillColor: 'transparent',
        transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        filter: isActive ? `drop-shadow(0 0 40px rgba(${accentRgb},0.15))` : 'none',
      }}
    >
      {num}
    </motion.span>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────── */
export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % STEPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Progress bar ticking to 100% every 5 seconds
  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / 5000) * 100, 100);
      setProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const current = STEPS[active];

  return (
    <section className="relative py-32 md:py-44 overflow-hidden">
      {/* ─ Bg ─ */}
      <div className="absolute inset-0 bg-[#030308]" />

      {/* Ambient glow — very subtle */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-40"
        style={{
          left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, rgba(${current.accentRgb},0.08), transparent 70%)`,
          filter: 'blur(80px)',
          transition: 'background 0.8s ease',
        }}
      />

      <div className="max-w-5xl mx-auto px-5 md:px-8 relative z-10">

        {/* ─ Header ─ */}
        <motion.div
          ref={sectionRef}
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            How It Works
          </motion.div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
            <span className="text-white">Three Steps to</span>
            <br />
            <span
              className="inline-block mt-1"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #a855f7, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Mastery
            </span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg mt-5 max-w-md mx-auto leading-relaxed">
            From raw content to exam domination in under 60 seconds.
          </p>
        </motion.div>

        {/* ─ Step Selector Tabs ─ */}
        <motion.div
          className="flex items-center justify-center gap-1 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {STEPS.map((step, i) => (
            <button
              suppressHydrationWarning
              key={step.num}
              onClick={() => setActive(i)}
              className="relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-500 group"
              style={{
                color: i === active ? step.accent : 'rgba(255,255,255,0.35)',
                backgroundColor: i === active ? `rgba(${step.accentRgb},0.08)` : 'transparent',
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-[10px] font-mono opacity-50">{step.num}</span>
                {step.title}
              </span>
              {/* Active underline */}
              {i === active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ backgroundColor: step.accent, boxShadow: `0 0 10px ${step.accent}` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* ─ Content Panel ─ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative rounded-3xl border overflow-hidden"
              style={{ borderColor: `rgba(${current.accentRgb},0.12)`, backgroundColor: '#07070e' }}
            >
              {/* Subtle top accent line */}
              <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(${current.accentRgb},0.5), transparent)` }} />

              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] items-center">

                {/* Left: Big Number + Icon */}
                <div className="relative flex items-center justify-center py-16 md:py-20 overflow-hidden">
                  {/* Giant ghost number */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BigNumber num={current.num} accent={current.accent} accentRgb={current.accentRgb} isActive={true} />
                  </div>

                  {/* Icon in center */}
                  <motion.div
                    className="relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, rgba(${current.accentRgb},0.2), rgba(${current.accentRgb},0.05))`,
                      border: `1px solid rgba(${current.accentRgb},0.3)`,
                      boxShadow: `0 0 60px rgba(${current.accentRgb},0.15), inset 0 0 30px rgba(${current.accentRgb},0.05)`,
                    }}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <current.icon
                      className="w-10 h-10"
                      style={{ color: current.accent, filter: `drop-shadow(0 0 10px ${current.accent})` }}
                    />
                  </motion.div>

                  {/* Subtle radial behind icon */}
                  <div
                    className="absolute w-64 h-64 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, rgba(${current.accentRgb},0.06), transparent 70%)`,
                    }}
                  />
                </div>

                {/* Right: Text content */}
                <div className="px-8 md:px-12 py-12 md:py-16 md:border-l" style={{ borderColor: `rgba(${current.accentRgb},0.08)` }}>
                  {/* Step pill */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest mb-6"
                    style={{
                      color: current.accent,
                      backgroundColor: `rgba(${current.accentRgb},0.08)`,
                      border: `1px solid rgba(${current.accentRgb},0.2)`,
                    }}
                  >
                    Step {current.num} — {current.title}
                  </div>

                  {/* Headline */}
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 leading-tight">
                    {current.headline}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-lg">
                    {current.desc}
                  </p>

                  {/* Progress dots + timer bar */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      {STEPS.map((s, i) => (
                        <button
                          suppressHydrationWarning
                          key={i}
                          onClick={() => setActive(i)}
                          className="group flex items-center gap-2"
                        >
                          <div
                            className="rounded-full transition-all duration-500"
                            style={{
                              width: i === active ? 32 : 8,
                              height: 8,
                              backgroundColor: i === active ? s.accent : 'rgba(255,255,255,0.1)',
                              boxShadow: i === active ? `0 0 12px ${s.accent}60` : 'none',
                            }}
                          />
                        </button>
                      ))}
                      <span className="text-[10px] font-mono text-gray-700 ml-2">
                        {active + 1}/{STEPS.length}
                      </span>
                    </div>
                    {/* Auto-advance timer bar */}
                    <div className="step-progress-track w-32">
                      <div
                        className="step-progress-fill"
                        style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${current.accent}, rgba(168,85,247,0.8))` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ─ Bottom: Step Indicators (mini timeline) ─ */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <motion.button
              key={step.num}
              onClick={() => setActive(i)}
              className="relative text-left p-5 rounded-2xl border transition-all duration-500 group overflow-hidden"
              style={{
                borderColor: i === active ? `rgba(${step.accentRgb},0.35)` : 'rgba(255,255,255,0.04)',
                backgroundColor: i === active ? `rgba(${step.accentRgb},0.04)` : 'transparent',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
            >
              {/* Active top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all duration-500"
                style={{
                  backgroundColor: i === active ? step.accent : 'transparent',
                  boxShadow: i === active ? `0 0 10px ${step.accent}` : 'none',
                }}
              />

              <div className="flex items-center gap-3 mb-2">
                <step.icon
                  className="w-4 h-4 transition-colors duration-300"
                  style={{ color: i === active ? step.accent : 'rgba(255,255,255,0.2)' }}
                />
                <span
                  className="text-xs font-mono font-bold uppercase tracking-wider transition-colors duration-300"
                  style={{ color: i === active ? step.accent : 'rgba(255,255,255,0.25)' }}
                >
                  {step.num}
                </span>
              </div>
              <p
                className="text-sm font-semibold transition-colors duration-300"
                style={{ color: i === active ? 'white' : 'rgba(255,255,255,0.3)' }}
              >
                {step.headline}
              </p>
            </motion.button>
          ))}
        </div>

        {/* ─ CTA ─ */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <a
            href="/optimizer"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm tracking-wide text-black bg-white hover:bg-gray-100 transition-all duration-300 active:scale-[0.97] cta-shimmer"
            style={{ boxShadow: '0 0 40px rgba(255,255,255,0.08), 0 2px 20px rgba(0,0,0,0.5)' }}
          >
            Try It Now — It&apos;s Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-gray-700 text-xs mt-4 font-mono tracking-wide">
            No credit card required • Instant results
          </p>
        </motion.div>
      </div>
    </section>
  );
}

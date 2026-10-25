"use client";
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight, Shield, Zap, TrendingUp, Brain, Award, Users } from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    id: 0,
    name: 'Arjun Mehta',
    role: 'Computer Science, IIT Bombay',
    avatar: 'AM',
    quote: 'EduAI completely transformed my exam prep. The Curriculum Optimizer broke down my entire semester syllabus into daily actionable protocols. Scored top of my class for the first time.',
    rating: 5,
    accent: '#06b6d4',
    accentRgb: '6,182,212',
    tool: 'Curriculum Optimizer',
    icon: <Zap className="w-4 h-4" />,
    result: 'Top of class',
    resultIcon: <Award className="w-3.5 h-3.5" />,
    tag: 'AI-Powered Planning',
  },
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Medical Student, AIIMS Delhi',
    avatar: 'PS',
    quote: 'The flashcard system is unreal. I pasted my entire pharmacology textbook and got perfectly structured flashcards with spaced repetition scheduling. My retention improved by 60%.',
    rating: 5,
    accent: '#a855f7',
    accentRgb: '168,85,247',
    tool: 'Smart Flashcards',
    icon: <Brain className="w-4 h-4" />,
    result: '+60% retention',
    resultIcon: <TrendingUp className="w-3.5 h-3.5" />,
    tag: 'Spaced Repetition',
  },
  {
    id: 2,
    name: 'Rahul Verma',
    role: 'UPSC Aspirant, Delhi University',
    avatar: 'RV',
    quote: 'Skill Gap Analyzer showed me exactly which subjects I was weak in compared to toppers. The AI-generated roadmap saved me 6 months of trial and error. Absolute game changer.',
    rating: 5,
    accent: '#34d399',
    accentRgb: '52,211,153',
    tool: 'Skill Gap Analyzer',
    icon: <TrendingUp className="w-4 h-4" />,
    result: '6 months saved',
    resultIcon: <Zap className="w-3.5 h-3.5" />,
    tag: 'Weakness Mapping',
  },
  {
    id: 3,
    name: 'Neha Gupta',
    role: 'Data Science, BITS Pilani',
    avatar: 'NG',
    quote: 'I was skeptical about AI study tools, but EduAI proved me wrong. The neural algorithms actually adapt to your weak spots. It is like having a personal tutor that knows exactly what you need.',
    rating: 5,
    accent: '#f59e0b',
    accentRgb: '245,158,11',
    tool: 'AI Tutor',
    icon: <Brain className="w-4 h-4" />,
    result: 'Personalized AI',
    resultIcon: <Brain className="w-3.5 h-3.5" />,
    tag: 'Neural Adaptation',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    role: 'GATE 2025 — 98.7 Percentile',
    avatar: 'VS',
    quote: 'GATE prep is brutal. EduAI optimizer turned my 12-subject syllabus into a crystal-clear 90-day plan. I followed it religiously and qualified with 98.7 percentile. Worth every credit.',
    rating: 5,
    accent: '#d946ef',
    accentRgb: '217,70,239',
    tool: 'Study Optimizer',
    icon: <Award className="w-4 h-4" />,
    result: '98.7 Percentile',
    resultIcon: <Award className="w-3.5 h-3.5" />,
    tag: '90-Day Protocol',
  },
];

const STATS = [
  { value: 50000, suffix: 'K+', display: '50K+', label: 'Active Students', icon: <Users className="w-5 h-5" />, accent: '#06b6d4' },
  { value: 1200, suffix: 'M+', display: '1.2M+', label: 'Flashcards Generated', icon: <Brain className="w-5 h-5" />, accent: '#a855f7' },
  { value: 98, suffix: '%', display: '98%', label: 'Satisfaction Rate', icon: <TrendingUp className="w-5 h-5" />, accent: '#34d399' },
  { value: 4.9, suffix: '', display: '4.9', label: 'Average Rating', icon: <Star className="w-5 h-5" />, accent: '#f59e0b' },
];

/* ─── ANIMATED COUNTER ─────────────────────────────── */
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const duration = 2000;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); return; }
      setCount(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count >= target ? target : count}{suffix}</span>;
}

/* ─── STARS ─────────────────────────────────────────── */
function Stars({ count, accent }: { count: number; accent: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.07, type: 'spring', stiffness: 300 }}
        >
          <Star
            className="w-4 h-4"
            fill={i < count ? accent : 'none'}
            stroke={accent}
            strokeWidth={1.5}
            style={{ filter: i < count ? `drop-shadow(0 0 4px ${accent}80)` : 'none' }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── SCAN LINE OVERLAY ──────────────────────────────── */
function ScanLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)',
          backgroundSize: '100% 4px',
        }}
      />
    </div>
  );
}

/* ─── CIRCUIT DOTS BACKGROUND ────────────────────────── */
function CircuitBg({ accent }: { accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" aria-hidden>
      <defs>
        <pattern id={`circuit-${accent.replace('#', '')}`} width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="1" fill={accent} />
          <line x1="30" y1="30" x2="60" y2="30" stroke={accent} strokeWidth="0.5" />
          <line x1="30" y1="30" x2="30" y2="0" stroke={accent} strokeWidth="0.5" />
          <circle cx="60" cy="30" r="2" fill="none" stroke={accent} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#circuit-${accent.replace('#', '')})`} />
    </svg>
  );
}

/* ─── 3D TILT CARD ───────────────────────────────────── */
function TiltCard({ children, accent, accentRgb, size = 'normal' }: {
  children: React.ReactNode; accent: string; accentRgb: string; size?: 'normal' | 'large';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 20 });
  const glowX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(y, [-0.5, 0.5], [0, 100]);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { x.set(0); y.set(0); setIsHovered(false); }}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200, transformStyle: 'preserve-3d' }}
      className="relative h-full cursor-pointer"
    >
      {/* Outer glow border */}
      <motion.div
        className="absolute -inset-px rounded-2xl"
        animate={{
          boxShadow: isHovered
            ? `0 0 40px rgba(${accentRgb},0.35), 0 0 80px rgba(${accentRgb},0.15), inset 0 0 40px rgba(${accentRgb},0.05)`
            : `0 0 20px rgba(${accentRgb},0.12), 0 0 0px transparent`,
        }}
        style={{
          background: isHovered
            ? `linear-gradient(135deg, rgba(${accentRgb},0.5) 0%, transparent 40%, rgba(${accentRgb},0.2) 100%)`
            : `linear-gradient(135deg, rgba(${accentRgb},0.15) 0%, transparent 60%)`,
          borderRadius: '1rem',
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Card body */}
      <div
        className="relative rounded-2xl h-full overflow-hidden border"
        style={{
          backgroundColor: '#070710',
          borderColor: `rgba(${accentRgb},${isHovered ? '0.3' : '0.1'})`,
          transition: 'border-color 0.4s ease',
        }}
      >
        <CircuitBg accent={accent} />
        <ScanLines />

        {/* Mouse-tracking glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle 200px at ${glowX.get()}% ${glowY.get()}%, rgba(${accentRgb},0.18), transparent 70%)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, rgba(${accentRgb},0.25), transparent 70%)`,
          }}
        />
        <div className="absolute top-0 right-0 w-8 h-px" style={{ backgroundColor: `rgba(${accentRgb},0.6)` }} />
        <div className="absolute top-0 right-0 w-px h-8" style={{ backgroundColor: `rgba(${accentRgb},0.6)` }} />
        <div className="absolute bottom-0 left-0 w-8 h-px" style={{ backgroundColor: `rgba(${accentRgb},0.3)` }} />
        <div className="absolute bottom-0 left-0 w-px h-8" style={{ backgroundColor: `rgba(${accentRgb},0.3)` }} />

        <div className="relative z-10 h-full">{children}</div>
      </div>
    </motion.div>
  );
}

/* ─── TYPING QUOTE ───────────────────────────────────── */
function TypingQuote({ text, accent }: { text: string; accent: string }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const speed = 20;
    const timer = setInterval(() => {
      i++;
      if (i > text.length) { setDone(true); clearInterval(timer); return; }
      setDisplayed(text.slice(0, i));
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <p className="text-gray-200 text-lg md:text-xl leading-relaxed font-light">
      "{displayed}
      {!done && (
        <motion.span
          style={{ color: accent }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >|</motion.span>
      )}
      {done && '"'}
    </p>
  );
}


/* ─── FEATURED SPOTLIGHT CARD ─────────────────────────── */
function FeaturedCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <TiltCard accent={t.accent} accentRgb={t.accentRgb} size="large">
      <div className="p-8 md:p-10 flex flex-col h-full min-h-[320px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black"
                style={{
                  background: `linear-gradient(135deg, rgba(${t.accentRgb},0.4), rgba(${t.accentRgb},0.1))`,
                  border: `2px solid rgba(${t.accentRgb},0.4)`,
                  color: t.accent,
                  boxShadow: `0 0 20px rgba(${t.accentRgb},0.3)`,
                }}
              >
                {t.avatar}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: t.accent, boxShadow: `0 0 10px ${t.accent}` }}
              >
                <Shield className="w-3 h-3 text-black" />
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg">{t.name}</p>
              <p className="text-gray-400 text-sm">{t.role}</p>
              <div className="mt-1">
                <Stars count={t.rating} accent={t.accent} />
              </div>
            </div>
          </div>

          {/* Result badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono"
            style={{
              color: t.accent,
              backgroundColor: `rgba(${t.accentRgb},0.1)`,
              border: `1px solid rgba(${t.accentRgb},0.3)`,
              boxShadow: `0 0 15px rgba(${t.accentRgb},0.1)`,
            }}
          >
            {t.resultIcon}
            {t.result}
          </div>
        </div>

        {/* Quote with typing effect */}
        <div className="relative">
          <div className="quote-mark absolute -top-4 -left-2 opacity-30" aria-hidden="true">&ldquo;</div>
          <TypingQuote text={t.quote} accent={t.accent} />
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t flex items-center justify-between" style={{ borderColor: `rgba(${t.accentRgb},0.15)` }}>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider"
              style={{ color: t.accent, backgroundColor: `rgba(${t.accentRgb},0.08)` }}
            >
              {t.icon}
              {t.tool}
            </div>
          </div>
          <div
            className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ color: `rgba(${t.accentRgb},0.6)`, borderColor: `rgba(${t.accentRgb},0.2)`, border: '1px solid' }}
          >
            ✓ Verified User
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

/* ─── COMPACT CARD ───────────────────────────────────── */
function CompactCard({ t, onClick, isActive }: { t: typeof TESTIMONIALS[0]; onClick: () => void; isActive: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative rounded-xl p-4 border transition-all duration-300 overflow-hidden"
        style={{
          backgroundColor: isActive ? `rgba(${t.accentRgb},0.08)` : '#070710',
          borderColor: isActive ? `rgba(${t.accentRgb},0.4)` : 'rgba(255,255,255,0.06)',
          boxShadow: isActive ? `0 0 20px rgba(${t.accentRgb},0.15), inset 0 0 20px rgba(${t.accentRgb},0.04)` : 'none',
        }}
      >
        {/* Active left bar */}
        {isActive && (
          <motion.div
            layoutId="activeBar"
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
            style={{ backgroundColor: t.accent, boxShadow: `0 0 10px ${t.accent}` }}
          />
        )}

        <div className="flex items-start gap-3 pl-1">
          <div
            className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{
              background: `linear-gradient(135deg, rgba(${t.accentRgb},0.3), rgba(${t.accentRgb},0.08))`,
              border: `1px solid rgba(${t.accentRgb},0.3)`,
              color: t.accent,
            }}
          >
            {t.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-white font-semibold text-sm truncate">{t.name}</p>
              <Stars count={t.rating} accent={t.accent} />
            </div>
            <p className="text-gray-500 text-xs truncate">{t.role}</p>
            <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
              "{t.quote.slice(0, 80)}..."
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── STAT CARD ──────────────────────────────────────── */
function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative rounded-2xl p-6 border text-center overflow-hidden group hover:scale-105 transition-transform duration-300"
        style={{
          backgroundColor: '#070710',
          borderColor: `rgba(${stat.accent.replace('#', '').match(/.{2}/g)!.map(h => parseInt(h, 16)).join(',')},0.15)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, rgba(${stat.accent.replace('#', '').match(/.{2}/g)!.map(h => parseInt(h, 16)).join(',')},0.1), transparent 70%)`,
          }}
        />
        <div
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
          style={{
            backgroundColor: `rgba(${stat.accent.replace('#', '').match(/.{2}/g)!.map(h => parseInt(h, 16)).join(',')},0.12)`,
            color: stat.accent,
            border: `1px solid rgba(${stat.accent.replace('#', '').match(/.{2}/g)!.map(h => parseInt(h, 16)).join(',')},0.2)`,
          }}
        >
          {stat.icon}
        </div>
        <div
          className="text-3xl font-black tracking-tight"
          style={{ color: stat.accent, textShadow: `0 0 30px ${stat.accent}50` }}
        >
          {stat.display}
        </div>
        <div className="text-gray-500 text-xs uppercase tracking-widest mt-1 font-mono">{stat.label}</div>
      </div>
    </motion.div>
  );
}

/* ─── FLOATING ORB ───────────────────────────────────── */
function FloatingOrb({ color, x, y, size, delay }: { color: string; x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: `radial-gradient(circle, ${color}20, transparent 70%)`,
        filter: 'blur(40px)',
      }}
      animate={{ y: [-20, 20, -20], x: [-10, 10, -10], scale: [1, 1.1, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────── */
export default function Testimonials() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = TESTIMONIALS[activeIndex];

  const next = useCallback(() => setActiveIndex(p => (p + 1) % TESTIMONIALS.length), []);
  const prev = useCallback(() => setActiveIndex(p => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  useEffect(() => {
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section ref={sectionRef} className="relative py-28 md:py-36 overflow-hidden">
      {/* ─ Background ─ */}
      <div className="absolute inset-0 bg-[#04040c]" />
      <FloatingOrb color="#06b6d4" x="5%" y="20%" size={400} delay={0} />
      <FloatingOrb color="#a855f7" x="75%" y="10%" size={300} delay={2} />
      <FloatingOrb color="#34d399" x="60%" y="70%" size={250} delay={4} />
      <FloatingOrb color="#f59e0b" x="20%" y="75%" size={200} delay={1} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10">

        {/* ─ Section Header ─ */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs font-mono font-semibold uppercase tracking-widest mb-6 label-pop-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_8px_#06b6d4] live-pulse-dot" />
            </span>
            <span className="text-cyan-400">Live User Testimonials</span>
            <span className="text-gray-600">// Verified</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase leading-none">
            <span className="text-white">Trusted by </span>
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, #06b6d4, #a855f7, #34d399, #06b6d4)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-x 4s linear infinite',
              }}
            >
              Scholars
            </span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Real results. Real students. Not a single line of bullshit.
          </p>
        </motion.div>

        {/* ─ Main Bento Grid ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mb-10">
          {/* Left: Featured spotlight */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <FeaturedCard t={featured} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right: Scrollable list */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-mono text-gray-600 uppercase tracking-wider">All Reviews ({TESTIMONIALS.length})</span>
              <div className="flex gap-2">
                <button
                  suppressHydrationWarning
                  onClick={prev}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  suppressHydrationWarning
                  onClick={next}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {TESTIMONIALS.map((t) => (
              <CompactCard
                key={t.id}
                t={t}
                onClick={() => setActiveIndex(t.id)}
                isActive={t.id === activeIndex}
              />
            ))}

            {/* Dot navigation */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {TESTIMONIALS.map((t, i) => (
                <button
                  suppressHydrationWarning
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIndex ? 24 : 6,
                    height: 6,
                    backgroundColor: i === activeIndex ? TESTIMONIALS[i].accent : 'rgba(255,255,255,0.15)',
                    boxShadow: i === activeIndex ? `0 0 8px ${TESTIMONIALS[i].accent}` : 'none',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─ Stats Grid ─ */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </motion.div>

        {/* ─ Bottom Trust Bar ─ */}
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          {[
            { label: 'IIT Students', count: '12K+' },
            { label: 'UPSC Aspirants', count: '8K+' },
            { label: 'Medical Students', count: '15K+' },
            { label: 'GATE Qualifiers', count: '5K+' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
              <span className="text-sm font-bold text-white">{item.count}</span>
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

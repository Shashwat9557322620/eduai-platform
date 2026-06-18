"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, Zap, BrainCircuit, BarChart3, CheckCircle2, Star } from 'lucide-react';

// ============================================================
// CONFIG
// ============================================================
const STEPS = [
  {
    title: 'Welcome to EduAI',
    subtitle: 'Your AI Study Arsenal',
    description: 'Welcome to the future of learning. EduAI uses advanced neural algorithms to optimize your study routine, generate flashcards, and analyze skill gaps. Let us take you on a quick tour.',
    icon: Sparkles,
    accent: '#06b6d4',
    particleColor: 'rgba(6,182,212,0.4)',
  },
  {
    title: 'Curriculum Optimizer',
    subtitle: 'Module 01',
    description: 'Paste any syllabus, set your target days, and our AI will generate a complete daily study protocol with time-allocated slots, topic focus areas, and completion tracking.',
    icon: Zap,
    accent: '#06b6d4',
    particleColor: 'rgba(6,182,212,0.4)',
  },
  {
    title: 'Neural Flashcards',
    subtitle: 'Module 02',
    description: 'Transform any text into interactive flashcards instantly. Our spaced repetition algorithm ensures you review concepts at the optimal time for maximum retention.',
    icon: BrainCircuit,
    accent: '#a855f7',
    particleColor: 'rgba(168,85,247,0.4)',
  },
  {
    title: 'Skill Gap Analyzer',
    subtitle: 'Module 03',
    description: 'Enter your target job role and current skills. Our AI cross-references against millions of job postings to identify exactly what you need to learn next.',
    icon: BarChart3,
    accent: '#ec4899',
    particleColor: 'rgba(236,72,153,0.4)',
  },
  {
    title: 'Ready to Begin?',
    subtitle: 'You have 30 Free Credits',
    description: 'Your account comes with 30 free credits to explore all tools. Each AI generation uses 1 credit. Upgrade anytime for unlimited access. Let us start optimizing your learning!',
    icon: CheckCircle2,
    accent: '#34d399',
    particleColor: 'rgba(52,211,153,0.4)',
  },
];

const TOTAL_STEPS = STEPS.length;

// Deterministic particle positions (no Math.random)
const PARTICLE_CONFIGS = [
  { size: 3, left: 12, delay: 0, duration: 8, animType: 0, isStar: false },
  { size: 4, left: 28, delay: 1.2, duration: 7, animType: 1, isStar: true },
  { size: 2, left: 45, delay: 2.5, duration: 9, animType: 2, isStar: false },
  { size: 5, left: 62, delay: 0.8, duration: 6, animType: 0, isStar: true },
  { size: 3, left: 78, delay: 3.1, duration: 8, animType: 1, isStar: false },
  { size: 4, left: 8, delay: 1.5, duration: 7, animType: 2, isStar: true },
  { size: 2, left: 35, delay: 4.2, duration: 10, animType: 0, isStar: false },
  { size: 3, left: 55, delay: 0.3, duration: 8, animType: 1, isStar: true },
  { size: 4, left: 72, delay: 2.8, duration: 6, animType: 2, isStar: false },
  { size: 2, left: 90, delay: 1.8, duration: 9, animType: 0, isStar: true },
  { size: 5, left: 18, delay: 3.5, duration: 7, animType: 1, isStar: false },
  { size: 3, left: 42, delay: 0.6, duration: 8, animType: 2, isStar: true },
  { size: 4, left: 65, delay: 2.1, duration: 6, animType: 0, isStar: false },
  { size: 2, left: 82, delay: 4.5, duration: 10, animType: 1, isStar: true },
  { size: 3, left: 5, delay: 1.0, duration: 7, animType: 2, isStar: false },
  { size: 4, left: 25, delay: 3.8, duration: 9, animType: 0, isStar: true },
  { size: 2, left: 48, delay: 0.5, duration: 8, animType: 1, isStar: false },
  { size: 5, left: 68, delay: 2.3, duration: 6, animType: 2, isStar: true },
  { size: 3, left: 88, delay: 1.3, duration: 7, animType: 0, isStar: false },
  { size: 4, left: 15, delay: 4.0, duration: 10, animType: 1, isStar: true },
  { size: 2, left: 38, delay: 0.9, duration: 8, animType: 2, isStar: false },
  { size: 3, left: 58, delay: 2.6, duration: 7, animType: 0, isStar: true },
  { size: 4, left: 75, delay: 1.6, duration: 9, animType: 1, isStar: false },
  { size: 2, left: 95, delay: 3.3, duration: 6, animType: 2, isStar: true },
  { size: 5, left: 8, delay: 0.2, duration: 8, animType: 0, isStar: false },
  { size: 3, left: 32, delay: 2.9, duration: 7, animType: 1, isStar: true },
  { size: 4, left: 52, delay: 1.1, duration: 10, animType: 2, isStar: false },
  { size: 2, left: 78, delay: 3.6, duration: 8, animType: 0, isStar: true },
  { size: 3, left: 42, delay: 0.4, duration: 6, animType: 1, isStar: false },
  { size: 4, left: 85, delay: 2.0, duration: 9, animType: 2, isStar: true },
];

// ============================================================
// PARTICLE BACKGROUND (Deterministic)
// ============================================================
function ParticleBackground({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {PARTICLE_CONFIGS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-10px',
            backgroundColor: p.isStar ? '#ffffff' : accent,
            boxShadow: p.isStar ? '0 0 6px rgba(255,255,255,0.4)' : `0 0 ${p.size * 3}px ${accent}`,
            opacity: 0,
            animation: `${
              p.animType === 0 ? 'particle-float' :
              p.animType === 1 ? 'particle-float-2' : 'particle-float-3'
            } ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// PROGRESS BAR WITH LABEL
// ============================================================
function ProgressBar({ current, total, accent }: { current: number; total: number; accent: string }) {
  const percentage = ((current + 1) / total) * 100;
  const segments = Array.from({ length: total }, (_, i) => i);

  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex-1 flex gap-1.5 h-2">
        {segments.map((i) => {
          const isActive = i <= current;
          const isCurrent = i === current;
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-full relative overflow-hidden"
              initial={false}
              animate={{
                backgroundColor: isActive ? accent : 'rgba(255,255,255,0.06)',
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: accent }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      <motion.div
        className="text-xs font-mono font-bold shrink-0 tabular-nums"
        style={{ color: accent }}
        key={`pct-${current}`}
        initial={{ opacity: 0, y: -8, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {Math.round(percentage)}%
      </motion.div>
    </div>
  );
}

// ============================================================
// STEP CONTENT WITH STAGGERED ANIMATION
// ============================================================
function StepContent({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const Icon = step.icon;

  return (
    <motion.div
      key={`content-group-${index}`}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.05 },
        },
        exit: {
          opacity: 0,
          transition: { staggerChildren: 0.04, staggerDirection: -1 },
        },
      }}
    >
      <motion.div
        variants={{
          hidden: { scale: 0, rotate: -40, y: 20 },
          visible: {
            scale: 1,
            rotate: 0,
            y: 0,
            transition: { type: 'spring', stiffness: 250, damping: 14 },
          },
          exit: { scale: 0, rotate: 40, y: -20, opacity: 0, transition: { duration: 0.2 } },
        }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative"
        style={{
          background: `linear-gradient(135deg, ${step.accent}30, ${step.accent}05)`,
          border: `1px solid ${step.accent}25`,
          boxShadow: `0 0 40px ${step.accent}10, inset 0 0 20px ${step.accent}05`,
        }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="w-10 h-10" style={{ color: step.accent }} />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: `2px solid ${step.accent}20` }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, x: -20, filter: 'blur(4px)' },
          visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
          exit: { opacity: 0, x: 20, filter: 'blur(4px)', transition: { duration: 0.2 } },
        }}
        className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-2"
        style={{ color: step.accent }}
      >
        {step.subtitle}
      </motion.div>

      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
          exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
        }}
        className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight"
      >
        {step.title}
      </motion.h2>

      <motion.p
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.1 } },
          exit: { opacity: 0, y: -5, transition: { duration: 0.2 } },
        }}
        className="text-gray-400 leading-relaxed text-sm md:text-base"
      >
        {step.description}
      </motion.p>
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Wait for mount to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for tour trigger event (from Navbar button)
  useEffect(() => {
    if (!mounted) return;
    const handleTourTrigger = () => {
      setIsOpen(true);
      setCurrentStep(0);
    };
    window.addEventListener('eduai:tour:trigger', handleTourTrigger);
    return () => window.removeEventListener('eduai:tour:trigger', handleTourTrigger);
  }, [mounted]);

  // Auto-show only on first visit (with proper delay)
  useEffect(() => {
    if (!mounted) return;
    const seen = localStorage.getItem('eduai_tour_seen');
    if (seen) return;
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [mounted]);

  const handleClose = useCallback(() => {
    localStorage.setItem('eduai_tour_seen', '1');
    setIsOpen(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!mounted) return;
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, mounted, handleNext, handlePrev, handleClose]);

  // Don't render on server
  if (!mounted) return null;

  const step = STEPS[currentStep];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.97,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-2xl z-10"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              scale: { duration: 0.5 },
            }}
          >
            {/* Animated rotating border */}
            <motion.div
              className="absolute -inset-[2px] rounded-3xl z-0"
              style={{
                background: `conic-gradient(from ${currentStep * 72}deg, ${step.accent}, rgba(255,255,255,0.06), ${step.accent}80, rgba(255,255,255,0.06), ${step.accent})`,
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            {/* Pulse ring behind card */}
            <motion.div
              className="absolute -inset-10 rounded-[50%] z-[-1]"
              style={{
                background: `radial-gradient(circle, ${step.accent}08, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative rounded-3xl bg-[#07070a] border border-white/[0.08] overflow-hidden z-10">
              <ParticleBackground accent={step.particleColor} />

              {/* Top accent bar */}
              <motion.div
                className="h-[3px] w-full relative overflow-hidden"
                style={{ background: `linear-gradient(to right, ${step.accent}, rgba(255,255,255,0.15))` }}
              >
                <motion.div
                  className="absolute inset-0 w-1/3"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                  }}
                  animate={{ left: ['-30%', '130%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>

              {/* Close button */}
              <motion.button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] transition-all z-20"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-gray-400" />
              </motion.button>

              <div className="relative p-8 md:p-10 z-10">
                <ProgressBar current={currentStep} total={TOTAL_STEPS} accent={step.accent} />

                <div className="min-h-[260px] relative">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={`step-${currentStep}`}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.35 },
                        scale: { duration: 0.35 },
                      }}
                    >
                      <StepContent step={step} index={currentStep} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <motion.div
                  className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <motion.button
                        onClick={handlePrev}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-2"
                        whileHover={{ scale: 1.02, x: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </motion.button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={handleClose}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {currentStep < TOTAL_STEPS - 1 ? 'Skip' : 'Close'}
                    </motion.button>

                    <motion.button
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 relative overflow-hidden group"
                      style={{ background: `linear-gradient(to right, ${step.accent}, ${step.accent}cc)` }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: `0 0 35px ${step.accent}40`,
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.span
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)`,
                        }}
                        animate={{ left: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        {currentStep === TOTAL_STEPS - 1 ? (
                          <>
                            <Star className="w-4 h-4" />
                            Get Started
                          </>
                        ) : (
                          <>
                            Next
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  className="mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <span className="text-[10px] text-gray-600 font-mono tracking-wider">
                    Use <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-gray-400">←</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-gray-400 ml-0.5">→</kbd> to navigate ·{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-gray-400">ESC</kbd> to close
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
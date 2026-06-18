"use client";
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import AmbientBackground from './AmbientBackground';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Arjun Mehta',
    role: 'Computer Science, IIT Bombay',
    avatar: 'AM',
    quote: 'EduAI completely transformed my exam prep. The Curriculum Optimizer broke down my entire semester syllabus into daily actionable protocols. Scored top of my class for the first time.',
    rating: 5,
    accent: '#06b6d4',
  },
  {
    name: 'Priya Sharma',
    role: 'Medical Student, AIIMS Delhi',
    avatar: 'PS',
    quote: 'The flashcard system is unreal. I pasted my entire pharmacology textbook and got perfectly structured flashcards with spaced repetition scheduling. My retention improved by 60%.',
    rating: 5,
    accent: '#a855f7',
  },
  {
    name: 'Rahul Verma',
    role: 'UPSC Aspirant, Delhi University',
    avatar: 'RV',
    quote: 'Skill Gap Analyzer showed me exactly which subjects I was weak in compared to toppers. The AI-generated roadmap saved me 6 months of trial and error. Absolute game changer.',
    rating: 5,
    accent: '#34d399',
  },
  {
    name: 'Neha Gupta',
    role: 'Data Science, BITS Pilani',
    avatar: 'NG',
    quote: 'I was skeptical about AI study tools, but EduAI proved me wrong. The neural algorithms actually adapt to your weak spots. It is like having a personal tutor that knows exactly what you need.',
    rating: 5,
    accent: '#f59e0b',
  },
  {
    name: 'Vikram Singh',
    role: 'GATE 2025 Qualified',
    avatar: 'VS',
    quote: 'GATE prep is brutal. EduAI optimizer turned my 12-subject syllabus into a crystal-clear 90-day plan. I followed it religiously and qualified with 98.7 percentile. Worth every credit.',
    rating: 5,
    accent: '#d946ef',
  },
];

function Stars({ count, accent }: { count: number; accent: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4"
          fill={i < count ? accent : 'none'}
          stroke={accent}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function TiltCard({ children, accent }: { children: React.ReactNode; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setRotateX((y - 0.5) * -12);
    setRotateY((x - 0.5) * 12);
    setGlowX(x * 100);
    setGlowY(y * 100);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowX(50);
    setGlowY(50);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-3xl p-[2px] cursor-pointer h-full group"
      style={{
        backgroundImage: `linear-gradient(135deg, ${accent}30, transparent 60%)`,
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
      animate={{
        boxShadow: isHovered
          ? [`0 0 30px ${accent}20`, `0 0 60px ${accent}15`, `0 0 20px ${accent}10`]
          : [`0 0 20px ${accent}10`, `0 0 40px ${accent}15`, `0 0 20px ${accent}10`],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Inner background - NO backgroundColor conflict, just backgroundImage */}
      <div
        className="relative rounded-[22px] overflow-hidden h-full"
        style={{
          backgroundImage: `radial-gradient(circle at ${glowX}% ${glowY}%, ${accent}12, #07070a 70%)`,
          backgroundColor: '#07070a',
        }}
      >
        {/* Mouse-following shine streak */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at ${glowX}% ${glowY}%, ${accent}20, transparent 50%)`,
            opacity: isHovered ? 1 : 0.3,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Shimmer sweep line */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(105deg, transparent 30%, ${accent}10 45%, ${accent}20 50%, ${accent}10 55%, transparent 70%)`,
            transform: `translateX(${(glowX - 50) * 0.6}px)`,
            opacity: isHovered ? 1 : 0.2,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Animated border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-[22px] pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? `inset 0 0 30px ${accent}08, inset 0 0 60px ${accent}04`
              : 'inset 0 0 0px transparent',
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function TestimonialCard({ t, index }: { t: typeof TESTIMONIALS[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9, filter: 'blur(8px)' }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.9, delay: 0.15 * index, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <TiltCard accent={t.accent}>
        <div className="p-7 md:p-8 flex flex-col h-full">
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${t.accent}15`,
                border: `1px solid ${t.accent}25`,
              }}
            >
              <Quote className="w-5 h-5" style={{ color: t.accent }} />
            </div>
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{
                color: t.accent,
                backgroundColor: `${t.accent}10`,
                border: `1px solid ${t.accent}20`,
              }}
            >
              Verified
            </span>
          </div>

          <p className="text-gray-300 text-sm md:text-base leading-relaxed flex-grow mb-6 italic">
            "{t.quote}"
          </p>

          <div className="mt-auto">
            <Stars count={t.rating} accent={t.accent} />

            <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{
                  background: `linear-gradient(135deg, ${t.accent}30, ${t.accent}10)`,
                  border: `1px solid ${t.accent}25`,
                  color: t.accent,
                }}
              >
                {t.avatar}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role}</p>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 6000);
    return () => clearInterval(interval);
  }, []);

  const featured = TESTIMONIALS[activeIndex];

  return (
    <section ref={sectionRef} className="relative py-32 md:py-40 overflow-hidden">
      <AmbientBackground />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.02] border border-white/[0.08] text-xs font-bold tracking-widest mb-6 animate-shimmer-overlay">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
            </span>
            <span className="text-gray-300 uppercase">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">
            Trusted by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400">
              Scholars
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Join 50,000+ students who have transformed their learning with EduAI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>

        <motion.div
          className="relative max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="relative rounded-3xl p-[2px]"
            style={{ background: `linear-gradient(135deg, ${featured.accent}40, transparent 60%)` }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative rounded-[22px] bg-[#07070a] border border-white/[0.06] p-8 md:p-10 overflow-hidden">
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
                style={{ backgroundColor: `${featured.accent}10` }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${featured.accent}30, ${featured.accent}10)`,
                      color: featured.accent,
                      border: `1px solid ${featured.accent}25`,
                    }}
                  >
                    {featured.avatar}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{featured.name}</p>
                    <p className="text-gray-500 text-sm">{featured.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed italic mb-4">
                  "{featured.quote}"
                </p>
                <Stars count={featured.rating} accent={featured.accent} />
              </div>

              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-white/[0.06]">
                <button suppressHydrationWarning onClick={prevTestimonial} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.15] transition-all group">
                  <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </button>
                <div className="flex gap-2">
                  {TESTIMONIALS.map((_, i) => (
                    <button suppressHydrationWarning
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i === activeIndex ? featured.accent : 'rgba(255,255,255,0.1)',
                        width: i === activeIndex ? 24 : 8,
                        height: 8,
                      }}
                    />
                  ))}
                </div>
                <button suppressHydrationWarning onClick={nextTestimonial} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.15] transition-all group">
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          {[
            { value: '50K+', label: 'Active Students' },
            { value: '1.2M+', label: 'Flashcards Generated' },
            { value: '98%', label: 'Satisfaction Rate' },
            { value: '4.9', label: 'Average Rating' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
              <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-1 font-mono">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

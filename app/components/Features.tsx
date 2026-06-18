"use client";
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

const FEATURES = [
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    title: "Curriculum Optimizer",
    description: "Paste any syllabus, set target days. AI generates a complete daily study protocol with time-allocated slots, topic focus areas, and completion tracking.",
    color: "#06b6d4",
    accentRgb: "6,182,212",
    link: "/optimizer",
    tag: "Module 01",
    stats: ["Smart Scheduling", "Daily Protocols", "Progress Tracking"]
  },
  {
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    title: "Neural Flashcards",
    description: "Transform any text into interactive flashcards instantly. Spaced repetition algorithm ensures maximum retention at optimal review times.",
    color: "#a855f7",
    accentRgb: "168,85,247",
    link: "/flashcards",
    tag: "Module 02",
    stats: ["Spaced Repetition", "Instant Generation", "Flip Animation"]
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Skill Gap Analyzer",
    description: "Enter your target job role and current skills. AI cross-references against global hiring data to identify exactly what you need to learn next.",
    color: "#ec4899",
    accentRgb: "236,72,153",
    link: "/analyzer",
    tag: "Module 03",
    stats: ["Job Market Data", "Personalized Roadmap", "Share & Download"]
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "Secure Authentication",
    description: "Clerk-powered auth with email, Google, and social logins. Your data is encrypted end-to-end with enterprise-grade security.",
    color: "#22d3ee",
    accentRgb: "34,211,238",
    link: "/sign-up",
    tag: "Security",
    stats: ["Social Login", "Encrypted Data", "Session Management"]
  },
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    title: "PRO Billing",
    description: "Upgrade to PRO for unlimited AI generations. Razorpay-powered secure payments with instant activation and full refund policy.",
    color: "#a855f7",
    accentRgb: "168,85,247",
    link: "/billing",
    tag: "Premium",
    stats: ["Razorpay", "Instant Access", "Full Refund"]
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Student Dashboard",
    description: "Track your study progress, view history, manage credits, and monitor your learning journey from a single unified dashboard.",
    color: "#06b6d4",
    accentRgb: "6,182,212",
    link: "/dashboard",
    tag: "Analytics",
    stats: ["Study History", "Credit Tracking", "Progress Charts"]
  },
];

export default function Features() {
  const headingRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const headingInView = useInView(headingRef, { once: true, margin: '-60px' });

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10" id="features">
      <motion.div
        ref={headingRef}
        className="text-center mb-16"
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
        animate={headingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-bold tracking-widest text-gray-400 mb-6">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          FULL FEATURE SET
        </div>
        <h2 className="text-5xl md:text-7xl font-playfair font-black mb-6 tracking-tight text-white leading-tight">
          Everything You Need to Dominate.
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          AI-powered tools built for serious students. Every feature designed to save you time and boost your grades.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={i} feature={feature} index={i} shouldReduceMotion={shouldReduceMotion} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  shouldReduceMotion,
}: {
  feature: typeof FEATURES[0];
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref}>
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href={feature.link}
          className="group relative rounded-2xl overflow-hidden block h-full"
        >
          <div className="relative h-full glass-panel rounded-2xl p-7 transition-all duration-700 group-hover:border-white/[0.15] group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] group-hover:-translate-y-2">
            {/* Top accent line */}
            <div className="h-[2px] w-10 rounded-full mb-5 transition-all duration-500 group-hover:w-full" style={{ background: feature.color }} />

            {/* Tag */}
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-3" style={{ color: feature.color }}>
              {feature.tag}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{feature.title}</h3>

            {/* Description */}
            <p className="text-sm text-gray-400 leading-relaxed mb-5">{feature.description}</p>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {feature.stats.map((stat, j) => (
                <span
                  key={j}
                  className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border transition-all duration-300"
                  style={{
                    borderColor: `${feature.color}25`,
                    color: feature.color,
                    background: `${feature.color}08`,
                  }}
                >
                  {stat}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 text-sm font-bold transition-all duration-300 group-hover:gap-3 mt-auto" style={{ color: feature.color }}>
              <span>Explore</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </div>

            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none -z-10"
              style={{ background: `radial-gradient(600px circle at 50% 0%, ${feature.color}08, transparent 60%)` }}
            />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
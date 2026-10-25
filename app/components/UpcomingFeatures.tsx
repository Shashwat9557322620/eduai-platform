"use client";
import { motion } from 'framer-motion';
import { Headphones, Mail, Calendar, Rocket, Lock, ArrowRight } from 'lucide-react';

const UPCOMING = [
  {
    icon: Headphones,
    title: "AI Podcast Studio",
    description: "Transform your study notes into engaging audio podcasts. Learn while you commute, exercise, or relax. Multi-voice AI narration with customizable pace.",
    color: "#fb923c",
    accentRgb: "251,146,60",
    status: "Coming Soon",
    tag: "Audio Learning",
    features: ["Multi-voice AI narration", "Customizable speed & tone", "Offline listening", "Chapter markers"],
  },
  {
    icon: Mail,
    title: "Smart Newsletter",
    description: "Weekly curated study tips, productivity hacks, and AI insights delivered to your inbox. Personalized based on your learning patterns and goals.",
    color: "#22d3ee",
    accentRgb: "34,211,238",
    status: "Coming Soon",
    tag: "Weekly Digest",
    features: ["Personalized content", "Study reminders", "Progress reports", "Exclusive tips"],
  },
  {
    icon: Calendar,
    title: "Live Study Events",
    description: "Join live group study sessions with AI-moderated discussions, real-time flashcard battles, and collaborative problem-solving with peers worldwide.",
    color: "#a855f7",
    accentRgb: "168,85,247",
    status: "Coming Soon",
    tag: "Community",
    features: ["Live group sessions", "AI-moderated Q&A", "Peer matching", "Session recordings"],
  },
];

export default function UpcomingFeatures() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10" id="upcoming">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-bold tracking-widest text-gray-400 mb-6 label-pop-in">
          <Rocket className="w-3.5 h-3.5 text-orange-400" />
          ON THE HORIZON
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Upcoming{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-cyan-400 to-purple-400">
            Features
          </span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          We're building the future of AI-powered education. These features are in development and launching soon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {UPCOMING.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-[#07070a]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-7 transition-all duration-500 group-hover:border-white/[0.12] group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] group-hover:-translate-y-1 overflow-hidden">

                {/* Top accent line */}
                <div className="h-[2px] w-10 rounded-full mb-5 transition-all duration-500 group-hover:w-full" style={{ background: feature.color }} />

                {/* Status badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border"
                    style={{
                      color: feature.color,
                      borderColor: `${feature.color}30`,
                      background: `${feature.color}10`
                    }}
                  >
                    {feature.status}
                  </span>
                  <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                    {feature.tag}
                  </span>
                </div>

                {/* Icon */}
                <div className="relative mb-5">
                  <div
                    className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                    style={{ background: feature.color }}
                  />
                  <div
                    className="relative w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300"
                    style={{
                      background: `${feature.color}10`,
                      borderColor: `${feature.color}25`
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{feature.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed mb-5">{feature.description}</p>

                {/* Feature list */}
                <div className="space-y-2 mb-5">
                  {feature.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 rounded-full" style={{ background: feature.color }} />
                      {f}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-bold transition-all duration-300 group-hover:gap-3" style={{ color: feature.color }}>
                  <Lock className="w-3.5 h-3.5" />
                  <span>In Development</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100" />
                </div>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none -z-10"
                  style={{
                    background: `radial-gradient(600px circle at 50% 0%, ${feature.color}08, transparent 60%)`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 bg-gradient-to-r from-orange-500/5 via-cyan-500/5 to-purple-500/5 border border-white/[0.06] rounded-2xl p-8 text-center"
      >
        <h3 className="text-xl font-bold text-white mb-2">Want early access?</h3>
        <p className="text-gray-400 text-sm mb-4">Subscribe to get notified when these features launch. Early adopters get exclusive perks.</p>
        <div className="flex items-center justify-center gap-3">
          <input suppressHydrationWarning
            type="email"
            placeholder="your@email.com"
            className="bg-[#020203] border border-white/10 rounded-xl px-5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 w-64"
          />
          <button suppressHydrationWarning className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.2)] cta-shimmer">
            Notify Me
          </button>
        </div>
      </motion.div>
    </section>
  );
}

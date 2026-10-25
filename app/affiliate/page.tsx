"use client";
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, DollarSign, Users, Star, ArrowRight,
  CheckCircle, Zap, Globe, BookOpen, Sparkles, Shield, PlayCircle, MessageCircle, Hash
} from 'lucide-react';

const STATS = [
  { value: '30%', label: 'Commission per sale', color: '#a855f7' },
  { value: '₹150–₹300', label: 'Per referral earned', color: '#06b6d4' },
  { value: '30 days', label: 'Cookie duration', color: '#10b981' },
  { value: 'Weekly', label: 'Payout schedule', color: '#f59e0b' },
];

const HOW_IT_WORKS = [
  { num: '01', title: 'Apply', desc: 'Fill out the form below. We approve within 48 hours.' },
  { num: '02', title: 'Get Your Link', desc: 'We send you a unique tracking link and promo materials.' },
  { num: '03', title: 'Promote', desc: 'Share on YouTube, Instagram, Telegram, or your blog.' },
  { num: '04', title: 'Get Paid', desc: 'Earn 30% of every sale. Paid weekly via UPI/bank transfer.' },
];

const PLATFORMS = [
  { icon: <PlayCircle className="w-5 h-5" />, name: 'YouTube' },
  { icon: <MessageCircle className="w-5 h-5" />, name: 'Instagram' },
  { icon: <Hash className="w-5 h-5" />, name: 'Twitter/X' },
  { icon: <Globe className="w-5 h-5" />, name: 'Blog/Website' },
  { icon: <BookOpen className="w-5 h-5" />, name: 'Telegram' },
];

export default function AffiliatePage() {
  const [form, setForm] = useState({
    name: '', email: '', platform: '', audience: '', niche: '', reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else setError(data.error || 'Something went wrong');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)', filter: 'blur(60px)' }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-[10px] font-bold tracking-widest text-purple-400 mb-6">
              <Sparkles className="w-3 h-3" />
              EduAI Affiliate Program
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-5">
              Earn While You{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Educate
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Promote EduAI to students and earn <strong className="text-white">30% commission</strong> on every sale.
              With plans from ₹99–₹999, you earn <strong className="text-purple-400">₹30–₹300 per referral</strong>.
            </p>
            <a href="/dashboard/affiliate" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', boxShadow: '0 0 40px rgba(168,85,247,0.3)' }}>
              Open Affiliate Dashboard <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              className="rounded-2xl border p-5 text-center"
              style={{ backgroundColor: `${s.color}08`, borderColor: `${s.color}20` }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.num}
                className="relative text-center p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.3 }}>
                <div className="text-4xl font-black text-white/10 font-mono mb-3">{step.num}</div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-12 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-3">Works On Any Platform</h2>
          <p className="text-gray-500 text-center text-sm mb-8">YouTube, Instagram, blog, Telegram — if you have an audience, you can earn.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PLATFORMS.map(p => (
              <div key={p.name} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-gray-400 text-sm">
                {p.icon}
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-12 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-purple-500/20 p-8" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(6,182,212,0.04))' }}>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> What You Get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                '30% commission on every sale you generate',
                'Weekly UPI/bank transfer payouts',
                'Real-time dashboard to track clicks & earnings',
                'Promo materials, banners, and demo videos',
                'Dedicated affiliate support via WhatsApp',
                'Bonus ₹500 when you hit 10 conversions',
              ].map(perk => (
                <div key={perk} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 px-5">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3">Apply to Join</h2>
          <p className="text-gray-500 text-center text-sm mb-8">We approve 90% of applications within 48 hours.</p>

          <div className="text-center p-10 rounded-3xl border border-purple-500/20 bg-purple-500/5">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to start earning?</h3>
            <p className="text-gray-400 text-sm mb-8">We've automated our affiliate program! You no longer need to wait 48 hours for approval. Log in, claim your handle, and start sharing your link immediately.</p>
            <a href="/dashboard/affiliate" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}>
              <Zap className="w-4 h-4" /> Go To Affiliate Dashboard
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

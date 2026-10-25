"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Users, Gift, TrendingUp, Share2 } from 'lucide-react';

interface ReferralData {
  code: string;
  referralUrl: string;
  totalReferrals: number;
  convertedReferrals: number;
  creditsEarned: number;
}

export default function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const copyLink = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!data) return;
    const msg = encodeURIComponent(
      `🎓 Bhai/Behen, EduAI se GATE/UPSC prep ekdum easy ho gaya! AI study plans, flashcards, skill analysis — sab kuch. Mera link use karo, tujhe 25 FREE credits milenge:\n\n${data.referralUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-3xl p-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
        <div className="h-12 bg-white/5 rounded-xl" />
      </div>
    );
  }

  if (!data?.code) return null;

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl border border-purple-500/20"
      style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(6,182,212,0.04) 100%)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <Gift className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Refer & Earn</h3>
              <p className="text-[10px] text-gray-500">You earn 50 credits per paying referral</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            ACTIVE
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Referred', value: data.totalReferrals, icon: <Users className="w-3.5 h-3.5" />, color: '#06b6d4' },
            { label: 'Converted', value: data.convertedReferrals, icon: <TrendingUp className="w-3.5 h-3.5" />, color: '#a855f7' },
            { label: 'Credits Earned', value: data.creditsEarned, icon: <Gift className="w-3.5 h-3.5" />, color: '#10b981' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-xl p-3 text-center border"
              style={{ backgroundColor: `${stat.color}08`, borderColor: `${stat.color}20` }}
            >
              <div className="flex justify-center mb-1" style={{ color: stat.color }}>{stat.icon}</div>
              <div className="text-lg font-black text-white font-mono">{stat.value}</div>
              <div className="text-[9px] text-gray-600 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Referral Link */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
          <code className="flex-1 text-xs text-purple-300 font-mono truncate">{data.referralUrl}</code>
          <button
            onClick={copyLink}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: copied ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.15)',
              color: copied ? '#10b981' : '#a855f7',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(168,85,247,0.3)'}`,
            }}
          >
            {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share on WhatsApp
          </button>
          <button
            onClick={copyLink}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            Copy Code
          </button>
        </div>

        {/* How it works */}
        <p className="text-[10px] text-gray-600 mt-3 text-center">
          Friend signs up with your link → they get <span className="text-cyan-400">25 free credits</span> → you get <span className="text-purple-400">50 credits</span> when they pay
        </p>
      </div>
    </motion.div>
  );
}

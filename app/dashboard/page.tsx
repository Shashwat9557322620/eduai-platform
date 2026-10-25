"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { Ticket, RefreshCcw, ExternalLink, TrendingUp, Zap, BarChart3, Activity, Flame, Trophy, Target, Clock, BookOpen, Brain, Star, ChevronRight, Award, TrendingDown, Calendar } from 'lucide-react';
import CinematicBackground from '../components/CinematicBackground';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SkeletonDashboard } from '../components/ui/Skeleton';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import ReferralCard from '../components/ReferralCard';

// ── Removed Fake Data ──────────────────────────────────────
// Achievements, Streaks, Heatmaps, and Skill Radar removed per Phase 13.


// ── Stat Card ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, delay, sub }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  accent: string;
  delay: number;
  sub?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericValue) && typeof value === 'number';
  const [displayed, setDisplayed] = useState(isNumeric ? 0 : value);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isNumeric || hasRun.current || shouldReduceMotion) {
      setDisplayed(value);
      return;
    }
    hasRun.current = true;
    const dur = 1800;
    const startTime = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / dur, 1);
      setDisplayed(Math.floor(easeOut(progress) * numericValue));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplayed(value);
    };
    // Small delay to match card entrance animation
    setTimeout(() => requestAnimationFrame(tick), delay * 1000 + 300);
  }, [isNumeric, numericValue, value, delay, shouldReduceMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${accent}30, transparent 60%)` }} />
      <div className="relative bg-[#0a0a0f] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center icon-float"
            style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <div
          className="text-3xl font-black text-white font-mono tabular-nums"
          aria-label={`${label}: ${value}`}
        >
          {displayed}
        </div>
        {sub && <p className="text-[10px] text-gray-500 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

// Legacy fake components removed

// ── Custom Tooltip ────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">{String(label)}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────
function EmptyState({ emoji, title, subtitle, action }: { emoji: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="text-gray-500 font-mono text-sm">{title}</p>
      <p className="text-gray-600 text-xs mt-1">{subtitle}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [credits, setCredits] = useState<number>(0);
  const [planName, setPlanName] = useState('Free Trial');
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) { router.push('/'); return; }
    if (isLoaded && isSignedIn) loadData();
  }, [isLoaded, isSignedIn]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [creditsRes, historyRes, ticketsRes, refundsRes] = await Promise.all([
        fetch('/api/user/credits'), fetch('/api/history'),
        fetch('/api/user/support'), fetch('/api/user/refunds'),
      ]);
      if (creditsRes.ok) { const d = await creditsRes.json(); setCredits(d.credits || 0); setPlanName(d.plan_name || 'Free Trial'); }
      if (historyRes.ok) { const d = await historyRes.json(); setUsageHistory(d.history || []); }
      if (ticketsRes.ok) { const d = await ticketsRes.json(); setTickets(d.tickets || []); }
      if (refundsRes.ok) { const d = await refundsRes.json(); setRefunds(d.refunds || []); }
    } catch { /* noop */ } finally { setLoading(false); }
  };

  const chartData = useMemo(() => {
    if (!usageHistory.length) return [];
    const byDate: Record<string, number> = {};
    usageHistory.forEach((item: any) => {
      const date = item.created_at?.slice(0, 10) || 'Unknown';
      byDate[date] = (byDate[date] || 0) + (item.credits_used || 1);
    });
    return Object.entries(byDate).map(([date, credits]) => ({
      date: date.slice(5),
      credits,
    })).slice(-14);
  }, [usageHistory]);

  const toolBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    usageHistory.forEach((item: any) => {
      const name = item.tool_name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [usageHistory]);

  const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#f59e0b', '#34d399', '#6366f1'];
  const totalCreditsUsed = usageHistory.reduce((sum: number, item: any) => sum + (item.credits_used || 1), 0);
  const avgPerDay = chartData.length ? (totalCreditsUsed / chartData.length).toFixed(1) : '0';
  const peakDay = chartData.length ? chartData.reduce((max, d) => d.credits > max.credits ? d : max, chartData[0]) : null;

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-transparent text-white font-sans relative overflow-hidden">
      <CinematicBackground page="dashboard" />
      <Navbar />

      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : '👤'}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  {user?.firstName || 'Scholar'}
                </span>
              </h1>
              <p className="text-gray-500 text-sm font-mono">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="pt-4">
            <SkeletonDashboard />
          </div>
        ) : (
          <>
            {/* ── Stats Grid ──────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Zap} label="Credits Left" value={credits} accent="#06b6d4" delay={0} />
              <StatCard icon={BarChart3} label="Total Used" value={totalCreditsUsed} accent="#a855f7" delay={0.08} />
              <StatCard icon={Target} label="Avg / Day" value={avgPerDay} accent="#ec4899" delay={0.16} sub={peakDay ? `Peak: ${peakDay.date}` : ''} />
              <StatCard icon={Activity} label="Active Plan" value={planName} accent="#34d399" delay={0.24} />
            </div>

            {/* ── Charts Row ──────────────────────────────── */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                  className="lg:col-span-2 bg-[#0a0a0f] border border-white/[0.06] rounded-3xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Usage Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="credits" name="Credits" stroke="#06b6d4" strokeWidth={2} fill="url(#gradCyan)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                {toolBreakdown.length > 0 && (
                  <motion.div
                    className="bg-[#0a0a0f] border border-white/[0.06] rounded-3xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Tool Breakdown</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={toolBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                          {toolBreakdown.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {toolBreakdown.map((item, i) => (
                        <span key={item.name} className="text-[10px] font-mono flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-400">{item.name}</span>
                          <span className="text-gray-600">({item.value})</span>
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Quick Actions ───────────────── */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <motion.div
                className="bg-[#0a0a0f] border border-white/[0.06] rounded-3xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" /> Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { href: '/optimizer', label: 'Generate Study Plan', icon: '📋', color: 'cyan' },
                    { href: '/flashcards', label: 'Create Flashcards', icon: '🃏', color: 'purple' },
                    { href: '/analyzer', label: 'Analyze Skills', icon: '🎯', color: 'pink' },
                    { href: '/podcast', label: 'Generate Podcast', icon: '🎙️', color: 'amber' },
                  ].map((item, i) => (
                    <a key={item.href} href={item.href}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 group"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 ml-auto transition-colors" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Credits Card (with upgrade nudge when low) ──── */}
            <motion.div
              className="relative max-w-2xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              {credits <= 10 && credits > 0 && (
                <motion.div
                  className="mb-3 flex items-center gap-3 px-5 py-3 rounded-2xl border"
                  style={{
                    backgroundColor: credits <= 3 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                    borderColor: credits <= 3 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)',
                  }}
                  animate={{ boxShadow: credits <= 3 ? ['0 0 0px rgba(239,68,68,0)', '0 0 20px rgba(239,68,68,0.15)', '0 0 0px rgba(239,68,68,0)'] : [] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-4 h-4 flex-shrink-0" style={{ color: credits <= 3 ? '#ef4444' : '#f59e0b' }} />
                  <p className="text-sm flex-1" style={{ color: credits <= 3 ? '#fca5a5' : '#fcd34d' }}>
                    {credits <= 3
                      ? `🚨 Only ${credits} credit${credits === 1 ? '' : 's'} left — you're about to lose AI access!`
                      : `⚡ ${credits} credits left — top up before you run out`
                    }
                  </p>
                  <a
                    href="/billing"
                    className="flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold text-black transition-all hover:scale-105"
                    style={{ background: credits <= 3 ? '#ef4444' : '#f59e0b' }}
                  >
                    Upgrade →
                  </a>
                </motion.div>
              )}

              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl opacity-60 animate-pulse-soft" />
              <div className="relative bg-[#0a0a0f] border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Active Plan</p>
                    <h2 className="text-2xl font-bold"><span className="text-cyan-400">{planName}</span></h2>
                    <p className="text-gray-500 text-sm mt-2">Credits are consumed by AI engine requests</p>
                  </div>
                  <div className="text-center bg-white/[0.02] border border-white/5 px-8 py-6 rounded-2xl">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 font-mono">{credits}</span>
                    <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mt-1">Credits Left</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 mb-2">
                    <span>Credits Used</span>
                    <span>{totalCreditsUsed} / {totalCreditsUsed + credits}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${totalCreditsUsed + credits > 0 ? (totalCreditsUsed / (totalCreditsUsed + credits)) * 100 : 0}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a href="/billing" className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300">
                      Upgrade Plan
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>


            {/* ── Usage History Table ──────────────────────── */}
            <motion.div
              className="bg-[#0a0a0f] border border-white/[0.06] rounded-3xl p-8 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Usage History</h2>
                <button onClick={loadData} className="text-xs text-cyan-400 hover:text-cyan-300 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1">
                  <RefreshCcw className="w-3 h-3" /> Refresh
                </button>
              </div>
              {usageHistory.length === 0 ? (
                <EmptyState emoji="📊" title="No usage history yet" subtitle="Start using the AI tools to see your history" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" role="table">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                        <th className="text-left py-3 px-2" scope="col">Tool</th>
                        <th className="text-left py-3 px-2" scope="col">Input</th>
                        <th className="text-left py-3 px-2" scope="col">Date</th>
                        <th className="text-left py-3 px-2" scope="col">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {usageHistory.slice(0, 20).map((item: any, i: number) => (
                          <motion.tr
                            key={item.id}
                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <td className="py-3 px-2">
                              <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
                                {item.tool_name}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-gray-400 max-w-[200px] truncate text-xs">
                              {typeof item.input === 'string' ? item.input.slice(0, 50) : JSON.stringify(item.input)?.slice(0, 50)}
                            </td>
                            <td className="py-3 px-2 text-gray-500 text-xs font-mono">{item.created_at?.slice(0, 10)}</td>
                            <td className="py-3 px-2 font-mono text-xs">{item.credits_used || 1}</td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* ── Support & Refunds Row ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                className="bg-[#0a0a0f] border border-white/[0.06] rounded-3xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5" /> Support Tickets
                  </h2>
                  <a href="/support" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    New <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {tickets.length === 0 ? (
                  <EmptyState emoji="🎫" title="No tickets yet" subtitle="Submit a ticket if you need help"
                    action={<a href="/support" className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">Submit Ticket</a>} />
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {tickets.slice(0, 5).map((ticket: any) => {
                      const sc: Record<string, string> = {
                        open: 'text-red-400 bg-red-500/10 border-red-500/30',
                        in_progress: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
                        resolved: 'text-green-400 bg-green-500/10 border-green-500/30',
                      };
                      return (
                        <div key={ticket.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-cyan-500/20 transition-all">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${sc[ticket.status] || 'text-gray-400 bg-gray-500/10 border-gray-500/30'}`}>
                              {ticket.status?.replace('_', ' ') || 'open'}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">#{ticket.tracking_id}</span>
                          </div>
                          <p className="text-xs font-bold text-white">{ticket.subject || 'No Subject'}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              <motion.div
                className="bg-[#0a0a0f] border border-white/[0.06] rounded-3xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <RefreshCcw className="w-3.5 h-3.5" /> Refunds
                  </h2>
                  <a href="/refund-policy" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    Request <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {refunds.length === 0 ? (
                  <EmptyState emoji="💰" title="No refund requests" subtitle="Hopefully you won't need one!" />
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {refunds.slice(0, 5).map((refund: any) => (
                      <div key={refund.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-emerald-500/20 transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            refund.status === 'approved' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                            refund.status === 'denied' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                            'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                          }`}>{refund.status || 'pending'}</span>
                          {refund.amount > 0 && <span className="text-sm font-bold text-white font-mono">₹{refund.amount}</span>}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">{refund.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Referrals ────────────────────────────── */}
            <div className="mt-8 mb-8">
              <ReferralCard />
            </div>

            {user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
              <motion.div
                className="bg-[#0a0a0f] border border-amber-500/20 rounded-3xl p-6 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-300 uppercase tracking-widest">Admin Panel</h3>
                      <p className="text-xs text-gray-500 mt-1">Manage users, refunds, and tickets</p>
                    </div>
                  </div>
                  <a href="/admin" className="px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300">
                    Open Admin
                  </a>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
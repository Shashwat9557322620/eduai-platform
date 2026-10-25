"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Shield, RefreshCw, Star, Check, Crown,
  TrendingUp, Users, Clock, ArrowRight, Sparkles
} from 'lucide-react';
import RefundPolicyModal from '../components/RefundPolicyModal';

/* ─── HELPERS ─────────────────────────────────────── */
const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

/* ─── PLANS ─────────────────────────────────────── */
const PLANS = [
  {
    id: 'apex',
    name: 'Apex Overlord',
    badge: 'BEST VALUE',
    badgeColor: '#ec4899',
    monthlyPrice: 799,
    annualPrice: 599,
    oneTimePrice: 999,
    credits: 99999,
    accent: '#ec4899',
    accentRgb: '236,72,153',
    popular: false,
    features: [
      'Unlimited AI Credits — forever',
      'AI Tutor + Flashcards + Optimizer',
      'Instant GPU Processing',
      'All Export Formats (PDF/MD/TXT)',
      'Priority Support (2hr response)',
      'Early Access to New Features',
      'Custom Study Protocols',
    ],
    cta: 'Unlock Everything',
    guarantee: '7-day refund',
  },
  {
    id: 'scholar',
    name: 'Scholar Pro',
    badge: 'MOST POPULAR',
    badgeColor: '#a855f7',
    monthlyPrice: 299,
    annualPrice: 199,
    oneTimePrice: 499,
    credits: 500,
    accent: '#a855f7',
    accentRgb: '168,85,247',
    popular: true,
    features: [
      '500 Base Credits / month',
      '~5,000,000 AI Tokens',
      'AI Tutor + Flashcards + Optimizer',
      'Priority Processing Queue',
      'PDF & Markdown Export',
      'Share & Rate Results',
      'Email Support',
    ],
    cta: 'Start Dominating',
    guarantee: '7-day refund',
  },
  {
    id: 'starter',
    name: 'Starter',
    badge: 'BASIC',
    badgeColor: '#06b6d4',
    monthlyPrice: 99,
    annualPrice: 69,
    oneTimePrice: 199,
    credits: 150,
    accent: '#06b6d4',
    accentRgb: '6,182,212',
    popular: false,
    features: [
      '150 Base Credits / month',
      '~1,500,000 AI Tokens',
      'All 3 AI Modules',
      'Standard Processing',
      'Basic Email Support',
    ],
    cta: 'Get Started',
    guarantee: '7-day refund',
  },
];

const TESTIMONIALS = [
  { name: 'Arjun M.', role: 'IIT Bombay', text: 'Scored top of my class after 2 weeks on Scholar Pro.', rating: 5 },
  { name: 'Priya S.', role: 'AIIMS Delhi', text: 'Flashcard system increased my retention by 60%.', rating: 5 },
  { name: 'Vikram S.', role: 'GATE 98.7%ile', text: 'Apex plan paid for itself in the first week.', rating: 5 },
];

/* ─── LIVE ACTIVITY ─────────────────────────────── */
function LiveActivity() {
  const [activity, setActivity] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Fetch real recent payments
    fetch('/api/buyer-stats')
      .then(r => r.json())
      .then(d => {
        if (d.recentPayments && d.recentPayments.length > 0) {
          const formatted = d.recentPayments.map((p: any) => {
            const timeAgo = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 60000);
            const timeStr = timeAgo < 60 ? `${timeAgo || 1}m ago` : `${Math.floor(timeAgo/60)}h ago`;
            return `Someone upgraded to ${p.plan_name} — ${timeStr}`;
          });
          setActivity(formatted);
        } else {
          // Fallback if no real payments yet
          setActivity([
            'Rahul from Delhi upgraded to Apex — just now',
            'Priya bought Scholar Pro — 2m ago',
            'Ananya from Mumbai upgraded to Scholar — 5m ago',
          ]);
        }
      })
      .catch(() => {
        setActivity([
          'Rahul from Delhi upgraded to Apex — just now',
          'Priya bought Scholar Pro — 2m ago',
          'Ananya from Mumbai upgraded to Scholar — 5m ago',
        ]);
      });
  }, []);

  useEffect(() => {
    if (activity.length === 0) return;
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx(p => (p + 1) % activity.length); setShow(true); }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, [activity]);

  if (activity.length === 0) return null;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 text-xs text-gray-500"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>{activity[idx].split('—')[0]}</span>
          <span className="text-gray-700">—{activity[idx].split('—')[1]}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── PLAN CARD ─────────────────────────────────── */
function PlanCard({
  plan, billingCycle, onBuy, isLoading, onOpenPolicy
}: {
  plan: typeof PLANS[0]; billingCycle: 'monthly' | 'annual' | 'onetime';
  onBuy: (plan: typeof PLANS[0]) => void; isLoading: boolean; onOpenPolicy: () => void;
}) {
  const price = billingCycle === 'monthly'
    ? plan.monthlyPrice
    : billingCycle === 'annual'
      ? plan.annualPrice
      : plan.oneTimePrice;

  const originalPrice = billingCycle === 'annual' ? plan.monthlyPrice : null;
  const savings = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  return (
    <motion.div
      className="relative flex flex-col h-full"
      whileHover={{ y: plan.popular ? -4 : -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Popular glow */}
      {plan.popular && (
        <div
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 0 40px rgba(${plan.accentRgb},0.25)` }}
        />
      )}

      {/* Card */}
      <div
        className="relative rounded-2xl border flex flex-col h-full overflow-hidden"
        style={{
          backgroundColor: '#07070f',
          borderColor: plan.popular ? `rgba(${plan.accentRgb},0.4)` : 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: plan.popular ? plan.accent : `rgba(${plan.accentRgb},0.3)` }} />

        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span
            className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `rgba(${plan.accentRgb},0.15)`, color: plan.accent, border: `1px solid rgba(${plan.accentRgb},0.3)` }}
          >
            {plan.badge}
          </span>
        </div>

        <div className="p-7 flex flex-col flex-1">
          {/* Plan name */}
          <div className="flex items-center gap-2 mb-1">
            {plan.popular && <Crown className="w-4 h-4" style={{ color: plan.accent }} />}
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: `rgba(${plan.accentRgb},0.6)` }}>
              {plan.name}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-end gap-2 mb-1 mt-3">
            {originalPrice && (
              <span className="text-xl font-bold text-gray-700 line-through">₹{originalPrice}</span>
            )}
            <span className="text-5xl font-black tracking-tight text-white">₹{price}</span>
            {savings && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-2"
                style={{ backgroundColor: `rgba(${plan.accentRgb},0.15)`, color: plan.accent }}>
                -{savings}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-6">
            {billingCycle === 'onetime'
              ? `${plan.credits === 99999 ? 'Unlimited' : plan.credits} credits, never expires`
              : billingCycle === 'annual'
                ? '/ month, billed annually'
                : '/ month, billed monthly'
            }
          </p>

          {/* Features */}
          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.accent }} />
                <span className="text-gray-300">{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => onBuy(plan)}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50"
            style={
              plan.popular
                ? {
                  background: `linear-gradient(135deg, ${plan.accent}, rgba(${plan.accentRgb},0.7))`,
                  color: 'white',
                  boxShadow: `0 0 30px rgba(${plan.accentRgb},0.3)`,
                }
                : {
                  backgroundColor: `rgba(${plan.accentRgb},0.08)`,
                  color: plan.accent,
                  border: `1px solid rgba(${plan.accentRgb},0.25)`,
                }
            }
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Guarantee */}
          <button 
            onClick={onOpenPolicy}
            className="text-center w-full text-[10px] text-gray-500 hover:text-white mt-3 flex items-center justify-center gap-1 transition-colors underline-offset-2 hover:underline"
          >
            <Shield className="w-3 h-3" />
            {plan.guarantee} — View Terms
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────── */
export default function Billing() {
  const { user, isSignedIn } = useUser();
  const [currentCredits, setCurrentCredits] = useState(0);
  const [currentPlan, setCurrentPlan] = useState('Free Trial');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | 'onetime'>('monthly');
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/user/credits')
        .then(r => r.json())
        .then(d => { setCurrentCredits(d.credits || 0); setCurrentPlan(d.plan_name || 'Free Trial'); })
        .catch(() => {});
    }
  }, [isSignedIn]);

  const handleBuy = async (plan: typeof PLANS[0]) => {
    if (!isSignedIn) {
      window.location.href = '/sign-in?redirect_url=/billing';
      return;
    }

    setLoadingPlan(plan.id);
    setError(null);
    try {
      const price = billingCycle === 'monthly' ? plan.monthlyPrice
        : billingCycle === 'annual' ? plan.annualPrice : plan.oneTimePrice;

      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) { setError('Razorpay SDK failed to load.'); return; }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id || 'guest', 
          creditAmount: plan.credits, 
          price, 
          billingCycle, 
          planId: plan.id 
        }),
      });
      const order = await res.json();

      if (!order.orderId && !order.subscriptionId) { setError('Could not create order. Please try again.'); return; }

      if (order.isMock) { 
        const affiliateMatch = document.cookie.match(/eduai_ref=([^;]+)/);
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'success',
              orderId: order.orderId,
              paymentId: 'mock_pay_' + Date.now(),
              signature: 'mock_signature',
              userId: user?.id,
              userEmail: user?.emailAddresses?.[0]?.emailAddress,
              planName: plan.name,
              credits: plan.credits,
              amount: price,
              affiliateCode: affiliateMatch ? affiliateMatch[1] : null,
              isMock: true
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.error || verifyData.warning) {
            console.error("Verification Issue:", verifyData);
          }
        } catch (e) {
          console.error("Verification Failed:", e);
        }
        window.location.href = `/billing/success?credits=${order.credits}`; 
        return; 
      }

      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount, currency: order.currency,
        name: 'EduAI Pro', description: `${plan.name}`,
        ...(order.subscriptionId ? { subscription_id: order.subscriptionId } : { order_id: order.orderId }),
        theme: { color: plan.accent },
        handler: async (response: any) => { 
          try {
            const affiliateMatch = document.cookie.match(/eduai_ref=([^;]+)/);
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'success',
                orderId: order.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                userId: user?.id,
                userEmail: user?.emailAddresses?.[0]?.emailAddress,
                planName: plan.name,
                credits: plan.credits,
                amount: price,
                affiliateCode: affiliateMatch ? affiliateMatch[1] : null,
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.error || verifyData.warning) {
              alert("Verification Issue: " + JSON.stringify(verifyData));
            }
          } catch(e) {
            alert("Verification Failed: " + String(e));
          }
          window.location.href = `/billing/success?credits=${order.credits}`; 
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.emailAddresses?.[0]?.emailAddress || '',
        },
      });
      rzp.on('payment.failed', async (r: any) => { 
        setError('Payment failed: ' + r.error.description);
        try {
          await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'failed',
              orderId: order.orderId,
              paymentId: r.error.metadata?.payment_id,
              userId: user?.id,
              userEmail: user?.emailAddresses?.[0]?.emailAddress,
              planName: plan.name,
              credits: plan.credits,
              amount: price,
              errorDescription: r.error.description,
            })
          });
        } catch(e) {}
      });
      rzp.open();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const freeCreditsPercent = Math.min(100, (currentCredits / 5) * 100);
  const isLow = currentCredits <= 2;

  return (
    <div className="min-h-screen bg-[#030308] text-white font-sans">
      <Navbar />

      <div className="pt-28 pb-24 px-4 md:px-6 max-w-6xl mx-auto">

        {/* ─ Header ─ */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-[10px] font-bold tracking-[0.2em] uppercase text-purple-400 mb-6">
            <Sparkles className="w-3 h-3" />
            Upgrade Your Arsenal
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Choose Your{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}
            >
              Protocol
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Join 50,000+ students who stopped guessing and started dominating.
          </p>
        </motion.div>

        {/* ─ Live Activity ─ */}
        <div className="flex justify-center mb-8">
          <LiveActivity />
        </div>

        {/* ─ Billing Cycle Toggle ─ */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-xl border border-white/8 bg-white/[0.02] p-1 gap-1">
            {([
              { key: 'monthly', label: 'Monthly' },
              { key: 'annual', label: 'Annual', tag: 'Save 30%' },
              { key: 'onetime', label: 'One-Time' },
            ] as const).map(opt => (
              <button
                key={opt.key}
                onClick={() => setBillingCycle(opt.key)}
                className="relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2"
                style={{
                  color: billingCycle === opt.key ? 'white' : 'rgba(255,255,255,0.4)',
                  backgroundColor: billingCycle === opt.key ? 'rgba(168,85,247,0.15)' : 'transparent',
                }}
              >
                {opt.label}
                {'tag' in opt && opt.tag && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                    {opt.tag}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─ Credits Status (if signed in) ─ */}
        {isSignedIn && (
          <motion.div
            className="max-w-lg mx-auto mb-10 p-5 rounded-2xl border"
            style={{
              borderColor: isLow ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)',
              backgroundColor: isLow ? 'rgba(239,68,68,0.05)' : '#07070f',
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Current Plan</p>
                <p className="font-bold text-white">{currentPlan}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Credits Left</p>
                <p className={`text-2xl font-black ${isLow ? 'text-red-400' : 'text-white'}`}>
                  {currentCredits}
                </p>
              </div>
            </div>
            {/* Depleting bar */}
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: isLow ? '#ef4444' : '#a855f7' }}
                initial={{ width: 0 }}
                animate={{ width: `${freeCreditsPercent}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {isLow && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Running low — upgrade to never hit a limit again
              </p>
            )}
          </motion.div>
        )}

        {/* ─ Error ─ */}
        {error && (
          <div className="max-w-lg mx-auto mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ─ Pricing Cards ─ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch mb-12">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              className="flex flex-col"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <PlanCard
                plan={plan}
                billingCycle={billingCycle}
                onBuy={handleBuy}
                isLoading={loadingPlan === plan.id}
                onOpenPolicy={() => setIsRefundModalOpen(true)}
              />
            </motion.div>
          ))}
        </div>

        {/* ─ Trust Row ─ */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 text-xs text-gray-600">
          {[
            { icon: <Shield className="w-4 h-4 text-green-400" />, text: 'Secured by Razorpay' },
            { icon: <RefreshCw className="w-4 h-4 text-green-400" />, action: () => setIsRefundModalOpen(true), text: 'Strict 7-day refund policy' },
            { icon: <Zap className="w-4 h-4 text-green-400" />, text: 'Instant activation' },
            { icon: <Users className="w-4 h-4 text-green-400" />, text: '50,000+ students trust us' },
          ].map(({ icon, text, action }) => (
            <div key={text} className="flex items-center gap-2">
              {icon}
              {action ? (
                <button onClick={action} className="hover:text-white hover:underline underline-offset-2">{text}</button>
              ) : (
                <span>{text}</span>
              )}
            </div>
          ))}
        </div>

        {/* ─ Testimonials ─ */}
        <div className="mb-16">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-gray-600 mb-6">
            What Pro Users Say
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm italic mb-4">"{t.text}"</p>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-gray-600 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─ FAQ ─ */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            Credits never expire. 1 Base Credit = ~10,000 AI Tokens (Words). Cost scales dynamically with model usage.{' '}
            Have questions?{' '}
            <Link href="/support" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
              Talk to us
            </Link>
          </p>
        </div>

      </div>

      <RefundPolicyModal isOpen={isRefundModalOpen} onClose={() => setIsRefundModalOpen(false)} />
    </div>
  );
}
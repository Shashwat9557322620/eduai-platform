"use client";
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import PricingGradientBackground from '../components/backgrounds/PricingGradientBackground';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PLANS = [
  {
    name: 'Starter Core',
    tag: '01 // BASIC',
    price: 199,
    credits: 150,
    accent: '#06b6d4',
    accentRgb: '6,182,212',
    features: ['150 AI Engine Credits', 'All 3 AI Modules', 'Basic Priority Queue', 'Email Support'],
    popular: false,
  },
  {
    name: 'Scholar Protocol',
    tag: '02 // RECOMMENDED',
    price: 499,
    credits: 500,
    accent: '#a855f7',
    accentRgb: '168,85,247',
    features: ['500 AI Engine Credits', 'All 3 AI Modules', 'Priority Processing', 'Export as PDF/TXT/MD', 'Share & Rate Results', 'Priority Support'],
    popular: true,
  },
  {
    name: 'Apex Overlord',
    tag: '03 // UNLIMITED',
    price: 999,
    credits: 99999,
    accent: '#ec4899',
    accentRgb: '236,72,153',
    features: ['Unlimited AI Credits', 'All 3 AI Modules', 'Instant Processing', 'All Export Formats', 'Priority Support', 'Early Access Features', 'Custom Study Plans'],
    popular: false,
  },
];

export default function Billing() {
  const { user, isSignedIn } = useUser();
  const [currentCredits, setCurrentCredits] = useState(0);
  const [currentPlan, setCurrentPlan] = useState('Free Trial');
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isSignedIn) {
      fetch('/api/user/credits')
        .then(res => res.json())
        .then(data => {
          setCurrentCredits(data.credits || 0);
          setCurrentPlan(data.plan_name || 'Free Trial');
        })
        .catch(() => {});
    }
  }, [isSignedIn]);

  const handlePurchase = async (planName: string, creditAmount: number, price: number) => {
    setIsRedirecting(planName);
    setError(null);
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setError('Razorpay SDK failed to load. Check your connection.');
        setIsRedirecting(null);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'guest', creditAmount, price }),
      });
      
      const orderData = await response.json();
      if (!orderData.orderId) {
        setError("Server error. Could not create order.");
        setIsRedirecting(null);
        return;
      }

      if (orderData.isMock) {
        // Dev bypass mode: Keys missing, directly simulate success
        window.location.href = `/billing/success?credits=${orderData.credits}`;
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EduAI Pro',
        description: `${planName} - ${creditAmount} Credits`,
        order_id: orderData.orderId,
        theme: { color: '#06b6d4' },
        handler: function () {
          window.location.href = `/billing/success?credits=${orderData.credits}`;
        },
        prefill: {
          name: user?.fullName || 'Premium User',
          email: user?.emailAddresses?.[0]?.emailAddress || 'user@eduai.com',
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        setError("Payment Failed: " + response.error.description);
      });
      paymentObject.open();
    } catch {
      setError("Billing system error. Please try again.");
    } finally {
      setIsRedirecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans relative selection:bg-purple-500/30">
      <PricingGradientBackground />
      <Navbar />

      <div className="pt-36 pb-20 px-4 md:px-8 max-w-6xl mx-auto relative z-10">
        
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-3 rounded-xl text-sm font-mono flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
            {error}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold tracking-widest text-purple-400 mb-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            UPGRADE YOUR AI POWER
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              Arsenal.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Unlock unlimited AI-powered study tools. One-time payments, no subscriptions.
          </p>
        </div>

        {/* Current Balance */}
        <div className="max-w-2xl mx-auto mb-16 p-6 rounded-2xl bg-[#07070a]/80 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Current Plan</p>
            <p className="text-lg font-bold text-white">{currentPlan}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Credits Left</p>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{currentCredits}</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative group rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                plan.popular ? 'border-2 md:scale-105 z-10' : 'border border-white/5 hover:border-white/10'
              }`}
              style={plan.popular ? { borderColor: `${plan.accent}40` } : {}}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-b-xl text-[10px] font-black tracking-[0.2em] uppercase text-white" style={{ background: plan.accent }}>
                  Most Popular
                </div>
              )}

              {/* Background */}
              <div className="absolute inset-0 bg-[#07070a]/90" />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: `radial-gradient(circle at 50% 0%, ${plan.accent}10, transparent 60%)` }}
              />

              <div className="relative p-8 flex flex-col h-full">
                {/* Tag */}
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2" style={{ color: plan.accent }}>
                  {plan.tag}
                </span>

                {/* Name */}
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{plan.name}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black font-mono text-white">₹{plan.price}</span>
                  <span className="text-gray-500 text-xs">/ One Time</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke={plan.accent} viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePurchase(plan.name, plan.credits, plan.price)}
                  disabled={isRedirecting !== null}
                  className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                    plan.popular
                      ? 'text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:scale-[1.02]'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={plan.popular ? { background: `linear-gradient(135deg, ${plan.accent}, ${plan.accent}cc)` } : {}}
                >
                  {isRedirecting === plan.name ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : (
                    `Get ${plan.name}`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Secure Razorpay Payment
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Instant Credit Activation
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Full Refund Policy
          </div>
        </div>

        {/* FAQ snippet */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Credits never expire. Each AI generation uses 1 credit. 
            Need help? <Link href="/support" className="text-cyan-400 hover:text-cyan-300 underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
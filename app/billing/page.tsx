"use client";
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MagneticCursor from '../components/MagneticCursor';
import { useUser } from '@clerk/nextjs';
import UnifiedBackground from '../components/UnifiedBackground';
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Billing() {
  const { user, isSignedIn } = useUser();
  const [currentCredits, setCurrentCredits] = useState(50);
  const [currentPlan, setCurrentPlan] = useState('Free Trial');
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load actual user credits
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
        setError('Razorpay SDK failed to load. Please check your internet connection.');
        setIsRedirecting(null);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest',
          creditAmount: creditAmount,
          price: price 
        }),
      });
      
      const orderData = await response.json();

      if (!orderData.orderId) {
        setError("Server error. Razorpay order could not be created.");
        setIsRedirecting(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EduAI Pro',
        description: `Upgrade to ${planName} (${creditAmount} Credits)`,
        order_id: orderData.orderId,
        theme: {
          color: '#06b6d4' 
        },
        handler: function (response: any) {
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

    } catch (err) {
      setError("Billing system error. Please try again later.");
    } finally {
      setIsRedirecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
      
      <UnifiedBackground />

      <MagneticCursor />
      <Navbar />

      <div className="pt-36 pb-20 px-4 md:px-8 max-w-6xl mx-auto relative z-10 min-h-screen flex flex-col justify-center">
        
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-3 animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
            {error}
          </div>
        )}

        <div className="text-center mb-16">
          <span className="text-xs font-mono text-cyan-400 tracking-[0.3em] uppercase border border-cyan-500/20 px-4 py-1.5 rounded-full bg-cyan-500/5">
            Billing & Core Quota
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-6 mb-4 uppercase">
            Fuel Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">Arsenal.</span>
          </h1>
        </div>

        {/* Current Balance */}
        <div className="relative max-w-3xl mx-auto w-full rounded-3xl p-[1px] overflow-hidden mb-16 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse"></div>
          <div className="relative bg-[#07070a]/90 backdrop-blur-3xl rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
            <div>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Current Active Account State</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">Plan Ecosystem: <span className="text-cyan-400">{currentPlan}</span></h2>
              <p className="text-gray-400 text-sm mt-2 max-w-md font-light">Credits are consumed automatically every time the Curriculum Engine or AI modules deconstruct structural layouts.</p>
            </div>
            <div className="text-center md:text-right bg-white/[0.02] border border-white/5 px-8 py-6 rounded-2xl min-w-[200px] backdrop-blur-sm shadow-inner">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 font-mono">{currentCredits}</span>
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mt-1">AI Engine Credits Remaining</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch w-full mt-6">

          {/* Tier 1 */}
          <div className="premium-pricing-card group">
            {/* The hidden layer for effects only */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden z-0">
              <div className="card-bg-glow bg-cyan-500/10"></div>
              <div className="card-border-line"></div>
            </div>
            
            <div className="card-main-content">
              <span className="tier-tag text-cyan-400">01 // BASIC</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-2 tracking-tight whitespace-normal break-words leading-tight">Starter Core</h3>
              <div className="flex items-baseline gap-1 mb-8 mt-2">
                <span className="text-4xl font-black font-mono">₹199</span>
                <span className="text-gray-500 text-xs">/ One Time</span>
              </div>
              <ul className="space-y-4 mb-10 text-sm text-gray-400 font-medium flex-grow">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]"></span> 150 Engine Credits</li>
              </ul>
              <button 
                onClick={() => handlePurchase('Starter Core', 150, 199)}
                disabled={isRedirecting !== null}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all"
              >
                {isRedirecting === 'Starter Core' ? 'Loading...' : 'Deploy Starter Core'}
              </button>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="premium-pricing-card group relative highlighted-card">
            {/* 🔥 TAG KO AB POORI AZAADI HAI (Outside hidden wrapper) 🔥 */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30 bg-gradient-to-r from-purple-500 to-indigo-500 text-black text-[10px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full uppercase shadow-[0_0_25px_rgba(168,85,247,0.5)] whitespace-nowrap">
              Most Popular Core
            </div>

            {/* Background effects clipped to card shape */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden z-0">
              <div className="card-bg-glow bg-purple-500/20 opacity-100"></div>
              <div className="card-border-line !bg-gradient-to-r !from-purple-500 !to-indigo-500 !opacity-40 group-hover:!opacity-100"></div>
            </div>

            <div className="card-main-content !border-purple-500/20 bg-[#09090e]/95">
              <span className="tier-tag text-purple-400">02 // RECOMMENDED</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-2 tracking-tight whitespace-normal break-words leading-tight">Scholar Protocol</h3>
              <div className="flex items-baseline gap-1 mb-8 mt-2">
                <span className="text-4xl font-black font-mono">₹499</span>
                <span className="text-gray-500 text-xs">/ One Time</span>
              </div>
              <ul className="space-y-4 mb-10 text-sm text-gray-300 font-medium flex-grow">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_#a855f7]"></span> 500 Engine Credits</li>
              </ul>
              <button 
                onClick={() => handlePurchase('Scholar Protocol', 500, 499)}
                disabled={isRedirecting !== null}
                className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-purple-500 to-indigo-600 text-white transition-all transform hover:scale-[1.02]"
              >
                {isRedirecting === 'Scholar Protocol' ? 'Loading...' : 'Deploy Scholar Core'}
              </button>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="premium-pricing-card group">
            {/* The hidden layer for effects only */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden z-0">
              <div className="card-bg-glow bg-fuchsia-500/10"></div>
              <div className="card-border-line"></div>
            </div>

            <div className="card-main-content">
              <span className="tier-tag text-fuchsia-400">03 // UNLIMITED</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-2 tracking-tight whitespace-normal break-words leading-tight">Apex Overlord</h3>
              <div className="flex items-baseline gap-1 mb-8 mt-2">
                <span className="text-4xl font-black font-mono">₹999</span>
                <span className="text-gray-500 text-xs">/ Month</span>
              </div>
              <ul className="space-y-4 mb-10 text-sm text-gray-400 font-medium flex-grow">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full shadow-[0_0_8px_#d946ef]"></span> Unlimited High-Speed Credits</li>
              </ul>
              <button 
                onClick={() => handlePurchase('Apex Overlord', 99999, 999)}
                disabled={isRedirecting !== null}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all"
              >
                {isRedirecting === 'Apex Overlord' ? 'Loading...' : 'Deploy Apex Overlord'}
              </button>
            </div>
          </div>

        </div>

      </div>

      </div>
  );
}
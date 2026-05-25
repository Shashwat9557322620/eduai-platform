"use client";
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MouseTrail from '../components/MouseTrail';

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
  const [currentCredits, setCurrentCredits] = useState(50);
  const [currentPlan, setCurrentPlan] = useState('Free Trial');
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);

  const handlePurchase = async (planName: string, creditAmount: number, price: number) => {
    setIsRedirecting(planName);
    
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setIsRedirecting(null);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_123', 
          creditAmount: creditAmount,
          price: price 
        }),
      });
      
      const orderData = await response.json();

      if (!orderData.orderId) {
        alert("Server error. Razorpay order create nahi kar paya.");
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
          console.log("Payment Success ID:", response.razorpay_payment_id);
          window.location.href = `/billing/success?credits=${orderData.credits}`;
        },
        prefill: {
          name: 'Premium User',
          email: 'user@eduai.com',
          contact: '9999999999' 
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
      
      paymentObject.open();

    } catch (err) {
      alert("Billing system error.");
    } finally {
      setIsRedirecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-center">
        <div className="w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full bg-indigo-900/10 blur-[160px] animate-pulse"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="hidden md:block"><MouseTrail /></div>
      <Navbar />

      <div className="pt-36 pb-20 px-4 md:px-8 max-w-6xl mx-auto relative z-10 min-h-screen flex flex-col justify-center">
        
        <div className="text-center mb-16 animate-fade-in">
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

      {/* Bulletproof CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .premium-pricing-card { 
          position: relative; 
          border-radius: 2rem; 
          padding: 1.5px; 
          /* 🔥 THE FIX: VISIBLE 🔥 */
          overflow: visible; 
          background: #000; 
          display: flex; 
          flex-direction: column; 
          height: 100%; 
          transform: translateY(0); 
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), 
                      box-shadow 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .premium-pricing-card:hover { 
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); 
        }

        .card-bg-glow { 
          position: absolute; 
          top: -20%; 
          right: -20%; 
          width: 70%; 
          height: 70%; 
          border-radius: 50%; 
          filter: blur(60px); 
          opacity: 0; 
          pointer-events: none; 
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1); 
        }
        
        .premium-pricing-card:hover .card-bg-glow { 
          opacity: 1; 
        }

        .card-border-line { 
          position: absolute; 
          inset: 0; 
          border-radius: 2rem; 
          background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%); 
          z-index: 1; 
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), 
                      background 0.6s cubic-bezier(0.22, 1, 0.36, 1); 
        }
        
        .premium-pricing-card:hover .card-border-line { 
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%); 
        }

        .card-main-content { 
          position: relative; 
          background: rgba(10, 10, 14, 0.95); 
          backdrop-filter: blur(20px); 
          border-radius: calc(2rem - 1.5px); 
          padding: 3rem 2rem; 
          display: flex; 
          flex-direction: column; 
          height: 100%; 
          z-index: 10; 
          border: 1px solid rgba(255,255,255,0.02); 
        }
        
        .tier-tag { font-family: monospace; font-size: 10px; letter-spacing: 0.2em; font-weight: bold; text-transform: uppercase; }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.8s ease forwards; }
      `}} />
    </div>
  );
}
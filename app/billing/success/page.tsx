"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { Suspense } from 'react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const credits = searchParams.get('credits') || '0';

  return (
    <div className="min-h-screen bg-[#020203] text-white flex flex-col items-center justify-center relative overflow-hidden">
      <Navbar />
      
      {/* Success Glows */}
      <div className="absolute w-[50vw] h-[50vw] bg-green-500/10 rounded-full blur-[150px] animate-pulse"></div>
      
      <div className="relative z-10 text-center p-8 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.1)] max-w-lg w-full mx-4">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        
        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Payment Successful</h1>
        <p className="text-gray-400 mb-8 font-light">Your arsenal has been upgraded. <strong className="text-white">{credits} Credits</strong> have been added to your account.</p>
        
        <Link href="/optimizer" className="inline-block w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-white text-black hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Return to Optimizer
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020203] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

"use client";
import React from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

interface RefundPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RefundPolicyModal({ isOpen, onClose }: RefundPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#050508] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-white/[0.02]">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Strict Refund Policy</h2>
            <p className="text-xs text-gray-400 font-mono mt-1">To protect against abuse, we enforce strict guidelines.</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest text-cyan-400">1. The 7-Day Guarantee (Fair Use)</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              We offer a 7-day money-back guarantee for <strong className="text-white">genuine users</strong> who are unsatisfied with the platform. However, to prevent abuse (users buying, generating all study material, and refunding), the following conditions <strong className="text-red-400">MUST</strong> be met:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>You must request the refund within <strong>7 days</strong> of the exact purchase timestamp.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>You must have consumed <strong>less than 10%</strong> of the allocated credits in your plan. If you have heavily utilized the AI models, you are not eligible for a refund.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest text-cyan-400">2. Zero Tolerance for Abuse</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Refunds will be immediately <strong>denied</strong> and accounts may be permanently banned without notice under the following circumstances:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span>Account sharing (detected multiple IPs using the same account simultaneously).</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span>Automated scraping, botting, or API abuse.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span>Violating our Terms of Service (e.g., generating illegal or explicit content).</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest text-cyan-400">3. Non-Refundable Items</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              "One-Time" top-up credits are strictly non-refundable once purchased. Renewals of monthly/annual subscriptions must be cancelled before the billing cycle; we do not offer pro-rated refunds for forgetting to cancel.
            </p>
          </div>

          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <p className="text-xs text-cyan-300 font-medium leading-relaxed">
              <strong>Why so strict?</strong> AI processing costs real money. Every prompt you run costs us server and GPU time. We want to provide the best tools for serious students, and preventing refund-fraud allows us to keep our prices low for everyone.
            </p>
          </div>

        </div>

        <div className="p-5 border-t border-white/10 bg-black/40 text-center">
          <p className="text-xs text-gray-500 mb-3">By purchasing a plan, you explicitly agree to these terms.</p>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from 'react';
import Navbar from '../components/Navbar';
import BlogArticleBackground from '../components/backgrounds/BlogArticleBackground';
import { RefreshCcw, CheckCircle2, XCircle, Clock, Mail, ArrowUpRight, AlertTriangle, Send, Loader2 } from 'lucide-react';

const STEPS = [
  { icon: Mail, title: 'Submit Request', desc: 'Fill out the refund request form below with your order details and reason.' },
  { icon: Clock, title: 'Under Review', desc: 'Our team reviews your request within 2-3 business days.' },
  { icon: CheckCircle2, title: 'Approved / Denied', desc: 'You will receive an email with the decision and any admin notes.' },
  { icon: RefreshCcw, title: 'Refund Processed', desc: 'If approved, funds are credited to your original payment method within 5-7 days.' },
];

export default function RefundPolicy() {
  const [formData, setFormData] = useState({
    email: '',
    orderId: '',
    amount: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.reason) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: formData.email,
          order_id: formData.orderId,
          amount: formData.amount ? parseInt(formData.amount) : 0,
          reason: formData.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans relative overflow-hidden">
      <BlogArticleBackground />

      <Navbar />

      <div className="relative z-10 pt-36 pb-20 px-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold tracking-widest mb-6 animate-shimmer-overlay shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <RefreshCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-300 uppercase">Refund & Cancellation</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Refund</span> Policy
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Last updated: January 2025 &nbsp;·&nbsp; We strive to be fair and transparent with all refund requests.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="bg-[#07070a] border border-white/[0.06] rounded-xl p-6 text-center hover:border-emerald-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Policy Content + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Policy Details */}
          <div className="space-y-6">
            <div className="bg-[#07070a] border border-emerald-500/20 rounded-2xl p-8">
              <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Eligible for Refund
              </h2>
              <ul className="space-y-3">
                {[
                  'Request made within 7 days of purchase',
                  'Less than 10% of purchased credits consumed',
                  'Account in good standing',
                  'Standard credit pack purchases (not promotional)',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#07070a] border border-red-500/20 rounded-2xl p-8">
              <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Not Eligible
              </h2>
              <ul className="space-y-3">
                {[
                  'Purchases made more than 7 days ago',
                  'Credits that have been consumed for AI generation',
                  'Promotional, discounted, or free trial credits',
                  'Accounts with a history of multiple refund requests',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#07070a] border border-white/[0.06] rounded-2xl p-8">
              <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Processing Timeline
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Refund requests are reviewed within <strong className="text-white">2-3 business days</strong>. 
                If approved, the amount is credited to your original payment method within <strong className="text-white">5-7 business days</strong>. 
                You will receive email notifications at every stage of the process.
              </p>
            </div>
          </div>

          {/* Refund Request Form */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-green-500/20 to-emerald-600/20 rounded-3xl opacity-60 group-hover:opacity-90 transition duration-700"></div>
            <div className="relative bg-[#07070a] border border-white/[0.06] rounded-3xl p-8">
              
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Request Submitted!</h3>
                  <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                    Your refund request has been received. You will receive an email update within 2-3 business days.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ email: '', orderId: '', amount: '', reason: '' }); }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Request a Refund</h2>
                      <p className="text-xs text-gray-500">All fields marked * are required</p>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
                      <XCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                          Order ID
                        </label>
                        <input
                          type="text"
                          value={formData.orderId}
                          onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                          placeholder="Optional"
                          className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          placeholder="Optional"
                          className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Reason for Refund *
                      </label>
                      <textarea
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Please describe why you are requesting a refund..."
                        rows={4}
                        className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all text-sm resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Submit Refund Request</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-[#07070a] border border-white/[0.06] rounded-3xl p-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Need help with your refund request?</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Contact our support team for any questions about the refund process.
          </p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
          >
            Contact Support <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}

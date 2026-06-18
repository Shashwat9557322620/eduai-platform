"use client";
import { useState } from 'react';
import Navbar from '../components/Navbar';
import SupportSignalBackground from '../components/backgrounds/SupportSignalBackground';
import { 
  MessageCircle, Send, Search, Package, 
  CheckCircle2, Clock, AlertCircle, Loader2, 
  ArrowUpRight, ChevronDown, Ticket
} from 'lucide-react';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');
  
  // Submit ticket form
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; trackingId?: string; error?: string } | null>(null);

  // Track ticket form
  const [trackingId, setTrackingId] = useState('');
  const [trackEmail, setTrackEmail] = useState('');
  const [tracking, setTracking] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitResult({ success: true, trackingId: data.tracking_id });
    } catch (err: any) {
      setSubmitResult({ success: false, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    setTracking(true);
    setTrackError(null);
    setTicketData(null);
    try {
      const params = new URLSearchParams({ id: trackingId });
      if (trackEmail) params.append('email', trackEmail);
      const res = await fetch(`/api/support/track?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTicketData(data.ticket);
    } catch (err: any) {
      setTrackError(err.message);
    } finally {
      setTracking(false);
    }
  };

  const statusConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
    open: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertCircle },
    in_progress: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Clock },
    resolved: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle2 },
    closed: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: CheckCircle2 },
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white relative overflow-hidden">
      <SupportSignalBackground />

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-24">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold tracking-widest mb-6 animate-shimmer-overlay shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-300 uppercase">Help Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">Support</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Need help? Submit a ticket or track an existing request using your tracking ID.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'submit'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:text-white hover:scale-[1.02] active:scale-95'
            }`}
          >
            <Send className="w-4 h-4" />
            Submit Ticket
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'track'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:text-white hover:scale-[1.02] active:scale-95'
            }`}
          >
            <Search className="w-4 h-4" />
            Track Request
          </button>
        </div>

        {/* Submit Ticket Form */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 via-indigo-500/20 to-purple-600/20 rounded-3xl opacity-60 group-hover:opacity-90 transition duration-700"></div>
              <div className="relative bg-[#07070a] border border-white/[0.06] rounded-3xl p-8">
                
                {submitResult?.success ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ticket Created!</h3>
                    <div className="inline-block bg-[#020203] border border-cyan-500/20 rounded-xl px-6 py-4 mb-4">
                      <p className="text-xs text-gray-500 font-mono mb-1">Your Tracking ID</p>
                      <p className="text-2xl font-black text-cyan-400 font-mono tracking-wider">{submitResult.trackingId}</p>
                    </div>
                    <p className="text-gray-400 mb-6 text-sm">
                      A confirmation email has been sent to <strong className="text-white">{email}</strong>. Use the tracking ID to check your ticket status.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                      <button onClick={() => { setActiveTab('track'); setTrackingId(submitResult.trackingId || ''); }}
                                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                      >
                        Track Now <Search className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSubmitResult(null); setEmail(''); setSubject(''); setMessage(''); }}
                                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-200"
                      >
                        New Ticket
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Submit a Support Ticket</h2>
                        <p className="text-xs text-gray-500">We typically respond within 24 hours</p>
                      </div>
                    </div>

                    {submitResult?.error && (
                      <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {submitResult.error}
                      </div>
                    )}

                    <form onSubmit={handleSubmitTicket} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email *</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subject</label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Brief title for your issue"
                          className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message *</label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Describe your issue in detail..."
                          rows={5}
                          className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 text-sm resize-none"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                        ) : (
                          <><Send className="w-4 h-4" /> Submit Ticket</>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Track Ticket */}
        {activeTab === 'track' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#07070a] border border-white/[0.06] rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Track Your Request</h2>
                  <p className="text-xs text-gray-500">Enter the tracking ID from your confirmation email</p>
                </div>
              </div>

              <form onSubmit={handleTrackTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tracking ID *</label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                    placeholder="EDU-XXXXXXXX"
                    className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 text-sm font-mono uppercase tracking-wider"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email (for verification)</label>
                  <input
                    type="email"
                    value={trackEmail}
                    onChange={(e) => setTrackEmail(e.target.value)}
                    placeholder="your@email.com (optional)"
                    className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={tracking || !trackingId}
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {tracking ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
                  ) : (
                    <><Search className="w-4 h-4" /> Track Request</>
                  )}
                </button>
              </form>
            </div>

            {/* Ticket Status Result */}
            {trackError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 font-bold mb-1">Ticket Not Found</p>
                <p className="text-gray-500 text-sm">{trackError}</p>
                <p className="text-xs text-gray-600 mt-3">Check your tracking ID and try again, or submit a new ticket.</p>
              </div>
            )}

            {ticketData && (
              <div className="bg-[#07070a] border border-white/[0.06] rounded-3xl overflow-hidden">
                {/* Status Header */}
                <div className={`p-6 border-b border-white/[0.06] flex items-center justify-between ${
                  ticketData.status === 'resolved' ? 'bg-green-500/5' : 
                  ticketData.status === 'in_progress' ? 'bg-yellow-500/5' : 'bg-red-500/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border ${
                      statusConfig[ticketData.status]?.color || 'text-gray-400'
                    } ${statusConfig[ticketData.status]?.bg || 'bg-gray-500/10'} ${statusConfig[ticketData.status]?.border || 'border-gray-500/30'}`}>
                      {ticketData.status?.replace('_', ' ') || 'open'}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">#{ticketData.tracking_id}</span>
                  </div>
                  <span className="text-xs text-gray-600">{new Date(ticketData.created_at).toLocaleDateString()}</span>
                </div>

                <div className="p-6 space-y-4">
                  {ticketData.subject && (
                    <div>
                      <p className="text-xs text-gray-500 font-mono mb-1">Subject</p>
                      <p className="text-white font-bold">{ticketData.subject}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 font-mono mb-1">Message</p>
                    <p className="text-gray-400 text-sm">{ticketData.message}</p>
                  </div>
                  {ticketData.admin_response && (
                    <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4">
                      <p className="text-xs text-cyan-400 font-mono mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Admin Response
                      </p>
                      <p className="text-gray-300 text-sm">{ticketData.admin_response}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-2 text-xs text-gray-600">
                    <span>Created: {new Date(ticketData.created_at).toLocaleDateString()}</span>
                    {ticketData.updated_at && (
                      <span>Updated: {new Date(ticketData.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: MessageCircle, label: 'FAQ', desc: 'Browse common questions', href: '/faq' },
            { icon: Package, label: 'Refund Policy', desc: 'Request a refund', href: '/refund-policy' },
            { icon: ArrowUpRight, label: 'Dashboard', desc: 'View your usage & credits', href: '/dashboard' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <a key={i} href={item.href} className="group bg-[#07070a] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-center block">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-sm font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </a>
            );
          })}
        </div>

      </div>
    </div>
  );
}

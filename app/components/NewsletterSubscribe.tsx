"use client";
import { useState, FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Subscribed successfully!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
    setTimeout(() => { setStatus('idle'); setMessage(''); }, 4000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center gap-3 max-w-md mx-auto relative">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full bg-[#020203] border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors"
        disabled={status === 'loading' || status === 'success'}
        required
      />
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className="w-full md:w-auto px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing</>
        ) : status === 'success' ? (
          <><CheckCircle2 className="w-4 h-4" /> Subscribed!</>
        ) : (
          'Subscribe'
        )}
      </button>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute -bottom-8 left-0 right-0 text-center text-xs font-medium ${status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {status === 'success' ? (
              <span className="flex items-center justify-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {message}</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {message}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

"use client";
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, Building, Phone, ArrowRight, Zap, CheckCircle, Shield } from 'lucide-react';

const FEATURES = [
  'Centralized admin dashboard to monitor student usage',
  'Volume discount up to 60% off standard pricing',
  'Priority 24/7 technical support line',
  'Custom branding and white-labeling options',
  'Bulk user import and seat management',
  'Dedicated account manager',
];

export default function GroupInquiryPage() {
  const [form, setForm] = useState({
    name: '', email: '', institution: '', studentCount: '', phone: '', message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/group-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else setError(data.error || 'Something went wrong');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white">
      <Navbar />

      <section className="pt-32 pb-20 px-5 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-[10px] font-bold tracking-widest text-blue-400 mb-6 uppercase">
              <Building className="w-3 h-3" /> For Coaching & Institutes
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
              Equip Your Students with an{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Unfair Advantage
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Get volume licenses of EduAI for your coaching center, school, or university. Monitor progress, customize study plans, and guarantee results.
            </p>

            <div className="space-y-4 mb-10">
              {FEATURES.map(feat => (
                <div key={feat} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">{feat}</span>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
              <p className="text-sm italic text-gray-400 mb-4">
                "Since integrating EduAI across our 3 branches, our average student mock test scores increased by 42%. It's a game changer."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800" />
                <div>
                  <p className="text-sm font-bold text-white">Dr. R. Sharma</p>
                  <p className="text-xs text-gray-500">Director, Excellence Academy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-[2.5rem] blur-xl opacity-50" />
            <div className="relative p-8 md:p-10 rounded-[2rem] border border-white/[0.08] bg-[#07070e]">
              <h2 className="text-2xl font-bold mb-2">Request Group Pricing</h2>
              <p className="text-gray-500 text-sm mb-8">Fill this out and our enterprise team will contact you within 24 hours.</p>

              <AnimatePresence>
                {success ? (
                  <motion.div
                    className="text-center py-10"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Inquiry Sent Successfully</h3>
                    <p className="text-gray-400 text-sm">Our enterprise team will reach out to you shortly.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1.5">Name</label>
                        <input
                          type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1.5">Work Email</label>
                        <input
                          type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1.5">Institution Name</label>
                        <input
                          type="text" required value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1.5">No. of Students</label>
                        <select
                          required value={form.studentCount} onChange={e => setForm(p => ({ ...p, studentCount: e.target.value }))}
                          className="w-full bg-[#0a0a0f] border border-white/[0.08] rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors appearance-none"
                        >
                          <option value="">Select range</option>
                          <option value="10-50">10 - 50</option>
                          <option value="51-200">51 - 200</option>
                          <option value="201-500">201 - 500</option>
                          <option value="500+">500+</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1.5">Phone Number (Optional)</label>
                      <input
                        type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-1.5">Any specific requirements?</label>
                      <textarea
                        rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors resize-none"
                      />
                    </div>

                    {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

                    <button
                      type="submit" disabled={loading}
                      className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}>
                      {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-4 h-4" /> Request Pricing</>}
                    </button>
                    <p className="text-center text-[10px] text-gray-700 mt-3 flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3" /> Secure & Confidential
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

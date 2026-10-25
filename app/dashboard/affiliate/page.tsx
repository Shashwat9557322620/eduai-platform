"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { DollarSign, Link as LinkIcon, Users, CreditCard, ArrowUpRight, Copy, CheckCircle, RefreshCcw } from 'lucide-react';

export default function AffiliateDashboard() {
  const { user } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/affiliate/dashboard');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!code) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/affiliate/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateCode: code })
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        setError(json.error || 'Failed to create code');
      }
    } catch {
      setError('Network error');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = () => {
    if (!data?.affiliate) return;
    const link = `${window.location.origin}/?ref=${data.affiliate.affiliate_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-8 text-gray-400 flex items-center gap-2"><RefreshCcw className="animate-spin w-5 h-5" /> Loading Dashboard...</div>;
  }

  if (!data?.isAffiliate) {
    return (
      <div className="p-4 md:p-8 max-w-2xl">
        <h1 className="text-3xl font-black text-white mb-2">Partner Program</h1>
        <p className="text-gray-400 mb-8">Create your custom referral link and earn 30% on every sale you bring to EduAI.</p>

        <div className="bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-2">Claim your handle</h2>
          <p className="text-sm text-gray-500 mb-4">Choose a unique handle for your referral link (e.g., your name or channel name). Only alphanumeric characters allowed.</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">eduai.com/?ref=</span>
              <input 
                type="text" 
                value={code}
                onChange={e => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                className="w-full bg-black border border-white/10 rounded-xl py-3 pl-[125px] pr-4 text-white focus:border-purple-500 focus:outline-none"
                placeholder="yourhandle"
                maxLength={20}
              />
            </div>
            <button 
              onClick={handleCreate}
              disabled={creating || code.length < 3}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Activate'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  const { affiliate, conversions } = data;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Affiliate Dashboard</h1>
          <p className="text-gray-400">Welcome back! Track your earnings and referrals here.</p>
        </div>
        <button 
          onClick={copyLink}
          className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl transition-all"
        >
          {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Referral Link'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <div className="text-gray-400 text-sm font-medium">Available Balance</div>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">₹{affiliate.balance.toLocaleString()}</div>
          <button className="mt-4 w-full bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold py-2 rounded-lg transition-colors">
            Request Payout
          </button>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <div className="text-gray-400 text-sm font-medium">Total Conversions</div>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{conversions.length}</div>
          <div className="mt-4 text-xs text-gray-500">Sales generated via your link</div>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="bg-white/[0.02] border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <div className="text-gray-400 text-sm font-medium">Lifetime Earnings</div>
            <ArrowUpRight className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-black text-white">₹{affiliate.total_earned.toLocaleString()}</div>
          <div className="mt-4 text-xs text-gray-500">Total commission since joining</div>
        </motion.div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Referrals</h2>
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
          {conversions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No conversions yet. Share your link to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.04] text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Sale Amount</th>
                    <th className="px-6 py-4 font-medium">Your Commission</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {conversions.map((conv: any) => (
                    <tr key={conv.id} className="text-gray-300">
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(conv.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-mono text-xs">{conv.order_id}</td>
                      <td className="px-6 py-4">₹{conv.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-green-400 font-medium">+₹{conv.commission.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

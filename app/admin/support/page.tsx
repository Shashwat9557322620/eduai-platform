"use client";
import { useState, useEffect } from 'react';

export default function AdminSupport() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = localStorage.getItem('admin_token_hash');
    if (hash) {
      try {
        const decoded = atob(hash);
        const rawPwd = decoded.split(':')[0] || '';
        verifyToken(rawPwd);
      } catch {
        setChecking(false);
      }
    } else {
      setChecking(false);
    }
  }, []);

  const hashToken = (pwd: string) => {
    const salt = Date.now().toString(36);
    return btoa(pwd + ':' + salt);
  };

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: token }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        loadTickets();
      }
    } catch {} finally {
      setChecking(false);
    }
  };

  const handleLogin = async () => {
    const res = await fetch('/api/admin/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      localStorage.setItem('admin_token_hash', hashToken(password));
      setIsAuthenticated(true);
      loadTickets();
    } else {
      alert('Invalid admin password');
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status }),
      });
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
      }
    } catch (err) {
      console.error('Failed to update ticket', err);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#020203] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020203] text-white flex items-center justify-center">
        <div className="bg-[#07070a] border border-yellow-500/20 rounded-2xl p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-cyan-500">
            SUPPORT DASHBOARD
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Admin Password..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-cyan-600 text-white hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all"
          >
            ACCESS SUPPORT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020203] text-white">
      <div className="bg-[#07070a] border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-cyan-500">SUPPORT</span> TICKETS
          </h1>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <a href="/admin" className="text-xs text-gray-500 hover:text-white font-bold uppercase tracking-widest transition-colors">Dashboard</a>
          <a href="/admin/hacker-tracker" className="text-xs text-gray-500 hover:text-white font-bold uppercase tracking-widest transition-colors">Hacker Tracker</a>
          <a href="/admin/support" className="text-xs text-yellow-400 font-bold uppercase tracking-widest">Support</a>
        </div>
        <button
          onClick={() => {        localStorage.removeItem('admin_token_hash'); setIsAuthenticated(false); }}
          className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest"
        >
          Logout
        </button>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-gray-500 font-mono">{tickets.length} total tickets</p>
          <button onClick={loadTickets} className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20">
            ↻ Refresh
          </button>
        </div>

        <div className="bg-[#07070a] border border-white/5 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-gray-500 font-mono text-sm">No support tickets yet</p>
              <p className="text-gray-600 text-xs mt-2">Everything is running smoothly.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Subject</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket: any) => (
                    <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-gray-400">#{ticket.id?.slice(0, 6)}</td>
                      <td className="py-3 px-4">{ticket.user_email || 'anonymous'}</td>
                      <td className="py-3 px-4 text-gray-300 max-w-[200px] truncate">{ticket.subject || ticket.message?.slice(0, 40)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          ticket.status === 'open' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                          ticket.status === 'in_progress' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' :
                          ticket.status === 'resolved' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                          'text-gray-400 bg-gray-500/10 border-gray-500/30'
                        }`}>
                          {ticket.status || 'open'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{ticket.created_at?.slice(0, 10)}</td>
                      <td className="py-3 px-4">
                        <select
                          value={ticket.status || 'open'}
                          onChange={(e) => updateStatus(ticket.id, e.target.value)}
                          className="bg-[#020203] border border-white/10 rounded-lg text-xs px-2 py-1 text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
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

"use client";
import { useState, useEffect } from 'react';
import AdminPanelBackground from '../components/backgrounds/AdminPanelBackground';
import { 
  XCircle, Clock, RefreshCcw, Search,
  Users, CreditCard, Ticket, Star, AlertTriangle, Shield,
  LogOut, MessageSquare, DollarSign, Ban, Check
} from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginLocked, setLoginLocked] = useState(false);
  const [showAdminNote, setShowAdminNote] = useState<{id: number; action: string} | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [adminKey, setAdminKey] = useState('');
  
  // User management state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredUsers = searchQuery.trim()
    ? users.filter((u: any) =>
        (u.user_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'refunds', label: 'Refunds', icon: RefreshCcw },
    { id: 'feedbacks', label: 'Feedbacks', icon: Star },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];



  // Auto-verify existing session
  useEffect(() => {
    const tokenHash = localStorage.getItem('admin_token_hash');
    const expiry = localStorage.getItem('admin_expiry');
    if (tokenHash && expiry && parseInt(expiry) > Date.now()) {
      // Extract raw password from hash for verification
      try {
        const decoded = atob(tokenHash);
        const rawPwd = decoded.split(':')[0] || '';
        verifyToken(rawPwd);
      } catch {
        localStorage.removeItem('admin_token_hash');
        localStorage.removeItem('admin_expiry');
        setChecking(false);
      }
    } else {
      localStorage.removeItem('admin_token_hash');
      localStorage.removeItem('admin_expiry');
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
      if (!res.ok) {
        localStorage.removeItem('admin_token_hash');
        localStorage.removeItem('admin_expiry');
        setChecking(false);
        return;
      }
      const expiry = localStorage.getItem('admin_expiry');
      if (!expiry || parseInt(expiry) < Date.now()) {
        localStorage.removeItem('admin_token_hash');
        localStorage.removeItem('admin_expiry');
        setChecking(false);
        return;
      }
      setAdminKey(token);
      setIsAuthenticated(true);
      loadData(token);
    } catch {
      localStorage.removeItem('admin_token_hash');
      localStorage.removeItem('admin_expiry');
      setChecking(false);
    }
  };

  const handleLogin = async () => {
    if (loginLocked) {
      alert('Too many failed attempts. Please wait 30 seconds.');
      return;
    }
    const res = await fetch('/api/admin/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      localStorage.setItem('admin_token_hash', hashToken(password));
      localStorage.setItem('admin_expiry', (Date.now() + 4 * 60 * 60 * 1000).toString());
      setAdminKey(password);
      setIsAuthenticated(true);
      loadData(password);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLoginLocked(true);
        setTimeout(() => { setLoginLocked(false); setLoginAttempts(0); }, 30000);
      }
      alert(`Invalid password. ${5 - newAttempts} attempts remaining.`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token_hash');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_expiry');
    setAdminKey('');
    setIsAuthenticated(false);
    setPassword('');
  };

  const loadData = async (key?: string) => {
    const authKey = key || adminKey;
    setLoading(true);
    const headers = { 'x-admin-key': authKey, 'Content-Type': 'application/json' };
    try {
      const [statsRes, usersRes, paymentsRes, feedbacksRes, ticketsRes, refundsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/payments', { headers }),
        fetch('/api/admin/feedbacks', { headers }),
        fetch('/api/admin/tickets', { headers }),
        fetch('/api/admin/refunds', { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (feedbacksRes.ok) setFeedbacks(await feedbacksRes.json());
      if (ticketsRes.ok) { const t = await ticketsRes.json(); setTickets(t.tickets || []); }
      if (refundsRes.ok) { const r = await refundsRes.json(); setRefunds(r.refunds || []); }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundAction = async (refundId: number, status: string) => {
    if (status === 'denied' && !adminNote.trim()) {
      alert('Please provide a reason for denial (this will be emailed to the user).');
      return;
    }
    try {
      const res = await fetch('/api/admin/refunds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ refundId, status, adminNote: adminNote.trim() || null }),
      });
      if (res.ok) {
        setRefunds(prev => prev.map(r => r.id === refundId ? { ...r, status, admin_note: adminNote } : r));
        setShowAdminNote(null);
        setAdminNote('');
      }
    } catch (err) {
      console.error('Refund action error:', err);
    }
  };

  const statusBadge = (status: string) => {
    const config: Record<string, string> = {
      pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      approved: 'text-green-400 bg-green-500/10 border-green-500/30',
      denied: 'text-red-400 bg-red-500/10 border-red-500/30',
      open: 'text-red-400 bg-red-500/10 border-red-500/30',
      in_progress: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      resolved: 'text-green-400 bg-green-500/10 border-green-500/30',
      completed: 'text-green-400 bg-green-500/10 border-green-500/30',
    };
    return `text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${config[status] || 'text-gray-400 bg-gray-500/10 border-gray-500/30'}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
        </div>
      );
    }

    // ====== REFUNDS TAB ======
    if (activeTab === 'refunds') {
      return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Refund Requests
              <span className="text-xs text-gray-500 font-mono ml-2">({refunds.length} total)</span>
            </h2>
            <div className="flex gap-2">
              {['pending', 'approved', 'denied'].map(f => (
                <button key={f} onClick={() => setActiveTab(f === 'pending' ? 'refunds' : f)} 
                  className="text-[10px] font-mono font-bold uppercase px-2 py-1 rounded border border-white/10 text-gray-500 hover:text-white">
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#07070a] border border-white/5 rounded-xl overflow-hidden">
            {refunds.length === 0 ? (
              <div className="text-center py-16">
                <RefreshCcw className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 font-mono text-sm">No refund requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Reason</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((r: any) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-gray-400">#{r.id}</td>
                        <td className="py-3 px-4">{r.user_email}</td>
                        <td className="py-3 px-4 font-mono">₹{r.amount || '—'}</td>
                        <td className="py-3 px-4 max-w-[200px]">
                          <span className="text-gray-300 text-xs truncate block">{r.reason}</span>
                        </td>
                        <td className="py-3 px-4"><span className={statusBadge(r.status)}>{r.status}</span></td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{r.created_at?.slice(0, 10)}</td>
                        <td className="py-3 px-4">
                          {r.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setShowAdminNote({ id: r.id, action: 'approved' }); setAdminNote(''); }}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                              >
                                <Check className="w-3 h-3 inline mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => { setShowAdminNote({ id: r.id, action: 'denied' }); setAdminNote(''); }}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                              >
                                <Ban className="w-3 h-3 inline mr-1" />
                                Deny
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">{r.admin_note ? 'Responded' : 'No note'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Admin Note Modal */}
          {showAdminNote && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowAdminNote(null)}>
              <div className="bg-[#07070a] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white mb-2">
                  {showAdminNote.action === 'approved' ? 'Approve Refund' : 'Deny Refund'}
                </h3>
                <p className="text-xs text-gray-500 mb-6">
                  {showAdminNote.action === 'approved' 
                    ? 'An approval confirmation email will be sent to the user.' 
                    : 'Provide a reason for denial — this will be emailed to the user.'}
                </p>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={showAdminNote.action === 'denied' ? 'Reason for rejection...' : 'Optional note...'}
                  rows={4}
                  className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 text-sm mb-4 resize-none"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowAdminNote(null)} className="flex-1 py-3 rounded-xl text-sm font-bold border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 hover:scale-[1.02] active:scale-95 transition-all duration-200">Cancel</button>
                  <button
                    onClick={() => handleRefundAction(showAdminNote.id, showAdminNote.action)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                      showAdminNote.action === 'approved' 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                        : 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    }`}
                  >
                    {showAdminNote.action === 'approved' ? '✅ Approve' : '❌ Deny'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ====== FEEDBACKS TAB ======
    if (activeTab === 'feedbacks') {
      return (
        <div className="bg-[#07070a] border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
              <Star className="w-4 h-4" />
              User Feedbacks & Ratings
            </h2>
            <span className="text-xs text-gray-500 font-mono">{feedbacks.length} total</span>
          </div>
          {feedbacks.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500 font-mono text-sm">No feedbacks yet</p></div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb: any) => (
                <div key={fb.id} className="bg-[#020203] border border-white/5 rounded-xl p-4 hover:border-yellow-500/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{fb.rating >= 4 ? '🤩' : fb.rating === 3 ? '😐' : '😞'}</span>
                      <span className="text-sm font-bold text-white">{fb.rating}/5</span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">{fb.created_at?.slice(0, 10)}</span>
                  </div>
                  <p className="text-sm text-gray-400">{fb.message || 'No message'}</p>
                  <p className="text-[10px] text-gray-600 mt-2 font-mono">User: {fb.user_id || 'anonymous'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ====== TICKETS TAB ======
    if (activeTab === 'tickets') {
      return (
        <div className="bg-[#07070a] border border-cyan-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Support Tickets
            </h2>
            <span className="text-xs text-gray-500 font-mono">{tickets.length} total</span>
          </div>
          {tickets.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500 font-mono text-sm">No tickets yet</p></div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className="bg-[#020203] border border-white/5 rounded-xl p-4 hover:border-cyan-500/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={statusBadge(ticket.status)}>{ticket.status || 'open'}</span>
                      {ticket.tracking_id && (
                        <span className="text-[10px] font-mono text-gray-500">#{ticket.tracking_id}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">{ticket.created_at?.slice(0, 10)}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{ticket.subject || 'No Subject'}</p>
                  <p className="text-xs text-gray-400">{ticket.message?.slice(0, 200)}</p>
                  {ticket.admin_response && (
                    <div className="mt-2 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                      <p className="text-[10px] text-cyan-400 font-mono mb-1">Admin Response:</p>
                      <p className="text-xs text-gray-400">{ticket.admin_response}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-600 mt-2 font-mono">From: {ticket.user_email || 'anonymous'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ====== USERS TAB (Enhanced with inline management) ======
    if (activeTab === 'users') {
      return (
        <div>
          {/* User Management Modal */}
          {editingUser && (
            <UserManagementModal
              user={editingUser}
              adminKey={adminKey}
              onClose={() => setEditingUser(null)}
              onUpdated={(updated) => {
                setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                setEditingUser(null);
              }}
            />
          )}

          <div className="bg-[#07070a] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
                <span className="text-xs text-gray-500 font-mono ml-1">({users.length} total)</span>
              </h2>
              {/* Search */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID or email..."
                  className="w-full bg-[#020203] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                    <th className="text-left py-3 px-3">#</th>
                    <th className="text-left py-3 px-3">User ID</th>
                    <th className="text-left py-3 px-3">Email</th>
                    <th className="text-left py-3 px-3">Plan</th>
                    <th className="text-left py-3 px-3">Credits</th>
                    <th className="text-left py-3 px-3">Last Updated</th>
                    <th className="text-left py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500 font-mono text-sm">
                        {searchQuery ? 'No users match your search' : 'No users found'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user: any, idx: number) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                        <td className="py-3 px-3 text-xs text-gray-600 font-mono">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono text-[10px] text-gray-400 max-w-[120px] truncate" title={user.user_id}>
                          {user.user_id?.slice(0, 12)}...
                        </td>
                        <td className="py-3 px-3">{user.email || user.user_id?.slice(0, 16) || '—'}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            user.plan_name?.toLowerCase().includes('pro') || user.plan_name?.toLowerCase().includes('premium')
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : user.plan_name?.toLowerCase().includes('trial') || user.plan_name === 'Free Trial'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}>
                            {user.plan_name || 'Free Trial'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-sm">
                          <span className="text-cyan-300">{user.credits ?? 0}</span>
                        </td>
                        <td className="py-3 px-3 text-[10px] text-gray-600 font-mono">
                          {user.updated_at?.slice(0, 10) || '—'}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          >
                            ⚙️ Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Stats Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#07070a] border border-white/5 rounded-xl p-4 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Pro Users</p>
              <p className="text-xl font-black text-purple-400 mt-1">
                {users.filter((u: any) => u.plan_name?.toLowerCase().includes('pro') || u.plan_name?.toLowerCase().includes('premium')).length}
              </p>
            </div>
            <div className="bg-[#07070a] border border-white/5 rounded-xl p-4 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Free Users</p>
              <p className="text-xl font-black text-cyan-400 mt-1">
                {users.filter((u: any) => !u.plan_name?.toLowerCase().includes('pro') && !u.plan_name?.toLowerCase().includes('premium')).length}
              </p>
            </div>
            <div className="bg-[#07070a] border border-white/5 rounded-xl p-4 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Total Credits</p>
              <p className="text-xl font-black text-green-400 mt-1">
                {users.reduce((sum: number, u: any) => sum + (u.credits || 0), 0)}
              </p>
            </div>
            <div className="bg-[#07070a] border border-white/5 rounded-xl p-4 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Avg Credits/User</p>
              <p className="text-xl font-black text-yellow-400 mt-1">
                {users.length ? Math.round(users.reduce((sum: number, u: any) => sum + (u.credits || 0), 0) / users.length) : 0}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ====== PAYMENTS TAB ======
    if (activeTab === 'payments') {
      return (
        <div className="bg-[#07070a] border border-white/5 rounded-xl p-6">
          <h2 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Recent Payments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs text-gray-400">{p.order_id?.slice(0, 12)}...</td>
                    <td className="py-3 px-2">₹{p.amount}</td>
                    <td className="py-3 px-2">
                      <span className={statusBadge(p.status)}>{p.status}</span>
                    </td>
                    <td className="py-3 px-2 text-gray-400">{p.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // ====== DASHBOARD TAB ======
    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#07070a] border border-white/5 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Total Users</p>
            <p className="text-3xl font-black text-cyan-400">{stats?.totalUsers ?? 0}</p>
          </div>
          <div className="bg-[#07070a] border border-white/5 rounded-xl p-5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Active Credits</p>
            <p className="text-3xl font-black text-purple-400">{stats?.activeCredits ?? 0}</p>
          </div>
          <div className="bg-[#07070a] border border-white/5 rounded-xl p-5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Revenue (₹)</p>
            <p className="text-3xl font-black text-green-400">₹{stats?.totalRevenue ?? 0}</p>
          </div>
          <div className="bg-[#07070a] border border-white/5 rounded-xl p-5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Open Tickets</p>
            <p className="text-3xl font-black text-yellow-400">{stats?.openTickets ?? 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#07070a] border border-white/5 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveTab('refunds')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200">
              <RefreshCcw className="w-3.5 h-3.5" />
              Pending Refunds ({refunds.filter((r: any) => r.status === 'pending').length})
            </button>
            <button onClick={() => setActiveTab('tickets')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200">
              <Ticket className="w-3.5 h-3.5" />
              Open Tickets ({tickets.filter((t: any) => t.status === 'open').length})
            </button>
            <a href="/admin/hacker-tracker" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              Hacker Tracker
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#07070a] border border-white/5 rounded-xl p-6">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <RefreshCcw className="w-3.5 h-3.5" />
              Recent Refund Requests
            </h2>
            {refunds.filter((r: any) => r.status === 'pending').slice(0, 5).length === 0 ? (
              <p className="text-gray-500 text-sm font-mono">No pending refund requests</p>
            ) : (
              <div className="space-y-2">
                {refunds.filter((r: any) => r.status === 'pending').slice(0, 5).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between bg-[#020203] border border-white/5 rounded-lg p-3">
                    <div>
                      <p className="text-xs font-bold text-white">{r.user_email}</p>
                      <p className="text-[10px] text-gray-500">₹{r.amount || '—'} · {r.reason?.slice(0, 40)}</p>
                    </div>
                    <span className="text-yellow-400 text-[10px] font-mono font-bold uppercase">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#07070a] border border-white/5 rounded-xl p-6">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Latest Feedbacks
            </h2>
            {feedbacks.slice(0, 5).length === 0 ? (
              <p className="text-gray-500 text-sm font-mono">No feedbacks yet</p>
            ) : (
              <div className="space-y-2">
                {feedbacks.slice(0, 5).map((fb: any) => (
                  <div key={fb.id} className="bg-[#020203] border border-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-yellow-400 text-xs">
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                      </span>
                      <span className="text-[10px] text-gray-600">{fb.created_at?.slice(0, 10)}</span>
                    </div>
                    <p className="text-xs text-gray-400">{fb.message?.slice(0, 80)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // ====== LOGIN SCREEN ======
  if (!isAuthenticated) {
    if (checking) {
      return (
        <div className="min-h-screen bg-[#020203] text-white flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#020203] text-white flex items-center justify-center relative overflow-hidden">
        <AdminPanelBackground />
        <div className="relative bg-[#07070a] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              ADMIN OVERLORD
            </h1>
            <p className="text-xs text-gray-500 font-mono">🔒 Restricted access</p>
          </div>
          {loginLocked && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs text-center font-mono">
              🔒 Temporarily locked. Please wait 30 seconds.
            </div>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter Admin Password..."
            className="w-full bg-[#020203] border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 mb-4 transition-all"
            disabled={loginLocked}
          />
          <button
            onClick={handleLogin}
            disabled={loginLocked || !password}
            className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            ACCESS PANEL
          </button>
        </div>
      </div>
    );
  }

  // ====== MAIN ADMIN DASHBOARD ======
  return (
    <div className="min-h-screen bg-[#020203] text-white">
      {/* Top Nav */}
      <div className="bg-[#07070a] border-b border-white/5 px-6 py-4 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-lg font-black tracking-tight shrink-0">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ADMIN</span>
          </h1>
          <div className="h-4 w-[1px] bg-white/10 shrink-0"></div>
          <div className="flex items-center gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                      : 'text-gray-500 hover:text-white hover:bg-white/5 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
            <a href="/admin/hacker-tracker" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 hover:scale-[1.02] active:scale-95 transition-all duration-200 whitespace-nowrap">
              <AlertTriangle className="w-3 h-3" />
              Hacker
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => loadData()} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono px-2 py-1 rounded hover:bg-white/5 hover:scale-105 active:scale-95 transition-all duration-200">
            ↻ Refresh
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest px-2 py-1 rounded hover:bg-red-500/10 hover:scale-105 active:scale-95 transition-all duration-200">
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}

// ====== USER MANAGEMENT MODAL ======
function UserManagementModal({ user, adminKey, onClose, onUpdated }: {
  user: any;
  adminKey: string;
  onClose: () => void;
  onUpdated: (updated: any) => void;
}) {
  const [planName, setPlanName] = useState(user.plan_name || 'Free Trial');
  const [credits, setCredits] = useState(user.credits ?? 0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const PLANS = ['Free Trial', 'Pro Monthly', 'Pro Annual', 'Premium', 'Lifetime'];

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ plan_name: planName, credits }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      const updated = await res.json();
      setMessage({ type: 'success', text: '✅ User updated successfully!' });
      setTimeout(() => {
        onUpdated(updated);
      }, 1000);
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Update failed'}` });
    } finally {
      setSaving(false);
    }
  };

  const quickAction = async (action: string) => {
    switch (action) {
      case 'reset_free':
        setPlanName('Free Trial');
        setCredits(30);
        break;
      case 'pro_monthly':
        setPlanName('Pro Monthly');
        setCredits((prev: number) => Math.max(prev, 200));
        break;
      case 'pro_annual':
        setPlanName('Pro Annual');
        setCredits((prev: number) => Math.max(prev, 500));
        break;
      case 'add_100':
        setCredits((prev: number) => (prev || 0) + 100);
        break;
      case 'add_500':
        setCredits((prev: number) => (prev || 0) + 500);
        break;
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.user_id}/history`, {
        headers: { 'x-admin-key': adminKey },
      });
      if (res.ok) {
        const data = await res.json();
        setUserHistory(data.history || []);
      }
    } catch {} finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-[#07070a] border border-white/10 rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              User Management
            </h3>
            <p className="text-[10px] text-gray-500 font-mono mt-1">
              ID: {user.user_id}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white hover:scale-110 active:scale-90 transition-all duration-200 p-1">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-mono ${
            message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Plan Selection */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2 block">Plan Name</label>
            <select
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
            >
              {PLANS.map(p => (
                <option key={p} value={p} className="bg-[#020203]">{p}</option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: '🆓 Free', action: 'reset_free' },
                { label: '🚀 Pro Monthly', action: 'pro_monthly' },
                { label: '💎 Pro Annual', action: 'pro_annual' },
              ].map(act => (
                <button
                  key={act.action}
                  onClick={() => quickAction(act.action)}
                  className={`text-[9px] font-mono font-bold uppercase px-2 py-1 rounded border transition-all ${
                    planName === (act.action === 'reset_free' ? 'Free Trial' : act.action === 'pro_monthly' ? 'Pro Monthly' : 'Pro Annual')
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                    : 'border-white/5 text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          {/* Credits */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2 block">Credits</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCredits((prev: number) => Math.max(0, (prev || 0) - 10))}
                className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center font-bold"
              >
                -10
              </button>
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 bg-[#020203] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg font-bold font-mono focus:outline-none focus:border-cyan-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={0}
              />
              <button
                onClick={() => setCredits((prev: number) => (prev || 0) + 10)}
                className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all flex items-center justify-center font-bold"
              >
                +10
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: '+100', action: 'add_100' },
                { label: '+500', action: 'add_500' },
              ].map(act => (
                <button
                  key={act.action}
                  onClick={() => quickAction(act.action)}
                  className="text-[9px] font-mono font-bold uppercase px-2 py-1 rounded border border-white/5 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Usage History */}
        <div className="border-t border-white/5 pt-6 mb-6">
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory && userHistory.length === 0) loadHistory();
            }}
            className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            {showHistory ? 'Hide Usage History' : 'View Usage History'}
          </button>

          {showHistory && (
            <div className="mt-4">
              {historyLoading ? (
                <div className="flex items-center gap-2 text-gray-500 text-xs font-mono py-4">
                  <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
                  Loading history...
                </div>
              ) : userHistory.length === 0 ? (
                <p className="text-gray-500 text-xs font-mono py-4">No usage history found for this user.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userHistory.map((h: any) => (
                    <div key={h.id} className="bg-[#020203] border border-white/5 rounded-lg p-3 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {h.tool_name || 'unknown'}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono">-{h.credits_used || 1} credits</span>
                        </div>
                        {h.input && (
                          <p className="text-[10px] text-gray-500 truncate font-mono">
                            {typeof h.input === 'string' ? h.input.slice(0, 80) : JSON.stringify(h.input).slice(0, 80)}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono shrink-0 ml-2">{h.created_at?.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save / Cancel */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-bold border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Saving...</>
            ) : (
              <><Check className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

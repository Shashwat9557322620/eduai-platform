"use client";
import { useState, useEffect, useCallback } from 'react';
import UnifiedBackground from '../../components/UnifiedBackground';
import { 
  Shield, AlertTriangle, Globe, MapPin, Monitor, Smartphone,
  Tablet, Terminal, RefreshCcw,
  ChevronDown, ChevronUp, Search, Clock, ExternalLink,
  AlertOctagon, Radio, Skull, LogOut
} from 'lucide-react';

// Country flag emoji mapping
const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', IN: '🇮🇳', CN: '🇨🇳', RU: '🇷🇺',
  DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', BR: '🇧🇷', CA: '🇨🇦',
  AU: '🇦🇺', KR: '🇰🇷', SG: '🇸🇬', NL: '🇳🇱', IT: '🇮🇹',
  ES: '🇪🇸', SE: '🇸🇪', NO: '🇳🇴', FI: '🇫🇮', DK: '🇩🇰',
  PL: '🇵🇱', UA: '🇺🇦', IR: '🇮🇷', IQ: '🇮🇶', SA: '🇸🇦',
  AE: '🇦🇪', IL: '🇮🇱', TR: '🇹🇷', PK: '🇵🇰', BD: '🇧🇩',
  NG: '🇳🇬', ZA: '🇿🇦', EG: '🇪🇬', AR: '🇦🇷', MX: '🇲🇽',
  TH: '🇹🇭', VN: '🇻🇳', ID: '🇮🇩', MY: '🇲🇾', PH: '🇵🇭',
  HK: '🇭🇰', TW: '🇹🇼', NZ: '🇳🇿', CH: '🇨🇭', AT: '🇦🇹',
  BE: '🇧🇪', PT: '🇵🇹', GR: '🇬🇷', IE: '🇮🇪', HU: '🇭🇺',
  RO: '🇷🇴', CZ: '🇨🇿', SK: '🇸🇰', BG: '🇧🇬', HR: '🇭🇷',
  LT: '🇱🇹', SI: '🇸🇮', LV: '🇱🇻', EE: '🇪🇪', IS: '🇮🇸',
  LU: '🇱🇺', MT: '🇲🇹', CY: '🇨🇾', CL: '🇨🇱', CO: '🇨🇴',
  PE: '🇵🇪', KE: '🇰🇪', MA: '🇲🇦', DZ: '🇩🇿', TN: '🇹🇳',
  LOC: '🖥️', UN: '🏳️',
};

export default function HackerTracker() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [adminKey, setAdminKey] = useState('');

  const adminFetch = useCallback((url: string) => {
    const headers: Record<string, string> = { 'x-admin-key': adminKey };
    return fetch(url, { headers });
  }, [adminKey]);

  useEffect(() => {
    const tokenHash = localStorage.getItem('admin_token_hash');
    const expiry = localStorage.getItem('admin_expiry');
    if (tokenHash && expiry && parseInt(expiry) > Date.now()) {
      // Extract raw password from hash for verification
      try {
        const decoded = atob(tokenHash);
        const rawPwd = decoded.split(':')[0] || '';
        setAdminKey(rawPwd);
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

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(loadLogs, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, adminKey]);

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
      loadLogs();
    } catch {
      localStorage.removeItem('admin_token_hash');
      localStorage.removeItem('admin_expiry');
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
      localStorage.setItem('admin_token_hash', btoa(password + ':' + Date.now().toString(36)));
      localStorage.setItem('admin_expiry', (Date.now() + 4 * 60 * 60 * 1000).toString());
      setAdminKey(password);
      setIsAuthenticated(true);
      loadLogs();
    } else {
      alert('Invalid admin password');
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/hacker-traffic');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  const getFlag = (code: string) => COUNTRY_FLAGS[code] || '🏳️';
  
  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const severityIcon = (s: string) => {
    switch (s) {
      case 'critical': return <Skull className="w-3 h-3" />;
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <AlertOctagon className="w-3 h-3" />;
      case 'low': return <Radio className="w-3 h-3" />;
      default: return <Terminal className="w-3 h-3" />;
    }
  };

  const deviceIcon = (type?: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-3 h-3" />;
      case 'tablet': return <Tablet className="w-3 h-3" />;
      default: return <Monitor className="w-3 h-3" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const filteredLogs = logs
    .filter(l => filter === 'all' || l.severity === filter)
    .filter(l => 
      !search || 
      l.ip_address?.includes(search) || 
      l.country?.toLowerCase().includes(search.toLowerCase()) ||
      l.city?.toLowerCase().includes(search.toLowerCase()) ||
      l.event_type?.toLowerCase().includes(search.toLowerCase()) ||
      l.path?.toLowerCase().includes(search.toLowerCase())
    );

  if (checking) {
    return (
      <div className="min-h-screen bg-[#020203] text-white flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-purple-500 border-b-transparent rounded-full animate-spin-reverse" style={{ opacity: 0.5 }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020203] text-white flex items-center justify-center relative overflow-hidden">
        <UnifiedBackground />
        <div className="relative bg-[#07070a] border border-red-500/20 rounded-3xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-yellow-500/20 border border-red-500/20 flex items-center justify-center mx-auto mb-4 animate-float">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-500 animate-gradient-x">
              HACKER TRACKER
            </h1>
            <p className="text-xs text-gray-500 mt-2 font-mono">🔒 Admin authentication required</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password..."
            className="w-full bg-[#020203] border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500 mb-4 transition-all"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-500 to-yellow-600 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
            ACCESS SECURE PANEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020203] text-white">
      {/* Top Nav */}
      <div className="bg-[#07070a]/95 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50 animate-nav-shimmer">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <h1 className="text-lg font-black tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-500">HACKER</span>
              <span className="text-white/60 ml-1">TRACKER</span>
            </h1>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <a href="/admin" className="text-[10px] text-gray-500 hover:text-white font-bold uppercase tracking-widest transition-colors px-2 py-1 rounded hover:bg-white/5">Dashboard</a>
            <a href="/admin/hacker-tracker" className="text-[10px] text-red-400 font-bold uppercase tracking-widest px-2 py-1 rounded bg-red-500/10">Tracker</a>
            <a href="/admin/support" className="text-[10px] text-gray-500 hover:text-white font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all duration-200 px-2 py-1 rounded hover:bg-white/5">Support</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[10px] text-gray-500 cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} className="accent-red-500" />
            Auto
          </label>
          <button onClick={loadLogs} className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono px-2 py-1 rounded hover:bg-white/5 hover:scale-105 active:scale-95 transition-all duration-200">
            <RefreshCcw className="w-3 h-3" />
            Refresh
          </button>
          <button
            onClick={() => { localStorage.removeItem('admin_token_hash'); localStorage.removeItem('admin_expiry'); setIsAuthenticated(false); }}
            className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest px-2 py-1 rounded hover:bg-red-500/10 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Events', value: logs.length, color: 'text-white', extra: '' },
            { label: 'Critical', value: logs.filter(l => l.severity === 'critical').length, color: 'text-red-400', extra: logs.filter(l => l.severity === 'critical').length > 0 ? 'animate-pulse' : '' },
            { label: 'High', value: logs.filter(l => l.severity === 'high').length, color: 'text-orange-400', extra: '' },
            { label: 'Medium', value: logs.filter(l => l.severity === 'medium').length, color: 'text-yellow-400', extra: '' },
            { label: 'Countries', value: [...new Set(logs.filter(l => l.country).map(l => l.country))].length, color: 'text-cyan-400', extra: '' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#07070a] border border-white/5 rounded-xl p-4" style={{ animationDelay: `${i * 50}ms` }}>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color} ${stat.extra}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by IP, country, city, event, path..."
              className="w-full bg-[#07070a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-1 ${
                  filter === f
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white hover:scale-[1.02] active:scale-95'
                }`}
              >
                {f === 'critical' && <Skull className="w-3 h-3" />}
                {f === 'high' && <AlertTriangle className="w-3 h-3" />}
                {f === 'medium' && <AlertOctagon className="w-3 h-3" />}
                {f === 'low' && <Radio className="w-3 h-3" />}
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Event Feed */}
        <div className="space-y-3">
          {loading && filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 w-10 h-10 border-2 border-purple-500 border-b-transparent rounded-full animate-spin-reverse" style={{ opacity: 0.5 }} />
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-6 animate-float">🛡️</div>
              <p className="text-gray-500 font-mono text-lg">No intrusion events detected</p>
              <p className="text-gray-600 text-sm mt-2">Your perimeter is secure, Overlord.</p>
              {logs.length > 0 && (
                <p className="text-gray-600 text-xs mt-4">Filter {logs.length} events down to {filteredLogs.length}. Try changing the filter.</p>
              )}
            </div>
          ) : (
            filteredLogs.map((log: any, i: number) => (
              <div
                key={log.id || i}
                className={`group bg-[#07070a] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/10 ${
                  expandedRow === (log.id || i) ? 'ring-1 ring-red-500/20' : ''
                }`}
              >
                {/* Compact Row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedRow(expandedRow === (log.id || i) ? null : (log.id || i))}
                >
                  {/* Severity */}
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${severityColor(log.severity)} shrink-0`}>
                    {severityIcon(log.severity)}
                    <span className="text-[10px] font-mono font-bold uppercase">{log.severity}</span>
                  </div>

                  {/* Country Flag + IP */}
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span className="text-lg">{getFlag(log.country_code)}</span>
                    <span className="font-mono text-xs text-gray-300">{log.ip_address}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 min-w-[120px] text-gray-400">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="text-xs truncate">{log.city || '?'}, {log.country_code || '??'}</span>
                  </div>

                  {/* Event */}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-300 truncate block">{log.event_type || log.event}</span>
                  </div>

                  {/* Device */}
                  <div className="hidden md:flex items-center gap-1.5 text-gray-500 min-w-[80px]">
                    {deviceIcon(log.device_type)}
                    <span className="text-[10px] font-mono">{log.browser || '?'}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-gray-500 min-w-[60px]">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="text-[10px] font-mono whitespace-nowrap">{getTimeAgo(log.created_at)}</span>
                  </div>

                  {/* Expand */}
                  <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
                    {expandedRow === (log.id || i) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRow === (log.id || i) && (
                  <div className="border-t border-white/5 px-4 py-5 bg-[#020203] animate-slide-down">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Column 1: Geo Location */}
                      <div>
                        <h4 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Globe className="w-3 h-3" />
                          Geolocation
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getFlag(log.country_code)}</span>
                            <div>
                              <p className="text-sm font-bold text-white">{log.country || 'Unknown'}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{log.country_code || '??'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-500 font-mono">City</p>
                              <p className="text-xs font-bold text-white">{log.city || 'N/A'}</p>
                            </div>
                            <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-500 font-mono">Region</p>
                              <p className="text-xs font-bold text-white">{log.region || 'N/A'}</p>
                            </div>
                            <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-500 font-mono">ISP</p>
                              <p className="text-xs font-bold text-white truncate">{log.isp || 'N/A'}</p>
                            </div>
                            <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-500 font-mono">Organization</p>
                              <p className="text-xs font-bold text-white truncate">{log.org || log.isp || 'N/A'}</p>
                            </div>
                          </div>
                          {log.lat && log.lon && (
                            <div className="bg-[#07070a] border border-cyan-500/10 rounded-lg p-2.5">
                              <p className="text-[10px] text-cyan-400 font-mono mb-1">Coordinates</p>
                              <p className="text-xs font-mono text-gray-400">{log.lat.toFixed(4)}, {log.lon.toFixed(4)}</p>
                              <a 
                                href={`https://www.google.com/maps?q=${log.lat},${log.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-cyan-500 hover:text-cyan-400 mt-1 inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                View on Maps
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 2: Device & Browser */}
                      <div>
                        <h4 className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Monitor className="w-3 h-3" />
                          Device Fingerprint
                        </h4>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-500 font-mono">Device</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                {deviceIcon(log.device_type)}
                                <span className="text-xs font-bold text-white capitalize">{log.device_type || 'Unknown'}</span>
                              </div>
                            </div>
                            <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-500 font-mono">Mobile</p>
                              <span className={`text-xs font-bold ${log.is_mobile ? 'text-yellow-400' : 'text-green-400'}`}>
                                {log.is_mobile ? 'Yes 📱' : 'No 💻'}
                              </span>
                            </div>
                            <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-500 font-mono">Browser</p>
                              <p className="text-xs font-bold text-white">{log.browser || 'Unknown'}</p>
                            </div>
                            <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-500 font-mono">OS</p>
                              <p className="text-xs font-bold text-white">{log.os || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                            <p className="text-[10px] text-gray-500 font-mono mb-1">User Agent</p>
                            <p className="text-[10px] text-gray-500 break-all leading-relaxed">{log.user_agent || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Threat Intelligence */}
                      <div>
                        <h4 className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Shield className="w-3 h-3" />
                          Threat Intelligence
                        </h4>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className={`bg-[#07070a] border rounded-lg p-2.5 ${log.is_proxy ? 'border-yellow-500/30' : 'border-white/5'}`}>
                              <p className="text-[10px] text-gray-500 font-mono">Proxy/VPN</p>
                              <span className={`text-xs font-bold ${log.is_proxy ? 'text-yellow-400' : 'text-green-400'}`}>
                                {log.is_proxy ? '⚠️ Yes' : '✅ No'}
                              </span>
                            </div>
                            <div className={`bg-[#07070a] border rounded-lg p-2.5 ${log.is_hosting ? 'border-yellow-500/30' : 'border-white/5'}`}>
                              <p className="text-[10px] text-gray-500 font-mono">Hosting/DC</p>
                              <span className={`text-xs font-bold ${log.is_hosting ? 'text-yellow-400' : 'text-green-400'}`}>
                                {log.is_hosting ? '⚠️ Yes' : '✅ No'}
                              </span>
                            </div>
                            <div className={`bg-[#07070a] border rounded-lg p-2.5 ${log.is_tor ? 'border-red-500/30' : 'border-white/5'}`}>
                              <p className="text-[10px] text-gray-500 font-mono">Tor Exit</p>
                              <span className={`text-xs font-bold ${log.is_tor ? 'text-red-400' : 'text-green-400'}`}>
                                {log.is_tor ? '🔴 Yes' : '✅ No'}
                              </span>
                            </div>
                            <div className="bg-[#07070a] border border-white/5 rounded-lg p-2.5 col-span-2">
                              <p className="text-[10px] text-gray-500 font-mono">AS Number</p>
                              <p className="text-xs font-mono text-gray-400">{log.as_number || 'N/A'} {log.as_name ? `(${log.as_name})` : ''}</p>
                            </div>
                          </div>
                        </div>

                        {/* Attack Path Details */}
                        <div className="mt-3 bg-[#07070a] border border-white/5 rounded-lg p-3">
                          <p className="text-[10px] text-gray-500 font-mono mb-1.5">Path</p>
                          <p className="text-xs font-mono text-cyan-300/80 break-all">{log.path}</p>
                        </div>

                        {log.timezone && (
                          <div className="mt-2 bg-[#07070a] border border-white/5 rounded-lg p-2.5">
                            <p className="text-[10px] text-gray-500 font-mono">Timezone</p>
                            <p className="text-xs text-gray-400">{log.timezone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Export footer */}
        {filteredLogs.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-600 font-mono">
              Showing {filteredLogs.length} of {logs.length} events · 
              {filter !== 'all' && ` Filter: ${filter}`}
              {search && ` · Search: "${search}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

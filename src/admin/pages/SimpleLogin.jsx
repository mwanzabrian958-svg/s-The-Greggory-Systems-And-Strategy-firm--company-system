import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, RefreshCw, Users, LogIn } from 'lucide-react';
import { apiCall } from '../../services/api';

export default function SimpleLogin() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    const adminRole = { slug: 'admin', name: 'System Administrator' };
    try {
      const res = await apiCall('/api/roles');
      const roles = res.roles || [];
      // Always include admin role at the top
      setRoles([adminRole, ...roles]);
    } catch {
      setRoles([
        adminRole,
        { slug: 'finance_manager', name: 'Finance Manager' },
        { slug: 'ar_clerk', name: 'Accounts Receivable' },
        { slug: 'ap_clerk', name: 'Accounts Payable' },
        { slug: 'financial_analyst', name: 'Financial Analyst' },
        { slug: 'payment_processor', name: 'Payment Processor' },
      ]);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiCall('/api/admin-verification/authenticate-enhanced', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const session = { user: data.user, token: data.token, role: selectedRole?.slug, expiresAt: Date.now() + 86400000 };
      localStorage.setItem('gf_admin_session', JSON.stringify(session));
      localStorage.setItem('gf_admin_session_token', data.token);
      window.dispatchEvent(new Event('gf-admin-session-changed'));
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00122B] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="mb-6 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest">← Back to Home</button>
        <div className="bg-[#032457] border border-[#0E3A6E] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#002D62] rounded-xl flex items-center justify-center"><Shield className="w-8 h-8 text-[#60A5FA]" /></div>
            <h1 className="text-xl font-black text-white uppercase tracking-wider">Sign In</h1>
            <p className="text-[9px] font-bold text-[#3B82F6] uppercase tracking-[0.3em] mt-2">Select role, enter credentials</p>
          </div>
          {!selectedRole ? (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Your Role</p>
              {roles.length === 0 ? <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-blue-400" size={24} /></div> : (
                roles.map((role) => (
                  <button key={role.slug} onClick={() => setSelectedRole(role)} className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/30 transition-all text-left">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-[11px] font-bold text-white">{role.name}</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /><span className="text-[10px] font-bold text-blue-400">{selectedRole.name}</span></div>
                <button type="button" onClick={() => setSelectedRole(null)} className="text-[8px] font-black text-slate-400 uppercase hover:text-white">Change</button>
              </div>
              {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl"><p className="text-[9px] font-bold text-rose-400 text-center">{error}</p></div>}
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white placeholder-slate-500 outline-none focus:border-blue-500/50" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white placeholder-slate-500 outline-none focus:border-blue-500/50" />
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <RefreshCw className="animate-spin" size={14} /> : <LogIn size={14} />}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

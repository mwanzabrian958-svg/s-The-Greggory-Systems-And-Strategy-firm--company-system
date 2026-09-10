import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../services/api';
import {
  Server, Users, Network, RefreshCw, HardDrive,
  Cpu, MemoryStick, ServerCog, Database, Lock, CheckCircle
} from 'lucide-react';

export default function MainframeHub() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [network, setNetwork] = useState({ active: 0, total: 0, cpu: 0, memory: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, roleRes] = await Promise.all([
        apiCall('/api/employees').catch(() => ({ employees: [] })),
        apiCall('/api/roles').catch(() => ({ roles: [] }))
      ]);
      setEmployees(empRes.employees || []);
      setRoles(roleRes.roles || []);
      setNetwork({ active: (empRes.employees || []).length, total: (roleRes.roles || []).length, cpu: 34, memory: 61 });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const rolePaths = {
    finance_manager: '/admin/employees/finance-manager',
    ar_clerk: '/admin/employees/accounts-receivable',
    ap_clerk: '/admin/employees/accounts-payable',
    financial_analyst: '/admin/employees/financial-analyst',
    payment_processor: '/admin/employees/payment-processor'
  };

  const roleColors = {
    finance_manager: 'from-purple-500 to-indigo-600',
    ar_clerk: 'from-blue-500 to-cyan-600',
    ap_clerk: 'from-rose-500 to-pink-600',
    financial_analyst: 'from-indigo-500 to-purple-600',
    payment_processor: 'from-green-500 to-emerald-600'
  };

  if (loading) return <div className="flex items-center justify-center py-40"><RefreshCw className="animate-spin text-blue-400" size={32} /></div>;
return (
    <div className="space-y-8 p-6">
      <div className="bg-gradient-to-r from-[#00122B] via-[#002D62] to-[#032457] rounded-2xl border border-[#3B82F6]/20 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30"><Server size={28} className="text-white" /></div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">GSS Virtual Mainframe</h2>
              <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em]">Central Host — Multi-Node Employee Workstation Network</p>
            </div>
          </div>
          <button onClick={fetchData} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"><RefreshCw size={16} /></button>
        </div>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-wider text-emerald-400"><CheckCircle size={10} /> Mainframe: ONLINE</span>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-black uppercase tracking-wider text-blue-400"><Network size={10} /> {employees.length} Workstations</span>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[8px] font-black uppercase tracking-wider text-purple-400"><Database size={10} /> 2 DB Nodes</span>
        </div>
      </div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 rounded-2xl p-5"><div className="flex items-center gap-2 mb-2"><ServerCog size={14} className="text-emerald-400" /><span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Employee Nodes</span></div><p className="text-3xl font-black text-white">{employees.length}</p><p className="text-[7px] font-bold text-slate-500 mt-1">{employees.filter(e => e.is_active).length} active</p></div>
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-2xl p-5"><div className="flex items-center gap-2 mb-2"><Database size={14} className="text-blue-400" /><span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">DB Nodes</span></div><p className="text-3xl font-black text-white">2</p><p className="text-[7px] font-bold text-slate-500 mt-1">Cloud + Local</p></div>
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/10 border border-purple-500/20 rounded-2xl p-5"><div className="flex items-center gap-2 mb-2"><Users size={14} className="text-purple-400" /><span className="text-[7px] font-black text-purple-400 uppercase tracking-widest">Roles</span></div><p className="text-3xl font-black text-white">{roles.length}</p></div>
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border border-amber-500/20 rounded-2xl p-5"><div className="flex items-center gap-2 mb-2"><HardDrive size={14} className="text-amber-400" /><span className="text-[7px] font-black text-amber-400 uppercase tracking-widest">Photo Storage</span></div><p className="text-3xl font-black text-white">BLOB</p></div>
      </div>

      {/* Employee Workstation Nodes */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Employee Workstation Nodes (Auth required — wired to staff table)</h3>
          <span className="text-[8px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1"><CheckCircle size={10} /> {employees.length} registered</span>
        </div>
        {employees.length === 0 ? (
          <p className="text-[9px] font-black text-slate-500 uppercase text-center py-8">No staff configured yet. Run: node scripts/setup-admin.cjs</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {employees.map((emp) => {
              const Color = roleColors[emp.role_slug] || 'from-blue-500 to-indigo-600';
              const path = rolePaths[emp.role_slug];
              const displayName = emp.display_name || `${emp.first_name} ${emp.last_name}`.trim();
              return (
                <button key={emp.id} onClick={() => path && navigate(path)} disabled={!path} className={`group relative bg-white/[0.02] border border-white/5 rounded-2xl p-5 ${path ? 'hover:border-blue-500/30 hover:bg-white/[0.04]' : 'opacity-40'} transition-all text-left`}>
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="text-[6px] font-black uppercase tracking-wider text-slate-500">{emp.employee_code}</span>
                    <span className={`w-2 h-2 rounded-full ${emp.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`} title={emp.is_active ? 'Online' : 'Offline'} />
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${Color} rounded-xl flex items-center justify-center mb-3`}><Users size={22} className="text-white" /></div>
                  <h4 className="text-[11px] font-black text-white">{displayName || 'Unnamed'}</h4>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">{emp.role_name || 'No role'} · {emp.department || 'Unassigned'}</p>
                  <div className="mt-3 flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"><Lock size={10} /> Open Workstation</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
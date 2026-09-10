import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../services/api';
import { Users, UserPlus, Briefcase, GraduationCap, Calendar, ArrowLeft, RefreshCw, FileText } from 'lucide-react';

export default function HROfficer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('directory');
  const [employees, setEmployees] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const res = await apiCall('/api/employees').catch(() => ({ employees: [] }));
      setEmployees(res.employees || []);
    } catch (e) { console.error('HR data fetch error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const tabs = [
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
    { id: 'onboarding', label: 'Onboarding', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: FileText },
  ];

  if (loading) return <div className="flex items-center justify-center py-40 bg-[#00122B]"><RefreshCw className="animate-spin text-pink-400" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#00122B] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/departments/human-resources')} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"><ArrowLeft size={20} /></button>
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center"><Users size={24} className="text-white" /></div>
          <div><h2 className="text-xl font-black">HR Officer Workstation</h2><p className="text-[8px] font-black text-pink-400 uppercase tracking-[0.3em]">Human Resources Department</p></div>
        </div>
        <button onClick={() => fetchData(true)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /></button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'bg-pink-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}><tab.icon size={16} />{tab.label}</button>))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        {activeTab === 'directory' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-pink-600/20 to-pink-900/10 border border-pink-500/20 rounded-xl p-4"><p className="text-[7px] font-black text-pink-400 uppercase tracking-widest">Total Staff</p><p className="text-2xl font-black">{employees.length}</p></div>
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-xl p-4"><p className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Departments</p><p className="text-2xl font-black">12</p></div>
              <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 rounded-xl p-4"><p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Active</p><p className="text-2xl font-black">{employees.filter(e => !e.deleted_at).length}</p></div>
            </div>
            <div className="space-y-2">
              {employees.slice(0, 10).map((emp, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center text-sm font-bold">{emp.first_name?.[0]}{emp.last_name?.[0]}</div>
                    <div><p className="font-medium">{emp.first_name} {emp.last_name}</p><p className="text-xs text-slate-400">{emp.role_name || emp.role}</p></div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${emp.deleted_at ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{emp.deleted_at ? 'Inactive' : 'Active'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab !== 'directory' && (
          <div className="text-center py-12 text-slate-400">
            {React.createElement(tabs.find(t => t.id === activeTab)?.icon || FileText, { size: 48, className: 'mx-auto mb-4 opacity-50' })}
            <p className="text-lg font-medium">{tabs.find(t => t.id === activeTab)?.label}</p>
            <p className="text-sm">Module content loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}


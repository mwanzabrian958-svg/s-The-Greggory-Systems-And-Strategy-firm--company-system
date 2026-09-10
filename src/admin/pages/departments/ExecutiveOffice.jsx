import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Target, BarChart3, ArrowLeft, FileText, Users, Briefcase } from 'lucide-react';

export default function ExecutiveOffice() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const employees = [{ name: 'Executive Officer', role: 'executive', icon: Award, color: 'from-yellow-500 to-amber-600' }];
  const tabs = [{ id: 'overview', label: 'Overview', icon: Briefcase },{ id: 'board', label: 'Board Meetings', icon: Users },{ id: 'strategy', label: 'Strategy', icon: Target },{ id: 'stakeholders', label: 'Stakeholders', icon: BarChart3 },{ id: 'briefings', label: 'Briefings', icon: FileText },{ id: 'reports', label: 'C-Suite Reports', icon: FileText }];
  return (
    <div className="min-h-screen bg-[#00122B] text-white p-6">
      <div className="flex items-center gap-4 mb-8"><button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"><ArrowLeft size={20} /></button><div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center"><Award size={28} className="text-white" /></div><div><h1 className="text-2xl font-black">Executive Office</h1><p className="text-[8px] font-black text-yellow-400 uppercase tracking-[0.3em]">C-Suite Leadership & Governance</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{employees.map((emp, i) => (<button key={i} onClick={() => navigate(`/admin/employees/${emp.role}`)} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"><div className={`w-12 h-12 bg-gradient-to-br ${emp.color} rounded-xl flex items-center justify-center mb-4`}><emp.icon size={24} className="text-white" /></div><h3 className="font-bold text-lg">{emp.name}</h3><p className="text-xs text-slate-400 mt-1">Open Workstation →</p></button>))}</div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'bg-yellow-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}><tab.icon size={16} />{tab.label}</button>))}</div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">{activeTab === 'overview' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/10 border border-yellow-500/20 rounded-xl p-6"><p className="text-[7px] font-black text-yellow-400 uppercase tracking-widest mb-2">Board Meetings</p><p className="text-3xl font-black">3</p></div><div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border border-amber-500/20 rounded-xl p-6"><p className="text-[7px] font-black text-amber-400 uppercase tracking-widest mb-2">Strategic Goals</p><p className="text-3xl font-black">8</p></div><div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 rounded-xl p-6"><p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest mb-2">Company Score</p><p className="text-3xl font-black">92%</p></div></div>)}{activeTab !== 'overview' && (<div className="text-center py-12 text-slate-400"><FileText size={48} className="mx-auto mb-4 opacity-50" /><p className="text-lg font-medium">{tabs.find(t => t.id === activeTab)?.label} Module</p><p className="text-sm">Content loading...</p></div>)}</div>
    </div>
  );
}



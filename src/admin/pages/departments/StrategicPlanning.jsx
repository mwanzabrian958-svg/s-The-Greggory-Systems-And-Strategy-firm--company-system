import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Target, Lightbulb, ArrowLeft, FileText, TrendingUp, Brain } from 'lucide-react';

export default function StrategicPlanning() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const employees = [{ name: 'Strategy Officer', role: 'strategy', icon: Compass, color: 'from-indigo-500 to-blue-600' }];
  const tabs = [{ id: 'overview', label: 'Overview', icon: Brain },{ id: 'roadmap', label: 'Roadmap', icon: Target },{ id: 'initiatives', label: 'Initiatives', icon: Lightbulb },{ id: 'swot', label: 'SWOT', icon: TrendingUp },{ id: 'benchmarking', label: 'Benchmarking', icon: Compass },{ id: 'reports', label: 'Reports', icon: FileText }];
  return (
    <div className="min-h-screen bg-[#00122B] text-white p-6">
      <div className="flex items-center gap-4 mb-8"><button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"><ArrowLeft size={20} /></button><div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center"><Compass size={28} className="text-white" /></div><div><h1 className="text-2xl font-black">Strategic Planning</h1><p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em]">Long-term Vision & Growth Planning</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{employees.map((emp, i) => (<button key={i} onClick={() => navigate(`/admin/employees/${emp.role}`)} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"><div className={`w-12 h-12 bg-gradient-to-br ${emp.color} rounded-xl flex items-center justify-center mb-4`}><emp.icon size={24} className="text-white" /></div><h3 className="font-bold text-lg">{emp.name}</h3><p className="text-xs text-slate-400 mt-1">Open Workstation →</p></button>))}</div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}><tab.icon size={16} />{tab.label}</button>))}</div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">{activeTab === 'overview' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-gradient-to-br from-indigo-600/20 to-indigo-900/10 border border-indigo-500/20 rounded-xl p-6"><p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-2">Active Initiatives</p><p className="text-3xl font-black">7</p></div><div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-xl p-6"><p className="text-[7px] font-black text-blue-400 uppercase tracking-widest mb-2">Goals On Track</p><p className="text-3xl font-black">85%</p></div><div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 rounded-xl p-6"><p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest mb-2">ROI Projection</p><p className="text-3xl font-black">+24%</p></div></div>)}{activeTab !== 'overview' && (<div className="text-center py-12 text-slate-400"><FileText size={48} className="mx-auto mb-4 opacity-50" /><p className="text-lg font-medium">{tabs.find(t => t.id === activeTab)?.label} Module</p><p className="text-sm">Content loading...</p></div>)}</div>
    </div>
  );
}



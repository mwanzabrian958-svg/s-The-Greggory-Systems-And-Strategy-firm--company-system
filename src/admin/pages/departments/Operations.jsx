import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Truck, Package, ArrowLeft, FileText, Activity, Clock } from 'lucide-react';

export default function Operations() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const employees = [{ name: 'Operations Officer', role: 'operations', icon: Settings, color: 'from-violet-500 to-purple-600' }];
  const tabs = [{ id: 'overview', label: 'Overview', icon: Activity },{ id: 'workflow', label: 'Workflow', icon: Settings },{ id: 'supply', label: 'Supply Chain', icon: Truck },{ id: 'inventory', label: 'Inventory', icon: Package },{ id: 'scheduling', label: 'Scheduling', icon: Clock },{ id: 'reports', label: 'Reports', icon: FileText }];

  return (
    <div className="min-h-screen bg-[#00122B] text-white p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"><ArrowLeft size={20} /></button>
        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center"><Settings size={28} className="text-white" /></div>
        <div><h1 className="text-2xl font-black">Operations</h1><p className="text-[8px] font-black text-violet-400 uppercase tracking-[0.3em]">Process Management & Logistics</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{employees.map((emp, i) => (<button key={i} onClick={() => navigate(`/admin/employees/${emp.role}`)} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left"><div className={`w-12 h-12 bg-gradient-to-br ${emp.color} rounded-xl flex items-center justify-center mb-4`}><emp.icon size={24} className="text-white" /></div><h3 className="font-bold text-lg">{emp.name}</h3><p className="text-xs text-slate-400 mt-1">Open Workstation →</p></button>))}</div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}><tab.icon size={16} />{tab.label}</button>))}</div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        {activeTab === 'overview' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-gradient-to-br from-violet-600/20 to-violet-900/10 border border-violet-500/20 rounded-xl p-6"><p className="text-[7px] font-black text-violet-400 uppercase tracking-widest mb-2">Active Workflows</p><p className="text-3xl font-black">12</p></div><div className="bg-gradient-to-br from-purple-600/20 to-purple-900/10 border border-purple-500/20 rounded-xl p-6"><p className="text-[7px] font-black text-purple-400 uppercase tracking-widest mb-2">Pending Orders</p><p className="text-3xl font-black">8</p></div><div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 rounded-xl p-6"><p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest mb-2">Efficiency</p><p className="text-3xl font-black">94%</p></div></div>)}
        {activeTab !== 'overview' && (<div className="text-center py-12 text-slate-400"><FileText size={48} className="mx-auto mb-4 opacity-50" /><p className="text-lg font-medium">{tabs.find(t => t.id === activeTab)?.label} Module</p><p className="text-sm">Content loading...</p></div>)}
      </div>
    </div>
  );
}



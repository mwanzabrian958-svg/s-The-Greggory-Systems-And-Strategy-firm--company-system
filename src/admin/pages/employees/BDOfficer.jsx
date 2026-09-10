import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, RefreshCw, FileText } from 'lucide-react';

export default function BDOfficer() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <div className="min-h-screen bg-[#00122B] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/departments/business-dev')} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"><ArrowLeft size={20} /></button>
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center"><Briefcase size={24} className="text-white" /></div>
          <div><h2 className="text-xl font-black">B D Officer Workstation</h2><p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Business Development</p></div>
        </div>
        <button onClick={() => setRefreshing(true)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /></button>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="text-center py-12 text-slate-400">
          <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Business Development Tasks</p>
          <p className="text-sm">Module content loading...</p>
        </div>
      </div>
    </div>
  );
}


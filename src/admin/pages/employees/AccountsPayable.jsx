import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../services/api';
import { formatKSH } from '../../../utils/currencyUtils';
import { BookOpen, Plus, RefreshCw, CheckCircle, ArrowDownRight, DollarSign } from 'lucide-react';

export default function AccountsPayable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [notice, setNotice] = useState(null);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await apiCall("/admin/ledger").catch(() => ({ entries: [] }));
      setEntries(res.entries || []);
    } catch (e) { console.error('AP fetch error:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, []);

  if (loading) return <div className="flex items-center justify-center py-40"><RefreshCw className="animate-spin text-blue-400" size={32} /></div>;

  const expenses = entries.filter(e => e.entry_type === 'expense');
  const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center"><BookOpen size={24} className="text-white" /></div>
          <div><h2 className="text-xl font-black text-white">Accounts Payable</h2><p className="text-[8px] font-black text-rose-400 uppercase tracking-[0.3em]">Expense Tracking & Ledger Entries</p></div>
        </div>
        <button onClick={() => navigate('/admin/billing/entry')} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-[8px] font-black uppercase"><Plus size={14} /> New Entry</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-600/20 to-rose-900/10 border border-rose-500/20 rounded-2xl p-5">
          <span className="text-[7px] font-black text-rose-400 uppercase tracking-widest">Total Expenses</span>
          <p className="text-2xl font-black text-white mt-2">{formatKSH(totalExpenses)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-600/20 to-slate-900/10 border border-slate-500/20 rounded-2xl p-5">
          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Entries</span>
          <p className="text-2xl font-black text-white mt-2">{entries.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border border-amber-500/20 rounded-2xl p-5">
          <span className="text-[7px] font-black text-amber-400 uppercase tracking-widest">Expense Entries</span>
          <p className="text-2xl font-black text-white mt-2">{expenses.length}</p>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Recent Ledger Entries</h3>
        {entries.length === 0 ? <p className="text-[9px] font-black text-slate-500 uppercase text-center py-6">No entries yet</p> : (
          <div className="space-y-2">{entries.slice(0, 10).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.entry_type === 'expense' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                  {entry.entry_type === 'expense' ? <ArrowDownRight size={12} className="text-rose-400" /> : <DollarSign size={12} className="text-emerald-400" />}
                </div>
                <div><p className="text-[10px] font-black text-white">{entry.description || 'No description'}</p><p className="text-[7px] font-bold text-slate-500">{entry.entry_type} {entry.category ? `· ${entry.category}` : ''}</p></div>
              </div>
              <span className={`text-[10px] font-black ${entry.entry_type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>{formatKSH(entry.amount || 0)}</span>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}


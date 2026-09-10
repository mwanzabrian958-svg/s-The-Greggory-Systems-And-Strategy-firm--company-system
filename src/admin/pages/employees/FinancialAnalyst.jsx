import React, { useState, useEffect } from 'react';
import { apiCall } from '../../../services/api';
import { formatKSH } from '../../../utils/currencyUtils';
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, Download, PieChart } from 'lucide-react';

export default function FinancialAnalyst() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ revenue: 0, expenses: 0, net: 0, entries: [] });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiCall("/admin/ledger").catch(() => ({ entries: [] }));
      const entries = res.entries || [];
      const rev = entries.filter(e => e.entry_type === 'invoice_payment' || e.entry_type === 'income').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
      const exp = entries.filter(e => e.entry_type === 'expense').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
      setData({ revenue: rev, expenses: exp, net: rev - exp, entries });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDownloadCSV = () => {
    const rows = [['P&L Audit'], ['Revenue', data.revenue], ['Expenses', data.expenses], ['Net', data.net]];
    data.entries.forEach(e => rows.push([e.entry_type, e.category, e.description, e.amount]));
    const csv = rows.map(r => r.map(v => `"${String(v ?? '')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pl-audit.csv'; a.click();
  };

  if (loading) return <div className="flex items-center justify-center py-40"><RefreshCw className="animate-spin text-blue-400" size={32} /></div>;

  const expenseBreakdown = {};
  data.entries.filter(e => e.entry_type === 'expense').forEach(e => { expenseBreakdown[e.category || 'Other'] = (expenseBreakdown[e.category || 'Other'] || 0) + parseFloat(e.amount || 0); });
  const expenseCategories = Object.entries(expenseBreakdown).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"><BarChart3 size={24} className="text-white" /></div>
          <div><h2 className="text-xl font-black text-white">Financial Analyst</h2><p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em]">P&L Reports & Cash Flow</p></div>
        </div>
        <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase"><Download size={14} /> Export CSV</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-emerald-400" /><span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Revenue</span></div>
          <p className="text-3xl font-black text-white">{formatKSH(data.revenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-600/20 to-rose-900/10 border border-rose-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2"><TrendingDown size={14} className="text-rose-400" /><span className="text-[7px] font-black text-rose-400 uppercase tracking-widest">Expenses</span></div>
          <p className="text-3xl font-black text-white">{formatKSH(data.expenses)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2"><PieChart size={14} className="text-blue-400" /><span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Net Profit</span></div>
          <p className="text-3xl font-black text-white">{formatKSH(data.net)}</p>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Expense Breakdown</h4>
        {expenseCategories.map(item => (
          <div key={item.category} className="space-y-2 mb-3">
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400"><span>{item.category}</span><span className="text-rose-400">{formatKSH(item.total)}</span></div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-rose-500 rounded-full" style={{ width: `${data.expenses > 0 ? (item.total / data.expenses) * 100 : 0}%` }}></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}


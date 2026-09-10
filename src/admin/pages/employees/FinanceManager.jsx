import React, { useState, useEffect } from 'react';
import { apiCall } from '../../../services/api';
import { formatKSH } from '../../../utils/currencyUtils';
import { TrendingUp, TrendingDown, DollarSign, FileText, RefreshCw, Users, CheckCircle, Clock } from 'lucide-react';

export default function FinanceManager() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financials, setFinancials] = useState({
    revenue: 0, expenses: 0, net_income: 0, outstanding: 0,
    invoices: [], entries: [], mpesa: [], pendingApprovals: []
  });

  const fetchFinancialData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const [ledgerRes, invoiceRes, mpesaRes] = await Promise.all([
        apiCall("/admin/ledger").catch(() => ({ entries: [] })),
        apiCall("/invoices").catch(() => ({ invoices: [], data: [] })),
        apiCall("/mpesa/transactions").catch(() => ({ transactions: [] }))
      ]);
      const entries = ledgerRes.entries || [];
      const invoices = invoiceRes.invoices || invoiceRes.data || (Array.isArray(invoiceRes) ? invoiceRes : []);
      const totalRevenue = entries.filter(e => e.entry_type === 'income' || e.entry_type === 'invoice_payment').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
      const totalExpenses = entries.filter(e => e.entry_type === 'expense').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
      const outstanding = invoices.filter(inv => String(inv.status || '').toLowerCase() !== 'paid').reduce((s, inv) => s + parseFloat(inv.total_amount_kes || inv.amount || 0), 0);
      const mpesaList = Array.isArray(mpesaRes) ? mpesaRes : ((mpesaRes && (mpesaRes.transactions || mpesaRes.data)) || []);
      const pendingApprovals = invoices.filter(inv => String(inv.status || '').toLowerCase() === 'draft');
      setFinancials({ revenue: totalRevenue, expenses: totalExpenses, net_income: totalRevenue - totalExpenses, outstanding, invoices, entries, mpesa: mpesaList, pendingApprovals });
    } catch (e) { console.error('Finance Manager data fetch error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchFinancialData(); }, []);

  if (loading) return <div className="flex items-center justify-center py-40"><RefreshCw className="animate-spin text-blue-400" size={32} /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Finance Manager</h2>
            <p className="text-[8px] font-black text-purple-400 uppercase tracking-[0.3em]">Department Oversight & Approvals</p>
          </div>
        </div>
        <button onClick={() => fetchFinancialData(true)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"><RefreshCw size={16} /></button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Revenue</span><TrendingUp size={14} className="text-emerald-400" /></div>
          <p className="text-xl font-black text-white">{formatKSH(financials.revenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-600/20 to-rose-900/10 border border-rose-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[7px] font-black text-rose-400 uppercase tracking-widest">Expenses</span><TrendingDown size={14} className="text-rose-400" /></div>
          <p className="text-xl font-black text-white">{formatKSH(financials.expenses)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Net Income</span><DollarSign size={14} className="text-blue-400" /></div>
          <p className="text-xl font-black text-white">{formatKSH(financials.net_income)}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[7px] font-black text-amber-400 uppercase tracking-widest">Outstanding</span><Clock size={14} className="text-amber-400" /></div>
          <p className="text-xl font-black text-white">{formatKSH(financials.outstanding)}</p>
        </div>
      </div>
    </div>
  );
}


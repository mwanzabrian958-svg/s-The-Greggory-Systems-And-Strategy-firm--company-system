import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DepartmentNavBar from '../../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../../config/department-navbars';
import { apiCall } from '../../../services/api';
import { formatKSH } from '../../../utils/currencyUtils';
import {
  TrendingUp, TrendingDown, DollarSign, FileText, Download,
  Calendar, RefreshCw, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Users
} from 'lucide-react';

export default function FinanceLegal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financials, setFinancials] = useState({
    revenue: 0, expenses: 0, net_income: 0, outstanding: 0,
    invoices: [], entries: [], mpesa: []
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

      setFinancials({
        revenue: totalRevenue,
        expenses: totalExpenses,
        net_income: totalRevenue - totalExpenses,
        outstanding,
        invoices,
        entries,
        mpesa: mpesaList
      });
    } catch (e) { console.error('Finance data fetch error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchFinancialData(); }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#00122B] flex flex-col items-center justify-center z-[500]">
        <RefreshCw className="animate-spin text-blue-400 mb-4" size={32} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Financial Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#00122B] z-[500] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#00122B] border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-wider">Accounting & Finance</h1>
            <p className="text-[7px] font-black text-blue-400 uppercase tracking-[0.4em]">Financial Operations Command</p>
          </div>
        </div>
        <button onClick={() => fetchFinancialData(true)} disabled={refreshing} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Department Navigation */}
      <div className="px-6 pt-4 flex-shrink-0">
        <DepartmentNavBar links={DEPARTMENT_NAV_BARS['finance-legal']} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-black text-emerald-400 uppercase tracking-[0.3em]">Total Revenue</span>
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={14} className="text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{formatKSH(financials.revenue)}</p>
            <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-400">
              <ArrowUpRight size={10} />
              <span>Income + Invoice Payments</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-600/20 to-rose-900/10 border border-rose-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-black text-rose-400 uppercase tracking-[0.3em]">Total Expenses</span>
              <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown size={14} className="text-rose-400" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{formatKSH(financials.expenses)}</p>
            <div className="flex items-center gap-1 text-[8px] font-bold text-rose-400">
              <ArrowDownRight size={10} />
              <span>Operational Outflow</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.3em]">Net Income</span>
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <DollarSign size={14} className="text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{formatKSH(financials.net_income)}</p>
            <div className="flex items-center gap-1 text-[8px] font-bold text-blue-400">
              <PieChart size={10} />
              <span>{financials.revenue > 0 ? Math.round((financials.net_income / financials.revenue) * 100) : 0}% margin</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border border-amber-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-black text-amber-400 uppercase tracking-[0.3em]">Outstanding</span>
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 size={14} className="text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{formatKSH(financials.outstanding)}</p>
            <div className="flex items-center gap-1 text-[8px] font-bold text-amber-400">
              <FileText size={10} />
              <span>{financials.invoices.filter(i => String(i.status).toLowerCase() !== 'paid').length} unpaid invoices</span>
            </div>
          </div>
        </div>

        {/* Revenue vs Expenses Visual */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Cash Flow Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                <span>Revenue</span>
                <span className="text-emerald-400">{formatKSH(financials.revenue)}</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${financials.revenue > 0 ? 100 : 0}%` }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                <span>Expenses</span>
                <span className="text-rose-400">{formatKSH(financials.expenses)}</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500" style={{ width: `${financials.revenue > 0 ? Math.min(100, (financials.expenses / financials.revenue) * 100) : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Recent Invoices</h3>
            <button onClick={() => navigate('/admin/billing/create')} className="text-[7px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-all">
              + New Invoice
            </button>
          </div>
          {financials.invoices.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No invoices yet</p>
              <button onClick={() => navigate('/admin/billing/create')} className="mt-3 text-[8px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">Create first invoice</button>
            </div>
          ) : (
            <div className="space-y-2">
              {financials.invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <FileText size={12} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white">{invoice.invoice_number || `INV-${invoice.id}`}</p>
                      <p className="text-[7px] font-bold text-slate-500">{invoice.client_name || invoice.title || 'No client'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-emerald-400">{formatKSH(invoice.total_amount_kes || invoice.amount || 0)}</span>
                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${
                      String(invoice.status).toLowerCase() === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                      String(invoice.status).toLowerCase() === 'sent' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>{String(invoice.status || 'draft')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* M-Pesa Transactions Summary */}
        {financials.mpesa.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Recent M-Pesa Payments</h3>
              <button onClick={() => navigate('/admin/mpesa')} className="text-[7px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-all">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {financials.mpesa.slice(0, 3).map((t) => (
                <div key={t.id || t.transaction_id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <DollarSign size={12} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white font-mono">{t.mpesa_receipt || t.transaction_id}</p>
                      <p className="text-[7px] font-bold text-slate-500">{t.phone_number}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400">{formatKSH(t.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/admin/billing/create')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/30">
            <FileText size={12} /> Create Invoice
          </button>
          <button onClick={() => navigate('/admin/billing/entry')} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">
            <DollarSign size={12} /> Ledger Entry
          </button>
          <button onClick={() => navigate('/admin/billing/pl-report')} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">
            <BarChart3 size={12} /> P&L Report
          </button>
          <button onClick={() => navigate('/admin/mpesa')} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">
            <Calendar size={12} /> M-Pesa
          </button>
        </div>

        {/* Employee Workstations */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Employee Workstations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { path: '/admin/employees/finance-manager', label: 'Finance Manager', desc: 'Oversight & Approvals', color: 'from-purple-500 to-indigo-600' },
              { path: '/admin/employees/accounts-receivable', label: 'Accounts Receivable', desc: 'Invoicing & Tracking', color: 'from-blue-500 to-cyan-600' },
              { path: '/admin/employees/accounts-payable', label: 'Accounts Payable', desc: 'Expenses & Ledger', color: 'from-rose-500 to-pink-600' },
              { path: '/admin/employees/financial-analyst', label: 'Financial Analyst', desc: 'P&L & Cash Flow', color: 'from-indigo-500 to-purple-600' },
              { path: '/admin/employees/payment-processor', label: 'Payment Processor', desc: 'M-Pesa Transactions', color: 'from-green-500 to-emerald-600' },
            ].map(ws => (
              <button key={ws.path} onClick={() => navigate(ws.path)} className="group flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/15 hover:bg-white/[0.04] transition-all text-left">
                <div className={`w-9 h-9 bg-gradient-to-br ${ws.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Users size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white">{ws.label}</p>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">{ws.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


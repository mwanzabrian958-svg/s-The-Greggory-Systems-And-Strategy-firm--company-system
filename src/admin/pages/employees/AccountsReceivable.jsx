import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../services/api';
import { formatKSH } from '../../../utils/currencyUtils';
import { FileText, Send, RefreshCw, Plus, CheckCircle, Clock } from 'lucide-react';

export default function AccountsReceivable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [invoices, setInvoices] = useState([]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiCall("/invoices").catch(() => ({ invoices: [], data: [] }));
      setInvoices(res.invoices || res.data || (Array.isArray(res) ? res : []));
    } catch (e) { console.error('AR fetch error:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleSendInvoice = async (inv) => {
    if (!inv.client_email) { setNotice({ ok: false, text: `No client email.` }); return; }
    if (!window.confirm(`Send to ${inv.client_email}?`)) return;
    setSendingId(inv.id);
    try {
      const res = await apiCall(`/invoices/${inv.id}/send`, { method: "POST", body: "{}" });
      if (res.success) { setNotice({ ok: true, text: 'Sent!' }); fetchInvoices(); }
      else { setNotice({ ok: false, text: res.error || 'Failed' }); }
    } catch (e) { setNotice({ ok: false, text: String(e) }); }
    setSendingId(null);
    setTimeout(() => setNotice(null), 6000);
  };

  if (loading) return <div className="flex items-center justify-center py-40"><RefreshCw className="animate-spin text-blue-400" size={32} /></div>;

  const unpaid = invoices.filter(i => String(i.status).toLowerCase() !== 'paid');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center"><FileText size={24} className="text-white" /></div>
          <div><h2 className="text-xl font-black text-white">Accounts Receivable</h2><p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.3em]">Invoicing & Payment Tracking</p></div>
        </div>
        <button onClick={() => navigate('/admin/billing/create')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[8px] font-black uppercase"><Plus size={14} /> New Invoice</button>
      </div>
      {notice && <div className={`p-4 rounded-xl ${notice.ok ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
        {notice.ok ? <CheckCircle size={14} className="text-emerald-400 inline mr-2" /> : <Clock size={14} className="text-rose-400 inline mr-2" />}
        <span className={`text-[9px] font-bold ${notice.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{notice.text}</span>
      </div>}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Unpaid Invoices ({unpaid.length})</h3>
        {unpaid.length === 0 ? <p className="text-[9px] font-black text-slate-500 uppercase text-center py-6">All invoices paid</p> : (
          <div className="space-y-2">{unpaid.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="flex items-center gap-3"><FileText size={12} className="text-blue-400" /><div><p className="text-[10px] font-black text-white">{inv.invoice_number || `INV-${inv.id}`}</p><p className="text-[7px] font-bold text-slate-500">{inv.client_name || 'No client'}</p></div></div>
              <div className="flex items-center gap-3"><span className="text-[10px] font-black text-emerald-400">{formatKSH(inv.total_amount_kes || 0)}</span><button onClick={() => handleSendInvoice(inv)} disabled={sendingId === inv.id} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[7px] font-black uppercase disabled:opacity-50"><Send size={10} className="inline mr-1" />Send</button></div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}


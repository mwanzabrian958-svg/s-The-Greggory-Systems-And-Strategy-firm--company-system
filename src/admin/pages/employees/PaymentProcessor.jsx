import React, { useState, useEffect } from 'react';
import { apiCall } from '../../../services/api';
import { formatKSH } from '../../../utils/currencyUtils';
import { Smartphone, Save, RefreshCw, Search, CheckCircle, X, Plus } from 'lucide-react';

export default function PaymentProcessor() {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mpesa_receipt: '', phone_number: '', amount: '', client_id: '', project_id: '', invoice_id: '', notes: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pay, cli, proj, inv] = await Promise.all([
        apiCall("/mpesa/send-money"), apiCall("/api/users"), apiCall("/api/user-projects"), apiCall("/api/invoices")
      ]);
      setPayments(pay.payments || []); setClients(Array.isArray(cli) ? cli : (cli.users || [])); setProjects(Array.isArray(proj) ? proj : (proj.projects || [])); setInvoices(Array.isArray(inv) ? inv : (inv.invoices || []));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await apiCall("/mpesa/send-money/record", { method: "POST", body: JSON.stringify({ ...form, amount: parseFloat(form.amount), client_id: form.client_id ? Number(form.client_id) : null, project_id: form.project_id ? Number(form.project_id) : null, invoice_id: form.invoice_id ? Number(form.invoice_id) : null }) });
      if (res.success) { setNotice({ ok: true, text: res.message }); setForm({ mpesa_receipt: '', phone_number: '', amount: '', client_id: '', project_id: '', invoice_id: '', notes: '' }); setShowForm(false); fetchData(); }
      else { setNotice({ ok: false, text: res.error || 'Failed' }); }
    } catch (e) { setNotice({ ok: false, text: String(e) }); }
    setSaving(false); setTimeout(() => setNotice(null), 6000);
  };

  if (loading) return <div className="flex items-center justify-center py-40"><RefreshCw className="animate-spin text-blue-400" size={32} /></div>;

  const filtered = payments.filter((p) => { if (!searchTerm) return true; const t = searchTerm.toLowerCase(); return (p.mpesa_receipt && p.mpesa_receipt.toLowerCase().includes(t)) || (p.phone_number && p.phone_number.includes(t)); });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"><Smartphone size={24} className="text-white" /></div>
          <div><h2 className="text-xl font-black text-white">Payment Processor</h2><p className="text-[8px] font-black text-green-400 uppercase tracking-[0.3em]">M-Pesa Transactions</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white" /></div>
          <button onClick={fetchData} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400"><RefreshCw size={16} /></button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[8px] font-black uppercase"><Plus size={14} /> Record</button>
        </div>
      </div>
      {notice && <div className={`p-4 rounded-xl ${notice.ok ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>{notice.ok ? <CheckCircle size={14} className="text-emerald-400 inline mr-2" /> : <X size={14} className="text-rose-400 inline mr-2" />}<span className={`text-[9px] font-bold ${notice.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{notice.text}</span></div>}
      {showForm && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-[7px] font-black text-slate-500 uppercase">Receipt *</label><input type="text" value={form.mpesa_receipt} onChange={(e) => setForm({...form, mpesa_receipt: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white" required /></div>
            <div><label className="text-[7px] font-black text-slate-500 uppercase">Phone *</label><input type="tel" value={form.phone_number} onChange={(e) => setForm({...form, phone_number: e.target.value})} placeholder="254712345678" className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white" required /></div>
            <div><label className="text-[7px] font-black text-slate-500 uppercase">Amount *</label><input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white" required /></div>
            <div><label className="text-[7px] font-black text-slate-500 uppercase">Client</label><select value={form.client_id} onChange={(e) => setForm({...form, client_id: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white"><option value="">Select...</option>{clients.map((c) => (<option key={c.id} value={c.id}>{c.display_name || c.email}</option>))}</select></div>
            <div><label className="text-[7px] font-black text-slate-500 uppercase">Project</label><select value={form.project_id} onChange={(e) => setForm({...form, project_id: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white"><option value="">Select...</option>{projects.map((p) => (<option key={p.id} value={p.id}>{p.project_name || p.name}</option>))}</select></div>
            <div><label className="text-[7px] font-black text-slate-500 uppercase">Invoice</label><select value={form.invoice_id} onChange={(e) => setForm({...form, invoice_id: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white"><option value="">Select...</option>{invoices.map((inv) => (<option key={inv.id} value={inv.id}>{inv.invoice_number || `INV-${inv.id}`}</option>))}</select></div>
            <div className="md:col-span-3"><button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 text-white text-[8px] font-black uppercase rounded-lg disabled:opacity-50"><Save size={12} className="inline mr-2" />{saving ? '...' : 'Record'}</button></div>
          </form>
        </div>
      )}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Payments ({filtered.length})</h3>
        {filtered.length === 0 ? <p className="text-[9px] font-black text-slate-500 uppercase text-center py-6">No payments</p> : (
          <table className="w-full text-left"><thead><tr className="border-b border-white/5"><th className="pb-3 text-[7px] font-black text-slate-400 uppercase">Receipt</th><th className="pb-3 text-[7px] font-black text-slate-400 uppercase">Phone</th><th className="pb-3 text-[7px] font-black text-slate-400 uppercase">Amount</th><th className="pb-3 text-[7px] font-black text-slate-400 uppercase">Status</th></tr></thead><tbody>{filtered.map((p) => (<tr key={p.id || p.transaction_id}><td className="py-3 text-[9px] font-black text-white font-mono">{p.mpesa_receipt || p.transaction_id}</td><td className="py-3 text-[9px] font-bold text-slate-400">{p.phone_number}</td><td className="py-3 text-[10px] font-black text-emerald-400">{formatKSH(p.amount)}</td><td className="py-3"><span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{String(p.status || 'pending')}</span></td></tr>))}</tbody></table>
        )}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import { Smartphone, Save, RefreshCw, Search, CheckCircle } from "lucide-react";

export function MpesaSendMoney() {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    mpesa_receipt: "", transaction_id: "", phone_number: "", amount: "",
    client_id: "", client_name: "", client_email: "", project_id: "",
    invoice_id: "", company_id: "", account_reference: "", notes: ""
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pay, cli, proj, inv, comp] = await Promise.all([
        apiCall("/mpesa/send-money"),
        apiCall("/api/users"),
        apiCall("/api/user-projects"),
        apiCall("/api/invoices"),
        apiCall("/api/companies").catch(() => ({ companies: [] }))
      ]);
      setPayments(pay.payments || []);
      setClients(Array.isArray(cli) ? cli : (cli.users || []));
      setProjects(Array.isArray(proj) ? proj : (proj.projects || []));
      setInvoices(Array.isArray(inv) ? inv : (inv.invoices || []));
      setCompanies(Array.isArray(comp) ? comp : (comp.companies || []));
    } catch (e) { console.error("Fetch error:", e); }
    finally { setLoading(false); }
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (field === "client_id" && value) {
      const c = clients.find((x) => x.id === Number(value));
      if (c) setForm((p) => ({ ...p, client_name: c.display_name || `${c.first_name || ""} ${c.last_name || ""}`.trim(), client_email: c.email || "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const res = await apiCall("/mpesa/send-money/record", {
        method: "POST",
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), client_id: form.client_id ? Number(form.client_id) : null, project_id: form.project_id ? Number(form.project_id) : null, invoice_id: form.invoice_id ? Number(form.invoice_id) : null, company_id: form.company_id ? Number(form.company_id) : null })
      });
      if (res.success) {
        setNotice({ ok: true, text: res.message });
        setForm({ mpesa_receipt: "", transaction_id: "", phone_number: "", amount: "", client_id: "", client_name: "", client_email: "", project_id: "", invoice_id: "", company_id: "", account_reference: "", notes: "" });
        fetchData();
      } else { setNotice({ ok: false, text: res.error || "Failed" }); }
    } catch (e) { setNotice({ ok: false, text: String(e.message || e) }); }
    setSaving(false);
    setTimeout(() => setNotice(null), 6000);
  };

  const filtered = payments.filter((p) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (p.mpesa_receipt && p.mpesa_receipt.toLowerCase().includes(t)) || (p.phone_number && p.phone_number.includes(t)) || (p.client_name && p.client_name.toLowerCase().includes(t));
  });

  if (loading) return <div className="flex items-center justify-center py-40"><RefreshCw className="animate-spin text-blue-700 w-8 h-8" /></div>;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">M-Pesa Send Money</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Record received M-Pesa payments</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><RefreshCw size={14} /></button>
      </div>

      {notice && (
        <div className={`p-3 rounded-xl text-[8px] font-bold uppercase tracking-widest ${notice.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {notice.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Smartphone size={12} className="text-blue-700" /> Record New Payment
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">M-Pesa Receipt *</label>
            <input type="text" value={form.mpesa_receipt} onChange={(e) => handleChange("mpesa_receipt", e.target.value)} placeholder="QKJ7ABC123" className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-[9px] font-bold focus:outline-none focus:border-blue-500" required />
          </div>
          <div>
            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Phone Number *</label>
            <input type="tel" value={form.phone_number} onChange={(e) => handleChange("phone_number", e.target.value)} placeholder="254712345678" className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-[9px] font-bold focus:outline-none focus:border-blue-500" required />
          </div>
          <div>
            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Amount (KES) *</label>
            <input type="number" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} placeholder="5000" min="1" step="0.01" className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-[9px] font-bold focus:outline-none focus:border-blue-500" required />
          </div>
          <div>
            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Client</label>
            <select value={form.client_id} onChange={(e) => handleChange("client_id", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-[9px] font-bold focus:outline-none focus:border-blue-500">
              <option value="">Select...</option>
              {clients.map((c) => (<option key={c.id} value={c.id}>{c.display_name || c.email}</option>))}
            </select>
          </div>
          <div>
            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Project</label>
            <select value={form.project_id} onChange={(e) => handleChange("project_id", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-[9px] font-bold focus:outline-none focus:border-blue-500">
              <option value="">Select...</option>
              {projects.map((p) => (<option key={p.id} value={p.id}>{p.project_name || p.name}</option>))}
            </select>
          </div>
          <div>
            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Invoice</label>
            <select value={form.invoice_id} onChange={(e) => handleChange("invoice_id", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-[9px] font-bold focus:outline-none focus:border-blue-500">
              <option value="">Select...</option>
              {invoices.map((inv) => (<option key={inv.id} value={inv.id}>{inv.invoice_number || `INV-${inv.id}`}</option>))}
            </select>
          </div>
          <div>
            <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Company</label>
            <select value={form.company_id} onChange={(e) => handleChange("company_id", e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-[9px] font-bold focus:outline-none focus:border-blue-500">
              <option value="">Select...</option>
              {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#B8860B] text-black text-[8px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 flex items-center gap-2">
              <Save size={12} /> {saving ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
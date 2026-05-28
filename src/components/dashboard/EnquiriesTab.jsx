import React, { useEffect, useMemo, useState } from "react";
import { Archive, Link2, MessageCircle, Plus, RefreshCw, RotateCcw, UserPlus } from "lucide-react";
import { DARK } from "../../constants";
import { supabase } from "../../lib/supabase";
import { formatPhone, waLink } from "../../utils";

const BRAND = "#ea4c89";
const DONE = ["paid", "completed"];
const ACTIVE = ["new", "interested", "replied", "quoted", "waiting_payment", "booked", "follow_up"];
const STATUSES = [
  ["new", "New"],
  ["interested", "Interested"],
  ["replied", "Replied"],
  ["quoted", "Quoted / price sent"],
  ["waiting_payment", "Waiting for payment / booking"],
  ["booked", "Booked"],
  ["paid", "Paid"],
  ["completed", "Completed"],
  ["follow_up", "Follow-up needed"],
  ["lost", "Lost / not now"],
];
const SOURCES = ["manual", "public_page", "whatsapp_catalogue", "phone_call", "walk_in", "facebook", "instagram", "referral", "yoco"];
const METHODS = ["Cash", "EFT", "Yoco", "PayShap", "Card", "Other"];
const input = { border: "1px solid #eeeeea", borderRadius: 12, padding: "10px 11px", fontSize: 13, background: "#fff" };

const label = (value) => STATUSES.find((s) => s[0] === value)?.[1] || value || "New";
const money = (value) => Number(value || 0) > 0 ? `R${Number(value).toLocaleString()}` : "Ask price";
const date = (value) => value ? new Date(value).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) : "";
const digits = (value = "") => String(value).replace(/\D/g, "");
const samePhone = (a = "", b = "") => Boolean(digits(formatPhone(a)) && digits(formatPhone(a)) === digits(formatPhone(b)));
const archiveStatus = (status) => DONE.includes(status) || status === "lost";
const bucket = (e) => e.is_archived ? "done" : e.status === "lost" ? "lost" : DONE.includes(e.status) ? "done" : e.status === "follow_up" ? "follow_up" : "open";
const sourceLabel = (value) => String(value || "manual").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
const mergeInterest = (items = [], product = "") => Array.isArray(items) && product && !items.includes(product) ? [...items, product] : (Array.isArray(items) ? items : product ? [product] : []);
const nextCustomerStatus = (customer, paid = false) => {
  if (!customer) return "lead";
  if (customer.status === "vip") return "vip";
  if (paid) return (Number(customer.visit_count || 0) + 1) > 1 ? "regular" : "new";
  return ["new", "regular"].includes(customer.status) ? customer.status : "lead";
};

function Field({ title, children }) {
  return <label style={{ display: "grid", gap: 5, fontSize: 12, color: "#888", fontWeight: 850 }}>{title}{children}</label>;
}

function ConfirmSale({ enquiry, customer, onClose, onSave }) {
  const [amount, setAmount] = useState(String(enquiry.product_price || ""));
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState(enquiry.product_name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    const value = Number(amount || 0);
    if (!value) return setError("Add the sale amount before saving.");
    setSaving(true);
    try {
      await onSave({ amount: value, method, reference: reference || enquiry.product_name || "Enquiry sale" });
      onClose();
    } catch (err) {
      setError(err.message || "Could not save sale.");
    }
    setSaving(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 18 }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 26, padding: 18 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 6px", color: DARK }}>Confirm sale</h2>
        <p style={{ margin: "0 0 14px", color: "#777", fontSize: 13 }}>This will create a sale, update the customer, and mark the enquiry as paid.</p>
        <div style={{ background: "#fbfbfb", border: "1px solid #eeeeea", borderRadius: 14, padding: 12, marginBottom: 12, fontSize: 13 }}>{customer?.name || enquiry.customer_name} · {enquiry.product_name}</div>
        <div style={{ display: "grid", gap: 10 }}>
          <Field title="Amount"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...input, fontSize: 22, fontWeight: 900, textAlign: "center" }} /></Field>
          <Field title="Payment method"><select value={method} onChange={(e) => setMethod(e.target.value)} style={input}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
          <Field title="Reference"><input value={reference} onChange={(e) => setReference(e.target.value)} style={input} /></Field>
          {error && <div style={{ color: "#9f1239", background: "#fff5f7", border: "1px solid #ffd7e4", borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 800 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={saving} style={{ flex: 1, border: "none", background: BRAND, color: "#fff", borderRadius: 14, padding: 13, fontWeight: 950 }}>{saving ? "Saving..." : "Save sale and mark paid"}</button>
            <button onClick={onClose} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: 14, padding: "13px 16px", fontWeight: 850 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddEnquiry({ business, customers, onClose, onCreated }) {
  const [form, setForm] = useState({ product_name: "", product_price: "", customer_name: "", customer_phone: "", source: "whatsapp_catalogue", status: "interested", notes: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function findOrCreateCustomer() {
    const phone = formatPhone(form.customer_phone);
    if (!phone) return null;
    const found = customers.find((c) => samePhone(c.whatsapp, phone));
    if (found) {
      const patch = { name: found.name || form.customer_name || "WhatsApp Customer", whatsapp: formatPhone(found.whatsapp || phone), interested_in: mergeInterest(found.interested_in, form.product_name), last_contacted: new Date().toISOString() };
      const { data, error } = await supabase.from("customers").update(patch).eq("id", found.id).select().single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase.from("customers").insert([{ business_id: business.id, name: form.customer_name || "WhatsApp Customer", whatsapp: phone, status: "lead", interested_in: form.product_name ? [form.product_name] : [], notes: `Created from enquiry about ${form.product_name}.`, last_contacted: new Date().toISOString() }]).select().single();
    if (error) throw error;
    return data;
  }

  async function save() {
    if (!form.product_name.trim()) return setError("Add the product or service.");
    if (!form.customer_name.trim() && !form.customer_phone.trim()) return setError("Add a name or WhatsApp number.");
    setSaving(true);
    setError("");
    try {
      const customer = await findOrCreateCustomer();
      const archived = archiveStatus(form.status);
      const { data, error } = await supabase.from("enquiries").insert({ business_id: business.id, customer_id: customer?.id || null, customer_name: customer?.name || form.customer_name || null, customer_phone: customer?.whatsapp || formatPhone(form.customer_phone) || null, product_name: form.product_name.trim(), product_price: Number(form.product_price || 0) || null, source: form.source, status: form.status, notes: form.notes, message: form.notes, is_archived: archived, archived_at: archived ? new Date().toISOString() : null }).select().single();
      if (error) throw error;
      onCreated(data, customer);
      onClose();
    } catch (err) {
      setError(err.message || "Could not save enquiry.");
    }
    setSaving(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 18 }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 26, padding: 18 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 6px", color: DARK }}>Add enquiry</h2>
        <p style={{ margin: "0 0 14px", color: "#777", fontSize: 13 }}>Capture leads from WhatsApp Catalogue, calls, walk-ins, referrals or Yoco.</p>
        <div style={{ display: "grid", gap: 10 }}>
          <Field title="Product / service"><input value={form.product_name} onChange={(e) => update("product_name", e.target.value)} style={input} autoFocus /></Field>
          <Field title="Price"><input type="number" value={form.product_price} onChange={(e) => update("product_price", e.target.value)} style={input} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}><Field title="Customer name"><input value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} style={input} /></Field><Field title="Customer WhatsApp"><input value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} style={input} /></Field></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}><Field title="Source"><select value={form.source} onChange={(e) => update("source", e.target.value)} style={input}>{SOURCES.map((s) => <option key={s} value={s}>{sourceLabel(s)}</option>)}</select></Field><Field title="Status"><select value={form.status} onChange={(e) => update("status", e.target.value)} style={input}>{STATUSES.map((s) => <option key={s[0]} value={s[0]}>{s[1]}</option>)}</select></Field></div>
          <Field title="Notes"><textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} style={{ ...input, minHeight: 80 }} /></Field>
          {error && <div style={{ color: "#9f1239", background: "#fff5f7", border: "1px solid #ffd7e4", borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 800 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}><button onClick={save} disabled={saving} style={{ flex: 1, border: "none", background: BRAND, color: "#fff", borderRadius: 14, padding: 13, fontWeight: 950 }}>{saving ? "Saving..." : "Save enquiry"}</button><button onClick={onClose} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: 14, padding: "13px 16px", fontWeight: 850 }}>Cancel</button></div>
        </div>
      </div>
    </div>
  );
}

export function EnquiriesTab({ business }) {
  const [enquiries, setEnquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [linkingId, setLinkingId] = useState(null);
  const [filter, setFilter] = useState("open");
  const [showAdd, setShowAdd] = useState(false);
  const [saleFor, setSaleFor] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const customerById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);
  const filtered = filter === "all" ? enquiries : enquiries.filter((e) => bucket(e) === filter);
  const counts = enquiries.reduce((acc, e) => { acc.total++; acc[bucket(e)] = (acc[bucket(e)] || 0) + 1; if (e.customer_id) acc.linked++; if (e.status) acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, { total: 0, open: 0, done: 0, lost: 0, follow_up: 0, linked: 0, waiting_payment: 0 });
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  async function load() {
    if (!business?.id) return;
    setLoading(true); setError("");
    const [{ data: es, error: e1 }, { data: cs, error: e2 }] = await Promise.all([
      supabase.from("enquiries").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
      supabase.from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
    ]);
    if (e1) setError(e1.message); else setEnquiries(es || []);
    if (e2) console.warn(e2.message); else setCustomers(cs || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [business?.id]);

  async function updateEnquiry(id, patch) {
    const { error } = await supabase.from("enquiries").update(patch).eq("id", id);
    if (error) throw error;
    setEnquiries((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  async function syncCustomer(enquiry, status) {
    const customer = customerById[enquiry.customer_id];
    if (!customer) return;
    const patch = { interested_in: mergeInterest(customer.interested_in, enquiry.product_name) };
    if (["replied", "quoted", "waiting_payment", "booked", "follow_up"].includes(status)) patch.last_contacted = new Date().toISOString();
    if (!["new", "regular", "vip"].includes(customer.status)) patch.status = nextCustomerStatus(customer, false);
    const { data, error } = await supabase.from("customers").update(patch).eq("id", customer.id).select().single();
    if (error) throw error;
    setCustomers((rows) => rows.map((row) => row.id === customer.id ? data : row));
  }

  async function changeStatus(enquiry, status) {
    if (status === "paid" && !enquiry.sale_payment_id) { setSaleFor(enquiry); return; }
    setSavingId(enquiry.id);
    try {
      const archived = archiveStatus(status);
      await updateEnquiry(enquiry.id, { status, is_archived: archived, archived_at: archived ? new Date().toISOString() : null });
      await syncCustomer(enquiry, status);
      showToast(`Moved to ${label(status)}`);
    } catch (err) { setError(err.message || "Could not update status."); }
    setSavingId(null);
  }

  async function confirmSale(enquiry, sale) {
    const customer = customerById[enquiry.customer_id];
    if (!customer) throw new Error("Link this enquiry to a customer first.");
    const { data: payment, error: payError } = await supabase.from("payments").insert([{ business_id: business.id, customer_id: customer.id, amount: sale.amount, status: "Paid", method: sale.method, reference: sale.reference }]).select().single();
    if (payError) throw payError;
    const patch = { total_spent: Number(customer.total_spent || 0) + sale.amount, visit_count: Number(customer.visit_count || 0) + 1, last_contacted: new Date().toISOString(), status: nextCustomerStatus(customer, true), interested_in: mergeInterest(customer.interested_in, enquiry.product_name) };
    const { data: updatedCustomer, error: custError } = await supabase.from("customers").update(patch).eq("id", customer.id).select().single();
    if (custError) throw custError;
    await updateEnquiry(enquiry.id, { status: "paid", is_archived: true, archived_at: new Date().toISOString(), sale_payment_id: payment.id });
    setCustomers((rows) => rows.map((row) => row.id === customer.id ? updatedCustomer : row));
    showToast("Sale saved and enquiry marked paid");
  }

  async function restore(enquiry) {
    setSavingId(enquiry.id);
    try {
      await updateEnquiry(enquiry.id, { is_archived: false, archived_at: null, status: "follow_up" });
      await syncCustomer(enquiry, "follow_up");
      setFilter("follow_up");
      showToast("Restored as follow-up needed");
    } catch (err) { setError(err.message || "Could not restore enquiry."); }
    setSavingId(null);
  }

  async function linkCustomer(enquiry) {
    const phone = formatPhone(enquiry.customer_phone || "");
    if (!phone) return setError("Add the customer WhatsApp number first.");
    setLinkingId(enquiry.id); setError("");
    try {
      let customer = customers.find((c) => samePhone(c.whatsapp, phone));
      if (!customer) {
        const { data, error } = await supabase.from("customers").insert([{ business_id: business.id, name: enquiry.customer_name || "WhatsApp Customer", whatsapp: phone, status: "lead", interested_in: enquiry.product_name ? [enquiry.product_name] : [], last_contacted: new Date().toISOString() }]).select().single();
        if (error) throw error;
        customer = data;
        setCustomers((rows) => [data, ...rows]);
      }
      await updateEnquiry(enquiry.id, { customer_id: customer.id, customer_name: customer.name, customer_phone: customer.whatsapp });
      showToast("Customer linked");
    } catch (err) { setError(err.message || "Could not link customer."); }
    setLinkingId(null);
  }

  function followUp(enquiry) {
    changeStatus(enquiry, "follow_up");
    const number = enquiry.customer_phone || customerById[enquiry.customer_id]?.whatsapp || "";
    const message = `Hi, just following up on your enquiry about ${enquiry.product_name || "my product/service"}. Please let me know if you are still interested.`;
    if (number) window.open(waLink(number, message), "_blank", "noopener,noreferrer");
  }

  if (!business?.id) return <div>Set up your business first. Your public page enquiries will appear here.</div>;

  return <div style={{ maxWidth: 1040 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}><div><div style={{ color: BRAND, fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Lead control</div><h1 style={{ fontSize: 30, fontWeight: 950, margin: "4px 0", color: DARK }}>Enquiries</h1><p style={{ margin: 0, color: "#777", fontSize: 14 }}>Track who asked about what, who needs a reply, and who needs a follow-up.</p></div><div style={{ display: "flex", gap: 8 }}><button onClick={() => setShowAdd(true)} style={{ border: "none", background: BRAND, color: "#fff", borderRadius: 14, padding: "11px 14px", fontWeight: 900 }}><Plus size={16} /> Add enquiry</button><button onClick={load} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: 14, padding: "11px 14px", fontWeight: 850 }}><RefreshCw size={16} /> Refresh</button></div></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>{[["Open enquiries", counts.open], ["Waiting payment", counts.waiting_payment || 0], ["Done / archived", counts.done || 0], ["Linked customers", counts.linked || 0]].map(([k, v]) => <div key={k} style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: 18, padding: 14 }}><div style={{ fontSize: 24, fontWeight: 950 }}>{v}</div><div style={{ fontSize: 12, color: "#888", fontWeight: 800 }}>{k}</div></div>)}</div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>{[["open", "Open", counts.open], ["follow_up", "Follow-up", counts.follow_up], ["done", "Done", counts.done], ["lost", "Lost", counts.lost], ["all", "All", counts.total]].map(([key, text, count]) => <button key={key} onClick={() => setFilter(key)} style={{ border: `1.5px solid ${filter === key ? BRAND : "#eeeeea"}`, background: filter === key ? "#fde8f1" : "#fff", color: filter === key ? BRAND : "#555", borderRadius: 999, padding: "9px 13px", fontWeight: 900 }}>{text} ({count || 0})</button>)}</div>
    {error && <div style={{ background: "#fff5f7", border: "1px solid #ffd7e4", color: "#9f1239", borderRadius: 16, padding: 12, marginBottom: 14, fontSize: 13, fontWeight: 750 }}>{error}</div>}
    {loading ? <div>Loading enquiries...</div> : <div style={{ display: "grid", gap: 12 }}>{filtered.map((enquiry) => { const customer = customerById[enquiry.customer_id]; const archived = enquiry.is_archived || DONE.includes(enquiry.status); return <div key={enquiry.id} style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: 22, padding: 16, boxShadow: "0 12px 34px rgba(15,23,42,.05)", opacity: archived ? .86 : 1 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}><div><div style={{ fontSize: 17, fontWeight: 950, color: DARK }}>{enquiry.product_name || "General enquiry"}</div><div style={{ color: "#777", fontSize: 12, fontWeight: 800 }}>{money(enquiry.product_price)} · {date(enquiry.created_at)} · {sourceLabel(enquiry.source)} {enquiry.sale_payment_id ? " · Sale logged" : ""}</div></div><span style={{ background: archived ? "#f4f4f5" : "#fde8f1", color: archived ? "#666" : BRAND, borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 900 }}>{label(enquiry.status)}</span></div>{customer && <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f7fff5", border: "1px solid #d6f5cc", borderRadius: 14, padding: "10px 12px", marginBottom: 12, color: "#247a2b", fontSize: 12, fontWeight: 850 }}><Link2 size={15} /> Linked to customer: {customer.name} {customer.whatsapp ? `(${customer.whatsapp})` : ""}</div>}<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 12 }}><Field title="Customer name"><input value={enquiry.customer_name || ""} onChange={(e) => setEnquiries((rows) => rows.map((r) => r.id === enquiry.id ? { ...r, customer_name: e.target.value } : r))} onBlur={(e) => updateEnquiry(enquiry.id, { customer_name: e.target.value }).catch((err) => setError(err.message))} style={input} /></Field><Field title="Customer WhatsApp"><input value={enquiry.customer_phone || ""} onChange={(e) => setEnquiries((rows) => rows.map((r) => r.id === enquiry.id ? { ...r, customer_phone: e.target.value } : r))} onBlur={(e) => updateEnquiry(enquiry.id, { customer_phone: e.target.value }).catch((err) => setError(err.message))} style={input} /></Field><Field title="Status"><select value={enquiry.status || "new"} onChange={(e) => changeStatus(enquiry, e.target.value)} disabled={savingId === enquiry.id} style={input}>{STATUSES.map((s) => <option key={s[0]} value={s[0]}>{s[1]}</option>)}</select></Field></div><Field title="Notes"><textarea value={enquiry.notes || ""} onChange={(e) => setEnquiries((rows) => rows.map((r) => r.id === enquiry.id ? { ...r, notes: e.target.value } : r))} onBlur={(e) => updateEnquiry(enquiry.id, { notes: e.target.value }).catch((err) => setError(err.message))} style={{ ...input, minHeight: 58, marginBottom: 12 }} /></Field><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8 }}><button onClick={() => linkCustomer(enquiry)} disabled={linkingId === enquiry.id || !enquiry.customer_phone} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: 14, padding: 12, fontWeight: 950 }}><UserPlus size={17} /> {customer ? "Update customer link" : "Create / link customer"}</button><button onClick={() => followUp(enquiry)} style={{ border: "none", background: BRAND, color: "#fff", borderRadius: 14, padding: 12, fontWeight: 950 }}><MessageCircle size={17} /> Follow up on WhatsApp</button>{archived ? <button onClick={() => restore(enquiry)} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: 14, padding: 12, fontWeight: 950 }}><RotateCcw size={17} /> Restore to follow-up</button> : <button onClick={() => changeStatus(enquiry, "completed")} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: 14, padding: 12, fontWeight: 950 }}><Archive size={17} /> Mark as done</button>}</div></div>; })}</div>}
    {showAdd && <AddEnquiry business={business} customers={customers} onClose={() => setShowAdd(false)} onCreated={(enquiry, customer) => { setEnquiries((rows) => [enquiry, ...rows]); if (customer) setCustomers((rows) => rows.some((r) => r.id === customer.id) ? rows.map((r) => r.id === customer.id ? customer : r) : [customer, ...rows]); showToast("Manual enquiry saved"); }} />}
    {saleFor && <ConfirmSale enquiry={saleFor} customer={customerById[saleFor.customer_id]} onClose={() => setSaleFor(null)} onSave={(sale) => confirmSale(saleFor, sale)} />}
    {toast && <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: DARK, color: "#fff", padding: "12px 24px", borderRadius: 999, fontSize: 13, fontWeight: 800, zIndex: 2000 }}>{toast}</div>}
  </div>;
}

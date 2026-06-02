import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle, Link2, MessageCircle, Plus, RefreshCw, UserPlus, WalletCards } from "lucide-react";
import { DARK } from "../../constants";
import { CUSTOMER_JOURNEY, archiveJourney, journeyConfig, normaliseJourneyStatus, statusPatchForJourney } from "../../customerJourney";
import { extractCustomerMessage, fullWhatsAppMessage, nextEnquiryAction } from "../../enquiryHelpers";
import { extractVulaMeta, itemTypeConfig } from "../../vulaItems";
import { supabase } from "../../lib/supabase";
import { formatPhone, waLink } from "../../utils";

const BRAND = "#ea4c89";
const BORDER = "#eeeeea";
const input = { border: "1px solid #eeeeea", borderRadius: 12, padding: "10px 11px", fontSize: 13, background: "#fff" };
const money = (value) => Number(value || 0) > 0 ? `R${Number(value).toLocaleString()}` : "Ask price";
const today = () => new Date().toISOString().slice(0, 10);
const sourceLabel = (value) => String(value || "manual").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
const digits = (value = "") => String(value).replace(/\D/g, "");
const samePhone = (a = "", b = "") => Boolean(digits(formatPhone(a)) && digits(formatPhone(a)) === digits(formatPhone(b)));
const mergeInterest = (items = [], product = "") => Array.isArray(items) && product && !items.includes(product) ? [...items, product] : (Array.isArray(items) ? items : product ? [product] : []);

function bucket(item) {
  const stage = normaliseJourneyStatus(item.status);
  if (stage === "lost") return "lost";
  if (["booked", "paid", "completed"].includes(stage) || (item.is_archived && stage !== "lost")) return "done";
  if (stage === "followed_up") return "follow_up";
  return "open";
}
function Field({ title, children }) { return <label style={{ display: "grid", gap: 5, fontSize: 12, color: "#888", fontWeight: 850 }}>{title}{children}</label>; }
function parseMessageField(message = "", label = "") { const match = String(message || "").match(new RegExp(`${label}:\\s*([^\\n]+)`, "i")); return match?.[1]?.trim() || ""; }
function leadType(enquiry, product) {
  if (product) return extractVulaMeta(product).item_type;
  const status = normaliseJourneyStatus(enquiry.status);
  if (["booking_requested", "booked"].includes(status)) return "service";
  return "unknown";
}
function leadTypeLabel(type) { return type === "unknown" ? "Lead" : itemTypeConfig(type).shortLabel; }
function leadTypeStyle(type) { const agreement = ["service", "made_to_order"].includes(type); return { background: agreement ? "#eef7ff" : "#fff5f9", color: agreement ? "#155e75" : BRAND, border: agreement ? "#b8dfff" : "#f8b8d2" }; }
function saleButtonLabel(type) { if (type === "daily_stock") return "Mark sold today"; if (type === "made_to_order") return "Mark completed / sold"; return "Mark sold"; }

function AddLead({ business, customers, onClose, onCreated }) {
  const [form, setForm] = useState({ product_name: "", product_price: "", customer_name: "", customer_phone: "", source: "whatsapp_catalogue", status: "new_enquiry", notes: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  async function findOrCreateCustomer() {
    const phone = formatPhone(form.customer_phone);
    if (!phone) return null;
    const stage = normaliseJourneyStatus(form.status);
    const found = customers.find((customer) => samePhone(customer.whatsapp, phone));
    if (found) {
      const patch = { ...statusPatchForJourney(stage, found), status: stage, name: found.name || form.customer_name || "WhatsApp Customer", whatsapp: formatPhone(found.whatsapp || phone), interested_in: mergeInterest(found.interested_in, form.product_name), last_contacted: new Date().toISOString() };
      const { data, error } = await supabase.from("customers").update(patch).eq("id", found.id).select().single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase.from("customers").insert([{ business_id: business.id, name: form.customer_name || "WhatsApp Customer", whatsapp: phone, status: stage, stage, tags: [], interested_in: form.product_name ? [form.product_name] : [], notes: `Created from lead about ${form.product_name}.`, last_contacted: new Date().toISOString() }]).select().single();
    if (error) throw error;
    return data;
  }
  async function save() {
    if (!form.product_name.trim()) return setError("Add the product or service.");
    if (!form.customer_name.trim() && !form.customer_phone.trim()) return setError("Add a name or WhatsApp number.");
    setSaving(true); setError("");
    try {
      const stage = normaliseJourneyStatus(form.status);
      const customer = await findOrCreateCustomer();
      const archived = archiveJourney(stage);
      const { data, error } = await supabase.from("enquiries").insert({ business_id: business.id, customer_id: customer?.id || null, customer_name: customer?.name || form.customer_name || null, customer_phone: customer?.whatsapp || formatPhone(form.customer_phone) || null, product_name: form.product_name.trim(), product_price: Number(form.product_price || 0) || null, source: form.source, status: stage, notes: form.notes, message: form.notes, is_archived: archived, archived_at: archived ? new Date().toISOString() : null }).select().single();
      if (error) throw error;
      onCreated(data, customer); onClose();
    } catch (err) { setError(err.message || "Could not save lead."); }
    setSaving(false);
  }
  return <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 18 }} onClick={onClose}><div style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 26, padding: 18 }} onClick={(e) => e.stopPropagation()}><h2 style={{ margin: "0 0 6px", color: DARK }}>Add lead</h2><p style={{ margin: "0 0 14px", color: "#777", fontSize: 13 }}>Capture leads from WhatsApp Catalogue, calls, walk-ins, referrals or Yoco.</p><div style={{ display: "grid", gap: 10 }}><Field title="Product / service"><input value={form.product_name} onChange={(e) => update("product_name", e.target.value)} style={input} autoFocus /></Field><Field title="Price"><input type="number" value={form.product_price} onChange={(e) => update("product_price", e.target.value)} style={input} /></Field><Field title="Customer name"><input value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} style={input} /></Field><Field title="Customer WhatsApp"><input value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} style={input} /></Field><Field title="Journey"><select value={form.status} onChange={(e) => update("status", e.target.value)} style={input}>{CUSTOMER_JOURNEY.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field title="Notes"><textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} style={{ ...input, minHeight: 80 }} /></Field>{error && <div style={{ color: "#9f1239", background: "#fff5f7", border: "1px solid #ffd7e4", borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 800 }}>{error}</div>}<div style={{ display: "flex", gap: 8 }}><button onClick={save} disabled={saving} style={{ flex: 1, border: "none", background: BRAND, color: "#fff", borderRadius: 14, padding: 13, fontWeight: 950 }}>{saving ? "Saving..." : "Save lead"}</button><button onClick={onClose} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: 14, padding: "13px 16px", fontWeight: 850 }}>Cancel</button></div></div></div></div>;
}

function ConfirmSaleModal({ enquiry, product, customer, type, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState(String(Number(enquiry?.product_price || product?.price || 0) || ""));
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const qty = Math.max(Number(quantity || 1), 1);
  const total = Number(amount || 0) || 0;
  async function submit() {
    if (!enquiry?.id) return;
    setSaving(true); setError("");
    try {
      await onConfirm({ enquiry, quantity: qty, amount: total, paymentStatus, notes });
      onClose();
    } catch (err) { setError(err.message || "Could not record sale."); }
    setSaving(false);
  }
  return <div style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 18 }} onClick={onClose}><div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 26, padding: 18, boxShadow: "0 30px 80px rgba(0,0,0,.22)" }} onClick={(e) => e.stopPropagation()}><h2 style={{ margin: "0 0 6px", color: DARK }}>Confirm sale</h2><p style={{ margin: "0 0 14px", color: "#777", fontSize: 13 }}>Record the sale, reduce stock where needed, and close this lead.</p><div style={{ display: "grid", gap: 10 }}><div style={{ background: "#fff8fc", border: "1px solid #f8b8d2", borderRadius: 16, padding: 12 }}><div style={{ fontSize: 12, color: BRAND, fontWeight: 950, textTransform: "uppercase" }}>{leadTypeLabel(type)}</div><div style={{ fontSize: 17, color: DARK, fontWeight: 950 }}>{enquiry.product_name || product?.name || "Sale"}</div><div style={{ fontSize: 12, color: "#777", fontWeight: 800 }}>Customer: {customer?.name || enquiry.customer_name || "Walk-in / WhatsApp customer"}</div></div><Field title="Quantity sold"><input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={input} autoFocus /></Field><Field title="Sale amount"><input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={input} /></Field><Field title="Payment status"><select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} style={input}><option value="paid">Paid</option><option value="pending">Payment pending</option></select></Field><Field title="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...input, minHeight: 72 }} placeholder="Optional note" /></Field>{error && <div style={{ color: "#9f1239", background: "#fff5f7", border: "1px solid #ffd7e4", borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 800 }}>{error}</div>}<div style={{ display: "flex", gap: 8 }}><button onClick={submit} disabled={saving} style={{ flex: 1, border: "none", background: BRAND, color: "#fff", borderRadius: 14, padding: 13, fontWeight: 950 }}>{saving ? "Recording..." : `Confirm ${money(total)} sale`}</button><button onClick={onClose} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: 14, padding: "13px 16px", fontWeight: 850 }}>Cancel</button></div></div></div></div>;
}

function SmartActions({ enquiry, product, stage, onMove, onAcceptBooking, onFollowUp, onSale }) {
  const type = leadType(enquiry, product);
  const btn = (label, action, icon = null, variant = "light") => <button onClick={action} style={{ border: variant === "main" ? "none" : `1px solid ${BORDER}`, background: variant === "main" ? BRAND : "#fff", color: variant === "main" ? "#fff" : "#555", borderRadius: 12, padding: "9px 11px", fontSize: 12, fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{icon}{label}</button>;
  if (type === "service") return <>{stage !== "booked" && btn("Accept booking", () => onAcceptBooking(enquiry, product), <CalendarDays size={15} />, "main")}{btn("Request deposit", () => onMove(enquiry, "payment_pending", "Payment pending"), <WalletCards size={15} />)}{btn("Suggest another time", () => onFollowUp(enquiry))}{btn("Mark completed", () => onMove(enquiry, "completed", "Completed"), <CheckCircle size={15} />)}</>;
  if (type === "daily_stock") return <>{btn("Confirm order", () => onMove(enquiry, "price_sent", "Order confirmed"), null, "main")}{btn("Send payment", () => onMove(enquiry, "payment_pending", "Payment pending"), <WalletCards size={15} />)}{btn(saleButtonLabel(type), () => onSale(enquiry, product), <CheckCircle size={15} />)}{btn("Sold out today", () => onMove(enquiry, "lost", "Moved to lost / not now"))}</>;
  if (type === "made_to_order") return <>{btn("Accept order", () => onMove(enquiry, "price_sent", "Order accepted"), null, "main")}{btn("Request deposit", () => onMove(enquiry, "payment_pending", "Payment pending"), <WalletCards size={15} />)}{btn("Mark in progress", () => onMove(enquiry, "booked", "Marked in progress"))}{btn(saleButtonLabel(type), () => onSale(enquiry, product), <CheckCircle size={15} />)}</>;
  return <>{btn("Reply available", () => onMove(enquiry, "followed_up", "Reply recorded"), null, "main")}{btn("Send payment", () => onMove(enquiry, "payment_pending", "Payment pending"), <WalletCards size={15} />)}{btn(saleButtonLabel(type), () => onSale(enquiry, product), <CheckCircle size={15} />)}</>;
}

export function EnquiriesTab({ business }) {
  const [enquiries, setEnquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [linkingId, setLinkingId] = useState(null);
  const [filter, setFilter] = useState("open");
  const [showAdd, setShowAdd] = useState(false);
  const [saleLead, setSaleLead] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const customerById = useMemo(() => Object.fromEntries(customers.map((customer) => [customer.id, customer])), [customers]);
  const productById = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products]);
  const productByName = useMemo(() => Object.fromEntries(products.map((product) => [String(product.name || "").toLowerCase(), product])), [products]);
  const filtered = filter === "all" ? enquiries : enquiries.filter((item) => bucket(item) === filter);
  const counts = enquiries.reduce((acc, item) => { acc.total++; acc[bucket(item)] = (acc[bucket(item)] || 0) + 1; if (item.customer_id) acc.linked++; if (normaliseJourneyStatus(item.status) === "payment_pending") acc.payment_pending++; return acc; }, { total: 0, open: 0, done: 0, lost: 0, follow_up: 0, linked: 0, payment_pending: 0 });
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };
  const findProduct = (enquiry) => productById[enquiry.product_id] || productByName[String(enquiry.product_name || "").toLowerCase()] || null;

  async function autoLink(es = [], cs = []) {
    const nextEnquiries = [...es]; const nextCustomers = [...cs]; const writes = [];
    for (const enquiry of es) {
      if (enquiry.customer_id || !enquiry.customer_phone) continue;
      const phone = formatPhone(enquiry.customer_phone || ""); const customer = nextCustomers.find((item) => samePhone(item.whatsapp, phone)); if (!customer) continue;
      const stage = normaliseJourneyStatus(enquiry.status || "new_enquiry");
      const enquiryPatch = { customer_id: customer.id, customer_name: customer.name || enquiry.customer_name, customer_phone: customer.whatsapp || phone, status: stage };
      const customerPatch = { ...statusPatchForJourney(stage, customer), status: stage, interested_in: mergeInterest(customer.interested_in, enquiry.product_name), last_contacted: new Date().toISOString() };
      writes.push(supabase.from("enquiries").update(enquiryPatch).eq("id", enquiry.id)); writes.push(supabase.from("customers").update(customerPatch).eq("id", customer.id));
      const ei = nextEnquiries.findIndex((row) => row.id === enquiry.id); if (ei >= 0) nextEnquiries[ei] = { ...nextEnquiries[ei], ...enquiryPatch };
      const ci = nextCustomers.findIndex((row) => row.id === customer.id); if (ci >= 0) nextCustomers[ci] = { ...nextCustomers[ci], ...customerPatch };
    }
    if (writes.length) await Promise.allSettled(writes);
    return { enquiries: nextEnquiries, customers: nextCustomers };
  }
  async function load() {
    if (!business?.id) return;
    setLoading(true); setError("");
    const [{ data: es, error: e1 }, { data: cs, error: e2 }, { data: ps, error: e3 }] = await Promise.all([supabase.from("enquiries").select("*").eq("business_id", business.id).order("created_at", { ascending: false }), supabase.from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false }), supabase.from("products").select("*").eq("business_id", business.id)]);
    if (e1) setError(e1.message); if (e2) console.warn(e2.message); if (e3) console.warn(e3.message);
    const linked = await autoLink(e1 ? [] : (es || []), e2 ? [] : (cs || []));
    if (!e1) setEnquiries(linked.enquiries); if (!e2) setCustomers(linked.customers); if (!e3) setProducts(ps || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [business?.id]);

  async function updateEnquiry(id, patch) { const { error } = await supabase.from("enquiries").update(patch).eq("id", id); if (error) throw error; setEnquiries((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row)); }
  async function syncCustomer(enquiry, stageValue) { const customer = customerById[enquiry.customer_id]; if (!customer) return; const stage = normaliseJourneyStatus(stageValue); const patch = { ...statusPatchForJourney(stage, customer), status: stage, interested_in: mergeInterest(customer.interested_in, enquiry.product_name) }; if (!["lost", "completed", "paid"].includes(stage)) patch.last_contacted = new Date().toISOString(); const { data, error } = await supabase.from("customers").update(patch).eq("id", customer.id).select().single(); if (error) throw error; setCustomers((rows) => rows.map((row) => row.id === customer.id ? data : row)); }
  async function moveLead(enquiry, stageValue, label) { const stage = normaliseJourneyStatus(stageValue); setSavingId(enquiry.id); try { const archived = archiveJourney(stage); await updateEnquiry(enquiry.id, { status: stage, is_archived: archived, archived_at: archived ? new Date().toISOString() : null }); await syncCustomer(enquiry, stage); showToast(label || `Moved to ${journeyConfig(stage).label}`); } catch (err) { setError(err.message || "Could not update lead."); } setSavingId(null); }
  async function changeStatus(enquiry, stageValue) { await moveLead(enquiry, stageValue, `Moved to ${journeyConfig(normaliseJourneyStatus(stageValue)).label}`); }
  async function confirmSale({ enquiry, quantity, amount, paymentStatus, notes }) {
    setSavingId(enquiry.id); setError("");
    const { data, error } = await supabase.rpc("confirm_lead_sale", { input_enquiry_id: enquiry.id, input_quantity: quantity, input_total_amount: amount, input_payment_status: paymentStatus, input_notes: notes });
    if (error) { setSavingId(null); throw error; }
    await load();
    const result = data || {};
    const stockMsg = result.sold_out ? " Sold out." : Number.isFinite(Number(result.new_stock)) ? ` ${Number(result.new_stock)} left.` : "";
    showToast(`Sale recorded.${stockMsg}`);
    setSavingId(null);
  }
  async function acceptBooking(enquiry, product) {
    setSavingId(enquiry.id); setError("");
    try {
      const customer = customerById[enquiry.customer_id] || null;
      const message = fullWhatsAppMessage(enquiry);
      const payload = { business_id: business.id, customer_id: enquiry.customer_id || null, customer_name: enquiry.customer_name || customer?.name || "Customer", customer_whatsapp: enquiry.customer_phone || customer?.whatsapp || "", service: enquiry.product_name || product?.name || "Booking", booking_date: parseMessageField(message, "Preferred date") || today(), booking_time: parseMessageField(message, "Preferred time") || null, price: enquiry.product_price ? Number(enquiry.product_price) : null, deposit: null, notes: `Created from lead${enquiry.id ? ` ${enquiry.id}` : ""}. ${extractCustomerMessage(enquiry) || ""}`.trim(), status: "confirmed" };
      const { error } = await supabase.from("bookings").insert([payload]);
      if (error) throw error;
      await moveLead(enquiry, "booked", "Booking accepted and added to Bookings");
    } catch (err) { setError(err.message || "Could not create booking."); }
    setSavingId(null);
  }
  async function linkCustomer(enquiry) { const phone = formatPhone(enquiry.customer_phone || ""); if (!phone) return setError("Add the customer WhatsApp number first."); setLinkingId(enquiry.id); setError(""); try { const stage = normaliseJourneyStatus(enquiry.status); let customer = customers.find((item) => samePhone(item.whatsapp, phone)); if (!customer) { const { data, error } = await supabase.from("customers").insert([{ business_id: business.id, name: enquiry.customer_name || "WhatsApp Customer", whatsapp: phone, status: stage, stage, tags: [], interested_in: enquiry.product_name ? [enquiry.product_name] : [], last_contacted: new Date().toISOString() }]).select().single(); if (error) throw error; customer = data; setCustomers((rows) => [data, ...rows]); } else { await syncCustomer({ ...enquiry, customer_id: customer.id }, stage); } await updateEnquiry(enquiry.id, { customer_id: customer.id, customer_name: customer.name, customer_phone: customer.whatsapp, status: stage }); showToast("Customer linked"); } catch (err) { setError(err.message || "Could not link customer."); } setLinkingId(null); }
  function followUp(enquiry) { moveLead(enquiry, "followed_up", "Follow-up recorded"); const number = enquiry.customer_phone || customerById[enquiry.customer_id]?.whatsapp || ""; const message = `Hi, just following up on your enquiry about ${enquiry.product_name || "my product/service"}. Please let me know if you are still interested.`; if (number) window.open(waLink(number, message), "_blank", "noopener,noreferrer"); }
  if (!business?.id) return <div>Set up your business first. Your public page leads will appear here.</div>;

  return <div style={{ maxWidth: 1040 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}><div><div style={{ color: BRAND, fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Lead control</div><h1 style={{ fontSize: 30, fontWeight: 950, margin: "4px 0", color: DARK }}>Leads</h1><p style={{ margin: 0, color: "#777", fontSize: 14 }}>Track who asked about what, who needs a reply, and who became a sale.</p></div><div style={{ display: "flex", gap: 8 }}><button onClick={() => setShowAdd(true)} style={{ border: "none", background: BRAND, color: "#fff", borderRadius: 14, padding: "11px 14px", fontWeight: 900 }}><Plus size={16} /> Add lead</button><button onClick={load} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: 14, padding: "11px 14px", fontWeight: 850 }}><RefreshCw size={16} /> Refresh</button></div></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>{[["Open leads", counts.open], ["Payment pending", counts.payment_pending], ["Booked / done", counts.done], ["Linked customers", counts.linked]].map(([k, v]) => <div key={k} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 14 }}><div style={{ fontSize: 24, fontWeight: 950 }}>{v || 0}</div><div style={{ fontSize: 12, color: "#888", fontWeight: 800 }}>{k}</div></div>)}</div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>{[["open", "Open", counts.open], ["follow_up", "Follow-up", counts.follow_up], ["done", "Booked / Done", counts.done], ["lost", "Lost", counts.lost], ["all", "All", counts.total]].map(([key, text, count]) => <button key={key} onClick={() => setFilter(key)} style={{ border: `1.5px solid ${filter === key ? BRAND : BORDER}`, background: filter === key ? "#fde8f1" : "#fff", color: filter === key ? BRAND : "#555", borderRadius: 999, padding: "9px 13px", fontWeight: 900 }}>{text} ({count || 0})</button>)}</div>
    {error && <div style={{ background: "#fff5f7", border: "1px solid #ffd7e4", color: "#9f1239", borderRadius: 16, padding: 12, marginBottom: 14, fontSize: 13, fontWeight: 750 }}>{error}</div>}
    {loading ? <div>Loading leads...</div> : <div style={{ display: "grid", gap: 12 }}>{filtered.map((enquiry) => { const customer = customerById[enquiry.customer_id]; const product = findProduct(enquiry); const type = leadType(enquiry, product); const style = leadTypeStyle(type); const stage = normaliseJourneyStatus(enquiry.status); const config = journeyConfig(stage); const note = extractCustomerMessage(enquiry); const message = fullWhatsAppMessage(enquiry); return <div key={enquiry.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 22, padding: 16, boxShadow: "0 12px 34px rgba(15,23,42,.05)", opacity: archiveJourney(stage) ? .86 : 1 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}><div><div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 6 }}><span style={{ background: style.background, color: style.color, border: `1px solid ${style.border}`, borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 900 }}>{leadTypeLabel(type)} lead</span><span style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}`, borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 900 }}>{config.label}</span></div><div style={{ fontSize: 17, fontWeight: 950, color: DARK }}>{enquiry.product_name || "General lead"}</div><div style={{ color: "#777", fontSize: 12, fontWeight: 800 }}>{money(enquiry.product_price)} · {sourceLabel(enquiry.source)}</div></div></div>{customer && <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f7fff5", border: "1px solid #d6f5cc", borderRadius: 14, padding: "10px 12px", marginBottom: 12, color: "#247a2b", fontSize: 12, fontWeight: 850 }}><Link2 size={15} /> Linked to customer: {customer.name} {customer.whatsapp ? `(${customer.whatsapp})` : ""}</div>}{note && <div style={{ background: "#fff8fc", border: "1px solid #f8b8d2", borderRadius: 14, padding: "10px 12px", marginBottom: 10 }}><div style={{ color: BRAND, fontSize: 11, fontWeight: 950, textTransform: "uppercase", marginBottom: 5 }}>Customer message</div><div style={{ fontSize: 13, color: DARK, lineHeight: 1.55, fontWeight: 750 }}>{note}</div></div>}<div style={{ background: "#fbfbfb", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "10px 12px", marginBottom: 12 }}><div style={{ color: "#777", fontSize: 12, fontWeight: 900 }}>{nextEnquiryAction(enquiry, normaliseJourneyStatus)}</div>{message && <details style={{ marginTop: 8 }}><summary style={{ cursor: "pointer", color: BRAND, fontSize: 12, fontWeight: 900 }}>View full WhatsApp message</summary><pre style={{ whiteSpace: "pre-wrap", margin: "8px 0 0", fontFamily: "inherit", fontSize: 12, color: "#666", lineHeight: 1.5 }}>{message}</pre></details>}</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, opacity: savingId === enquiry.id ? .6 : 1 }}><SmartActions enquiry={enquiry} product={product} stage={stage} onMove={moveLead} onAcceptBooking={acceptBooking} onFollowUp={followUp} onSale={(lead, prod) => setSaleLead({ enquiry: lead, product: prod, type: leadType(lead, prod), customer: customerById[lead.customer_id] })} /></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 12 }}><Field title="Customer name"><input value={enquiry.customer_name || ""} onChange={(e) => setEnquiries((rows) => rows.map((r) => r.id === enquiry.id ? { ...r, customer_name: e.target.value } : r))} onBlur={(e) => updateEnquiry(enquiry.id, { customer_name: e.target.value }).catch((err) => setError(err.message))} style={input} /></Field><Field title="Customer WhatsApp"><input value={enquiry.customer_phone || ""} onChange={(e) => setEnquiries((rows) => rows.map((r) => r.id === enquiry.id ? { ...r, customer_phone: e.target.value } : r))} onBlur={(e) => updateEnquiry(enquiry.id, { customer_phone: e.target.value }).catch((err) => setError(err.message))} style={input} /></Field><Field title="Journey"><select value={stage} onChange={(e) => changeStatus(enquiry, e.target.value)} disabled={savingId === enquiry.id} style={input}>{CUSTOMER_JOURNEY.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field></div><Field title="Internal notes"><textarea value={enquiry.notes || ""} onChange={(e) => setEnquiries((rows) => rows.map((r) => r.id === enquiry.id ? { ...r, notes: e.target.value } : r))} onBlur={(e) => updateEnquiry(enquiry.id, { notes: e.target.value }).catch((err) => setError(err.message))} style={{ ...input, minHeight: 58, marginBottom: 12 }} /></Field><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8 }}><button onClick={() => linkCustomer(enquiry)} disabled={linkingId === enquiry.id || !enquiry.customer_phone} style={{ border: `1px solid ${BORDER}`, background: "#fff", borderRadius: 14, padding: 12, fontWeight: 950 }}><UserPlus size={17} /> {customer ? "Fix customer link" : "Create / link customer"}</button><button onClick={() => followUp(enquiry)} style={{ border: "none", background: BRAND, color: "#fff", borderRadius: 14, padding: 12, fontWeight: 950 }}><MessageCircle size={17} /> Follow up on WhatsApp</button></div></div>; })}</div>}
    {showAdd && <AddLead business={business} customers={customers} onClose={() => setShowAdd(false)} onCreated={(enquiry, customer) => { setEnquiries((rows) => [enquiry, ...rows]); if (customer) setCustomers((rows) => rows.some((r) => r.id === customer.id) ? rows.map((r) => r.id === customer.id ? customer : r) : [customer, ...rows]); showToast("Manual lead saved"); }} />}
    {saleLead && <ConfirmSaleModal enquiry={saleLead.enquiry} product={saleLead.product} customer={saleLead.customer} type={saleLead.type} onClose={() => setSaleLead(null)} onConfirm={confirmSale} />}
    {toast && <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: DARK, color: "#fff", padding: "12px 24px", borderRadius: 999, fontSize: 13, fontWeight: 800, zIndex: 2000 }}>{toast}</div>}
  </div>;
}

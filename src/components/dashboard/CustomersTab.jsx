import React, { useEffect, useMemo, useState } from "react";
import { MessageCircle, Pencil, StickyNote, Users } from "lucide-react";
import { DARK, inputStyle, labelStyle, PAYMENT_METHODS, PAYMENT_STATUSES } from "../../constants";
import { CUSTOMER_JOURNEY, DEFAULT_CUSTOMER_TAGS, journeyConfig, journeyForCustomer, statusPatchForJourney, tagsForCustomer } from "../../customerJourney";
import { formatPhone, timeAgo, waLink } from "../../utils";
import { supabase } from "../../lib/supabase";
import { StatusBadge } from "../ui";

const BRAND = "#ea4c89";
const BORDER = "#eeeeea";

function normaliseVariants(variants = []) {
  if (!Array.isArray(variants)) return [];
  return variants.map((variant) => ({ id: variant.id || `${variant.name || "variant"}-${variant.price || ""}`, name: variant.name || "", price: variant.price ?? "", description: variant.description || "" })).filter((variant) => variant.name || variant.price || variant.description);
}

function saleOptions(products = []) {
  return products.flatMap((product) => {
    const variants = normaliseVariants(product.variants || []);
    if (variants.length === 0) return [{ key: `product:${product.id}`, label: `${product.name || "Unnamed item"}${Number(product.price || 0) > 0 ? ` - R${Number(product.price || 0).toLocaleString()}` : ""}`, amount: Number(product.price || 0), reference: product.name || "" }];
    return variants.map((variant) => ({ key: `variant:${product.id}:${variant.id}`, label: `${product.name || "Unnamed item"} - ${variant.name}${Number(variant.price || 0) > 0 ? ` - R${Number(variant.price || 0).toLocaleString()}` : ""}`, amount: Number(variant.price || 0), reference: `${product.name || "Unnamed item"} - ${variant.name}` }));
  });
}

function customerDisplayTags(customer, activity) {
  const tags = tagsForCustomer(customer);
  if ((customer.interested_in || []).length > 0 && !tags.includes("Interested")) tags.push("Interested");
  if (activity?.unpaidCount > 0 && !tags.includes("Owes Money")) tags.push("Owes Money");
  if (activity?.pendingBookings > 0 && !tags.includes("Booking Pending")) tags.push("Booking Pending");
  if (customer.last_contacted) {
    const days = (Date.now() - new Date(customer.last_contacted).getTime()) / 86400000;
    if (days > 30 && !tags.includes("Needs Follow-up")) tags.push("Needs Follow-up");
  }
  return tags.length ? tags : [journeyConfig(journeyForCustomer(customer)).label];
}

function WhatsAppModal({ customer, onClose }) {
  const templates = [
    { label: "Check in", text: `Hi ${customer.name}! Just checking in - is there anything I can help you with?` },
    { label: "Follow up", text: `Hi ${customer.name}! Just wanted to follow up. Are you still interested?` },
    { label: "Special offer", text: `Hi ${customer.name}! I have a special offer this week. Reply if you would like the details.` },
    { label: "Reminder", text: `Hi ${customer.name}! Just a reminder about your upcoming appointment or order.` },
  ];
  const [message, setMessage] = useState(templates[0].text);
  return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div style={{ background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: DARK, marginBottom: 4 }}>Message {customer.name}</h3>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>{customer.whatsapp}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>{templates.map((template) => <button key={template.label} onClick={() => setMessage(template.text)} style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid", background: message === template.text ? DARK : "#fff", color: message === template.text ? "#fff" : "#555", borderColor: message === template.text ? DARK : "#e0e0e0" }}>{template.label}</button>)}</div>
      <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical", marginBottom: 16 }} value={message} onChange={(event) => setMessage(event.target.value)} />
      <div style={{ display: "flex", gap: 8 }}><a href={waLink(customer.whatsapp, message)} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "block", backgroundColor: "#25d366", color: "#fff", textAlign: "center", padding: 13, fontSize: 14, fontWeight: 800, borderRadius: 12, textDecoration: "none" }}>Open WhatsApp</a><button onClick={onClose} style={{ padding: "13px 18px", borderRadius: 12, border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: 14, cursor: "pointer" }}>Cancel</button></div>
    </div>
  </div>;
}

function LogSaleModal({ business, customer, products = [], onClose, onLogged }) {
  const options = useMemo(() => saleOptions(products), [products]);
  const [saleOption, setSaleOption] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Paid");
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  function chooseOption(optionKey) { const option = options.find((item) => item.key === optionKey); setSaleOption(optionKey); if (option?.amount > 0) setAmount(String(option.amount)); if (option?.reference) setReference(option.reference); }
  async function handleLog() {
    const val = parseFloat(amount);
    if (!business?.id || !customer?.id || !val) return;
    setSaving(true);
    const selectedOption = options.find((item) => item.key === saleOption);
    const finalReference = reference.trim() || selectedOption?.reference || null;
    const { data: payment, error: paymentError } = await supabase.from("payments").insert([{ business_id: business.id, customer_id: customer.id, amount: val, status, method, reference: finalReference }]).select().single();
    if (paymentError) { console.error("Payment insert error:", paymentError); alert("Payment could not be saved. Please try again."); setSaving(false); return; }
    const paidAmount = status === "Unpaid" ? 0 : val;
    const newStage = status === "Unpaid" ? "payment_pending" : "paid";
    const { data: updatedCustomer } = await supabase.from("customers").update({ total_spent: Number(customer.total_spent || 0) + paidAmount, visit_count: Number(customer.visit_count || 0) + (status === "Unpaid" ? 0 : 1), last_contacted: new Date().toISOString(), stage: newStage, status: newStage, tags: tagsForCustomer(customer) }).eq("id", customer.id).select().single();
    if (updatedCustomer) onLogged(updatedCustomer, payment);
    setSaving(false); onClose();
  }
  return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div style={{ background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 430, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: DARK, marginBottom: 4 }}>Log a sale</h3><p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>Payment from <strong>{customer.name}</strong></p>
      <label style={labelStyle}>Product / service</label><select style={{ ...inputStyle, cursor: "pointer", marginBottom: 14 }} value={saleOption} onChange={(event) => chooseOption(event.target.value)}><option value="">Custom sale</option>{options.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select>
      <label style={labelStyle}>Amount (R)</label><input style={{ ...inputStyle, fontSize: 28, fontWeight: 800, marginBottom: 20, textAlign: "center" }} type="number" placeholder="0" value={amount} onChange={(event) => setAmount(event.target.value)} autoFocus />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}><div><label style={labelStyle}>Status</label><select style={{ ...inputStyle, cursor: "pointer" }} value={status} onChange={(event) => setStatus(event.target.value)}>{PAYMENT_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div><label style={labelStyle}>Method</label><select style={{ ...inputStyle, cursor: "pointer" }} value={method} onChange={(event) => setMethod(event.target.value)}>{PAYMENT_METHODS.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div>
      <label style={labelStyle}>Reference / note</label><input style={{ ...inputStyle, marginBottom: 20 }} placeholder="Optional" value={reference} onChange={(event) => setReference(event.target.value)} />
      <div style={{ display: "flex", gap: 8 }}><button onClick={handleLog} disabled={!amount || saving} style={{ flex: 1, backgroundColor: amount ? BRAND : "#e0e0e0", color: amount ? "#fff" : "#aaa", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 800, cursor: amount ? "pointer" : "not-allowed" }}>{saving ? "Saving..." : "Log sale"}</button><button onClick={onClose} style={{ padding: "13px 18px", borderRadius: 12, border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: 14, cursor: "pointer" }}>Cancel</button></div>
    </div>
  </div>;
}

function CustomerForm({ initial = {}, onSave, onCancel, saving, businessProducts }) {
  const [form, setForm] = useState({ name: initial.name || "", whatsapp: initial.whatsapp || "", area: initial.area || "", notes: initial.notes || "", journey: journeyForCustomer(initial), tags: tagsForCustomer(initial), interested_in: initial.interested_in || [] });
  function upd(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }
  function toggleTag(tag) { setForm((prev) => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag] })); }
  function toggleProduct(productName) { setForm((prev) => ({ ...prev, interested_in: prev.interested_in.includes(productName) ? prev.interested_in.filter((item) => item !== productName) : [...prev.interested_in, productName] })); }
  const valid = form.name.trim().length > 0;
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div><label style={labelStyle}>Customer journey</label><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{CUSTOMER_JOURNEY.map((item) => <button key={item.value} onClick={() => upd("journey", item.value)} title={item.desc} style={{ padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${form.journey === item.value ? item.border : "#e0e0e0"}`, background: form.journey === item.value ? item.bg : "#fff", color: form.journey === item.value ? item.color : "#888" }}>{item.label}</button>)}</div><div style={{ fontSize: 11, color: "#bbb", marginTop: 5 }}>{journeyConfig(form.journey).desc}</div></div>
    <div><label style={labelStyle}>Smart tags</label><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{DEFAULT_CUSTOMER_TAGS.map((tag) => <button key={tag} onClick={() => toggleTag(tag)} style={{ padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${form.tags.includes(tag) ? "#ea4c89" : "#e0e0e0"}`, background: form.tags.includes(tag) ? "#fff5f9" : "#fff", color: form.tags.includes(tag) ? "#d93f7b" : "#888" }}>{tag}</button>)}</div></div>
    <div><label style={labelStyle}>Name *</label><input style={inputStyle} placeholder="Customer name" value={form.name} onChange={(event) => upd("name", event.target.value)} autoFocus /></div>
    <div><label style={labelStyle}>WhatsApp number</label><input style={inputStyle} placeholder="+27 82 000 0000" value={form.whatsapp} onChange={(event) => upd("whatsapp", event.target.value)} /></div>
    <div><label style={labelStyle}>Area / Neighbourhood</label><input style={inputStyle} placeholder="e.g. Soweto, Sandton" value={form.area} onChange={(event) => upd("area", event.target.value)} /></div>
    {businessProducts?.length > 0 && <div><label style={labelStyle}>Interested in</label><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{businessProducts.map((product) => { const selected = form.interested_in.includes(product.name); return <button key={product.id} onClick={() => toggleProduct(product.name)} style={{ padding: "8px 14px", borderRadius: 12, border: `1.5px solid ${selected ? BRAND : "#e0e0e0"}`, background: selected ? "#fff5f9" : "#fff", cursor: "pointer", color: selected ? "#d93f7b" : "#555", fontSize: 13, fontWeight: 700 }}>{product.name}{selected ? " ✓" : ""}</button>; })}</div></div>}
    <div><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} placeholder="Preferences, follow-up notes, anything useful" value={form.notes} onChange={(event) => upd("notes", event.target.value)} /></div>
    <div style={{ display: "flex", gap: 8 }}><button onClick={() => onSave(form)} disabled={!valid || saving} style={{ flex: 1, backgroundColor: valid ? BRAND : "#e0e0e0", color: valid ? "#fff" : "#aaa", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 800, cursor: valid ? "pointer" : "not-allowed" }}>{saving ? "Saving..." : "Save customer"}</button><button onClick={onCancel} style={{ padding: "13px 18px", borderRadius: 12, border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: 14, cursor: "pointer" }}>Cancel</button></div>
  </div>;
}

function CustomerCard({ customer, activity, onEdit, onDelete, onLogSale, onMessage, onJourneyChange }) {
  const [expanded, setExpanded] = useState(false);
  const stage = journeyForCustomer(customer);
  const config = journeyConfig(stage);
  const initials = customer.name.split(" ").slice(0, 2).map((word) => word[0]?.toUpperCase() || "").join("");
  const tags = customerDisplayTags(customer, activity);
  return <div style={{ background: "#fff", border: `1.5px solid ${config.border}`, borderRadius: 16, overflow: "hidden" }}>
    <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => setExpanded((value) => !value)}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: config.bg, border: `2px solid ${config.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: config.color, flexShrink: 0 }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontSize: 15, fontWeight: 700, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.name}</span><StatusBadge status={stage} small /></div><div style={{ fontSize: 12, color: "#aaa", display: "flex", gap: 10, flexWrap: "wrap" }}>{customer.whatsapp && <span>{customer.whatsapp}</span>}{customer.area && <span>{customer.area}</span>}{customer.last_contacted && <span>Last contact: {timeAgo(customer.last_contacted)}</span>}</div><div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 7 }}>{tags.slice(0, 4).map((tag) => <span key={tag} style={{ fontSize: 10, fontWeight: 800, color: "#d93f7b", background: "#fff5f9", border: "1px solid #f8b8d2", borderRadius: 999, padding: "3px 8px" }}>{tag}</span>)}</div></div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>{customer.total_spent > 0 && <div style={{ fontSize: 15, fontWeight: 800, color: DARK }}>R{customer.total_spent.toLocaleString()}</div>}<div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{config.label}</div></div><span style={{ fontSize: 12, color: "#ccc", marginLeft: 4 }}>{expanded ? "▲" : "▼"}</span>
    </div>
    {expanded && <div style={{ borderTop: "1px solid #f5f5f5", padding: "14px 18px", background: "#fafafa" }}>
      {customer.notes && <div style={{ fontSize: 13, color: "#666", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, lineHeight: 1.6 }}>{customer.notes}</div>}
      <div style={{ marginBottom: 12 }}><div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Move journey to</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{CUSTOMER_JOURNEY.filter((item) => item.value !== stage).map((item) => <button key={item.value} onClick={() => onJourneyChange(customer, item.value)} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${item.border}`, background: item.bg, color: item.color }}>{item.label}</button>)}</div></div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button onClick={() => onMessage(customer)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10, border: "none", background: BRAND, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}><MessageCircle size={14} /> Message</button><button onClick={() => onLogSale(customer)} style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Log sale</button><button onClick={() => onEdit(customer)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: 12, fontWeight: 700, cursor: "pointer" }}><Pencil size={13} /> Edit</button><button onClick={() => onEdit(customer)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: 12, fontWeight: 700, cursor: "pointer" }}><StickyNote size={13} /> Add note</button><button onClick={() => onDelete(customer)} style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #ffd0d0", background: "#fff5f5", color: "#cc3300", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete</button></div>
    </div>}
  </div>;
}

export function CustomersTab({ business, onMessageCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [businessProducts, setBusinessProducts] = useState([]);
  const [activityByCustomer, setActivityByCustomer] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [mode, setMode] = useState("list");
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logSaleFor, setLogSaleFor] = useState(null);
  const [messageFor, setMessageFor] = useState(null);
  const [toast, setToast] = useState("");
  function showToast(message) { setToast(message); setTimeout(() => setToast(""), 2800); }
  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    Promise.all([
      supabase.from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
      supabase.from("products").select("id,name,image,price,variants").eq("business_id", business.id).eq("is_active", true),
      supabase.from("bookings").select("customer_id,booking_date,status").eq("business_id", business.id),
      supabase.from("payments").select("customer_id,created_at,status,amount").eq("business_id", business.id),
    ]).then(([{ data: custs, error: e1 }, { data: prods }, { data: bookings }, { data: payments }]) => {
      if (e1) console.error("Load customers:", e1);
      if (custs) setCustomers(custs);
      if (prods) setBusinessProducts(prods);
      const activity = {};
      (bookings || []).forEach((booking) => { if (!booking.customer_id) return; const item = activity[booking.customer_id] || { pendingBookings: 0, unpaidCount: 0 }; if (!item.lastBookingDate || booking.booking_date > item.lastBookingDate) item.lastBookingDate = booking.booking_date; if (booking.status === "confirmed") item.pendingBookings = (item.pendingBookings || 0) + 1; activity[booking.customer_id] = item; });
      (payments || []).forEach((payment) => { if (!payment.customer_id) return; const item = activity[payment.customer_id] || { pendingBookings: 0, unpaidCount: 0 }; const d = (payment.created_at || "").slice(0, 10); if (d && (!item.lastSaleDate || d > item.lastSaleDate)) item.lastSaleDate = d; if (payment.status === "Unpaid") item.unpaidCount = (item.unpaidCount || 0) + 1; activity[payment.customer_id] = item; });
      setActivityByCustomer(activity); setLoading(false);
    });
  }, [business?.id]);
  const filtered = customers.filter((customer) => { const q = search.toLowerCase(); const matchSearch = !q || customer.name?.toLowerCase().includes(q) || customer.whatsapp?.includes(q) || customer.area?.toLowerCase().includes(q); const matchStatus = filterStatus === "all" || journeyForCustomer(customer) === filterStatus; return matchSearch && matchStatus; }).sort((a, b) => sortBy === "spent" ? (b.total_spent || 0) - (a.total_spent || 0) : sortBy === "name" ? a.name.localeCompare(b.name) : new Date(b.created_at) - new Date(a.created_at));
  async function handleSave(form) {
    if (!business?.id) return; setSaving(true);
    const payload = { name: form.name.trim(), whatsapp: formatPhone(form.whatsapp), area: form.area.trim(), notes: form.notes.trim(), stage: form.journey, status: form.journey, tags: form.tags, interested_in: form.interested_in };
    if (editTarget) { const { data, error } = await supabase.from("customers").update(payload).eq("id", editTarget.id).select().single(); if (error) console.error("Update error:", error); if (data) setCustomers((prev) => prev.map((customer) => customer.id === data.id ? data : customer)); showToast("Customer updated"); }
    else { const { data, error } = await supabase.from("customers").insert([{ ...payload, business_id: business.id }]).select().single(); if (error) console.error("Insert error:", error); if (data) setCustomers((prev) => [data, ...prev]); showToast("Customer added"); }
    setSaving(false); setMode("list"); setEditTarget(null);
  }
  async function handleDelete(customer) { if (!window.confirm(`Delete ${customer.name}?`)) return; await supabase.from("customers").delete().eq("id", customer.id); setCustomers((prev) => prev.filter((item) => item.id !== customer.id)); showToast("Customer deleted"); }
  async function handleJourneyChange(customer, newStage) { const patch = statusPatchForJourney(newStage, customer); const { data } = await supabase.from("customers").update({ ...patch, status: patch.stage }).eq("id", customer.id).select().single(); if (data) setCustomers((prev) => prev.map((item) => item.id === data.id ? data : item)); showToast(`${customer.name} moved to ${journeyConfig(newStage).label}`); }
  function handleSaleLogged(updatedCustomer, payment) { setCustomers((prev) => prev.map((item) => item.id === updatedCustomer.id ? updatedCustomer : item)); if (payment?.customer_id) setActivityByCustomer((prev) => ({ ...prev, [payment.customer_id]: { ...(prev[payment.customer_id] || {}), lastSaleDate: (payment.created_at || new Date().toISOString()).slice(0, 10), unpaidCount: payment.status === "Unpaid" ? ((prev[payment.customer_id]?.unpaidCount || 0) + 1) : (prev[payment.customer_id]?.unpaidCount || 0) } })); showToast(`Payment ${payment?.status || "saved"} for ${updatedCustomer.name}`); }
  function handleMessageCustomer(customer) { if (onMessageCustomer) { onMessageCustomer(customer); return; } setMessageFor(customer); }
  const totalSpent = customers.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
  const countByStatus = (status) => customers.filter((customer) => journeyForCustomer(customer) === status).length;
  if (!business?.id) return <div style={{ textAlign: "center", padding: "80px 24px" }}>Set up your business first.</div>;
  if (mode === "add" || mode === "edit") return <div style={{ maxWidth: 540 }}><button onClick={() => { setMode("list"); setEditTarget(null); }} style={{ background: "transparent", border: "none", fontSize: 13, color: "#aaa", cursor: "pointer", padding: "0 0 16px" }}>Back</button><h2 style={{ fontSize: 22, fontWeight: 800, color: DARK, marginBottom: 24 }}>{mode === "edit" ? `Edit ${editTarget?.name}` : "Add customer"}</h2><CustomerForm initial={editTarget || {}} onSave={handleSave} onCancel={() => { setMode("list"); setEditTarget(null); }} saving={saving} businessProducts={businessProducts} /></div>;
  return <div>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}><div><h2 style={{ fontSize: 22, fontWeight: 800, color: DARK, marginBottom: 2 }}>Customers</h2><p style={{ fontSize: 13, color: "#888" }}>Keep customer details, notes, tags and follow-ups in one place.</p></div><button onClick={() => setMode("add")} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: BRAND, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add Customer</button></div>
    {customers.length > 0 && <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}><button onClick={() => setFilterStatus("all")} style={{ padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1.5px solid", background: filterStatus === "all" ? DARK : "#fff", color: filterStatus === "all" ? "#fff" : "#555", borderColor: filterStatus === "all" ? DARK : "#e0e0e0" }}>All ({customers.length})</button>{CUSTOMER_JOURNEY.map((item) => { const count = countByStatus(item.value); if (count === 0) return null; return <button key={item.value} onClick={() => setFilterStatus(filterStatus === item.value ? "all" : item.value)} style={{ padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${filterStatus === item.value ? item.border : "#e0e0e0"}`, background: filterStatus === item.value ? item.bg : "#fff", color: filterStatus === item.value ? item.color : "#888" }}>{item.label} ({count})</button>; })}</div>}
    {customers.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>{[{ label: "Total", value: customers.length }, { label: "New enquiries", value: countByStatus("new_enquiry") }, { label: "Payment pending", value: countByStatus("payment_pending") }, { label: "Revenue", value: `R${totalSpent.toLocaleString()}` }].map((item) => <div key={item.label} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16 }}><div style={{ fontSize: 10, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{item.label}</div><div style={{ fontSize: 22, fontWeight: 900, color: DARK }}>{item.value}</div></div>)}</div>}
    {customers.length > 0 && <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}><input style={{ ...inputStyle, flex: 1, minWidth: 180, padding: "10px 14px" }} placeholder="Search by name, number, area" value={search} onChange={(event) => setSearch(event.target.value)} /><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer", outline: "none" }}><option value="recent">Most recent</option><option value="spent">Top spenders</option><option value="name">A to Z</option></select></div>}
    {loading && <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>Loading...</div>}
    {!loading && customers.length === 0 && <div style={{ textAlign: "center", padding: "64px 24px" }}><Users size={24} color={BRAND} /><h3 style={{ fontSize: 20, fontWeight: 800, color: DARK, marginBottom: 8 }}>No customers yet</h3><p style={{ fontSize: 14, color: "#767b81", marginBottom: 32 }}>Add your first customer to start building your customer list.</p><button onClick={() => setMode("add")} style={{ backgroundColor: BRAND, color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Add Customer</button></div>}
    {!loading && customers.length > 0 && filtered.length === 0 && <div style={{ textAlign: "center", padding: 48, color: "#aaa" }}>No customers match your search.</div>}
    {!loading && filtered.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{filtered.map((customer) => <CustomerCard key={customer.id} customer={customer} activity={activityByCustomer[customer.id]} onEdit={(item) => { setEditTarget(item); setMode("edit"); }} onDelete={handleDelete} onLogSale={setLogSaleFor} onMessage={handleMessageCustomer} onJourneyChange={handleJourneyChange} />)}</div>}
    {logSaleFor && <LogSaleModal business={business} customer={logSaleFor} products={businessProducts} onClose={() => setLogSaleFor(null)} onLogged={handleSaleLogged} />}
    {messageFor && <WhatsAppModal customer={messageFor} onClose={() => setMessageFor(null)} />}
    {toast && <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: DARK, color: "#fff", padding: "12px 24px", borderRadius: 999, fontSize: 13, fontWeight: 700, zIndex: 2000, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>{toast}</div>}
  </div>;
}

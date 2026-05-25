import React, { useEffect, useMemo, useState } from "react";
import { LIME, DARK, CUSTOMER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, inputStyle, labelStyle, statusConfig } from "../../constants";
import { waLink, timeAgo, formatPhone } from "../../utils";
import { supabase } from "../../lib/supabase";
import { StatusBadge } from "../ui";
import { FileCheck, MessageCircle, Pencil, StickyNote, Users } from "lucide-react";

function normaliseVariants(variants = []) {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((variant) => ({
      id: variant.id || `${variant.name || "variant"}-${variant.price || ""}`,
      name: variant.name || "",
      price: variant.price ?? "",
      description: variant.description || "",
    }))
    .filter((variant) => variant.name || variant.price || variant.description);
}

function productLabel(product) {
  const price = Number(product?.price || 0);
  return `${product?.name || "Unnamed item"}${price > 0 ? ` - R${price.toLocaleString()}` : ""}`;
}

function saleOptions(products = []) {
  return products.flatMap((product) => {
    const variants = normaliseVariants(product.variants || []);
    if (variants.length === 0) {
      return [{
        key: `product:${product.id}`,
        label: productLabel(product),
        amount: Number(product.price || 0),
        reference: product.name || "",
      }];
    }
    return variants.map((variant) => ({
      key: `variant:${product.id}:${variant.id}`,
      label: `${product.name || "Unnamed item"} - ${variant.name}${Number(variant.price || 0) > 0 ? ` - R${Number(variant.price || 0).toLocaleString()}` : ""}`,
      amount: Number(variant.price || 0),
      reference: `${product.name || "Unnamed item"} - ${variant.name}`,
    }));
  });
}

function customerTags(customer, activity) {
  const status = customer.status || "new";
  const tags = [];
  if (status === "vip") tags.push("VIP");
  if (status === "regular") tags.push("Regular");
  if (status === "new") tags.push("New Customer");
  if (status === "lead" || (customer.interested_in || []).length > 0) tags.push("Interested");
  if (activity?.unpaidCount > 0) tags.push("Owes Money");
  if (activity?.pendingBookings > 0) tags.push("Booking Pending");
  if (customer.last_contacted) {
    const days = (Date.now() - new Date(customer.last_contacted).getTime()) / 86400000;
    if (days > 30) tags.push("Needs Follow-up");
  }
  return tags.length ? tags : ["New Customer"];
}

function formatActivityDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function WhatsAppModal({ customer, onClose }) {
  const templates = [
    { label: "Check in", text: `Hi ${customer.name}! Just checking in - is there anything I can help you with?` },
    { label: "Follow up", text: `Hi ${customer.name}! Just wanted to follow up. Would love to have you back.` },
    { label: "Special offer", text: `Hi ${customer.name}! I have a special offer this week. Reply to find out more.` },
    { label: "Reminder", text: `Hi ${customer.name}! Just a reminder about your upcoming appointment.` },
  ];
  const [message, setMessage] = useState(templates[0].text);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: DARK, marginBottom: "4px" }}>Message {customer.name}</h3>
        <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "20px" }}>{customer.whatsapp}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
          {templates.map((template) => (
            <button key={template.label} onClick={() => setMessage(template.text)} style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "1.5px solid", background: message === template.text ? DARK : "#fff", color: message === template.text ? LIME : "#555", borderColor: message === template.text ? DARK : "#e0e0e0" }}>
              {template.label}
            </button>
          ))}
        </div>
        <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical", marginBottom: "16px" }} value={message} onChange={(event) => setMessage(event.target.value)} />
        <div style={{ display: "flex", gap: "8px" }}>
          <a href={waLink(customer.whatsapp, message)} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "block", backgroundColor: "#25d366", color: "#fff", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 800, borderRadius: "12px", textDecoration: "none" }}>Open WhatsApp</a>
          <button onClick={onClose} style={{ padding: "13px 18px", borderRadius: "12px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function LogSaleModal({ business, customer, products = [], onClose, onLogged }) {
  const options = useMemo(() => saleOptions(products), [products]);
  const [saleOption, setSaleOption] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Paid");
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  function chooseOption(optionKey) {
    const option = options.find((item) => item.key === optionKey);
    setSaleOption(optionKey);
    if (!option) return;
    if (option.amount > 0) setAmount(String(option.amount));
    setReference(option.reference || "");
  }

  async function handleLog() {
    const val = parseFloat(amount);
    if (!business?.id || !customer?.id || !val) return;
    setSaving(true);
    const selectedOption = options.find((item) => item.key === saleOption);
    const finalReference = reference.trim() || selectedOption?.reference || null;
    const { data: payment, error: paymentError } = await supabase.from("payments").insert([{
      business_id: business.id,
      customer_id: customer.id,
      amount: val,
      status,
      method,
      reference: finalReference,
    }]).select().single();

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      alert("Payment could not be saved. Please try again.");
      setSaving(false);
      return;
    }

    const paidAmount = status === "Unpaid" ? 0 : val;
    const { data: updatedCustomer } = await supabase.from("customers").update({
      total_spent: (customer.total_spent || 0) + paidAmount,
      visit_count: (customer.visit_count || 0) + (status === "Unpaid" ? 0 : 1),
      last_contacted: new Date().toISOString(),
      status: customer.status === "lead" ? "new" : customer.status,
    }).eq("id", customer.id).select().single();

    if (updatedCustomer) onLogged(updatedCustomer, payment);
    setSaving(false);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "430px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: DARK, marginBottom: "4px" }}>Log a sale</h3>
        <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "20px" }}>Payment from <strong>{customer.name}</strong></p>
        {customer.status === "lead" && <div style={{ fontSize: "12px", color: "#555", background: "#fbfbfb", border: "1px solid #d8d8d4", borderRadius: "8px", padding: "8px 12px", marginBottom: "16px" }}>Logging a sale will automatically move them from Lead to New</div>}

        <label style={labelStyle}>Product / service</label>
        <select style={{ ...inputStyle, cursor: "pointer", marginBottom: "14px" }} value={saleOption} onChange={(event) => chooseOption(event.target.value)}>
          <option value="">Custom sale</option>
          {options.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
        </select>

        <label style={labelStyle}>Amount (R)</label>
        <input style={{ ...inputStyle, fontSize: "28px", fontWeight: 800, marginBottom: "20px", textAlign: "center" }} type="number" placeholder="0" value={amount} onChange={(event) => setAmount(event.target.value)} autoFocus />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div><label style={labelStyle}>Status</label><select style={{ ...inputStyle, cursor: "pointer" }} value={status} onChange={(event) => setStatus(event.target.value)}>{PAYMENT_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          <div><label style={labelStyle}>Method</label><select style={{ ...inputStyle, cursor: "pointer" }} value={method} onChange={(event) => setMethod(event.target.value)}>{PAYMENT_METHODS.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
        </div>
        <label style={labelStyle}>Reference / note</label>
        <input style={{ ...inputStyle, marginBottom: "20px" }} placeholder="Optional" value={reference} onChange={(event) => setReference(event.target.value)} />
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleLog} disabled={!amount || saving} style={{ flex: 1, backgroundColor: amount ? LIME : "#e0e0e0", color: amount ? "#fff" : "#aaa", border: "none", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: 800, cursor: amount ? "pointer" : "not-allowed" }}>{saving ? "Saving..." : "Log sale"}</button>
          <button onClick={onClose} style={{ padding: "13px 18px", borderRadius: "12px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function CustomerForm({ initial = {}, onSave, onCancel, saving, businessProducts }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    whatsapp: initial.whatsapp || "",
    area: initial.area || "",
    notes: initial.notes || "",
    status: initial.status || "new",
    interested_in: initial.interested_in || [],
  });
  function upd(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }
  function toggleProduct(productName) {
    setForm((prev) => ({ ...prev, interested_in: prev.interested_in.includes(productName) ? prev.interested_in.filter((item) => item !== productName) : [...prev.interested_in, productName] }));
  }
  const valid = form.name.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div><label style={labelStyle}>Status</label><div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{CUSTOMER_STATUSES.map((item) => <button key={item.value} onClick={() => upd("status", item.value)} title={item.desc} style={{ padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: `1.5px solid ${form.status === item.value ? item.border : "#e0e0e0"}`, background: form.status === item.value ? item.bg : "#fff", color: form.status === item.value ? item.color : "#888" }}>{item.label}</button>)}</div><div style={{ fontSize: "11px", color: "#bbb", marginTop: "5px" }}>{statusConfig(form.status).desc}</div></div>
      <div><label style={labelStyle}>Name *</label><input style={inputStyle} placeholder="Customer name" value={form.name} onChange={(event) => upd("name", event.target.value)} autoFocus /></div>
      <div><label style={labelStyle}>WhatsApp number</label><input style={inputStyle} placeholder="+27 82 000 0000" value={form.whatsapp} onChange={(event) => upd("whatsapp", event.target.value)} /></div>
      <div><label style={labelStyle}>Area / Neighbourhood</label><input style={inputStyle} placeholder="e.g. Soweto, Sandton" value={form.area} onChange={(event) => upd("area", event.target.value)} /></div>
      {businessProducts?.length > 0 && <div><label style={labelStyle}>Interested in</label><div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{businessProducts.map((product) => { const selected = form.interested_in.includes(product.name); const image = product.image || product.icon || ""; const isUrl = typeof image === "string" && image.startsWith("http"); return <button key={product.id} onClick={() => toggleProduct(product.name)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "12px", border: `1.5px solid ${selected ? LIME : "#e0e0e0"}`, background: selected ? "#fff5f9" : "#fff", cursor: "pointer" }}>{isUrl ? <img src={image} alt="" style={{ width: "20px", height: "20px", borderRadius: "5px", objectFit: "cover" }} /> : <span style={{ fontSize: "16px" }}>{image || "Item"}</span>}<span style={{ fontSize: "13px", fontWeight: 700, color: selected ? "#d93f7b" : "#555" }}>{product.name}</span>{selected && <span style={{ fontSize: "11px", color: LIME }}>✓</span>}</button>; })}</div></div>}
      <div><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }} placeholder="Preferences, follow-up notes, anything useful" value={form.notes} onChange={(event) => upd("notes", event.target.value)} /></div>
      <div style={{ display: "flex", gap: "8px" }}><button onClick={() => onSave(form)} disabled={!valid || saving} style={{ flex: 1, backgroundColor: valid ? LIME : "#e0e0e0", color: valid ? "#fff" : "#aaa", border: "none", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: 800, cursor: valid ? "pointer" : "not-allowed" }}>{saving ? "Saving..." : "Save customer"}</button><button onClick={onCancel} style={{ padding: "13px 18px", borderRadius: "12px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: "14px", cursor: "pointer" }}>Cancel</button></div>
    </div>
  );
}

function CustomerCard({ customer, activity, onEdit, onDelete, onLogSale, onMessage, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const initials = customer.name.split(" ").slice(0, 2).map((word) => word[0]?.toUpperCase() || "").join("");
  const config = statusConfig(customer.status || "new");
  const tags = customerTags(customer, activity);

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${config.border}`, borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }} onClick={() => setExpanded((value) => !value)}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: config.bg, border: `2px solid ${config.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800, color: config.color, flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}><span style={{ fontSize: "15px", fontWeight: 700, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.name}</span><StatusBadge status={customer.status || "new"} small /></div><div style={{ fontSize: "12px", color: "#aaa", display: "flex", gap: "10px", flexWrap: "wrap" }}>{customer.whatsapp && <span>{customer.whatsapp}</span>}{customer.area && <span>{customer.area}</span>}{customer.last_contacted && <span>Last contact: {timeAgo(customer.last_contacted)}</span>}</div><div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "7px" }}>{tags.slice(0, 4).map((tag) => <span key={tag} style={{ fontSize: "10px", fontWeight: 800, color: "#d93f7b", background: "#fff5f9", border: "1px solid #f8b8d2", borderRadius: "999px", padding: "3px 8px" }}>{tag}</span>)}</div></div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>{customer.total_spent > 0 && <div style={{ fontSize: "15px", fontWeight: 800, color: DARK }}>R{customer.total_spent.toLocaleString()}</div>}{customer.last_contacted && <div style={{ fontSize: "11px", color: "#bbb", marginTop: "2px" }}>{timeAgo(customer.last_contacted)}</div>}</div>
        <span style={{ fontSize: "12px", color: "#ccc", marginLeft: "4px" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && <div style={{ borderTop: "1px solid #f5f5f5", padding: "14px 18px", background: "#fafafa" }}>
        {customer.interested_in?.length > 0 && <div style={{ marginBottom: "12px" }}><div style={{ fontSize: "11px", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Interested in</div><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{customer.interested_in.map((item) => <span key={item} style={{ fontSize: "12px", fontWeight: 600, color: "#d93f7b", background: "#fff5f9", border: "1px solid #f8b8d2", borderRadius: "8px", padding: "3px 10px" }}>{item}</span>)}</div></div>}
        {customer.notes && <div style={{ fontSize: "13px", color: "#666", background: "#fff", border: "1px solid #eeeeea", borderRadius: "10px", padding: "10px 14px", marginBottom: "12px", lineHeight: 1.6 }}>{customer.notes}</div>}
        {(customer.last_contacted || activity?.lastBookingDate || activity?.lastSaleDate) && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px", marginBottom: "12px" }}>{customer.last_contacted && <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "10px", padding: "10px" }}><div style={{ fontSize: "10px", color: "#aaa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Last contact</div><div style={{ fontSize: "13px", color: DARK, fontWeight: 800, marginTop: "4px" }}>{timeAgo(customer.last_contacted)}</div></div>}{activity?.lastBookingDate && <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "10px", padding: "10px" }}><div style={{ fontSize: "10px", color: "#aaa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Last booking</div><div style={{ fontSize: "13px", color: DARK, fontWeight: 800, marginTop: "4px" }}>{formatActivityDate(activity.lastBookingDate)}</div></div>}{activity?.lastSaleDate && <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "10px", padding: "10px" }}><div style={{ fontSize: "10px", color: "#aaa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Last sale</div><div style={{ fontSize: "13px", color: DARK, fontWeight: 800, marginTop: "4px" }}>{formatActivityDate(activity.lastSaleDate)}</div></div>}</div>}
        <div style={{ marginBottom: "12px" }}><div style={{ fontSize: "11px", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Move to</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{CUSTOMER_STATUSES.filter((item) => item.value !== (customer.status || "new")).map((item) => <button key={item.value} onClick={() => onStatusChange(customer, item.value)} style={{ padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: `1.5px solid ${item.border}`, background: item.bg, color: item.color }}>Move to {item.label}</button>)}</div></div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}><button onClick={() => onMessage(customer)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "10px", border: "none", background: "#ea4c89", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}><MessageCircle size={14} strokeWidth={2.2} /> Message</button><button onClick={() => onLogSale(customer)} style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Log sale</button><button onClick={() => onEdit(customer)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}><Pencil size={13} strokeWidth={2.2} /> Edit</button><button onClick={() => onEdit(customer)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}><StickyNote size={13} strokeWidth={2.2} /> Add note</button>{customer.status !== "vip" && <button onClick={() => onStatusChange(customer, "vip")} style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #f8b8d2", background: "#fff5f9", color: "#d93f7b", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Mark VIP</button>}{customer.status !== "regular" && <button onClick={() => onStatusChange(customer, "regular")} style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #f8b8d2", background: "#fff5f9", color: "#d93f7b", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Mark Regular</button>}<button onClick={() => onDelete(customer)} style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #ffd0d0", background: "#fff5f5", color: "#cc3300", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Delete</button></div>
      </div>}
    </div>
  );
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
    ]).then(([{ data: custs, error: e1 }, { data: prods, error: e2 }, { data: bookings, error: e3 }, { data: payments, error: e4 }]) => {
      if (e1) console.error("Load customers:", e1);
      if (e2) console.error("Load products:", e2);
      if (e3) console.error("Load customer bookings:", e3);
      if (e4) console.error("Load customer payments:", e4);
      if (custs) setCustomers(custs);
      if (prods) setBusinessProducts(prods);
      const activity = {};
      (bookings || []).forEach((booking) => { if (!booking.customer_id) return; const item = activity[booking.customer_id] || { pendingBookings: 0, unpaidCount: 0 }; if (!item.lastBookingDate || booking.booking_date > item.lastBookingDate) item.lastBookingDate = booking.booking_date; if (booking.status === "confirmed") item.pendingBookings = (item.pendingBookings || 0) + 1; activity[booking.customer_id] = item; });
      (payments || []).forEach((payment) => { if (!payment.customer_id) return; const item = activity[payment.customer_id] || { pendingBookings: 0, unpaidCount: 0 }; const date = (payment.created_at || "").slice(0, 10); if (date && (!item.lastSaleDate || date > item.lastSaleDate)) item.lastSaleDate = date; if (payment.status === "Unpaid") item.unpaidCount = (item.unpaidCount || 0) + 1; activity[payment.customer_id] = item; });
      setActivityByCustomer(activity);
      setLoading(false);
    });
  }, [business?.id]);

  const filtered = customers.filter((customer) => {
    const q = search.toLowerCase();
    const matchSearch = !q || customer.name?.toLowerCase().includes(q) || customer.whatsapp?.includes(q) || customer.area?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || (customer.status || "new") === filterStatus;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    if (sortBy === "spent") return (b.total_spent || 0) - (a.total_spent || 0);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  async function handleSave(form) {
    if (!business?.id) return;
    setSaving(true);
    const payload = { name: form.name.trim(), whatsapp: formatPhone(form.whatsapp), area: form.area.trim(), notes: form.notes.trim(), status: form.status, interested_in: form.interested_in };
    if (editTarget) {
      const { data, error } = await supabase.from("customers").update(payload).eq("id", editTarget.id).select().single();
      if (error) console.error("Update error:", error);
      if (data) setCustomers((prev) => prev.map((customer) => customer.id === data.id ? data : customer));
      showToast("Customer updated");
    } else {
      const { data, error } = await supabase.from("customers").insert([{ ...payload, business_id: business.id }]).select().single();
      if (error) console.error("Insert error:", error);
      if (data) setCustomers((prev) => [data, ...prev]);
      showToast("Customer added");
    }
    setSaving(false); setMode("list"); setEditTarget(null);
  }

  async function handleDelete(customer) { if (!window.confirm(`Delete ${customer.name}?`)) return; await supabase.from("customers").delete().eq("id", customer.id); setCustomers((prev) => prev.filter((item) => item.id !== customer.id)); showToast("Customer deleted"); }
  async function handleStatusChange(customer, newStatus) { const { data } = await supabase.from("customers").update({ status: newStatus }).eq("id", customer.id).select().single(); if (data) setCustomers((prev) => prev.map((item) => item.id === data.id ? data : item)); showToast(`${customer.name} updated`); }
  function handleSaleLogged(updatedCustomer, payment) { setCustomers((prev) => prev.map((item) => item.id === updatedCustomer.id ? updatedCustomer : item)); if (payment?.customer_id) { const date = (payment.created_at || new Date().toISOString()).slice(0, 10); setActivityByCustomer((prev) => ({ ...prev, [payment.customer_id]: { ...(prev[payment.customer_id] || {}), lastSaleDate: date, unpaidCount: payment.status === "Unpaid" ? ((prev[payment.customer_id]?.unpaidCount || 0) + 1) : (prev[payment.customer_id]?.unpaidCount || 0) } })); } showToast(`Payment ${payment?.status || "saved"} for ${updatedCustomer.name}`); }
  function handleMessageCustomer(customer) { if (onMessageCustomer) { onMessageCustomer(customer); return; } setMessageFor(customer); }

  const totalSpent = customers.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
  const countByStatus = (status) => customers.filter((customer) => (customer.status || "new") === status).length;

  if (!business?.id) return <div style={{ textAlign: "center", padding: "80px 24px" }}><div style={{ fontSize: "40px", marginBottom: "16px" }}>Business</div><h3 style={{ fontSize: "20px", fontWeight: 800, color: DARK, marginBottom: "8px" }}>Set up your business first</h3><p style={{ fontSize: "14px", color: "#aaa" }}>Complete your business setup before adding customers.</p></div>;

  if (mode === "add" || mode === "edit") return <div style={{ maxWidth: "540px" }}><button onClick={() => { setMode("list"); setEditTarget(null); }} style={{ background: "transparent", border: "none", fontSize: "13px", color: "#aaa", cursor: "pointer", padding: "0 0 16px" }}>Back</button><h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "24px" }}>{mode === "edit" ? `Edit ${editTarget?.name}` : "Add customer"}</h2><CustomerForm initial={editTarget || {}} onSave={handleSave} onCancel={() => { setMode("list"); setEditTarget(null); }} saving={saving} businessProducts={businessProducts} /></div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}><div><h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "2px" }}>Customers</h2><p style={{ fontSize: "13px", color: "#888" }}>Keep customer details, notes, tags and follow-ups in one place.</p></div><button onClick={() => setMode("add")} style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "#ea4c89", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Add Customer</button></div>
      <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "18px", padding: "18px", marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "14px" }}><span style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#fde8f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileCheck size={19} strokeWidth={2.2} color="#ea4c89" /></span><div><div style={{ fontSize: "15px", fontWeight: 900, color: DARK, marginBottom: "4px" }}>Customer history helps build your Business File.</div><div style={{ fontSize: "13px", color: "#777", lineHeight: 1.55 }}>Repeat customers, notes and follow-ups help show that your business has real demand.</div></div></div>
      {customers.length > 0 && <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}><button onClick={() => setFilterStatus("all")} style={{ padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: "1.5px solid", background: filterStatus === "all" ? DARK : "#fff", color: filterStatus === "all" ? "#fff" : "#555", borderColor: filterStatus === "all" ? DARK : "#e0e0e0" }}>All ({customers.length})</button>{CUSTOMER_STATUSES.map((item) => { const count = countByStatus(item.value); if (count === 0) return null; return <button key={item.value} onClick={() => setFilterStatus(filterStatus === item.value ? "all" : item.value)} style={{ padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: `1.5px solid ${filterStatus === item.value ? item.border : "#e0e0e0"}`, background: filterStatus === item.value ? item.bg : "#fff", color: filterStatus === item.value ? item.color : "#888" }}>{item.label} ({count})</button>; })}</div>}
      {customers.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "20px" }}>{[{ label: "Total", value: customers.length }, { label: "Interested", value: countByStatus("lead") }, { label: "VIP", value: countByStatus("vip") }, { label: "Revenue", value: `R${totalSpent.toLocaleString()}` }].map((item) => <div key={item.label} style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "14px", padding: "16px" }}><div style={{ fontSize: "10px", color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{item.label}</div><div style={{ fontSize: "22px", fontWeight: 900, color: DARK }}>{item.value}</div></div>)}</div>}
      {customers.length > 0 && <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}><input style={{ ...inputStyle, flex: 1, minWidth: "180px", padding: "10px 14px" }} placeholder="Search by name, number, area" value={search} onChange={(event) => setSearch(event.target.value)} /><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e0e0e0", background: "#fff", fontSize: "13px", fontWeight: 600, color: "#555", cursor: "pointer", outline: "none" }}><option value="recent">Most recent</option><option value="spent">Top spenders</option><option value="name">A to Z</option></select></div>}
      {loading && <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>Loading...</div>}
      {!loading && customers.length === 0 && <div style={{ textAlign: "center", padding: "64px 24px" }}><span style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fde8f1", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}><Users size={24} strokeWidth={2.2} color="#ea4c89" /></span><h3 style={{ fontSize: "20px", fontWeight: 800, color: DARK, marginBottom: "8px" }}>No customers yet</h3><p style={{ fontSize: "14px", color: "#767b81", marginBottom: "32px" }}>Add your first customer to start building your customer list.</p><button onClick={() => setMode("add")} style={{ backgroundColor: "#ea4c89", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Add Customer</button></div>}
      {!loading && customers.length > 0 && filtered.length === 0 && <div style={{ textAlign: "center", padding: "48px", color: "#aaa" }}>No customers match your search.</div>}
      {!loading && filtered.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{filtered.map((customer) => <CustomerCard key={customer.id} customer={customer} activity={activityByCustomer[customer.id]} onEdit={(item) => { setEditTarget(item); setMode("edit"); }} onDelete={handleDelete} onLogSale={setLogSaleFor} onMessage={handleMessageCustomer} onStatusChange={handleStatusChange} />)}</div>}
      {logSaleFor && <LogSaleModal business={business} customer={logSaleFor} products={businessProducts} onClose={() => setLogSaleFor(null)} onLogged={handleSaleLogged} />}
      {messageFor && <WhatsAppModal customer={messageFor} onClose={() => setMessageFor(null)} />}
      {toast && <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)", background: DARK, color: LIME, padding: "12px 24px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, zIndex: 2000, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>{toast}</div>}
    </div>
  );
}

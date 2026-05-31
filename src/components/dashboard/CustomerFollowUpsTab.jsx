import React, { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { DARK, inputStyle, labelStyle } from "../../constants";
import { CUSTOMER_JOURNEY, journeyConfig, journeyForCustomer, statusPatchForJourney } from "../../customerJourney";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";
const BORDER = "#eeeeea";
const SOFT = "#fde8f1";
const FOLLOW_UP_DELAY_HOURS = 6;
const NEEDS_FOLLOW_UP = ["new_enquiry", "followed_up", "price_sent", "booking_requested"];

function lastContacted(customer) { return customer.last_contacted_at || customer.last_contacted || null; }
function anchorDate(customer) { return lastContacted(customer) || customer.created_at || customer.updated_at || null; }
function olderThanHours(value, hours) { const time = value ? new Date(value).getTime() : NaN; return Number.isFinite(time) && Date.now() - time > hours * 60 * 60 * 1000; }
function phone(value = "") { let p = String(value).replace(/[\s\-()]/g, "").replace(/^\+/, "").replace(/[^0-9]/g, ""); if (p.startsWith("0")) p = `27${p.slice(1)}`; return p; }
function openWhatsApp(customer, text) { const p = phone(customer.whatsapp || customer.phone || ""); if (!p) return ""; return `https://wa.me/${p}?text=${encodeURIComponent(text)}`; }
function dateLabel(value) { return value ? new Date(value).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "Not contacted yet"; }

function messageFor(customer, business, type) {
  const name = customer.name || "there";
  const businessName = business?.name || "my business";
  const stage = journeyForCustomer(customer);
  if (type === "review") return `Hi ${name}, thank you again for supporting ${businessName}. Please could you send me a short review or comment about your experience? It would really help my business grow.`;
  if (stage === "price_sent") return `Hi ${name}, just following up on the price or quote I sent. Please let me know if you would like to go ahead.`;
  if (stage === "booking_requested") return `Hi ${name}, just following up on your booking request. Please let me know which time works best for you.`;
  if (stage === "booked") return `Hi ${name}, this is a friendly reminder that your booking with ${businessName} is confirmed.`;
  if (stage === "payment_pending") return `Hi ${name}, just a friendly reminder that payment is still pending.`;
  if (stage === "paid") return `Hi ${name}, thank you for your payment. I will continue with your order or booking.`;
  if (stage === "completed") return `Hi ${name}, thank you for supporting ${businessName}. I hope you were happy with everything.`;
  if (stage === "lost") return `Hi ${name}, hope you are well. You are welcome to message ${businessName} again whenever you need help.`;
  return `Hi ${name}, thank you for your enquiry. I wanted to follow up and check if you are still interested in ${businessName}.`;
}

function SmartListCard({ label, count, active, onClick, description }) {
  return <button type="button" onClick={onClick} style={{ background: active ? SOFT : "#fff", border: `1.5px solid ${active ? BRAND : BORDER}`, borderRadius: 16, padding: 14, textAlign: "left", cursor: "pointer" }}>
    <div style={{ fontSize: 22, fontWeight: 950, color: DARK }}>{count}</div>
    <div style={{ fontSize: 13, fontWeight: 900, color: active ? BRAND : DARK }}>{label}</div>
    <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{description}</div>
  </button>;
}

export function CustomerFollowUpsTab({ business }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState("new_enquiries");
  const [savingId, setSavingId] = useState(null);
  const [messageTypeById, setMessageTypeById] = useState({});
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2400); };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!business?.id) { setLoading(false); return; }
      setLoading(true);
      const { data, error } = await supabase.from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
      if (error) console.error("Load follow-up customers:", error);
      if (!cancelled) { setCustomers(data || []); setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [business?.id]);

  const smartLists = useMemo(() => {
    const byStage = (stage) => customers.filter((customer) => journeyForCustomer(customer) === stage);
    return {
      new_enquiries: customers.filter((customer) => journeyForCustomer(customer) === "new_enquiry" && !olderThanHours(anchorDate(customer), FOLLOW_UP_DELAY_HOURS)),
      needs_follow_up: customers.filter((customer) => NEEDS_FOLLOW_UP.includes(journeyForCustomer(customer)) && olderThanHours(anchorDate(customer), FOLLOW_UP_DELAY_HOURS)),
      payment_pending: byStage("payment_pending"),
      booked: byStage("booked"),
      completed: byStage("completed"),
      lost: byStage("lost"),
    };
  }, [customers]);

  const visibleCustomers = smartLists[selectedList] || [];

  async function updateCustomer(customer, patch, msg) {
    setSavingId(customer.id);
    const { data, error } = await supabase.from("customers").update(patch).eq("id", customer.id).select().single();
    if (error) showToast("Could not update customer");
    if (data) { setCustomers((rows) => rows.map((row) => row.id === data.id ? data : row)); showToast(msg); }
    setSavingId(null);
  }

  function changeStage(customer, stage) {
    const patch = statusPatchForJourney(stage, customer);
    updateCustomer(customer, { ...patch, status: patch.stage }, `${customer.name} moved to ${journeyConfig(stage).label}`);
  }

  function markFollowedUp(customer) {
    const now = new Date().toISOString();
    const patch = statusPatchForJourney("followed_up", customer);
    updateCustomer(customer, { ...patch, status: patch.stage, last_contacted: now, last_contacted_at: now }, `${customer.name} marked as followed up`);
  }

  async function copyMessage(text) {
    try { await navigator.clipboard.writeText(text); showToast("Message copied"); } catch { showToast("Copy failed"); }
  }

  if (!business?.id) return <div style={{ textAlign: "center", padding: 70, color: "#888" }}>Set up your business before using follow-ups.</div>;

  return <div style={{ maxWidth: 980 }}>
    <div style={{ marginBottom: 18 }}><h2 style={{ fontSize: 22, fontWeight: 900, color: DARK, margin: "0 0 4px" }}>Customer Follow-Ups</h2><p style={{ fontSize: 13, color: "#777", margin: 0 }}>Never lose a customer enquiry again. Group your customers, follow up on WhatsApp, and keep sales moving.</p></div>
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 16, marginBottom: 18 }}><strong>Manual WhatsApp follow-up only</strong><div style={{ fontSize: 13, color: "#777", marginTop: 4 }}>VulaTrade prepares the message and opens WhatsApp. You stay in control.</div></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10, marginBottom: 18 }}>
      <SmartListCard label="New enquiries" count={smartLists.new_enquiries.length} active={selectedList === "new_enquiries"} onClick={() => setSelectedList("new_enquiries")} description="Fresh in the last 6 hours" />
      <SmartListCard label="Needs follow-up" count={smartLists.needs_follow_up.length} active={selectedList === "needs_follow_up"} onClick={() => setSelectedList("needs_follow_up")} description="Waiting more than 6 hours" />
      <SmartListCard label="Payment pending" count={smartLists.payment_pending.length} active={selectedList === "payment_pending"} onClick={() => setSelectedList("payment_pending")} description="Money to follow up" />
      <SmartListCard label="Booked" count={smartLists.booked.length} active={selectedList === "booked"} onClick={() => setSelectedList("booked")} description="Confirmed bookings" />
      <SmartListCard label="Completed" count={smartLists.completed.length} active={selectedList === "completed"} onClick={() => setSelectedList("completed")} description="Ask for reviews" />
      <SmartListCard label="Lost" count={smartLists.lost.length} active={selectedList === "lost"} onClick={() => setSelectedList("lost")} description="Not going ahead now" />
    </div>
    {loading && <div style={{ textAlign: "center", padding: 54, color: "#aaa" }}>Loading customers...</div>}
    {!loading && customers.length === 0 && <div style={{ textAlign: "center", padding: 64, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18 }}>No customers yet</div>}
    {!loading && customers.length > 0 && visibleCustomers.length === 0 && <div style={{ textAlign: "center", padding: 44, color: "#888", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18 }}>Nothing in this list right now.</div>}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{visibleCustomers.map((customer) => {
      const stage = journeyForCustomer(customer);
      const config = journeyConfig(stage);
      const messageType = messageTypeById[customer.id] || "stage";
      const text = messageFor(customer, business, messageType);
      const link = openWhatsApp(customer, text);
      return <div key={customer.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 15 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}><div><div style={{ fontSize: 16, fontWeight: 900, color: DARK }}>{customer.name}</div><div style={{ fontSize: 12, color: "#888" }}>{customer.whatsapp || "No WhatsApp"} · Last contact: {dateLabel(lastContacted(customer))}</div></div><span style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color, borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 900 }}>{config.label}</span></div>
        {customer.notes && <div style={{ background: "#fbfbfb", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 10, fontSize: 12, color: "#666", marginBottom: 12 }}>{customer.notes}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 12 }}><div><label style={labelStyle}>Move journey</label><select value={stage} onChange={(event) => changeStage(customer, event.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{CUSTOMER_JOURNEY.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><div><label style={labelStyle}>Message type</label><select value={messageType} onChange={(event) => setMessageTypeById((prev) => ({ ...prev, [customer.id]: event.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}><option value="stage">Best follow-up for journey</option><option value="review">Review request</option></select></div></div>
        <div style={{ background: "#fbfbfb", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 11, fontSize: 13, color: "#555", marginBottom: 12 }}>{text}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><a href={link || undefined} target="_blank" rel="noopener noreferrer" onClick={(event) => { if (!link) { event.preventDefault(); showToast("Add a WhatsApp number first"); } }} style={{ background: link ? BRAND : "#e0e0e0", color: link ? "#fff" : "#999", borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 850, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}><MessageCircle size={15} /> Follow up on WhatsApp</a><button type="button" onClick={() => copyMessage(text)} style={{ border: `1.5px solid ${BORDER}`, background: "#fff", color: "#555", borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 800 }}>Copy message</button><button type="button" onClick={() => markFollowedUp(customer)} disabled={savingId === customer.id} style={{ border: "none", background: DARK, color: "#fff", borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 850 }}>{savingId === customer.id ? "Saving..." : "Mark followed up"}</button></div>
      </div>;
    })}</div>
    {toast && <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: DARK, color: "#fff", padding: "12px 22px", borderRadius: 999, fontSize: 13, fontWeight: 800, zIndex: 2000 }}>{toast}</div>}
  </div>;
}

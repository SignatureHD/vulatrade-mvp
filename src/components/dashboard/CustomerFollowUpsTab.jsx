import React, { useEffect, useMemo, useState } from "react";
import { Clock, MessageCircle, StickyNote, Users } from "lucide-react";
import { DARK, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";
const SOFT = "#fde8f1";
const BORDER = "#eeeeea";
const FOLLOW_UP_DELAY_HOURS = 6;

const CUSTOMER_STAGES = [
  { value: "new_enquiry", label: "New enquiry" },
  { value: "followed_up", label: "Followed up" },
  { value: "quote_sent", label: "Quote sent" },
  { value: "payment_pending", label: "Payment pending" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed / delivered" },
  { value: "repeat_customer", label: "Repeat customer" },
  { value: "lost", label: "Lost / not interested" },
];

const STAGE_LABELS = CUSTOMER_STAGES.reduce((map, item) => ({ ...map, [item.value]: item.label }), {});
const FOLLOW_UP_STAGE_VALUES = ["new_enquiry", "followed_up", "quote_sent", "payment_pending"];

function stageForCustomer(customer) {
  if (customer.status === "lost") return "lost";
  if (customer.stage) return customer.stage;
  if (customer.status === "lead") return "new_enquiry";
  if (customer.status === "new") return "new_enquiry";
  if (customer.status === "regular" || customer.status === "vip") return "repeat_customer";
  return "new_enquiry";
}

function lastContacted(customer) {
  return customer.last_contacted_at || customer.last_contacted || null;
}

function followUpAnchor(customer) {
  return lastContacted(customer) || customer.created_at || customer.updated_at || null;
}

function isOlderThanHours(dateString, hours) {
  if (!dateString) return false;
  const value = new Date(dateString).getTime();
  if (Number.isNaN(value)) return false;
  return Date.now() - value > hours * 60 * 60 * 1000;
}

function formatDate(dateString) {
  if (!dateString) return "Not contacted yet";
  return new Date(dateString).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function normalisePhone(value = "") {
  let phone = String(value).replace(/[\s\-()]/g, "").replace(/^\+/, "");
  phone = phone.replace(/[^0-9]/g, "");
  if (phone.startsWith("0")) phone = `27${phone.slice(1)}`;
  return phone;
}

function messageFor(customer, business, type = "stage") {
  const name = customer.name || "there";
  const businessName = business?.name || "my business";
  const stage = stageForCustomer(customer);
  if (type === "review") return `Hi ${name}, thank you again for supporting ${businessName}. Please could you send me a short review or comment about your experience? It would really help my business grow.`;
  if (stage === "quote_sent") return `Hi ${name}, just following up on the quote I sent. Please let me know if you would like to go ahead or if you have any questions.`;
  if (stage === "payment_pending") return `Hi ${name}, just a friendly reminder that payment is still pending. Once payment is confirmed, I can continue with your order or booking.`;
  if (stage === "completed") return `Hi ${name}, thank you for supporting ${businessName}. I hope you were happy with everything. Please feel free to message me again whenever you need help.`;
  if (stage === "repeat_customer") return `Hi ${name}, hope you are well. I wanted to let you know that I have something new or special available. Would you like me to send you the details?`;
  if (stage === "lost") return `Hi ${name}, hope you are well. I know the timing was not right before, but you are welcome to message ${businessName} again whenever you need help.`;
  return `Hi ${name}, thank you for your enquiry. I wanted to follow up and check if you are still interested in ${businessName}. Please let me know how I can help.`;
}

function whatsappLink(customer, message) {
  const phone = normalisePhone(customer.whatsapp || customer.phone || "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function SmartListCard({ label, count, active, onClick, description }) {
  return (
    <button type="button" onClick={onClick} style={{ background: active ? SOFT : "#fff", border: `1.5px solid ${active ? BRAND : BORDER}`, borderRadius: "16px", padding: "14px", textAlign: "left", cursor: "pointer" }}>
      <div style={{ fontSize: "22px", fontWeight: 950, color: DARK, marginBottom: "4px" }}>{count}</div>
      <div style={{ fontSize: "13px", fontWeight: 900, color: active ? BRAND : DARK }}>{label}</div>
      <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
    </button>
  );
}

export function CustomerFollowUpsTab({ business }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState("new_enquiries");
  const [savingId, setSavingId] = useState(null);
  const [messageTypeById, setMessageTypeById] = useState({});
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadCustomers() {
      if (!business?.id) { setLoading(false); return; }
      setLoading(true);
      const { data, error } = await supabase.from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
      if (error) console.error("Load follow-up customers:", error);
      if (!cancelled) {
        setCustomers(data || []);
        setLoading(false);
      }
    }
    loadCustomers();
    return () => { cancelled = true; };
  }, [business?.id]);

  const smartLists = useMemo(() => {
    const byStage = (stage) => customers.filter((customer) => stageForCustomer(customer) === stage);
    const needsFollowUp = customers.filter((customer) => FOLLOW_UP_STAGE_VALUES.includes(stageForCustomer(customer)) && isOlderThanHours(followUpAnchor(customer), FOLLOW_UP_DELAY_HOURS));
    const freshNewEnquiries = customers.filter((customer) => stageForCustomer(customer) === "new_enquiry" && !isOlderThanHours(followUpAnchor(customer), FOLLOW_UP_DELAY_HOURS));
    return {
      needs_follow_up: needsFollowUp,
      new_enquiries: freshNewEnquiries,
      payment_pending: byStage("payment_pending"),
      repeat_customers: byStage("repeat_customer"),
      completed: byStage("completed"),
      lost: byStage("lost"),
    };
  }, [customers]);

  const visibleCustomers = smartLists[selectedList] || customers;

  async function updateCustomer(customer, payload, successMessage) {
    setSavingId(customer.id);
    let { data, error } = await supabase.from("customers").update(payload).eq("id", customer.id).select().single();

    if (error && ("last_contacted_at" in payload || "stage" in payload)) {
      const fallback = { ...payload };
      delete fallback.last_contacted_at;
      delete fallback.stage;
      if (Object.keys(fallback).length > 0) {
        const retry = await supabase.from("customers").update(fallback).eq("id", customer.id).select().single();
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) {
      console.error("Customer follow-up update error:", error);
      showToast("Could not update customer. Please check the database migration.");
    } else if (data) {
      setCustomers((prev) => prev.map((item) => item.id === data.id ? data : item));
      showToast(successMessage);
    }
    setSavingId(null);
  }

  function changeStage(customer, stage) {
    const payload = { stage };
    if (stage === "lost") payload.status = "lost";
    updateCustomer(customer, payload, `${customer.name} moved to ${STAGE_LABELS[stage] || "new stage"}`);
  }

  function markFollowedUp(customer) {
    const now = new Date().toISOString();
    const stage = stageForCustomer(customer);
    const payload = { last_contacted: now, last_contacted_at: now };
    if (["new_enquiry", "followed_up"].includes(stage)) payload.stage = "followed_up";
    updateCustomer(customer, payload, `${customer.name} marked as followed up`);
  }

  async function copyMessage(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Message copied");
    } catch {
      showToast("Copy failed. You can still open WhatsApp.");
    }
  }

  if (!business?.id) return <div style={{ textAlign: "center", padding: "70px 24px", color: "#888" }}>Set up your business before using follow-ups.</div>;

  return (
    <div style={{ maxWidth: "980px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "18px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: DARK, margin: "0 0 4px" }}>Customer Follow-Ups</h2>
          <p style={{ fontSize: "13px", color: "#777", lineHeight: 1.5, margin: 0 }}>Never lose a customer enquiry again. Group your customers, follow up on WhatsApp, and keep sales moving.</p>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "18px", padding: "16px", marginBottom: "18px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <span style={{ width: "42px", height: "42px", borderRadius: "50%", background: SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MessageCircle size={20} color={BRAND} /></span>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 900, color: DARK }}>Manual WhatsApp follow-up only</div>
          <div style={{ fontSize: "13px", color: "#777", lineHeight: 1.55, marginTop: "4px" }}>VulaTrade prepares the message and opens WhatsApp. You stay in control of what gets sent.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: "10px", marginBottom: "18px" }}>
        <SmartListCard label="New enquiries" count={smartLists.new_enquiries.length} active={selectedList === "new_enquiries"} onClick={() => setSelectedList("new_enquiries")} description="Fresh in the last 6 hours" />
        <SmartListCard label="Needs follow-up" count={smartLists.needs_follow_up.length} active={selectedList === "needs_follow_up"} onClick={() => setSelectedList("needs_follow_up")} description="Waiting more than 6 hours" />
        <SmartListCard label="Payment pending" count={smartLists.payment_pending.length} active={selectedList === "payment_pending"} onClick={() => setSelectedList("payment_pending")} description="Money to follow up" />
        <SmartListCard label="Repeat customers" count={smartLists.repeat_customers.length} active={selectedList === "repeat_customers"} onClick={() => setSelectedList("repeat_customers")} description="Good customers to re-engage" />
        <SmartListCard label="Completed" count={smartLists.completed.length} active={selectedList === "completed"} onClick={() => setSelectedList("completed")} description="Ask for reviews" />
        <SmartListCard label="Lost" count={smartLists.lost.length} active={selectedList === "lost"} onClick={() => setSelectedList("lost")} description="Not interested for now" />
      </div>

      {loading && <div style={{ textAlign: "center", padding: "54px", color: "#aaa" }}>Loading customers...</div>}
      {!loading && customers.length === 0 && <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "18px" }}><Users size={26} color={BRAND} /><h3 style={{ color: DARK, marginBottom: "8px" }}>No customers yet</h3><p style={{ color: "#777", fontSize: "14px" }}>Add customers first, then use follow-ups to keep sales moving.</p></div>}
      {!loading && customers.length > 0 && visibleCustomers.length === 0 && <div style={{ textAlign: "center", padding: "44px", color: "#888", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "18px" }}>Nothing in this list right now.</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {visibleCustomers.map((customer) => {
          const stage = stageForCustomer(customer);
          const messageType = messageTypeById[customer.id] || "stage";
          const text = messageFor(customer, business, messageType);
          const phone = normalisePhone(customer.whatsapp || customer.phone || "");
          return (
            <div key={customer.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "18px", padding: "15px", boxShadow: "0 10px 26px rgba(15,23,42,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "12px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: DARK }}>{customer.name}</div>
                  <div style={{ fontSize: "12px", color: "#888", display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>{customer.whatsapp && <span>{customer.whatsapp}</span>}{customer.area && <span>{customer.area}</span>}<span><Clock size={12} /> {formatDate(lastContacted(customer))}</span></div>
                </div>
                <span style={{ background: SOFT, border: "1px solid #f8b8d2", color: BRAND, borderRadius: "999px", padding: "6px 10px", fontSize: "11px", fontWeight: 900 }}>{STAGE_LABELS[stage] || "New enquiry"}</span>
              </div>

              {customer.notes && <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", background: "#fbfbfb", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "10px", fontSize: "12px", color: "#666", lineHeight: 1.45, marginBottom: "12px" }}><StickyNote size={14} color="#888" /><span>{customer.notes}</span></div>}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "12px" }}>
                <div><label style={labelStyle}>Move stage</label><select value={stage} onChange={(event) => changeStage(customer, event.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{CUSTOMER_STAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                <div><label style={labelStyle}>Message type</label><select value={messageType} onChange={(event) => setMessageTypeById((prev) => ({ ...prev, [customer.id]: event.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}><option value="stage">Best follow-up for stage</option><option value="review">Review request</option></select></div>
              </div>

              <div style={{ background: "#fbfbfb", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "11px", fontSize: "13px", color: "#555", lineHeight: 1.5, marginBottom: "12px" }}>{text}</div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <a href={phone ? whatsappLink(customer, text) : undefined} target="_blank" rel="noopener noreferrer" onClick={(event) => { if (!phone) { event.preventDefault(); showToast("Add a WhatsApp number first"); } }} style={{ background: phone ? BRAND : "#e0e0e0", color: phone ? "#fff" : "#999", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontWeight: 850, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}><MessageCircle size={15} /> Follow up on WhatsApp</a>
                <button type="button" onClick={() => copyMessage(text)} style={{ border: `1.5px solid ${BORDER}`, background: "#fff", color: "#555", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>Copy message</button>
                <button type="button" onClick={() => markFollowedUp(customer)} disabled={savingId === customer.id} style={{ border: "none", background: DARK, color: "#fff", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontWeight: 850, cursor: "pointer" }}>{savingId === customer.id ? "Saving..." : "Mark followed up"}</button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)", background: DARK, color: "#fff", padding: "12px 22px", borderRadius: "999px", fontSize: "13px", fontWeight: 800, zIndex: 2000, boxShadow: "0 8px 32px rgba(0,0,0,0.24)" }}>{toast}</div>}
    </div>
  );
}

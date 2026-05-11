import React, { useEffect, useState } from "react";
import { LIME, DARK, CUSTOMER_STATUSES, CONTACT_PICKER_SUPPORTED, PAYMENT_METHODS, PAYMENT_STATUSES, inputStyle, labelStyle, statusConfig } from "../../constants";
import { waLink, timeAgo, formatPhone, pickFromContacts } from "../../utils";
import { supabase } from "../../lib/supabase";
import { StatusBadge } from "../ui";
import { FileCheck, MessageCircle, Pencil, StickyNote, Star, Users } from "lucide-react";

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
  return new Date(dateString).toLocaleDateString("en-ZA", { day:"numeric", month:"short" });
}

// ── IMPORT PREVIEW MODAL ───────────────────────────────────
function ImportPreviewModal({ contacts, onConfirm, onCancel, importing }) {
  const [selected, setSelected] = useState(() => new Set(contacts.map((_, i) => i)));
  function toggle(i) {
    setSelected((prev) => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; });
  }
  const toImport = contacts.filter((_, i) => selected.has(i));
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"28px", width:"100%", maxWidth:"460px", boxShadow:"0 20px 60px rgba(0,0,0,0.25)", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
        <h3 style={{ fontSize:"18px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Import contacts</h3>
        <p style={{ fontSize:"13px", color:"#aaa", marginBottom:"16px" }}>{contacts.length} found — deselect any you don't want</p>
        <div style={{ overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:"6px", marginBottom:"16px" }}>
          {contacts.map((c, i) => (
            <div key={i} onClick={() => toggle(i)}
              style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", borderRadius:"12px", border:`1.5px solid ${selected.has(i) ? LIME : "#e0e0e0"}`, background:selected.has(i) ? "#fff5f9" : "#fff", cursor:"pointer" }}>
              <div style={{ width:"18px", height:"18px", borderRadius:"5px", border:`2px solid ${selected.has(i) ? LIME : "#ccc"}`, background:selected.has(i) ? LIME : "#fff", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:800 }}>
                {selected.has(i) ? "✓" : ""}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>{c.name || "—"}</div>
                {c.whatsapp && <div style={{ fontSize:"12px", color:"#aaa" }}>{c.whatsapp}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={() => onConfirm(toImport)} disabled={toImport.length === 0 || importing}
            style={{ flex:1, backgroundColor:toImport.length > 0 ? LIME : "#e0e0e0", color:toImport.length > 0 ? "#fff" : "#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:toImport.length > 0 ? "pointer" : "not-allowed" }}>
            {importing ? "Importing…" : `Import ${toImport.length} contact${toImport.length !== 1 ? "s" : ""}`}
          </button>
          <button onClick={onCancel} style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── LOG SALE MODAL ─────────────────────────────────────────
function LogSaleModal({ business, customer, onClose, onLogged }) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Paid");
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  async function handleLog() {
    const val = parseFloat(amount);
    if (!business?.id || !val) return;
    setSaving(true);
    const { data: payment, error: paymentError } = await supabase.from("payments")
      .insert([{
        business_id: business.id,
        customer_id: customer.id,
        amount: val,
        status,
        method,
        reference: reference.trim() || null,
      }])
      .select()
      .single();

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      alert("Payment could not be saved. Please try again.");
      setSaving(false);
      return;
    }

    const paidAmount = status === "Unpaid" ? 0 : val;
    const { data } = await supabase.from("customers")
      .update({
        total_spent: (customer.total_spent || 0) + paidAmount,
        visit_count: (customer.visit_count || 0) + (status === "Unpaid" ? 0 : 1),
        last_contacted: new Date().toISOString(),
        status: customer.status === "lead" ? "new" : customer.status,
      })
      .eq("id", customer.id).select().single();
    if (data) onLogged(data, payment);
    setSaving(false);
    onClose();
  }
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"32px", width:"100%", maxWidth:"380px", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize:"18px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Log a sale</h3>
        <p style={{ fontSize:"13px", color:"#aaa", marginBottom:"24px" }}>Payment from <strong>{customer.name}</strong></p>
        {customer.status === "lead" && <div style={{ fontSize:"12px", color:"#555", background:"#fbfbfb", border:"1px solid #d8d8d4", borderRadius:"8px", padding:"8px 12px", marginBottom:"16px" }}>Logging a sale will automatically move them from Lead → New</div>}
        <label style={labelStyle}>Amount (R)</label>
        <input style={{ ...inputStyle, fontSize:"28px", fontWeight:800, marginBottom:"20px", textAlign:"center" }}
          type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={{ ...inputStyle, cursor:"pointer" }} value={status} onChange={(e) => setStatus(e.target.value)}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Method</label>
            <select style={{ ...inputStyle, cursor:"pointer" }} value={method} onChange={(e) => setMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <label style={labelStyle}>Reference / note</label>
        <input style={{ ...inputStyle, marginBottom:"20px" }} placeholder="Optional" value={reference} onChange={(e) => setReference(e.target.value)} />
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={handleLog} disabled={!amount || saving}
            style={{ flex:1, backgroundColor:amount ? LIME : "#e0e0e0", color:amount ? "#fff" : "#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:amount ? "pointer" : "not-allowed" }}>
            {saving ? "Saving…" : "Log sale"}
          </button>
          <button onClick={onClose} style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── WHATSAPP MODAL ─────────────────────────────────────────
function WhatsAppModal({ customer, onClose }) {
  const WA_TEMPLATES = [
    { label:"Check in",      text:`Hi ${customer.name}! 👋 Just checking in — is there anything I can help you with?` },
    { label:"Follow up",     text:`Hi ${customer.name}! Just wanted to follow up — hope everything went well. Would love to have you back! 😊` },
    { label:"Special offer", text:`Hi ${customer.name}! 🎉 I have a special offer just for you this week. Reply to find out more!` },
    { label:"Reminder",      text:`Hi ${customer.name}! Just a reminder about your upcoming appointment. See you soon! 😊` },
  ];
  const [message, setMessage] = useState(WA_TEMPLATES[0].text);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"32px", width:"100%", maxWidth:"420px", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize:"18px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Message {customer.name}</h3>
        <p style={{ fontSize:"13px", color:"#aaa", marginBottom:"20px" }}>{customer.whatsapp}</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"14px" }}>
          {WA_TEMPLATES.map((t) => (
            <button key={t.label} onClick={() => setMessage(t.text)}
              style={{ padding:"6px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:600, cursor:"pointer", border:"1.5px solid", background:message===t.text?DARK:"#fff", color:message===t.text?LIME:"#555", borderColor:message===t.text?DARK:"#e0e0e0" }}>
              {t.label}
            </button>
          ))}
        </div>
        <textarea style={{ ...inputStyle, minHeight:"100px", resize:"vertical", marginBottom:"16px" }}
          value={message} onChange={(e) => setMessage(e.target.value)} />
        <div style={{ display:"flex", gap:"8px" }}>
          <a href={waLink(customer.whatsapp, message)} target="_blank" rel="noopener noreferrer"
            style={{ flex:1, display:"block", backgroundColor:"#25d366", color:"#fff", textAlign:"center", padding:"13px", fontSize:"14px", fontWeight:800, borderRadius:"12px", textDecoration:"none" }}>
            Open WhatsApp →
          </a>
          <button onClick={onClose} style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── CUSTOMER FORM ──────────────────────────────────────────
function CustomerForm({ initial = {}, onSave, onCancel, saving, businessProducts }) {
  const [form, setForm] = useState({
    name:          initial.name          || "",
    whatsapp:      initial.whatsapp      || "",
    area:          initial.area          || "",
    notes:         initial.notes         || "",
    status:        initial.status        || "new",
    interested_in: initial.interested_in || [],
  });
  function upd(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function toggleProduct(productName) {
    setForm((p) => ({
      ...p,
      interested_in: p.interested_in.includes(productName)
        ? p.interested_in.filter((x) => x !== productName)
        : [...p.interested_in, productName],
    }));
  }

  const valid = form.name.trim().length > 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      <div>
        <label style={labelStyle}>Status</label>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
          {CUSTOMER_STATUSES.map((s) => (
            <button key={s.value} onClick={() => upd("status", s.value)} title={s.desc}
              style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${form.status===s.value ? s.border : "#e0e0e0"}`, background:form.status===s.value ? s.bg : "#fff", color:form.status===s.value ? s.color : "#888" }}>
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize:"11px", color:"#bbb", marginTop:"5px" }}>{statusConfig(form.status).desc}</div>
      </div>
      <div><label style={labelStyle}>Name *</label><input style={inputStyle} placeholder="Customer name" value={form.name} onChange={(e) => upd("name", e.target.value)} autoFocus /></div>
      <div><label style={labelStyle}>WhatsApp number</label><input style={inputStyle} placeholder="+27 82 000 0000" value={form.whatsapp} onChange={(e) => upd("whatsapp", e.target.value)} /></div>
      <div><label style={labelStyle}>Area / Neighbourhood</label><input style={inputStyle} placeholder="e.g. Soweto, Sandton" value={form.area} onChange={(e) => upd("area", e.target.value)} /></div>
      {businessProducts && businessProducts.length > 0 && (
        <div>
          <label style={labelStyle}>Interested in</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
            {businessProducts.map((p) => {
              const selected = form.interested_in.includes(p.name);
              const imgVal = p.image || p.icon || "🛍️";
              const isUrl  = imgVal.startsWith("http");
              return (
                <button key={p.id} onClick={() => toggleProduct(p.name)}
                  style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 14px", borderRadius:"12px", border:`1.5px solid ${selected ? LIME : "#e0e0e0"}`, background:selected ? "#fff5f9" : "#fff", cursor:"pointer" }}>
                  {isUrl ? <img src={imgVal} alt="" style={{ width:"20px", height:"20px", borderRadius:"5px", objectFit:"cover" }} /> : <span style={{ fontSize:"16px" }}>{imgVal}</span>}
                  <span style={{ fontSize:"13px", fontWeight:700, color:selected ? "#d93f7b" : "#555" }}>{p.name}</span>
                  {selected && <span style={{ fontSize:"11px", color:LIME }}>✓</span>}
                </button>
              );
            })}
          </div>
          {form.interested_in.length > 0 && (
            <div style={{ fontSize:"11px", color:"#d93f7b", marginTop:"5px" }}>
              {form.interested_in.length} service{form.interested_in.length !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      )}
      <div><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, minHeight:"72px", resize:"vertical" }} placeholder="Allergies, preferences, anything useful…" value={form.notes} onChange={(e) => upd("notes", e.target.value)} /></div>
      <div style={{ display:"flex", gap:"8px" }}>
        <button onClick={() => onSave(form)} disabled={!valid || saving}
          style={{ flex:1, backgroundColor:valid ? LIME : "#e0e0e0", color:valid ? "#fff" : "#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:valid ? "pointer" : "not-allowed" }}>
          {saving ? "Saving…" : "Save customer"}
        </button>
        <button onClick={onCancel} style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── CUSTOMER CARD ──────────────────────────────────────────
function CustomerCard({ customer, activity, onEdit, onDelete, onLogSale, onMessage, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const initials = customer.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
  const s = statusConfig(customer.status || "new");
  const tags = customerTags(customer, activity);

  return (
    <div style={{ background:"#fff", border:`1.5px solid ${s.border}`, borderRadius:"16px", overflow:"hidden" }}>
      <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:"14px", cursor:"pointer" }} onClick={() => setExpanded((x) => !x)}>
        <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:s.bg, border:`2px solid ${s.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", fontWeight:800, color:s.color, flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"3px" }}>
            <span style={{ fontSize:"15px", fontWeight:700, color:DARK, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{customer.name}</span>
            <StatusBadge status={customer.status || "new"} small />
          </div>
          <div style={{ fontSize:"12px", color:"#aaa", display:"flex", gap:"10px", flexWrap:"wrap" }}>
            {customer.whatsapp && <span>{customer.whatsapp}</span>}
            {customer.area && <span>{customer.area}</span>}
            {customer.last_contacted && <span>Last contact: {timeAgo(customer.last_contacted)}</span>}
          </div>
          <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", marginTop:"7px" }}>
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} style={{ fontSize:"10px", fontWeight:800, color:"#d93f7b", background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"999px", padding:"3px 8px" }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          {customer.total_spent > 0 && <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>R{customer.total_spent.toLocaleString()}</div>}
          {customer.last_contacted && <div style={{ fontSize:"11px", color:"#bbb", marginTop:"2px" }}>{timeAgo(customer.last_contacted)}</div>}
        </div>
        <span style={{ fontSize:"12px", color:"#ccc", marginLeft:"4px" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ borderTop:"1px solid #f5f5f5", padding:"14px 18px", background:"#fafafa" }}>
          {customer.interested_in && customer.interested_in.length > 0 && (
            <div style={{ marginBottom:"12px" }}>
              <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"6px" }}>Interested in</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                {customer.interested_in.map((item) => (
                  <span key={item} style={{ fontSize:"12px", fontWeight:600, color:"#d93f7b", background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"8px", padding:"3px 10px" }}>{item}</span>
                ))}
              </div>
            </div>
          )}
          {customer.notes && (
            <div style={{ fontSize:"13px", color:"#666", background:"#fff", border:"1px solid #eeeeea", borderRadius:"10px", padding:"10px 14px", marginBottom:"12px", lineHeight:1.6 }}>
              {customer.notes}
            </div>
          )}
          <div style={{ marginBottom:"12px" }}>
            <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"6px" }}>Move to</div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {CUSTOMER_STATUSES.filter((st) => st.value !== (customer.status || "new")).map((st) => (
                <button key={st.value} onClick={() => onStatusChange(customer, st.value)}
                  style={{ padding:"5px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${st.border}`, background:st.bg, color:st.color }}>
                  → {st.label}
                </button>
              ))}
            </div>
          </div>
          {(customer.last_contacted || activity?.lastBookingDate || activity?.lastSaleDate) && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"8px", marginBottom:"12px" }}>
              {customer.last_contacted && (
                <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"10px", padding:"10px" }}>
                  <div style={{ fontSize:"10px", color:"#aaa", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em" }}>Last contact</div>
                  <div style={{ fontSize:"13px", color:DARK, fontWeight:800, marginTop:"4px" }}>{timeAgo(customer.last_contacted)}</div>
                </div>
              )}
              {activity?.lastBookingDate && (
                <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"10px", padding:"10px" }}>
                  <div style={{ fontSize:"10px", color:"#aaa", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em" }}>Last booking</div>
                  <div style={{ fontSize:"13px", color:DARK, fontWeight:800, marginTop:"4px" }}>{formatActivityDate(activity.lastBookingDate)}</div>
                </div>
              )}
              {activity?.lastSaleDate && (
                <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"10px", padding:"10px" }}>
                  <div style={{ fontSize:"10px", color:"#aaa", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em" }}>Last sale</div>
                  <div style={{ fontSize:"13px", color:DARK, fontWeight:800, marginTop:"4px" }}>{formatActivityDate(activity.lastSaleDate)}</div>
                </div>
              )}
            </div>
          )}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            <button onClick={() => onMessage(customer)}
              style={{ display:"flex", alignItems:"center", gap:"5px", padding:"8px 14px", borderRadius:"10px", border:"none", background:"#ea4c89", color:"#fff", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
              <MessageCircle size={14} strokeWidth={2.2} />
              Message
            </button>
            <button onClick={() => onLogSale(customer)} style={{ padding:"8px 14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Log sale</button>
            <button onClick={() => onEdit(customer)} style={{ display:"flex", alignItems:"center", gap:"5px", padding:"8px 14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}><Pencil size={13} strokeWidth={2.2} /> Edit</button>
            <button onClick={() => onEdit(customer)} style={{ display:"flex", alignItems:"center", gap:"5px", padding:"8px 14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}><StickyNote size={13} strokeWidth={2.2} /> Add note</button>
            {customer.status !== "vip" && <button onClick={() => onStatusChange(customer, "vip")} style={{ padding:"8px 14px", borderRadius:"10px", border:"1.5px solid #f8b8d2", background:"#fff5f9", color:"#d93f7b", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Mark VIP</button>}
            {customer.status !== "regular" && <button onClick={() => onStatusChange(customer, "regular")} style={{ padding:"8px 14px", borderRadius:"10px", border:"1.5px solid #f8b8d2", background:"#fff5f9", color:"#d93f7b", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Mark Regular</button>}
            <button onClick={() => onDelete(customer)} style={{ padding:"8px 14px", borderRadius:"10px", border:"1.5px solid #ffd0d0", background:"#fff5f5", color:"#cc3300", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Delete</button>
          </div>
          {(customer.visit_count > 0 || customer.total_spent > 0) && (
            <div style={{ display:"flex", gap:"20px", marginTop:"14px", paddingTop:"14px", borderTop:"1px solid #f0f0f0" }}>
              <div>
                <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Visits</div>
                <div style={{ fontSize:"20px", fontWeight:800, color:DARK }}>{customer.visit_count || 0}</div>
              </div>
              <div>
                <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Total spent</div>
                <div style={{ fontSize:"20px", fontWeight:800, color:DARK }}>R{(customer.total_spent||0).toLocaleString()}</div>
              </div>
              {customer.last_contacted && (
                <div>
                  <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Last seen</div>
                  <div style={{ fontSize:"20px", fontWeight:800, color:DARK }}>{timeAgo(customer.last_contacted)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN CUSTOMERS TAB ─────────────────────────────────────
export function CustomersTab({ business, onMessageCustomer }) {
  const [customers, setCustomers]       = useState([]);
  const [businessProducts, setBusinessProducts] = useState([]);
  const [activityByCustomer, setActivityByCustomer] = useState({});
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy]             = useState("recent");
  const [mode, setMode]                 = useState("list");
  const [editTarget, setEditTarget]     = useState(null);
  const [saving, setSaving]             = useState(false);
  const [logSaleFor, setLogSaleFor]     = useState(null);
  const [importContacts, setImportContacts] = useState(null);
  const [importing, setImporting]       = useState(false);
  const [toast, setToast]               = useState("");

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2800); }

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    Promise.all([
      supabase.from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
      supabase.from("products").select("id,name,image").eq("business_id", business.id).eq("is_active", true),
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
      (bookings || []).forEach((booking) => {
        if (!booking.customer_id) return;
        const item = activity[booking.customer_id] || { pendingBookings:0, unpaidCount:0 };
        if (!item.lastBookingDate || booking.booking_date > item.lastBookingDate) item.lastBookingDate = booking.booking_date;
        if (booking.status === "confirmed") item.pendingBookings = (item.pendingBookings || 0) + 1;
        activity[booking.customer_id] = item;
      });
      (payments || []).forEach((payment) => {
        if (!payment.customer_id) return;
        const item = activity[payment.customer_id] || { pendingBookings:0, unpaidCount:0 };
        const date = (payment.created_at || "").slice(0, 10);
        if (date && (!item.lastSaleDate || date > item.lastSaleDate)) item.lastSaleDate = date;
        if (payment.status === "Unpaid") item.unpaidCount = (item.unpaidCount || 0) + 1;
        activity[payment.customer_id] = item;
      });
      setActivityByCustomer(activity);
      setLoading(false);
    });
  }, [business?.id]);

  const filtered = customers
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.whatsapp?.includes(q) || c.area?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || (c.status || "new") === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "spent") return (b.total_spent||0) - (a.total_spent||0);
      if (sortBy === "name")  return a.name.localeCompare(b.name);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  async function handleSave(form) {
    if (!business?.id) return;
    setSaving(true);
    const payload = { name:form.name.trim(), whatsapp:formatPhone(form.whatsapp), area:form.area.trim(), notes:form.notes.trim(), status:form.status, interested_in:form.interested_in };
    if (editTarget) {
      const { data, error } = await supabase.from("customers").update(payload).eq("id", editTarget.id).select().single();
      if (error) console.error("Update error:", error);
      if (data) setCustomers((prev) => prev.map((c) => c.id === data.id ? data : c));
      showToast("Customer updated ✓");
    } else {
      const { data, error } = await supabase.from("customers").insert([{ ...payload, business_id: business.id }]).select().single();
      if (error) console.error("Insert error:", error);
      if (data) setCustomers((prev) => [data, ...prev]);
      showToast("Customer added ✓");
    }
    setSaving(false); setMode("list"); setEditTarget(null);
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.name}?`)) return;
    await supabase.from("customers").delete().eq("id", customer.id);
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    showToast("Customer deleted");
  }

  async function handleStatusChange(customer, newStatus) {
    const { data } = await supabase.from("customers").update({ status: newStatus }).eq("id", customer.id).select().single();
    if (data) setCustomers((prev) => prev.map((c) => c.id === data.id ? data : c));
    const s = statusConfig(newStatus);
    showToast(`${customer.name} → ${s.label} ✓`);
  }

  function handleSaleLogged(updated, payment) {
    setCustomers((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    if (payment?.customer_id) {
      const date = (payment.created_at || new Date().toISOString()).slice(0, 10);
      setActivityByCustomer((prev) => ({
        ...prev,
        [payment.customer_id]: {
          ...(prev[payment.customer_id] || {}),
          lastSaleDate: date,
          unpaidCount: payment.status === "Unpaid"
            ? ((prev[payment.customer_id]?.unpaidCount || 0) + 1)
            : (prev[payment.customer_id]?.unpaidCount || 0),
        },
      }));
    }
    showToast(`Payment ${payment?.status || "saved"} for ${updated.name} ✓`);
  }

  function handleMessageCustomer(customer) {
    if (onMessageCustomer) {
      onMessageCustomer(customer);
      return;
    }
    window.history.pushState({}, "", `/messages?customerId=${encodeURIComponent(customer.id)}`);
  }

  async function handleImportPhone() {
    const picked = await pickFromContacts();
    if (!picked || picked.length === 0) { showToast("No contacts selected."); return; }
    setImportContacts(picked);
  }

  async function handleConfirmImport(contacts) {
    if (!business?.id || contacts.length === 0) return;
    setImporting(true);
    const rows = contacts.map((c) => ({ business_id:business.id, name:c.name||"Unknown", whatsapp:c.whatsapp||"", status:"new", interested_in:[] }));
    const { data, error } = await supabase.from("customers").insert(rows).select();
    if (error) console.error("Import error:", error);
    if (data) setCustomers((prev) => [...data, ...prev]);
    setImporting(false); setImportContacts(null);
    showToast(`${contacts.length} contact${contacts.length!==1?"s":""} imported ✓`);
  }

  const totalSpent = customers.reduce((s, c) => s + (c.total_spent||0), 0);
  const countByStatus = (st) => customers.filter((c) => (c.status||"new") === st).length;

  if (!business?.id) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:"40px", marginBottom:"16px" }}>🏪</div>
      <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>Set up your business first</h3>
      <p style={{ fontSize:"14px", color:"#aaa" }}>Complete your business setup before adding customers.</p>
    </div>
  );

  if (mode === "add" || mode === "edit") return (
    <div style={{ maxWidth:"540px" }}>
      <button onClick={() => { setMode("list"); setEditTarget(null); }}
        style={{ background:"transparent", border:"none", fontSize:"13px", color:"#aaa", cursor:"pointer", padding:"0 0 16px" }}>← Back</button>
      <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"24px" }}>
        {mode === "edit" ? `Edit ${editTarget?.name}` : "Add customer"}
      </h2>
      <CustomerForm initial={editTarget || {}} onSave={handleSave} onCancel={() => { setMode("list"); setEditTarget(null); }} saving={saving} businessProducts={businessProducts} />
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Customers</h2>
          <p style={{ fontSize:"13px", color:"#888" }}>Keep customer details, notes, tags and follow-ups in one place.</p>
        </div>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
          {CONTACT_PICKER_SUPPORTED && (
            <button onClick={handleImportPhone} style={{ padding:"10px 16px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>Import contacts</button>
          )}
          <button onClick={() => setMode("add")} style={{ padding:"10px 18px", borderRadius:"10px", border:"none", background:"#ea4c89", color:"#fff", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>Add Customer</button>
        </div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"18px", padding:"18px", marginBottom:"20px", display:"flex", alignItems:"flex-start", gap:"14px" }}>
        <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <FileCheck size={19} strokeWidth={2.2} color="#ea4c89" />
        </span>
        <div>
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Customer history helps build your Business File.</div>
          <div style={{ fontSize:"13px", color:"#777", lineHeight:1.55 }}>Repeat customers, notes and follow-ups help show that your business has real demand.</div>
        </div>
      </div>

      {customers.length > 0 && (
        <div style={{ display:"flex", gap:"8px", marginBottom:"20px", flexWrap:"wrap" }}>
          <button onClick={() => setFilterStatus("all")}
            style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:"1.5px solid", background:filterStatus==="all"?DARK:"#fff", color:filterStatus==="all"?"#fff":"#555", borderColor:filterStatus==="all"?DARK:"#e0e0e0" }}>
            All ({customers.length})
          </button>
          {CUSTOMER_STATUSES.map((s) => {
            const count = countByStatus(s.value);
            if (count === 0) return null;
            return (
              <button key={s.value} onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
                style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${filterStatus===s.value ? s.border : "#e0e0e0"}`, background:filterStatus===s.value ? s.bg : "#fff", color:filterStatus===s.value ? s.color : "#888" }}>
                {s.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {customers.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:"10px", marginBottom:"20px" }}>
          {[
            { label:"Total",    value: customers.length },
            { label:"Interested", value: countByStatus("lead") },
            { label:"VIP", value: countByStatus("vip") },
            { label:"Revenue",  value: `R${totalSpent.toLocaleString()}` },
          ].map((s) => (
            <div key={s.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px" }}>
              <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{s.label}</div>
              <div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {customers.length > 0 && (
        <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
          <input style={{ ...inputStyle, flex:1, minWidth:"180px", padding:"10px 14px" }} placeholder="Search by name, number, area…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ padding:"10px 14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", fontSize:"13px", fontWeight:600, color:"#555", cursor:"pointer", outline:"none" }}>
            <option value="recent">Most recent</option>
            <option value="spent">Top spenders</option>
            <option value="name">A → Z</option>
          </select>
        </div>
      )}

      {loading && <div style={{ textAlign:"center", padding:"60px", color:"#aaa" }}>Loading…</div>}

      {!loading && customers.length === 0 && (
        <div style={{ textAlign:"center", padding:"64px 24px" }}>
          <span style={{ width:"56px", height:"56px", borderRadius:"50%", background:"#fde8f1", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:"14px" }}>
            <Users size={24} strokeWidth={2.2} color="#ea4c89" />
          </span>
          <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>No customers yet</h3>
          <p style={{ fontSize:"14px", color:"#767b81", marginBottom:"32px" }}>Add your first customer to start building your customer list.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px", maxWidth:"280px", margin:"0 auto" }}>
            {CONTACT_PICKER_SUPPORTED && (
              <button onClick={handleImportPhone} style={{ backgroundColor:LIME, color:"#fff", border:"none", borderRadius:"12px", padding:"13px 20px", fontSize:"14px", fontWeight:700, cursor:"pointer" }}>Import contacts</button>
            )}
            <button onClick={() => setMode("add")} style={{ backgroundColor:CONTACT_PICKER_SUPPORTED?"#fff":"#ea4c89", color:CONTACT_PICKER_SUPPORTED?DARK:"#fff", border:CONTACT_PICKER_SUPPORTED?"1.5px solid #e0e0e0":"none", borderRadius:"12px", padding:"13px 20px", fontSize:"14px", fontWeight:700, cursor:"pointer" }}>Add Customer</button>
          </div>
        </div>
      )}

      {!loading && customers.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"48px", color:"#aaa" }}>No customers match your search.</div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {filtered.map((c) => (
            <CustomerCard key={c.id} customer={c}
              activity={activityByCustomer[c.id]}
              onEdit={(cust) => { setEditTarget(cust); setMode("edit"); }}
              onDelete={handleDelete}
              onLogSale={setLogSaleFor}
              onMessage={handleMessageCustomer}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {logSaleFor  && <LogSaleModal  business={business} customer={logSaleFor}  onClose={() => setLogSaleFor(null)}  onLogged={handleSaleLogged} />}
      {importContacts && <ImportPreviewModal contacts={importContacts} onConfirm={handleConfirmImport} onCancel={() => setImportContacts(null)} importing={importing} />}

      {toast && (
        <div style={{ position:"fixed", bottom:"28px", left:"50%", transform:"translateX(-50%)", background:DARK, color:LIME, padding:"12px 24px", borderRadius:"999px", fontSize:"13px", fontWeight:700, zIndex:2000, boxShadow:"0 8px 32px rgba(0,0,0,0.25)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

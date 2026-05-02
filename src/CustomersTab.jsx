// ── CUSTOMERS TAB ──────────────────────────────────────────
// Drop this into AppDashboard.jsx and replace the "Customers" case in renderTab():
//   case "Customers": return <CustomersTab business={business} />;
//
// Supabase table required:
//   create table customers (
//     id uuid primary key default gen_random_uuid(),
//     business_id uuid references businesses(id) on delete cascade,
//     name text not null,
//     whatsapp text,
//     area text,
//     service text,
//     notes text,
//     is_vip boolean default false,
//     total_spent numeric default 0,
//     visit_count integer default 0,
//     last_contacted timestamp with time zone,
//     created_at timestamp with time zone default now()
//   );
//   alter table customers enable row level security;
//   create policy "Users manage own customers"
//     on customers for all using (
//       business_id in (select id from businesses where user_id = auth.uid())
//     );

import { supabase } from "./lib/supabase";
import React, { useEffect, useState, useRef } from "react";

const LIME = "#a3e635";
const DARK = "#0d0d0d";
const inputStyle = { border:"1.5px solid #e8e8e8", borderRadius:"12px", padding:"12px 14px", fontSize:"14px", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" };
const labelStyle = { fontSize:"12px", fontWeight:600, color:"#555", marginBottom:"6px", display:"block" };

// ── HELPERS ────────────────────────────────────────────────
function waLink(number, message = "") {
  const clean = number.replace(/\D/g, "");
  const msg = encodeURIComponent(message);
  return `https://wa.me/${clean}${msg ? `?text=${msg}` : ""}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "");
  // SA numbers: normalise 0XX → +27XX
  if (digits.startsWith("0") && digits.length === 10) return "+27" + digits.slice(1);
  if (digits.startsWith("27") && digits.length === 11) return "+" + digits;
  return raw.trim();
}

// ── CONTACT PICKER (Android Chrome / Edge) ─────────────────
const CONTACT_PICKER_SUPPORTED =
  typeof navigator !== "undefined" &&
  "contacts" in navigator &&
  "ContactsManager" in window;

async function pickFromContacts() {
  if (!CONTACT_PICKER_SUPPORTED) return null;
  try {
    const results = await navigator.contacts.select(["name", "tel"], { multiple: true });
    return results.map((c) => ({
      name: c.name?.[0] || "",
      whatsapp: c.tel?.[0] ? formatPhone(c.tel[0]) : "",
    }));
  } catch {
    return null;
  }
}

// ── CSV PARSER ─────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z]/g, ""));
  const nameIdx = headers.findIndex((h) => h.includes("name"));
  const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("whatsapp") || h.includes("number") || h.includes("tel") || h.includes("mobile") || h.includes("cell"));
  if (nameIdx === -1 && phoneIdx === -1) return [];
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    return {
      name: nameIdx >= 0 ? cols[nameIdx] || "" : "",
      whatsapp: phoneIdx >= 0 ? formatPhone(cols[phoneIdx] || "") : "",
    };
  }).filter((r) => r.name || r.whatsapp);
}

// ── EMPTY STATE ────────────────────────────────────────────
function EmptyCustomers({ onAdd, onImportPhone, onImportCSV, fileRef }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <div style={{ fontSize: "44px", marginBottom: "14px" }}>👥</div>
      <h3 style={{ fontSize: "20px", fontWeight: 800, color: DARK, marginBottom: "8px" }}>No customers yet</h3>
      <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "32px", maxWidth: "340px", margin: "0 auto 32px" }}>
        Add customers manually, import from your phone contacts, or upload a CSV.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "280px", margin: "0 auto" }}>
        <button onClick={onAdd}
          style={{ backgroundColor: DARK, color: LIME, border: "none", borderRadius: "12px", padding: "13px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
          + Add customer
        </button>
        {CONTACT_PICKER_SUPPORTED && (
          <button onClick={onImportPhone}
            style={{ backgroundColor: "#fff", color: DARK, border: "1.5px solid #e0e0e0", borderRadius: "12px", padding: "13px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
            📱 Import from phone contacts
          </button>
        )}
        <button onClick={() => fileRef.current?.click()}
          style={{ backgroundColor: "#fff", color: DARK, border: "1.5px solid #e0e0e0", borderRadius: "12px", padding: "13px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
          📂 Import CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }}
          onChange={onImportCSV} />
      </div>
    </div>
  );
}

// ── CUSTOMER FORM (add / edit) ─────────────────────────────
function CustomerForm({ initial = {}, onSave, onCancel, saving, categories }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    whatsapp: initial.whatsapp || "",
    area: initial.area || "",
    service: initial.service || "",
    notes: initial.notes || "",
  });
  function upd(k, v) { setForm((p) => ({ ...p, [k]: v })); }
  const valid = form.name.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <label style={labelStyle}>Name *</label>
        <input style={inputStyle} placeholder="Customer name" value={form.name}
          onChange={(e) => upd("name", e.target.value)} autoFocus />
      </div>
      <div>
        <label style={labelStyle}>WhatsApp number</label>
        <input style={inputStyle} placeholder="+27 82 000 0000" value={form.whatsapp}
          onChange={(e) => upd("whatsapp", e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Area / Neighbourhood</label>
        <input style={inputStyle} placeholder="e.g. Soweto, Sandton" value={form.area}
          onChange={(e) => upd("area", e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Service / Category</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {(categories || []).concat(["Other"]).map((cat) => (
            <button key={cat} onClick={() => upd("service", form.service === cat ? "" : cat)}
              style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "1.5px solid", background: form.service === cat ? DARK : "#fff", color: form.service === cat ? LIME : "#555", borderColor: form.service === cat ? DARK : "#e0e0e0" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={labelStyle}>Notes / Tags</label>
        <textarea style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }}
          placeholder="Any extra notes, allergies, preferences…"
          value={form.notes} onChange={(e) => upd("notes", e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => onSave(form)} disabled={!valid || saving}
          style={{ flex: 1, backgroundColor: valid ? LIME : "#e0e0e0", color: valid ? DARK : "#aaa", border: "none", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: 800, cursor: valid ? "pointer" : "not-allowed" }}>
          {saving ? "Saving…" : "Save customer"}
        </button>
        <button onClick={onCancel}
          style={{ padding: "13px 18px", borderRadius: "12px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: "14px", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── LOG SALE MODAL ─────────────────────────────────────────
function LogSaleModal({ customer, onClose, onLogged }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleLog() {
    if (!amount || isNaN(parseFloat(amount))) return;
    setSaving(true);
    const val = parseFloat(amount);
    const { data } = await supabase
      .from("customers")
      .update({
        total_spent: (customer.total_spent || 0) + val,
        visit_count: (customer.visit_count || 0) + 1,
        last_contacted: new Date().toISOString(),
      })
      .eq("id", customer.id)
      .select()
      .single();
    if (data) onLogged(data);
    setSaving(false);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: DARK, marginBottom: "4px" }}>Log a sale</h3>
        <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "24px" }}>Recording a payment for <strong>{customer.name}</strong></p>
        <label style={labelStyle}>Amount (R)</label>
        <input style={{ ...inputStyle, fontSize: "24px", fontWeight: 800, marginBottom: "20px" }}
          type="number" placeholder="0.00" value={amount}
          onChange={(e) => setAmount(e.target.value)} autoFocus />
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleLog} disabled={!amount || saving}
            style={{ flex: 1, backgroundColor: amount ? LIME : "#e0e0e0", color: amount ? DARK : "#aaa", border: "none", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: 800, cursor: amount ? "pointer" : "not-allowed" }}>
            {saving ? "Saving…" : "Log sale"}
          </button>
          <button onClick={onClose}
            style={{ padding: "13px 18px", borderRadius: "12px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: "14px", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CUSTOMER CARD ──────────────────────────────────────────
function CustomerCard({ customer, onEdit, onDelete, onToggleVIP, onLogSale, onWhatsApp }) {
  const [expanded, setExpanded] = useState(false);

  const initials = customer.name
    .split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${customer.is_vip ? "#f0d000" : "#e8e8e4"}`, borderRadius: "16px", overflow: "hidden", transition: "border-color 0.15s" }}>
      {/* Main row */}
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
        onClick={() => setExpanded((x) => !x)}>
        {/* Avatar */}
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: customer.is_vip ? "#fef9c3" : "#f0f0ee", border: `2px solid ${customer.is_vip ? "#f0d000" : "#e0e0dc"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800, color: customer.is_vip ? "#7a5e00" : "#555", flexShrink: 0 }}>
          {customer.is_vip ? "⭐" : initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.name}</span>
            {customer.is_vip && <span style={{ fontSize: "10px", fontWeight: 700, color: "#7a5e00", background: "#fef9c3", border: "1px solid #f0d000", borderRadius: "6px", padding: "1px 6px", flexShrink: 0 }}>VIP</span>}
          </div>
          <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {customer.whatsapp && <span>📱 {customer.whatsapp}</span>}
            {customer.area && <span>📍 {customer.area}</span>}
            {customer.service && <span>🏷️ {customer.service}</span>}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {customer.total_spent > 0 && (
            <div style={{ fontSize: "15px", fontWeight: 800, color: DARK }}>R{customer.total_spent.toLocaleString()}</div>
          )}
          {customer.last_contacted && (
            <div style={{ fontSize: "11px", color: "#bbb", marginTop: "2px" }}>{timeAgo(customer.last_contacted)}</div>
          )}
        </div>

        <span style={{ fontSize: "12px", color: "#ccc", marginLeft: "4px" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded actions */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f5f5f5", padding: "14px 18px", background: "#fafafa" }}>
          {customer.notes && (
            <div style={{ fontSize: "13px", color: "#666", background: "#fff", border: "1px solid #eeeeea", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", lineHeight: 1.6 }}>
              {customer.notes}
            </div>
          )}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {customer.whatsapp && (
              <button onClick={() => onWhatsApp(customer)}
                style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "10px", border: "none", background: "#25d366", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                💬 WhatsApp
              </button>
            )}
            <button onClick={() => onLogSale(customer)}
              style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              💰 Log sale
            </button>
            <button onClick={() => onToggleVIP(customer)}
              style={{ padding: "8px 14px", borderRadius: "10px", border: `1.5px solid ${customer.is_vip ? "#f0d000" : "#e0e0e0"}`, background: customer.is_vip ? "#fef9c3" : "#fff", color: customer.is_vip ? "#7a5e00" : "#555", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              {customer.is_vip ? "★ VIP" : "☆ Mark VIP"}
            </button>
            <button onClick={() => onEdit(customer)}
              style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              ✏️ Edit
            </button>
            <button onClick={() => onDelete(customer)}
              style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #ffd0d0", background: "#fff5f5", color: "#cc3300", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              Delete
            </button>
          </div>

          {/* Stats row */}
          {(customer.visit_count > 0 || customer.total_spent > 0) && (
            <div style={{ display: "flex", gap: "16px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f0f0f0" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Visits</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: DARK }}>{customer.visit_count || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total spent</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: DARK }}>R{(customer.total_spent || 0).toLocaleString()}</div>
              </div>
              {customer.last_contacted && (
                <div>
                  <div style={{ fontSize: "11px", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Last seen</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: DARK }}>{timeAgo(customer.last_contacted)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── WHATSAPP MESSAGE MODAL ─────────────────────────────────
function WhatsAppModal({ customer, onClose }) {
  const TEMPLATES = [
    { label: "General enquiry", text: `Hi ${customer.name}! Just checking in — is there anything I can help you with?` },
    { label: "Follow-up", text: `Hi ${customer.name}! 👋 I wanted to follow up and see how everything went. Would love to have you back!` },
    { label: "Special offer", text: `Hi ${customer.name}! 🎉 I have a special offer just for you. Reply to find out more!` },
    { label: "Booking reminder", text: `Hi ${customer.name}! Just a reminder about your upcoming appointment. See you soon! 😊` },
  ];
  const [message, setMessage] = useState(TEMPLATES[0].text);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: DARK, marginBottom: "4px" }}>💬 WhatsApp {customer.name}</h3>
        <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "20px" }}>{customer.whatsapp}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
          {TEMPLATES.map((t) => (
            <button key={t.label} onClick={() => setMessage(t.text)}
              style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "1.5px solid", background: message === t.text ? DARK : "#fff", color: message === t.text ? LIME : "#555", borderColor: message === t.text ? DARK : "#e0e0e0" }}>
              {t.label}
            </button>
          ))}
        </div>

        <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical", marginBottom: "16px" }}
          value={message} onChange={(e) => setMessage(e.target.value)} />

        <div style={{ display: "flex", gap: "8px" }}>
          <a href={waLink(customer.whatsapp, message)} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: "block", backgroundColor: "#25d366", color: "#fff", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: 800, borderRadius: "12px", textDecoration: "none" }}>
            Open WhatsApp →
          </a>
          <button onClick={onClose}
            style={{ padding: "13px 18px", borderRadius: "12px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: "14px", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── IMPORT PREVIEW MODAL ───────────────────────────────────
function ImportPreviewModal({ contacts, onConfirm, onCancel, importing }) {
  const [selected, setSelected] = useState(() => new Set(contacts.map((_, i) => i)));

  function toggle(i) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const toImport = contacts.filter((_, i) => selected.has(i));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: DARK, marginBottom: "4px" }}>Import contacts</h3>
        <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "16px" }}>
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""} found — select which to import
        </p>

        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
          {contacts.map((c, i) => (
            <div key={i} onClick={() => toggle(i)}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "12px", border: `1.5px solid ${selected.has(i) ? LIME : "#e0e0e0"}`, background: selected.has(i) ? "#f7ffe0" : "#fff", cursor: "pointer" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${selected.has(i) ? LIME : "#ccc"}`, background: selected.has(i) ? LIME : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>
                {selected.has(i) ? "✓" : ""}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: DARK }}>{c.name || "—"}</div>
                {c.whatsapp && <div style={{ fontSize: "12px", color: "#aaa" }}>{c.whatsapp}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => onConfirm(toImport)} disabled={toImport.length === 0 || importing}
            style={{ flex: 1, backgroundColor: toImport.length > 0 ? LIME : "#e0e0e0", color: toImport.length > 0 ? DARK : "#aaa", border: "none", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: 800, cursor: toImport.length > 0 ? "pointer" : "not-allowed" }}>
            {importing ? "Importing…" : `Import ${toImport.length} contact${toImport.length !== 1 ? "s" : ""}`}
          </button>
          <button onClick={onCancel}
            style={{ padding: "13px 18px", borderRadius: "12px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: "14px", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN CUSTOMERS TAB ─────────────────────────────────────
export function CustomersTab({ business }) {
  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterVIP, setFilterVIP]   = useState(false);
  const [sortBy, setSortBy]         = useState("recent"); // recent | spent | name
  const [mode, setMode]             = useState("list");   // list | add | edit
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [logSaleFor, setLogSaleFor] = useState(null);
  const [whatsAppFor, setWhatsAppFor] = useState(null);
  const [importContacts, setImportContacts] = useState(null);
  const [importing, setImporting]   = useState(false);
  const [toast, setToast]           = useState("");
  const csvRef = useRef();

  // categories from business type — reuse the same list from the main app
  const CATEGORIES = [
    "Nail Tech", "Hair & Extensions", "Barber", "Food Seller",
    "Fresh Produce", "Cleaning", "Tutoring", "Delivery",
    "Photography", "Catering", "Phone Repairs", "Other",
  ];

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  // ── LOAD ──────────────────────────────────────────────────
  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    supabase
      .from("customers")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setCustomers(data);
        setLoading(false);
      });
  }, [business?.id]);

  // ── COMPUTED LIST ──────────────────────────────────────────
  const filtered = customers
    .filter((c) => {
      const q = search.toLowerCase();
      const match = !q || c.name?.toLowerCase().includes(q) || c.whatsapp?.includes(q) || c.area?.toLowerCase().includes(q) || c.service?.toLowerCase().includes(q);
      return match && (!filterVIP || c.is_vip);
    })
    .sort((a, b) => {
      if (sortBy === "spent") return (b.total_spent || 0) - (a.total_spent || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // ── SAVE (add or edit) ────────────────────────────────────
  async function handleSave(form) {
    if (!business?.id) return;
    setSaving(true);
    if (editTarget) {
      const { data } = await supabase
        .from("customers")
        .update({ name: form.name.trim(), whatsapp: formatPhone(form.whatsapp), area: form.area.trim(), service: form.service, notes: form.notes.trim() })
        .eq("id", editTarget.id)
        .select()
        .single();
      if (data) setCustomers((prev) => prev.map((c) => c.id === data.id ? data : c));
      showToast("Customer updated ✓");
    } else {
      const { data } = await supabase
        .from("customers")
        .insert([{ business_id: business.id, name: form.name.trim(), whatsapp: formatPhone(form.whatsapp), area: form.area.trim(), service: form.service, notes: form.notes.trim() }])
        .select()
        .single();
      if (data) setCustomers((prev) => [data, ...prev]);
      showToast("Customer added ✓");
    }
    setSaving(false);
    setMode("list");
    setEditTarget(null);
  }

  // ── DELETE ─────────────────────────────────────────────────
  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.name}? This can't be undone.`)) return;
    await supabase.from("customers").delete().eq("id", customer.id);
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    showToast("Customer deleted");
  }

  // ── TOGGLE VIP ─────────────────────────────────────────────
  async function handleToggleVIP(customer) {
    const { data } = await supabase
      .from("customers")
      .update({ is_vip: !customer.is_vip })
      .eq("id", customer.id)
      .select()
      .single();
    if (data) setCustomers((prev) => prev.map((c) => c.id === data.id ? data : c));
  }

  // ── LOG SALE ───────────────────────────────────────────────
  function handleSaleLogged(updated) {
    setCustomers((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    showToast(`Sale logged — R${updated.total_spent.toLocaleString()} total for ${updated.name} ✓`);
  }

  // ── IMPORT FROM PHONE ──────────────────────────────────────
  async function handleImportPhone() {
    const picked = await pickFromContacts();
    if (!picked || picked.length === 0) {
      showToast("No contacts selected or not supported on this browser.");
      return;
    }
    setImportContacts(picked);
  }

  // ── IMPORT FROM CSV ────────────────────────────────────────
  async function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCSV(text);
    e.target.value = "";
    if (parsed.length === 0) {
      showToast("Could not read contacts from CSV. Make sure it has Name and Phone/WhatsApp columns.");
      return;
    }
    setImportContacts(parsed);
  }

  // ── CONFIRM IMPORT ─────────────────────────────────────────
  async function handleConfirmImport(contacts) {
    if (!business?.id || contacts.length === 0) return;
    setImporting(true);
    const rows = contacts.map((c) => ({
      business_id: business.id,
      name: c.name || "Unknown",
      whatsapp: c.whatsapp || "",
    }));
    const { data } = await supabase.from("customers").insert(rows).select();
    if (data) setCustomers((prev) => [...data, ...prev]);
    setImporting(false);
    setImportContacts(null);
    showToast(`${contacts.length} contact${contacts.length !== 1 ? "s" : ""} imported ✓`);
  }

  // ── STATS ──────────────────────────────────────────────────
  const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const vipCount   = customers.filter((c) => c.is_vip).length;

  // ── NO BUSINESS ────────────────────────────────────────────
  if (!business?.id) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🏪</div>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: DARK, marginBottom: "8px" }}>Set up your business first</h3>
        <p style={{ fontSize: "14px", color: "#aaa" }}>Complete your business setup before adding customers.</p>
      </div>
    );
  }

  // ── ADD / EDIT FORM VIEW ───────────────────────────────────
  if (mode === "add" || mode === "edit") {
    return (
      <div style={{ maxWidth: "520px" }}>
        <button onClick={() => { setMode("list"); setEditTarget(null); }}
          style={{ background: "transparent", border: "none", fontSize: "13px", color: "#aaa", cursor: "pointer", padding: "0 0 16px", display: "flex", alignItems: "center", gap: "6px" }}>
          ← Back to customers
        </button>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "24px" }}>
          {mode === "edit" ? `Edit ${editTarget?.name}` : "Add customer"}
        </h2>
        <CustomerForm
          initial={editTarget || {}}
          onSave={handleSave}
          onCancel={() => { setMode("list"); setEditTarget(null); }}
          saving={saving}
          categories={CATEGORIES}
        />
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "2px" }}>Customers</h2>
          <p style={{ fontSize: "13px", color: "#aaa" }}>{customers.length} total · R{totalSpent.toLocaleString()} earned · {vipCount} VIP</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {CONTACT_PICKER_SUPPORTED && (
            <button onClick={handleImportPhone}
              style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              📱 Import contacts
            </button>
          )}
          <button onClick={() => csvRef.current?.click()}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#555", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            📂 CSV
          </button>
          <input ref={csvRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleCSVUpload} />
          <button onClick={() => setMode("add")}
            style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: DARK, color: LIME, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            + Add customer
          </button>
        </div>
      </div>

      {/* Stats strip */}
      {customers.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Total customers", value: customers.length },
            { label: "VIP customers", value: vipCount },
            { label: "Total revenue", value: `R${totalSpent.toLocaleString()}` },
            { label: "Avg. spend", value: customers.length ? `R${Math.round(totalSpent / customers.filter((c) => c.total_spent > 0).length || 0).toLocaleString()}` : "—" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "14px", padding: "16px" }}>
              <div style={{ fontSize: "10px", color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: DARK }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter */}
      {customers.length > 0 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: "180px", padding: "10px 14px" }}
            placeholder="Search by name, number, area…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={() => setFilterVIP((x) => !x)}
            style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${filterVIP ? "#f0d000" : "#e0e0e0"}`, background: filterVIP ? "#fef9c3" : "#fff", color: filterVIP ? "#7a5e00" : "#555", fontSize: "13px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            {filterVIP ? "★ VIP only" : "☆ All"}
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e0e0e0", background: "#fff", fontSize: "13px", fontWeight: 600, color: "#555", cursor: "pointer", outline: "none" }}>
            <option value="recent">Most recent</option>
            <option value="spent">Top spenders</option>
            <option value="name">A → Z</option>
          </select>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px", color: "#aaa", fontSize: "14px" }}>Loading customers…</div>
      )}

      {/* Empty state */}
      {!loading && customers.length === 0 && (
        <EmptyCustomers
          onAdd={() => setMode("add")}
          onImportPhone={handleImportPhone}
          onImportCSV={handleCSVUpload}
          fileRef={csvRef}
        />
      )}

      {/* No results */}
      {!loading && customers.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px", color: "#aaa", fontSize: "14px" }}>
          No customers match your search.
        </div>
      )}

      {/* Customer list */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((c) => (
            <CustomerCard
              key={c.id}
              customer={c}
              onEdit={(cust) => { setEditTarget(cust); setMode("edit"); }}
              onDelete={handleDelete}
              onToggleVIP={handleToggleVIP}
              onLogSale={setLogSaleFor}
              onWhatsApp={setWhatsAppFor}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {logSaleFor && (
        <LogSaleModal
          customer={logSaleFor}
          onClose={() => setLogSaleFor(null)}
          onLogged={handleSaleLogged}
        />
      )}
      {whatsAppFor && (
        <WhatsAppModal
          customer={whatsAppFor}
          onClose={() => setWhatsAppFor(null)}
        />
      )}
      {importContacts && (
        <ImportPreviewModal
          contacts={importContacts}
          onConfirm={handleConfirmImport}
          onCancel={() => setImportContacts(null)}
          importing={importing}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)", background: DARK, color: LIME, padding: "12px 24px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, zIndex: 2000, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

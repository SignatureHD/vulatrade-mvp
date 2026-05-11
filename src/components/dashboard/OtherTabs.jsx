import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  CheckCircle,
  Circle,
  Copy,
  FileCheck,
  Globe,
  LogOut,
  MessageCircle,
  MessageSquareText,
  Pencil,
  ReceiptText,
  Share2,
  Sparkles,
  Star,
  Store,
  UserCircle,
  Users,
  WalletCards,
} from "lucide-react";
import { LIME, DARK, PAYMENT_METHODS, PAYMENT_STATUSES, inputStyle, labelStyle } from "../../constants";
import { TEMPLATES } from "../../data/demoData";
import { supabase } from "../../lib/supabase";
import { BusinessPagePreview } from "../BusinessPagePreview";

const MESSAGE_BUSINESS_TYPES = [
  "Hair / Beauty / Nails",
  "Cleaning Services",
  "Food / Catering",
  "Mobile Car Wash",
  "Clothing / Product Seller",
  "Repairs / Home Services",
  "General Business",
];

const MESSAGE_CATEGORIES = [
  "Daily menu",
  "Order confirmation",
  "Collection reminder",
  "Booking confirmation",
  "Booking reminder",
  "Payment reminder",
  "Thank you message",
  "Review request",
  "Weekend special",
  "Special offer",
  "Follow-up message",
  "New product/service announcement",
];

const CUSTOMER_MESSAGE_TAGS = [
  "All customers",
  "Regular",
  "VIP",
  "New Customer",
  "Interested",
  "Needs Follow-up",
  "Owes Money",
  "Booking Pending",
  "Promo List",
];

const MESSAGE_TEMPLATES = {
  "Hair / Beauty / Nails": {
    "Booking reminder": "Hi [Customer Name], just a reminder about your booking with [Business Name] on [Date] at [Time]. Please reply YES to confirm. Thank you.",
    "Review request": "Hi [Customer Name], thank you for supporting [Business Name]. If you loved your service, please send us a short review. It helps our business grow.",
  },
  "Cleaning Services": {
    "Booking confirmation": "Hi [Customer Name], your cleaning booking with [Business Name] is confirmed for [Date] at [Time]. Please make sure someone is available to open.",
  },
  "Food / Catering": {
    "Daily menu": "Hi [Customer Name], today's menu from [Business Name] is ready. Reply with your order before [Time].",
    "Order confirmation": "Hi [Customer Name], your order with [Business Name] is confirmed. Item: [Service/Product]. Amount: R[Amount]. Please send proof of payment to confirm your order.",
    "Collection reminder": "Hi [Customer Name], your order from [Business Name] will be ready for collection on [Date] at [Time].",
    "Payment reminder": "Hi [Customer Name], friendly reminder that R[Amount] is still outstanding for your [Service/Product] order from [Business Name].",
    "Thank you message": "Hi [Customer Name], thank you for ordering from [Business Name]. We appreciate your support.",
    "Review request": "Hi [Customer Name], thank you for supporting [Business Name]. If you enjoyed your food, please send us a short review.",
    "Weekend special": "Hi [Customer Name], [Business Name] has a weekend special on [Service/Product]. Reply here to order before [Time].",
    "New product/service announcement": "Hi [Customer Name], today's menu from [Business Name] is ready. Reply with your order before [Time].",
  },
  "Mobile Car Wash": {
    "Booking reminder": "Hi [Customer Name], your car wash booking with [Business Name] is confirmed for [Date] at [Time]. Please send your location pin before we arrive.",
  },
  "Clothing / Product Seller": {
    "Booking confirmation": "Hi [Customer Name], your order with [Business Name] is confirmed. Item: [Service/Product]. Amount: R[Amount]. Please send proof of payment to confirm your order.",
  },
  "General Business": {
    "Payment reminder": "Hi [Customer Name], friendly reminder that R[Amount] is still outstanding for [Service/Product]. Thank you, [Business Name].",
  },
};

const DEFAULT_MESSAGE_TEMPLATES = {
  "Daily menu": "Hi [Customer Name], today's menu from [Business Name] is ready. Reply with your order before [Time].",
  "Order confirmation": "Hi [Customer Name], your order with [Business Name] is confirmed. Item: [Service/Product]. Amount: R[Amount]. Please send proof of payment to confirm your order.",
  "Collection reminder": "Hi [Customer Name], your order with [Business Name] will be ready for collection on [Date] at [Time].",
  "Booking confirmation": "Hi [Customer Name], your booking with [Business Name] is confirmed for [Date] at [Time]. We look forward to helping you.",
  "Booking reminder": "Hi [Customer Name], this is a reminder about your booking with [Business Name] on [Date] at [Time]. Please reply YES to confirm.",
  "Payment reminder": "Hi [Customer Name], friendly reminder that R[Amount] is still outstanding for [Service/Product]. Thank you, [Business Name].",
  "Thank you message": "Hi [Customer Name], thank you for supporting [Business Name]. We appreciate your business.",
  "Review request": "Hi [Customer Name], thank you for supporting [Business Name]. If you were happy with your service, please send us a short review.",
  "Weekend special": "Hi [Customer Name], [Business Name] has a weekend special on [Service/Product]. Reply here if you are interested.",
  "Special offer": "Hi [Customer Name], [Business Name] has a special offer on [Service/Product]. Reply to this message if you are interested.",
  "Follow-up message": "Hi [Customer Name], just checking in from [Business Name]. Let us know if you still need help with [Service/Product].",
  "New product/service announcement": "Hi [Customer Name], [Business Name] now offers [Service/Product]. Reply here if you would like more details.",
};

function messageBusinessTypeFromCategory(category = "") {
  const c = category.toLowerCase();
  if (/(food|catering|fresh produce|kasi kitchen|kitchen|vendor)/.test(c)) return "Food / Catering";
  if (/(nail|hair|barber|beauty|extension)/.test(c)) return "Hair / Beauty / Nails";
  if (/clean/.test(c)) return "Cleaning Services";
  if (/car wash/.test(c)) return "Mobile Car Wash";
  if (/(clothing|retail|product seller|seller)/.test(c)) return "Clothing / Product Seller";
  if (/(repair|phone repair|home repair)/.test(c)) return "Repairs / Home Services";
  return "General Business";
}

function defaultCategoryForBusinessType(type) {
  if (type === "Food / Catering") return "Daily menu";
  if (type === "Clothing / Product Seller") return "Order confirmation";
  if (type === "Cleaning Services") return "Booking confirmation";
  if (type === "General Business") return "Payment reminder";
  return "Booking reminder";
}

const STANDARD_EXPENSE_CATEGORIES = [
  "Stock",
  "Airtime",
  "Data",
  "Transport",
  "Rent",
  "Supplies",
  "Packaging",
  "Electricity",
  "Equipment",
  "Marketing",
  "Repairs",
  "Other",
];

const EXPENSE_PAYMENT_METHODS = ["Cash", "EFT", "Card", "Yoco", "iKhokha", "PayShap", "Other"];

const EXPENSE_SUGGESTIONS = {
  "Food / Catering": ["Ingredients", "Packaging", "Gas / Electricity", "Transport", "Delivery costs", "Cooking supplies", "Cleaning supplies", "Market stock", "Airtime / Data"],
  "Hair / Beauty / Nails": ["Hair products", "Nail products", "Tools", "Chair rental", "Towels / consumables", "Transport", "Airtime / Data", "Marketing", "Cleaning supplies"],
  "Cleaning Services": ["Cleaning chemicals", "Gloves / PPE", "Transport", "Equipment", "Airtime / Data", "Staff wages", "Uniforms", "Marketing"],
  "Mobile Car Wash": ["Water", "Soap / chemicals", "Cloths / sponges", "Transport", "Equipment", "Airtime / Data", "Marketing"],
  "Clothing / Product Seller": ["Stock", "Packaging", "Courier / delivery", "Transport", "Airtime / Data", "Marketing", "Returns / exchanges"],
  "Repairs / Home Services": ["Parts", "Tools", "Transport", "Airtime / Data", "Equipment", "Marketing", "Call-out costs"],
  "General Business": ["Stock", "Airtime", "Data", "Transport", "Supplies", "Marketing", "Rent", "Other"],
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getMessageTemplate(businessType, category) {
  return MESSAGE_TEMPLATES[businessType]?.[category] || DEFAULT_MESSAGE_TEMPLATES[category] || DEFAULT_MESSAGE_TEMPLATES["Follow-up message"];
}

function normalizeSouthAfricanPhone(value) {
  const cleaned = (value || "").replace(/[\s().-]/g, "");
  if (!cleaned) return { ok:true, phone:"" };
  if (/^0[6-8][0-9]{8}$/.test(cleaned)) return { ok:true, phone:`+27${cleaned.slice(1)}` };
  if (/^\+27[6-8][0-9]{8}$/.test(cleaned)) return { ok:true, phone:cleaned };
  if (/^27[6-8][0-9]{8}$/.test(cleaned)) return { ok:true, phone:`+${cleaned}` };
  return { ok:false, phone:"" };
}

function fillMessageTemplate(template, fields) {
  return template
    .replaceAll("[Customer Name]", fields.customerName || "customer")
    .replaceAll("[Business Name]", fields.businessName || "your business")
    .replaceAll("[Date]", fields.date || "the agreed date")
    .replaceAll("[Time]", fields.time || "the agreed time")
    .replaceAll("[Amount]", fields.amount || "0")
    .replaceAll("[Service/Product]", fields.item || "your service or product");
}

function messageTagFromCustomer(customer) {
  const status = (customer?.status || "").toLowerCase();
  if (status === "vip") return "VIP";
  if (status === "regular") return "Regular";
  if (status === "new") return "New Customer";
  if (status === "lead" || (customer?.interested_in || []).length > 0) return "Interested";
  return "All customers";
}

// ── TEMPLATES TAB ──────────────────────────────────────────
export function TemplatesTab({ business, setTab, setPrefilledTemplate }) {
  const [selected, setSelected] = useState(null);

  function handleUse(template) {
    if (business?.name) {
      const ok = window.confirm(`You already have a business set up (${business.name}). This template will pre-fill your Setup form. Continue?`);
      if (!ok) return;
    }
    setPrefilledTemplate(template);
    setTab("Setup");
  }

  return (
    <div>
      <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"6px" }}>Business Templates</h2>
      <p style={{ fontSize:"14px", color:"#888", marginBottom:"28px" }}>Pick your business type and launch in minutes.</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:"16px" }}>
        {TEMPLATES.map((t) => (
          <div key={t.id} onClick={() => setSelected(selected===t.id ? null : t.id)}
            style={{ background:selected===t.id?DARK:"#fff", border:`1.5px solid ${selected===t.id?DARK:"#eeeeea"}`, borderRadius:"20px", padding:"24px", cursor:"pointer" }}>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>{t.icon}</div>
            <div style={{ fontSize:"17px", fontWeight:800, color:selected===t.id?"#fff":DARK, marginBottom:"6px" }}>{t.name}</div>
            <div style={{ fontSize:"13px", color:selected===t.id?"#aaa":"#888", lineHeight:1.6, marginBottom:"16px" }}>{t.description}</div>
            {selected===t.id && (
              <div style={{ marginBottom:"16px" }}>
                <div style={{ fontSize:"11px", fontWeight:700, color:LIME, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" }}>Starter products</div>
                {t.products.map((p) => (
                  <div key={p.name} style={{ fontSize:"12px", color:"#ccc", marginBottom:"4px" }}>{p.icon} {p.name} — R{p.price}</div>
                ))}
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); handleUse(t); }}
              style={{ backgroundColor:selected===t.id?LIME:DARK, color:selected===t.id?"#fff":"#fff", border:"none", borderRadius:"10px", padding:"10px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer", width:"100%" }}>
              Use this template →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PAGE TAB ───────────────────────────────────────────────
export function PageTab({ business, products, logoUrl }) {
  if (!business?.name) {
    return (
      <div style={{ textAlign:"center", padding:"80px 24px" }}>
        <div style={{ fontSize:"40px", marginBottom:"16px" }}>📄</div>
        <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>No page yet</h3>
        <p style={{ fontSize:"14px", color:"#aaa" }}>Complete your business setup first, then your page will appear here.</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/b/${business.slug}`;

  async function copyShareLink() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
      return;
    }
    window.prompt("Copy your business page link:", shareUrl);
  }

  async function shareBusinessPage() {
    try {
      if (navigator.share) {
        await navigator.share({ title: business.name, text: `View ${business.name} on VulaTrade`, url: shareUrl });
        return;
      }
      await copyShareLink();
    } catch (err) {
      if (err?.name !== "AbortError") await copyShareLink();
    }
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Your Business Page</h2>
          <p style={{ fontSize:"13px", color:"#888" }}>This is what your customers see when you share your link.</p>
        </div>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"flex-end" }}>
          <button onClick={shareBusinessPage}
            style={{ backgroundColor:"#ea4c89", color:"#fff", border:"none", borderRadius:"10px", padding:"10px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:"8px" }}>
            <Share2 size={16} strokeWidth={2.2} />
            Share
          </button>
          <button onClick={copyShareLink}
            style={{ background:"#fff", color:"#555", border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"10px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:"8px" }}>
            <Copy size={16} strokeWidth={2.2} />
            Copy link
          </button>
        </div>
      </div>
      <div style={{ background:"#eeeeea", borderRadius:"12px", padding:"10px 14px", fontSize:"13px", color:"#555", marginBottom:"24px", display:"flex", alignItems:"center", gap:"8px" }}>
        <Globe size={17} strokeWidth={2.2} color="#ea4c89" /> <span style={{ fontWeight:600 }}>{shareUrl}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"10px", marginBottom:"24px" }}>
        {[
          { icon:Globe, label:"Public page", sub:"Share your VulaTrade link" },
          { icon:MessageCircle, label:"WhatsApp enquiry", sub:"Customers can message you" },
          { icon:Pencil, label:"Edit page", sub:"Update details in Setup" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ width:"38px", height:"38px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon size={18} strokeWidth={2.2} color="#ea4c89" />
              </span>
              <span>
                <span style={{ display:"block", fontSize:"13px", fontWeight:800, color:DARK }}>{item.label}</span>
                <span style={{ display:"block", fontSize:"11px", color:"#888", marginTop:"2px" }}>{item.sub}</span>
              </span>
            </div>
          );
        })}
      </div>
      <BusinessPagePreview
        form={{ name:business.name, category:business.category, area:business.area, description:business.description, whatsapp:business.whatsapp, bgColour:business.theme||"#202021", icon:business.background_style||"⭐", font:business.font||"Inter" }}
        products={products} logoUrl={logoUrl} isFullPage={false}
      />
    </div>
  );
}

function PaymentForm({ business, customers, onSaved }) {
  const [form, setForm] = useState({
    customer_id: "",
    amount: "",
    status: "Paid",
    method: "Cash",
    reference: "",
  });
  const [saving, setSaving] = useState(false);

  function upd(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSave() {
    const amount = parseFloat(form.amount);
    if (!business?.id || !form.customer_id || !amount) return;
    setSaving(true);

    const { data: payment, error: paymentError } = await supabase.from("payments")
      .insert([{
        business_id: business.id,
        customer_id: form.customer_id,
        amount,
        status: form.status,
        method: form.method,
        reference: form.reference.trim() || null,
      }])
      .select()
      .single();

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      alert("Payment could not be saved. Please try again.");
      setSaving(false);
      return;
    }

    const customer = customers.find((c) => c.id === form.customer_id);
    if (customer) {
      const paidAmount = form.status === "Unpaid" ? 0 : amount;
      const { data: updatedCustomer } = await supabase.from("customers").update({
        total_spent: (customer.total_spent || 0) + paidAmount,
        visit_count: (customer.visit_count || 0) + (form.status === "Unpaid" ? 0 : 1),
        last_contacted: new Date().toISOString(),
        status: customer.status === "lead" ? "new" : customer.status,
      }).eq("id", customer.id).select().single();
      if (updatedCustomer) {
        onSaved(payment, updatedCustomer);
        setForm({ customer_id:"", amount:"", status:"Paid", method:"Cash", reference:"" });
        setSaving(false);
        return;
      }
    }

    setForm({ customer_id:"", amount:"", status:"Paid", method:"Cash", reference:"" });
    setSaving(false);
    onSaved(payment);
  }

  const valid = form.customer_id && parseFloat(form.amount) > 0;

  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px", marginBottom:"20px" }}>
      <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"16px" }}>Add Sale</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"12px", marginBottom:"14px" }}>
        <div>
          <label style={labelStyle}>Customer</label>
          <select style={{ ...inputStyle, cursor:"pointer" }} value={form.customer_id} onChange={(e) => upd("customer_id", e.target.value)}>
            <option value="">Select customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Amount (R)</label>
          <input style={inputStyle} type="number" placeholder="0" value={form.amount} onChange={(e) => upd("amount", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, cursor:"pointer" }} value={form.status} onChange={(e) => upd("status", e.target.value)}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Method</label>
          <select style={{ ...inputStyle, cursor:"pointer" }} value={form.method} onChange={(e) => upd("method", e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display:"flex", gap:"10px", alignItems:"flex-end", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:"220px" }}>
          <label style={labelStyle}>Reference / note</label>
          <input style={inputStyle} placeholder="Optional" value={form.reference} onChange={(e) => upd("reference", e.target.value)} />
        </div>
        <button onClick={handleSave} disabled={!valid || saving}
          style={{ backgroundColor:valid ? LIME : "#e0e0e0", color:valid ? "#fff" : "#aaa", border:"none", borderRadius:"12px", padding:"13px 20px", fontSize:"14px", fontWeight:800, cursor:valid ? "pointer" : "not-allowed" }}>
          {saving ? "Saving…" : "Save sale"}
        </button>
      </div>
    </div>
  );
}

export function SalesTab({ business }) {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    Promise.all([
      supabase.from("payments").select("*").eq("business_id", business.id).order("created_at", { ascending:false }),
      supabase.from("customers").select("id,name,status,total_spent,visit_count").eq("business_id", business.id).order("name"),
    ]).then(([{ data: pay, error: e1 }, { data: cust, error: e2 }]) => {
      if (e1) console.error("Load payments:", e1);
      if (e2) console.error("Load payment customers:", e2);
      if (pay) setPayments(pay);
      if (cust) setCustomers(cust);
      setLoading(false);
    });
  }, [business?.id]);

  function customerName(id) {
    return customers.find((c) => c.id === id)?.name || "Unknown customer";
  }

  function handleSaved(payment, updatedCustomer) {
    setPayments((prev) => [payment, ...prev]);
    if (updatedCustomer) setCustomers((prev) => prev.map((c) => c.id === updatedCustomer.id ? updatedCustomer : c));
  }

  if (!business?.id) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:"40px", marginBottom:"16px" }}>🏪</div>
      <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>Set up your business first</h3>
      <p style={{ fontSize:"14px", color:"#aaa" }}>Complete your business setup before recording sales.</p>
    </div>
  );

  const revenuePayments = payments.filter((p) => p.status === "Paid" || p.status === "Deposit paid");
  const totalRevenue = revenuePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const unpaid = payments.filter((p) => p.status === "Unpaid");
  const deposits = payments.filter((p) => p.status === "Deposit paid");

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Sales</h2>
        <p style={{ fontSize:"13px", color:"#aaa" }}>Revenue, payments, deposits and unpaid sales.</p>
      </div>

      {customers.length > 0 && <PaymentForm business={business} customers={customers} onSaved={handleSaved} />}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Revenue", value:`R${totalRevenue.toLocaleString()}` },
          { label:"Payments", value:payments.length },
          { label:"Deposits", value:deposits.length },
          { label:"Unpaid", value:unpaid.length },
        ].map((s) => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px" }}>
            <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{s.label}</div>
            <div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{s.value}</div>
          </div>
        ))}
      </div>

      {unpaid.length > 0 && (
        <div style={{ background:"#fff8ee", border:"1px solid #f0d080", borderRadius:"16px", padding:"16px", marginBottom:"20px" }}>
          <div style={{ fontSize:"14px", fontWeight:800, color:DARK, marginBottom:"10px" }}>Unpaid / follow-up</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {unpaid.slice(0, 5).map((p) => (
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", gap:"12px", fontSize:"13px", color:"#6b5200" }}>
                <span>{customerName(p.customer_id)}{p.reference ? ` · ${p.reference}` : ""}</span>
                <strong>R{(p.amount || 0).toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
        <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"16px" }}>Recent sales</div>
        {loading ? (
          <div style={{ textAlign:"center", padding:"40px", color:"#aaa" }}>Loading…</div>
        ) : payments.length === 0 ? (
          <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"24px", textAlign:"center", color:"#888", fontSize:"13px" }}>
            No sales recorded yet. Start building your business file by adding today's sales.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {payments.map((p) => (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", border:"1px solid #eeeeea", borderRadius:"12px" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"14px", fontWeight:800, color:DARK }}>{customerName(p.customer_id)}</div>
                  <div style={{ fontSize:"12px", color:"#aaa" }}>
                    {p.method || "Other"} · {p.status || "Paid"}{p.reference ? ` · ${p.reference}` : ""}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>R{(p.amount || 0).toLocaleString()}</div>
                  {p.created_at && <div style={{ fontSize:"11px", color:"#bbb" }}>{new Date(p.created_at).toLocaleDateString("en-ZA", { day:"numeric", month:"short" })}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExpenseFormModal({ initialCategory, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: initialCategory || "",
    date: todayInputValue(),
    method: "Cash",
    notes: "",
  });
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function save() {
    const amount = parseFloat(form.amount);
    if (!form.name.trim()) { setError("Expense name is required."); return; }
    if (!amount || amount <= 0) { setError("Amount must be greater than 0."); return; }
    if (!form.category.trim()) { setError("Category is required."); return; }
    onSave({ ...form, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), amount, created_at: new Date().toISOString() });
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(32,32,33,0.48)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"18px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"22px", width:"100%", maxWidth:"520px", boxShadow:"0 24px 70px rgba(32,32,33,0.25)", maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", marginBottom:"18px" }}>
          <div>
            <h3 style={{ fontSize:"19px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Add Expense</h3>
            <p style={{ fontSize:"12px", color:"#888" }}>Record a business cost. This is saved locally for now.</p>
          </div>
          <button onClick={onClose} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #eeeeea", background:"#fff", color:"#767b81", fontSize:"18px", cursor:"pointer" }}>×</button>
        </div>
        {error && <div style={{ background:"#fff5f5", border:"1px solid #ffd0d0", color:"#cc3300", borderRadius:"12px", padding:"10px 12px", fontSize:"13px", marginBottom:"14px" }}>{error}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"12px", marginBottom:"14px" }}>
          <div>
            <label style={labelStyle}>Expense name</label>
            <input style={inputStyle} placeholder="e.g. Chicken stock" value={form.name} onChange={(e) => update("name", e.target.value)} autoFocus />
          </div>
          <div>
            <label style={labelStyle}>Amount (R)</label>
            <input style={inputStyle} type="number" min="0" placeholder="0" value={form.amount} onChange={(e) => update("amount", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <input style={inputStyle} placeholder="e.g. Ingredients" value={form.category} onChange={(e) => update("category", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input style={inputStyle} type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Payment method</label>
            <select style={{ ...inputStyle, cursor:"pointer" }} value={form.method} onChange={(e) => update("method", e.target.value)}>
              {EXPENSE_PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom:"16px" }}>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...inputStyle, minHeight:"78px", resize:"vertical" }} placeholder="Optional details" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          <button onClick={save} style={{ flex:"1 1 180px", background:"#ea4c89", color:"#fff", border:"none", borderRadius:"12px", padding:"13px 18px", fontSize:"14px", fontWeight:900, cursor:"pointer" }}>Save Expense</button>
          <button onClick={onClose} style={{ flex:"1 1 120px", background:"#fff", color:"#555", border:"1.5px solid #e0e0e0", borderRadius:"12px", padding:"13px 18px", fontSize:"14px", fontWeight:800, cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function ExpensesTab({ business }) {
  const businessType = messageBusinessTypeFromCategory(business?.category);
  const suggestedCategories = EXPENSE_SUGGESTIONS[businessType] || EXPENSE_SUGGESTIONS["General Business"];
  const [expenses, setExpenses] = useState([]);
  const [modalCategory, setModalCategory] = useState(null);
  const [toast, setToast] = useState("");
  const categories = Array.from(new Set([...suggestedCategories, ...STANDARD_EXPENSE_CATEGORIES]));
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  function openForm(category = "") {
    setModalCategory(category);
  }

  function handleSaveExpense(expense) {
    setExpenses((prev) => [expense, ...prev]);
    setModalCategory(null);
    setToast("Expense saved. Your costs are easier to track now.");
    setTimeout(() => setToast(""), 2800);
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <div>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Expenses</h2>
          <p style={{ fontSize:"13px", color:"#aaa" }}>Costs going out: stock, airtime, data, transport, rent and supplies.</p>
        </div>
        <button onClick={() => openForm()} style={{ backgroundColor:"#ea4c89", color:"#fff", border:"none", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>
          Add Expense
        </button>
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"18px", padding:"18px", marginBottom:"20px", display:"flex", alignItems:"flex-start", gap:"14px" }}>
        <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <FileCheck size={19} strokeWidth={2.2} color="#ea4c89" />
        </span>
        <div>
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Expenses help show what your business really costs.</div>
          <div style={{ fontSize:"13px", color:"#777", lineHeight:1.55 }}>Tracking expenses helps you understand profit and strengthens your Business File over time.</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Total expenses", value:`R${totalExpenses.toLocaleString()}` },
          { label:"Categories", value:categories.length },
          { label:"Recent expenses", value:expenses.length },
        ].map((s) => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px" }}>
            <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{s.label}</div>
            <div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px", marginBottom:"20px" }}>
        <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Suggested for your business</div>
        <div style={{ fontSize:"12px", color:"#888", marginBottom:"14px" }}>{businessType} expense ideas. Tap one to quick add.</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
          {suggestedCategories.map((category) => (
            <button key={category} onClick={() => openForm(category)}
              style={{ border:"1.5px solid #f8b8d2", background:"#fff5f9", color:"#d93f7b", borderRadius:"999px", padding:"9px 13px", fontSize:"12px", fontWeight:800, cursor:"pointer" }}>
              {category}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"10px" }}>All categories</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {categories.map((category) => (
          <button key={category} onClick={() => openForm(category)} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", textAlign:"left" }}>
            <span style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <WalletCards size={17} strokeWidth={2.2} color="#ea4c89" />
            </span>
            <span style={{ fontSize:"13px", fontWeight:800, color:DARK }}>{category}</span>
          </button>
        ))}
      </div>
      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"22px" }}>
        <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"10px" }}>Recent expenses</div>
        {expenses.length === 0 ? (
          <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"24px", textAlign:"center", color:"#888", fontSize:"13px" }}>
            No expenses recorded yet. Add stock, transport, airtime or supplies to understand what your business really costs.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {expenses.map((expense) => (
              <div key={expense.id} style={{ display:"flex", alignItems:"center", gap:"12px", border:"1px solid #eeeeea", borderRadius:"14px", padding:"13px 14px" }}>
                <span style={{ width:"38px", height:"38px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <WalletCards size={17} strokeWidth={2.2} color="#ea4c89" />
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>{expense.name}</div>
                  <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>{expense.category} · {expense.method} · {new Date(expense.date + "T00:00:00").toLocaleDateString("en-ZA", { day:"numeric", month:"short" })}</div>
                  {expense.notes && <div style={{ fontSize:"12px", color:"#aaa", marginTop:"2px" }}>{expense.notes}</div>}
                </div>
                <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>R{expense.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalCategory !== null && <ExpenseFormModal initialCategory={modalCategory} onSave={handleSaveExpense} onClose={() => setModalCategory(null)} />}
      {toast && (
        <div style={{ position:"fixed", bottom:"86px", left:"50%", transform:"translateX(-50%)", background:DARK, color:"#fff", padding:"12px 20px", borderRadius:"999px", fontSize:"13px", fontWeight:800, zIndex:2000, boxShadow:"0 10px 30px rgba(32,32,33,0.2)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

export function ReviewsTab() {
  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Reviews</h2>
        <p style={{ fontSize:"13px", color:"#aaa" }}>Customer feedback helps your public page look trustworthy.</p>
      </div>
      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
          <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Star size={19} strokeWidth={2.2} color="#ea4c89" />
          </span>
          <div>
            <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>No reviews yet</div>
            <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>Ask happy customers to share a short review after a job or sale.</div>
          </div>
        </div>
        <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"18px", fontSize:"13px", color:"#666", lineHeight:1.6 }}>
          Reviews will support your public page and strengthen your Business File as customers start confirming your work.
        </div>
      </div>
    </div>
  );
}

export function MessagesTab({ business }) {
  const initialBusinessType = messageBusinessTypeFromCategory(business?.category);
  const [businessType, setBusinessType] = useState(initialBusinessType);
  const [category, setCategory] = useState(() => defaultCategoryForBusinessType(initialBusinessType));
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerTag, setCustomerTag] = useState("All customers");
  const [fields, setFields] = useState({
    customerName: "",
    businessName: business?.name || "",
    date: "",
    time: "",
    amount: "",
    item: "",
    phone: "",
  });
  const [customMessage, setCustomMessage] = useState(() => getMessageTemplate("Hair / Beauty / Nails", "Booking reminder"));
  const [phoneError, setPhoneError] = useState("");
  const [copied, setCopied] = useState(false);
  const appliedQueryCustomer = useRef(false);

  useEffect(() => {
    const matched = messageBusinessTypeFromCategory(business?.category);
    setBusinessType(matched);
    setCategory(defaultCategoryForBusinessType(matched));
  }, [business?.category]);

  useEffect(() => {
    if (!business?.id) { setLoadingCustomers(false); return; }
    setLoadingCustomers(true);
    supabase.from("customers")
      .select("id,name,whatsapp,status,total_spent,visit_count,notes,interested_in")
      .eq("business_id", business.id)
      .order("name")
      .then(({ data, error }) => {
        if (error) console.error("Load message customers:", error);
        setCustomers(data || []);
        setLoadingCustomers(false);
      });
  }, [business?.id]);

  useEffect(() => {
    if (appliedQueryCustomer.current || customers.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("customerId");
    if (!customerId) return;
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    appliedQueryCustomer.current = true;
    setSelectedCustomerId(customer.id);
    setCustomerTag(messageTagFromCustomer(customer));
    setFields((prev) => ({
      ...prev,
      customerName: customer.name || prev.customerName,
      phone: customer.whatsapp || prev.phone,
    }));
  }, [customers]);

  useEffect(() => {
    setFields((prev) => ({ ...prev, businessName: business?.name || prev.businessName }));
  }, [business?.name]);

  useEffect(() => {
    setCustomMessage(getMessageTemplate(businessType, category));
    setCopied(false);
  }, [businessType, category]);

  function updateField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (key === "phone") setPhoneError("");
  }

  function customerMatchesTag(customer) {
    const status = (customer.status || "").toLowerCase();
    if (customerTag === "All customers") return true;
    if (customerTag === "Regular") return status === "regular";
    if (customerTag === "VIP") return status === "vip";
    if (customerTag === "New Customer") return status === "new";
    if (customerTag === "Interested") return status === "lead" || (customer.interested_in || []).length > 0;
    return true;
  }

  const filteredCustomers = customers.filter((customer) => {
    const search = customerSearch.trim().toLowerCase();
    const matchesSearch = !search ||
      (customer.name || "").toLowerCase().includes(search) ||
      (customer.whatsapp || "").replace(/\s/g, "").includes(search.replace(/\s/g, ""));
    return matchesSearch && customerMatchesTag(customer);
  });

  const tagIsPlaceholder = !["All customers", "Regular", "VIP", "New Customer", "Interested"].includes(customerTag);

  function selectCustomer(customerId) {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    setFields((prev) => ({
      ...prev,
      customerName: customer.name || prev.customerName,
      phone: customer.whatsapp || prev.phone,
    }));
    setCustomerTag(messageTagFromCustomer(customer));
    setPhoneError("");
  }

  const finalMessage = fillMessageTemplate(customMessage, fields);

  async function copyMessage() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(finalMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      return;
    }
    window.prompt("Copy your message:", finalMessage);
  }

  function openWhatsApp() {
    const phone = normalizeSouthAfricanPhone(fields.phone);
    if (!phone.ok) {
      setPhoneError("Please enter a valid South African cellphone number.");
      return;
    }
    setPhoneError("");
    const encoded = encodeURIComponent(finalMessage);
    const url = phone.phone
      ? `https://wa.me/${phone.phone.replace("+", "")}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Messages</h2>
        <p style={{ fontSize:"13px", color:"#888" }}>Use ready-made templates to follow up, remind customers and look professional.</p>
      </div>

      <div style={{ background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"18px", padding:"16px", display:"flex", gap:"12px", alignItems:"flex-start", marginBottom:"18px" }}>
        <span style={{ width:"38px", height:"38px", borderRadius:"50%", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <MessageCircle size={18} strokeWidth={2.2} color="#ea4c89" />
        </span>
        <div>
          <div style={{ fontSize:"13px", fontWeight:900, color:DARK, marginBottom:"3px" }}>Manual messaging MVP</div>
          <div style={{ fontSize:"12px", color:"#777", lineHeight:1.55 }}>
            VulaTrade does not send messages automatically yet. For now, choose a template, edit it, then copy it or open WhatsApp.
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:"16px" }}>
        <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px" }}>
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"14px" }}>Choose a template</div>
          <label style={labelStyle}>Business type</label>
          <select style={{ ...inputStyle, marginBottom:"14px" }} value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
            {MESSAGE_BUSINESS_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <label style={labelStyle}>Template category</label>
          <select style={{ ...inputStyle, marginBottom:"14px" }} value={category} onChange={(e) => setCategory(e.target.value)}>
            {MESSAGE_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <div style={{ height:"1px", background:"#eeeeea", margin:"4px 0 14px" }} />

          <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"6px" }}>Choose a customer</div>
          <div style={{ fontSize:"12px", color:"#888", lineHeight:1.5, marginBottom:"12px" }}>
            Choose a customer or prepare a message for a customer group.
          </div>

          <label style={labelStyle}>Customer tag/group</label>
          <select style={{ ...inputStyle, marginBottom: tagIsPlaceholder ? "6px" : "12px" }} value={customerTag} onChange={(e) => setCustomerTag(e.target.value)}>
            {CUSTOMER_MESSAGE_TAGS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {tagIsPlaceholder && (
            <div style={{ fontSize:"11px", color:"#888", lineHeight:1.45, marginBottom:"12px" }}>
              This group is a safe MVP placeholder for now. Select a customer below before sending.
            </div>
          )}

          {customers.length === 0 && !loadingCustomers ? (
            <div style={{ background:"#fbfbfb", border:"1px dashed #d4d7db", borderRadius:"14px", padding:"14px", fontSize:"13px", color:"#888", lineHeight:1.5, marginBottom:"14px" }}>
              No customers yet. Add customers first or type the details manually.
            </div>
          ) : (
            <>
              <label style={labelStyle}>Search customers</label>
              <input style={{ ...inputStyle, marginBottom:"10px" }} placeholder="Search by name or WhatsApp" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
              <select style={{ ...inputStyle, marginBottom:"14px" }} value={selectedCustomerId} onChange={(e) => selectCustomer(e.target.value)}>
                <option value="">{loadingCustomers ? "Loading customers..." : "Select a customer"}</option>
                {filteredCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}{customer.whatsapp ? ` · ${customer.whatsapp}` : ""}
                  </option>
                ))}
              </select>
              {customers.length > 0 && filteredCustomers.length === 0 && (
                <div style={{ fontSize:"12px", color:"#aaa", marginBottom:"14px" }}>No customers match this search or group.</div>
              )}
            </>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"10px" }}>
            <div>
              <label style={labelStyle}>Customer name</label>
              <input style={inputStyle} placeholder="e.g. Nomsa" value={fields.customerName} onChange={(e) => updateField("customerName", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Business name</label>
              <input style={inputStyle} placeholder="e.g. Wendy's Nails" value={fields.businessName} onChange={(e) => updateField("businessName", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input style={inputStyle} placeholder="e.g. Friday" value={fields.date} onChange={(e) => updateField("date", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input style={inputStyle} placeholder="e.g. 14:00" value={fields.time} onChange={(e) => updateField("time", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Amount</label>
              <input style={inputStyle} inputMode="numeric" placeholder="e.g. 250" value={fields.amount} onChange={(e) => updateField("amount", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Service/product</label>
              <input style={inputStyle} placeholder="e.g. Gel overlay" value={fields.item} onChange={(e) => updateField("item", e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
            <span style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <MessageSquareText size={19} strokeWidth={2.2} color="#ea4c89" />
            </span>
            <div>
              <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>Edit your message</div>
              <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>Placeholders update from the fields.</div>
            </div>
          </div>
          <textarea
            style={{ ...inputStyle, minHeight:"150px", resize:"vertical", lineHeight:1.55, marginBottom:"14px" }}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />

          <label style={labelStyle}>Customer WhatsApp number</label>
          <input style={{ ...inputStyle, borderColor: phoneError ? "#cc3300" : "#eeeeea", marginBottom: phoneError ? "6px" : "14px" }} placeholder="082 123 4567" value={fields.phone} onChange={(e) => updateField("phone", e.target.value)} />
          {phoneError && <div style={{ fontSize:"12px", color:"#cc3300", marginBottom:"14px" }}>{phoneError}</div>}

          <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", marginBottom:"14px" }}>
            <div style={{ fontSize:"11px", color:"#aaa", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" }}>Final message</div>
            <div style={{ fontSize:"13px", color:DARK, lineHeight:1.65, whiteSpace:"pre-wrap" }}>{finalMessage}</div>
          </div>

          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
            <button onClick={copyMessage} style={{ flex:"1 1 150px", background:"#ea4c89", color:"#fff", border:"none", borderRadius:"12px", padding:"12px 16px", fontSize:"13px", fontWeight:900, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
              <Copy size={16} strokeWidth={2.2} />
              {copied ? "Copied" : "Copy Message"}
            </button>
            <button onClick={openWhatsApp} style={{ flex:"1 1 150px", background:"#fff", color:"#ea4c89", border:"1.5px solid #f8b8d2", borderRadius:"12px", padding:"12px 16px", fontSize:"13px", fontWeight:900, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
              <MessageCircle size={16} strokeWidth={2.2} />
              Open WhatsApp
            </button>
          </div>

          <div style={{ marginTop:"14px", fontSize:"11px", color:"#888", lineHeight:1.5 }}>
            Only message customers who have agreed to receive updates from your business.
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessFileTab({ business, setTab }) {
  const [stats, setStats] = useState({ customers:0, payments:0, salesTotal:0, bookings:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    Promise.all([
      supabase.from("customers").select("id").eq("business_id", business.id),
      supabase.from("payments").select("amount,status").eq("business_id", business.id),
      supabase.from("bookings").select("id,status").eq("business_id", business.id),
    ]).then(([{ data: customers }, { data: payments }, { data: bookings }]) => {
      const revenue = (payments || [])
        .filter((p) => p.status === "Paid" || p.status === "Deposit paid")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      setStats({
        customers: customers?.length || 0,
        payments: payments?.length || 0,
        salesTotal: revenue,
        bookings: bookings?.filter((b) => b.status === "done").length || 0,
      });
      setLoading(false);
    });
  }, [business?.id]);

  const checklist = [
    { label:"Business profile created", done:Boolean(business?.name) },
    { label:"Public page ready", done:Boolean(business?.slug) },
    { label:"Customer activity recorded", done:stats.customers > 0 },
    { label:"Sales history started", done:stats.payments > 0 },
    { label:"Completed work tracked", done:stats.bookings > 0 },
  ];
  const doneCount = checklist.filter((item) => item.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Business File</h2>
        <p style={{ fontSize:"13px", color:"#aaa" }}>Your proof-of-trading record grows as you use VulaTrade.</p>
      </div>
      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"22px", padding:"22px", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"18px" }}>
          <span style={{ width:"48px", height:"48px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FileCheck size={22} strokeWidth={2.2} color="#ea4c89" />
          </span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>Proof of trading</div>
            <div style={{ fontSize:"12px", color:"#888", lineHeight:1.5, marginTop:"3px" }}>
              Better records may help you in future conversations with suppliers, funders, partners or landlords.
            </div>
          </div>
        </div>
        <div style={{ height:"10px", background:"#f5f5f5", borderRadius:"999px", overflow:"hidden", marginBottom:"10px" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"#ea4c89", borderRadius:"999px" }} />
        </div>
        <div style={{ fontSize:"12px", color:"#888", fontWeight:700 }}>{progress}% complete</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Sales history", value:`R${stats.salesTotal.toLocaleString()}`, icon:ReceiptText },
          { label:"Customer activity", value:stats.customers, icon:Users },
          { label:"Payment records", value:stats.payments, icon:WalletCards },
          { label:"Reviews", value:0, icon:Star },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"16px" }}>
              <Icon size={18} strokeWidth={2.2} color="#ea4c89" />
              <div style={{ fontSize:"22px", fontWeight:900, color:DARK, marginTop:"12px" }}>{loading ? "…" : s.value}</div>
              <div style={{ fontSize:"11px", color:"#888", fontWeight:700, marginTop:"4px" }}>{s.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
        <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"14px" }}>Progress checklist</div>
        <div style={{ display:"grid", gap:"10px", marginBottom:"18px" }}>
          {checklist.map((item) => {
            const Icon = item.done ? CheckCircle : Circle;
            return (
              <div key={item.label} style={{ display:"flex", alignItems:"center", gap:"10px", fontSize:"13px", fontWeight:700, color:item.done ? DARK : "#888" }}>
                <Icon size={19} strokeWidth={2.2} color={item.done ? "#ea4c89" : "#c6cbd1"} />
                {item.label}
              </div>
            );
          })}
        </div>
        <button onClick={() => setTab("Sales")} style={{ background:"#ea4c89", color:"#fff", border:"none", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>
          Record a sale
        </button>
      </div>
    </div>
  );
}

export function VukeTab() {
  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"22px", padding:"28px", maxWidth:"680px" }}>
      <span style={{ width:"48px", height:"48px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"16px" }}>
        <Store size={22} strokeWidth={2.2} color="#ea4c89" />
      </span>
      <h2 style={{ fontSize:"22px", fontWeight:900, color:DARK, marginBottom:"8px" }}>Vuke</h2>
      <p style={{ fontSize:"14px", color:"#666", lineHeight:1.7, marginBottom:"18px" }}>
        Vuke will help connect growing entrepreneurs to future supplier deals, support and growth opportunities.
      </p>
      <span style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"#fde8f1", color:"#d93f7b", border:"1px solid #f8b8d2", borderRadius:"999px", padding:"8px 12px", fontSize:"12px", fontWeight:800 }}>
        <Sparkles size={15} strokeWidth={2.2} />
        Coming soon
      </span>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, description, button, status, onClick, danger = false }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"18px", padding:"18px", display:"flex", alignItems:"flex-start", gap:"14px", boxShadow:"0 10px 28px rgba(15,23,42,0.04)" }}>
      <span style={{ width:"44px", height:"44px", borderRadius:"50%", background:danger ? "#fff5f5" : "#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={20} strokeWidth={2.2} color={danger ? "#cc3300" : "#ea4c89"} />
      </span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"5px" }}>{title}</div>
        <div style={{ fontSize:"13px", color:"#777", lineHeight:1.55, marginBottom:"14px" }}>{description}</div>
        {status ? (
          <span style={{ display:"inline-flex", border:"1px solid #f8b8d2", background:"#fde8f1", color:"#d93f7b", borderRadius:"999px", padding:"7px 10px", fontSize:"12px", fontWeight:800 }}>
            {status}
          </span>
        ) : (
          <button onClick={onClick}
            style={{ background:danger ? "#fff" : "#ea4c89", color:danger ? "#cc3300" : "#fff", border:danger ? "1.5px solid #ffd0d0" : "none", borderRadius:"12px", padding:"10px 14px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>
            {button}
          </button>
        )}
      </div>
    </div>
  );
}

export function SettingsTab({ onEditBusiness, onEditPublicPage, onSignOut }) {
  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Settings</h2>
        <p style={{ fontSize:"13px", color:"#888" }}>Manage your business, account and public page details.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:"14px" }}>
        <SettingsCard
          icon={Building2}
          title="Business details"
          description="Update your business name, location, category and contact details."
          button="Edit business details"
          onClick={onEditBusiness}
        />
        <SettingsCard
          icon={UserCircle}
          title="Account details"
          description="Manage your login details and account information."
          button="Edit account"
          onClick={() => alert("Account editing is coming soon.")}
        />
        <SettingsCard
          icon={Globe}
          title="Public page settings"
          description="Control what customers see when they visit your VulaTrade page."
          button="Edit public page"
          onClick={onEditPublicPage}
        />
        <SettingsCard
          icon={Bell}
          title="Notifications"
          description="Choose how you want to receive customer and business updates."
          status="Coming soon"
        />
        <SettingsCard
          icon={LogOut}
          title="Sign out"
          description="End your current VulaTrade session."
          button="Sign out"
          onClick={onSignOut}
          danger
        />
      </div>
    </div>
  );
}

// ── COMING SOON ────────────────────────────────────────────
export function ComingSoon({ tab, description = "This section is being built. Check back soon." }) {
  return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <span style={{ width:"56px", height:"56px", borderRadius:"50%", background:"#fde8f1", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:"16px" }}>
        <FileCheck size={24} strokeWidth={2.2} color="#ea4c89" />
      </span>
      <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>{tab} — Coming soon</h3>
      <p style={{ fontSize:"14px", color:"#aaa", maxWidth:"420px", margin:"0 auto", lineHeight:1.6 }}>{description}</p>
    </div>
  );
}

import React, { useEffect, useState } from "react";
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

export function ExpensesTab() {
  const categories = ["Stock", "Airtime", "Data", "Transport", "Rent", "Supplies", "Packaging"];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <div>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Expenses</h2>
          <p style={{ fontSize:"13px", color:"#aaa" }}>Costs going out: stock, airtime, data, transport, rent and supplies.</p>
        </div>
        <button style={{ backgroundColor:"#ea4c89", color:"#fff", border:"none", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>
          Add Expense
        </button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Total expenses", value:"R0" },
          { label:"Categories", value:categories.length },
          { label:"Recent expenses", value:0 },
        ].map((s) => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px" }}>
            <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{s.label}</div>
            <div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {categories.map((category) => (
          <div key={category} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <WalletCards size={17} strokeWidth={2.2} color="#ea4c89" />
            </span>
            <span style={{ fontSize:"13px", fontWeight:800, color:DARK }}>{category}</span>
          </div>
        ))}
      </div>
      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"22px" }}>
        <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"10px" }}>Recent expenses</div>
        <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"24px", textAlign:"center", color:"#888", fontSize:"13px" }}>
          No expenses recorded yet. Add stock, transport, airtime or supplies to understand what your business really costs.
        </div>
      </div>
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

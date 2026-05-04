import React, { useEffect, useState } from "react";
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
              style={{ backgroundColor:selected===t.id?LIME:DARK, color:selected===t.id?DARK:LIME, border:"none", borderRadius:"10px", padding:"10px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer", width:"100%" }}>
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

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Your Business Page</h2>
          <p style={{ fontSize:"13px", color:"#888" }}>This is what your customers see when you share your link.</p>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Link copied!"); }}
          style={{ backgroundColor:LIME, color:DARK, border:"none", borderRadius:"10px", padding:"10px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
          Copy share link
        </button>
      </div>
      <div style={{ background:"#e8e8e4", borderRadius:"12px", padding:"10px 14px", fontSize:"13px", color:"#555", marginBottom:"24px", display:"flex", alignItems:"center", gap:"8px" }}>
        🔗 <span style={{ fontWeight:600 }}>{shareUrl}</span>
      </div>
      <BusinessPagePreview
        form={{ name:business.name, category:business.category, area:business.area, description:business.description, whatsapp:business.whatsapp, bgColour:business.theme||"#0d0d0d", icon:business.background_style||"⭐", font:business.font||"Inter" }}
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
      <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"16px" }}>Log a payment</div>
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
          style={{ backgroundColor:valid ? LIME : "#e0e0e0", color:valid ? DARK : "#aaa", border:"none", borderRadius:"12px", padding:"13px 20px", fontSize:"14px", fontWeight:800, cursor:valid ? "pointer" : "not-allowed" }}>
          {saving ? "Saving…" : "Save payment"}
        </button>
      </div>
    </div>
  );
}

export function MoneyTab({ business }) {
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
      <p style={{ fontSize:"14px", color:"#aaa" }}>Complete your business setup before logging payments.</p>
    </div>
  );

  const revenuePayments = payments.filter((p) => p.status === "Paid" || p.status === "Deposit paid");
  const totalRevenue = revenuePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const unpaid = payments.filter((p) => p.status === "Unpaid");
  const deposits = payments.filter((p) => p.status === "Deposit paid");

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Money</h2>
        <p style={{ fontSize:"13px", color:"#aaa" }}>Payments, deposits and follow-ups.</p>
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
        <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"16px" }}>Recent payments</div>
        {loading ? (
          <div style={{ textAlign:"center", padding:"40px", color:"#aaa" }}>Loading…</div>
        ) : payments.length === 0 ? (
          <div style={{ background:"#f8f8f6", borderRadius:"14px", padding:"24px", textAlign:"center", color:"#888", fontSize:"13px" }}>
            No payments logged yet.
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

// ── COMING SOON ────────────────────────────────────────────
export function ComingSoon({ tab }) {
  return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:"40px", marginBottom:"16px" }}>🚧</div>
      <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>{tab} — Coming soon</h3>
      <p style={{ fontSize:"14px", color:"#aaa" }}>This section is being built. Check back soon.</p>
    </div>
  );
}

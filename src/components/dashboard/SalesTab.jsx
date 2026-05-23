import React, { useEffect, useMemo, useState } from "react";
import { DARK, LIME, PAYMENT_METHODS, PAYMENT_STATUSES, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";

function productLabel(product) {
  const price = Number(product?.price || 0);
  return `${product?.name || "Unnamed item"}${price > 0 ? ` — R${price.toLocaleString()}` : ""}`;
}

function PaymentForm({ business, customers, products = [], onSaved }) {
  const [form, setForm] = useState({
    customer_id: "",
    product_id: "",
    amount: "",
    status: "Paid",
    method: "Cash",
    reference: "",
  });
  const [saving, setSaving] = useState(false);

  function upd(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectProduct(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      setForm((prev) => ({ ...prev, product_id: "" }));
      return;
    }

    const price = Number(product.price || 0);
    setForm((prev) => ({
      ...prev,
      product_id: product.id,
      amount: price > 0 ? String(price) : prev.amount,
      reference: product.name || prev.reference,
    }));
  }

  async function handleSave() {
    const amount = parseFloat(form.amount);
    if (!business?.id || !form.customer_id || !amount) return;
    setSaving(true);

    const selectedProduct = products.find((item) => item.id === form.product_id);
    const reference = form.reference.trim() || selectedProduct?.name || null;

    const { data: payment, error: paymentError } = await supabase.from("payments")
      .insert([{
        business_id: business.id,
        customer_id: form.customer_id,
        amount,
        status: form.status,
        method: form.method,
        reference,
      }])
      .select()
      .single();

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      alert("Payment could not be saved. Please try again.");
      setSaving(false);
      return;
    }

    const customer = customers.find((item) => item.id === form.customer_id);
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
        setForm({ customer_id:"", product_id:"", amount:"", status:"Paid", method:"Cash", reference:"" });
        setSaving(false);
        return;
      }
    }

    setForm({ customer_id:"", product_id:"", amount:"", status:"Paid", method:"Cash", reference:"" });
    setSaving(false);
    onSaved(payment);
  }

  const valid = form.customer_id && parseFloat(form.amount) > 0;

  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px", marginBottom:"20px" }}>
      <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"6px" }}>Add Sale</div>
      <div style={{ fontSize:"12px", color:"#888", lineHeight:1.5, marginBottom:"16px" }}>
        Choose a product or service to fill the sale amount quickly, or record a custom sale manually.
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"12px", marginBottom:"14px" }}>
        <div>
          <label style={labelStyle}>Customer</label>
          <select style={{ ...inputStyle, cursor:"pointer" }} value={form.customer_id} onChange={(event) => upd("customer_id", event.target.value)}>
            <option value="">Select customer</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Product / service</label>
          <select style={{ ...inputStyle, cursor:"pointer" }} value={form.product_id} onChange={(event) => selectProduct(event.target.value)}>
            <option value="">Custom sale</option>
            {products.map((product) => <option key={product.id} value={product.id}>{productLabel(product)}</option>)}
          </select>
          {products.length === 0 && (
            <div style={{ fontSize:"11px", color:"#aaa", marginTop:"6px", lineHeight:1.4 }}>
              Add products or services first to use this selector.
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Amount (R)</label>
          <input style={inputStyle} type="number" placeholder="0" value={form.amount} onChange={(event) => upd("amount", event.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, cursor:"pointer" }} value={form.status} onChange={(event) => upd("status", event.target.value)}>
            {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Method</label>
          <select style={{ ...inputStyle, cursor:"pointer" }} value={form.method} onChange={(event) => upd("method", event.target.value)}>
            {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display:"flex", gap:"10px", alignItems:"flex-end", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:"220px" }}>
          <label style={labelStyle}>Reference / note</label>
          <input style={inputStyle} placeholder="Optional" value={form.reference} onChange={(event) => upd("reference", event.target.value)} />
        </div>
        <button onClick={handleSave} disabled={!valid || saving}
          style={{ backgroundColor:valid ? LIME : "#e0e0e0", color:valid ? "#fff" : "#aaa", border:"none", borderRadius:"12px", padding:"13px 20px", fontSize:"14px", fontWeight:800, cursor:valid ? "pointer" : "not-allowed" }}>
          {saving ? "Saving…" : "Save sale"}
        </button>
      </div>
    </div>
  );
}

export function SalesTab({ business, products = [] }) {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [products]);

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      supabase.from("payments").select("*").eq("business_id", business.id).order("created_at", { ascending:false }),
      supabase.from("customers").select("id,name,status,total_spent,visit_count").eq("business_id", business.id).order("name"),
    ]).then(([{ data: pay, error: paymentError }, { data: cust, error: customerError }]) => {
      if (paymentError) console.error("Load payments:", paymentError);
      if (customerError) console.error("Load payment customers:", customerError);
      if (pay) setPayments(pay);
      if (cust) setCustomers(cust);
      setLoading(false);
    });
  }, [business?.id]);

  function customerName(id) {
    return customers.find((customer) => customer.id === id)?.name || "Unknown customer";
  }

  function handleSaved(payment, updatedCustomer) {
    setPayments((prev) => [payment, ...prev]);
    if (updatedCustomer) setCustomers((prev) => prev.map((customer) => customer.id === updatedCustomer.id ? updatedCustomer : customer));
  }

  if (!business?.id) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:"40px", marginBottom:"16px" }}>🏪</div>
      <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>Set up your business first</h3>
      <p style={{ fontSize:"14px", color:"#aaa" }}>Complete your business setup before recording sales.</p>
    </div>
  );

  const revenuePayments = payments.filter((payment) => payment.status === "Paid" || payment.status === "Deposit paid");
  const totalRevenue = revenuePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const unpaid = payments.filter((payment) => payment.status === "Unpaid");
  const deposits = payments.filter((payment) => payment.status === "Deposit paid");

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Sales</h2>
        <p style={{ fontSize:"13px", color:"#aaa" }}>Revenue, payments, deposits and unpaid sales.</p>
      </div>

      {customers.length > 0 ? (
        <PaymentForm business={business} customers={customers} products={sortedProducts} onSaved={handleSaved} />
      ) : (
        <div style={{ background:"#fff", border:"1px dashed #d4d7db", borderRadius:"18px", padding:"18px", marginBottom:"20px", color:"#777", fontSize:"13px", lineHeight:1.55 }}>
          Add a customer first, then you can record a sale against them.
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Revenue", value:`R${totalRevenue.toLocaleString()}` },
          { label:"Payments", value:payments.length },
          { label:"Deposits", value:deposits.length },
          { label:"Unpaid", value:unpaid.length },
        ].map((stat) => (
          <div key={stat.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px" }}>
            <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{stat.label}</div>
            <div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {unpaid.length > 0 && (
        <div style={{ background:"#fff8ee", border:"1px solid #f0d080", borderRadius:"16px", padding:"16px", marginBottom:"20px" }}>
          <div style={{ fontSize:"14px", fontWeight:800, color:DARK, marginBottom:"10px" }}>Unpaid / follow-up</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {unpaid.slice(0, 5).map((payment) => (
              <div key={payment.id} style={{ display:"flex", justifyContent:"space-between", gap:"12px", fontSize:"13px", color:"#6b5200" }}>
                <span>{customerName(payment.customer_id)}{payment.reference ? ` · ${payment.reference}` : ""}</span>
                <strong>R{(payment.amount || 0).toLocaleString()}</strong>
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
            {payments.map((payment) => (
              <div key={payment.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", border:"1px solid #eeeeea", borderRadius:"12px" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"14px", fontWeight:800, color:DARK }}>{customerName(payment.customer_id)}</div>
                  <div style={{ fontSize:"12px", color:"#aaa" }}>
                    {payment.method || "Other"} · {payment.status || "Paid"}{payment.reference ? ` · ${payment.reference}` : ""}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>R{(payment.amount || 0).toLocaleString()}</div>
                  {payment.created_at && <div style={{ fontSize:"11px", color:"#bbb" }}>{new Date(payment.created_at).toLocaleDateString("en-ZA", { day:"numeric", month:"short" })}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

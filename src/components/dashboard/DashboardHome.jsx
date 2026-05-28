import React, { useEffect, useState } from "react";
import {
  Banknote,
  CheckCircle,
  Circle,
  Download,
  FileCheck,
  Globe,
  Package,
  PlusCircle,
  ReceiptText,
  Star,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { LIME, DARK } from "../../constants";
import { supabase } from "../../lib/supabase";

const GREEN = "#ea4c89";

function SoftIcon({ icon: Icon, color = GREEN, bg = "#fde8f1", size = 20 }) {
  return <span style={{ width: "42px", height: "42px", borderRadius: "50%", background: bg, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={size} strokeWidth={2.2} color={color} /></span>;
}

function QuickAction({ icon: Icon, label, onClick, accent = GREEN }) {
  const showPlus = label.startsWith("Add ");
  return <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "transparent", border: "none", cursor: "pointer", minWidth: "86px", padding: "4px" }}><span style={{ width: "58px", height: "58px", borderRadius: "50%", background: "#fde8f1", display: "flex", alignItems: "center", justifyContent: "center", color: accent, position: "relative" }}><Icon size={25} strokeWidth={2.2} color={accent} />{showPlus && <span style={{ position: "absolute", right: "4px", bottom: "4px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(32,32,33,0.12)" }}><PlusCircle size={16} strokeWidth={2.4} color={accent} /></span>}</span><span style={{ fontSize: "11px", fontWeight: 700, color: DARK, lineHeight: 1.25, textAlign: "center" }}>{label}</span></button>;
}

function InsightCard({ title, value, sub, icon: Icon, onClick, bg = "#fde8f1", color = GREEN }) {
  return <div onClick={onClick} style={{ background: "#fff", border: "1.5px solid #eeeeea", borderRadius: "16px", padding: "18px", cursor: onClick ? "pointer" : "default" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}><div style={{ fontSize: "10px", color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</div><SoftIcon icon={Icon} bg={bg} color={color} size={19} /></div><div style={{ fontSize: "28px", fontWeight: 900, color: DARK, lineHeight: 1, marginBottom: "6px" }}>{value}</div><div style={{ fontSize: "11px", color: "#888", fontWeight: 600, lineHeight: 1.4 }}>{sub}</div></div>;
}

export function DashboardHome({ user, business, setTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState(null);

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }

    async function loadAll() {
      setLoading(true);
      const [{ data: customers }, { data: bookings }, { data: payments }, { data: expenses }, { data: products }, { data: pendingReviews }, { data: enquiries }] = await Promise.all([
        supabase.from("customers").select("*").eq("business_id", business.id),
        supabase.from("bookings").select("*").eq("business_id", business.id),
        supabase.from("payments").select("*").eq("business_id", business.id),
        supabase.from("expenses").select("*").eq("business_id", business.id),
        supabase.from("products").select("*").eq("business_id", business.id),
        supabase.from("reviews").select("*").eq("business_id", business.id).or("approved.eq.false,approved.is.null").order("created_at", { ascending: false }),
        supabase.from("enquiries").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      const threeDaysAhead = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

      const customerRows = customers || [];
      const bookingRows = bookings || [];
      const paymentRows = payments || [];
      const expenseRows = expenses || [];
      const productRows = (products || []).filter((p) => p.is_active !== false);
      const enquiryRows = enquiries || [];
      const revenuePayments = paymentRows.filter((p) => p.status === "Paid" || p.status === "Deposit paid");
      const unpaidPayments = paymentRows.filter((p) => p.status === "Unpaid");
      const todayBookings = bookingRows.filter((b) => b.booking_date === today && String(b.status || "").toLowerCase() !== "cancelled");
      const upcomingSoon = bookingRows.filter((b) => b.booking_date > today && b.booking_date <= threeDaysAhead && String(b.status || "").toLowerCase() !== "cancelled");
      const doneBookings = bookingRows.filter((b) => ["done", "completed"].includes(String(b.status || "").toLowerCase()));
      const leads = customerRows.filter((c) => c.status === "lead");
      const customerById = Object.fromEntries(customerRows.map((c) => [c.id, c]));

      const thisMonthRevenue = revenuePayments.filter((p) => (p.created_at || "").slice(0, 10) >= thisMonthStart).reduce((s, p) => s + Number(p.amount || 0), 0);
      const lastMonthRevenue = revenuePayments.filter((p) => { const d = (p.created_at || "").slice(0, 10); return d >= lastMonthStart && d <= lastMonthEnd; }).reduce((s, p) => s + Number(p.amount || 0), 0);
      const totalEarned = revenuePayments.reduce((s, p) => s + Number(p.amount || 0), 0);
      const totalExpenses = expenseRows.reduce((s, expense) => s + Number(expense.amount || 0), 0);
      const estimatedProfit = totalEarned - totalExpenses;

      const serviceCounts = {};
      [...bookingRows.map((b) => b.service), ...enquiryRows.map((e) => e.product_name), ...paymentRows.map((p) => p.reference)].filter(Boolean).forEach((value) => {
        String(value).split(",").map((item) => item.trim()).filter(Boolean).forEach((item) => { serviceCounts[item] = (serviceCounts[item] || 0) + 1; });
      });
      const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0] || null;

      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const ym = d.toISOString().slice(0, 7);
        const value = revenuePayments.filter((p) => p.created_at?.startsWith(ym)).reduce((s, p) => s + Number(p.amount || 0), 0);
        return { label: d.toLocaleDateString("en-ZA", { month: "short" }), value };
      });

      const celebrationKey = `vula_celebrated_${business.id}`;
      const celebrated = JSON.parse(localStorage.getItem(celebrationKey) || "{}");
      let newCelebration = null;
      const lastSale = [...revenuePayments].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))[0];
      const latestEnquiry = enquiryRows.find((e) => !e.is_archived);

      if (lastSale && !celebrated[`sale_${lastSale.id}`]) newCelebration = { key: `sale_${lastSale.id}`, title: `R${Number(lastSale.amount || 0).toLocaleString()} earned`, msg: `${customerById[lastSale.customer_id]?.name || "A customer"} paid. Small sales build strong businesses.` };
      else if (latestEnquiry && !celebrated[`enquiry_${latestEnquiry.id}`]) newCelebration = { key: `enquiry_${latestEnquiry.id}`, title: "New interest captured", msg: `${latestEnquiry.customer_name || "Someone"} asked about ${latestEnquiry.product_name || "your offer"}. Follow up while it is warm.` };
      else if (totalEarned >= 1000 && !celebrated.first_1000) newCelebration = { key: "first_1000", title: "R1,000 earned", msg: "Four figures. You are building a business record that matters." };
      else if (customerRows.length >= 10 && !celebrated.ten_customers) newCelebration = { key: "ten_customers", title: "10 customers", msg: "Ten people have trusted your business. Keep serving them well." };
      else if (customerRows.length >= 1 && !celebrated.first_customer) newCelebration = { key: "first_customer", title: "First customer added", msg: "Every big business starts with one customer. You have yours." };

      let liveBanner = null;
      if (!newCelebration) {
        if (todayBookings.length > 0) liveBanner = { title: `${todayBookings.length} booking${todayBookings.length !== 1 ? "s" : ""} today`, msg: "Show up, deliver well, and record the result." };
        else if (unpaidPayments.length > 0) liveBanner = { title: `${unpaidPayments.length} unpaid payment${unpaidPayments.length !== 1 ? "s" : ""}`, msg: "A quick payment follow-up can protect your cash flow." };
        else if (leads.length > 0) liveBanner = { title: `${leads.length} lead${leads.length !== 1 ? "s" : ""} waiting`, msg: "A warm lead is easier to convert than a cold one. Follow up today." };
        else liveBanner = { title: "Keep building", msg: "Every enquiry, customer, sale and review strengthens your business file." };
      }

      setData({ totalCustomers: customerRows.length, leads, todayBookings, upcomingSoon, pendingReviews: pendingReviews || [], doneBookings, thisMonthRevenue, lastMonthRevenue, totalEarned, totalExpenses, estimatedProfit, productCount: productRows.length, unpaidPayments, topService, monthlyRevenue, liveBanner });
      if (newCelebration) setCelebration({ ...newCelebration, celebrationKey });
      setLoading(false);
    }
    loadAll();
  }, [business?.id]);

  function dismissCelebration() {
    if (!celebration) return;
    const existing = JSON.parse(localStorage.getItem(celebration.celebrationKey) || "{}");
    existing[celebration.key] = true;
    localStorage.setItem(celebration.celebrationKey, JSON.stringify(existing));
    setCelebration(null);
  }

  if (!business?.name) return <div><h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "6px" }}>Welcome to VulaTrade</h2><p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>{user.email}</p><div style={{ background: DARK, borderRadius: "20px", padding: "28px", marginBottom: "20px" }}><div style={{ fontSize: "20px", fontWeight: 800, color: LIME, marginBottom: "8px" }}>Let's build your business page</div><div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "20px", lineHeight: 1.6 }}>Pick a template and launch in minutes. Your customers will be able to find you, book you, and pay you.</div><button onClick={() => setTab("Templates")} style={{ backgroundColor: LIME, color: "#fff", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>Browse templates</button></div></div>;

  const revenueUp = (data?.thisMonthRevenue || 0) >= (data?.lastMonthRevenue || 0);

  return <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
    {(celebration || data?.liveBanner) && <div style={{ background: DARK, borderRadius: "20px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}><div style={{ flex: 1 }}><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{celebration ? "Milestone" : "Daily encouragement"}</div><div style={{ fontSize: "16px", fontWeight: 800, color: LIME, marginBottom: "4px" }}>{celebration ? celebration.title : data?.liveBanner?.title}</div><div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{celebration ? celebration.msg : data?.liveBanner?.msg}</div></div>{celebration && <button onClick={dismissCelebration} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "20px", cursor: "pointer", flexShrink: 0, padding: "4px 8px", lineHeight: 1 }}>×</button>}</div>}

    <div><h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "2px" }}>{greeting()}{business?.owner ? `, ${business.owner.split(" ")[0]}` : business?.name ? `, ${business.name.split(" ")[0]}` : ""}</h2><p style={{ fontSize: "13px", color: "#aaa" }}>{new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}</p></div>

    {loading || !data ? <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>Loading your dashboard…</div> : <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
        <InsightCard title="Total sales" value={`R${data.thisMonthRevenue.toLocaleString()}`} sub={data.lastMonthRevenue > 0 ? `${revenueUp ? "▲" : "▼"} vs R${data.lastMonthRevenue.toLocaleString()} last month` : "Record sales to track"} onClick={() => setTab("Sales")} icon={Banknote} />
        <InsightCard title="Estimated profit" value={`R${data.estimatedProfit.toLocaleString()}`} sub={data.totalExpenses > 0 ? `After R${data.totalExpenses.toLocaleString()} expenses` : "Add expenses to estimate"} onClick={() => setTab("Expenses")} icon={WalletCards} bg="#fff5f9" color="#ea4c89" />
        <InsightCard title="Products / Services" value={data.productCount} sub="Add what you sell" onClick={() => setTab("Products")} icon={Package} bg="#edf5fe" color="#0267ff" />
        <InsightCard title="Customers" value={data.totalCustomers} sub={data.leads.length > 0 ? `${data.leads.length} lead${data.leads.length !== 1 ? "s" : ""} to convert` : "No leads waiting"} onClick={() => setTab("Customers")} icon={Users} bg="#fff8e7" color="#d89b00" />
        <InsightCard title="Business File" value="Building" sub="Your trading proof is growing" onClick={() => setTab("BusinessFile")} icon={FileCheck} bg="#fbe6ea" color="#d90429" />
      </div>

      <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "20px", padding: "20px" }}><div style={{ fontSize: "15px", fontWeight: 800, color: DARK, marginBottom: "16px" }}>Quick actions</div><div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "2px" }}><QuickAction icon={ReceiptText} label="Add Sale" onClick={() => setTab("Sales")} /><QuickAction icon={Package} label="Add Product / Service" onClick={() => setTab("Products")} accent="#0267ff" /><QuickAction icon={UserPlus} label="Add Customer" onClick={() => setTab("Customers")} accent="#d89b00" /><QuickAction icon={WalletCards} label="Add Expense" onClick={() => setTab("Expenses")} accent="#d93f7b" /><QuickAction icon={Globe} label="View Public Page" onClick={() => setTab("Page")} accent="#ea4c89" /><QuickAction icon={Download} label="Download Business File" onClick={() => setTab("BusinessFile")} accent="#767b81" /></div></div>

      <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "20px", padding: "20px" }}><div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}><SoftIcon icon={FileCheck} /><div><div style={{ fontSize: "15px", fontWeight: 800, color: DARK }}>Business File checklist</div><div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Small records that make your business easier to prove.</div></div></div><div style={{ display: "grid", gap: "10px" }}>{[{ label: "Business profile created", done: Boolean(business?.name) }, { label: "Public page ready", done: Boolean(business?.slug) }, { label: "Customers added", done: data.totalCustomers > 0 }, { label: "Sales recorded", done: data.totalEarned > 0 }, { label: "First expense recorded", done: data.totalExpenses > 0 }].map((item) => { const Icon = item.done ? CheckCircle : Circle; return <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 700, color: item.done ? DARK : "#888" }}><Icon size={19} strokeWidth={2.2} color={item.done ? GREEN : "#c6cbd1"} />{item.label}</div>; })}</div></div>

      <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "20px", padding: "20px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}><div style={{ fontSize: "15px", fontWeight: 800, color: DARK }}>Today's appointments</div><button onClick={() => setTab("Bookings")} style={{ fontSize: "12px", color: "#aaa", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>View all</button></div>{data.todayBookings.length === 0 ? <div style={{ background: "#fbfbfb", borderRadius: "14px", padding: "20px", textAlign: "center", fontSize: "13px", color: "#888" }}>No appointments today — a good time to reach out to customers or plan ahead.</div> : <div style={{ display: "grid", gap: "8px" }}>{data.todayBookings.map((b) => <div key={b.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", background: "#fbfbfb", borderRadius: "12px" }}><div style={{ textAlign: "center", minWidth: "44px", background: LIME, borderRadius: "10px", padding: "6px 0", fontSize: "13px", fontWeight: 900, color: DARK }}>{b.booking_time || "—"}</div><div style={{ flex: 1 }}><div style={{ fontSize: "14px", fontWeight: 700, color: DARK }}>{b.customer_name}</div>{b.service && <div style={{ fontSize: "12px", color: "#aaa" }}>{b.service}</div>}</div>{b.price > 0 && <div style={{ fontSize: "14px", fontWeight: 800, color: DARK }}>R{b.price}</div>}</div>)}</div>}</div>

      <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "20px", padding: "20px" }}><div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}><SoftIcon icon={Star} bg="#fff8e7" color="#d89b00" /><div><div style={{ fontSize: "15px", fontWeight: 800, color: DARK }}>Popular and revenue insights</div><div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Useful patterns, placed lower so they do not crowd your daily work.</div></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}><div style={{ background: "#fbfbfb", border: "1px solid #eeeeea", borderRadius: "14px", padding: "14px" }}><div style={{ fontSize: "11px", color: "#aaa", fontWeight: 800, textTransform: "uppercase" }}>Most popular</div><div style={{ fontSize: "16px", color: DARK, fontWeight: 900, marginTop: "6px" }}>{data.topService?.[0] || "Not enough data yet"}</div><div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{data.topService ? `${data.topService[1]} activity record${data.topService[1] !== 1 ? "s" : ""}` : "Enquiries, bookings and sales will help here."}</div></div><div style={{ background: "#fbfbfb", border: "1px solid #eeeeea", borderRadius: "14px", padding: "14px" }}><div style={{ fontSize: "11px", color: "#aaa", fontWeight: 800, textTransform: "uppercase" }}>Revenue this month</div><div style={{ fontSize: "16px", color: DARK, fontWeight: 900, marginTop: "6px" }}>R{data.thisMonthRevenue.toLocaleString()}</div><div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{data.lastMonthRevenue > 0 ? `${revenueUp ? "Up" : "Down"} vs last month` : "Keep logging sales."}</div></div><div style={{ background: "#fbfbfb", border: "1px solid #eeeeea", borderRadius: "14px", padding: "14px" }}><div style={{ fontSize: "11px", color: "#aaa", fontWeight: 800, textTransform: "uppercase" }}>6-month sales view</div><div style={{ display: "flex", alignItems: "end", gap: "6px", height: "54px", marginTop: "8px" }}>{data.monthlyRevenue.map((month) => { const max = Math.max(...data.monthlyRevenue.map((m) => m.value), 1); const height = Math.max(6, Math.round((month.value / max) * 44)); return <div key={month.label} style={{ flex: 1, display: "grid", gap: "4px", justifyItems: "center" }}><div style={{ width: "100%", maxWidth: "20px", height, borderRadius: "999px", background: GREEN }} /><div style={{ fontSize: "9px", color: "#aaa", fontWeight: 700 }}>{month.label}</div></div>; })}</div></div></div></div>
    </>}
  </div>;
}

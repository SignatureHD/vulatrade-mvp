import React, { useEffect, useState } from "react";
import { CheckCircle, Circle, FileCheck, ReceiptText, Star, Users, WalletCards } from "lucide-react";
import { DARK } from "../../constants";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";

function averageRating(reviews) {
  const approved = reviews.filter((review) => review.approved);
  if (approved.length === 0) return "0.0";
  const total = approved.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return (total / approved.length).toFixed(1);
}

export function BusinessFileTab({ business, setTab }) {
  const [stats, setStats] = useState({
    customers: 0,
    payments: 0,
    salesTotal: 0,
    bookings: 0,
    expenses: 0,
    reviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    averageRating: "0.0",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      supabase.from("customers").select("id").eq("business_id", business.id),
      supabase.from("payments").select("amount,status").eq("business_id", business.id),
      supabase.from("bookings").select("id,status").eq("business_id", business.id),
      supabase.from("expenses").select("id").eq("business_id", business.id),
      supabase.from("reviews").select("id,rating,approved").eq("business_id", business.id),
    ]).then(([{ data: customers }, { data: payments }, { data: bookings }, { data: expenses }, { data: reviews }]) => {
      const revenue = (payments || [])
        .filter((payment) => payment.status === "Paid" || payment.status === "Deposit paid")
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const reviewRows = reviews || [];
      setStats({
        customers: customers?.length || 0,
        payments: payments?.length || 0,
        salesTotal: revenue,
        bookings: bookings?.filter((booking) => booking.status === "done").length || 0,
        expenses: expenses?.length || 0,
        reviews: reviewRows.length,
        approvedReviews: reviewRows.filter((review) => review.approved).length,
        pendingReviews: reviewRows.filter((review) => !review.approved).length,
        averageRating: averageRating(reviewRows),
      });
      setLoading(false);
    });
  }, [business?.id]);

  const checklist = [
    { label:"Business profile created", done:Boolean(business?.name) },
    { label:"Public page ready", done:Boolean(business?.slug) },
    { label:"Customer activity recorded", done:stats.customers > 0 },
    { label:"Sales history started", done:stats.payments > 0 },
    { label:"First expense recorded", done:stats.expenses > 0 },
    { label:"Completed work tracked", done:stats.bookings > 0 },
    { label:"Customer reviews approved", done:stats.approvedReviews > 0 },
  ];
  const doneCount = checklist.filter((item) => item.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);
  const reviewProofText = stats.approvedReviews > 0
    ? `Customer proof: ${stats.approvedReviews} approved review${stats.approvedReviews === 1 ? "" : "s"}, average rating ${stats.averageRating} stars.`
    : stats.pendingReviews > 0
      ? `Customer proof: ${stats.pendingReviews} review${stats.pendingReviews === 1 ? "" : "s"} waiting for approval.`
      : "Customer proof: no approved reviews yet.";

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Business File</h2>
        <p style={{ fontSize:"13px", color:"#aaa" }}>Your proof-of-trading record grows as you use VulaTrade.</p>
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"22px", padding:"22px", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"18px" }}>
          <span style={{ width:"48px", height:"48px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FileCheck size={22} strokeWidth={2.2} color={BRAND} />
          </span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>Proof of trading</div>
            <div style={{ fontSize:"12px", color:"#888", lineHeight:1.5, marginTop:"3px" }}>
              Better records may help you in future conversations with suppliers, funders, partners or landlords.
            </div>
          </div>
        </div>
        <div style={{ height:"10px", background:"#f5f5f5", borderRadius:"999px", overflow:"hidden", marginBottom:"10px" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:BRAND, borderRadius:"999px" }} />
        </div>
        <div style={{ fontSize:"12px", color:"#888", fontWeight:700 }}>{progress}% complete</div>
      </div>

      <div style={{ background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"18px", padding:"16px", marginBottom:"20px", display:"flex", alignItems:"flex-start", gap:"12px" }}>
        <span style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Star size={18} strokeWidth={2.2} color={BRAND} />
        </span>
        <div>
          <div style={{ fontSize:"14px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Review proof</div>
          <div style={{ fontSize:"13px", color:"#666", lineHeight:1.55 }}>{loading ? "Loading review proof..." : reviewProofText}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Sales history", value:`R${stats.salesTotal.toLocaleString()}`, icon:ReceiptText },
          { label:"Customer activity", value:stats.customers, icon:Users },
          { label:"Payment records", value:stats.payments, icon:WalletCards },
          { label:"Expense records", value:stats.expenses, icon:FileCheck },
          { label:"Approved reviews", value:stats.approvedReviews, icon:Star },
          { label:"Average rating", value:stats.approvedReviews > 0 ? `${stats.averageRating} ★` : "0.0 ★", icon:Star },
          { label:"Pending reviews", value:stats.pendingReviews, icon:Star },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"16px" }}>
              <Icon size={18} strokeWidth={2.2} color={BRAND} />
              <div style={{ fontSize:"22px", fontWeight:900, color:DARK, marginTop:"12px" }}>{loading ? "…" : stat.value}</div>
              <div style={{ fontSize:"11px", color:"#888", fontWeight:700, marginTop:"4px" }}>{stat.label}</div>
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
                <Icon size={19} strokeWidth={2.2} color={item.done ? BRAND : "#c6cbd1"} />
                {item.label}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          <button onClick={() => setTab("Sales")} style={{ background:BRAND, color:"#fff", border:"none", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>
            Record a sale
          </button>
          <button onClick={() => setTab("Reviews")} style={{ background:"#fff", color:BRAND, border:"1.5px solid #f8b8d2", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>
            Request reviews
          </button>
        </div>
      </div>
    </div>
  );
}

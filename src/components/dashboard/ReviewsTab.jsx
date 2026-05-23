import React, { useEffect, useMemo, useState } from "react";
import { Copy, MessageCircle, Star } from "lucide-react";
import { DARK, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";

function reviewShareOrigin() {
  const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  return isLocalHost ? "https://www.vulatrade.co.za" : window.location.origin;
}

function reviewUrlForBusiness(business) {
  if (!business?.slug) return "";
  return `${reviewShareOrigin()}/review/${business.slug}`;
}

function buildReviewMessage(business, customerName, reviewUrl) {
  const greeting = customerName?.trim() ? `Hi ${customerName.trim()}` : "Hi";
  return `${greeting}, thank you for supporting ${business?.name || "my business"}. Please leave me a quick review here: ${reviewUrl}. It helps my small business grow.`;
}

export function ReviewsTab({ business }) {
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [manualName, setManualName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const reviewUrl = reviewUrlForBusiness(business);
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);
  const customerName = selectedCustomer?.name || manualName;
  const reviewMessage = useMemo(() => buildReviewMessage(business, customerName, reviewUrl), [business?.name, customerName, reviewUrl]);
  const pendingReviews = reviews.filter((review) => !review.approved);
  const approvedReviews = reviews.filter((review) => review.approved);

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      supabase.from("customers").select("id,name,whatsapp,status").eq("business_id", business.id).order("name"),
      supabase.from("reviews").select("*").eq("business_id", business.id).order("created_at", { ascending:false }),
    ]).then(([{ data: customerRows, error: customerError }, { data: reviewRows, error: reviewError }]) => {
      if (customerError) console.error("Load review customers:", customerError);
      if (reviewError) console.error("Load reviews:", reviewError);
      setCustomers(customerRows || []);
      setReviews(reviewRows || []);
      setLoading(false);
    });
  }, [business?.id]);

  async function copyMessage() {
    if (!reviewUrl) return;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(reviewMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      return;
    }
    window.prompt("Copy your review request:", reviewMessage);
  }

  function openWhatsApp() {
    if (!reviewUrl) return;
    const phone = selectedCustomer?.whatsapp || "";
    const cleanPhone = phone.replace(/[\s()+.-]/g, "");
    const encoded = encodeURIComponent(reviewMessage);
    const url = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("27") ? cleanPhone : cleanPhone.replace(/^0/, "27")}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function approveReview(reviewId) {
    const { data, error } = await supabase.from("reviews").update({ approved:true }).eq("id", reviewId).select().single();
    if (error) {
      console.error("Approve review:", error);
      alert("Review could not be approved. Please try again.");
      return;
    }
    setReviews((prev) => prev.map((review) => review.id === reviewId ? data : review));
  }

  async function hideReview(reviewId) {
    const { data, error } = await supabase.from("reviews").update({ approved:false }).eq("id", reviewId).select().single();
    if (error) {
      console.error("Hide review:", error);
      alert("Review could not be hidden. Please try again.");
      return;
    }
    setReviews((prev) => prev.map((review) => review.id === reviewId ? data : review));
  }

  if (!business?.id) {
    return (
      <div style={{ textAlign:"center", padding:"80px 24px" }}>
        <div style={{ fontSize:"40px", marginBottom:"16px" }}>⭐</div>
        <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>Set up your business first</h3>
        <p style={{ fontSize:"14px", color:"#aaa" }}>Complete your business setup before requesting reviews.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Reviews</h2>
        <p style={{ fontSize:"13px", color:"#888" }}>Ask happy customers for reviews and approve them before they appear publicly.</p>
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"22px", padding:"20px", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
          <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}><Star size={19} color={BRAND} /></span>
          <div>
            <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>Request a review</div>
            <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>Send your customer a link by WhatsApp or copy the message.</div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:"12px", marginBottom:"14px" }}>
          <div>
            <label style={labelStyle}>Choose customer</label>
            <select style={{ ...inputStyle, cursor:"pointer" }} value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
              <option value="">Manual / no customer selected</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.whatsapp ? ` · ${customer.whatsapp}` : ""}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Customer name</label>
            <input style={inputStyle} placeholder="e.g. Thandi" value={selectedCustomer?.name || manualName} onChange={(event) => { setSelectedCustomerId(""); setManualName(event.target.value); }} />
          </div>
        </div>

        <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", marginBottom:"14px" }}>
          <div style={{ fontSize:"11px", color:"#aaa", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" }}>Review link</div>
          <div style={{ fontSize:"13px", color:DARK, lineHeight:1.55, wordBreak:"break-word", fontWeight:750 }}>{reviewUrl || "Create a business page first."}</div>
        </div>

        <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", marginBottom:"14px" }}>
          <div style={{ fontSize:"11px", color:"#aaa", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" }}>Message</div>
          <div style={{ fontSize:"13px", color:DARK, lineHeight:1.65, whiteSpace:"pre-wrap" }}>{reviewMessage}</div>
        </div>

        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          <button onClick={copyMessage} style={{ flex:"1 1 150px", background:BRAND, color:"#fff", border:"none", borderRadius:"12px", padding:"12px 16px", fontSize:"13px", fontWeight:900, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            <Copy size={16} /> {copied ? "Copied" : "Copy message"}
          </button>
          <button onClick={openWhatsApp} style={{ flex:"1 1 150px", background:"#fff", color:BRAND, border:"1.5px solid #f8b8d2", borderRadius:"12px", padding:"12px 16px", fontSize:"13px", fontWeight:900, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            <MessageCircle size={16} /> Open WhatsApp
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Total reviews", value:reviews.length },
          { label:"Pending", value:pendingReviews.length },
          { label:"Approved", value:approvedReviews.length },
        ].map((stat) => <div key={stat.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px" }}><div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{stat.label}</div><div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{loading ? "..." : stat.value}</div></div>)}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
        <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"14px" }}>Review inbox</div>
        {loading ? <div style={{ color:"#888", fontSize:"13px", padding:"24px", textAlign:"center" }}>Loading reviews...</div> : reviews.length === 0 ? <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"24px", textAlign:"center", color:"#888", fontSize:"13px" }}>No reviews yet. Send your first review request after a sale or booking.</div> : (
          <div style={{ display:"grid", gap:"10px" }}>
            {reviews.map((review) => <div key={review.id} style={{ border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", background:review.approved ? "#fff" : "#fff8ee" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px", marginBottom:"8px" }}>
                <div><div style={{ color:"#ffb60a", fontSize:"14px", marginBottom:"4px" }}>{"★".repeat(review.rating || 5)}</div><div style={{ fontSize:"13px", fontWeight:900, color:DARK }}>{review.customer_name}</div></div>
                <span style={{ borderRadius:"999px", padding:"6px 9px", fontSize:"11px", fontWeight:900, background:review.approved ? "#f0fff4" : "#fff1cc", color:review.approved ? "#186a3b" : "#7a5200" }}>{review.approved ? "Approved" : "Pending"}</span>
              </div>
              <div style={{ fontSize:"13px", color:"#555", lineHeight:1.6, marginBottom:"12px" }}>{review.review_text}</div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {!review.approved && <button onClick={() => approveReview(review.id)} style={{ background:BRAND, color:"#fff", border:"none", borderRadius:"10px", padding:"9px 12px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>Approve</button>}
                {review.approved && <button onClick={() => hideReview(review.id)} style={{ background:"#fff", color:"#555", border:"1px solid #eeeeea", borderRadius:"10px", padding:"9px 12px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>Hide</button>}
              </div>
            </div>)}
          </div>
        )}
      </div>
    </div>
  );
}

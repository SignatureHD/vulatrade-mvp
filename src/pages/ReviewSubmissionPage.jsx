import React, { useEffect, useState } from "react";
import { DARK, inputStyle, labelStyle } from "../constants";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";

const BRAND = "#ea4c89";

export default function ReviewSubmissionPage({ slug }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ customer_name: "", rating: 5, review_text: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadBusiness() {
      setLoading(true);
      const { data, error: loadError } = await supabase
        .from("businesses")
        .select("id,name,slug,category,area")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      if (loadError) console.error("Review business load:", loadError);
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setBusiness(data);
      setLoading(false);
    }
    loadBusiness();
    return () => { cancelled = true; };
  }, [slug]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!business?.id) return;
    if (!form.customer_name.trim()) { setError("Please add your name."); return; }
    if (!form.review_text.trim()) { setError("Please write a short review."); return; }
    setSaving(true);
    setError("");
    const { error: saveError } = await supabase.from("reviews").insert([{
      business_id: business.id,
      customer_name: form.customer_name.trim(),
      rating: Number(form.rating) || 5,
      review_text: form.review_text.trim(),
      approved: false,
    }]);
    if (saveError) {
      console.error("Review save:", saveError);
      setError("Your review could not be saved. Please try again.");
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
  }

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"#888" }}>Loading review page...</div>;

  if (notFound || !business) {
    return (
      <main style={{ minHeight:"100vh", background:"#fbfbfb", display:"flex", alignItems:"center", justifyContent:"center", padding:"22px", fontFamily:"'Inter', -apple-system, sans-serif" }}>
        <div style={{ width:"100%", maxWidth:"380px", background:"#fff", border:"1px solid #eeeeea", borderRadius:"26px", padding:"28px", textAlign:"center" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:"16px" }}><Logo size="compact" iconOnly /></div>
          <h1 style={{ fontSize:"22px", fontWeight:900, color:DARK, marginBottom:"8px" }}>Review page not found</h1>
          <p style={{ fontSize:"14px", color:"#888", lineHeight:1.6 }}>This review link is not available yet.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight:"100vh", background:"linear-gradient(180deg, #fff5f9 0%, #fbfbfb 42%, #ffffff 100%)", padding:"20px", fontFamily:"'Inter', -apple-system, sans-serif", color:DARK }}>
      <div style={{ maxWidth:"540px", margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"14px 0 18px" }}><Logo size="small" /></div>
        <section style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"30px", padding:"24px", boxShadow:"0 20px 60px rgba(32,32,33,0.08)" }}>
          <div style={{ width:"54px", height:"54px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", marginBottom:"14px" }}>★</div>
          <h1 style={{ fontSize:"28px", lineHeight:1.05, fontWeight:950, margin:"0 0 8px" }}>Review {business.name}</h1>
          <p style={{ fontSize:"14px", color:"#777", lineHeight:1.65, margin:"0 0 20px" }}>Your review helps this business build trust.</p>
          {saved ? (
            <div style={{ background:"#f0fff4", border:"1px solid #b7efc5", borderRadius:"18px", padding:"18px", color:"#186a3b", fontSize:"14px", lineHeight:1.6, fontWeight:750 }}>
              Thank you. Your review has been received and shared with {business.name}.
              <div style={{ marginTop:"14px" }}><a href={`/b/${business.slug}`} style={{ color:BRAND, fontWeight:900, textDecoration:"none" }}>View business page</a></div>
            </div>
          ) : (
            <form onSubmit={submitReview}>
              {error && <div style={{ background:"#fff5f5", border:"1px solid #ffd0d0", color:"#cc3300", borderRadius:"14px", padding:"12px 14px", fontSize:"13px", fontWeight:750, marginBottom:"14px" }}>{error}</div>}
              <div style={{ marginBottom:"14px" }}><label style={labelStyle}>Your name</label><input style={inputStyle} placeholder="e.g. Thandi" value={form.customer_name} onChange={(event) => update("customer_name", event.target.value)} /></div>
              <div style={{ marginBottom:"14px" }}>
                <label style={labelStyle}>Rating</label>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  {[1,2,3,4,5].map((rating) => <button key={rating} type="button" onClick={() => update("rating", rating)} style={{ width:"44px", height:"44px", borderRadius:"14px", border:`1.5px solid ${Number(form.rating) === rating ? BRAND : "#eeeeea"}`, background:Number(form.rating) === rating ? "#fde8f1" : "#fff", color:Number(form.rating) === rating ? BRAND : "#aaa", fontSize:"18px", fontWeight:900, cursor:"pointer" }}>★</button>)}
                </div>
              </div>
              <div style={{ marginBottom:"18px" }}><label style={labelStyle}>Short review</label><textarea style={{ ...inputStyle, minHeight:"118px", resize:"vertical", lineHeight:1.55 }} placeholder="What did you like about the service?" value={form.review_text} onChange={(event) => update("review_text", event.target.value)} /></div>
              <button type="submit" disabled={saving} style={{ width:"100%", background:BRAND, color:"#fff", border:"none", borderRadius:"15px", padding:"14px 18px", fontSize:"15px", fontWeight:900, cursor:saving ? "not-allowed" : "pointer", opacity:saving ? 0.72 : 1 }}>{saving ? "Saving review..." : "Submit review"}</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

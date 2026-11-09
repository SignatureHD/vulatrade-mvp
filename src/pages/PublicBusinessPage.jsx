import React, { useEffect, useMemo, useState } from "react";
import { DARK, LIME, backgroundStyleForTheme, resolveBackgroundTheme } from "../constants";
import { businessDescriptionOrDefault } from "../businessDescriptions";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";
import { formatPhone, waLink } from "../utils";
import {
  buildItemWhatsAppMessage,
  cleanVulaDescription,
  currentStockValue,
  extractVulaMeta,
  formatAvailability,
  isSoldOut,
  itemActionLabel,
  itemTypeConfig,
  leadTimeWarning,
  separateMetaVariants,
} from "../vulaItems";
import { availableTimesForDate, dateLabel, getUpcomingBookableDates } from "../bookingAvailability";

const FALLBACK_ACCENT = "#ea4c89";
const SERVICE_SETUP = { item_type: "service", duration_minutes: "45", buffer_minutes: "10" };

const NOMSA_FALLBACK = {
  business: {
    id: "nomsa-demo",
    name: "Nomsa Nails",
    slug: "nomsa-nails",
    category: "Beauty & Nails",
    area: "Mitchells Plain",
    description: "Gel overlays, acrylic sets and soak-offs for local clients. WhatsApp to ask about availability or book your next set.",
    whatsapp: "+27821234567",
    phone: "+27821234567",
    catalogue: "",
    background_style: "💅",
    theme: FALLBACK_ACCENT,
    instagram: "https://instagram.com/",
  },
  products: [
    { id: "gel-overlay", name: "Gel overlay", price: 220, description: "Fresh colour, neat finish.", image: "💅", is_active: true, item_setup: SERVICE_SETUP, variants: [{ id:"short", name:"Short nails", price:220, description:"Neat short gel overlay" }, { id:"medium", name:"Medium nails", price:260, description:"Medium gel overlay" }] },
    { id: "acrylic-set", name: "Acrylic set", price: 350, description: "Custom length and shape.", image: "✨", is_active: true, item_setup: SERVICE_SETUP },
    { id: "soak-off", name: "Soak off", price: 80, description: "Gentle removal before your next set.", image: "🧴", is_active: true, item_setup: SERVICE_SETUP },
  ],
};

function normaliseUrl(value) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}
function money(value) {
  const amount = Number(value || 0);
  return amount > 0 ? `R${amount.toLocaleString()}` : "Ask price";
}
function digitsOnly(value = "") {
  return String(value).replace(/\D/g, "");
}
function samePhone(left = "", right = "") {
  const a = digitsOnly(formatPhone(left));
  const b = digitsOnly(formatPhone(right));
  return Boolean(a && b && a === b);
}
function mergeInterestedIn(current = [], productName = "") {
  const existing = Array.isArray(current) ? current : [];
  if (!productName || existing.includes(productName)) return existing;
  return [...existing, productName];
}
function whatsappLink(number, businessName) {
  if (!number) return "#";
  const text = `Hi ${businessName}, I'm interested in your products/services on VulaTrade.`;
  return waLink(number, text);
}
function normaliseVariants(variants = []) {
  const clean = separateMetaVariants(Array.isArray(variants) ? variants : []).variants;
  return clean
    .map((variant) => ({ id: variant.id || `${variant.name || "variant"}-${variant.price || ""}`, name: variant.name || "", price: variant.price ?? "", description: variant.description || "" }))
    .filter((variant) => variant.name || variant.price || variant.description);
}
function productDisplayPrice(product) {
  const basePrice = Number(product.price || 0);
  const variants = normaliseVariants(product.variants || []);
  const prices = variants.map((variant) => Number(variant.price || 0)).filter((price) => price > 0);
  if (prices.length > 0) {
    const lowest = Math.min(...prices);
    if (!basePrice || lowest !== basePrice || variants.length > 1) return `From R${lowest.toLocaleString()}`;
  }
  return basePrice > 0 ? `R${basePrice.toLocaleString()}` : "Ask price";
}
function productDescription(product) {
  return cleanVulaDescription(product?.description || "");
}
function productBadge(product) {
  const meta = extractVulaMeta(product);
  const type = itemTypeConfig(meta.item_type);
  if (meta.item_type === "daily_stock") return "Fresh today";
  if (meta.item_type === "standard_stock") return "In stock";
  return type.shortLabel;
}
function productStatus(product) {
  const meta = extractVulaMeta(product);
  const stock = currentStockValue(product);
  if (meta.item_type === "standard_stock") {
    if (isSoldOut(product)) return "Sold out";
    if (stock !== null && stock > 0) return stock <= 2 ? `Only ${stock} left` : `${stock} available`;
    return "Ask if available";
  }
  if (meta.item_type === "daily_stock") {
    if (meta.selling_today === false) return "Not selling today";
    if (isSoldOut(product)) return "Sold out today";
    if (stock !== null && stock > 0) return `${stock} available today`;
    return "Available today";
  }
  if (meta.item_type === "service") return meta.duration_minutes ? `${meta.duration_minutes} min service` : "Available by booking";
  if (meta.item_type === "made_to_order") return meta.lead_time_days ? `${meta.lead_time_days} days notice` : "Made to order";
  return "Available";
}
function socialLinks(business) {
  return [
    { label: "Instagram", url: business.instagram || business.instagram_url },
    { label: "Facebook", url: business.facebook || business.facebook_url },
    { label: "TikTok", url: business.tiktok || business.tiktok_url },
    { label: "Website", url: business.website || business.website_url },
  ].filter((item) => item.url);
}
function resolvePageTheme(business) {
  const savedTheme = business?.theme || business?.bgColour || business?.bg_colour || business?.accent_colour || business?.accentColor || "";
  return resolveBackgroundTheme(savedTheme, FALLBACK_ACCENT);
}
function readableTextOn(hex) {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return DARK;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? DARK : "#ffffff";
}
function isUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}
function ProductImage({ product, size = 66 }) {
  const image = product.image || product.icon || "🛍️";
  const isUrl = typeof image === "string" && image.startsWith("http");
  if (isUrl) return <img src={image} alt={product.name} style={{ width: size, height: size, borderRadius: size > 80 ? 24 : 18, objectFit: "cover", border: "1px solid #eeeeea", flexShrink: 0 }} />;
  return <div style={{ width: size, height: size, borderRadius: size > 80 ? 24 : 18, background: "#fbfbfb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size > 80 ? 42 : 28, flexShrink: 0 }}>{image}</div>;
}

function ProductDetailModal({ product, business, accent, accentText, onClose }) {
  const variants = normaliseVariants(product?.variants || []);
  const meta = extractVulaMeta(product || {});
  const badge = productBadge(product || {});
  const status = productStatus(product || {});
  const actionLabel = itemActionLabel(product || {});
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [neededByDate, setNeededByDate] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || null;
  const isService = meta.item_type === "service";
  const bookableDates = useMemo(() => isService ? getUpcomingBookableDates(meta, 7, 21) : [], [isService, meta]);
  const availableTimes = useMemo(() => isService && preferredDate ? availableTimesForDate(meta, preferredDate, bookings) : [], [isService, meta, preferredDate, bookings]);

  useEffect(() => { setSelectedVariantId(variants[0]?.id || ""); }, [product?.id]);
  useEffect(() => {
    if (!isService) return;
    if (!preferredDate && bookableDates[0]?.value) setPreferredDate(bookableDates[0].value);
  }, [isService, bookableDates, preferredDate]);
  useEffect(() => {
    if (!isService || !business?.id || String(business.id).startsWith("nomsa")) { setBookings([]); return; }
    let cancelled = false;
    async function loadSlots() {
      setLoadingSlots(true);
      const { data, error } = await supabase.rpc("get_public_booking_slots", { input_business_id: business.id });
      if (cancelled) return;
      if (error) {
        console.warn("Public booking slots failed", error.message);
        setBookings([]);
      } else {
        setBookings(data || []);
      }
      setLoadingSlots(false);
    }
    loadSlots();
    return () => { cancelled = true; };
  }, [isService, business?.id]);
  useEffect(() => {
    if (!isService || !preferredDate) return;
    if (!availableTimes.includes(preferredTime)) setPreferredTime(availableTimes[0] || "");
  }, [isService, preferredDate, availableTimes, preferredTime]);

  if (!product) return null;

  async function findOrCreateCustomer({ name, phone, productName }) {
    if (!business?.id || String(business.id).startsWith("nomsa")) return null;
    const { data: existingCustomers, error: customerLoadError } = await supabase.from("customers").select("*").eq("business_id", business.id);
    if (customerLoadError) return null;
    const matchedCustomer = (existingCustomers || []).find((customer) => samePhone(customer.whatsapp, phone));
    if (matchedCustomer) {
      const patch = { name: matchedCustomer.name || name, whatsapp: formatPhone(matchedCustomer.whatsapp || phone), interested_in: mergeInterestedIn(matchedCustomer.interested_in, productName), last_contacted: new Date().toISOString() };
      const { data: updatedCustomer } = await supabase.from("customers").update(patch).eq("id", matchedCustomer.id).select().single();
      return updatedCustomer || matchedCustomer;
    }
    const { data: newCustomer } = await supabase.from("customers").insert([{ business_id: business.id, name, whatsapp: phone, area: "", notes: `Created from public lead about ${productName}.`, status: "lead", interested_in: productName ? [productName] : [], last_contacted: new Date().toISOString() }]).select().single();
    return newCustomer || null;
  }

  async function handleWhatsAppEnquiry() {
    if (!business?.whatsapp) return;
    const name = customerName.trim();
    const phone = formatPhone(customerPhone.trim());
    if (!name) return setFormError("Please add your name before continuing.");
    if (!phone) return setFormError("Please add your WhatsApp number before continuing.");
    if (isService && !preferredDate) return setFormError("Please choose a booking date.");
    if (isService && !preferredTime) return setFormError("Please choose an available time.");

    const price = selectedVariant?.price ?? product.price ?? null;
    const productName = selectedVariant?.name ? `${product.name} - ${selectedVariant.name}` : product.name;
    const warning = leadTimeWarning(product, neededByDate);
    const customerNote = warning ? `${notes}${notes ? "\n" : ""}${warning}` : notes;
    const message = buildItemWhatsAppMessage({ businessName: business.name, product, variant: selectedVariant, customerName: name, customerPhone: phone, neededByDate, preferredDate, preferredTime, notes: customerNote });

    setSaving(true);
    setFormError("");
    try {
      const customer = await findOrCreateCustomer({ name, phone, productName });
      if (business?.id && !String(business.id).startsWith("nomsa")) {
        const { error } = await supabase.from("enquiries").insert({
          business_id: business.id,
          product_id: isUuid(product.id) ? product.id : null,
          customer_id: customer?.id || null,
          customer_name: customer?.name || name,
          customer_phone: customer?.whatsapp || phone,
          product_name: productName,
          product_price: Number(price || 0) || null,
          message,
          notes: customerNote,
          source: "public_page",
          status: meta.item_type === "service" ? "booking_requested" : meta.item_type === "made_to_order" ? "price_sent" : "new_enquiry",
        });
        if (error) console.warn("Lead capture failed", error.message);
      }
    } finally {
      setSaving(false);
      window.open(waLink(business.whatsapp, message), "_blank", "noopener,noreferrer");
      onClose();
    }
  }

  return <div role="dialog" aria-modal="true" style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.48)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:18 }} onClick={onClose}>
    <div style={{ width:"100%", maxWidth:560, background:"#fff", borderRadius:28, padding:18, boxShadow:"0 24px 80px rgba(0,0,0,0.24)", maxHeight:"88vh", overflowY:"auto" }} onClick={(event) => event.stopPropagation()}>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:6 }}><button type="button" onClick={onClose} aria-label="Close product details" style={{ width:34, height:34, borderRadius:"50%", border:"1px solid #eeeeea", background:"#fbfbfb", color:DARK, fontSize:20, cursor:"pointer", lineHeight:1 }}>×</button></div>
      <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:18 }}><ProductImage product={product} size={96} /><div style={{ flex:1, minWidth:0 }}><div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}><span style={{ display:"inline-flex", background:`${accent}18`, border:`1px solid ${accent}40`, color:DARK, borderRadius:999, padding:"6px 9px", fontSize:11, fontWeight:950 }}>{badge}</span><span style={{ display:"inline-flex", background:"#fbfbfb", border:"1px solid #eeeeea", color:"#666", borderRadius:999, padding:"6px 9px", fontSize:11, fontWeight:850 }}>{status}</span></div><h3 style={{ margin:"0 0 8px", fontSize:26, lineHeight:1.05, fontWeight:950, color:DARK }}>{product.name}</h3>{productDescription(product) && <p style={{ margin:"0 0 12px", fontSize:14, lineHeight:1.55, color:"#666" }}>{productDescription(product)}</p>}<div style={{ display:"inline-flex", background:`${accent}18`, border:`1px solid ${accent}40`, color:DARK, borderRadius:999, padding:"8px 11px", fontSize:14, fontWeight:950 }}>{productDisplayPrice(product)}</div></div></div>
      {isService && <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:16, padding:12, marginBottom:14, fontSize:12, color:"#666", lineHeight:1.5 }}><strong>Usual availability:</strong> {formatAvailability(meta)}</div>}
      {variants.length > 0 && <div style={{ marginBottom:16 }}><div style={{ fontSize:12, fontWeight:950, color:accent, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:9 }}>Choose an option</div><div style={{ display:"grid", gap:9 }}>{variants.map((variant) => { const selected = selectedVariantId === variant.id; return <button key={variant.id} type="button" onClick={() => setSelectedVariantId(variant.id)} style={{ textAlign:"left", border:`1.5px solid ${selected ? accent : "#eeeeea"}`, background:selected ? `${accent}12` : "#fbfbfb", borderRadius:16, padding:12, cursor:"pointer" }}><div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}><span style={{ fontSize:14, fontWeight:900, color:DARK }}>{variant.name}</span>{Number(variant.price) > 0 && <span style={{ fontSize:14, fontWeight:950, color:DARK }}>R{Number(variant.price).toLocaleString()}</span>}</div>{variant.description && <div style={{ fontSize:12, color:"#777", lineHeight:1.45, marginTop:4 }}>{variant.description}</div>}</button>; })}</div></div>}
      <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:18, padding:14, marginBottom:14 }}>
        <div style={{ fontSize:15, fontWeight:950, color:DARK, marginBottom:4 }}>{actionLabel}</div>
        <p style={{ margin:"0 0 12px", fontSize:13, color:"#777", lineHeight:1.55 }}>{isService ? "Choose an available slot, then add your details. The Vula will still confirm the booking." : `Add your details so ${business.name} can reply to the right person. We will then open WhatsApp.`}</p>
        <label style={{ display:"grid", gap:5, fontSize:12, color:"#888", fontWeight:850, marginBottom:10 }}>Your name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="e.g. Sipho" style={{ border:"1px solid #eeeeea", borderRadius:12, padding:"11px 12px", fontSize:14 }} /></label>
        <label style={{ display:"grid", gap:5, fontSize:12, color:"#888", fontWeight:850, marginBottom:10 }}>Your WhatsApp number<input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="e.g. 071 123 4567" style={{ border:"1px solid #eeeeea", borderRadius:12, padding:"11px 12px", fontSize:14 }} /></label>
        {isService && <div style={{ marginBottom:10 }}><div style={{ fontSize:12, color:"#888", fontWeight:900, marginBottom:7 }}>Choose available date</div><div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>{bookableDates.length === 0 ? <span style={{ fontSize:12, color:"#888" }}>No public booking days set up yet.</span> : bookableDates.map((date) => <button key={date.value} type="button" onClick={() => setPreferredDate(date.value)} style={{ border:`1.5px solid ${preferredDate === date.value ? accent : "#eeeeea"}`, background:preferredDate === date.value ? `${accent}12` : "#fff", color:DARK, borderRadius:12, padding:"9px 11px", minWidth:92, fontSize:12, fontWeight:900, cursor:"pointer" }}>{date.label}</button>)}</div></div>}
        {isService && <div style={{ marginBottom:10 }}><div style={{ fontSize:12, color:"#888", fontWeight:900, marginBottom:7 }}>{loadingSlots ? "Checking booked slots..." : "Choose available time"}</div><div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{preferredDate && availableTimes.length === 0 ? <span style={{ fontSize:12, color:"#9f1239", background:"#fff5f7", border:"1px solid #ffd7e4", borderRadius:12, padding:"8px 10px", fontWeight:850 }}>No open slots on this day. Please choose another day.</span> : availableTimes.map((time) => <button key={time} type="button" onClick={() => setPreferredTime(time)} style={{ border:`1.5px solid ${preferredTime === time ? accent : "#eeeeea"}`, background:preferredTime === time ? accent : "#fff", color:preferredTime === time ? accentText : DARK, borderRadius:999, padding:"9px 12px", fontSize:12, fontWeight:950, cursor:"pointer" }}>{time}</button>)}</div></div>}
        {meta.item_type === "made_to_order" && <label style={{ display:"grid", gap:5, fontSize:12, color:"#888", fontWeight:850, marginBottom:10 }}>Needed by date<input type="date" value={neededByDate} onChange={(event) => setNeededByDate(event.target.value)} style={{ border:"1px solid #eeeeea", borderRadius:12, padding:"10px 12px", fontSize:14 }} />{leadTimeWarning(product, neededByDate) && <span style={{ color:"#9f1239", fontSize:11, fontWeight:850 }}>{leadTimeWarning(product, neededByDate)}</span>}</label>}
        <label style={{ display:"grid", gap:5, fontSize:12, color:"#888", fontWeight:850 }}>Message / notes<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional" style={{ border:"1px solid #eeeeea", borderRadius:12, padding:"11px 12px", fontSize:14 }} /></label>
        {formError && <div style={{ color:"#9f1239", background:"#fff5f7", border:"1px solid #ffd7e4", borderRadius:12, padding:"9px 10px", marginTop:10, fontSize:12, fontWeight:800 }}>{formError}</div>}
      </div>
      {business.whatsapp ? <button type="button" onClick={handleWhatsAppEnquiry} disabled={saving || isSoldOut(product) || (isService && (!preferredDate || !preferredTime))} style={{ width:"100%", display:"block", textAlign:"center", background:isSoldOut(product) || (isService && (!preferredDate || !preferredTime)) ? "#d8d8d4" : accent, color:isSoldOut(product) || (isService && (!preferredDate || !preferredTime)) ? "#777" : accentText, borderRadius:16, padding:"15px 18px", fontSize:15, fontWeight:950, border:"none", cursor:isSoldOut(product) || (isService && (!preferredDate || !preferredTime)) ? "not-allowed" : "pointer", boxShadow:isSoldOut(product) ? "none" : `0 12px 30px ${accent}36` }}>{saving ? "Saving lead..." : isSoldOut(product) ? "Sold out" : `Continue to WhatsApp`}</button> : <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:16, padding:14, fontSize:13, color:"#888", textAlign:"center" }}>WhatsApp number not available.</div>}
    </div>
  </div>;
}

function ReviewCarousel({ reviews, accent }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeReview = reviews[activeIndex] || reviews[0];
  useEffect(() => { setActiveIndex(0); }, [reviews.length]);
  useEffect(() => { if (reviews.length <= 1) return undefined; const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % reviews.length), 4500); return () => window.clearInterval(timer); }, [reviews.length]);
  if (!activeReview) return null;
  const rating = Math.max(1, Math.min(5, Number(activeReview.rating || 5)));
  return <div><div className="review-slide-card" style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:18, padding:14, minHeight:96 }}><div style={{ color:"#ffb60a", fontSize:14, marginBottom:6 }}>{"★".repeat(rating)}</div><div style={{ fontSize:14, color:DARK, lineHeight:1.6, fontWeight:650 }}>{activeReview.review_text}</div><div style={{ fontSize:12, color:"#767b81", fontWeight:800, marginTop:8 }}>{activeReview.customer_name || "Customer"}</div></div>{reviews.length > 1 && <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:12 }}>{reviews.map((review, index) => <button key={review.id || index} type="button" onClick={() => setActiveIndex(index)} style={{ width: activeIndex === index ? 18 : 7, height:7, borderRadius:999, border:"none", padding:0, cursor:"pointer", background: activeIndex === index ? accent : "#d8d8d4" }} />)}</div>}</div>;
}

export function publicPageFallback(slug) {
  return slug === "nomsa-nails" ? { business: NOMSA_FALLBACK.business, products: NOMSA_FALLBACK.products, reviews: [] } : null;
}

export default function PublicBusinessPage({ slug, initialData = null }) {
  // initialData is supplied by the server render (and passed through to the browser)
  // so the page shows real content immediately, which is what crawlers read.
  const seeded = initialData?.business ? initialData : null;
  const [business, setBusiness] = useState(seeded ? seeded.business : null);
  const [products, setProducts] = useState(seeded && Array.isArray(seeded.products) ? seeded.products : []);
  const [reviews, setReviews] = useState(seeded && Array.isArray(seeded.reviews) ? seeded.reviews : []);
  const [loading, setLoading] = useState(!seeded);
  const [notFound, setNotFound] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (seeded) return undefined;
    let cancelled = false;
    async function loadBusiness() {
      setLoading(true); setNotFound(false);
      const { data: pageData, error } = await supabase.rpc("get_public_business_page", { input_slug: slug });
      if (cancelled) return;
      if (error) console.error("Public business page load:", error);
      if (pageData?.business) { setBusiness(pageData.business); setProducts(Array.isArray(pageData.products) ? pageData.products : []); setReviews(Array.isArray(pageData.reviews) ? pageData.reviews : []); setLoading(false); return; }
      if (slug === "nomsa-nails") { setBusiness(NOMSA_FALLBACK.business); setProducts(NOMSA_FALLBACK.products); setReviews([]); setLoading(false); return; }
      setNotFound(true); setLoading(false);
    }
    loadBusiness(); return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div style={{ minHeight:"100vh", background:"#fbfbfb", display:"flex", alignItems:"center", justifyContent:"center", color:"#888", fontFamily:"'Inter', -apple-system, sans-serif" }}>Loading business page…</div>;
  if (notFound || !business) return <div style={{ minHeight:"100vh", background:"#fbfbfb", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Inter', -apple-system, sans-serif" }}><div style={{ width:"100%", maxWidth:360, background:"#fff", border:"1px solid #eeeeea", borderRadius:26, padding:28, textAlign:"center", boxShadow:"0 18px 50px rgba(32,32,33,0.08)" }}><div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}><Logo size="compact" iconOnly /></div><h1 style={{ fontSize:22, fontWeight:900, color:DARK, marginBottom:8 }}>Page not found</h1><p style={{ fontSize:14, color:"#888", lineHeight:1.6, marginBottom:18 }}>This VulaTrade business page is not available yet.</p><a href="/" style={{ display:"inline-block", background:LIME, color:"#fff", borderRadius:14, padding:"12px 18px", fontSize:14, fontWeight:800, textDecoration:"none" }}>Go to VulaTrade</a></div></div>;

  const logoUrl = business.catalogue || business.logo_url || business.image_url || "";
  const phone = business.phone || business.call_number || "";
  const links = socialLinks(business);
  const activeProducts = products.filter((p) => p.is_active !== false);
  const pageTheme = resolvePageTheme(business);
  const accentText = readableTextOn(pageTheme.accent);
  const headingHeaderText = pageTheme.headingText || pageTheme.text;
  const mutedHeaderText = pageTheme.descriptionText || (pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.58)");
  const faintHeaderText = pageTheme.metaText || (pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.56)" : "rgba(0,0,0,0.45)");
  const headerBaseText = headingHeaderText === "#ffffff" ? "#ffffff" : pageTheme.text;
  const logoCardBg = headerBaseText === "#ffffff" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";
  const displayDescription = businessDescriptionOrDefault(business.description, business.category);

  return <main style={{ minHeight:"100vh", background:"linear-gradient(180deg, #fbfbfb 0%, #f8f8f8 46%, #ffffff 100%)", fontFamily:"'Inter', -apple-system, sans-serif", color:DARK, padding:18 }}>
    <style>{`@keyframes reviewSlideIn { from { opacity: 0; transform: translateX(38px); } to { opacity: 1; transform: translateX(0); } }.review-slide-card { animation: reviewSlideIn 420ms ease both; }.product-card-clickable:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(15,23,42,0.07); }`}</style>
    <div style={{ width:"100%", maxWidth:760, margin:"0 auto" }}>
      <section style={{ position:"relative", overflow:"hidden", ...backgroundStyleForTheme(pageTheme), color:headingHeaderText, padding:"26px 22px 24px", borderRadius:34, boxShadow:"0 22px 70px rgba(32,32,33,0.14)" }}><div style={{ position:"relative" }}><div style={{ display:"inline-flex", alignItems:"center", gap:8, background:headerBaseText === "#ffffff" ? "rgba(255,255,255,0.11)" : "rgba(0,0,0,0.06)", border:`1px solid ${pageTheme.accent}66`, color:pageTheme.accent, borderRadius:999, padding:"7px 11px", fontSize:11, fontWeight:850, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:22 }}><span style={{ width:6, height:6, borderRadius:"50%", background:pageTheme.accent }} />Open for enquiries</div><div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18 }}>{logoUrl ? <img src={logoUrl} alt={`${business.name} logo`} style={{ width:84, height:84, borderRadius:24, objectFit:"cover", border:`2px solid ${pageTheme.accent}`, boxShadow:"0 14px 36px rgba(0,0,0,0.22)" }} /> : <div style={{ width:84, height:84, borderRadius:24, background:logoCardBg, border:`2px solid ${pageTheme.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, boxShadow:"0 14px 36px rgba(0,0,0,0.16)" }}>{business.background_style || "⭐"}</div>}<div style={{ minWidth:0 }}><h1 style={{ fontSize:"clamp(34px, 7vw, 54px)", lineHeight:0.95, margin:"0 0 10px", fontWeight:950, color:headingHeaderText }}>{business.name}</h1><p style={{ display:"inline-flex", alignItems:"center", flexWrap:"wrap", gap:6, margin:0, fontSize:13, color:faintHeaderText, fontWeight:750 }}><span>{business.category || "Local business"}</span>{business.area && <span style={{ opacity:0.55 }}>•</span>}{business.area && <span>{business.area}</span>}</p></div></div>{displayDescription && <p style={{ fontSize:16, lineHeight:1.7, color:mutedHeaderText, margin:"0 0 22px", maxWidth:620 }}>{displayDescription}</p>}<div style={{ display:"grid", gridTemplateColumns:business.whatsapp && phone ? "1fr auto" : "1fr", gap:10, alignItems:"stretch" }}>{business.whatsapp && <a href={whatsappLink(business.whatsapp, business.name)} target="_blank" rel="noopener noreferrer" style={{ textAlign:"center", background:pageTheme.accent, color:accentText, borderRadius:16, padding:"15px 18px", fontSize:15, fontWeight:950, textDecoration:"none", boxShadow:`0 12px 30px ${pageTheme.accent}36` }}>Enquire on WhatsApp</a>}{phone && <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ textAlign:"center", background:headerBaseText === "#ffffff" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)", color:pageTheme.accent, border:`1.5px solid ${pageTheme.accent}`, borderRadius:16, padding:"14px 18px", fontSize:15, fontWeight:850, textDecoration:"none", minWidth:92 }}>Call</a>}</div>{links.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:14 }}>{links.map((link) => <a key={link.label} href={normaliseUrl(link.url)} target="_blank" rel="noopener noreferrer" style={{ background:headerBaseText === "#ffffff" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)", border:`1px solid ${pageTheme.accent}55`, borderRadius:999, padding:"8px 12px", fontSize:12, fontWeight:850, color:headingHeaderText, textDecoration:"none" }}>{link.label}</a>)}</div>}</div></section>
      {reviews.length > 0 && <section style={{ padding:"18px 0 0" }}><div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:26, padding:20, boxShadow:"0 14px 42px rgba(15,23,42,0.06)" }}><div style={{ color:pageTheme.accent, fontSize:11, fontWeight:900, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Customer reviews</div><h2 style={{ fontSize:22, fontWeight:950, margin:"0 0 14px" }}>What customers say</h2><ReviewCarousel reviews={reviews} accent={pageTheme.accent} /></div></section>}
      <section style={{ padding:"26px 0 0" }}><div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:26, padding:20, boxShadow:"0 14px 42px rgba(15,23,42,0.06)" }}><div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:12, marginBottom:18 }}><div><div style={{ color:pageTheme.accent, fontSize:11, fontWeight:900, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>What we offer</div><h2 style={{ fontSize:22, fontWeight:950, margin:0 }}>Offers & prices</h2></div><span style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:999, padding:"7px 10px", fontSize:12, color:"#777", fontWeight:800, whiteSpace:"nowrap" }}>{activeProducts.length} offer{activeProducts.length !== 1 ? "s" : ""}</span></div>{activeProducts.length === 0 ? <div style={{ background:"#fbfbfb", border:"1px dashed #d8d8d4", borderRadius:18, padding:28, textAlign:"center", color:"#888", fontSize:14 }}>Offers will appear here soon.</div> : <div style={{ display:"grid", gap:12 }}>{activeProducts.map((product) => { const variants = normaliseVariants(product.variants || []); return <button key={product.id || product.name} type="button" onClick={() => setSelectedProduct(product)} className="product-card-clickable" style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:14, border:"1px solid #eeeeea", borderRadius:20, padding:14, background:"linear-gradient(180deg, #ffffff 0%, #fbfbfa 100%)", boxShadow:"0 8px 22px rgba(15,23,42,0.04)", cursor:"pointer", transition:"all 180ms ease" }}><ProductImage product={product} /><div style={{ flex:1, minWidth:0 }}><div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}><span style={{ fontSize:11, background:`${pageTheme.accent}18`, border:`1px solid ${pageTheme.accent}40`, color:DARK, borderRadius:999, padding:"4px 8px", fontWeight:900 }}>{productBadge(product)}</span><span style={{ fontSize:11, background:"#fbfbfb", border:"1px solid #eeeeea", color:"#666", borderRadius:999, padding:"4px 8px", fontWeight:800 }}>{productStatus(product)}</span></div><div style={{ fontSize:16, fontWeight:900, color:DARK, marginBottom:productDescription(product) ? 4 : 0 }}>{product.name}</div>{productDescription(product) && <div style={{ fontSize:13, color:"#777", lineHeight:1.5 }}>{productDescription(product)}</div>}{variants.length > 0 && <div style={{ marginTop:6, fontSize:11, color:pageTheme.accent, fontWeight:900 }}>{variants.length} option{variants.length !== 1 ? "s" : ""} available</div>}</div><div style={{ display:"grid", gap:7, justifyItems:"end" }}><div style={{ background:`${pageTheme.accent}18`, border:`1px solid ${pageTheme.accent}40`, color:DARK, borderRadius:999, padding:"8px 10px", fontSize:14, fontWeight:950, whiteSpace:"nowrap" }}>{productDisplayPrice(product)}</div><span style={{ fontSize:11, color:pageTheme.accent, fontWeight:900 }}>{itemActionLabel(product)}</span></div></button>; })}</div>}</div></section>
      <footer style={{ padding:"22px 0 8px", textAlign:"center" }}><div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #eeeeea", borderRadius:999, padding:"8px 14px", boxShadow:"0 8px 24px rgba(15,23,42,0.05)", fontSize:12, color:"#888", fontWeight:800 }}><span>Powered by</span><Logo size="small" /></div></footer>
    </div>
    {selectedProduct && <ProductDetailModal product={selectedProduct} business={business} accent={pageTheme.accent} accentText={accentText} onClose={() => setSelectedProduct(null)} />}
  </main>;
}

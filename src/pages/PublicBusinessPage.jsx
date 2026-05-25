import React, { useEffect, useState } from "react";
import { BG_COLOURS, DARK, LIME } from "../constants";
import { businessDescriptionOrDefault } from "../businessDescriptions";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";
import { waLink } from "../utils";

const FALLBACK_ACCENT = "#ea4c89";

const NOMSA_FALLBACK = {
  business: {
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
    { id: "gel-overlay", name: "Gel overlay", price: 220, description: "Fresh colour, neat finish.", image: "💅", is_active: true, variants: [{ id:"short", name:"Short nails", price:220, description:"Neat short gel overlay" }, { id:"medium", name:"Medium nails", price:260, description:"Medium gel overlay" }] },
    { id: "acrylic-set", name: "Acrylic set", price: 350, description: "Custom length and shape.", image: "✨", is_active: true },
    { id: "soak-off", name: "Soak off", price: 80, description: "Gentle removal before your next set.", image: "🧴", is_active: true },
  ],
};

function normaliseUrl(value) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function whatsappLink(number, businessName) {
  if (!number) return "#";
  const text = `Hi ${businessName}, I'm interested in your products/services on VulaTrade.`;
  return waLink(number, text);
}

function productWhatsappLink(number, businessName, product, variant) {
  if (!number || !product) return "#";
  const text = variant
    ? `Hi ${businessName}, I saw your ${product.name} on VulaTrade. I would like to order / enquire about ${variant.name} for R${Number(variant.price || 0).toLocaleString()}.`
    : `Hi ${businessName}, I saw your ${product.name} on VulaTrade. Please can I order / enquire?`;
  return waLink(number, text);
}

function normaliseVariants(variants = []) {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((variant) => ({
      id: variant.id || `${variant.name || "variant"}-${variant.price || ""}`,
      name: variant.name || "",
      price: variant.price ?? "",
      description: variant.description || "",
    }))
    .filter((variant) => variant.name || variant.price || variant.description);
}

function productDisplayPrice(product) {
  const basePrice = Number(product.price || 0);
  const variants = normaliseVariants(product.variants || []);
  const variantPrices = variants.map((variant) => Number(variant.price || 0)).filter((price) => price > 0);

  if (variantPrices.length > 0) {
    const lowest = Math.min(...variantPrices);
    if (!basePrice || lowest !== basePrice || variants.length > 1) {
      return `From R${lowest.toLocaleString()}`;
    }
  }

  return basePrice > 0 ? `R${basePrice.toLocaleString()}` : "Ask price";
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
  const savedLower = typeof savedTheme === "string" ? savedTheme.toLowerCase() : "";
  const matched = BG_COLOURS.find((c) => c.value === savedTheme || c.name.toLowerCase() === savedLower);

  if (matched) return matched;
  if (savedTheme && typeof savedTheme === "string" && savedTheme.startsWith("#")) {
    return { value: DARK, text: "#ffffff", accent: savedTheme };
  }
  return { value: DARK, text: "#ffffff", accent: FALLBACK_ACCENT };
}

function readableTextOn(hex) {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return DARK;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? DARK : "#ffffff";
}

function ProductImage({ product, size = 66 }) {
  const image = product.image || product.icon || "🛍️";
  const isUrl = typeof image === "string" && image.startsWith("http");

  if (isUrl) {
    return <img src={image} alt={product.name} style={{ width: `${size}px`, height: `${size}px`, borderRadius: size > 80 ? "24px" : "18px", objectFit: "cover", border: "1px solid #eeeeea", flexShrink: 0 }} />;
  }

  return <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: size > 80 ? "24px" : "18px", background: "#fbfbfb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size > 80 ? "42px" : "28px", flexShrink: 0 }}>{image}</div>;
}

function ProductDetailModal({ product, business, accent, accentText, onClose }) {
  const variants = normaliseVariants(product?.variants || []);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || null;

  useEffect(() => { setSelectedVariantId(variants[0]?.id || ""); }, [product?.id]);
  if (!product) return null;

  return (
    <div role="dialog" aria-modal="true" style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.48)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:"18px" }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:"560px", background:"#fff", borderRadius:"28px", padding:"18px", boxShadow:"0 24px 80px rgba(0,0,0,0.24)", maxHeight:"88vh", overflowY:"auto" }} onClick={(event) => event.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"6px" }}>
          <button type="button" onClick={onClose} aria-label="Close product details" style={{ width:"34px", height:"34px", borderRadius:"50%", border:"1px solid #eeeeea", background:"#fbfbfb", color:DARK, fontSize:"20px", cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:"flex", gap:"16px", alignItems:"flex-start", marginBottom:"18px" }}>
          <ProductImage product={product} size={96} />
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ margin:"0 0 8px", fontSize:"26px", lineHeight:1.05, fontWeight:950, color:DARK }}>{product.name}</h3>
            {product.description && <p style={{ margin:"0 0 12px", fontSize:"14px", lineHeight:1.55, color:"#666" }}>{product.description}</p>}
            <div style={{ display:"inline-flex", background:`${accent}18`, border:`1px solid ${accent}40`, color:DARK, borderRadius:"999px", padding:"8px 11px", fontSize:"14px", fontWeight:950 }}>{productDisplayPrice(product)}</div>
          </div>
        </div>
        {variants.length > 0 && <div style={{ marginBottom:"16px" }}><div style={{ fontSize:"12px", fontWeight:950, color:accent, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"9px" }}>Choose an option</div><div style={{ display:"grid", gap:"9px" }}>{variants.map((variant) => { const selected = selectedVariantId === variant.id; return <button key={variant.id} type="button" onClick={() => setSelectedVariantId(variant.id)} style={{ textAlign:"left", border:`1.5px solid ${selected ? accent : "#eeeeea"}`, background:selected ? `${accent}12` : "#fbfbfb", borderRadius:"16px", padding:"12px", cursor:"pointer" }}><div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px" }}><span style={{ fontSize:"14px", fontWeight:900, color:DARK }}>{variant.name}</span>{Number(variant.price) > 0 && <span style={{ fontSize:"14px", fontWeight:950, color:DARK }}>R{Number(variant.price).toLocaleString()}</span>}</div>{variant.description && <div style={{ fontSize:"12px", color:"#777", lineHeight:1.45, marginTop:"4px" }}>{variant.description}</div>}</button>; })}</div></div>}
        {business.whatsapp ? <a href={productWhatsappLink(business.whatsapp, business.name, product, selectedVariant)} target="_blank" rel="noopener noreferrer" style={{ display:"block", textAlign:"center", background:accent, color:accentText, borderRadius:"16px", padding:"15px 18px", fontSize:"15px", fontWeight:950, textDecoration:"none", boxShadow:`0 12px 30px ${accent}36` }}>Order on WhatsApp</a> : <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", fontSize:"13px", color:"#888", textAlign:"center" }}>WhatsApp number not available.</div>}
      </div>
    </div>
  );
}

function ReviewCarousel({ reviews, accent }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeReview = reviews[activeIndex] || reviews[0];
  const hasMultiple = reviews.length > 1;
  const rating = Math.max(1, Math.min(5, Number(activeReview?.rating || 5)));
  useEffect(() => { setActiveIndex(0); }, [reviews.length]);
  useEffect(() => { if (!hasMultiple || paused) return undefined; const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % reviews.length), 4500); return () => window.clearInterval(timer); }, [hasMultiple, paused, reviews.length]);
  if (!activeReview) return null;
  return <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={{ overflow: "hidden" }}><div key={activeReview.id || activeIndex} className="review-slide-card" style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"18px", padding:"14px", minHeight:"96px" }}><div style={{ color:"#ffb60a", fontSize:"14px", marginBottom:"6px" }}>{"★".repeat(rating)}</div><div style={{ fontSize:"14px", color:DARK, lineHeight:1.6, fontWeight:650 }}>{activeReview.review_text}</div><div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", marginTop:"8px", flexWrap:"wrap" }}><div style={{ fontSize:"12px", color:"#767b81", fontWeight:800 }}>{activeReview.customer_name || "Customer"}</div>{hasMultiple && <div style={{ fontSize:"11px", color:"#aaa", fontWeight:800 }}>{activeIndex + 1} of {reviews.length}</div>}</div></div>{hasMultiple && <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", marginTop:"12px" }}>{reviews.map((review, index) => <button key={review.id || index} type="button" aria-label={`Show review ${index + 1}`} onClick={() => setActiveIndex(index)} style={{ width: activeIndex === index ? "18px" : "7px", height: "7px", borderRadius: "999px", border: "none", padding: 0, cursor: "pointer", background: activeIndex === index ? accent : "#d8d8d4", transition: "all 180ms ease" }} />)}</div>}</div>;
}

export default function PublicBusinessPage({ slug }) {
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadBusiness() {
      setLoading(true); setNotFound(false);
      const { data: foundBusiness, error: businessError } = await supabase.from("businesses").select("*").eq("slug", slug).maybeSingle();
      if (cancelled) return;
      if (foundBusiness) {
        const { data: foundProducts, error: productsError } = await supabase.from("products").select("*").eq("business_id", foundBusiness.id).eq("is_active", true).order("created_at");
        const { data: foundReviews, error: reviewsError } = await supabase.from("reviews").select("*").eq("business_id", foundBusiness.id).eq("approved", true).order("created_at", { ascending: false });
        if (productsError) console.error("Public products load:", productsError);
        if (reviewsError) console.error("Public reviews load:", reviewsError);
        if (!cancelled) { setBusiness(foundBusiness); setProducts(foundProducts || []); setReviews(foundReviews || []); setLoading(false); }
        return;
      }
      if (businessError) console.error("Public business load:", businessError);
      if (slug === "nomsa-nails") { setBusiness(NOMSA_FALLBACK.business); setProducts(NOMSA_FALLBACK.products); setReviews([]); setLoading(false); return; }
      setNotFound(true); setLoading(false);
    }
    loadBusiness(); return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div style={{ minHeight: "100vh", background: "#fbfbfb", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: "'Inter', -apple-system, sans-serif" }}>Loading business page…</div>;
  if (notFound || !business) return <div style={{ minHeight: "100vh", background: "#fbfbfb", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', -apple-system, sans-serif" }}><div style={{ width: "100%", maxWidth: "360px", background: "#fff", border: "1px solid #eeeeea", borderRadius: "26px", padding: "28px", textAlign: "center", boxShadow:"0 18px 50px rgba(32,32,33,0.08)" }}><div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}><Logo size="compact" iconOnly /></div><h1 style={{ fontSize: "22px", fontWeight: 900, color: DARK, marginBottom: "8px" }}>Page not found</h1><p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, marginBottom: "18px" }}>This VulaTrade business page is not available yet.</p><a href="/" style={{ display: "inline-block", background: LIME, color: "#fff", borderRadius: "14px", padding: "12px 18px", fontSize: "14px", fontWeight: 800, textDecoration: "none" }}>Go to VulaTrade</a></div></div>;

  const logoUrl = business.catalogue || business.logo_url || business.image_url || "";
  const phone = business.phone || business.call_number || "";
  const links = socialLinks(business);
  const activeProducts = products.filter((p) => p.is_active !== false);
  const pageTheme = resolvePageTheme(business);
  const accentText = readableTextOn(pageTheme.accent);
  const mutedHeaderText = pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.66)" : "rgba(0,0,0,0.58)";
  const faintHeaderText = pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.52)" : "rgba(0,0,0,0.45)";
  const logoCardBg = pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  const heroGlow = `${pageTheme.accent}24`;
  const displayDescription = businessDescriptionOrDefault(business.description, business.category);

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #fbfbfb 0%, #f8f8f8 46%, #ffffff 100%)", fontFamily: "'Inter', -apple-system, sans-serif", color: DARK, padding: "18px" }}>
      <style>{`@keyframes reviewSlideIn { from { opacity: 0; transform: translateX(38px); } to { opacity: 1; transform: translateX(0); } }.review-slide-card { animation: reviewSlideIn 420ms ease both; }.product-card-clickable:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(15,23,42,0.07); }`}</style>
      <div style={{ width: "100%", maxWidth: "760px", margin: "0 auto" }}>
        <section style={{ position: "relative", overflow: "hidden", background: pageTheme.value, color: pageTheme.text, padding: "26px 22px 24px", borderRadius: "34px", boxShadow: "0 22px 70px rgba(32,32,33,0.14)" }}>
          <div style={{ position: "absolute", inset: "-40% -25% auto auto", width: "220px", height: "220px", borderRadius: "50%", background: heroGlow, filter: "blur(4px)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)", border: `1px solid ${pageTheme.accent}66`, color: pageTheme.accent, borderRadius: "999px", padding: "7px 11px", fontSize: "11px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "22px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: pageTheme.accent }} />Open for enquiries</div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" }}>{logoUrl ? <img src={logoUrl} alt={`${business.name} logo`} style={{ width: "84px", height: "84px", borderRadius: "24px", objectFit: "cover", border: `2px solid ${pageTheme.accent}`, boxShadow: "0 14px 36px rgba(0,0,0,0.22)" }} /> : <div style={{ width: "84px", height: "84px", borderRadius: "24px", background: logoCardBg, border: `2px solid ${pageTheme.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "38px", boxShadow: "0 14px 36px rgba(0,0,0,0.16)" }}>{business.background_style || "⭐"}</div>}<div style={{ minWidth: 0 }}><h1 style={{ fontSize: "clamp(34px, 7vw, 54px)", lineHeight: 0.95, margin: "0 0 10px", fontWeight: 950, letterSpacing: "0" }}>{business.name}</h1><p style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: "6px", margin: 0, fontSize: "13px", color: faintHeaderText, fontWeight: 750 }}><span>{business.category || "Local business"}</span>{business.area && <span style={{ opacity: 0.55 }}>•</span>}{business.area && <span>{business.area}</span>}</p></div></div>
            {displayDescription && <p style={{ fontSize: "16px", lineHeight: 1.7, color: mutedHeaderText, margin: "0 0 22px", maxWidth: "620px" }}>{displayDescription}</p>}
            <div style={{ display: "grid", gridTemplateColumns: business.whatsapp && phone ? "1fr auto" : "1fr", gap: "10px", alignItems: "stretch" }}>{business.whatsapp && <a href={whatsappLink(business.whatsapp, business.name)} target="_blank" rel="noopener noreferrer" style={{ textAlign: "center", background: pageTheme.accent, color: accentText, borderRadius: "16px", padding: "15px 18px", fontSize: "15px", fontWeight: 950, textDecoration: "none", boxShadow: `0 12px 30px ${pageTheme.accent}36` }}>Enquire on WhatsApp</a>}{phone && <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ textAlign: "center", background: pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: pageTheme.accent, border: `1.5px solid ${pageTheme.accent}`, borderRadius: "16px", padding: "14px 18px", fontSize: "15px", fontWeight: 850, textDecoration: "none", minWidth: "92px" }}>Call</a>}</div>
            {links.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>{links.map((link) => <a key={link.label} href={normaliseUrl(link.url)} target="_blank" rel="noopener noreferrer" style={{ background: pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", border: `1px solid ${pageTheme.accent}55`, borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 850, color: pageTheme.text, textDecoration: "none" }}>{link.label}</a>)}</div>}
          </div>
        </section>
        {reviews.length > 0 && <section style={{ padding: "18px 0 0" }}><div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "26px", padding: "20px", boxShadow: "0 14px 42px rgba(15,23,42,0.06)" }}><div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px", marginBottom:"14px" }}><div><div style={{ color: pageTheme.accent, fontSize: "11px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Customer reviews</div><h2 style={{ fontSize: "22px", fontWeight: 950, margin: 0, letterSpacing: "0" }}>What customers say</h2></div><span style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"999px", padding:"7px 10px", fontSize:"12px", color:"#777", fontWeight:800, whiteSpace:"nowrap" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span></div><ReviewCarousel reviews={reviews} accent={pageTheme.accent} /></div></section>}
        <section style={{ padding: "26px 0 0" }}><div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "26px", padding: "20px", boxShadow: "0 14px 42px rgba(15,23,42,0.06)" }}><div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}><div><div style={{ color: pageTheme.accent, fontSize: "11px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>What we offer</div><h2 style={{ fontSize: "22px", fontWeight: 950, margin: 0, letterSpacing: "0" }}>Services & prices</h2></div><span style={{ background: "#fbfbfb", border: "1px solid #eeeeea", borderRadius: "999px", padding: "7px 10px", fontSize: "12px", color: "#777", fontWeight: 800, whiteSpace: "nowrap" }}>{activeProducts.length} item{activeProducts.length !== 1 ? "s" : ""}</span></div>{activeProducts.length === 0 ? <div style={{ background: "#fbfbfb", border: "1px dashed #d8d8d4", borderRadius: "18px", padding: "28px", textAlign: "center", color: "#888", fontSize: "14px" }}>Services will appear here soon.</div> : <div style={{ display: "grid", gap: "12px" }}>{activeProducts.map((product) => { const variants = normaliseVariants(product.variants || []); return <button key={product.id || product.name} type="button" onClick={() => setSelectedProduct(product)} className="product-card-clickable" style={{ width:"100%", textAlign:"left", display: "flex", alignItems: "center", gap: "14px", border: "1px solid #eeeeea", borderRadius: "20px", padding: "14px", background: "linear-gradient(180deg, #ffffff 0%, #fbfbfa 100%)", boxShadow: "0 8px 22px rgba(15,23,42,0.04)", cursor:"pointer", transition:"all 180ms ease" }}><ProductImage product={product} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: "16px", fontWeight: 900, color: DARK, marginBottom: product.description ? "4px" : 0 }}>{product.name}</div>{product.description && <div style={{ fontSize: "13px", color: "#777", lineHeight: 1.5 }}>{product.description}</div>}{variants.length > 0 && <div style={{ marginTop:"6px", fontSize:"11px", color:pageTheme.accent, fontWeight:900 }}>{variants.length} option{variants.length !== 1 ? "s" : ""} available</div>}</div><div style={{ background: `${pageTheme.accent}18`, border: `1px solid ${pageTheme.accent}40`, color: DARK, borderRadius: "999px", padding: "8px 10px", fontSize: "14px", fontWeight: 950, whiteSpace: "nowrap" }}>{productDisplayPrice(product)}</div></button>; })}</div>}</div></section>
        <footer style={{ padding: "22px 0 8px", textAlign: "center" }}><div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid #eeeeea", borderRadius: "999px", padding: "8px 14px", boxShadow: "0 8px 24px rgba(15,23,42,0.05)", fontSize: "12px", color: "#888", fontWeight: 800 }}><span>Powered by</span><Logo size="small" /></div></footer>
      </div>
      {selectedProduct && <ProductDetailModal product={selectedProduct} business={business} accent={pageTheme.accent} accentText={accentText} onClose={() => setSelectedProduct(null)} />}
    </main>
  );
}

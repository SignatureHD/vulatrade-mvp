import React, { useEffect, useState } from "react";
import { BG_COLOURS, DARK } from "../constants";
import { supabase } from "../lib/supabase";

const FALLBACK_ACCENT = "#2563eb";

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
    { id: "gel-overlay", name: "Gel overlay", price: 220, description: "Fresh colour, neat finish.", image: "💅", is_active: true },
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
  const text = `Hi! I found ${businessName} on VulaTrade and would like to enquire.`;
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
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

function ProductImage({ product }) {
  const image = product.image || product.icon || "🛍️";
  const isUrl = typeof image === "string" && image.startsWith("http");

  if (isUrl) {
    return (
      <img
        src={image}
        alt=""
        style={{ width: "52px", height: "52px", borderRadius: "12px", objectFit: "cover", border: "1px solid #eeeeea", flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "#f5f5f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
      {image}
    </div>
  );
}

export default function PublicBusinessPage({ slug }) {
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBusiness() {
      setLoading(true);
      setNotFound(false);

      const { data: foundBusiness, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;

      if (foundBusiness) {
        const { data: foundProducts, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", foundBusiness.id)
          .eq("is_active", true)
          .order("created_at");

        if (productsError) console.error("Public products load:", productsError);
        if (!cancelled) {
          setBusiness(foundBusiness);
          setProducts(foundProducts || []);
          setLoading(false);
        }
        return;
      }

      if (businessError) console.error("Public business load:", businessError);

      if (slug === "nomsa-nails") {
        setBusiness(NOMSA_FALLBACK.business);
        setProducts(NOMSA_FALLBACK.products);
        setLoading(false);
        return;
      }

      setNotFound(true);
      setLoading(false);
    }

    loadBusiness();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: "'Inter', -apple-system, sans-serif" }}>
        Loading business page…
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f3", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "360px", background: "#fff", border: "1px solid #eeeeea", borderRadius: "18px", padding: "28px", textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: DARK, color: FALLBACK_ACCENT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontWeight: 900 }}>VT</div>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: DARK, marginBottom: "8px" }}>Page not found</h1>
          <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, marginBottom: "18px" }}>This VulaTrade business page is not available yet.</p>
          <a href="/" style={{ display: "inline-block", background: DARK, color: FALLBACK_ACCENT, borderRadius: "12px", padding: "12px 18px", fontSize: "14px", fontWeight: 800, textDecoration: "none" }}>Go to VulaTrade</a>
        </div>
      </div>
    );
  }

  const logoUrl = business.catalogue || business.logo_url || business.image_url || "";
  const phone = business.phone || business.call_number || "";
  const links = socialLinks(business);
  const activeProducts = products.filter((p) => p.is_active !== false);
  const pageTheme = resolvePageTheme(business);
  const mutedHeaderText = pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.66)" : "rgba(0,0,0,0.58)";
  const faintHeaderText = pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.52)" : "rgba(0,0,0,0.45)";

  return (
    <main style={{ minHeight: "100vh", background: "#f5f5f3", fontFamily: "'Inter', -apple-system, sans-serif", color: DARK }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
        <section style={{ background: pageTheme.value, color: pageTheme.text, padding: "24px 20px 28px", borderBottomLeftRadius: "28px", borderBottomRightRadius: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
            {logoUrl ? (
              <img src={logoUrl} alt={`${business.name} logo`} style={{ width: "72px", height: "72px", borderRadius: "18px", objectFit: "cover", border: `2px solid ${pageTheme.accent}` }} />
            ) : (
              <div style={{ width: "72px", height: "72px", borderRadius: "18px", background: pageTheme.text === "#ffffff" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", border: `2px solid ${pageTheme.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
                {business.background_style || "⭐"}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "11px", color: pageTheme.accent, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>Open for enquiries</div>
              <h1 style={{ fontSize: "30px", lineHeight: 1.05, margin: 0, fontWeight: 900 }}>{business.name}</h1>
              <p style={{ margin: "7px 0 0", fontSize: "13px", color: faintHeaderText }}>
                {business.category || "Local business"}{business.area ? ` · ${business.area}` : ""}
              </p>
            </div>
          </div>

          {business.description && (
            <p style={{ fontSize: "15px", lineHeight: 1.65, color: mutedHeaderText, margin: "0 0 20px" }}>{business.description}</p>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {business.whatsapp && (
              <a href={whatsappLink(business.whatsapp, business.name)} target="_blank" rel="noopener noreferrer"
                style={{ flex: "1 1 180px", textAlign: "center", background: pageTheme.accent, color: DARK, borderRadius: "14px", padding: "14px 16px", fontSize: "15px", fontWeight: 900, textDecoration: "none" }}>
                Enquire on WhatsApp
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`}
                style={{ flex: "1 1 120px", textAlign: "center", background: "transparent", color: pageTheme.accent, border: `1.5px solid ${pageTheme.accent}`, borderRadius: "14px", padding: "13px 16px", fontSize: "15px", fontWeight: 800, textDecoration: "none" }}>
                Call
              </a>
            )}
          </div>
        </section>

        <section style={{ padding: "24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 900, margin: 0 }}>Services</h2>
            <span style={{ fontSize: "12px", color: "#aaa", fontWeight: 700 }}>{activeProducts.length} item{activeProducts.length !== 1 ? "s" : ""}</span>
          </div>

          {activeProducts.length === 0 ? (
            <div style={{ background: "#f8f8f6", borderRadius: "16px", padding: "24px", textAlign: "center", color: "#888", fontSize: "14px" }}>
              Services will appear here soon.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activeProducts.map((product) => (
                <div key={product.id || product.name} style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #eeeeea", borderRadius: "16px", padding: "12px" }}>
                  <ProductImage product={product} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "15px", fontWeight: 850, color: DARK }}>{product.name}</div>
                    {product.description && <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.45, marginTop: "3px" }}>{product.description}</div>}
                  </div>
                  {Number(product.price) > 0 && (
                    <div style={{ fontSize: "15px", fontWeight: 900, color: DARK, whiteSpace: "nowrap" }}>R{Number(product.price).toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {links.length > 0 && (
          <section style={{ padding: "0 20px 24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 900, margin: "0 0 12px" }}>Find us online</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {links.map((link) => (
                <a key={link.label} href={normaliseUrl(link.url)} target="_blank" rel="noopener noreferrer"
                  style={{ border: "1px solid #e0e0dc", borderRadius: "999px", padding: "9px 13px", fontSize: "13px", fontWeight: 800, color: DARK, textDecoration: "none" }}>
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        )}

        <footer style={{ borderTop: "1px solid #eeeeea", padding: "18px 20px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#aaa", fontWeight: 700 }}>Powered by <span style={{ color: pageTheme.accent }}>VulaTrade</span></div>
        </footer>
      </div>
    </main>
  );
}

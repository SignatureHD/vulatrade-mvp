import React, { useState } from "react";
import { LIME, DARK } from "../../constants";
import { TEMPLATES } from "../../data/demoData";
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

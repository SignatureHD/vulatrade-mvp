import React from "react";
import { BG_COLOURS, FONTS } from "../constants";
import { injectFont } from "../utils";

export function BusinessPagePreview({ form, products, logoUrl, isFullPage }) {
  const bg   = BG_COLOURS.find((c) => c.value === form.bgColour) || BG_COLOURS[0];
  const font = FONTS.find((f) => f.value === form.font) || FONTS[0];
  const whatsappUrl = form.whatsapp
    ? `https://wa.me/${form.whatsapp.replace(/\D/g, "")}?text=Hi! I found you on VulaTrade and would like to enquire.`
    : "#";
  const activeProducts = products.filter((p) => p.is_active);

  if (font.import) injectFont(font.import);

  const card = (
    <div style={{ background:"#fff", borderRadius:isFullPage?"0":"32px", overflow:"hidden", width:isFullPage?"100%":"320px", maxWidth:isFullPage?"480px":"320px", boxShadow:isFullPage?"none":"0 24px 64px rgba(0,0,0,0.25)", fontFamily: font.value + ", 'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ background:bg.value, padding:"24px 20px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"14px" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="logo" style={{ width:"56px", height:"56px", borderRadius:"16px", objectFit:"cover", border:`2px solid ${bg.accent}` }} />
          ) : (
            <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"rgba(255,255,255,0.1)", border:`2px solid ${bg.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px" }}>
              {form.icon || "⭐"}
            </div>
          )}
          <div>
            <div style={{ fontSize:"9px", color:bg.accent, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"3px" }}>AI Business Page</div>
            <div style={{ fontSize:"22px", fontWeight:800, color:bg.text, lineHeight:1.1 }}>{form.name || "Your Business Name"}</div>
            <div style={{ fontSize:"11px", color: bg.text === "#ffffff" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)", marginTop:"3px" }}>
              {form.category || "Business type"}{form.area ? ` · ${form.area}` : ""}
            </div>
          </div>
        </div>
        {form.description && (
          <div style={{ fontSize:"12px", color: bg.text === "#ffffff" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)", lineHeight:1.6, marginBottom:"14px" }}>
            {form.description}
          </div>
        )}
        <div style={{ display:"inline-flex", alignItems:"center", gap:"5px", background:bg.accent, color:"#0d0d0d", fontSize:"9px", fontWeight:700, padding:"4px 10px", borderRadius:"8px" }}>
          <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#0d0d0d" }} /> Live
        </div>
      </div>

      {/* WhatsApp CTA */}
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
        style={{ display:"block", background:bg.accent, color:"#0d0d0d", textAlign:"center", padding:"14px", fontSize:"14px", fontWeight:800, textDecoration:"none", margin:"14px 14px 4px" }}>
        💬 Enquire on WhatsApp
      </a>

      {/* Products */}
      {activeProducts.length > 0 && (
        <div style={{ padding:"8px 0 16px" }}>
          {activeProducts.map((p) => {
            const imgVal = p.image || p.icon || "🛍️";
            const isUrl  = imgVal.startsWith("http");
            return (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 16px", borderBottom:"1px solid #f5f5f5" }}>
                {isUrl ? (
                  <img src={imgVal} alt={p.name} style={{ width:"44px", height:"44px", borderRadius:"10px", objectFit:"cover", flexShrink:0, border:"1px solid #f0f0f0" }} />
                ) : (
                  <div style={{ width:"44px", height:"44px", background:"#f5f5f5", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>
                    {imgVal}
                  </div>
                )}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", fontWeight:700, color:"#0d0d0d" }}>{p.name}</div>
                  {p.description && <div style={{ fontSize:"11px", color:"#aaa", marginTop:"1px" }}>{p.description}</div>}
                </div>
                <div style={{ fontSize:"14px", fontWeight:800, color:"#0d0d0d" }}>R{p.price}</div>
              </div>
            );
          })}
        </div>
      )}
      {activeProducts.length === 0 && (
        <div style={{ padding:"24px 16px", textAlign:"center", fontSize:"13px", color:"#ccc" }}>Your products will appear here</div>
      )}

      {/* Footer */}
      <div style={{ padding:"12px 16px", borderTop:"1px solid #f5f5f5", textAlign:"center" }}>
        <div style={{ fontSize:"10px", color:"#ccc" }}>Powered by <span style={{ color:"#5a9a00", fontWeight:700 }}>VulaTrade</span></div>
      </div>
    </div>
  );

  if (isFullPage) return (
    <div style={{ minHeight:"100vh", background:"#f5f5f3", display:"flex", justifyContent:"center" }}>{card}</div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, marginBottom:"12px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Live preview</div>
      <div style={{ background:"#1a1a1a", borderRadius:"36px", padding:"10px", border:"2px solid #2a2a2a", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background:"#111", height:"20px", borderRadius:"10px 10px 0 0", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:"50px", height:"12px", background:"#000", borderRadius:"6px" }} />
        </div>
        <div style={{ borderRadius:"0 0 26px 26px", overflow:"hidden" }}>{card}</div>
        <div style={{ height:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:"36px", height:"3px", background:"#333", borderRadius:"2px" }} />
        </div>
      </div>
    </div>
  );
}

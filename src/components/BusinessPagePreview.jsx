import React from "react";
import { FONTS, backgroundStyleForTheme, resolveBackgroundTheme } from "../constants";
import { businessDescriptionOrDefault } from "../businessDescriptions";
import { injectFont, waLink } from "../utils";
import Logo from "./Logo";

function readableTextOn(hex) {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return "#202021";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(1 + 2, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#202021" : "#ffffff";
}

export function BusinessPagePreview({ form, products, logoUrl, isFullPage }) {
  const bg   = resolveBackgroundTheme(form.bgColour);
  const font = FONTS.find((f) => f.value === form.font) || FONTS[0];
  const message = `Hi ${form.name || "there"}, I'm interested in your products/services on VulaTrade.`;
  const whatsappUrl = form.whatsapp
    ? waLink(form.whatsapp, message)
    : "#";
  const activeProducts = products.filter((p) => p.is_active !== false);
  const accentText = readableTextOn(bg.accent);
  const mutedText = bg.text === "#ffffff" ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.58)";
  const faintText = bg.text === "#ffffff" ? "rgba(255,255,255,0.56)" : "rgba(0,0,0,0.44)";
  const displayDescription = businessDescriptionOrDefault(form.description, form.category);

  if (font.import) injectFont(font.import);

  const card = (
    <div style={{ background:"#fbfbfb", borderRadius:isFullPage?"0":"30px", overflow:"hidden", width:isFullPage?"100%":"330px", maxWidth:isFullPage?"560px":"330px", boxShadow:isFullPage?"none":"0 24px 64px rgba(0,0,0,0.25)", fontFamily: font.value + ", 'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ ...backgroundStyleForTheme(bg), padding:"24px 20px 22px", borderBottomLeftRadius:"24px", borderBottomRightRadius:"24px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:bg.text === "#ffffff" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)", border:`1px solid ${bg.accent}66`, color:bg.accent, borderRadius:"999px", padding:"6px 10px", fontSize:"9px", fontWeight:800, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:"16px", backdropFilter:bg.isCustomPhoto?"blur(6px)":"none" }}>
          <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:bg.accent }} />
          Open for enquiries
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"13px", marginBottom:"14px" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="logo" style={{ width:"64px", height:"64px", borderRadius:"18px", objectFit:"cover", border:`2px solid ${bg.accent}`, boxShadow:"0 12px 28px rgba(0,0,0,0.18)" }} />
          ) : (
            <div style={{ width:"64px", height:"64px", borderRadius:"18px", background:bg.text === "#ffffff" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)", border:`2px solid ${bg.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"30px", backdropFilter:bg.isCustomPhoto?"blur(6px)":"none" }}>
              {form.icon || "⭐"}
            </div>
          )}
          <div>
            <div style={{ fontSize:"25px", fontWeight:900, color:bg.text, lineHeight:1.02, letterSpacing:"0", textShadow:bg.isCustomPhoto?"0 2px 12px rgba(0,0,0,0.35)":"none" }}>{form.name || "Your Business Name"}</div>
            <div style={{ fontSize:"11px", color:faintText, marginTop:"6px", fontWeight:700, textShadow:bg.isCustomPhoto?"0 1px 8px rgba(0,0,0,0.28)":"none" }}>
              {form.category || "Business type"}{form.area ? ` · ${form.area}` : ""}
            </div>
          </div>
        </div>
        {displayDescription && (
          <div style={{ fontSize:"12px", color:mutedText, lineHeight:1.65, marginBottom:"14px", textShadow:bg.isCustomPhoto?"0 1px 8px rgba(0,0,0,0.28)":"none" }}>
            {displayDescription}
          </div>
        )}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          style={{ display:"block", background:bg.accent, color:accentText, textAlign:"center", padding:"13px 14px", fontSize:"13px", fontWeight:900, textDecoration:"none", borderRadius:"14px", boxShadow:`0 10px 24px ${bg.accent}30` }}>
          Enquire on WhatsApp
        </a>
      </div>

      {/* Products */}
      {activeProducts.length > 0 && (
        <div style={{ padding:"16px 14px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
            <div style={{ fontSize:"15px", fontWeight:900, color:"#202021" }}>Services & prices</div>
            <div style={{ fontSize:"10px", color:"#888", background:"#fff", border:"1px solid #eeeeea", borderRadius:"999px", padding:"5px 8px", fontWeight:800 }}>{activeProducts.length} item{activeProducts.length !== 1 ? "s" : ""}</div>
          </div>
          {activeProducts.map((p) => {
            const imgVal = p.image || p.icon || "🛍️";
            const isUrl  = imgVal.startsWith("http");
            return (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px", border:"1px solid #eeeeea", borderRadius:"16px", background:"#fff", marginBottom:"8px", boxShadow:"0 6px 16px rgba(15,23,42,0.04)" }}>
                {isUrl ? (
                  <img src={imgVal} alt={p.name} style={{ width:"52px", height:"52px", borderRadius:"14px", objectFit:"cover", flexShrink:0, border:"1px solid #f0f0f0" }} />
                ) : (
                  <div style={{ width:"52px", height:"52px", background:"#fbfbfb", borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", flexShrink:0 }}>
                    {imgVal}
                  </div>
                )}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", fontWeight:850, color:"#202021" }}>{p.name}</div>
                  {p.description && <div style={{ fontSize:"11px", color:"#888", marginTop:"2px", lineHeight:1.35 }}>{p.description}</div>}
                </div>
                <div style={{ fontSize:"12px", fontWeight:900, color:"#202021", background:`${bg.accent}18`, border:`1px solid ${bg.accent}40`, borderRadius:"999px", padding:"6px 8px" }}>R{p.price}</div>
              </div>
            );
          })}
        </div>
      )}
      {activeProducts.length === 0 && (
        <div style={{ padding:"24px 16px", textAlign:"center", fontSize:"13px", color:"#ccc" }}>Your products will appear here</div>
      )}

      {/* Footer */}
      <div style={{ padding:"0 16px 18px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"#fff", border:"1px solid #eeeeea", borderRadius:"999px", padding:"7px 10px", fontSize:"10px", color:"#aaa", fontWeight:700 }}>
          <span>Powered by</span>
          <Logo size="small" />
        </div>
      </div>
    </div>
  );

  if (isFullPage) return (
    <div style={{ minHeight:"100vh", background:"#fbfbfb", display:"flex", justifyContent:"center" }}>{card}</div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, marginBottom:"12px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Live preview</div>
      <div style={{ background:"#202021", borderRadius:"36px", padding:"10px", border:"2px solid #2a2a2a", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
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

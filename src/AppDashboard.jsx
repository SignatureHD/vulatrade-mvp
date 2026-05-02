import { supabase } from "./lib/supabase";
import React, { useEffect, useState, useRef } from "react";
import "./styles.css";

// ── CONSTANTS ──────────────────────────────────────────────
const TABS = ["Dashboard", "Templates", "Setup", "Page", "Customers", "Bookings", "Messages", "Growth", "Money", "Vuke", "Plans"];
const LIME = "#a3e635";
const DARK = "#0d0d0d";
const MAX_IMAGES = 6;

// Simulate user plan — swap this out when Plans tab is live
// "free" | "starter" | "pro"
const USER_PLAN = "free";

// ── TIER CONFIG ────────────────────────────────────────────
// Each colour and font has a `plan` field: which plan unlocks it
// "free" = always available, "starter" = locked on free, "pro" = locked on free+starter

const BG_COLOURS = [
  // FREE — dark backgrounds, always readable, no contrast issues
  { name: "Dark",   value: "#0d0d0d", text: "#ffffff", accent: "#a3e635", plan: "free" },
  { name: "Forest", value: "#14200a", text: "#ffffff", accent: "#a3e635", plan: "free" },
  { name: "Navy",   value: "#0a1628", text: "#ffffff", accent: "#7eb8f7", plan: "free" },
  // STARTER — still dark-safe
  { name: "Coral",  value: "#7a2020", text: "#ffffff", accent: "#f9a8a8", plan: "starter" },
  { name: "Warm",   value: "#1a0f0a", text: "#ffffff", accent: "#f0a050", plan: "starter" },
  { name: "Slate",  value: "#1a1f2e", text: "#ffffff", accent: "#90c0f0", plan: "starter" },
  // PRO — light backgrounds need careful contrast (handled automatically via text/accent)
  { name: "Purple", value: "#2a1040", text: "#ffffff", accent: "#c4a0f7", plan: "pro" },
  { name: "Cream",  value: "#fdfcf7", text: "#1a1a1a", accent: "#3d7a00", plan: "pro" },
];

const FONTS = [
  { name: "Clean",   value: "Inter",            label: "Inter",             sample: "Aa",  plan: "free",    import: null }, // already loaded
  { name: "Friendly", value: "'DM Sans'",       label: "DM Sans",           sample: "Aa",  plan: "starter", import: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&display=swap" },
  { name: "Elegant", value: "'Playfair Display'", label: "Playfair Display", sample: "Aa",  plan: "pro",     import: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&display=swap" },
];

const PLAN_RANK = { free: 0, starter: 1, pro: 2 };

function isPlanLocked(requiredPlan) {
  return PLAN_RANK[USER_PLAN] < PLAN_RANK[requiredPlan];
}

function planLabel(plan) {
  if (plan === "starter") return "Starter";
  if (plan === "pro") return "Pro";
  return "";
}

const CATEGORIES = [
  "Nail Tech", "Hair & Extensions", "Barber", "Food Seller",
  "Fresh Produce", "Cleaning", "Tutoring", "Delivery",
  "Photography", "Catering", "Phone Repairs", "Other",
];

const PAYMENT_METHODS = ["Cash", "EFT / Bank Transfer", "SnapScan", "Zapper", "Yoco", "PayFast", "Other"];

const ICON_TEMPLATES = {
  "Nail Tech":        ["💅","✨","💜","🌸","🦋"],
  "Hair & Extensions":["💇","👑","🌟","💫","🎀"],
  "Barber":           ["✂️","💈","🪒","⚡","🔥"],
  "Food Seller":      ["🍱","🍳","🥘","🔥","⭐"],
  "Fresh Produce":    ["🥬","🌿","🍅","🌱","💚"],
  "Cleaning":         ["🧹","✨","🫧","💎","🌟"],
  "Tutoring":         ["📚","🎓","⭐","💡","🧠"],
  "Delivery":         ["🛵","⚡","🚀","📦","💨"],
  "Photography":      ["📸","🎨","✨","🌟","🎭"],
  "Catering":         ["🍽️","👨‍🍳","⭐","🥂","🎉"],
  "Phone Repairs":    ["📱","⚡","🔧","💻","🛠️"],
  "Other":            ["⭐","💫","✨","🌟","💎"],
};

const PRODUCT_ICONS = ["🛍️","⭐","✨","💎","🔥","💅","✂️","🍱","🧹","📚","🛵","📸","🍽️","📱","🥬","💆","💪","🎁","🧴","💊"];

const TEMPLATES = [
  { id:"nail",        name:"Nail Salon",       category:"Nail Tech",        icon:"💅", description:"Home or mobile nail tech offering gel, acrylic, and nail art services.",       starter:"I'm a professional nail technician offering gel overlays, acrylic sets, nail art and soak-offs. I work from home and offer mobile appointments. Book via WhatsApp.", products:[{name:"Gel overlay",price:220,description:"Full gel overlay on natural nails",icon:"💅"},{name:"Acrylic set",price:350,description:"Full acrylic nail set",icon:"✨"},{name:"Soak off",price:80,description:"Gel or acrylic soak off removal",icon:"🛍️"},{name:"Nail art",price:50,description:"Custom nail art per nail",icon:"🎨"}]},
  { id:"hair",        name:"Hair & Extensions",category:"Hair & Extensions", icon:"💇", description:"Hair styling, braiding, weaves and extension services.",                       starter:"I offer professional hair styling including braids, weaves, relaxers and extensions. Available for home visits and salon appointments. Book via WhatsApp.", products:[{name:"Box braids",price:350,description:"Full box braids install",icon:"💇"},{name:"Weave install",price:450,description:"Weave sew-in with closure",icon:"👑"},{name:"Relaxer",price:200,description:"Relaxer treatment and blow dry",icon:"✨"},{name:"Hair extensions",price:500,description:"Hair extension install",icon:"🎀"}]},
  { id:"barber",      name:"Barber",           category:"Barber",           icon:"✂️", description:"Men's cuts, fades, lineups and beard grooming.",                               starter:"Professional barber offering fades, lineups, beard trims and full grooms. Home visits available. Book your slot via WhatsApp.", products:[{name:"Haircut",price:80,description:"Standard haircut and style",icon:"✂️"},{name:"Fade",price:100,description:"Skin or low fade",icon:"💈"},{name:"Beard trim",price:50,description:"Beard shape and trim",icon:"🪒"},{name:"Full groom",price:140,description:"Haircut plus beard trim",icon:"⭐"}]},
  { id:"food",        name:"Food Seller",      category:"Food Seller",      icon:"🍱", description:"Home-cooked meals, lunches and daily specials.",                               starter:"I cook and sell freshly prepared home meals daily. Available for collection or local delivery. Order via WhatsApp before 10am.", products:[{name:"Lunch special",price:45,description:"Daily cooked lunch special",icon:"🍱"},{name:"Full meal",price:65,description:"Full plate with sides",icon:"🍳"},{name:"Family pot",price:180,description:"Large family-size portion",icon:"🥘"},{name:"Snacks",price:15,description:"Vetkoek, pies and light snacks",icon:"🔥"}]},
  { id:"produce",     name:"Fresh Produce",    category:"Fresh Produce",    icon:"🥬", description:"Fresh fruit and vegetables sold from home or delivered locally.",               starter:"I sell fresh, affordable fruit and vegetables. Order weekly specials and get delivery to your door. WhatsApp me your order.", products:[{name:"Veggie bag",price:60,description:"Seasonal mixed vegetables",icon:"🥬"},{name:"Fruit bag",price:70,description:"Seasonal mixed fruit",icon:"🍅"},{name:"Mixed box",price:120,description:"Fruit and veg combo box",icon:"🌿"},{name:"Single item",price:5,description:"Individual fruit or veg item",icon:"🌱"}]},
  { id:"cleaning",    name:"Cleaning Service", category:"Cleaning",         icon:"🧹", description:"Home, office and post-construction cleaning.",                                  starter:"Professional cleaning service for homes and offices. Reliable, thorough and affordable. Book your clean via WhatsApp.", products:[{name:"1-bedroom flat",price:250,description:"Full clean of 1-bedroom flat",icon:"🧹"},{name:"3-bedroom house",price:450,description:"Full clean of 3-bedroom house",icon:"🏠"},{name:"Office clean",price:350,description:"Office or business premises clean",icon:"✨"},{name:"Post-construction",price:600,description:"Post-construction deep clean",icon:"💎"}]},
  { id:"tutor",       name:"Tutor",            category:"Tutoring",         icon:"📚", description:"Academic tutoring for school and university students.",                         starter:"I offer private tutoring for Grade 8–12 and university students. Maths, Science, English and more. Book your session via WhatsApp.", products:[{name:"1hr session",price:150,description:"One-on-one tutoring session",icon:"📚"},{name:"Group session",price:80,description:"Group tutoring per person",icon:"🎓"},{name:"Exam prep package",price:500,description:"5-session exam preparation package",icon:"⭐"},{name:"Online session",price:120,description:"Online video tutoring session",icon:"💡"}]},
  { id:"delivery",    name:"Local Delivery",   category:"Delivery",         icon:"🛵", description:"Fast local delivery for businesses and individuals.",                           starter:"I offer reliable same-day local delivery. Food, parcels, documents and more. WhatsApp me your pickup and drop-off.", products:[{name:"Local drop",price:40,description:"Single local delivery drop",icon:"🛵"},{name:"Extended zone",price:70,description:"Delivery to extended area",icon:"⚡"},{name:"Bulk delivery",price:150,description:"Multiple drops in one run",icon:"📦"},{name:"Monthly package",price:800,description:"Unlimited local deliveries per month",icon:"🚀"}]},
  { id:"photography", name:"Photography",      category:"Photography",      icon:"📸", description:"Portrait, event and product photography.",                                     starter:"Professional photographer available for portraits, events, maternity shoots and product photos. Book your session via WhatsApp.", products:[{name:"Portrait session",price:500,description:"1hr portrait shoot with edited photos",icon:"📸"},{name:"Event coverage",price:1500,description:"Full event photography coverage",icon:"🎭"},{name:"Product shoot",price:800,description:"Product photography for online selling",icon:"🎨"},{name:"Maternity shoot",price:700,description:"Maternity portrait session",icon:"🌟"}]},
  { id:"catering",    name:"Catering",         category:"Catering",         icon:"🍽️", description:"Event catering for parties, funerals and celebrations.",                      starter:"I provide full catering services for events of all sizes — funerals, parties, corporate functions and celebrations. WhatsApp for a quote.", products:[{name:"Basic package (per head)",price:85,description:"Standard catering per person",icon:"🍽️"},{name:"Full package (per head)",price:150,description:"Premium catering per person",icon:"👨‍🍳"},{name:"Dessert table",price:500,description:"Dessert table setup for events",icon:"🎉"},{name:"Drinks package",price:300,description:"Cold drinks and juice package",icon:"🥂"}]},
  { id:"phonerepairs",name:"Phone Repairs",    category:"Phone Repairs",    icon:"📱", description:"Screen replacements, battery swaps and phone fixes.",                          starter:"I fix phones fast and at fair prices. Screen repairs, battery replacements, charging ports and more. WhatsApp for a quote.", products:[{name:"Screen repair",price:350,description:"Screen replacement (price varies by model)",icon:"📱"},{name:"Battery swap",price:200,description:"Battery replacement",icon:"⚡"},{name:"Charging port",price:150,description:"Charging port repair or replacement",icon:"🔧"},{name:"Water damage",price:250,description:"Water damage assessment and repair",icon:"🛠️"}]},
];

const inputStyle = { border:"1.5px solid #e8e8e8", borderRadius:"12px", padding:"12px 14px", fontSize:"14px", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" };
const labelStyle = { fontSize:"12px", fontWeight:600, color:"#555", marginBottom:"6px", display:"block" };

// ── INJECT GOOGLE FONTS ────────────────────────────────────
// Called once when a font is first needed. Idempotent — checks before injecting.
function injectFont(url) {
  if (!url) return;
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

// Pre-inject all unlocked fonts on mount
function injectAllUnlockedFonts() {
  FONTS.forEach((f) => {
    if (!isPlanLocked(f.plan) && f.import) injectFont(f.import);
  });
}

// ── UPGRADE NUDGE ──────────────────────────────────────────
// Small inline bar shown when user taps a locked item
function UpgradeNudge({ plan, onViewPlans }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fffbe6", border:"1.5px solid #f0d000", borderRadius:"10px", padding:"10px 14px", marginTop:"10px" }}>
      <div style={{ fontSize:"13px", color:"#7a5e00" }}>
        🔒 <strong>{planLabel(plan)} plan</strong> — unlock more options by upgrading
      </div>
      <button onClick={onViewPlans} style={{ fontSize:"12px", fontWeight:700, color:"#5a4000", background:"transparent", border:"1.5px solid #d0a800", borderRadius:"8px", padding:"5px 12px", cursor:"pointer", whiteSpace:"nowrap" }}>
        See plans →
      </button>
    </div>
  );
}

// ── IMAGE COMPRESSION ──────────────────────────────────────
async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type:"image/jpeg" }));
      }, "image/jpeg", 0.8);
    };
    img.src = url;
  });
}

// ── BUSINESS PAGE PREVIEW ──────────────────────────────────
function BusinessPagePreview({ form, products, logoUrl, isFullPage }) {
  const bg   = BG_COLOURS.find((c) => c.value === form.bgColour) || BG_COLOURS[0];
  const font = FONTS.find((f) => f.value === form.font) || FONTS[0];
  const whatsappUrl = form.whatsapp
    ? `https://wa.me/${form.whatsapp.replace(/\D/g,"")}?text=Hi! I found you on VulaTrade and would like to enquire.`
    : "#";
  const activeProducts = products.filter((p) => p.is_active);

  // Ensure font is loaded when preview renders
  if (font.import) injectFont(font.import);

  const card = (
    <div style={{ background:"#fff", borderRadius:isFullPage?"0":"32px", overflow:"hidden", width:isFullPage?"100%":"280px", maxWidth:isFullPage?"480px":"280px", boxShadow:isFullPage?"none":"0 24px 64px rgba(0,0,0,0.25)", fontFamily: font.value + ", 'Inter', sans-serif" }}>

      {/* Header — uses bg.text for correct contrast on both dark & light backgrounds */}
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

// ── COLOUR PICKER WITH TIERS ───────────────────────────────
function ColourPicker({ value, onChange, onViewPlans }) {
  const [nudgePlan, setNudgePlan] = useState(null);

  function handleClick(colour) {
    if (isPlanLocked(colour.plan)) {
      setNudgePlan(nudgePlan === colour.plan ? null : colour.plan);
      return;
    }
    setNudgePlan(null);
    onChange(colour.value);
  }

  return (
    <div>
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
        {BG_COLOURS.map((c) => {
          const locked = isPlanLocked(c.plan);
          const selected = value === c.value;
          return (
            <div key={c.value} style={{ position:"relative" }} title={locked ? `🔒 ${planLabel(c.plan)} plan — ${c.name}` : c.name}>
              <button
                onClick={() => handleClick(c)}
                style={{
                  width:"36px", height:"36px", borderRadius:"50%",
                  background: c.value,
                  border: selected ? `3px solid ${LIME}` : "3px solid transparent",
                  cursor: locked ? "pointer" : "pointer",
                  outline:"none",
                  boxShadow: selected ? "0 0 0 2px #fff, 0 0 0 4px #a3e635" : "none",
                  opacity: locked ? 0.5 : 1,
                  filter: locked ? "grayscale(20%)" : "none",
                }}
              />
              {/* Lock badge */}
              {locked && (
                <div style={{ position:"absolute", bottom:"-2px", right:"-2px", width:"14px", height:"14px", borderRadius:"50%", background:"#fff", border:"1px solid #ddd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"8px", lineHeight:1 }}>
                  🔒
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Tier labels */}
      <div style={{ display:"flex", gap:"14px", marginTop:"8px", flexWrap:"wrap" }}>
        {["free","starter","pro"].map((tier) => {
          const count = BG_COLOURS.filter((c) => c.plan === tier).length;
          const locked = isPlanLocked(tier);
          return (
            <div key={tier} style={{ fontSize:"11px", color: locked ? "#bbb" : "#888", display:"flex", alignItems:"center", gap:"4px" }}>
              {locked && "🔒 "}{planLabel(tier) || "Free"}: {count} colours
            </div>
          );
        })}
      </div>
      {nudgePlan && <UpgradeNudge plan={nudgePlan} onViewPlans={() => { setNudgePlan(null); onViewPlans(); }} />}
    </div>
  );
}

// ── FONT PICKER WITH TIERS ─────────────────────────────────
function FontPicker({ value, onChange, onViewPlans }) {
  const [nudgePlan, setNudgePlan] = useState(null);

  function handleClick(font) {
    if (isPlanLocked(font.plan)) {
      setNudgePlan(nudgePlan === font.plan ? null : font.plan);
      return;
    }
    setNudgePlan(null);
    if (font.import) injectFont(font.import);
    onChange(font.value);
  }

  return (
    <div>
      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
        {FONTS.map((f) => {
          const locked   = isPlanLocked(f.plan);
          const selected = value === f.value;
          return (
            <button
              key={f.value}
              onClick={() => handleClick(f)}
              style={{
                position:"relative",
                padding:"10px 16px",
                borderRadius:"12px",
                border:`1.5px solid ${selected ? DARK : "#e0e0e0"}`,
                background: selected ? DARK : "#fff",
                cursor:"pointer",
                textAlign:"left",
                opacity: locked ? 0.55 : 1,
                minWidth:"110px",
              }}
            >
              {/* Font sample */}
              <div style={{
                fontSize:"22px",
                fontWeight:700,
                color: selected ? LIME : DARK,
                fontFamily: locked ? "inherit" : (f.value + ", sans-serif"),
                marginBottom:"2px",
                lineHeight:1,
              }}>
                {f.sample}
              </div>
              <div style={{ fontSize:"11px", color: selected ? "#aaa" : "#888", fontWeight:600 }}>
                {locked ? "🔒 " : ""}{f.label}
              </div>
              {locked && (
                <div style={{ fontSize:"9px", color:"#bbb", marginTop:"2px" }}>{planLabel(f.plan)} plan</div>
              )}
            </button>
          );
        })}
      </div>
      {nudgePlan && <UpgradeNudge plan={nudgePlan} onViewPlans={() => { setNudgePlan(null); onViewPlans(); }} />}
    </div>
  );
}

// ── IMAGE LIBRARY ──────────────────────────────────────────
function ImageLibrary({ userId, images, setImages, uploading, setUploading }) {
  const fileRef = useRef();
  const atLimit = images.length >= MAX_IMAGES;

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file || atLimit) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const path = `product-images/${userId}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("business-images").upload(path, compressed, { upsert:false });
      if (!error) {
        const { data } = supabase.storage.from("business-images").getPublicUrl(path);
        setImages((prev) => [...prev, { url:data.publicUrl, path }]);
      }
    } catch(err) { console.error("Upload error:", err); }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(img) {
    if (!window.confirm("Remove this image? Products using it will fall back to their icon.")) return;
    await supabase.storage.from("business-images").remove([img.path]);
    setImages((prev) => prev.filter((i) => i.path !== img.path));
  }

  return (
    <div style={{ background:"#f8f8f6", border:"1.5px solid #e8e8e4", borderRadius:"16px", padding:"20px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
        <div>
          <div style={{ fontSize:"15px", fontWeight:700, color:DARK }}>Product Image Library</div>
          <div style={{ fontSize:"12px", color:"#aaa", marginTop:"2px" }}>{images.length}/{MAX_IMAGES} images · Upload once, use on any product</div>
        </div>
        {!atLimit && (
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            style={{ backgroundColor:DARK, color:LIME, border:"none", borderRadius:"10px", padding:"9px 16px", fontSize:"13px", fontWeight:700, cursor:uploading?"not-allowed":"pointer", whiteSpace:"nowrap", opacity:uploading?0.6:1 }}>
            {uploading ? "Uploading…" : "+ Add image"}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleUpload} />
      </div>
      {atLimit && (
        <div style={{ fontSize:"12px", color:"#888", background:"#fff", border:"1px solid #e0e0dc", borderRadius:"10px", padding:"8px 12px", marginBottom:"12px" }}>
          📦 {MAX_IMAGES}-image limit reached. Delete one to add another. Higher limits on paid plans.
        </div>
      )}
      {images.length === 0 ? (
        <div onClick={() => fileRef.current.click()} style={{ border:"2px dashed #ddd", borderRadius:"12px", padding:"28px", textAlign:"center", cursor:"pointer", marginTop:"12px" }}>
          <div style={{ fontSize:"28px", marginBottom:"8px" }}>🖼️</div>
          <div style={{ fontSize:"13px", fontWeight:600, color:"#888" }}>No images yet</div>
          <div style={{ fontSize:"12px", color:"#bbb", marginTop:"4px" }}>Tap to upload your first product photo</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:"8px", marginTop:"14px" }}>
          {images.map((img) => (
            <div key={img.path} style={{ position:"relative", aspectRatio:"1", borderRadius:"10px", overflow:"hidden", border:"1.5px solid #e0e0dc" }}>
              <img src={img.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <button onClick={() => handleDelete(img)}
                style={{ position:"absolute", top:"4px", right:"4px", width:"20px", height:"20px", borderRadius:"50%", background:"rgba(0,0,0,0.65)", border:"none", color:"#fff", fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: MAX_IMAGES - images.length }).map((_,i) => (
            <div key={`e${i}`} onClick={() => fileRef.current.click()}
              style={{ aspectRatio:"1", borderRadius:"10px", border:"1.5px dashed #ddd", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", color:"#ccc" }}>
              +
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PRODUCT IMAGE PICKER ───────────────────────────────────
function ProductImagePicker({ images, selectedImage, selectedIcon, onImageSelect, onIconSelect }) {
  const [tab, setTab] = useState(selectedImage ? "image" : "icon");

  const tabBtn = (key, label) => (
    <button onClick={() => setTab(key)}
      style={{ padding:"6px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:700, border:"none", cursor:"pointer", background: tab===key ? DARK : "transparent", color: tab===key ? LIME : "#888" }}>
      {label}
    </button>
  );

  return (
    <div>
      <label style={labelStyle}>Product visual</label>
      <div style={{ background:"#f8f8f6", border:"1.5px solid #e0e0dc", borderRadius:"12px", padding:"12px" }}>
        <div style={{ display:"flex", gap:"4px", marginBottom:"12px", background:"#efefed", borderRadius:"10px", padding:"3px", width:"fit-content" }}>
          {tabBtn("image","📷 Photo")}
          {tabBtn("icon","😀 Icon")}
        </div>
        {tab === "image" && (
          <div>
            {images.length === 0 ? (
              <div style={{ fontSize:"12px", color:"#aaa", padding:"4px 0" }}>No images in your library yet. Add photos above and they'll appear here.</div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:"6px" }}>
                {images.map((img) => (
                  <div key={img.path} onClick={() => onImageSelect(img.url)}
                    style={{ aspectRatio:"1", borderRadius:"8px", overflow:"hidden", cursor:"pointer", border:`2.5px solid ${selectedImage===img.url ? LIME : "transparent"}`, boxShadow: selectedImage===img.url ? `0 0 0 1px ${LIME}` : "none" }}>
                    <img src={img.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  </div>
                ))}
                {selectedImage && (
                  <div onClick={() => onImageSelect(null)}
                    style={{ aspectRatio:"1", borderRadius:"8px", border:"1.5px dashed #ddd", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#bbb", flexDirection:"column", gap:"2px" }}>
                    <span style={{ fontSize:"14px" }}>✕</span><span>Clear</span>
                  </div>
                )}
              </div>
            )}
            {selectedImage && <div style={{ marginTop:"8px", fontSize:"11px", color:"#5a9a00" }}>✓ Photo selected — shows on your page</div>}
          </div>
        )}
        {tab === "icon" && (
          <div>
            {selectedImage && (
              <div style={{ fontSize:"11px", color:"#f0a050", background:"#fff8ee", border:"1px solid #f0d080", borderRadius:"8px", padding:"6px 10px", marginBottom:"10px" }}>
                ⚠️ A photo is selected — choosing an icon will remove it
              </div>
            )}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {PRODUCT_ICONS.map((ic) => (
                <button key={ic} onClick={() => { onIconSelect(ic); onImageSelect(null); }}
                  style={{ width:"38px", height:"38px", borderRadius:"8px", background: selectedIcon===ic && !selectedImage ? DARK : "#fff", border:`1.5px solid ${selectedIcon===ic && !selectedImage ? DARK : "#e0e0e0"}`, fontSize:"20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AUTH ───────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignIn() {
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    setLoading(false);
  }
  async function handleSignUp() {
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setMessage(error.message); } else { setMessage("Check your email to confirm your account."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f3", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ width:"100%", maxWidth:"400px", background:"#fff", borderRadius:"24px", padding:"36px", boxShadow:"0 4px 32px rgba(0,0,0,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"28px" }}>
          <div style={{ width:"40px", height:"40px", background:DARK, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:900, color:LIME }}>VT</div>
          <div><div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>VulaTrade</div><div style={{ fontSize:"11px", color:"#aaa" }}>Start local. Sell smarter. Grow stronger.</div></div>
        </div>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"6px" }}>{mode==="signin" ? "Sign in" : "Create account"}</h2>
        <p style={{ fontSize:"13px", color:"#888", marginBottom:"24px" }}>{mode==="signin" ? "Welcome back." : "Start building your business today."}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          {message && <div style={{ fontSize:"13px", color:message.includes("Check")?"#5a9a00":"#cc3300", background:message.includes("Check")?"#f0ffe0":"#fff0ee", padding:"10px 14px", borderRadius:"10px" }}>{message}</div>}
          <button onClick={mode==="signin" ? handleSignIn : handleSignUp} disabled={loading} style={{ backgroundColor:LIME, color:DARK, border:"none", borderRadius:"12px", padding:"14px", fontSize:"15px", fontWeight:800, cursor:"pointer", marginTop:"4px" }}>
            {loading ? "Please wait..." : mode==="signin" ? "Sign In" : "Create Account"}
          </button>
          <button onClick={() => { setMode(mode==="signin"?"signup":"signin"); setMessage(""); }} style={{ background:"transparent", border:"none", fontSize:"13px", color:"#888", cursor:"pointer", padding:"4px" }}>
            {mode==="signin" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD HOME ─────────────────────────────────────────
function DashboardHome({ user, business, setTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  // Get greeting based on time of day
  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  // Format month label
  function monthLabel(offset) {
    const d = new Date();
    d.setMonth(d.getMonth() - offset);
    return d.toLocaleDateString("en-ZA", { month: "short" });
  }

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }

    async function loadAll() {
      const [
        { data: customers },
        { data: bookings },
        { data: sales },
      ] = await Promise.all([
        supabase.from("customers").select("*").eq("business_id", business.id),
        supabase.from("bookings").select("*").eq("business_id", business.id),
        supabase.from("customers").select("total_spent, last_contacted, visit_count").eq("business_id", business.id),
      ]);

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const thirtyDaysAgo  = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const threeDaysAhead = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

      // Stats
      const totalCustomers  = customers?.length || 0;
      const leads           = customers?.filter((c) => c.status === "lead") || [];
      const todayBookings   = bookings?.filter((b) => b.booking_date === today && b.status === "confirmed") || [];
      const upcomingSoon    = bookings?.filter((b) => b.booking_date > today && b.booking_date <= threeDaysAhead && b.status === "confirmed") || [];
      const needsContact    = customers?.filter((c) => {
        if (!c.last_contacted) return c.visit_count > 0; // visited but never logged
        return c.last_contacted < thirtyDaysAgo && c.status !== "lead";
      }) || [];

      // Revenue this month — from done bookings + logged sales
      const monthRevenue =
        (bookings?.filter((b) => b.status === "done" && b.booking_date >= thisMonthStart.slice(0,10)).reduce((s, b) => s + (b.price || 0), 0) || 0) +
        (customers?.reduce((s, c) => s + (c.total_spent || 0), 0) || 0);

      // Last 6 months revenue from done bookings
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const ym = d.toISOString().slice(0, 7);
        const val = bookings
          ?.filter((b) => b.status === "done" && b.booking_date?.startsWith(ym))
          .reduce((s, b) => s + (b.price || 0), 0) || 0;
        return { label: d.toLocaleDateString("en-ZA", { month: "short" }), value: val };
      });

      // Last month revenue for comparison
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
      const lastMonthRevenue = bookings
        ?.filter((b) => b.status === "done" && b.booking_date?.startsWith(lastMonthStart))
        .reduce((s, b) => s + (b.price || 0), 0) || 0;

      // This month done bookings revenue
      const thisMonthRevenue = bookings
        ?.filter((b) => b.status === "done" && b.booking_date >= thisMonthStart.slice(0,10))
        .reduce((s, b) => s + (b.price || 0), 0) || 0;

      setData({
        totalCustomers, leads, todayBookings, upcomingSoon,
        needsContact, thisMonthRevenue, lastMonthRevenue,
        monthlyRevenue, customers, bookings,
      });
      setLoading(false);
    }
    loadAll();
  }, [business?.id]);

  // ── NO BUSINESS ────────────────────────────────────────────
  if (!business?.name) return (
    <div>
      <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"6px" }}>Welcome to VulaTrade 👋</h2>
      <p style={{ fontSize:"14px", color:"#888", marginBottom:"28px" }}>{user.email}</p>
      <div style={{ background:DARK, borderRadius:"20px", padding:"28px", marginBottom:"20px" }}>
        <div style={{ fontSize:"20px", fontWeight:800, color:LIME, marginBottom:"8px" }}>Let's build your business page</div>
        <div style={{ fontSize:"14px", color:"rgba(255,255,255,0.6)", marginBottom:"20px", lineHeight:1.6 }}>
          Pick a template and launch in minutes. Your customers will be able to find you, book you, and pay you.
        </div>
        <button onClick={() => setTab("Templates")}
          style={{ backgroundColor:LIME, color:DARK, border:"none", borderRadius:"12px", padding:"12px 24px", fontSize:"14px", fontWeight:800, cursor:"pointer" }}>
          Browse templates →
        </button>
      </div>
    </div>
  );

  const revenueUp = data?.thisMonthRevenue >= (data?.lastMonthRevenue || 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>
          {greeting()}{business?.name ? `, ${business.name.split(" ")[0]}` : ""} 👋
        </h2>
        <p style={{ fontSize:"13px", color:"#aaa" }}>
          {new Date().toLocaleDateString("en-ZA", { weekday:"long", day:"numeric", month:"long" })}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"40px", color:"#aaa" }}>Loading your dashboard…</div>
      ) : (
        <>
          {/* ── ROW 1: STAT CARDS ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"10px" }}>
            {[
              {
                label: "Today's bookings",
                value: data.todayBookings.length,
                sub: data.todayBookings.length === 0 ? "Free day" : `${data.todayBookings.length} appointment${data.todayBookings.length !== 1 ? "s" : ""}`,
                onClick: () => setTab("Bookings"),
                highlight: data.todayBookings.length > 0,
              },
              {
                label: "Revenue this month",
                value: `R${data.thisMonthRevenue.toLocaleString()}`,
                sub: data.lastMonthRevenue > 0
                  ? `${revenueUp ? "▲" : "▼"} vs R${data.lastMonthRevenue.toLocaleString()} last month`
                  : "Log sales to track",
                subColor: revenueUp ? "#5a9a00" : "#cc3300",
              },
              {
                label: "Customers",
                value: data.totalCustomers,
                sub: `${data.leads.length} lead${data.leads.length !== 1 ? "s" : ""} to convert`,
                onClick: () => setTab("Customers"),
              },
              {
                label: "Needs follow-up",
                value: data.needsContact.length,
                sub: data.needsContact.length > 0 ? "Not contacted in 30+ days" : "All caught up",
                subColor: data.needsContact.length > 0 ? "#f59e0b" : "#5a9a00",
                onClick: () => setTab("Customers"),
              },
            ].map((s) => (
              <div key={s.label}
                onClick={s.onClick}
                style={{ background:"#fff", border:`1.5px solid ${s.highlight ? LIME : "#eeeeea"}`, borderRadius:"16px", padding:"18px", cursor:s.onClick ? "pointer" : "default", transition:"border-color 0.15s" }}
                onMouseEnter={(e) => { if (s.onClick) e.currentTarget.style.borderColor = DARK; }}
                onMouseLeave={(e) => { if (s.onClick) e.currentTarget.style.borderColor = s.highlight ? LIME : "#eeeeea"; }}>
                <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" }}>{s.label}</div>
                <div style={{ fontSize:"28px", fontWeight:900, color:DARK, lineHeight:1, marginBottom:"6px" }}>{s.value}</div>
                <div style={{ fontSize:"11px", color: s.subColor || "#bbb", fontWeight:600 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── ROW 2: TODAY'S APPOINTMENTS ── */}
          <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
              <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>Today's appointments</div>
              <button onClick={() => setTab("Bookings")}
                style={{ fontSize:"12px", color:"#aaa", background:"transparent", border:"none", cursor:"pointer", fontWeight:600 }}>
                View all →
              </button>
            </div>

            {data.todayBookings.length === 0 ? (
              <div style={{ background:"#f8f8f6", borderRadius:"14px", padding:"20px", textAlign:"center" }}>
                <div style={{ fontSize:"13px", color:"#888", marginBottom:"14px", lineHeight:1.6 }}>
                  No appointments today — use the time to grow your business.
                </div>
                <div style={{ display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={() => setTab("Customers")}
                    style={{ padding:"8px 16px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                    Follow up with customers
                  </button>
                  <button onClick={() => setTab("Bookings")}
                    style={{ padding:"8px 16px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                    + Add a booking
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {data.todayBookings
                  .sort((a, b) => (a.booking_time || "").localeCompare(b.booking_time || ""))
                  .map((b) => (
                    <div key={b.id} style={{ display:"flex", alignItems:"center", gap:"14px", padding:"12px 16px", background:"#f8f8f6", borderRadius:"12px" }}>
                      <div style={{ textAlign:"center", minWidth:"44px", background:LIME, borderRadius:"10px", padding:"6px 0" }}>
                        <div style={{ fontSize:"13px", fontWeight:900, color:DARK }}>{b.booking_time || "—"}</div>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>{b.customer_name}</div>
                        {b.service && <div style={{ fontSize:"12px", color:"#aaa" }}>{b.service}</div>}
                      </div>
                      {b.price > 0 && <div style={{ fontSize:"14px", fontWeight:800, color:DARK }}>R{b.price}</div>}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* ── ROW 3: UPCOMING IN 3 DAYS ── */}
          {data.upcomingSoon.length > 0 && (
            <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
              <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"14px" }}>Coming up this week</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {data.upcomingSoon.slice(0, 4).map((b) => (
                  <div key={b.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", border:"1px solid #eeeeea", borderRadius:"12px" }}>
                    <div style={{ textAlign:"center", minWidth:"36px" }}>
                      <div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>{new Date(b.booking_date + "T00:00:00").getDate()}</div>
                      <div style={{ fontSize:"10px", color:"#aaa", fontWeight:600 }}>{new Date(b.booking_date + "T00:00:00").toLocaleDateString("en-ZA", { month:"short" })}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"13px", fontWeight:700, color:DARK }}>{b.customer_name}</div>
                      {b.service && <div style={{ fontSize:"12px", color:"#aaa" }}>{b.service}</div>}
                    </div>
                    {b.booking_time && <div style={{ fontSize:"12px", fontWeight:700, color:"#888" }}>{b.booking_time}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ROW 4: NEEDS ATTENTION ── */}
          <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
            <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"16px" }}>Needs your attention</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>

              {/* Leads to convert */}
              {data.leads.length > 0 ? (
                <div style={{ background:"#f8f8f6", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"#eeeeea", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>🔥</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"2px" }}>
                      {data.leads.length} lead{data.leads.length !== 1 ? "s" : ""} haven't booked yet
                    </div>
                    <div style={{ fontSize:"12px", color:"#aaa" }}>
                      {data.leads.slice(0, 2).map((c) => c.name).join(", ")}{data.leads.length > 2 ? ` +${data.leads.length - 2} more` : ""}
                    </div>
                  </div>
                  <button onClick={() => setTab("Customers")}
                    style={{ padding:"8px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                    Follow up
                  </button>
                </div>
              ) : (
                <div style={{ background:"#f0ffe0", border:"1px solid #c3e66a", borderRadius:"14px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ fontSize:"16px" }}>✓</span>
                  <div style={{ fontSize:"13px", color:"#3a6b00", fontWeight:600 }}>No leads waiting — share your page link to attract new ones</div>
                  <button onClick={() => setTab("Page")}
                    style={{ marginLeft:"auto", padding:"6px 12px", borderRadius:"8px", border:"none", background:"#3a6b00", color:"#fff", fontSize:"11px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                    Share page
                  </button>
                </div>
              )}

              {/* Customers needing contact */}
              {data.needsContact.length > 0 ? (
                <div style={{ background:"#f8f8f6", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"#eeeeea", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>💬</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"2px" }}>
                      {data.needsContact.length} customer{data.needsContact.length !== 1 ? "s" : ""} not contacted in 30+ days
                    </div>
                    <div style={{ fontSize:"12px", color:"#aaa" }}>
                      {data.needsContact.slice(0, 2).map((c) => c.name).join(", ")}{data.needsContact.length > 2 ? ` +${data.needsContact.length - 2} more` : ""}
                    </div>
                  </div>
                  <button onClick={() => setTab("Customers")}
                    style={{ padding:"8px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                    Reach out
                  </button>
                </div>
              ) : (
                <div style={{ background:"#f0ffe0", border:"1px solid #c3e66a", borderRadius:"14px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ fontSize:"16px" }}>✓</span>
                  <div style={{ fontSize:"13px", color:"#3a6b00", fontWeight:600 }}>All customers recently contacted — great work!</div>
                </div>
              )}

              {/* No customers yet */}
              {data.totalCustomers === 0 && (
                <div style={{ background:"#f8f8f6", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"#eeeeea", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>👥</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"2px" }}>No customers yet</div>
                    <div style={{ fontSize:"12px", color:"#aaa" }}>Import from your phone contacts or add manually</div>
                  </div>
                  <button onClick={() => setTab("Customers")}
                    style={{ padding:"8px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                    Add customers
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── ROW 5: REVENUE TREND ── */}
          {data.monthlyRevenue.some((m) => m.value > 0) ? (
            <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
                <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>Revenue — last 6 months</div>
                <div style={{ fontSize:"13px", fontWeight:700, color: revenueUp ? "#5a9a00" : "#cc3300" }}>
                  {revenueUp ? "▲" : "▼"} {data.lastMonthRevenue > 0 ? `${Math.abs(Math.round(((data.thisMonthRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100))}% vs last month` : "First month"}
                </div>
              </div>
              {(() => {
                const max = Math.max(...data.monthlyRevenue.map((m) => m.value), 1);
                return (
                  <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", height:"80px" }}>
                    {data.monthlyRevenue.map((m, i) => {
                      const isLast = i === data.monthlyRevenue.length - 1;
                      const h = Math.max((m.value / max) * 72, m.value > 0 ? 6 : 2);
                      return (
                        <div key={m.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
                          <div style={{ fontSize:"10px", color:"#888", fontWeight:700 }}>
                            {m.value > 0 ? `R${m.value >= 1000 ? Math.round(m.value/1000)+"k" : m.value}` : ""}
                          </div>
                          <div style={{ width:"100%", height:`${h}px`, borderRadius:"6px 6px 0 0", background: isLast ? LIME : "#e0e0dc", transition:"height 0.3s" }} />
                          <div style={{ fontSize:"10px", color: isLast ? DARK : "#bbb", fontWeight: isLast ? 800 : 500 }}>{m.label}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
              <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"12px" }}>Revenue trend</div>
              <div style={{ background:"#f8f8f6", borderRadius:"14px", padding:"20px", textAlign:"center" }}>
                <div style={{ fontSize:"13px", color:"#888", marginBottom:"14px", lineHeight:1.6 }}>
                  No revenue logged yet. Mark bookings as done or log sales on customers to start tracking.
                </div>
                <div style={{ display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={() => setTab("Bookings")}
                    style={{ padding:"8px 16px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                    Go to bookings
                  </button>
                  <button onClick={() => setTab("Customers")}
                    style={{ padding:"8px 16px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                    Log a sale
                  </button>
                </div>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
}

// ── TEMPLATES TAB ──────────────────────────────────────────
function TemplatesTab({ business, setTab, setPrefilledTemplate }) {
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
                {t.products.map((p) => <div key={p.name} style={{ fontSize:"12px", color:"#ccc", marginBottom:"4px" }}>{p.icon} {p.name} — R{p.price}</div>)}
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

// ── PRODUCTS SECTION ───────────────────────────────────────
function ProductsSection({ businessId, prefilledProducts, onProductsPrefilled, onProductsChange, userId }) {
  const [products, setProducts]     = useState([]);
  const [images, setImages]         = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState(false);
  const [saving, setSaving]         = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [newProduct, setNewProduct] = useState({ name:"", price:"", description:"", icon:"🛍️", image:null });

  useEffect(() => {
    if (!userId) return;
    async function loadImages() {
      const { data } = await supabase.storage.from("business-images").list(`product-images/${userId}`, { limit:MAX_IMAGES, sortBy:{ column:"created_at", order:"asc" } });
      if (data) {
        const mapped = data
          .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
          .map((f) => {
            const { data:u } = supabase.storage.from("business-images").getPublicUrl(`product-images/${userId}/${f.name}`);
            return { url:u.publicUrl, path:`product-images/${userId}/${f.name}` };
          });
        setImages(mapped);
      }
      setLoadingImages(false);
    }
    loadImages();
  }, [userId]);

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    supabase.from("products").select("*").eq("business_id", businessId).order("created_at")
      .then(({ data }) => {
        if (data) {
          const mapped = data.map((p) => ({ ...p, icon: p.image && !p.image.startsWith("http") ? p.image : "🛍️" }));
          setProducts(mapped); onProductsChange && onProductsChange(mapped);
        }
        setLoading(false);
      });
  }, [businessId]);

  useEffect(() => {
    if (!prefilledProducts || !businessId || prefilledProducts.length === 0) return;
    async function applyTemplate() {
      await supabase.from("products").delete().eq("business_id", businessId);
      const rows = prefilledProducts.map((p) => ({ business_id:businessId, name:p.name, price:p.price, description:p.description, image:p.icon||"🛍️", is_active:true }));
      const { data } = await supabase.from("products").insert(rows).select();
      if (data) { const mapped = data.map((p) => ({ ...p, icon:p.image })); setProducts(mapped); onProductsChange && onProductsChange(mapped); }
      onProductsPrefilled();
    }
    applyTemplate();
  }, [prefilledProducts, businessId]);

  function updateProducts(list) { setProducts(list); onProductsChange && onProductsChange(list); }

  async function handleAdd() {
    if (!newProduct.name.trim() || !newProduct.price) return;
    setSaving(true);
    const imageValue = newProduct.image || newProduct.icon || "🛍️";
    const { data } = await supabase.from("products").insert([{ business_id:businessId, name:newProduct.name.trim(), price:parseFloat(newProduct.price), description:newProduct.description.trim(), image:imageValue, is_active:true }]).select().single();
    if (data) {
      updateProducts([...products, { ...data, icon: data.image && !data.image.startsWith("http") ? data.image : "🛍️" }]);
      setNewProduct({ name:"", price:"", description:"", icon:"🛍️", image:null });
      setAdding(false);
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    updateProducts(products.filter((p) => p.id !== id));
  }

  async function handleToggleActive(product) {
    const { data } = await supabase.from("products").update({ is_active:!product.is_active }).eq("id", product.id).select().single();
    if (data) updateProducts(products.map((p) => p.id===data.id ? { ...data, icon: data.image && !data.image.startsWith("http") ? data.image : "🛍️" } : p));
  }

  async function handleSaveEdit(id) {
    if (!editForm.name.trim() || !editForm.price) return;
    const imageValue = editForm.image || editForm.icon || "🛍️";
    const { data } = await supabase.from("products").update({ name:editForm.name.trim(), price:parseFloat(editForm.price), description:editForm.description.trim(), image:imageValue }).eq("id", id).select().single();
    if (data) { updateProducts(products.map((p) => p.id===data.id ? { ...data, icon: data.image && !data.image.startsWith("http") ? data.image : "🛍️" } : p)); setEditingId(null); }
  }

  function productThumb(p, size=40) {
    const val = p.image || p.icon || "🛍️";
    return val.startsWith("http")
      ? <img src={val} alt={p.name} style={{ width:size, height:size, borderRadius:"10px", objectFit:"cover", flexShrink:0, border:"1px solid #f0f0f0" }} />
      : <div style={{ width:size, height:size, background:"#f5f5f5", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>{val}</div>;
  }

  if (!businessId) return (
    <div style={{ background:"#fffbe6", border:"1.5px solid #f0d000", borderRadius:"12px", padding:"16px", fontSize:"13px", color:"#7a5e00" }}>
      Save your business details first, then add your products and services.
    </div>
  );

  return (
    <div>
      {!loadingImages && <div style={{ marginBottom:"28px" }}><ImageLibrary userId={userId} images={images} setImages={setImages} uploading={uploadingImage} setUploading={setUploadingImage} /></div>}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
        <div>
          <div style={{ fontSize:"16px", fontWeight:700, color:DARK }}>Products & Services</div>
          <div style={{ fontSize:"13px", color:"#aaa", marginTop:"2px" }}>{products.length} item{products.length!==1?"s":""}</div>
        </div>
        <button onClick={() => setAdding(true)} style={{ backgroundColor:DARK, color:LIME, border:"none", borderRadius:"10px", padding:"9px 16px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>+ Add product</button>
      </div>

      {adding && (
        <div style={{ background:"#f8f8f6", border:"1.5px solid #e0e0dc", borderRadius:"14px", padding:"18px", marginBottom:"14px" }}>
          <div style={{ fontSize:"14px", fontWeight:700, color:DARK, marginBottom:"14px" }}>New product or service</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <input style={inputStyle} placeholder="Name e.g. Gel overlay" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name:e.target.value})} />
            <input style={inputStyle} type="number" placeholder="Price e.g. 220" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price:e.target.value})} />
            <input style={inputStyle} placeholder="Description (optional)" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description:e.target.value})} />
            <ProductImagePicker images={images} selectedImage={newProduct.image} selectedIcon={newProduct.icon}
              onImageSelect={(url) => setNewProduct((p) => ({...p, image:url}))}
              onIconSelect={(ic) => setNewProduct((p) => ({...p, icon:ic, image:null}))} />
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={handleAdd} disabled={saving} style={{ backgroundColor:LIME, color:DARK, border:"none", borderRadius:"10px", padding:"10px 20px", fontSize:"13px", fontWeight:700, cursor:"pointer", flex:1 }}>{saving?"Saving...":"Save product"}</button>
              <button onClick={() => { setAdding(false); setNewProduct({name:"",price:"",description:"",icon:"🛍️",image:null}); }} style={{ background:"#fff", color:"#888", border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"10px 16px", fontSize:"13px", cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div style={{ fontSize:"13px", color:"#aaa", padding:"20px 0" }}>Loading...</div> :
        products.length === 0 ? (
          <div style={{ background:"#f8f8f6", border:"1.5px dashed #ddd", borderRadius:"14px", padding:"32px", textAlign:"center" }}>
            <div style={{ fontSize:"28px", marginBottom:"10px" }}>🛍️</div>
            <div style={{ fontSize:"14px", fontWeight:600, color:"#888" }}>No products yet</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {products.map((p) => (
              <div key={p.id} style={{ background:"#fff", border:`1.5px solid ${editingId===p.id?LIME:"#e8e8e4"}`, borderRadius:"14px", padding:"14px 18px", opacity:p.is_active?1:0.55 }}>
                {editingId===p.id ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm({...editForm,name:e.target.value})} placeholder="Product name" />
                    <input style={inputStyle} type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm,price:e.target.value})} placeholder="Price" />
                    <input style={inputStyle} value={editForm.description} onChange={(e) => setEditForm({...editForm,description:e.target.value})} placeholder="Description" />
                    <ProductImagePicker images={images} selectedImage={editForm.image} selectedIcon={editForm.icon}
                      onImageSelect={(url) => setEditForm((f) => ({...f,image:url}))}
                      onIconSelect={(ic) => setEditForm((f) => ({...f,icon:ic,image:null}))} />
                    <div style={{ display:"flex", gap:"8px" }}>
                      <button onClick={() => handleSaveEdit(p.id)} style={{ backgroundColor:LIME, color:DARK, border:"none", borderRadius:"10px", padding:"9px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer", flex:1 }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ background:"#fff", color:"#888", border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"9px 14px", fontSize:"13px", cursor:"pointer" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    {productThumb(p)}
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>{p.name}</div>
                      {p.description && <div style={{ fontSize:"12px", color:"#aaa", marginTop:"2px" }}>{p.description}</div>}
                    </div>
                    <div style={{ fontSize:"16px", fontWeight:900, color:DARK, minWidth:"55px", textAlign:"right" }}>R{p.price}</div>
                    <button onClick={() => { setEditingId(p.id); const isUrl=p.image&&p.image.startsWith("http"); setEditForm({name:p.name,price:p.price,description:p.description||"",icon:isUrl?"🛍️":(p.image||p.icon||"🛍️"),image:isUrl?p.image:null}); }} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #e0e0e0", background:"#f8f8f6", color:"#555", cursor:"pointer", fontWeight:600 }}>Edit</button>
                    <button onClick={() => handleToggleActive(p)} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #e0e0e0", background:p.is_active?"#f0ffe0":"#f5f5f5", color:p.is_active?"#3a6b00":"#aaa", cursor:"pointer", fontWeight:600, whiteSpace:"nowrap" }}>{p.is_active?"Active":"Hidden"}</button>
                    <button onClick={() => handleDelete(p.id)} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #ffd0d0", background:"#fff5f5", color:"#cc3300", cursor:"pointer", fontWeight:600 }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ── SETUP TAB ──────────────────────────────────────────────
function SetupTab({ user, business, setBusiness, prefilledTemplate, setPrefilledTemplate, setTab, setGlobalProducts, setGlobalLogoUrl }) {
  const [form, setForm] = useState({
    name:        business?.name         || "",
    owner:       business?.owner        || "",
    category:    business?.category     || "",
    area:        business?.area         || "",
    description: business?.description  || "",
    whatsapp:    business?.whatsapp     || "",
    payment:     business?.payment      || "",
    bgColour:    business?.theme        || "#0d0d0d",
    icon:        business?.background_style || "⭐",
    font:        business?.font         || "Inter",
  });
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState("");
  const [savedBusinessId, setSavedBusinessId] = useState(business?.id || null);
  const [prefilledProducts, setPrefilledProducts] = useState(null);
  const [products, setProducts]       = useState([]);
  const [logoUrl, setLogoUrl]         = useState(business?.catalogue || null);
  const [uploading, setUploading]     = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const fileRef = useRef();

  // Inject all unlocked fonts on mount
  useEffect(() => { injectAllUnlockedFonts(); }, []);

  useEffect(() => {
    if (prefilledTemplate) {
      const icons = ICON_TEMPLATES[prefilledTemplate.category] || ["⭐"];
      setForm((prev) => ({ ...prev, category:prefilledTemplate.category, description:prefilledTemplate.starter, icon:icons[0] }));
      setPrefilledProducts(prefilledTemplate.products);
      setPrefilledTemplate(null);
      setSaved(false);
    }
  }, [prefilledTemplate]);

  useEffect(() => { if (business?.id) setSavedBusinessId(business.id); }, [business]);

  function update(field, value) { setForm((prev) => ({...prev,[field]:value})); setSaved(false); }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const compressed = await compressImage(file);
    const path = `logos/${user.id}.jpg`;
    const { error:upErr } = await supabase.storage.from("business-images").upload(path, compressed, { upsert:true });
    if (!upErr) { const { data } = supabase.storage.from("business-images").getPublicUrl(path); setLogoUrl(data.publicUrl + "?t=" + Date.now()); }
    setUploading(false);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Business name is required."); return; }
    setSaving(true); setError("");
    const slug = form.name.toLowerCase().trim().replaceAll(" ","-").replace(/[^a-z0-9-]/g,"");
    const payload = { name:form.name.trim(), slug, owner:form.owner.trim(), category:form.category, area:form.area.trim(), description:form.description.trim(), whatsapp:form.whatsapp.trim(), payment:form.payment, user_id:user.id, theme:form.bgColour, background_style:form.icon, font:form.font, catalogue:logoUrl||"" };
    const { data, error:err } = await supabase.from("businesses").upsert([payload],{ onConflict:"user_id" }).select().single();
    if (err) { setError(err.message); } else { setSaved(true); setBusiness(data); setSavedBusinessId(data.id); }
    setSaving(false);
  }

  async function handleDelete() {
    if (!savedBusinessId) return;
    setDeleting(true);
    try {
      // 1. Delete all products for this business
      await supabase.from("products").delete().eq("business_id", savedBusinessId);
      // 2. Delete product images from storage
      const { data: files } = await supabase.storage
        .from("business-images")
        .list(`product-images/${user.id}`);
      if (files && files.length > 0) {
        const paths = files
          .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
          .map((f) => `product-images/${user.id}/${f.name}`);
        if (paths.length > 0) await supabase.storage.from("business-images").remove(paths);
      }
      // 3. Delete logo from storage
      await supabase.storage.from("business-images").remove([`logos/${user.id}.jpg`]);
      // 4. Delete the business record
      await supabase.from("businesses").delete().eq("id", savedBusinessId);
      // 5. Reset all local state
      setBusiness(null);
      setGlobalProducts([]);
      setGlobalLogoUrl(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
    setDeleting(false);
  }

  const iconOptions = ICON_TEMPLATES[form.category] || ICON_TEMPLATES["Other"];

  return (
    <div style={{ display:"flex", gap:"40px", alignItems:"flex-start" }}>
      <div style={{ flex:1, minWidth:0 }}>
        {/* Sticky save bar */}
        <div style={{ position:"sticky", top:0, background:"#f5f5f3", zIndex:10, paddingBottom:"16px", paddingTop:"4px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Business Setup</h2>
              <p style={{ fontSize:"13px", color:"#888" }}>Changes update your preview instantly.</p>
            </div>
            <button onClick={handleSave} disabled={saving} style={{ backgroundColor:saving?"#ccc":saved?"#e8f5d0":LIME, color:saving?"#fff":saved?"#3a6b00":DARK, border:saved?"1.5px solid #a3e635":"none", borderRadius:"12px", padding:"12px 24px", fontSize:"14px", fontWeight:800, cursor:saving?"not-allowed":"pointer", whiteSpace:"nowrap" }}>
              {saving?"Saving...":saved?"✓ Saved":"Save Business"}
            </button>
          </div>
          {error && <div style={{ fontSize:"13px", color:"#cc3300", background:"#fff0ee", padding:"10px 14px", borderRadius:"10px", marginTop:"8px" }}>{error}</div>}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"18px", marginBottom:"36px" }}>
          <div><label style={labelStyle}>Business name *</label><input style={inputStyle} placeholder="e.g. Nomsa's Nails" value={form.name} onChange={(e) => update("name",e.target.value)} /></div>
          <div><label style={labelStyle}>Owner name</label><input style={inputStyle} placeholder="Your full name" value={form.owner} onChange={(e) => update("owner",e.target.value)} /></div>
          <div>
            <label style={labelStyle}>Business type</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
              {CATEGORIES.map((cat) => <button key={cat} onClick={() => update("category",cat)} style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:600, cursor:"pointer", border:"1.5px solid", background:form.category===cat?DARK:"#fff", color:form.category===cat?LIME:"#555", borderColor:form.category===cat?DARK:"#e0e0e0" }}>{cat}</button>)}
            </div>
          </div>
          <div><label style={labelStyle}>Area / Location</label><input style={inputStyle} placeholder="e.g. Soweto, Gauteng" value={form.area} onChange={(e) => update("area",e.target.value)} /></div>
          <div><label style={labelStyle}>Business description</label><textarea style={{...inputStyle, minHeight:"90px", resize:"vertical"}} placeholder="Briefly describe what you do..." value={form.description} onChange={(e) => update("description",e.target.value)} /></div>
          <div><label style={labelStyle}>WhatsApp number</label><input style={inputStyle} placeholder="+27 82 000 0000" value={form.whatsapp} onChange={(e) => update("whatsapp",e.target.value)} /></div>
          <div>
            <label style={labelStyle}>Payment method</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
              {PAYMENT_METHODS.map((method) => <button key={method} onClick={() => update("payment",method)} style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:600, cursor:"pointer", border:"1.5px solid", background:form.payment===method?DARK:"#fff", color:form.payment===method?LIME:"#555", borderColor:form.payment===method?DARK:"#e0e0e0" }}>{method}</button>)}
            </div>
          </div>

          {/* ── COLOUR PICKER (tiered) ── */}
          <div>
            <label style={labelStyle}>Page background colour</label>
            <ColourPicker value={form.bgColour} onChange={(v) => update("bgColour",v)} onViewPlans={() => setTab("Plans")} />
          </div>

          {/* ── FONT PICKER (tiered) ── */}
          <div>
            <label style={labelStyle}>Page font</label>
            <div style={{ fontSize:"11px", color:"#aaa", marginBottom:"8px" }}>Applies to your entire business page.</div>
            <FontPicker value={form.font} onChange={(v) => update("font",v)} onViewPlans={() => setTab("Plans")} />
          </div>

          {/* ── HEADER ICON ── */}
          <div>
            <label style={labelStyle}>Business header icon</label>
            <div style={{ fontSize:"11px", color:"#aaa", marginBottom:"8px" }}>Appears in your page header — products have their own images/icons.</div>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {iconOptions.map((ic) => (
                <button key={ic} onClick={() => update("icon",ic)}
                  style={{ width:"44px", height:"44px", borderRadius:"12px", background:form.icon===ic?DARK:"#fff", border:`1.5px solid ${form.icon===ic?DARK:"#e0e0e0"}`, fontSize:"22px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* ── LOGO UPLOAD ── */}
          <div>
            <label style={labelStyle}>Logo / Photo (optional)</label>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              {logoUrl && <img src={logoUrl} alt="logo" style={{ width:"56px", height:"56px", borderRadius:"14px", objectFit:"cover", border:"1.5px solid #eee" }} />}
              <button onClick={() => fileRef.current.click()} disabled={uploading} style={{ backgroundColor:"#fff", color:DARK, border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"10px 16px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
                {uploading?"Uploading...":logoUrl?"Change photo":"Upload photo"}
              </button>
              {logoUrl && <button onClick={() => setLogoUrl(null)} style={{ background:"transparent", border:"none", color:"#cc3300", fontSize:"12px", cursor:"pointer" }}>Remove</button>}
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoUpload} />
            </div>
            <div style={{ fontSize:"11px", color:"#bbb", marginTop:"6px" }}>Upload from your phone or computer. JPG or PNG.</div>
          </div>
        </div>

        <div style={{ borderTop:"1.5px solid #eeeeea", marginBottom:"32px" }} />

        <ProductsSection businessId={savedBusinessId} prefilledProducts={prefilledProducts} onProductsPrefilled={() => setPrefilledProducts(null)} onProductsChange={setProducts} userId={user.id} />

        {/* ── DANGER ZONE ── */}
        {savedBusinessId && (
          <div style={{ marginTop:"48px", border:"1.5px solid #ffd0d0", borderRadius:"16px", padding:"24px", background:"#fffafa" }}>
            <div style={{ fontSize:"13px", fontWeight:700, color:"#cc3300", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px" }}>⚠️ Danger Zone</div>
            <div style={{ fontSize:"13px", color:"#888", marginBottom:"16px" }}>
              Deleting your business is permanent. All products, images and your business page will be removed. Your account stays active.
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{ background:"#fff", color:"#cc3300", border:"1.5px solid #ffd0d0", borderRadius:"10px", padding:"10px 20px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}
              >
                Delete this business…
              </button>
            ) : (
              <div style={{ background:"#fff", border:"1.5px solid #ffb0b0", borderRadius:"12px", padding:"18px" }}>
                <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"6px" }}>
                  Type <span style={{ fontFamily:"monospace", background:"#f5f5f5", padding:"2px 6px", borderRadius:"4px" }}>{business?.name}</span> to confirm
                </div>
                <div style={{ fontSize:"12px", color:"#aaa", marginBottom:"12px" }}>This cannot be undone.</div>
                <input
                  style={{ ...inputStyle, marginBottom:"12px", borderColor: confirmText === business?.name ? "#cc3300" : "#e8e8e8" }}
                  placeholder={`Type "${business?.name}" to confirm`}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
                <div style={{ display:"flex", gap:"8px" }}>
                  <button
                    onClick={handleDelete}
                    disabled={confirmText !== business?.name || deleting}
                    style={{
                      background: confirmText === business?.name ? "#cc3300" : "#f5f5f5",
                      color: confirmText === business?.name ? "#fff" : "#bbb",
                      border:"none", borderRadius:"10px", padding:"10px 20px",
                      fontSize:"13px", fontWeight:700,
                      cursor: confirmText === business?.name && !deleting ? "pointer" : "not-allowed",
                      flex:1,
                    }}
                  >
                    {deleting ? "Deleting…" : "Yes, delete everything"}
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setConfirmText(""); }}
                    style={{ background:"#fff", color:"#888", border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"10px 16px", fontSize:"13px", cursor:"pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT — Live preview */}
      <div style={{ width:"320px", flexShrink:0, position:"sticky", top:"24px" }}>
        <BusinessPagePreview form={form} products={products} logoUrl={logoUrl} isFullPage={false} />
      </div>
    </div>
  );
}

// ── PAGE TAB ───────────────────────────────────────────────
function PageTab({ business, products, logoUrl }) {
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


// ── CUSTOMERS TAB COMPONENTS ─────────────────────────────

function waLink(number, message = "") {
  const clean = number.replace(/\D/g, "");
  const msg = encodeURIComponent(message);
  return `https://wa.me/${clean}${msg ? `?text=${msg}` : ""}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatPhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return "+27" + digits.slice(1);
  if (digits.startsWith("27") && digits.length === 11) return "+" + digits;
  return raw.trim();
}

// ── STATUS CONFIG ──────────────────────────────────────────
const CUSTOMER_STATUSES = [
  { value: "lead",    label: "Lead",    color: "#666",    bg: "#f5f5f3", border: "#d8d8d4", desc: "Interested but hasn't booked yet" },
  { value: "new",     label: "New",     color: "#444",    bg: "#eeeeea", border: "#c8c8c4", desc: "Booked once" },
  { value: "regular", label: "Regular", color: "#1a1a1a", bg: "#e0e0dc", border: "#b8b8b4", desc: "Comes back regularly" },
  { value: "vip",     label: "VIP",     color: "#0d0d0d", bg: "#a3e635", border: "#8bc620", desc: "Your best customers" },
];

function statusConfig(val) {
  return CUSTOMER_STATUSES.find((s) => s.value === val) || CUSTOMER_STATUSES[1];
}

function StatusBadge({ status, small }) {
  const s = statusConfig(status);
  return (
    <span style={{
      fontSize: small ? "10px" : "11px",
      fontWeight: 700,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: "6px",
      padding: small ? "1px 6px" : "2px 8px",
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ── CONTACT PICKER ─────────────────────────────────────────
const CONTACT_PICKER_SUPPORTED =
  typeof navigator !== "undefined" &&
  "contacts" in navigator &&
  "ContactsManager" in window;

async function pickFromContacts() {
  if (!CONTACT_PICKER_SUPPORTED) return null;
  try {
    const results = await navigator.contacts.select(["name", "tel"], { multiple: true });
    return results.map((c) => ({
      name: c.name?.[0] || "",
      whatsapp: c.tel?.[0] ? formatPhone(c.tel[0]) : "",
    }));
  } catch {
    return null;
  }
}

// ── IMPORT PREVIEW MODAL ───────────────────────────────────
function ImportPreviewModal({ contacts, onConfirm, onCancel, importing }) {
  const [selected, setSelected] = useState(() => new Set(contacts.map((_, i) => i)));
  function toggle(i) {
    setSelected((prev) => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; });
  }
  const toImport = contacts.filter((_, i) => selected.has(i));
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"28px", width:"100%", maxWidth:"460px", boxShadow:"0 20px 60px rgba(0,0,0,0.25)", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
        <h3 style={{ fontSize:"18px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Import contacts</h3>
        <p style={{ fontSize:"13px", color:"#aaa", marginBottom:"16px" }}>{contacts.length} found — deselect any you don't want</p>
        <div style={{ overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:"6px", marginBottom:"16px" }}>
          {contacts.map((c, i) => (
            <div key={i} onClick={() => toggle(i)}
              style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", borderRadius:"12px", border:`1.5px solid ${selected.has(i) ? LIME : "#e0e0e0"}`, background:selected.has(i) ? "#f7ffe0" : "#fff", cursor:"pointer" }}>
              <div style={{ width:"18px", height:"18px", borderRadius:"5px", border:`2px solid ${selected.has(i) ? LIME : "#ccc"}`, background:selected.has(i) ? LIME : "#fff", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:800 }}>
                {selected.has(i) ? "✓" : ""}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>{c.name || "—"}</div>
                {c.whatsapp && <div style={{ fontSize:"12px", color:"#aaa" }}>{c.whatsapp}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={() => onConfirm(toImport)} disabled={toImport.length === 0 || importing}
            style={{ flex:1, backgroundColor:toImport.length > 0 ? LIME : "#e0e0e0", color:toImport.length > 0 ? DARK : "#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:toImport.length > 0 ? "pointer" : "not-allowed" }}>
            {importing ? "Importing…" : `Import ${toImport.length} contact${toImport.length !== 1 ? "s" : ""}`}
          </button>
          <button onClick={onCancel} style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── LOG SALE MODAL ─────────────────────────────────────────
function LogSaleModal({ customer, onClose, onLogged }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  async function handleLog() {
    const val = parseFloat(amount);
    if (!val) return;
    setSaving(true);
    const { data } = await supabase.from("customers")
      .update({ total_spent:(customer.total_spent||0)+val, visit_count:(customer.visit_count||0)+1, last_contacted:new Date().toISOString(), status: customer.status === "lead" ? "new" : customer.status })
      .eq("id", customer.id).select().single();
    if (data) onLogged(data);
    setSaving(false);
    onClose();
  }
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"32px", width:"100%", maxWidth:"380px", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize:"18px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Log a sale</h3>
        <p style={{ fontSize:"13px", color:"#aaa", marginBottom:"24px" }}>Payment from <strong>{customer.name}</strong></p>
        {customer.status === "lead" && <div style={{ fontSize:"12px", color:"#555", background:"#f5f5f3", border:"1px solid #d8d8d4", borderRadius:"8px", padding:"8px 12px", marginBottom:"16px" }}>Logging a sale will automatically move them from Lead → New</div>}
        <label style={labelStyle}>Amount (R)</label>
        <input style={{ ...inputStyle, fontSize:"28px", fontWeight:800, marginBottom:"20px", textAlign:"center" }}
          type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={handleLog} disabled={!amount || saving}
            style={{ flex:1, backgroundColor:amount ? LIME : "#e0e0e0", color:amount ? DARK : "#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:amount ? "pointer" : "not-allowed" }}>
            {saving ? "Saving…" : "Log sale"}
          </button>
          <button onClick={onClose} style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── WHATSAPP MODAL ─────────────────────────────────────────
function WhatsAppModal({ customer, onClose }) {
  const TEMPLATES = [
    { label:"Check in",      text:`Hi ${customer.name}! 👋 Just checking in — is there anything I can help you with?` },
    { label:"Follow up",     text:`Hi ${customer.name}! Just wanted to follow up — hope everything went well. Would love to have you back! 😊` },
    { label:"Special offer", text:`Hi ${customer.name}! 🎉 I have a special offer just for you this week. Reply to find out more!` },
    { label:"Reminder",      text:`Hi ${customer.name}! Just a reminder about your upcoming appointment. See you soon! 😊` },
  ];
  const [message, setMessage] = useState(TEMPLATES[0].text);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"32px", width:"100%", maxWidth:"420px", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize:"18px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Message {customer.name}</h3>
        <p style={{ fontSize:"13px", color:"#aaa", marginBottom:"20px" }}>{customer.whatsapp}</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"14px" }}>
          {TEMPLATES.map((t) => (
            <button key={t.label} onClick={() => setMessage(t.text)}
              style={{ padding:"6px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:600, cursor:"pointer", border:"1.5px solid", background:message===t.text?DARK:"#fff", color:message===t.text?LIME:"#555", borderColor:message===t.text?DARK:"#e0e0e0" }}>
              {t.label}
            </button>
          ))}
        </div>
        <textarea style={{ ...inputStyle, minHeight:"100px", resize:"vertical", marginBottom:"16px" }}
          value={message} onChange={(e) => setMessage(e.target.value)} />
        <div style={{ display:"flex", gap:"8px" }}>
          <a href={waLink(customer.whatsapp, message)} target="_blank" rel="noopener noreferrer"
            style={{ flex:1, display:"block", backgroundColor:"#25d366", color:"#fff", textAlign:"center", padding:"13px", fontSize:"14px", fontWeight:800, borderRadius:"12px", textDecoration:"none" }}>
            Open WhatsApp →
          </a>
          <button onClick={onClose} style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── CUSTOMER FORM ──────────────────────────────────────────
function CustomerForm({ initial = {}, onSave, onCancel, saving, businessProducts }) {
  const [form, setForm] = useState({
    name:          initial.name          || "",
    whatsapp:      initial.whatsapp      || "",
    area:          initial.area          || "",
    notes:         initial.notes         || "",
    status:        initial.status        || "new",
    interested_in: initial.interested_in || [],
  });
  function upd(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function toggleProduct(productName) {
    setForm((p) => ({
      ...p,
      interested_in: p.interested_in.includes(productName)
        ? p.interested_in.filter((x) => x !== productName)
        : [...p.interested_in, productName],
    }));
  }

  const valid = form.name.trim().length > 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

      {/* Status */}
      <div>
        <label style={labelStyle}>Status</label>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
          {CUSTOMER_STATUSES.map((s) => (
            <button key={s.value} onClick={() => upd("status", s.value)}
              title={s.desc}
              style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${form.status===s.value ? s.border : "#e0e0e0"}`, background:form.status===s.value ? s.bg : "#fff", color:form.status===s.value ? s.color : "#888" }}>
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize:"11px", color:"#bbb", marginTop:"5px" }}>{statusConfig(form.status).desc}</div>
      </div>

      <div>
        <label style={labelStyle}>Name *</label>
        <input style={inputStyle} placeholder="Customer name" value={form.name} onChange={(e) => upd("name", e.target.value)} autoFocus />
      </div>
      <div>
        <label style={labelStyle}>WhatsApp number</label>
        <input style={inputStyle} placeholder="+27 82 000 0000" value={form.whatsapp} onChange={(e) => upd("whatsapp", e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Area / Neighbourhood</label>
        <input style={inputStyle} placeholder="e.g. Soweto, Sandton" value={form.area} onChange={(e) => upd("area", e.target.value)} />
      </div>

      {/* Product interest — only show if business has products */}
      {businessProducts && businessProducts.length > 0 && (
        <div>
          <label style={labelStyle}>Interested in</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
            {businessProducts.map((p) => {
              const selected = form.interested_in.includes(p.name);
              const imgVal = p.image || p.icon || "🛍️";
              const isUrl  = imgVal.startsWith("http");
              return (
                <button key={p.id} onClick={() => toggleProduct(p.name)}
                  style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 14px", borderRadius:"12px", border:`1.5px solid ${selected ? LIME : "#e0e0e0"}`, background:selected ? "#f7ffe0" : "#fff", cursor:"pointer" }}>
                  {isUrl
                    ? <img src={imgVal} alt="" style={{ width:"20px", height:"20px", borderRadius:"5px", objectFit:"cover" }} />
                    : <span style={{ fontSize:"16px" }}>{imgVal}</span>
                  }
                  <span style={{ fontSize:"13px", fontWeight:700, color:selected ? "#3a6b00" : "#555" }}>{p.name}</span>
                  {selected && <span style={{ fontSize:"11px", color:LIME }}>✓</span>}
                </button>
              );
            })}
          </div>
          {form.interested_in.length > 0 && (
            <div style={{ fontSize:"11px", color:"#5a9a00", marginTop:"5px" }}>
              {form.interested_in.length} service{form.interested_in.length !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      )}

      <div>
        <label style={labelStyle}>Notes</label>
        <textarea style={{ ...inputStyle, minHeight:"72px", resize:"vertical" }}
          placeholder="Allergies, preferences, anything useful…"
          value={form.notes} onChange={(e) => upd("notes", e.target.value)} />
      </div>

      <div style={{ display:"flex", gap:"8px" }}>
        <button onClick={() => onSave(form)} disabled={!valid || saving}
          style={{ flex:1, backgroundColor:valid ? LIME : "#e0e0e0", color:valid ? DARK : "#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:valid ? "pointer" : "not-allowed" }}>
          {saving ? "Saving…" : "Save customer"}
        </button>
        <button onClick={onCancel}
          style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── CUSTOMER CARD ──────────────────────────────────────────
function CustomerCard({ customer, onEdit, onDelete, onLogSale, onWhatsApp, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const initials = customer.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
  const s = statusConfig(customer.status || "new");

  return (
    <div style={{ background:"#fff", border:`1.5px solid ${s.border}`, borderRadius:"16px", overflow:"hidden" }}>
      {/* Main row */}
      <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:"14px", cursor:"pointer" }}
        onClick={() => setExpanded((x) => !x)}>
        {/* Avatar */}
        <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:s.bg, border:`2px solid ${s.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", fontWeight:800, color:s.color, flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"3px" }}>
            <span style={{ fontSize:"15px", fontWeight:700, color:DARK, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{customer.name}</span>
            <StatusBadge status={customer.status || "new"} small />
          </div>
          <div style={{ fontSize:"12px", color:"#aaa", display:"flex", gap:"10px", flexWrap:"wrap" }}>
            {customer.whatsapp && <span>{customer.whatsapp}</span>}
            {customer.area && <span>{customer.area}</span>}
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          {customer.total_spent > 0 && <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>R{customer.total_spent.toLocaleString()}</div>}
          {customer.last_contacted && <div style={{ fontSize:"11px", color:"#bbb", marginTop:"2px" }}>{timeAgo(customer.last_contacted)}</div>}
        </div>
        <span style={{ fontSize:"12px", color:"#ccc", marginLeft:"4px" }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop:"1px solid #f5f5f5", padding:"14px 18px", background:"#fafafa" }}>

          {/* Interested in */}
          {customer.interested_in && customer.interested_in.length > 0 && (
            <div style={{ marginBottom:"12px" }}>
              <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"6px" }}>Interested in</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                {customer.interested_in.map((item) => (
                  <span key={item} style={{ fontSize:"12px", fontWeight:600, color:"#3a6b00", background:"#f7ffe0", border:"1px solid #c3e66a", borderRadius:"8px", padding:"3px 10px" }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div style={{ fontSize:"13px", color:"#666", background:"#fff", border:"1px solid #eeeeea", borderRadius:"10px", padding:"10px 14px", marginBottom:"12px", lineHeight:1.6 }}>
              {customer.notes}
            </div>
          )}

          {/* Status quick-change */}
          <div style={{ marginBottom:"12px" }}>
            <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"6px" }}>Move to</div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {CUSTOMER_STATUSES.filter((st) => st.value !== (customer.status || "new")).map((st) => (
                <button key={st.value} onClick={() => onStatusChange(customer, st.value)}
                  style={{ padding:"5px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${st.border}`, background:st.bg, color:st.color }}>
                  → {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {customer.whatsapp && (
              <button onClick={() => onWhatsApp(customer)}
                style={{ display:"flex", alignItems:"center", gap:"5px", padding:"8px 14px", borderRadius:"10px", border:"none", background:"#25d366", color:"#fff", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                WhatsApp
              </button>
            )}
            <button onClick={() => onLogSale(customer)}
              style={{ padding:"8px 14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
              Log sale
            </button>
            <button onClick={() => onEdit(customer)}
              style={{ padding:"8px 14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
              Edit
            </button>
            <button onClick={() => onDelete(customer)}
              style={{ padding:"8px 14px", borderRadius:"10px", border:"1.5px solid #ffd0d0", background:"#fff5f5", color:"#cc3300", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
              Delete
            </button>
          </div>

          {/* Stats */}
          {(customer.visit_count > 0 || customer.total_spent > 0) && (
            <div style={{ display:"flex", gap:"20px", marginTop:"14px", paddingTop:"14px", borderTop:"1px solid #f0f0f0" }}>
              <div>
                <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Visits</div>
                <div style={{ fontSize:"20px", fontWeight:800, color:DARK }}>{customer.visit_count || 0}</div>
              </div>
              <div>
                <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Total spent</div>
                <div style={{ fontSize:"20px", fontWeight:800, color:DARK }}>R{(customer.total_spent||0).toLocaleString()}</div>
              </div>
              {customer.last_contacted && (
                <div>
                  <div style={{ fontSize:"11px", color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Last seen</div>
                  <div style={{ fontSize:"20px", fontWeight:800, color:DARK }}>{timeAgo(customer.last_contacted)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN CUSTOMERS TAB ─────────────────────────────────────
function CustomersTab({ business }) {
  const [customers, setCustomers]       = useState([]);
  const [businessProducts, setBusinessProducts] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy]             = useState("recent");
  const [mode, setMode]                 = useState("list");
  const [editTarget, setEditTarget]     = useState(null);
  const [saving, setSaving]             = useState(false);
  const [logSaleFor, setLogSaleFor]     = useState(null);
  const [whatsAppFor, setWhatsAppFor]   = useState(null);
  const [importContacts, setImportContacts] = useState(null);
  const [importing, setImporting]       = useState(false);
  const [toast, setToast]               = useState("");

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2800); }

  // ── LOAD ───────────────────────────────────────────────────
  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    // Load customers and products in parallel
    Promise.all([
      supabase.from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
      supabase.from("products").select("id,name,image").eq("business_id", business.id).eq("is_active", true),
    ]).then(([{ data: custs, error: e1 }, { data: prods, error: e2 }]) => {
      if (e1) console.error("Load customers:", e1);
      if (e2) console.error("Load products:", e2);
      if (custs) setCustomers(custs);
      if (prods) setBusinessProducts(prods);
      setLoading(false);
    });
  }, [business?.id]);

  // ── FILTERED LIST ──────────────────────────────────────────
  const filtered = customers
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.whatsapp?.includes(q) || c.area?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || (c.status || "new") === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "spent") return (b.total_spent||0) - (a.total_spent||0);
      if (sortBy === "name")  return a.name.localeCompare(b.name);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // ── SAVE ───────────────────────────────────────────────────
  async function handleSave(form) {
    if (!business?.id) return;
    setSaving(true);
    const payload = {
      name:          form.name.trim(),
      whatsapp:      formatPhone(form.whatsapp),
      area:          form.area.trim(),
      notes:         form.notes.trim(),
      status:        form.status,
      interested_in: form.interested_in,
    };
    if (editTarget) {
      const { data, error } = await supabase.from("customers").update(payload).eq("id", editTarget.id).select().single();
      if (error) console.error("Update error:", error);
      if (data) setCustomers((prev) => prev.map((c) => c.id === data.id ? data : c));
      showToast("Customer updated ✓");
    } else {
      const { data, error } = await supabase.from("customers").insert([{ ...payload, business_id: business.id }]).select().single();
      if (error) console.error("Insert error:", error);
      if (data) setCustomers((prev) => [data, ...prev]);
      showToast("Customer added ✓");
    }
    setSaving(false);
    setMode("list");
    setEditTarget(null);
  }

  // ── DELETE ─────────────────────────────────────────────────
  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.name}?`)) return;
    await supabase.from("customers").delete().eq("id", customer.id);
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    showToast("Customer deleted");
  }

  // ── STATUS CHANGE ──────────────────────────────────────────
  async function handleStatusChange(customer, newStatus) {
    const { data } = await supabase.from("customers").update({ status: newStatus }).eq("id", customer.id).select().single();
    if (data) setCustomers((prev) => prev.map((c) => c.id === data.id ? data : c));
    const s = statusConfig(newStatus);
    showToast(`${customer.name} → ${s.label} ✓`);
  }

  // ── LOG SALE ───────────────────────────────────────────────
  function handleSaleLogged(updated) {
    setCustomers((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    showToast(`R${updated.total_spent?.toLocaleString()} total for ${updated.name} ✓`);
  }

  // ── IMPORT ─────────────────────────────────────────────────
  async function handleImportPhone() {
    const picked = await pickFromContacts();
    if (!picked || picked.length === 0) { showToast("No contacts selected."); return; }
    setImportContacts(picked);
  }

  async function handleConfirmImport(contacts) {
    if (!business?.id || contacts.length === 0) return;
    setImporting(true);
    const rows = contacts.map((c) => ({ business_id:business.id, name:c.name||"Unknown", whatsapp:c.whatsapp||"", status:"new", interested_in:[] }));
    const { data, error } = await supabase.from("customers").insert(rows).select();
    if (error) console.error("Import error:", error);
    if (data) setCustomers((prev) => [...data, ...prev]);
    setImporting(false);
    setImportContacts(null);
    showToast(`${contacts.length} contact${contacts.length!==1?"s":""} imported ✓`);
  }

  // ── STATS ──────────────────────────────────────────────────
  const totalSpent  = customers.reduce((s, c) => s + (c.total_spent||0), 0);
  const countByStatus = (st) => customers.filter((c) => (c.status||"new") === st).length;

  if (!business?.id) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:"40px", marginBottom:"16px" }}>🏪</div>
      <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>Set up your business first</h3>
      <p style={{ fontSize:"14px", color:"#aaa" }}>Complete your business setup before adding customers.</p>
    </div>
  );

  // ── ADD / EDIT FORM ────────────────────────────────────────
  if (mode === "add" || mode === "edit") return (
    <div style={{ maxWidth:"540px" }}>
      <button onClick={() => { setMode("list"); setEditTarget(null); }}
        style={{ background:"transparent", border:"none", fontSize:"13px", color:"#aaa", cursor:"pointer", padding:"0 0 16px" }}>
        ← Back
      </button>
      <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"24px" }}>
        {mode === "edit" ? `Edit ${editTarget?.name}` : "Add customer"}
      </h2>
      <CustomerForm
        initial={editTarget || {}}
        onSave={handleSave}
        onCancel={() => { setMode("list"); setEditTarget(null); }}
        saving={saving}
        businessProducts={businessProducts}
      />
    </div>
  );

  // ── LIST VIEW ──────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Customers</h2>
          <p style={{ fontSize:"13px", color:"#aaa" }}>{customers.length} total · R{totalSpent.toLocaleString()} earned</p>
        </div>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
          {CONTACT_PICKER_SUPPORTED && (
            <button onClick={handleImportPhone}
              style={{ padding:"10px 16px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
              Import contacts
            </button>
          )}
          <button onClick={() => setMode("add")}
            style={{ padding:"10px 18px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
            + Add customer
          </button>
        </div>
      </div>

      {/* Status strip */}
      {customers.length > 0 && (
        <div style={{ display:"flex", gap:"8px", marginBottom:"20px", flexWrap:"wrap" }}>
          <button onClick={() => setFilterStatus("all")}
            style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:"1.5px solid", background:filterStatus==="all"?DARK:"#fff", color:filterStatus==="all"?"#fff":"#555", borderColor:filterStatus==="all"?DARK:"#e0e0e0" }}>
            All ({customers.length})
          </button>
          {CUSTOMER_STATUSES.map((s) => {
            const count = countByStatus(s.value);
            if (count === 0) return null;
            return (
              <button key={s.value} onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
                style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${filterStatus===s.value ? s.border : "#e0e0e0"}`, background:filterStatus===s.value ? s.bg : "#fff", color:filterStatus===s.value ? s.color : "#888" }}>
                {s.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {customers.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:"10px", marginBottom:"20px" }}>
          {[
            { label:"Total",    value: customers.length },
            { label:"Leads",    value: countByStatus("lead") },
            { label:"Revenue",  value: `R${totalSpent.toLocaleString()}` },
            { label:"Avg spend",value: customers.filter((c)=>c.total_spent>0).length ? `R${Math.round(totalSpent/customers.filter((c)=>c.total_spent>0).length).toLocaleString()}` : "—" },
          ].map((s) => (
            <div key={s.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px" }}>
              <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{s.label}</div>
              <div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search + sort */}
      {customers.length > 0 && (
        <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
          <input style={{ ...inputStyle, flex:1, minWidth:"180px", padding:"10px 14px" }}
            placeholder="Search by name, number, area…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ padding:"10px 14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", fontSize:"13px", fontWeight:600, color:"#555", cursor:"pointer", outline:"none" }}>
            <option value="recent">Most recent</option>
            <option value="spent">Top spenders</option>
            <option value="name">A → Z</option>
          </select>
        </div>
      )}

      {loading && <div style={{ textAlign:"center", padding:"60px", color:"#aaa" }}>Loading…</div>}

      {/* Empty state */}
      {!loading && customers.length === 0 && (
        <div style={{ textAlign:"center", padding:"64px 24px" }}>
          <div style={{ fontSize:"44px", marginBottom:"14px" }}>👥</div>
          <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>No customers yet</h3>
          <p style={{ fontSize:"14px", color:"#aaa", marginBottom:"32px" }}>
            Add your first customer{CONTACT_PICKER_SUPPORTED ? " or import from your phone contacts" : ""}.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px", maxWidth:"280px", margin:"0 auto" }}>
            {CONTACT_PICKER_SUPPORTED && (
              <button onClick={handleImportPhone}
                style={{ backgroundColor:LIME, color:DARK, border:"none", borderRadius:"12px", padding:"13px 20px", fontSize:"14px", fontWeight:700, cursor:"pointer" }}>
                Import contacts contacts
              </button>
            )}
            <button onClick={() => setMode("add")}
              style={{ backgroundColor:CONTACT_PICKER_SUPPORTED?"#fff":DARK, color:CONTACT_PICKER_SUPPORTED?DARK:LIME, border:CONTACT_PICKER_SUPPORTED?"1.5px solid #e0e0e0":"none", borderRadius:"12px", padding:"13px 20px", fontSize:"14px", fontWeight:700, cursor:"pointer" }}>
              + Add customer manually
            </button>
          </div>
        </div>
      )}

      {!loading && customers.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"48px", color:"#aaa" }}>No customers match your search.</div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {filtered.map((c) => (
            <CustomerCard key={c.id} customer={c}
              onEdit={(cust) => { setEditTarget(cust); setMode("edit"); }}
              onDelete={handleDelete}
              onLogSale={setLogSaleFor}
              onWhatsApp={setWhatsAppFor}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {logSaleFor  && <LogSaleModal  customer={logSaleFor}  onClose={() => setLogSaleFor(null)}  onLogged={handleSaleLogged} />}
      {whatsAppFor && <WhatsAppModal customer={whatsAppFor} onClose={() => setWhatsAppFor(null)} />}
      {importContacts && <ImportPreviewModal contacts={importContacts} onConfirm={handleConfirmImport} onCancel={() => setImportContacts(null)} importing={importing} />}

      {toast && (
        <div style={{ position:"fixed", bottom:"28px", left:"50%", transform:"translateX(-50%)", background:DARK, color:LIME, padding:"12px 24px", borderRadius:"999px", fontSize:"13px", fontWeight:700, zIndex:2000, boxShadow:"0 8px 32px rgba(0,0,0,0.25)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}


// ── BOOKINGS TAB ───────────────────────────────────────────

const BOOKING_TIMES = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00",
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", { weekday:"short", day:"numeric", month:"short" });
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

function isTomorrow(dateStr) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === tomorrow.toISOString().slice(0, 10);
}

function dateLabel(dateStr) {
  if (isToday(dateStr))    return "Today";
  if (isTomorrow(dateStr)) return "Tomorrow";
  return formatDate(dateStr);
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function weekEnd() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

const STATUS_CONFIG = {
  confirmed: { label:"Confirmed", color:"#1a1a1a", bg:"#eeeeea",  border:"#c8c8c4" },
  done:      { label:"Done",      color:"#3a6b00", bg:"#f0ffe0",  border:"#a3e635" },
  cancelled: { label:"Cancelled", color:"#cc3300", bg:"#fff5f5",  border:"#ffd0d0" },
};

// ── CUSTOMER SEARCH INPUT ──────────────────────────────────
function CustomerSearchInput({ customers, value, onSelect }) {
  const [query, setQuery]   = useState(value?.customer_name || "");
  const [open, setOpen]     = useState(false);
  const [isNew, setIsNew]   = useState(false);

  const matches = query.length > 0
    ? customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  function handleSelect(c) {
    setQuery(c.name);
    setOpen(false);
    setIsNew(false);
    onSelect({ customer_id: c.id, customer_name: c.name, interested_in: c.interested_in || [] });
  }

  function handleChange(e) {
    setQuery(e.target.value);
    setOpen(true);
    setIsNew(false);
    if (!e.target.value.trim()) {
      onSelect({ customer_id: null, customer_name: "", interested_in: [] });
    }
  }

  function handleCreateNew() {
    setOpen(false);
    setIsNew(true);
    onSelect({ customer_id: null, customer_name: query.trim(), interested_in: [], isNew: true });
  }

  return (
    <div style={{ position:"relative" }}>
      <input
        style={{ ...inputStyle, borderColor: isNew ? "#a3e635" : "#e8e8e8" }}
        placeholder="Type customer name…"
        value={query}
        onChange={handleChange}
        onFocus={() => query.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {isNew && (
        <div style={{ fontSize:"11px", color:"#5a9a00", marginTop:"4px" }}>
          New customer — will be created automatically when you save
        </div>
      )}
      {open && query.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"1.5px solid #e0e0e0", borderRadius:"12px", boxShadow:"0 8px 24px rgba(0,0,0,0.1)", zIndex:100, overflow:"hidden", marginTop:"4px" }}>
          {matches.map((c) => (
            <div key={c.id} onMouseDown={() => handleSelect(c)}
              style={{ padding:"10px 14px", cursor:"pointer", borderBottom:"1px solid #f5f5f5", display:"flex", flexDirection:"column", gap:"2px" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8f8f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
              <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>{c.name}</div>
              {c.whatsapp && <div style={{ fontSize:"12px", color:"#aaa" }}>{c.whatsapp}</div>}
              {c.interested_in?.length > 0 && (
                <div style={{ fontSize:"11px", color:"#5a9a00" }}>Interested in: {c.interested_in.join(", ")}</div>
              )}
            </div>
          ))}
          {matches.length === 0 && query.trim().length > 1 && (
            <div onMouseDown={handleCreateNew}
              style={{ padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8f8f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
              <div style={{ width:"24px", height:"24px", borderRadius:"50%", background:LIME, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:800, color:DARK, flexShrink:0 }}>+</div>
              <div>
                <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>Create "{query.trim()}"</div>
                <div style={{ fontSize:"11px", color:"#aaa" }}>New customer, added automatically</div>
              </div>
            </div>
          )}
          {matches.length === 0 && query.trim().length <= 1 && (
            <div style={{ padding:"12px 14px", fontSize:"13px", color:"#aaa" }}>Keep typing to search…</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── BOOKING FORM ───────────────────────────────────────────
function BookingForm({ initial, onSave, onCancel, saving, customers, products }) {
  const today = todayStr();
  const [form, setForm] = useState({
    customer_id:   initial?.customer_id   || null,
    customer_name: initial?.customer_name || "",
    services:      initial?.services      || (initial?.service ? [initial.service] : []),
    booking_date:  initial?.booking_date  || today,
    booking_time:  initial?.booking_time  || "09:00",
    price:         initial?.price         || "",
    deposit:       initial?.deposit       || "",
    notes:         initial?.notes         || "",
    isNewCustomer: false,
  });
  const [interestedIn, setInterestedIn] = useState(initial?.interested_in || []);

  function upd(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function handleCustomerSelect(sel) {
    setForm((p) => ({ ...p, customer_id: sel.customer_id, customer_name: sel.customer_name, isNewCustomer: sel.isNew || false }));
    // Auto-select services from customer's interests
    if (sel.interested_in?.length > 0) {
      setInterestedIn(sel.interested_in);
      // Auto-fill first interested service and its price
      const firstMatch = products.find((p) => sel.interested_in.includes(p.name));
      if (firstMatch) {
        const autoServices = sel.interested_in.filter((name) => products.find((p) => p.name === name));
      const autoPrice = autoServices.reduce((sum, name) => { const p = products.find((pr) => pr.name === name); return sum + (p?.price || 0); }, 0);
      setForm((prev) => ({ ...prev, customer_id: sel.customer_id, customer_name: sel.customer_name, isNewCustomer: sel.isNew || false, services: autoServices, price: autoPrice || prev.price }));
      }
    } else {
      setInterestedIn([]);
      setForm((prev) => ({ ...prev, customer_id: sel.customer_id, customer_name: sel.customer_name, isNewCustomer: sel.isNew || false }));
    }
  }

  function handleServiceSelect(p) {
    setForm((prev) => {
      const already = prev.services.includes(p.name);
      const services = already ? prev.services.filter((s) => s !== p.name) : [...prev.services, p.name];
      // Recalculate total price from selected products
      const total = services.reduce((sum, name) => {
        const prod = products.find((pr) => pr.name === name);
        return sum + (prod?.price || 0);
      }, 0);
      return { ...prev, services, price: total || prev.price };
    });
  }

  // Products to show: interested_in first, then all active products
  const suggestedProducts = interestedIn.length > 0
    ? products.filter((p) => interestedIn.includes(p.name))
    : products;
  const otherProducts = interestedIn.length > 0
    ? products.filter((p) => !interestedIn.includes(p.name))
    : [];

  const valid = form.customer_name.trim() && form.booking_date;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

      {/* Customer */}
      <div>
        <label style={labelStyle}>Customer *</label>
        <CustomerSearchInput customers={customers} value={form} onSelect={handleCustomerSelect} />
      </div>

      {/* Service — smart suggestions */}
      <div>
        <label style={labelStyle}>Service</label>
        {suggestedProducts.length > 0 && (
          <div style={{ marginBottom:"8px" }}>
            {interestedIn.length > 0 && (
              <div style={{ fontSize:"11px", color:"#5a9a00", fontWeight:600, marginBottom:"6px" }}>
                Based on what they want
              </div>
            )}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {suggestedProducts.map((p) => {
                const selected = (form.services || []).includes(p.name);
                return (
                  <button key={p.id} onClick={() => handleServiceSelect(p)}
                    style={{ padding:"8px 14px", borderRadius:"12px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${selected ? LIME : "#e0e0e0"}`, background:selected ? "#f7ffe0" : "#fff", color:selected ? "#3a6b00" : "#555" }}>
                    {p.name} {p.price ? `· R${p.price}` : ""}
                    {selected && " ✓"}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {otherProducts.length > 0 && (
          <details style={{ marginTop:"4px" }}>
            <summary style={{ fontSize:"12px", color:"#aaa", cursor:"pointer", marginBottom:"6px" }}>Other services</summary>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"6px" }}>
              {otherProducts.map((p) => {
                const selected = (form.services || []).includes(p.name);
                return (
                  <button key={p.id} onClick={() => handleServiceSelect(p)}
                    style={{ padding:"8px 14px", borderRadius:"12px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${selected ? LIME : "#e0e0e0"}`, background:selected ? "#f7ffe0" : "#fff", color:selected ? "#3a6b00" : "#555" }}>
                    {p.name} {p.price ? `· R${p.price}` : ""}
                  </button>
                );
              })}
            </div>
          </details>
        )}
        {(form.services||[]).length > 0 && (
          <div style={{ fontSize:"11px", color:"#5a9a00", marginTop:"6px", fontWeight:600 }}>
            {(form.services||[]).length} service{(form.services||[]).length !== 1 ? "s" : ""} selected · R{form.price || 0} total
          </div>
        )}
        {products.length === 0 && (
          <input style={inputStyle} placeholder="e.g. Gel overlay, Soak off" value={(form.services||[]).join(', ')}
            onChange={(e) => upd("services", e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
        )}
      </div>

      {/* Date & Time */}
      <div style={{ display:"flex", gap:"10px" }}>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Date *</label>
          <input style={inputStyle} type="date" value={form.booking_date} min={today}
            onChange={(e) => upd("booking_date", e.target.value)} />
        </div>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Time</label>
          <select style={{ ...inputStyle, cursor:"pointer" }} value={form.booking_time}
            onChange={(e) => upd("booking_time", e.target.value)}>
            <option value="">Flexible</option>
            {BOOKING_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Price & Deposit */}
      <div style={{ display:"flex", gap:"10px" }}>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Price (R)</label>
          <input style={inputStyle} type="number" placeholder="0" value={form.price}
            onChange={(e) => upd("price", e.target.value)} />
        </div>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Deposit (R)</label>
          <input style={inputStyle} type="number" placeholder="0" value={form.deposit}
            onChange={(e) => upd("deposit", e.target.value)} />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label style={labelStyle}>Notes</label>
        <input style={inputStyle} placeholder="Any extra details…" value={form.notes}
          onChange={(e) => upd("notes", e.target.value)} />
      </div>

      <div style={{ display:"flex", gap:"8px" }}>
        <button onClick={() => onSave(form)} disabled={!valid || saving}
          style={{ flex:1, backgroundColor:valid ? LIME : "#e0e0e0", color:valid ? DARK : "#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:valid ? "pointer" : "not-allowed" }}>
          {saving ? "Saving…" : "Save booking"}
        </button>
        <button onClick={onCancel}
          style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── BOOKING CARD ───────────────────────────────────────────
function BookingCard({ booking, onStatusChange, onEdit, onDelete, onWhatsApp }) {
  const s = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
  const dl = dateLabel(booking.booking_date);

  return (
    <div style={{ background:"#fff", border:`1.5px solid ${s.border}`, borderRadius:"16px", padding:"16px 20px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
        {/* Time column */}
        <div style={{ textAlign:"center", minWidth:"48px", flexShrink:0 }}>
          <div style={{ fontSize:"13px", fontWeight:800, color:DARK }}>{booking.booking_time || "—"}</div>
          <div style={{ fontSize:"10px", color:"#aaa", marginTop:"2px", fontWeight:600 }}>{dl}</div>
        </div>

        {/* Details */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"15px", fontWeight:800, color:DARK }}>{booking.customer_name}</span>
            <span style={{ fontSize:"10px", fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.border}`, borderRadius:"6px", padding:"1px 7px" }}>{s.label}</span>
          </div>
          {booking.service && <div style={{ fontSize:"13px", color:"#555", marginBottom:"4px" }}>{booking.service}</div>}
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
            {booking.price > 0 && <span style={{ fontSize:"12px", color:"#888" }}>R{booking.price}</span>}
            {booking.deposit > 0 && <span style={{ fontSize:"12px", color:"#5a9a00" }}>Deposit: R{booking.deposit}</span>}
            {booking.notes && <span style={{ fontSize:"12px", color:"#aaa" }}>{booking.notes}</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:"6px", marginTop:"14px", flexWrap:"wrap", borderTop:"1px solid #f5f5f5", paddingTop:"12px" }}>
        {booking.status === "confirmed" && (
          <button onClick={() => onStatusChange(booking, "done")}
            style={{ padding:"7px 14px", borderRadius:"10px", border:"1.5px solid #a3e635", background:"#f0ffe0", color:"#3a6b00", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
            Mark done
          </button>
        )}
        {booking.status !== "cancelled" && (
          <button onClick={() => onWhatsApp(booking)}
            style={{ padding:"7px 14px", borderRadius:"10px", border:"none", background:"#25d366", color:"#fff", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
            Reminder
          </button>
        )}
        <button onClick={() => onEdit(booking)}
          style={{ padding:"7px 14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
          Edit
        </button>
        {booking.status === "confirmed" && (
          <button onClick={() => onStatusChange(booking, "cancelled")}
            style={{ padding:"7px 14px", borderRadius:"10px", border:"1.5px solid #ffd0d0", background:"#fff5f5", color:"#cc3300", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
            Cancel
          </button>
        )}
        {booking.status !== "confirmed" && (
          <button onClick={() => onDelete(booking)}
            style={{ padding:"7px 14px", borderRadius:"10px", border:"1.5px solid #ffd0d0", background:"#fff5f5", color:"#cc3300", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ── WHATSAPP REMINDER MODAL ────────────────────────────────
function BookingReminderModal({ booking, business, onClose }) {
  const time = booking.booking_time ? ` at ${booking.booking_time}` : "";
  const date = dateLabel(booking.booking_date);
  const defaultMsg = `Hi ${booking.customer_name}! Just a reminder about your ${booking.service || "appointment"} on ${date}${time}. Looking forward to seeing you! — ${business?.name || ""}`;
  const [message, setMessage] = useState(defaultMsg);

  const waNumber = booking.customer_whatsapp || "";
  const waUrl = waNumber
    ? `https://wa.me/${waNumber.replace(/\D/g,"")}?text=${encodeURIComponent(message)}`
    : null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"32px", width:"100%", maxWidth:"420px", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize:"18px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Send reminder</h3>
        <p style={{ fontSize:"13px", color:"#aaa", marginBottom:"20px" }}>To {booking.customer_name}</p>
        <textarea style={{ ...inputStyle, minHeight:"120px", resize:"vertical", marginBottom:"16px" }}
          value={message} onChange={(e) => setMessage(e.target.value)} />
        {!waNumber && (
          <div style={{ fontSize:"12px", color:"#f59e0b", background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:"8px", padding:"8px 12px", marginBottom:"12px" }}>
            No WhatsApp number saved for this customer. Edit the booking to add one.
          </div>
        )}
        <div style={{ display:"flex", gap:"8px" }}>
          {waUrl ? (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ flex:1, display:"block", backgroundColor:"#25d366", color:"#fff", textAlign:"center", padding:"13px", fontSize:"14px", fontWeight:800, borderRadius:"12px", textDecoration:"none" }}>
              Open WhatsApp →
            </a>
          ) : (
            <button disabled style={{ flex:1, backgroundColor:"#e0e0e0", color:"#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:"not-allowed" }}>
              No number saved
            </button>
          )}
          <button onClick={onClose}
            style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


// ── MINI CALENDAR ──────────────────────────────────────────
function MiniCalendar({ bookings, selectedDate, onSelectDate, onNewBooking }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const today = new Date().toISOString().slice(0, 10);
  const { year, month } = cursor;

  const firstDay  = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  // Build a set of dates that have bookings this month
  const bookedDates = new Set(
    bookings
      .filter((b) => b.status !== "cancelled")
      .map((b) => b.booking_date)
  );

  // Count bookings per date for dot indicator
  function countForDate(dateStr) {
    return bookings.filter((b) => b.booking_date === dateStr && b.status !== "cancelled").length;
  }

  function dateStr(day) {
    return `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  function prevMonth() {
    setCursor(({ year, month }) => month === 0
      ? { year: year - 1, month: 11 }
      : { year, month: month - 1 });
  }
  function nextMonth() {
    setCursor(({ year, month }) => month === 11
      ? { year: year + 1, month: 0 }
      : { year, month: month + 1 });
  }

  // Build grid cells: nulls for padding + day numbers
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px", marginBottom:"20px" }}>
      {/* Month nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
        <button onClick={prevMonth}
          style={{ width:"32px", height:"32px", borderRadius:"50%", border:"1.5px solid #e0e0e0", background:"#fff", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"#555" }}>
          ‹
        </button>
        <div style={{ fontSize:"16px", fontWeight:800, color:DARK }}>
          {MONTH_NAMES[month]} {year}
        </div>
        <button onClick={nextMonth}
          style={{ width:"32px", height:"32px", borderRadius:"50%", border:"1.5px solid #e0e0e0", background:"#fff", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"#555" }}>
          ›
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", marginBottom:"8px" }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ textAlign:"center", fontSize:"11px", fontWeight:700, color:"#bbb", padding:"4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:"2px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const ds      = dateStr(day);
          const isToday = ds === today;
          const isSel   = ds === selectedDate;
          const count   = countForDate(ds);
          const isPast  = ds < today;

          return (
            <div key={ds} onClick={() => onSelectDate(ds)}
              style={{
                borderRadius:"10px",
                padding:"6px 2px",
                textAlign:"center",
                cursor:"pointer",
                background: isSel ? DARK : isToday ? LIME : "transparent",
                transition:"background 0.1s",
              }}
              onMouseEnter={(e) => { if (!isSel && !isToday) e.currentTarget.style.background = "#f5f5f3"; }}
              onMouseLeave={(e) => { if (!isSel && !isToday) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                fontSize:"14px",
                fontWeight: isToday || isSel ? 800 : 500,
                color: isSel ? LIME : isToday ? DARK : isPast ? "#ccc" : DARK,
                lineHeight:1,
                marginBottom:"4px",
              }}>
                {day}
              </div>
              {/* Booking dots */}
              <div style={{ display:"flex", justifyContent:"center", gap:"2px", minHeight:"6px" }}>
                {count > 0 && Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                  <div key={di} style={{
                    width:"4px", height:"4px", borderRadius:"50%",
                    background: isSel ? LIME : isToday ? DARK : "#a3e635",
                  }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick add button */}
      <div style={{ borderTop:"1px solid #f5f5f5", marginTop:"16px", paddingTop:"14px", display:"flex", justifyContent:"flex-end" }}>
        <button onClick={() => onNewBooking(selectedDate || today)}
          style={{ padding:"8px 18px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
          + New booking
        </button>
      </div>
    </div>
  );
}

// ── MAIN BOOKINGS TAB ──────────────────────────────────────
function BookingsTab({ business }) {
  const [bookings, setBookings]     = useState([]);
  const [customers, setCustomers]   = useState([]);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [mode, setMode]             = useState("list"); // list | add | edit
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [reminderFor, setReminderFor]   = useState(null);
  const [toast, setToast]           = useState("");
  const [newBookingDate, setNewBookingDate] = useState(null);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2800); }

  const today = new Date().toISOString().slice(0, 10);

  // ── LOAD ───────────────────────────────────────────────────
  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    Promise.all([
      supabase.from("bookings").select("*").eq("business_id", business.id).order("booking_date").order("booking_time"),
      supabase.from("customers").select("id,name,whatsapp,interested_in").eq("business_id", business.id),
      supabase.from("products").select("id,name,price,image").eq("business_id", business.id).eq("is_active", true),
    ]).then(([{ data: b }, { data: c }, { data: p }]) => {
      if (b) setBookings(b);
      if (c) setCustomers(c);
      if (p) setProducts(p);
      setLoading(false);
    });
  }, [business?.id]);

  // ── SELECTED DAY BOOKINGS ──────────────────────────────────
  const dayBookings = bookings
    .filter((b) => b.booking_date === selectedDate)
    .sort((a, b) => (a.booking_time || "").localeCompare(b.booking_time || ""));

  const upcomingBookings = bookings
    .filter((b) => b.booking_date > today && b.status === "confirmed")
    .slice(0, 5);

  // ── SAVE ───────────────────────────────────────────────────
  async function handleSave(form) {
    if (!business?.id) return;

    // Block past dates
    if (form.booking_date < today) {
      alert("Cannot book a date in the past.");
      return;
    }

    setSaving(true);
    let customerId = form.customer_id;

    if (form.isNewCustomer && form.customer_name.trim()) {
      const { data: newCust } = await supabase.from("customers")
        .insert([{ business_id: business.id, name: form.customer_name.trim(), status: "new", interested_in: [] }])
        .select().single();
      if (newCust) { setCustomers((prev) => [newCust, ...prev]); customerId = newCust.id; showToast(`New customer "${newCust.name}" created ✓`); }
    }

    const cust = customers.find((c) => c.id === customerId);
    const payload = {
      business_id:       business.id,
      customer_id:       customerId,
      customer_name:     form.customer_name.trim(),
      customer_whatsapp: cust?.whatsapp || "",
      service:           (form.services || []).join(", "),
      booking_date:      form.booking_date,
      booking_time:      form.booking_time || null,
      price:             form.price ? parseFloat(form.price) : null,
      deposit:           form.deposit ? parseFloat(form.deposit) : null,
      notes:             form.notes?.trim() || "",
      status:            "confirmed",
    };

    if (editTarget) {
      const { data } = await supabase.from("bookings").update(payload).eq("id", editTarget.id).select().single();
      if (data) setBookings((prev) => prev.map((b) => b.id === data.id ? data : b));
      showToast("Booking updated ✓");
    } else {
      const { data } = await supabase.from("bookings").insert([payload]).select().single();
      if (data) { setBookings((prev) => [...prev, data]); setSelectedDate(data.booking_date); }
      showToast("Booking saved ✓");
    }

    setSaving(false);
    setMode("list");
    setEditTarget(null);
    setNewBookingDate(null);
  }

  // ── STATUS ─────────────────────────────────────────────────
  async function handleStatusChange(booking, newStatus) {
    const { data } = await supabase.from("bookings").update({ status: newStatus }).eq("id", booking.id).select().single();
    if (data) setBookings((prev) => prev.map((b) => b.id === data.id ? data : b));
    if (newStatus === "done")      showToast(`${booking.customer_name} marked done ✓`);
    if (newStatus === "cancelled") showToast("Booking cancelled");
  }

  // ── DELETE ─────────────────────────────────────────────────
  async function handleDelete(booking) {
    if (!window.confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", booking.id);
    setBookings((prev) => prev.filter((b) => b.id !== booking.id));
    showToast("Booking deleted");
  }

  // ── STATS ──────────────────────────────────────────────────
  const todayCount    = bookings.filter((b) => b.booking_date === today && b.status === "confirmed").length;
  const upcomingCount = bookings.filter((b) => b.booking_date > today  && b.status === "confirmed").length;
  const doneCount     = bookings.filter((b) => b.status === "done").length;
  const revenue       = bookings.filter((b) => b.status === "done" && b.price).reduce((s, b) => s + (b.price || 0), 0);

  if (!business?.id) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:"40px", marginBottom:"16px" }}>🏪</div>
      <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>Set up your business first</h3>
    </div>
  );

  // ── ADD / EDIT FORM ────────────────────────────────────────
  if (mode === "add" || mode === "edit") return (
    <div style={{ maxWidth:"560px" }}>
      <button onClick={() => { setMode("list"); setEditTarget(null); setNewBookingDate(null); }}
        style={{ background:"transparent", border:"none", fontSize:"13px", color:"#aaa", cursor:"pointer", padding:"0 0 16px" }}>
        ← Back
      </button>
      <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"24px" }}>
        {mode === "edit" ? "Edit booking" : "New booking"}
      </h2>
      <BookingForm
        initial={editTarget || (newBookingDate ? { booking_date: newBookingDate, services: [], booking_time: "09:00" } : { services: [], booking_time: "09:00" })}
        onSave={handleSave}
        onCancel={() => { setMode("list"); setEditTarget(null); setNewBookingDate(null); }}
        saving={saving}
        customers={customers}
        products={products}
      />
    </div>
  );

  // ── MAIN LIST VIEW ─────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Bookings</h2>
          <p style={{ fontSize:"13px", color:"#aaa" }}>{todayCount} today · {upcomingCount} upcoming</p>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Today",    value: todayCount },
          { label:"Upcoming", value: upcomingCount },
          { label:"Done",     value: doneCount },
          { label:"Revenue",  value: `R${revenue.toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"14px 16px" }}>
            <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{s.label}</div>
            <div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading && <div style={{ textAlign:"center", padding:"60px", color:"#aaa" }}>Loading…</div>}

      {!loading && (
        <>
          {/* Calendar */}
          <MiniCalendar
            bookings={bookings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onNewBooking={(date) => { setNewBookingDate(date); setMode("add"); }}
          />

          {/* Selected day bookings */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
              <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>
                {selectedDate === today ? "Today" : dateLabel(selectedDate)}
                {dayBookings.length > 0 && <span style={{ fontSize:"12px", color:"#aaa", fontWeight:500, marginLeft:"8px" }}>{dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}</span>}
              </div>
              <button onClick={() => { setNewBookingDate(selectedDate); setMode("add"); }}
                style={{ padding:"7px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                + Add
              </button>
            </div>

            {dayBookings.length === 0 ? (
              <div style={{ background:"#fff", border:"1.5px dashed #e0e0dc", borderRadius:"16px", padding:"32px", textAlign:"center" }}>
                <div style={{ fontSize:"13px", color:"#bbb", marginBottom:"12px" }}>
                  {selectedDate < today ? "No bookings on this day" : "Nothing booked yet for this day"}
                </div>
                {selectedDate >= today && (
                  <button onClick={() => { setNewBookingDate(selectedDate); setMode("add"); }}
                    style={{ padding:"9px 20px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
                    + New booking
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {dayBookings.map((b) => (
                  <BookingCard key={b.id} booking={b}
                    onStatusChange={handleStatusChange}
                    onEdit={(bk) => { setEditTarget({ ...bk, services: bk.service ? bk.service.split(", ") : [] }); setMode("edit"); }}
                    onDelete={handleDelete}
                    onWhatsApp={setReminderFor}
                  />
                ))}
              </div>
            )}

            {/* Upcoming peek — only show when viewing today */}
            {selectedDate === today && upcomingBookings.length > 0 && (
              <div style={{ marginTop:"28px" }}>
                <div style={{ fontSize:"12px", fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Coming up</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {upcomingBookings.map((b) => (
                    <div key={b.id} onClick={() => setSelectedDate(b.booking_date)}
                      style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"12px", padding:"10px 16px", display:"flex", alignItems:"center", gap:"12px", cursor:"pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f8f8f6"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                      <div style={{ textAlign:"center", minWidth:"40px" }}>
                        <div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>{new Date(b.booking_date + "T00:00:00").getDate()}</div>
                        <div style={{ fontSize:"10px", color:"#aaa", fontWeight:600 }}>{new Date(b.booking_date + "T00:00:00").toLocaleDateString("en-ZA",{month:"short"})}</div>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px", fontWeight:700, color:DARK }}>{b.customer_name}</div>
                        {b.service && <div style={{ fontSize:"12px", color:"#aaa" }}>{b.service}</div>}
                      </div>
                      {b.booking_time && <div style={{ fontSize:"12px", fontWeight:700, color:"#888" }}>{b.booking_time}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {reminderFor && (
        <BookingReminderModal booking={reminderFor} business={business} onClose={() => setReminderFor(null)} />
      )}

      {toast && (
        <div style={{ position:"fixed", bottom:"28px", left:"50%", transform:"translateX(-50%)", background:DARK, color:LIME, padding:"12px 24px", borderRadius:"999px", fontSize:"13px", fontWeight:700, zIndex:2000, boxShadow:"0 8px 32px rgba(0,0,0,0.25)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── PLACEHOLDER ────────────────────────────────────────────
function ComingSoon({ tab }) {
  return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:"40px", marginBottom:"16px" }}>🚧</div>
      <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>{tab} — Coming soon</h3>
      <p style={{ fontSize:"14px", color:"#aaa" }}>This section is being built. Check back soon.</p>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────
export default function AppDashboard({ onBack }) {
  const [user, setUser]               = useState(null);
  const [tab, setTab]                 = useState("Dashboard");
  const [business, setBusiness]       = useState(null);
  const [prefilledTemplate, setPrefilledTemplate] = useState(null);
  const [products, setProducts]       = useState([]);
  const [logoUrl, setLogoUrl]         = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data:listener } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user||null); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("businesses").select("*").eq("user_id",user.id).single().then(({ data }) => {
      if (data) {
        setBusiness(data);
        setLogoUrl(data.catalogue||null);
        supabase.from("products").select("*").eq("business_id",data.id).then(({ data:prods }) => {
          if (prods) setProducts(prods.map((p) => ({...p, icon: p.image && !p.image.startsWith("http") ? p.image : "🛍️"})));
        });
      }
    });
  }, [user]);

  if (!user) return <AuthScreen />;

  function renderTab() {
    switch(tab) {
      case "Dashboard": return <DashboardHome user={user} business={business} setTab={setTab} />;
      case "Templates": return <TemplatesTab business={business} setTab={setTab} setPrefilledTemplate={setPrefilledTemplate} />;
      case "Setup":     return <SetupTab user={user} business={business} setBusiness={setBusiness} prefilledTemplate={prefilledTemplate} setPrefilledTemplate={setPrefilledTemplate} setTab={setTab} setGlobalProducts={setProducts} setGlobalLogoUrl={setLogoUrl} />;
      case "Page":      return <PageTab business={business} products={products} logoUrl={logoUrl} />;
      case "Customers": return <CustomersTab business={business} />;
      case "Bookings":  return <BookingsTab business={business} />;
      default:          return <ComingSoon tab={tab} />;
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f3", fontFamily:"'Inter', -apple-system, sans-serif" }}>
      <div style={{ background:"#fff", borderBottom:"1px solid #eeeeea", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"36px", height:"36px", background:DARK, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:900, color:LIME }}>VT</div>
          <span style={{ fontSize:"15px", fontWeight:800, color:DARK }}>VulaTrade</span>
          {business?.name && <span style={{ fontSize:"13px", color:"#bbb", marginLeft:"4px" }}>· {business.name}</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"13px", color:"#aaa" }}>{user.email}</span>
          <button onClick={async () => { await supabase.auth.signOut(); onBack(); }} style={{ fontSize:"12px", color:"#888", background:"transparent", border:"1px solid #e0e0e0", borderRadius:"8px", padding:"6px 12px", cursor:"pointer" }}>Sign out</button>
          <button onClick={onBack} style={{ fontSize:"12px", color:"#888", background:"transparent", border:"1px solid #e0e0e0", borderRadius:"8px", padding:"6px 12px", cursor:"pointer" }}>← Landing page</button>
        </div>
      </div>
      <div style={{ display:"flex", minHeight:"calc(100vh - 65px)" }}>
        <div style={{ width:"200px", background:"#fff", borderRight:"1px solid #eeeeea", padding:"20px 12px", flexShrink:0 }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ width:"100%", textAlign:"left", padding:"11px 14px", borderRadius:"10px", fontSize:"14px", fontWeight:tab===t?700:500, background:tab===t?DARK:"transparent", color:tab===t?LIME:"#555", border:"none", cursor:"pointer", marginBottom:"2px", display:"block" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ flex:1, padding:"36px 40px", overflowY:"auto" }}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}

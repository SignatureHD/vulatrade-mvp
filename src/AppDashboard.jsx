import { supabase } from "./lib/supabase";
import React, { useEffect, useState, useRef } from "react";
import "./styles.css";

const TABS = ["Dashboard", "Templates", "Setup", "Page", "Customers", "Messages", "Growth", "Money", "Vuke", "Plans"];
const LIME = "#a3e635";
const DARK = "#0d0d0d";

const CATEGORIES = [
  "Nail Tech", "Hair & Extensions", "Barber", "Food Seller",
  "Fresh Produce", "Cleaning", "Tutoring", "Delivery",
  "Photography", "Catering", "Phone Repairs", "Other",
];

const PAYMENT_METHODS = ["Cash", "EFT / Bank Transfer", "SnapScan", "Zapper", "Yoco", "PayFast", "Other"];

const BG_COLOURS = [
  { name: "Dark", value: "#0d0d0d", text: "#fff", accent: "#a3e635" },
  { name: "Forest", value: "#14200a", text: "#fff", accent: "#a3e635" },
  { name: "Coral", value: "#7a2020", text: "#fff", accent: "#f9a8a8" },
  { name: "Navy", value: "#0a1628", text: "#fff", accent: "#7eb8f7" },
  { name: "Purple", value: "#2a1040", text: "#fff", accent: "#c4a0f7" },
  { name: "Cream", value: "#fdfcf7", text: "#0d0d0d", accent: "#5a9a00" },
  { name: "Warm", value: "#1a0f0a", text: "#fff", accent: "#f0a050" },
  { name: "Slate", value: "#1a1f2e", text: "#fff", accent: "#90c0f0" },
];

const ICON_TEMPLATES = {
  "Nail Tech": ["💅", "✨", "💜", "🌸", "🦋"],
  "Hair & Extensions": ["💇", "👑", "🌟", "💫", "🎀"],
  "Barber": ["✂️", "💈", "🪒", "⚡", "🔥"],
  "Food Seller": ["🍱", "🍳", "🥘", "🔥", "⭐"],
  "Fresh Produce": ["🥬", "🌿", "🍅", "🌱", "💚"],
  "Cleaning": ["🧹", "✨", "🫧", "💎", "🌟"],
  "Tutoring": ["📚", "🎓", "⭐", "💡", "🧠"],
  "Delivery": ["🛵", "⚡", "🚀", "📦", "💨"],
  "Photography": ["📸", "🎨", "✨", "🌟", "🎭"],
  "Catering": ["🍽️", "👨‍🍳", "⭐", "🥂", "🎉"],
  "Phone Repairs": ["📱", "⚡", "🔧", "💻", "🛠️"],
  "Other": ["⭐", "💫", "✨", "🌟", "💎"],
};

const TEMPLATES = [
  { id: "nail", name: "Nail Salon", category: "Nail Tech", icon: "💅", description: "Home or mobile nail tech offering gel, acrylic, and nail art services.", starter: "I'm a professional nail technician offering gel overlays, acrylic sets, nail art and soak-offs. I work from home and offer mobile appointments. Book via WhatsApp.", products: [{ name: "Gel overlay", price: 220, description: "Full gel overlay on natural nails" }, { name: "Acrylic set", price: 350, description: "Full acrylic nail set" }, { name: "Soak off", price: 80, description: "Gel or acrylic soak off removal" }, { name: "Nail art", price: 50, description: "Custom nail art per nail" }] },
  { id: "hair", name: "Hair & Extensions", category: "Hair & Extensions", icon: "💇", description: "Hair styling, braiding, weaves and extension services.", starter: "I offer professional hair styling including braids, weaves, relaxers and extensions. Available for home visits and salon appointments. Book via WhatsApp.", products: [{ name: "Box braids", price: 350, description: "Full box braids install" }, { name: "Weave install", price: 450, description: "Weave sew-in with closure" }, { name: "Relaxer", price: 200, description: "Relaxer treatment and blow dry" }, { name: "Hair extensions", price: 500, description: "Hair extension install" }] },
  { id: "barber", name: "Barber", category: "Barber", icon: "✂️", description: "Men's cuts, fades, lineups and beard grooming.", starter: "Professional barber offering fades, lineups, beard trims and full grooms. Home visits available. Book your slot via WhatsApp.", products: [{ name: "Haircut", price: 80, description: "Standard haircut and style" }, { name: "Fade", price: 100, description: "Skin or low fade" }, { name: "Beard trim", price: 50, description: "Beard shape and trim" }, { name: "Full groom", price: 140, description: "Haircut plus beard trim" }] },
  { id: "food", name: "Food Seller", category: "Food Seller", icon: "🍱", description: "Home-cooked meals, lunches and daily specials.", starter: "I cook and sell freshly prepared home meals daily. Available for collection or local delivery. Order via WhatsApp before 10am.", products: [{ name: "Lunch special", price: 45, description: "Daily cooked lunch special" }, { name: "Full meal", price: 65, description: "Full plate with sides" }, { name: "Family pot", price: 180, description: "Large family-size portion" }, { name: "Snacks", price: 15, description: "Vetkoek, pies and light snacks" }] },
  { id: "produce", name: "Fresh Produce", category: "Fresh Produce", icon: "🥬", description: "Fresh fruit and vegetables sold from home or delivered locally.", starter: "I sell fresh, affordable fruit and vegetables. Order weekly specials and get delivery to your door. WhatsApp me your order.", products: [{ name: "Veggie bag", price: 60, description: "Seasonal mixed vegetables" }, { name: "Fruit bag", price: 70, description: "Seasonal mixed fruit" }, { name: "Mixed box", price: 120, description: "Fruit and veg combo box" }, { name: "Single item", price: 5, description: "Individual fruit or veg item" }] },
  { id: "cleaning", name: "Cleaning Service", category: "Cleaning", icon: "🧹", description: "Home, office and post-construction cleaning.", starter: "Professional cleaning service for homes and offices. Reliable, thorough and affordable. Book your clean via WhatsApp.", products: [{ name: "1-bedroom flat", price: 250, description: "Full clean of 1-bedroom flat" }, { name: "3-bedroom house", price: 450, description: "Full clean of 3-bedroom house" }, { name: "Office clean", price: 350, description: "Office or business premises clean" }, { name: "Post-construction", price: 600, description: "Post-construction deep clean" }] },
  { id: "tutor", name: "Tutor", category: "Tutoring", icon: "📚", description: "Academic tutoring for school and university students.", starter: "I offer private tutoring for Grade 8–12 and university students. Maths, Science, English and more. Book your session via WhatsApp.", products: [{ name: "1hr session", price: 150, description: "One-on-one tutoring session" }, { name: "Group session", price: 80, description: "Group tutoring per person" }, { name: "Exam prep package", price: 500, description: "5-session exam preparation package" }, { name: "Online session", price: 120, description: "Online video tutoring session" }] },
  { id: "delivery", name: "Local Delivery", category: "Delivery", icon: "🛵", description: "Fast local delivery for businesses and individuals.", starter: "I offer reliable same-day local delivery. Food, parcels, documents and more. WhatsApp me your pickup and drop-off.", products: [{ name: "Local drop", price: 40, description: "Single local delivery drop" }, { name: "Extended zone", price: 70, description: "Delivery to extended area" }, { name: "Bulk delivery", price: 150, description: "Multiple drops in one run" }, { name: "Monthly package", price: 800, description: "Unlimited local deliveries per month" }] },
  { id: "photography", name: "Photography", category: "Photography", icon: "📸", description: "Portrait, event and product photography.", starter: "Professional photographer available for portraits, events, maternity shoots and product photos. Book your session via WhatsApp.", products: [{ name: "Portrait session", price: 500, description: "1hr portrait shoot with edited photos" }, { name: "Event coverage", price: 1500, description: "Full event photography coverage" }, { name: "Product shoot", price: 800, description: "Product photography for online selling" }, { name: "Maternity shoot", price: 700, description: "Maternity portrait session" }] },
  { id: "catering", name: "Catering", category: "Catering", icon: "🍽️", description: "Event catering for parties, funerals and celebrations.", starter: "I provide full catering services for events of all sizes — funerals, parties, corporate functions and celebrations. WhatsApp for a quote.", products: [{ name: "Basic package (per head)", price: 85, description: "Standard catering per person" }, { name: "Full package (per head)", price: 150, description: "Premium catering per person" }, { name: "Dessert table", price: 500, description: "Dessert table setup for events" }, { name: "Drinks package", price: 300, description: "Cold drinks and juice package" }] },
  { id: "phonerepairs", name: "Phone Repairs", category: "Phone Repairs", icon: "📱", description: "Screen replacements, battery swaps and phone fixes.", starter: "I fix phones fast and at fair prices. Screen repairs, battery replacements, charging ports and more. WhatsApp for a quote.", products: [{ name: "Screen repair", price: 350, description: "Screen replacement (price varies by model)" }, { name: "Battery swap", price: 200, description: "Battery replacement" }, { name: "Charging port", price: 150, description: "Charging port repair or replacement" }, { name: "Water damage", price: 250, description: "Water damage assessment and repair" }] },
];

const inputStyle = { border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "12px 14px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };
const labelStyle = { fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "6px", display: "block" };

// ── BUSINESS PAGE PREVIEW ──────────────────────────────────
function BusinessPagePreview({ form, products, logoUrl, isFullPage }) {
  const bg = BG_COLOURS.find((c) => c.value === form.bgColour) || BG_COLOURS[0];
  const whatsappUrl = form.whatsapp ? `https://wa.me/${form.whatsapp.replace(/\D/g, "")}?text=Hi! I found you on VulaTrade and would like to enquire.` : "#";
  const activeProducts = products.filter((p) => p.is_active);

  const card = (
    <div style={{ background: "#fff", borderRadius: isFullPage ? "0" : "32px", overflow: "hidden", width: isFullPage ? "100%" : "280px", maxWidth: isFullPage ? "480px" : "280px", boxShadow: isFullPage ? "none" : "0 24px 64px rgba(0,0,0,0.25)", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: bg.value, padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="logo" style={{ width: "56px", height: "56px", borderRadius: "16px", objectFit: "cover", border: `2px solid ${bg.accent}` }} />
          ) : (
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(255,255,255,0.1)", border: `2px solid ${bg.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>
              {form.icon || "⭐"}
            </div>
          )}
          <div>
            <div style={{ fontSize: "9px", color: bg.accent, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>AI Business Page</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: bg.text, lineHeight: 1.1 }}>{form.name || "Your Business Name"}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "3px" }}>{form.category || "Business type"}{form.area ? ` · ${form.area}` : ""}</div>
          </div>
        </div>
        {form.description && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: "14px" }}>{form.description}</div>}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: bg.accent, color: bg.value === "#fdfcf7" ? "#0d0d0d" : "#0d0d0d", fontSize: "9px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: bg.value === "#fdfcf7" ? "#0d0d0d" : "#0d0d0d" }} /> Live
        </div>
      </div>

      {/* WhatsApp button */}
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: bg.accent, color: "#0d0d0d", textAlign: "center", padding: "14px", fontSize: "14px", fontWeight: 800, textDecoration: "none", margin: "14px 14px 4px" }}>
        💬 Enquire on WhatsApp
      </a>

      {/* Products */}
      {activeProducts.length > 0 && (
        <div style={{ padding: "8px 0 16px" }}>
          {activeProducts.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ width: "36px", height: "36px", background: "#f5f5f5", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                {form.icon || "⭐"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0d0d0d" }}>{p.name}</div>
                {p.description && <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>{p.description}</div>}
              </div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#0d0d0d" }}>R{p.price}</div>
            </div>
          ))}
        </div>
      )}

      {activeProducts.length === 0 && (
        <div style={{ padding: "24px 16px", textAlign: "center", fontSize: "13px", color: "#ccc" }}>
          Your products will appear here
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #f5f5f5", textAlign: "center" }}>
        <div style={{ fontSize: "10px", color: "#ccc" }}>Powered by <span style={{ color: "#5a9a00", fontWeight: 700 }}>VulaTrade</span></div>
      </div>
    </div>
  );

  if (isFullPage) return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", display: "flex", justifyContent: "center", padding: "0" }}>
      {card}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: "11px", color: "#aaa", fontWeight: 600, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live preview</div>
      <div style={{ background: "#1a1a1a", borderRadius: "36px", padding: "10px", border: "2px solid #2a2a2a", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: "#111", height: "20px", borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "50px", height: "12px", background: "#000", borderRadius: "6px" }} />
        </div>
        <div style={{ borderRadius: "0 0 26px 26px", overflow: "hidden" }}>{card}</div>
        <div style={{ height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "36px", height: "3px", background: "#333", borderRadius: "2px" }} />
        </div>
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
    <div style={{ minHeight: "100vh", background: "#f5f5f3", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px", background: "#fff", borderRadius: "24px", padding: "36px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{ width: "40px", height: "40px", background: DARK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 900, color: LIME }}>VT</div>
          <div><div style={{ fontSize: "16px", fontWeight: 900, color: DARK }}>VulaTrade</div><div style={{ fontSize: "11px", color: "#aaa" }}>Start local. Sell smarter. Grow stronger.</div></div>
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "6px" }}>{mode === "signin" ? "Sign in" : "Create account"}</h2>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>{mode === "signin" ? "Welcome back." : "Start building your business today."}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          {message && <div style={{ fontSize: "13px", color: message.includes("Check") ? "#5a9a00" : "#cc3300", background: message.includes("Check") ? "#f0ffe0" : "#fff0ee", padding: "10px 14px", borderRadius: "10px" }}>{message}</div>}
          <button onClick={mode === "signin" ? handleSignIn : handleSignUp} disabled={loading} style={{ backgroundColor: LIME, color: DARK, border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 800, cursor: "pointer", marginTop: "4px" }}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }} style={{ background: "transparent", border: "none", fontSize: "13px", color: "#888", cursor: "pointer", padding: "4px" }}>
            {mode === "signin" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD HOME ─────────────────────────────────────────
function DashboardHome({ user, business, setTab }) {
  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "6px" }}>Welcome back{business?.name ? `, ${business.name}` : ""} 👋</h2>
      <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>{user.email}</p>
      {!business?.name && (
        <div style={{ background: "#fffbe6", border: "1.5px solid #f0d000", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#7a5e00", marginBottom: "4px" }}>Get started — pick a business template</div>
          <div style={{ fontSize: "13px", color: "#9a7a00", marginBottom: "12px" }}>Choose a ready-made template to launch your business in minutes.</div>
          <button onClick={() => setTab("Templates")} style={{ backgroundColor: DARK, color: LIME, border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Browse templates →</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
        {[{ label: "Customers", value: "0", sub: "Total tracked" }, { label: "Messages", value: "0", sub: "Templates ready" }, { label: "Payments", value: "R0", sub: "This month" }, { label: "Follow-ups", value: "0", sub: "Due today" }].map((stat) => (
          <div key={stat.label} style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{stat.label}</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: DARK, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "#bbb", marginTop: "4px" }}>{stat.sub}</div>
          </div>
        ))}
      </div>
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
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "6px" }}>Business Templates</h2>
      <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>Pick your business type and launch in minutes.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
        {TEMPLATES.map((t) => (
          <div key={t.id} onClick={() => setSelected(selected === t.id ? null : t.id)}
            style={{ background: selected === t.id ? DARK : "#fff", border: `1.5px solid ${selected === t.id ? DARK : "#eeeeea"}`, borderRadius: "20px", padding: "24px", cursor: "pointer" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>{t.icon}</div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: selected === t.id ? "#fff" : DARK, marginBottom: "6px" }}>{t.name}</div>
            <div style={{ fontSize: "13px", color: selected === t.id ? "#aaa" : "#888", lineHeight: 1.6, marginBottom: "16px" }}>{t.description}</div>
            {selected === t.id && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: LIME, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Starter products</div>
                {t.products.map((p) => <div key={p.name} style={{ fontSize: "12px", color: "#ccc", marginBottom: "4px" }}>· {p.name} — R{p.price}</div>)}
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); handleUse(t); }}
              style={{ backgroundColor: selected === t.id ? LIME : DARK, color: selected === t.id ? DARK : LIME, border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
              Use this template →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRODUCTS SECTION ───────────────────────────────────────
function ProductsSection({ businessId, prefilledProducts, onProductsPrefilled, onProductsChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "" });

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    supabase.from("products").select("*").eq("business_id", businessId).order("created_at")
      .then(({ data }) => { if (data) { setProducts(data); onProductsChange && onProductsChange(data); } setLoading(false); });
  }, [businessId]);

  useEffect(() => {
    if (!prefilledProducts || !businessId || prefilledProducts.length === 0) return;
    async function applyTemplate() {
      await supabase.from("products").delete().eq("business_id", businessId);
      const rows = prefilledProducts.map((p) => ({ business_id: businessId, name: p.name, price: p.price, description: p.description, is_active: true }));
      const { data } = await supabase.from("products").insert(rows).select();
      if (data) { setProducts(data); onProductsChange && onProductsChange(data); }
      onProductsPrefilled();
    }
    applyTemplate();
  }, [prefilledProducts, businessId]);

  function updateProducts(newList) { setProducts(newList); onProductsChange && onProductsChange(newList); }

  async function handleAdd() {
    if (!newProduct.name.trim() || !newProduct.price) return;
    setSaving(true);
    const { data } = await supabase.from("products").insert([{ business_id: businessId, name: newProduct.name.trim(), price: parseFloat(newProduct.price), description: newProduct.description.trim(), is_active: true }]).select().single();
    if (data) { updateProducts([...products, data]); setNewProduct({ name: "", price: "", description: "" }); setAdding(false); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    updateProducts(products.filter((p) => p.id !== id));
  }

  async function handleToggleActive(product) {
    const { data } = await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id).select().single();
    if (data) updateProducts(products.map((p) => p.id === data.id ? data : p));
  }

  async function handleSaveEdit(id) {
    if (!editForm.name.trim() || !editForm.price) return;
    const { data } = await supabase.from("products").update({ name: editForm.name.trim(), price: parseFloat(editForm.price), description: editForm.description.trim() }).eq("id", id).select().single();
    if (data) { updateProducts(products.map((p) => p.id === data.id ? data : p)); setEditingId(null); }
  }

  if (!businessId) return (
    <div style={{ background: "#fffbe6", border: "1.5px solid #f0d000", borderRadius: "12px", padding: "16px", fontSize: "13px", color: "#7a5e00" }}>
      Save your business details first, then add your products and services.
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: DARK }}>Products & Services</div>
          <div style={{ fontSize: "13px", color: "#aaa", marginTop: "2px" }}>{products.length} item{products.length !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={() => setAdding(true)} style={{ backgroundColor: DARK, color: LIME, border: "none", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>+ Add product</button>
      </div>
      {adding && (
        <div style={{ background: "#f8f8f6", border: "1.5px solid #e0e0dc", borderRadius: "14px", padding: "18px", marginBottom: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: DARK, marginBottom: "14px" }}>New product or service</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input style={inputStyle} placeholder="Name e.g. Gel overlay" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            <input style={inputStyle} type="number" placeholder="Price e.g. 220" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
            <input style={inputStyle} placeholder="Description (optional)" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleAdd} disabled={saving} style={{ backgroundColor: LIME, color: DARK, border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer", flex: 1 }}>{saving ? "Saving..." : "Save product"}</button>
              <button onClick={() => { setAdding(false); setNewProduct({ name: "", price: "", description: "" }); }} style={{ background: "#fff", color: "#888", border: "1.5px solid #e0e0e0", borderRadius: "10px", padding: "10px 16px", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {loading ? <div style={{ fontSize: "13px", color: "#aaa", padding: "20px 0" }}>Loading...</div> :
        products.length === 0 ? (
          <div style={{ background: "#f8f8f6", border: "1.5px dashed #ddd", borderRadius: "14px", padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "10px" }}>🛍️</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#888" }}>No products yet</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {products.map((p) => (
              <div key={p.id} style={{ background: "#fff", border: `1.5px solid ${editingId === p.id ? LIME : "#e8e8e4"}`, borderRadius: "14px", padding: "14px 18px", opacity: p.is_active ? 1 : 0.55 }}>
                {editingId === p.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Product name" />
                    <input style={inputStyle} type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} placeholder="Price" />
                    <input style={inputStyle} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleSaveEdit(p.id)} style={{ backgroundColor: LIME, color: DARK, border: "none", borderRadius: "10px", padding: "9px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", flex: 1 }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ background: "#fff", color: "#888", border: "1.5px solid #e0e0e0", borderRadius: "10px", padding: "9px 14px", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: DARK }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{p.description}</div>}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: DARK, minWidth: "55px", textAlign: "right" }}>R{p.price}</div>
                    <button onClick={() => { setEditingId(p.id); setEditForm({ name: p.name, price: p.price, description: p.description || "" }); }} style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "8px", border: "1px solid #e0e0e0", background: "#f8f8f6", color: "#555", cursor: "pointer", fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleToggleActive(p)} style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "8px", border: "1px solid #e0e0e0", background: p.is_active ? "#f0ffe0" : "#f5f5f5", color: p.is_active ? "#3a6b00" : "#aaa", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>{p.is_active ? "Active" : "Hidden"}</button>
                    <button onClick={() => handleDelete(p.id)} style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "8px", border: "1px solid #ffd0d0", background: "#fff5f5", color: "#cc3300", cursor: "pointer", fontWeight: 600 }}>Delete</button>
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
function SetupTab({ user, business, setBusiness, prefilledTemplate, setPrefilledTemplate }) {
  const [form, setForm] = useState({
    name: business?.name || "", owner: business?.owner || "", category: business?.category || "",
    area: business?.area || "", description: business?.description || "", whatsapp: business?.whatsapp || "",
    payment: business?.payment || "", bgColour: business?.theme || "#0d0d0d", icon: "⭐",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [savedBusinessId, setSavedBusinessId] = useState(business?.id || null);
  const [prefilledProducts, setPrefilledProducts] = useState(null);
  const [products, setProducts] = useState([]);
  const [logoUrl, setLogoUrl] = useState(business?.catalogue || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (prefilledTemplate) {
      const icons = ICON_TEMPLATES[prefilledTemplate.category] || ["⭐"];
      setForm((prev) => ({ ...prev, category: prefilledTemplate.category, description: prefilledTemplate.starter, icon: icons[0] }));
      setPrefilledProducts(prefilledTemplate.products);
      setPrefilledTemplate(null);
      setSaved(false);
    }
  }, [prefilledTemplate]);

  useEffect(() => { if (business?.id) setSavedBusinessId(business.id); }, [business]);

  function update(field, value) { setForm((prev) => ({ ...prev, [field]: value })); setSaved(false); }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logos/${user.id}.${ext}`;
    const { error: upErr } = await supabase.storage.from("business-images").upload(path, file, { upsert: true });
    if (!upErr) {
      const { data } = supabase.storage.from("business-images").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Business name is required."); return; }
    setSaving(true); setError("");
    const slug = form.name.toLowerCase().trim().replaceAll(" ", "-").replace(/[^a-z0-9-]/g, "");
    const payload = { name: form.name.trim(), slug, owner: form.owner.trim(), category: form.category, area: form.area.trim(), description: form.description.trim(), whatsapp: form.whatsapp.trim(), payment: form.payment, user_id: user.id, theme: form.bgColour, catalogue: logoUrl || "" };
    const { data, error: err } = await supabase.from("businesses").upsert([payload], { onConflict: "user_id" }).select().single();
    if (err) { setError(err.message); } else { setSaved(true); setBusiness(data); setSavedBusinessId(data.id); }
    setSaving(false);
  }

  const iconOptions = ICON_TEMPLATES[form.category] || ICON_TEMPLATES["Other"];

  return (
    <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>

      {/* LEFT — Form */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Sticky save bar */}
        <div style={{ position: "sticky", top: 0, background: "#f5f5f3", zIndex: 10, paddingBottom: "16px", paddingTop: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "2px" }}>Business Setup</h2>
              <p style={{ fontSize: "13px", color: "#888" }}>Changes update your preview instantly.</p>
            </div>
            <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? "#ccc" : saved ? "#e8f5d0" : LIME, color: saving ? "#fff" : saved ? "#3a6b00" : DARK, border: saved ? "1.5px solid #a3e635" : "none", borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
              {saving ? "Saving..." : saved ? "✓ Saved" : "Save Business"}
            </button>
          </div>
          {error && <div style={{ fontSize: "13px", color: "#cc3300", background: "#fff0ee", padding: "10px 14px", borderRadius: "10px", marginTop: "8px" }}>{error}</div>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "36px" }}>
          <div><label style={labelStyle}>Business name *</label><input style={inputStyle} placeholder="e.g. Nomsa's Nails" value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
          <div><label style={labelStyle}>Owner name</label><input style={inputStyle} placeholder="Your full name" value={form.owner} onChange={(e) => update("owner", e.target.value)} /></div>
          <div>
            <label style={labelStyle}>Business type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map((cat) => <button key={cat} onClick={() => update("category", cat)} style={{ padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "1.5px solid", background: form.category === cat ? DARK : "#fff", color: form.category === cat ? LIME : "#555", borderColor: form.category === cat ? DARK : "#e0e0e0" }}>{cat}</button>)}
            </div>
          </div>
          <div><label style={labelStyle}>Area / Location</label><input style={inputStyle} placeholder="e.g. Soweto, Gauteng" value={form.area} onChange={(e) => update("area", e.target.value)} /></div>
          <div><label style={labelStyle}>Business description</label><textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} placeholder="Briefly describe what you do..." value={form.description} onChange={(e) => update("description", e.target.value)} /></div>
          <div><label style={labelStyle}>WhatsApp number</label><input style={inputStyle} placeholder="+27 82 000 0000" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} /></div>
          <div>
            <label style={labelStyle}>Payment method</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {PAYMENT_METHODS.map((method) => <button key={method} onClick={() => update("payment", method)} style={{ padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "1.5px solid", background: form.payment === method ? DARK : "#fff", color: form.payment === method ? LIME : "#555", borderColor: form.payment === method ? DARK : "#e0e0e0" }}>{method}</button>)}
            </div>
          </div>

          {/* Background colour */}
          <div>
            <label style={labelStyle}>Page background colour</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {BG_COLOURS.map((c) => (
                <button key={c.value} onClick={() => update("bgColour", c.value)} title={c.name}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", background: c.value, border: form.bgColour === c.value ? `3px solid ${LIME}` : "3px solid transparent", cursor: "pointer", outline: "none", boxShadow: form.bgColour === c.value ? "0 0 0 2px #fff, 0 0 0 4px #a3e635" : "none" }} />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label style={labelStyle}>Business icon</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {iconOptions.map((ic) => (
                <button key={ic} onClick={() => update("icon", ic)}
                  style={{ width: "44px", height: "44px", borderRadius: "12px", background: form.icon === ic ? DARK : "#fff", border: `1.5px solid ${form.icon === ic ? DARK : "#e0e0e0"}`, fontSize: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Logo upload */}
          <div>
            <label style={labelStyle}>Logo / Photo (optional)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {logoUrl && <img src={logoUrl} alt="logo" style={{ width: "56px", height: "56px", borderRadius: "14px", objectFit: "cover", border: "1.5px solid #eee" }} />}
              <button onClick={() => fileRef.current.click()} disabled={uploading} style={{ backgroundColor: "#fff", color: DARK, border: "1.5px solid #e0e0e0", borderRadius: "10px", padding: "10px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                {uploading ? "Uploading..." : logoUrl ? "Change photo" : "Upload photo"}
              </button>
              {logoUrl && <button onClick={() => setLogoUrl(null)} style={{ background: "transparent", border: "none", color: "#cc3300", fontSize: "12px", cursor: "pointer" }}>Remove</button>}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
            </div>
            <div style={{ fontSize: "11px", color: "#bbb", marginTop: "6px" }}>Upload from your phone or computer. JPG or PNG.</div>
          </div>
        </div>

        <div style={{ borderTop: "1.5px solid #eeeeea", marginBottom: "32px" }} />

        <ProductsSection businessId={savedBusinessId} prefilledProducts={prefilledProducts} onProductsPrefilled={() => setPrefilledProducts(null)} onProductsChange={setProducts} />
      </div>

      {/* RIGHT — Live preview (desktop only) */}
      <div style={{ width: "320px", flexShrink: 0, position: "sticky", top: "24px" }}>
        <BusinessPagePreview form={form} products={products} logoUrl={logoUrl} isFullPage={false} />
      </div>

    </div>
  );
}

// ── PAGE TAB ───────────────────────────────────────────────
function PageTab({ business, products, logoUrl }) {
  if (!business?.name) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>📄</div>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: DARK, marginBottom: "8px" }}>No page yet</h3>
        <p style={{ fontSize: "14px", color: "#aaa" }}>Complete your business setup first, then your page will appear here.</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/b/${business.slug}`;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "4px" }}>Your Business Page</h2>
          <p style={{ fontSize: "13px", color: "#888" }}>This is what your customers see when you share your link.</p>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Link copied!"); }}
          style={{ backgroundColor: LIME, color: DARK, border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
          Copy share link
        </button>
      </div>

      <div style={{ background: "#e8e8e4", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", color: "#555", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
        🔗 <span style={{ fontWeight: 600 }}>{shareUrl}</span>
      </div>

      <BusinessPagePreview
        form={{ name: business.name, category: business.category, area: business.area, description: business.description, whatsapp: business.whatsapp, bgColour: business.theme || "#0d0d0d", icon: "⭐" }}
        products={products}
        logoUrl={logoUrl}
        isFullPage={false}
      />
    </div>
  );
}

// ── PLACEHOLDER ────────────────────────────────────────────
function ComingSoon({ tab }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>🚧</div>
      <h3 style={{ fontSize: "20px", fontWeight: 800, color: DARK, marginBottom: "8px" }}>{tab} — Coming soon</h3>
      <p style={{ fontSize: "14px", color: "#aaa" }}>This section is being built. Check back soon.</p>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────
export default function AppDashboard({ onBack }) {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("Dashboard");
  const [business, setBusiness] = useState(null);
  const [prefilledTemplate, setPrefilledTemplate] = useState(null);
  const [products, setProducts] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user || null); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("businesses").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setBusiness(data);
        setLogoUrl(data.catalogue || null);
        supabase.from("products").select("*").eq("business_id", data.id).then(({ data: prods }) => { if (prods) setProducts(prods); });
      }
    });
  }, [user]);

  if (!user) return <AuthScreen />;

  function renderTab() {
    switch (tab) {
      case "Dashboard": return <DashboardHome user={user} business={business} setTab={setTab} />;
      case "Templates": return <TemplatesTab business={business} setTab={setTab} setPrefilledTemplate={setPrefilledTemplate} />;
      case "Setup": return <SetupTab user={user} business={business} setBusiness={setBusiness} prefilledTemplate={prefilledTemplate} setPrefilledTemplate={setPrefilledTemplate} />;
      case "Page": return <PageTab business={business} products={products} logoUrl={logoUrl} />;
      default: return <ComingSoon tab={tab} />;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #eeeeea", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: DARK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900, color: LIME }}>VT</div>
          <span style={{ fontSize: "15px", fontWeight: 800, color: DARK }}>VulaTrade</span>
          {business?.name && <span style={{ fontSize: "13px", color: "#bbb", marginLeft: "4px" }}>· {business.name}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#aaa" }}>{user.email}</span>
          <button onClick={async () => { await supabase.auth.signOut(); onBack(); }} style={{ fontSize: "12px", color: "#888", background: "transparent", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>Sign out</button>
          <button onClick={onBack} style={{ fontSize: "12px", color: "#888", background: "transparent", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>← Landing page</button>
        </div>
      </div>
      <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>
        <div style={{ width: "200px", background: "#fff", borderRight: "1px solid #eeeeea", padding: "20px 12px", flexShrink: 0 }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ width: "100%", textAlign: "left", padding: "11px 14px", borderRadius: "10px", fontSize: "14px", fontWeight: tab === t ? 700 : 500, background: tab === t ? DARK : "transparent", color: tab === t ? LIME : "#555", border: "none", cursor: "pointer", marginBottom: "2px", display: "block" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}

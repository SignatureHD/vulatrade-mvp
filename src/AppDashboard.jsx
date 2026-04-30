import { supabase } from "./lib/supabase";
import React, { useEffect, useState } from "react";
import "./styles.css";

// ── CONSTANTS ──────────────────────────────────────────────
const TABS = ["Dashboard", "Setup", "Page", "Customers", "Messages", "Growth", "Money", "Vuke", "Plans"];

const LIME = "#a3e635";
const DARK = "#0d0d0d";

const CATEGORIES = [
  "Nail Tech", "Hair & Extensions", "Barber", "Food Seller",
  "Fresh Produce", "Cleaning", "Tutoring", "Delivery",
  "Photography", "Catering", "Phone Repairs", "Other",
];

const PAYMENT_METHODS = ["Cash", "EFT / Bank Transfer", "SnapScan", "Zapper", "Yoco", "PayFast", "Other"];

// ── AUTH SCREEN ────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignIn() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email to confirm your account.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px", background: "#fff", borderRadius: "24px", padding: "36px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{ width: "40px", height: "40px", background: DARK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 900, color: LIME }}>VT</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 900, color: DARK }}>VulaTrade</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>Start local. Sell smarter. Grow stronger.</div>
          </div>
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "6px" }}>
          {mode === "signin" ? "Sign in to your account" : "Create your account"}
        </h2>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>
          {mode === "signin" ? "Welcome back." : "Start building your business today."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "13px 16px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "13px 16px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }}
          />

          {message && (
            <div style={{ fontSize: "13px", color: message.includes("Check") ? "#5a9a00" : "#cc3300", background: message.includes("Check") ? "#f0ffe0" : "#fff0ee", padding: "10px 14px", borderRadius: "10px" }}>
              {message}
            </div>
          )}

          <button
            onClick={mode === "signin" ? handleSignIn : handleSignUp}
            disabled={loading}
            style={{ backgroundColor: LIME, color: DARK, border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 800, cursor: "pointer", marginTop: "4px" }}
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}
            style={{ background: "transparent", border: "none", fontSize: "13px", color: "#888", cursor: "pointer", padding: "4px" }}
          >
            {mode === "signin" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TAB: DASHBOARD HOME ────────────────────────────────────
function DashboardHome({ user, business }) {
  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "6px" }}>
        Welcome back{business?.name ? `, ${business.name}` : ""} 👋
      </h2>
      <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>{user.email}</p>

      {!business?.name && (
        <div style={{ background: "#fffbe6", border: "1.5px solid #f0d000", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#7a5e00", marginBottom: "4px" }}>Complete your business setup</div>
          <div style={{ fontSize: "13px", color: "#9a7a00" }}>Go to the Setup tab to add your business details and save your profile.</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
        {[
          { label: "Customers", value: "0", sub: "Total tracked" },
          { label: "Messages", value: "0", sub: "Templates ready" },
          { label: "Payments", value: "R0", sub: "This month" },
          { label: "Follow-ups", value: "0", sub: "Due today" },
        ].map((stat) => (
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

// ── TAB: SETUP ─────────────────────────────────────────────
function SetupTab({ user, business, setBusiness }) {
  const [form, setForm] = useState({
    name: business?.name || "",
    owner: business?.owner || "",
    category: business?.category || "",
    area: business?.area || "",
    description: business?.description || "",
    whatsapp: business?.whatsapp || "",
    payment: business?.payment || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Business name is required."); return; }
    setSaving(true);
    setError("");

    const slug = form.name.toLowerCase().trim().replaceAll(" ", "-").replace(/[^a-z0-9-]/g, "");

    const payload = {
      name: form.name.trim(),
      slug,
      owner: form.owner.trim(),
      category: form.category,
      area: form.area.trim(),
      description: form.description.trim(),
      whatsapp: form.whatsapp.trim(),
      payment: form.payment,
      user_id: user.id,
    };

    // Upsert — update if exists, insert if not
    const { error: err } = await supabase
      .from("businesses")
      .upsert([payload], { onConflict: "user_id" });

    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setBusiness(payload);
    }
    setSaving(false);
  }

  const inputStyle = {
    border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "13px 16px",
    fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle = { fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "6px", display: "block" };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "6px" }}>Business Setup</h2>
      <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>Tell us about your business. AI will help with the rest.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

        <div>
          <label style={labelStyle}>Business name *</label>
          <input style={inputStyle} placeholder="e.g. Nomsa's Nails" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Owner name</label>
          <input style={inputStyle} placeholder="Your full name" value={form.owner} onChange={(e) => update("owner", e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Business type</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => update("category", cat)}
                style={{
                  padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                  background: form.category === cat ? DARK : "#fff",
                  color: form.category === cat ? LIME : "#555",
                  borderColor: form.category === cat ? DARK : "#e0e0e0",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Area / Location</label>
          <input style={inputStyle} placeholder="e.g. Soweto, Gauteng" value={form.area} onChange={(e) => update("area", e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Business description</label>
          <textarea
            style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
            placeholder="Briefly describe what you do and who you serve..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>WhatsApp number</label>
          <input style={inputStyle} placeholder="+27 82 000 0000" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Payment method</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                onClick={() => update("payment", method)}
                style={{
                  padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                  background: form.payment === method ? DARK : "#fff",
                  color: form.payment === method ? LIME : "#555",
                  borderColor: form.payment === method ? DARK : "#e0e0e0",
                }}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ fontSize: "13px", color: "#cc3300", background: "#fff0ee", padding: "10px 14px", borderRadius: "10px" }}>{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: saving ? "#ccc" : LIME, color: DARK, border: "none", borderRadius: "12px", padding: "15px", fontSize: "15px", fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", marginTop: "8px" }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Business"}
        </button>

      </div>
    </div>
  );
}

// ── PLACEHOLDER TAB ────────────────────────────────────────
function ComingSoon({ tab }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>🚧</div>
      <h3 style={{ fontSize: "20px", fontWeight: 800, color: DARK, marginBottom: "8px" }}>{tab} — Coming soon</h3>
      <p style={{ fontSize: "14px", color: "#aaa" }}>This section is being built. Check back soon.</p>
    </div>
  );
}

// ── MAIN DASHBOARD ─────────────────────────────────────────
export default function AppDashboard({ onBack }) {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("Dashboard");
  const [business, setBusiness] = useState(null);

  // Auth listener
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load business when user is ready
  useEffect(() => {
    if (!user) return;
    supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => { if (data) setBusiness(data); });
  }, [user]);

  if (!user) return <AuthScreen />;

  function renderTab() {
    switch (tab) {
      case "Dashboard": return <DashboardHome user={user} business={business} />;
      case "Setup": return <SetupTab user={user} business={business} setBusiness={setBusiness} />;
      default: return <ComingSoon tab={tab} />;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eeeeea", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: DARK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900, color: LIME }}>VT</div>
          <span style={{ fontSize: "15px", fontWeight: 800, color: DARK }}>VulaTrade</span>
          {business?.name && <span style={{ fontSize: "13px", color: "#bbb", marginLeft: "4px" }}>· {business.name}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#aaa" }}>{user.email}</span>
          <button onClick={async () => await supabase.auth.signOut()} style={{ fontSize: "12px", color: "#888", background: "transparent", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>Sign out</button>
          <button onClick={onBack} style={{ fontSize: "12px", color: "#888", background: "transparent", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>← Landing page</button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>

        {/* Sidebar */}
        <div style={{ width: "200px", background: "#fff", borderRight: "1px solid #eeeeea", padding: "20px 12px", flexShrink: 0 }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                width: "100%", textAlign: "left", padding: "11px 14px", borderRadius: "10px",
                fontSize: "14px", fontWeight: tab === t ? 700 : 500,
                background: tab === t ? DARK : "transparent",
                color: tab === t ? LIME : "#555",
                border: "none", cursor: "pointer", marginBottom: "2px",
                display: "block",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
          {renderTab()}
        </div>

      </div>
    </div>
  );
}

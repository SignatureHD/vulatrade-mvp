import React from "react";

const products = [
  { name: "Gel overlay", price: "R220", icon: "💅" },
  { name: "Acrylic set", price: "R350", icon: "✨" },
  { name: "Soak off", price: "R80", icon: "🧴" },
];

const businessTypes = [
  { label: "Nail Tech", style: "normal" },
  { label: "Hair Stylists", style: "italic" },
  { label: "Food Sellers", style: "normal" },
  { label: "Tutors", style: "italic" },
  { label: "Barbers", style: "normal" },
  { label: "Delivery Runners", style: "italic" },
  { label: "Cleaners", style: "normal" },
  { label: "Photographers", style: "italic" },
  { label: "Catering", style: "normal" },
  { label: "Phone Repairs", style: "italic" },
];

const LIME = "#a3e635";
const DARK = "#0d0d0d";
const OFF_WHITE = "#FDFCFB";
const SECTION_BG = "#f4f4f0";
const CARD_BORDER = "#e8e8e4";

function PhonePreview({ onDemo }) {
  return (
    <div style={{
      background: "#111",
      borderRadius: "48px",
      padding: "9px",
      border: "1.5px solid #2a2a2a",
      boxShadow: "0 48px 96px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)",
      transform: "rotate(-4deg)",
      position: "relative",
      zIndex: 4,
      width: "224px",
      flexShrink: 0,
    }}>
      <div style={{ position: "absolute", right: "-3px", top: "100px", width: "3px", height: "38px", background: "#1e1e1e", borderRadius: "0 2px 2px 0" }} />
      <div style={{ position: "absolute", left: "-3px", top: "86px", width: "3px", height: "28px", background: "#1e1e1e", borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", left: "-3px", top: "122px", width: "3px", height: "28px", background: "#1e1e1e", borderRadius: "2px 0 0 2px" }} />
      <div style={{ background: "#fff", borderRadius: "40px", overflow: "hidden" }}>
        <div style={{ height: "26px", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "58px", height: "16px", background: "#000", borderRadius: "8px" }} />
        </div>
        <div style={{ background: DARK, padding: "14px 16px 16px" }}>
          <div style={{ fontSize: "8px", color: LIME, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>AI Business Page</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Nomsa Nails</div>
          <div style={{ fontSize: "9px", color: "#555", marginTop: "3px" }}>Beauty & Nails · Mitchells Plain</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: LIME, color: DARK, fontSize: "8px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px", marginTop: "10px" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: DARK }} /> Live
          </div>
        </div>
        <button onClick={onDemo} style={{ background: LIME, color: DARK, border: "none", borderRadius: "10px", padding: "11px", fontSize: "11px", fontWeight: 800, width: "calc(100% - 28px)", margin: "12px 14px 6px", display: "block", textAlign: "center", cursor: "pointer", letterSpacing: "0.01em" }}>
          Enquire or Order
        </button>
        {products.map((p) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderBottom: "1px solid #f2f2f2" }}>
            <div style={{ width: "34px", height: "34px", background: "#f5f5f5", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>{p.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: DARK }}>{p.name}</div>
              <div style={{ fontSize: "9px", color: "#bbb", marginTop: "1px" }}>Ready to promote</div>
            </div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: DARK }}>{p.price}</div>
          </div>
        ))}
        <div style={{ height: "20px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "40px", height: "4px", background: "#ebebeb", borderRadius: "2px" }} />
        </div>
      </div>
    </div>
  );
}

function FloatCard({ style, children }) {
  return (
    <div style={{
      position: "absolute",
      background: "#fff",
      borderRadius: "18px",
      padding: "14px 18px",
      zIndex: 6,
      boxShadow: "0 12px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)",
      border: "1px solid rgba(255,255,255,0.08)",
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function LandingPage({ onDemo }) {
  return (
    <div style={{ background: DARK, minHeight: "100vh", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 64px", background: OFF_WHITE, borderBottom: "1px solid #e8e4de", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
          <div style={{ width: "44px", height: "44px", background: DARK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 900, color: LIME, flexShrink: 0, letterSpacing: "-0.02em" }}>VT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "17px", fontWeight: 900, color: DARK, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "-0.03em" }}>VulaTrade</span>
            <span style={{ fontSize: "11px", color: "#b0a898", whiteSpace: "nowrap", fontWeight: 400 }}>Start local. Sell smarter. Grow stronger.</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "44px" }}>
          {["Features", "Templates", "How it works", "Pricing"].map((link) => (
            <a key={link} href={`#${link.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "14px", fontWeight: 500, color: "#555", textDecoration: "none", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{link}</a>
          ))}
        </div>
        <button onClick={onDemo} style={{ backgroundColor: LIME, color: "#fff", border: "none", borderRadius: "999px", padding: "13px 32px", fontSize: "14px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "-0.01em" }}>
          Get Started
        </button>
      </nav>

      {/* HERO */}
      <section style={{ background: DARK, padding: "72px 64px 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.28)", borderRadius: "999px", padding: "8px 18px", marginBottom: "32px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: LIME, flexShrink: 0 }} />
          <span style={{ fontSize: "13px", color: LIME, fontWeight: 600, letterSpacing: "0.01em" }}>AI-powered business launch and growth system</span>
        </div>

        <h1 style={{ fontSize: "clamp(44px, 6.5vw, 82px)", fontWeight: 900, lineHeight: 1.03, color: "#fff", marginBottom: "24px", letterSpacing: "-0.03em", maxWidth: "900px", margin: "0 auto 24px" }}>
          You do the hair.<br />
          <span style={{ color: LIME }}>We run</span> the business.
        </h1>

        <p style={{ fontSize: "19px", color: "#777", lineHeight: 1.75, maxWidth: "480px", margin: "0 auto 40px", fontWeight: 400 }}>
          Bookings, follow-ups, payments and social content — all on autopilot. Works from your phone.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "52px", flexWrap: "wrap" }}>
          <button onClick={onDemo} style={{ backgroundColor: LIME, color: DARK, border: "none", borderRadius: "999px", padding: "18px 40px", fontSize: "17px", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>
            Set up your business free →
          </button>
          <button onClick={onDemo} style={{ backgroundColor: "transparent", color: LIME, border: `2px solid ${LIME}`, borderRadius: "999px", padding: "16px 36px", fontSize: "16px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
            See how it works
          </button>
        </div>

        {/* Reassure circles */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "72px", alignItems: "flex-start" }}>
          {[
            { num: "2", unit: "min", label: "Setup time" },
            { num: "100%", unit: "", label: "Mobile first" },
            { num: "Free", unit: "", label: "To start" },
            { num: "ZA", unit: "", label: "Built for SA" },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "0 40px" }}>
                <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "rgba(163,230,53,0.06)", border: "2px solid rgba(163,230,53,0.45)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1px" }}>
                  <span style={{ fontSize: item.num.length > 3 ? "13px" : "19px", fontWeight: 900, color: LIME, lineHeight: 1, letterSpacing: "-0.02em" }}>{item.num}</span>
                  {item.unit && <span style={{ fontSize: "9px", fontWeight: 700, color: LIME, opacity: 0.75 }}>{item.unit}</span>}
                </div>
                <span style={{ fontSize: "12px", color: "#555", fontWeight: 600, textAlign: "center", letterSpacing: "0.01em" }}>{item.label}</span>
              </div>
              {i < 3 && <div style={{ width: "1px", height: "70px", background: "rgba(255,255,255,0.06)" }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Phone scene — centred, cards tight to phone */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", height: "560px", marginBottom: "-64px", maxWidth: "700px", margin: "0 auto -64px" }}>
          {[400, 290, 185].map((size, i) => (
            <div key={size} style={{ position: "absolute", borderRadius: "50%", width: `${size}px`, height: `${size}px`, border: `1px solid rgba(163,230,53,${0.06 + i * 0.06})`, top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1, background: "transparent" }} />
          ))}

          <FloatCard style={{ top: "70px", left: "20px", minWidth: "140px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "5px" }}>Social reach</div>
            <div style={{ fontSize: "26px", fontWeight: 900, color: DARK, lineHeight: 1, letterSpacing: "-0.03em" }}>+40%</div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "4px", fontWeight: 500 }}>More local enquiries</div>
          </FloatCard>

          <FloatCard style={{ top: "60px", right: "20px", minWidth: "124px", textAlign: "center" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "5px" }}>Sales this week</div>
            <div style={{ fontSize: "26px", fontWeight: 900, color: DARK, lineHeight: 1, letterSpacing: "-0.03em" }}>8</div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "4px", fontWeight: 500 }}>R1,240 earned</div>
          </FloatCard>

          <PhonePreview onDemo={onDemo} />

          <FloatCard style={{ bottom: "80px", left: "20px", minWidth: "155px" }}>
            <div style={{ color: "#f59e0b", fontSize: "12px", letterSpacing: "2px", marginBottom: "5px" }}>★★★★★</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: DARK, lineHeight: 1.4 }}>"Best nail tech in Soweto!"</div>
            <div style={{ fontSize: "10px", color: "#bbb", marginTop: "4px", fontWeight: 400 }}>— Zanele · Soweto</div>
          </FloatCard>

          <FloatCard style={{ bottom: "90px", right: "20px", minWidth: "142px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "5px" }}>Follow-up due</div>
            <div style={{ fontSize: "19px", fontWeight: 900, color: DARK, lineHeight: 1.15, letterSpacing: "-0.02em" }}>2 customers</div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "4px", fontWeight: 500 }}>Auto-reminder ready</div>
          </FloatCard>
        </div>
      </section>

      {/* TICKER */}
      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 32s linear infinite; }
      `}</style>
      <div style={{ borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "26px 0", overflow: "hidden", background: "#080808", marginTop: "80px" }}>
        <div className="ticker-track" style={{ display: "flex", alignItems: "center", width: "max-content" }}>
          {[...businessTypes, ...businessTypes].map((item, i) => (
            <React.Fragment key={i}>
              <span style={{ fontSize: "16px", fontWeight: 800, textTransform: "uppercase", fontStyle: item.style === "italic" ? "italic" : "normal", color: "#fff", opacity: 0.35, whiteSpace: "nowrap", padding: "0 28px", letterSpacing: "0.06em" }}>
                {item.label}
              </span>
              <span style={{ color: "#2a2a2a", fontSize: "18px" }}>·</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* FEATURES BENTO */}
      <section id="features" style={{ background: SECTION_BG, padding: "96px 64px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#5a9a00", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>AI Business System</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: DARK, marginBottom: "16px", lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: "600px" }}>Everything you need to start, sell and grow</h2>
          <p style={{ fontSize: "16px", color: "#666", lineHeight: 1.75, maxWidth: "520px", marginBottom: "44px", fontWeight: 400 }}>
            Not another complicated platform. VulaTrade gives you a simple system that attracts clients, handles bookings, follows up automatically, and tracks your money.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div style={{ background: DARK, borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "26px", marginBottom: "14px" }}>🤖</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "10px", letterSpacing: "-0.02em" }}>AI customer journeys</div>
              <div style={{ fontSize: "13px", color: "#777", lineHeight: 1.7, flex: 1 }}>A client messages on WhatsApp. VulaTrade replies, confirms, reminds and follows up — automatically. You don't lift a finger.</div>
              <div style={{ fontSize: "42px", fontWeight: 900, color: LIME, marginTop: "20px", letterSpacing: "-0.03em" }}>Auto</div>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${CARD_BORDER}`, borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "26px", marginBottom: "14px" }}>📣</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: DARK, marginBottom: "10px", letterSpacing: "-0.02em" }}>Social growth tools</div>
              <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.7, flex: 1 }}>AI-generated captions for TikTok, Instagram and Facebook. Grow your audience while you work.</div>
              <div style={{ fontSize: "42px", fontWeight: 900, color: "#4a8500", marginTop: "20px", letterSpacing: "-0.03em" }}>+40%</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div style={{ background: LIME, borderRadius: "24px", padding: "28px" }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>🏪</div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: DARK, marginBottom: "8px", letterSpacing: "-0.02em" }}>Business templates</div>
              <div style={{ fontSize: "13px", color: "#1a3300", lineHeight: 1.65 }}>Pick your type and launch in minutes. Page, products and messages — all ready.</div>
            </div>
            <div style={{ background: "#eaeae6", borderRadius: "24px", padding: "28px" }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>💳</div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: DARK, marginBottom: "8px", letterSpacing: "-0.02em" }}>Payment tracking</div>
              <div style={{ fontSize: "13px", color: "#555", lineHeight: 1.65 }}>Know who paid, who owes, and auto-send reminders.</div>
            </div>
            <div style={{ background: DARK, borderRadius: "24px", padding: "28px" }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>🛒</div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.02em" }}>Vuke suppliers</div>
              <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.65 }}>Order stock from local suppliers directly inside VulaTrade.</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: "#fff", padding: "80px 64px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#5a9a00", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "40px" }}>How it works</p>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            {[
              { num: "1", title: "Choose a template", sub: "Pick your business type" },
              { num: "2", title: "Customise your page", sub: "Add your services and prices" },
              { num: "3", title: "Let VulaTrade run it", sub: "AI handles the rest automatically" },
            ].map((step, i) => (
              <React.Fragment key={step.num}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: 1 }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: DARK, color: LIME, fontSize: "16px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: DARK, marginBottom: "5px", letterSpacing: "-0.02em" }}>{step.title}</div>
                    <div style={{ fontSize: "13px", color: "#888", lineHeight: 1.55 }}>{step.sub}</div>
                  </div>
                </div>
                {i < 2 && <div style={{ fontSize: "20px", color: "#ddd", padding: "12px 20px", flexShrink: 0 }}>→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" style={{ background: DARK, padding: "96px 64px", textAlign: "center", borderTop: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 54px)", fontWeight: 900, color: "#fff", marginBottom: "16px", lineHeight: 1.03, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
            Start local. Sell smarter. Grow stronger.
          </h2>
          <p style={{ fontSize: "17px", color: "#555", marginBottom: "44px", lineHeight: 1.7, maxWidth: "460px", margin: "0 auto 44px", fontWeight: 400 }}>
            Build your first business system with ready-made templates, AI-powered customer journeys, social tools and payment support.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onDemo} style={{ backgroundColor: LIME, color: DARK, border: "none", borderRadius: "999px", padding: "18px 48px", fontSize: "17px", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>
              Get Started Free
            </button>
            <button onClick={onDemo} style={{ backgroundColor: "transparent", color: LIME, border: `2px solid ${LIME}`, borderRadius: "999px", padding: "16px 40px", fontSize: "17px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
              Book a Demo
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
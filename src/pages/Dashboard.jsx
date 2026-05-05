import React, { useEffect, useState } from "react";
import { LIME, DARK, TABS } from "../constants";
import { supabase } from "../lib/supabase";
import { AuthScreen } from "../components/AuthScreen";
import { DashboardHome } from "../components/dashboard/DashboardHome";
import { SetupTab } from "../components/dashboard/SetupTab";
import { CustomersTab } from "../components/dashboard/CustomersTab";
import { BookingsTab } from "../components/dashboard/BookingsTab";
import { TemplatesTab, PageTab, MoneyTab, ComingSoon } from "../components/dashboard/OtherTabs";

export default function Dashboard({ authMode = "signin", onBack }) {
  const [user, setUser]           = useState(null);
  const [tab, setTab]             = useState("Dashboard");
  const [business, setBusiness]   = useState(null);
  const [prefilledTemplate, setPrefilledTemplate] = useState(null);
  const [products, setProducts]   = useState([]);
  const [logoUrl, setLogoUrl]     = useState(null);

  // ── AUTH LISTENER ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── LOAD BUSINESS + PRODUCTS ───────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase.from("businesses").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setBusiness(data);
        setLogoUrl(data.catalogue || null);
        supabase.from("products").select("*").eq("business_id", data.id).then(({ data: prods }) => {
          if (prods)
            setProducts(
              prods.map((p) => ({
                ...p,
                icon: p.image && !p.image.startsWith("http") ? p.image : "🛍️",
              }))
            );
        });
      }
    });
  }, [user]);

  if (!user) return <AuthScreen initialMode={authMode} />;

  function renderTab() {
    switch (tab) {
      case "Dashboard":
        return <DashboardHome user={user} business={business} setTab={setTab} />;
      case "Templates":
        return <TemplatesTab business={business} setTab={setTab} setPrefilledTemplate={setPrefilledTemplate} />;
      case "Setup":
        return (
          <SetupTab
            user={user}
            business={business}
            setBusiness={setBusiness}
            prefilledTemplate={prefilledTemplate}
            setPrefilledTemplate={setPrefilledTemplate}
            setTab={setTab}
            setGlobalProducts={setProducts}
            setGlobalLogoUrl={setLogoUrl}
          />
        );
      case "Page":
        return <PageTab business={business} products={products} logoUrl={logoUrl} />;
      case "Customers":
        return <CustomersTab business={business} />;
      case "Bookings":
        return <BookingsTab business={business} />;
      case "Money":
        return <MoneyTab business={business} />;
      default:
        return <ComingSoon tab={tab} />;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── TOP NAV ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eeeeea", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: DARK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 900, color: LIME }}>VT</div>
          <span style={{ fontSize: "14px", fontWeight: 800, color: DARK }}>VulaTrade</span>
          {business?.name && (
            <span style={{ fontSize: "12px", color: "#bbb", marginLeft: "2px", display: "none" }} className="desktop-only">
              · {business.name}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={async () => { await supabase.auth.signOut(); onBack(); }}
            style={{ fontSize: "12px", color: "#888", background: "transparent", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "6px 10px", cursor: "pointer" }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 53px)" }}>

        {/* ── DESKTOP SIDEBAR ── */}
        <div
          style={{ width: "200px", background: "#fff", borderRight: "1px solid #eeeeea", padding: "16px 10px", flexShrink: 0, display: "none" }}
          id="desktop-sidebar"
        >
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: tab === t ? 700 : 500, background: tab === t ? DARK : "transparent", color: tab === t ? LIME : "#555", border: "none", cursor: "pointer", marginBottom: "2px", display: "block" }}>
              {t}
            </button>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, padding: "20px 16px", overflowY: "auto", paddingBottom: "80px" }}>
          {renderTab()}
        </div>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eeeeea", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {["Dashboard", "Customers", "Bookings", "Money", "Setup"].map((t) => {
          const ICONS = { Dashboard: "Home", Customers: "People", Bookings: "Book", Money: "R", Setup: "Setup" };
          const active = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 4px", border: "none", background: "transparent", cursor: "pointer", gap: "3px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, lineHeight: 1, color: active ? DARK : "#ccc" }}>
                {ICONS[t]}
              </div>
              <div style={{ fontSize: "10px", fontWeight: active ? 800 : 500, color: active ? DARK : "#aaa", lineHeight: 1 }}>
                {t}
              </div>
              {active && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: LIME, marginTop: "1px" }} />}
            </button>
          );
        })}
      </div>

      <style>{`
        @media (min-width: 768px) {
          #desktop-sidebar { display: block !important; }
        }
        @media (max-width: 767px) {
          #desktop-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}

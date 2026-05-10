import React, { useEffect, useState } from "react";
import {
  ChartNoAxesColumn,
  FileText,
  Globe,
  Home,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Package,
  ReceiptText,
  Settings,
  Sparkles,
  Star,
  Store,
  Users,
  WalletCards,
} from "lucide-react";
import { DARK, TABS } from "../constants";
import { supabase } from "../lib/supabase";
import { AuthScreen } from "../components/AuthScreen";
import Logo from "../components/Logo";
import { DashboardHome } from "../components/dashboard/DashboardHome";
import { SetupTab } from "../components/dashboard/SetupTab";
import { CustomersTab } from "../components/dashboard/CustomersTab";
import { BookingsTab } from "../components/dashboard/BookingsTab";
import { TemplatesTab, PageTab, MoneyTab, ComingSoon } from "../components/dashboard/OtherTabs";

const BRAND = "#ea4c89";

const DESKTOP_TAB_CONFIG = {
  Dashboard: { icon: LayoutDashboard, label: "Dashboard" },
  Templates: { icon: Sparkles, label: "Business Types" },
  Setup: { icon: Settings, label: "Settings" },
  Page: { icon: Globe, label: "Public Page" },
  Customers: { icon: Users, label: "Customers" },
  Bookings: { icon: ReceiptText, label: "Sales" },
  Messages: { icon: MessageCircle, label: "Reviews" },
  Growth: { icon: FileText, label: "Business File" },
  Money: { icon: WalletCards, label: "Expenses" },
  Vuke: { icon: Store, label: "Vuke" },
  Plans: { icon: Star, label: "Plans" },
};

const MOBILE_TABS = [
  { tab: "Dashboard", label: "Home", icon: Home },
  { tab: "Money", label: "Sales", icon: ReceiptText },
  { tab: "Setup", label: "Products", icon: Package },
  { tab: "Customers", label: "Customers", icon: Users },
  { tab: "Page", label: "More", icon: Menu },
];

export default function Dashboard({ authMode = "signin", initialTab = "Dashboard", onBack }) {
  const [user, setUser]           = useState(null);
  const [tab, setTab]             = useState(initialTab);
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

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

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
    <div style={{ minHeight: "100vh", background: "#fbfbfb", fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── TOP NAV ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eeeeea", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Logo size="small" />
          {business?.name && (
            <span style={{ fontSize: "12px", color: "#bbb", marginLeft: "2px", display: "none" }} className="desktop-only">
              · {business.name}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={async () => { await supabase.auth.signOut(); onBack(); }}
            style={{ fontSize: "12px", color: "#454545", background: "#fff", border: "1px solid #eeeeea", borderRadius: "10px", padding: "7px 12px", cursor: "pointer", fontWeight: 700 }}
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
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#767b81", margin: "4px 12px 12px" }}>Quick Access</div>
          {TABS.map((t) => {
            const config = DESKTOP_TAB_CONFIG[t] || { icon: ChartNoAxesColumn, label: t };
            const Icon = config.icon;
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)}
                style={{ width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: active ? 800 : 650, background: active ? "#fde8f1" : "transparent", color: active ? BRAND : "#5f6670", border: "none", cursor: "pointer", marginBottom: "3px", display: "flex", alignItems: "center", gap: "12px" }}>
                <Icon size={19} strokeWidth={2.2} color={active ? BRAND : "#767b81"} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, padding: "20px 16px", overflowY: "auto", paddingBottom: "80px" }}>
          {renderTab()}
        </div>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eeeeea", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {MOBILE_TABS.map((item) => {
          const active = tab === item.tab;
          const Icon = item.icon;
          return (
            <button key={item.tab} onClick={() => setTab(item.tab)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 4px", border: "none", background: "transparent", cursor: "pointer", gap: "4px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: active ? "#fde8f1" : "transparent" }}>
                <Icon size={19} strokeWidth={2.2} color={active ? BRAND : "#767b81"} />
              </div>
              <div style={{ fontSize: "10px", fontWeight: active ? 800 : 600, color: active ? BRAND : "#767b81", lineHeight: 1 }}>
                {item.label}
              </div>
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

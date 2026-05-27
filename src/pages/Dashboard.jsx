import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  FileText,
  Globe,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MapPin,
  MessageCircle,
  Package,
  ReceiptText,
  Settings,
  Star,
  Store,
  Users,
  WalletCards,
} from "lucide-react";
import { DARK } from "../constants";
import { supabase } from "../lib/supabase";
import { AuthScreen } from "../components/AuthScreen";
import Logo from "../components/Logo";
import { DashboardHome } from "../components/dashboard/DashboardHome";
import { SetupTab } from "../components/dashboard/SetupTab";
import { ProductsTab } from "../components/dashboard/ProductsTab";
import { CustomersTab } from "../components/dashboard/CustomersTab";
import { BookingsTab } from "../components/dashboard/BookingsTab";
import { SalesTab as ProductSalesTab } from "../components/dashboard/SalesTab";
import { ExpensesTab } from "../components/dashboard/ExpensesTab";
import { ReviewsTab } from "../components/dashboard/ReviewsTab";
import { BusinessFileTab } from "../components/dashboard/BusinessFileTab";
import { PlansTab } from "../components/dashboard/PlansTab";
import { BusinessLocationTab } from "../components/dashboard/BusinessLocationTab";
import {
  ComingSoon,
  MessagesTab,
  PageTab,
  SettingsTab,
  TemplatesTab,
  VukeTab,
} from "../components/dashboard/OtherTabs";

const BRAND = "#ea4c89";

const TAB_ROUTES = {
  Dashboard: "/dashboard",
  Page: "/public-page",
  Setup: "/setup",
  Location: "/location",
  Products: "/products",
  Customers: "/customers",
  Messages: "/messages",
  Bookings: "/bookings",
  Sales: "/sales",
  Expenses: "/expenses",
  Reviews: "/reviews",
  BusinessFile: "/business-file",
  Vuke: "/vuke",
  Plans: "/plans",
  Settings: "/settings",
};

const NAV_GROUPS = [
  {
    items: [{ tab: "Dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Your Business",
    items: [
      { tab: "Page", label: "Public Page", icon: Globe },
      { tab: "Setup", label: "Setup", icon: Settings },
      { tab: "Location", label: "Location", icon: MapPin },
      { tab: "Products", label: "Products / Services", icon: Package },
      { tab: "Customers", label: "Customers", icon: Users },
      { tab: "Messages", label: "Messages", icon: MessageCircle },
      { tab: "Bookings", label: "Bookings", icon: CalendarDays },
      { tab: "Sales", label: "Sales", icon: ReceiptText },
      { tab: "Expenses", label: "Expenses", icon: WalletCards },
      { tab: "Reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    title: "Growth",
    items: [
      { tab: "BusinessFile", label: "Business File", icon: FileText },
      { tab: "Vuke", label: "Vuke", icon: Store },
      { tab: "Plans", label: "Plans", icon: Star },
    ],
  },
  {
    items: [{ tab: "Settings", label: "Settings", icon: Settings }],
  },
];

const MOBILE_TABS = [
  { tab: "Dashboard", label: "Home", icon: Home },
  { tab: "Sales", label: "Sales", icon: ReceiptText },
  { tab: "Products", label: "Products", icon: Package },
  { tab: "Customers", label: "Customers", icon: Users },
  { tab: "More", label: "More", icon: Menu, opensMore: true },
];

const MORE_ITEMS = [
  { tab: "Page", label: "Public Page", icon: Globe },
  { tab: "Setup", label: "Setup", icon: Settings },
  { tab: "Location", label: "Location", icon: MapPin },
  { tab: "Messages", label: "Messages", icon: MessageCircle },
  { tab: "Bookings", label: "Bookings", icon: CalendarDays },
  { tab: "Expenses", label: "Expenses", icon: WalletCards },
  { tab: "Reviews", label: "Reviews", icon: Star },
  { tab: "BusinessFile", label: "Business File", icon: FileText },
  { tab: "Vuke", label: "Vuke", icon: Store },
  { tab: "Plans", label: "Plans", icon: Star },
  { tab: "Settings", label: "Settings", icon: Settings },
];

function normalizeTab(value) {
  if (value === "Money") return "Sales";
  if (value === "Growth") return "BusinessFile";
  return value || "Dashboard";
}

export default function Dashboard({ authMode = "signin", initialTab = "Dashboard", onBack }) {
  const [user, setUser]           = useState(null);
  const [tab, setTab]             = useState(() => normalizeTab(initialTab));
  const [business, setBusiness]   = useState(null);
  const [prefilledTemplate, setPrefilledTemplate] = useState(null);
  const [products, setProducts]   = useState([]);
  const [logoUrl, setLogoUrl]     = useState(null);
  const [moreOpen, setMoreOpen]   = useState(false);

  // ── AUTH LISTENER ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setTab(normalizeTab(initialTab));
  }, [initialTab]);

  function selectTab(nextTab, { updateUrl = true } = {}) {
    const cleanTab = normalizeTab(nextTab);
    setTab(cleanTab);
    setMoreOpen(false);
    if (updateUrl && TAB_ROUTES[cleanTab] && window.location.pathname !== TAB_ROUTES[cleanTab]) {
      window.history.pushState({}, "", TAB_ROUTES[cleanTab]);
    }
  }

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
        return <DashboardHome user={user} business={business} setTab={selectTab} />;
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
      case "Location":
        return <BusinessLocationTab business={business} setBusiness={setBusiness} />;
      case "Products":
        return <ProductsTab user={user} business={business} setGlobalProducts={setProducts} />;
      case "Page":
        return <PageTab business={business} products={products} logoUrl={logoUrl} />;
      case "Customers":
        return <CustomersTab business={business} onMessageCustomer={(customer) => {
          window.history.pushState({}, "", `/messages?customerId=${encodeURIComponent(customer.id)}`);
          setTab("Messages");
        }} />;
      case "Messages":
        return <MessagesTab business={business} />;
      case "Bookings":
        return <BookingsTab business={business} />;
      case "Sales":
      case "Money":
        return <ProductSalesTab business={business} products={products} />;
      case "Expenses":
        return <ExpensesTab business={business} />;
      case "Reviews":
        return <ReviewsTab business={business} />;
      case "BusinessFile":
      case "Growth":
        return <BusinessFileTab business={business} setTab={selectTab} />;
      case "Vuke":
        return <VukeTab />;
      case "Plans":
        return <PlansTab />;
      case "Settings":
        return (
          <SettingsTab
            onEditBusiness={() => selectTab("Setup")}
            onEditPublicPage={() => selectTab("Page")}
            onSignOut={async () => { await supabase.auth.signOut(); onBack(); }}
          />
        );
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
          {NAV_GROUPS.map((group, index) => (
            <div key={group.title || `group-${index}`} style={{ marginBottom: index === NAV_GROUPS.length - 1 ? 0 : "18px" }}>
              {group.title && (
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#a5abb2", margin: "0 12px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = tab === item.tab;
                return (
                  <button key={item.tab} onClick={() => selectTab(item.tab)}
                    style={{ width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: active ? 800 : 650, background: active ? "#fde8f1" : "transparent", color: active ? BRAND : "#5f6670", border: "none", cursor: "pointer", marginBottom: "3px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Icon size={19} strokeWidth={2.2} color={active ? BRAND : "#767b81"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div id="dashboard-main-content" style={{ flex: 1, padding: "20px 16px", overflowY: "auto", paddingBottom: "96px" }}>
          {renderTab()}
        </div>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div id="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eeeeea", boxShadow: "0 -10px 30px rgba(15,23,42,0.08)", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {MOBILE_TABS.map((item) => {
          const active = item.opensMore ? moreOpen : tab === item.tab;
          const Icon = item.icon;
          return (
            <button key={item.tab} onClick={() => item.opensMore ? setMoreOpen(true) : selectTab(item.tab)}
              style={{ flex: 1, minHeight: "62px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 4px", border: "none", background: "transparent", cursor: "pointer", gap: "4px" }}>
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

      {moreOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:150, display:"flex", alignItems:"flex-end" }}>
          <button aria-label="Close menu" onClick={() => setMoreOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(32,32,33,0.36)", border:"none", cursor:"pointer" }} />
          <div style={{ position:"relative", width:"100%", maxHeight:"86vh", overflowY:"auto", background:"#fff", borderRadius:"24px 24px 0 0", padding:"18px 18px calc(18px + env(safe-area-inset-bottom))", boxShadow:"0 -18px 60px rgba(32,32,33,0.18)" }}>
            <div style={{ width:"44px", height:"4px", borderRadius:"999px", background:"#d4d7db", margin:"0 auto 14px" }} />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
              <div>
                <div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>More</div>
                <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>Business tools and settings</div>
              </div>
              <button onClick={() => setMoreOpen(false)} style={{ border:"1px solid #eeeeea", background:"#fff", borderRadius:"999px", width:"36px", height:"36px", color:"#767b81", fontSize:"18px", cursor:"pointer" }}>×</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:"10px", marginBottom:"12px" }}>
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = tab === item.tab;
                return (
                  <button key={item.tab} onClick={() => selectTab(item.tab)}
                    style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px", borderRadius:"14px", border:`1px solid ${active ? "#f8b8d2" : "#eeeeea"}`, background:active ? "#fde8f1" : "#fff", color:active ? BRAND : "#454545", fontSize:"13px", fontWeight:800, cursor:"pointer", textAlign:"left" }}>
                    <span style={{ width:"32px", height:"32px", borderRadius:"50%", background:active ? "#fff" : "#fbfbfb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon size={17} strokeWidth={2.2} color={active ? BRAND : "#767b81"} />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); setMoreOpen(false); onBack(); }}
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", padding:"13px", borderRadius:"14px", border:"1px solid #eeeeea", background:"#fbfbfb", color:"#454545", fontSize:"13px", fontWeight:800, cursor:"pointer" }}
            >
              <LogOut size={17} strokeWidth={2.2} />
              Sign out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          #desktop-sidebar { display: block !important; }
          #mobile-bottom-nav { display: none !important; }
          #dashboard-main-content { padding-bottom: 24px !important; }
        }
        @media (max-width: 899px) {
          #desktop-sidebar { display: none !important; }
          #mobile-bottom-nav { display: flex !important; }
          #dashboard-main-content { padding-bottom: 96px !important; }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
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
import { ConsentScreen, getLatestConsentForUser, userHasCurrentConsent } from "../components/ConsentScreen";
import Logo from "../components/Logo";
import { DashboardHome } from "../components/dashboard/DashboardHome";
import { SetupTab } from "../components/dashboard/SetupTab";
import { ProductsTab } from "../components/dashboard/ProductsTab";
import { CustomersTab } from "../components/dashboard/CustomersTab";
import { CustomerFollowUpsTab } from "../components/dashboard/CustomerFollowUpsTab";
import { EnquiriesTab } from "../components/dashboard/EnquiriesTab";
import { BookingsTab } from "../components/dashboard/BookingsTab";
import { SalesTab as ProductSalesTab } from "../components/dashboard/SalesTab";
import { ExpensesTab } from "../components/dashboard/ExpensesTab";
import { ReviewsTab } from "../components/dashboard/ReviewsTab";
import { BusinessFileTab } from "../components/dashboard/BusinessFileTab";
import { PlansTab } from "../components/dashboard/PlansTab";
import { BusinessLocationTab } from "../components/dashboard/BusinessLocationTab";
import { WhatsAppStatusBuilderTab } from "../components/dashboard/WhatsAppStatusBuilderTab";
import { ComingSoon, MessagesTab, PageTab, SettingsTab, TemplatesTab, VukeTab } from "../components/dashboard/OtherTabs";

const BRAND = "#ea4c89";
const OPEN_LEAD_STATUSES = ["new", "new_enquiry", "interested", "booking_requested", "order_requested", "price_sent", "quoted"];
const FOLLOW_UP_STATUSES = ["follow_up", "followed_up"];
const PAYMENT_PENDING_STATUSES = ["waiting_payment", "payment_pending"];

const TAB_ROUTES = {
  Dashboard: "/dashboard",
  Page: "/public-page",
  Setup: "/setup",
  Location: "/location",
  Products: "/products",
  Customers: "/customers",
  FollowUps: "/customer-follow-ups",
  Enquiries: "/enquiries",
  Messages: "/messages",
  Bookings: "/bookings",
  Sales: "/sales",
  Expenses: "/expenses",
  Reviews: "/reviews",
  BusinessFile: "/business-file",
  WhatsAppStatus: "/growth/whatsapp-status-builder",
  Vuke: "/vuke",
  Plans: "/plans",
  Settings: "/settings",
};

const NAV_GROUPS = [
  { items: [{ tab: "Dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { title: "Your Business", items: [
    { tab: "Page", label: "Public Page", icon: Globe },
    { tab: "Setup", label: "Setup", icon: Settings },
    { tab: "Location", label: "Location", icon: MapPin },
    { tab: "Products", label: "Products / Services", icon: Package },
    { tab: "Customers", label: "Customers", icon: Users },
    { tab: "FollowUps", label: "Follow-Ups", icon: MessageCircle },
    { tab: "Enquiries", label: "Leads", icon: MessageCircle },
    { tab: "Messages", label: "Messages", icon: MessageCircle },
    { tab: "Bookings", label: "Bookings", icon: CalendarDays },
    { tab: "Sales", label: "Sales", icon: ReceiptText },
    { tab: "Expenses", label: "Expenses", icon: WalletCards },
    { tab: "Reviews", label: "Reviews", icon: Star },
  ]},
  { title: "Growth", items: [
    { tab: "WhatsAppStatus", label: "WhatsApp Status", icon: MessageCircle },
    { tab: "BusinessFile", label: "Business File", icon: FileText },
    { tab: "Vuke", label: "Vuke", icon: Store },
    { tab: "Plans", label: "Plans", icon: Star },
  ]},
  { items: [{ tab: "Settings", label: "Settings", icon: Settings }] },
];

const MOBILE_TABS = [
  { tab: "Dashboard", label: "Home", icon: Home },
  { tab: "Enquiries", label: "Leads", icon: MessageCircle },
  { tab: "Sales", label: "Sales", icon: ReceiptText },
  { tab: "Products", label: "Products", icon: Package },
  { tab: "More", label: "More", icon: Menu, opensMore: true },
];

const MORE_ITEMS = [
  { tab: "Page", label: "Public Page", icon: Globe },
  { tab: "Setup", label: "Setup", icon: Settings },
  { tab: "Location", label: "Location", icon: MapPin },
  { tab: "Customers", label: "Customers", icon: Users },
  { tab: "FollowUps", label: "Follow-Ups", icon: MessageCircle },
  { tab: "Enquiries", label: "Leads", icon: MessageCircle },
  { tab: "Messages", label: "Messages", icon: MessageCircle },
  { tab: "Bookings", label: "Bookings", icon: CalendarDays },
  { tab: "Expenses", label: "Expenses", icon: WalletCards },
  { tab: "Reviews", label: "Reviews", icon: Star },
  { tab: "WhatsAppStatus", label: "WhatsApp Status", icon: MessageCircle },
  { tab: "BusinessFile", label: "Business File", icon: FileText },
  { tab: "Vuke", label: "Vuke", icon: Store },
  { tab: "Plans", label: "Plans", icon: Star },
  { tab: "Settings", label: "Settings", icon: Settings },
];

function normalizeTab(value) {
  if (value === "Money") return "Sales";
  if (value === "Growth") return "BusinessFile";
  if (value === "WhatsApp" || value === "WhatsAppStatusBuilder") return "WhatsAppStatus";
  return value || "Dashboard";
}

function normaliseLeadStatus(value) {
  const status = String(value || "new_enquiry").toLowerCase();
  if (status === "new") return "new_enquiry";
  if (status === "replied") return "followed_up";
  if (status === "quoted") return "price_sent";
  if (status === "waiting_payment") return "payment_pending";
  if (status === "follow_up") return "followed_up";
  return status;
}

function isOpenLead(row = {}) {
  const status = normaliseLeadStatus(row.status);
  if (row.is_archived || ["booked", "paid", "completed", "lost", "cancelled"].includes(status)) return false;
  return OPEN_LEAD_STATUSES.includes(status);
}

function isFollowUpLead(row = {}) {
  const status = normaliseLeadStatus(row.status);
  return !row.is_archived && FOLLOW_UP_STATUSES.includes(status);
}

function isPaymentPendingLead(row = {}) {
  const status = normaliseLeadStatus(row.status);
  return !row.is_archived && PAYMENT_PENDING_STATUSES.includes(status);
}

function LoadingScreen({ message = "Loading VulaTrade..." }) {
  return <div style={{ minHeight: "100vh", background: "#fbfbfb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', -apple-system, sans-serif" }}><div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "22px", padding: "24px", boxShadow: "0 18px 60px rgba(32,32,33,0.08)", color: DARK, fontWeight: 800 }}>{message}</div></div>;
}

function Badge({ value, small = false }) {
  if (!value || value <= 0) return null;
  const label = value > 99 ? "99+" : String(value);
  return <span style={{ minWidth: small ? "17px" : "20px", height: small ? "17px" : "20px", padding: small ? "0 5px" : "0 6px", borderRadius: "999px", background: BRAND, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: small ? "10px" : "11px", fontWeight: 950, lineHeight: 1, boxShadow: "0 5px 14px rgba(234,76,137,0.28)" }}>{label}</span>;
}

function badgeForTab(tab, counts) {
  if (tab === "Enquiries") return counts.leads || 0;
  if (tab === "FollowUps") return counts.followUps || counts.waitingPayment || 0;
  if (tab === "Bookings") return counts.bookings || 0;
  if (tab === "Sales") return counts.unpaid || counts.waitingPayment || 0;
  return 0;
}

function DashboardAttentionCards({ counts, onSelect }) {
  const activeCards = [
    { key: "leads", label: "Open leads", value: counts.leads, sub: "Leads waiting for action", tab: "Enquiries", icon: MessageCircle },
    { key: "follow", label: "Follow-up needed", value: counts.followUps, sub: "People to message again", tab: "FollowUps", icon: MessageCircle },
    { key: "waiting", label: "Waiting payment", value: counts.waitingPayment, sub: "Price sent, not finalised", tab: "FollowUps", icon: ReceiptText },
    { key: "unpaid", label: "Unpaid sales", value: counts.unpaid, sub: "Payments to follow up", tab: "Sales", icon: ReceiptText },
    { key: "bookings", label: "Upcoming bookings", value: counts.bookings, sub: "Today or coming soon", tab: "Bookings", icon: CalendarDays },
  ].filter((card) => card.value > 0);

  const cards = activeCards.length > 0 ? activeCards : [
    { key: "clear", label: "All clear for now", value: 0, sub: "No urgent items waiting", tab: "Dashboard", icon: Star },
  ];

  return <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "20px", padding: "18px", marginBottom: "18px", boxShadow: "0 12px 34px rgba(15,23,42,0.04)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "12px" }}><div><div style={{ color: BRAND, fontSize: "11px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Quick things to handle today</div><div style={{ color: DARK, fontSize: "16px", fontWeight: 950, marginTop: "3px" }}>{activeCards.length > 0 ? "Things waiting for you" : "You are up to date"}</div></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>{cards.map((card) => { const Icon = card.icon; return <button key={card.key} onClick={() => onSelect(card.tab)} style={{ textAlign: "left", background: "#fbfbfb", border: "1px solid #eeeeea", borderRadius: "16px", padding: "13px", cursor: "pointer", display: "flex", gap: "10px", alignItems: "center" }}><span style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#fde8f1", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}><Icon size={18} color={BRAND} /><span style={{ position: "absolute", right: "-4px", top: "-5px" }}><Badge value={card.value} small /></span></span><span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: "13px", color: DARK, fontWeight: 900 }}>{card.label}</span><span style={{ display: "block", fontSize: "11px", color: "#888", fontWeight: 700, marginTop: "2px" }}>{card.sub}</span></span></button>; })}</div></div>;
}

export default function Dashboard({ authMode = "signin", initialTab = "Dashboard", onBack }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [hasCurrentConsent, setHasCurrentConsent] = useState(false);
  const [tab, setTab] = useState(() => normalizeTab(initialTab));
  const [business, setBusiness] = useState(null);
  const [prefilledTemplate, setPrefilledTemplate] = useState(null);
  const [products, setProducts] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({ leads: 0, followUps: 0, waitingPayment: 0, bookings: 0, unpaid: 0 });

  const totalMobileAttention = useMemo(() => notificationCounts.leads + notificationCounts.bookings + notificationCounts.unpaid, [notificationCounts]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user || null); setAuthChecked(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user || null); setConsentChecked(false); setHasCurrentConsent(false); setAuthChecked(true); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function checkConsent() {
      if (!user) { setConsentChecked(false); setHasCurrentConsent(false); return; }
      const { consent, error } = await getLatestConsentForUser(user.id);
      if (cancelled) return;
      if (error) console.warn("Consent check failed", error.message);
      setHasCurrentConsent(userHasCurrentConsent(consent));
      setConsentChecked(true);
    }
    checkConsent();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => { setTab(normalizeTab(initialTab)); }, [initialTab]);

  function selectTab(nextTab, { updateUrl = true } = {}) {
    const cleanTab = normalizeTab(nextTab);
    setTab(cleanTab);
    setMoreOpen(false);
    if (updateUrl && TAB_ROUTES[cleanTab] && window.location.pathname !== TAB_ROUTES[cleanTab]) window.history.pushState({}, "", TAB_ROUTES[cleanTab]);
  }

  useEffect(() => {
    if (!user || !hasCurrentConsent) return;
    supabase.from("businesses").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setBusiness(data);
        setLogoUrl(data.catalogue || null);
        supabase.from("products").select("*").eq("business_id", data.id).then(({ data: prods }) => {
          if (prods) setProducts(prods.map((p) => ({ ...p, icon: p.image && !p.image.startsWith("http") ? p.image : "🛍️" })));
        });
      }
    });
  }, [user, hasCurrentConsent]);

  useEffect(() => {
    let cancelled = false;
    async function loadNotifications() {
      if (!business?.id) { setNotificationCounts({ leads: 0, followUps: 0, waitingPayment: 0, bookings: 0, unpaid: 0 }); return; }
      const today = new Date().toISOString().slice(0, 10);
      const threeDaysAhead = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      const [{ data: enquiries }, { data: bookings }, { data: payments }] = await Promise.all([
        supabase.from("enquiries").select("id,status,is_archived").eq("business_id", business.id),
        supabase.from("bookings").select("id,status,booking_date").eq("business_id", business.id),
        supabase.from("payments").select("id,status").eq("business_id", business.id),
      ]);
      if (cancelled) return;
      const leadRows = enquiries || [];
      const openLeads = leadRows.filter(isOpenLead).length;
      const followUps = leadRows.filter(isFollowUpLead).length;
      const waitingPayment = leadRows.filter(isPaymentPendingLead).length;
      const upcomingBookings = (bookings || []).filter((b) => {
        const status = String(b.status || "").toLowerCase();
        const date = b.booking_date || "";
        return !["done", "completed", "cancelled", "lost"].includes(status) && date >= today && date <= threeDaysAhead;
      }).length;
      const unpaid = (payments || []).filter((p) => String(p.status || "").toLowerCase() === "unpaid").length;
      setNotificationCounts({ leads: openLeads, followUps, waitingPayment, bookings: upcomingBookings, unpaid });
    }
    loadNotifications();
    return () => { cancelled = true; };
  }, [business?.id, tab]);

  async function signOutAndReturnHome() { await supabase.auth.signOut(); onBack?.(); }

  if (!authChecked) return <LoadingScreen />;
  if (!user) return <AuthScreen initialMode={authMode} />;
  if (!consentChecked) return <LoadingScreen message="Checking privacy consent..." />;
  if (!hasCurrentConsent) return <ConsentScreen user={user} onAccepted={() => setHasCurrentConsent(true)} onSignOut={signOutAndReturnHome} />;

  function renderTab() {
    switch (tab) {
      case "Dashboard": return <DashboardHome user={user} business={business} setTab={selectTab} />;
      case "Templates": return <TemplatesTab business={business} setTab={setTab} setPrefilledTemplate={setPrefilledTemplate} />;
      case "Setup": return <SetupTab user={user} business={business} setBusiness={setBusiness} prefilledTemplate={prefilledTemplate} setPrefilledTemplate={setPrefilledTemplate} setTab={setTab} setGlobalProducts={setProducts} setGlobalLogoUrl={setLogoUrl} />;
      case "Location": return <BusinessLocationTab business={business} setBusiness={setBusiness} />;
      case "Products": return <ProductsTab user={user} business={business} setGlobalProducts={setProducts} />;
      case "Page": return <PageTab business={business} products={products} logoUrl={logoUrl} />;
      case "Customers": return <CustomersTab business={business} onMessageCustomer={(customer) => { window.history.pushState({}, "", `/messages?customerId=${encodeURIComponent(customer.id)}`); setTab("Messages"); }} />;
      case "FollowUps": return <CustomerFollowUpsTab business={business} />;
      case "Enquiries": return <EnquiriesTab business={business} />;
      case "Messages": return <MessagesTab business={business} />;
      case "Bookings": return <BookingsTab business={business} />;
      case "Sales": case "Money": return <ProductSalesTab business={business} products={products} />;
      case "Expenses": return <ExpensesTab business={business} />;
      case "Reviews": return <ReviewsTab business={business} />;
      case "WhatsAppStatus": return <WhatsAppStatusBuilderTab business={business} products={products} />;
      case "BusinessFile": case "Growth": return <BusinessFileTab business={business} setTab={selectTab} />;
      case "Vuke": return <VukeTab />;
      case "Plans": return <PlansTab />;
      case "Settings": return <SettingsTab onEditBusiness={() => selectTab("Setup")} onEditPublicPage={() => selectTab("Page")} onSignOut={signOutAndReturnHome} />;
      default: return <ComingSoon tab={tab} />;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fbfbfb", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #eeeeea", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><Logo size="small" />{business?.name && <span style={{ fontSize: "12px", color: "#bbb", marginLeft: "2px", display: "none" }} className="desktop-only">· {business.name}</span>}</div><button onClick={signOutAndReturnHome} style={{ fontSize: "12px", color: "#454545", background: "#fff", border: "1px solid #eeeeea", borderRadius: "10px", padding: "7px 12px", cursor: "pointer", fontWeight: 700 }}>Sign out</button></div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 53px)" }}>
        <div style={{ width: "200px", background: "#fff", borderRight: "1px solid #eeeeea", padding: "16px 10px", flexShrink: 0, display: "none" }} id="desktop-sidebar">
          {NAV_GROUPS.map((group, index) => <div key={group.title || `group-${index}`} style={{ marginBottom: index === NAV_GROUPS.length - 1 ? 0 : "18px" }}>{group.title && <div style={{ fontSize: "10px", fontWeight: 800, color: "#a5abb2", margin: "0 12px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{group.title}</div>}{group.items.map((item) => { const Icon = item.icon; const active = tab === item.tab; const badge = badgeForTab(item.tab, notificationCounts); return <button key={item.tab} onClick={() => selectTab(item.tab)} style={{ width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: active ? 800 : 650, background: active ? "#fde8f1" : "transparent", color: active ? BRAND : "#5f6670", border: "none", cursor: "pointer", marginBottom: "3px", display: "flex", alignItems: "center", gap: "12px" }}><Icon size={19} strokeWidth={2.2} color={active ? BRAND : "#767b81"} /><span style={{ flex: 1 }}>{item.label}</span><Badge value={badge} /></button>; })}</div>)}
        </div>

        <div id="dashboard-main-content" style={{ flex: 1, padding: "20px 16px", overflowY: "auto", paddingBottom: "96px" }}>{tab === "Dashboard" && <DashboardAttentionCards counts={notificationCounts} onSelect={selectTab} />}{renderTab()}</div>
      </div>

      <div id="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eeeeea", boxShadow: "0 -10px 30px rgba(15,23,42,0.08)", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>{MOBILE_TABS.map((item) => { const active = item.opensMore ? moreOpen : tab === item.tab; const Icon = item.icon; const badge = item.opensMore ? totalMobileAttention : badgeForTab(item.tab, notificationCounts); return <button key={item.tab} onClick={() => item.opensMore ? setMoreOpen(true) : selectTab(item.tab)} style={{ flex: 1, minHeight: "62px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 4px", border: "none", background: "transparent", cursor: "pointer", gap: "4px" }}><div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: active ? "#fde8f1" : "transparent", position: "relative" }}><Icon size={19} strokeWidth={2.2} color={active ? BRAND : "#767b81"} /><span style={{ position: "absolute", right: "-9px", top: "-8px" }}><Badge value={badge} small /></span></div><div style={{ fontSize: "10px", fontWeight: active ? 800 : 600, color: active ? BRAND : "#767b81", lineHeight: 1 }}>{item.label}</div></button>; })}</div>

      {moreOpen && <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", alignItems: "flex-end" }}><button aria-label="Close menu" onClick={() => setMoreOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(32,32,33,0.36)", border: "none", cursor: "pointer" }} /><div style={{ position: "relative", width: "100%", maxHeight: "86vh", overflowY: "auto", background: "#fff", borderRadius: "24px 24px 0 0", padding: "18px 18px calc(18px + env(safe-area-inset-bottom))", boxShadow: "0 -18px 60px rgba(32,32,33,0.18)" }}><div style={{ width: "44px", height: "4px", borderRadius: "999px", background: "#d4d7db", margin: "0 auto 14px" }} /><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}><div><div style={{ fontSize: "16px", fontWeight: 900, color: DARK }}>More</div><div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Business tools and settings</div></div><button onClick={() => setMoreOpen(false)} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: "999px", width: "36px", height: "36px", color: "#767b81", fontSize: "18px", cursor: "pointer" }}>×</button></div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginBottom: "12px" }}>{MORE_ITEMS.map((item) => { const Icon = item.icon; const active = tab === item.tab; const badge = badgeForTab(item.tab, notificationCounts); return <button key={item.tab} onClick={() => selectTab(item.tab)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "14px", border: `1px solid ${active ? "#f8b8d2" : "#eeeeea"}`, background: active ? "#fde8f1" : "#fff", color: active ? BRAND : "#454545", fontSize: "13px", fontWeight: 800, cursor: "pointer", textAlign: "left" }}><span style={{ width: "32px", height: "32px", borderRadius: "50%", background: active ? "#fff" : "#fbfbfb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}><Icon size={17} strokeWidth={2.2} color={active ? BRAND : "#767b81"} /><span style={{ position: "absolute", right: "-8px", top: "-7px" }}><Badge value={badge} small /></span></span><span style={{ flex: 1 }}>{item.label}</span></button>; })}</div><button onClick={async () => { await supabase.auth.signOut(); setMoreOpen(false); onBack(); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "14px", border: "1px solid #eeeeea", background: "#fbfbfb", color: "#454545", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}><LogOut size={17} strokeWidth={2.2} />Sign out</button></div></div>}

      <style>{`@media (min-width: 900px) { #desktop-sidebar { display: block !important; } #mobile-bottom-nav { display: none !important; } #dashboard-main-content { padding-bottom: 24px !important; } } @media (max-width: 899px) { #desktop-sidebar { display: none !important; } #mobile-bottom-nav { display: flex !important; } #dashboard-main-content { padding-bottom: 96px !important; } }`}</style>
    </div>
  );
}

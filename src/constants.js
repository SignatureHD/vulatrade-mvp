// ── DESIGN TOKENS ──────────────────────────────────────────
export const PINK = "#ea4c89";
export const PINK_DARK = "#d93f7b";
export const SOFT_PINK = "#fde8f1";
export const LIGHT_PINK_BORDER = "#f8b8d2";
export const VERY_LIGHT_PINK = "#fff5f9";

// Kept as a compatibility alias for existing components.
export const LIME = PINK;
export const DARK = "#202021";
export const PALE_GREEN = SOFT_PINK;
export const OFF_WHITE = "#fbfbfb";
export const SOFT_BORDER = "#eeeeea";
export const MAX_IMAGES = 6;

export const inputStyle = {
  border: `1.5px solid ${SOFT_BORDER}`,
  borderRadius: "14px",
  padding: "13px 15px",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  background: "#fff",
  color: DARK,
};

export const labelStyle = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#454545",
  marginBottom: "7px",
  display: "block",
};

// ── TABS ───────────────────────────────────────────────────
export const TABS = [
  "Dashboard", "Page", "Setup", "Products", "Customers",
  "Bookings", "Sales", "Expenses", "Reviews",
  "BusinessFile", "Vuke", "Plans", "Settings",
];

// ── PLAN CONFIG ────────────────────────────────────────────
// Simulate user plan — swap this out when Plans tab is live
// "free" | "starter" | "pro"
export const USER_PLAN = "free";

export const PLAN_RANK = { free: 0, starter: 1, pro: 2 };

export function isPlanLocked(requiredPlan) {
  return PLAN_RANK[USER_PLAN] < PLAN_RANK[requiredPlan];
}

export function planLabel(plan) {
  if (plan === "starter") return "Starter";
  if (plan === "pro") return "Pro";
  return "";
}

// ── COLOUR & FONT TIERS ────────────────────────────────────
export const BG_COLOURS = [
  { name: "Vula Pink", value: PINK, text: "#ffffff", accent: SOFT_PINK, plan: "free" },
  { name: "Charcoal",   value: DARK, text: "#ffffff", accent: PINK, plan: "free" },
  { name: "Soft Pink", value: SOFT_PINK, text: DARK, accent: PINK, plan: "free" },
  { name: "Coral",  value: "#7a2020", text: "#ffffff", accent: "#f9a8a8", plan: "starter" },
  { name: "Warm",   value: "#1a0f0a", text: "#ffffff", accent: "#f0a050", plan: "starter" },
  { name: "Slate",  value: "#1a1f2e", text: "#ffffff", accent: "#90c0f0", plan: "starter" },
  { name: "Purple", value: "#2a1040", text: "#ffffff", accent: "#c4a0f7", plan: "pro" },
  { name: "Cream",  value: "#fdfcf7", text: "#202021", accent: "#3d7a00", plan: "pro" },
];

export const FONTS = [
  { name: "Clean",    value: "Inter",              label: "Inter",             sample: "Aa", plan: "free",    import: null },
  { name: "Friendly", value: "'DM Sans'",           label: "DM Sans",           sample: "Aa", plan: "starter", import: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&display=swap" },
  { name: "Elegant",  value: "'Playfair Display'",  label: "Playfair Display",  sample: "Aa", plan: "pro",     import: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&display=swap" },
];

// ── CATEGORIES & PAYMENT ───────────────────────────────────
export const CATEGORIES = [
  "Nail Tech", "Hair & Extensions", "Barber", "Food Seller",
  "Fresh Produce", "Cleaning", "Tutoring", "Delivery",
  "Photography", "Catering", "Phone Repairs", "Other",
];

export const PAYMENT_METHODS = [
  "Cash", "EFT", "Card", "Yoco", "PayFast", "Other",
];

export const PAYMENT_STATUSES = [
  "Paid", "Unpaid", "Deposit paid",
];

export const ICON_TEMPLATES = {
  "Nail Tech":         ["💅","✨","💜","🌸","🦋"],
  "Hair & Extensions": ["💇","👑","🌟","💫","🎀"],
  "Barber":            ["✂️","💈","🪒","⚡","🔥"],
  "Food Seller":       ["🍱","🍳","🥘","🔥","⭐"],
  "Fresh Produce":     ["🥬","🌿","🍅","🌱","💚"],
  "Cleaning":          ["🧹","✨","🫧","💎","🌟"],
  "Tutoring":          ["📚","🎓","⭐","💡","🧠"],
  "Delivery":          ["🛵","⚡","🚀","📦","💨"],
  "Photography":       ["📸","🎨","✨","🌟","🎭"],
  "Catering":          ["🍽️","👨‍🍳","⭐","🥂","🎉"],
  "Phone Repairs":     ["📱","⚡","🔧","💻","🛠️"],
  "Other":             ["⭐","💫","✨","🌟","💎"],
};

export const PRODUCT_ICONS = [
  "🛍️","⭐","✨","💎","🔥","💅","✂️","🍱","🧹","📚",
  "🛵","📸","🍽️","📱","🥬","💆","💪","🎁","🧴","💊",
];

// ── CUSTOMER STATUSES ──────────────────────────────────────
export const CUSTOMER_STATUSES = [
  { value: "lead",    label: "Lead",    color: "#767b81", bg: "#f8f8f8", border: "#d4d7db", desc: "Interested but hasn't booked yet" },
  { value: "new",     label: "New",     color: DARK, bg: SOFT_PINK, border: LIGHT_PINK_BORDER, desc: "Booked once" },
  { value: "regular", label: "Regular", color: PINK_DARK, bg: SOFT_PINK, border: PINK, desc: "Comes back regularly" },
  { value: "vip",     label: "VIP",     color: "#202021", bg: "#fff8e7", border: "#ffb60a", desc: "Your best customers" },
];

export function statusConfig(val) {
  return CUSTOMER_STATUSES.find((s) => s.value === val) || CUSTOMER_STATUSES[1];
}

// ── BOOKING TIMES ──────────────────────────────────────────
export const BOOKING_TIMES = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00",
];

export const BOOKING_STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: DARK, bg: SOFT_PINK,  border: LIGHT_PINK_BORDER },
  done:      { label: "Done",      color: PINK_DARK, bg: SOFT_PINK,  border: PINK },
  cancelled: { label: "Cancelled", color: "#cc3300", bg: "#fff5f5",  border: "#ffd0d0" },
};

// ── CONTACT PICKER ─────────────────────────────────────────
export const CONTACT_PICKER_SUPPORTED =
  typeof navigator !== "undefined" &&
  "contacts" in navigator &&
  "ContactsManager" in window;

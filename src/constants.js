// Design tokens
export const PINK = "#ea4c89";
export const PINK_DARK = "#d93f7b";
export const SOFT_PINK = "#fde8f1";
export const LIGHT_PINK_BORDER = "#f8b8d2";
export const VERY_LIGHT_PINK = "#fff5f9";
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

export const TABS = ["Dashboard", "Page", "Setup", "Products", "Customers", "Messages", "Bookings", "Sales", "Expenses", "Reviews", "BusinessFile", "Vuke", "Plans", "Settings"];
export const USER_PLAN = "free";
export const PLAN_RANK = { free: 0, starter: 1, pro: 2 };
export const PILOT_UNLOCK_ALL_VISUALS = true;
export function isPlanLocked(requiredPlan) { return PILOT_UNLOCK_ALL_VISUALS ? false : PLAN_RANK[USER_PLAN] < PLAN_RANK[requiredPlan]; }
export function planLabel(plan) { if (plan === "starter") return "Starter"; if (plan === "pro") return "Pro"; return ""; }

export const BG_COLOURS = [
  { name: "Vula Pink", value: PINK, text: "#ffffff", accent: SOFT_PINK, plan: "free" },
  { name: "Charcoal", value: "#111214", text: "#ffffff", accent: PINK, plan: "free" },
  { name: "Soft Pink", value: SOFT_PINK, text: DARK, accent: PINK, plan: "free" },
  { name: "Coral", value: "#7a2020", text: "#ffffff", accent: "#f9a8a8", plan: "starter" },
  { name: "Warm", value: "#5a2f21", text: "#ffffff", accent: "#f4a261", plan: "starter" },
  { name: "Slate", value: "#24384f", text: "#ffffff", accent: "#9ed0ff", plan: "starter" },
  { name: "Purple", value: "#2a1040", text: "#ffffff", accent: "#c4a0f7", plan: "pro" },
  { name: "Cream", value: "#fff1d6", text: DARK, accent: "#b7791f", plan: "pro" },
  { name: "Soft Waves", value: "radial-gradient(circle at 0% 0%, rgba(234,76,137,0.25), transparent 32%), radial-gradient(circle at 100% 20%, rgba(248,184,210,0.34), transparent 28%), #fffafc", text: DARK, accent: PINK, plan: "starter" },
  { name: "Diagonal Lines", value: "repeating-linear-gradient(135deg, rgba(234,76,137,0.13) 0 8px, rgba(255,255,255,0.92) 8px 18px), #ffffff", text: DARK, accent: PINK, plan: "pro" },
  { name: "Soft Texture", value: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22), transparent 18%), radial-gradient(circle at 80% 0%, rgba(234,76,137,0.18), transparent 22%), linear-gradient(135deg, #202021 0%, #2c2230 100%)", text: "#ffffff", accent: LIGHT_PINK_BORDER, plan: "pro" },
];

export const CUSTOM_BACKGROUND_OVERLAYS = [
  { value: "light", label: "Light", alpha: 0.28 },
  { value: "medium", label: "Medium", alpha: 0.46 },
  { value: "dark", label: "Dark", alpha: 0.62 },
];

export const CUSTOM_BACKGROUND_POSITIONS = [
  { value: "center", label: "Centre", css: "center center" },
  { value: "top", label: "Top", css: "center top" },
  { value: "bottom", label: "Bottom", css: "center bottom" },
];

export const CUSTOM_BACKGROUND_ZOOMS = [
  { value: "normal", label: "Normal", css: "cover" },
  { value: "zoomed", label: "Zoomed", css: "115% auto" },
  { value: "close", label: "Close-up", css: "135% auto" },
];

export const CUSTOM_TEXT_COLOURS = [
  { value: "white", label: "White", css: "#ffffff" },
  { value: "charcoal", label: "Charcoal", css: DARK },
  { value: "grey", label: "Soft Grey", css: "#e7e7e7" },
  { value: "cream", label: "Cream", css: "#fff1d6" },
  { value: "pink", label: "Vula Pink", css: PINK },
];

export const CUSTOM_BACKGROUND_DEFAULTS = {
  type: "custom-photo",
  url: "",
  overlay: "medium",
  position: "center",
  zoom: "normal",
  textColour: "white",
};

export function isCustomBackgroundTheme(value) {
  if (!value || typeof value !== "string") return false;
  try {
    return JSON.parse(value)?.type === "custom-photo";
  } catch {
    return false;
  }
}

export function parseCustomBackgroundTheme(value) {
  if (!isCustomBackgroundTheme(value)) return { ...CUSTOM_BACKGROUND_DEFAULTS };
  try {
    const parsed = JSON.parse(value);
    return { ...CUSTOM_BACKGROUND_DEFAULTS, ...parsed };
  } catch {
    return { ...CUSTOM_BACKGROUND_DEFAULTS };
  }
}

export function createCustomBackgroundThemeValue(settings = {}) {
  const clean = { ...CUSTOM_BACKGROUND_DEFAULTS, ...settings, type: "custom-photo" };
  return JSON.stringify(clean);
}

export function resolveBackgroundTheme(savedTheme, fallbackAccent = PINK) {
  const custom = parseCustomBackgroundTheme(savedTheme);
  if (custom.url) {
    const overlay = CUSTOM_BACKGROUND_OVERLAYS.find((item) => item.value === custom.overlay) || CUSTOM_BACKGROUND_OVERLAYS[1];
    const position = CUSTOM_BACKGROUND_POSITIONS.find((item) => item.value === custom.position) || CUSTOM_BACKGROUND_POSITIONS[0];
    const zoom = CUSTOM_BACKGROUND_ZOOMS.find((item) => item.value === custom.zoom) || CUSTOM_BACKGROUND_ZOOMS[0];
    const textColour = CUSTOM_TEXT_COLOURS.find((item) => item.value === custom.textColour) || CUSTOM_TEXT_COLOURS[0];
    const shade = `rgba(0,0,0,${overlay.alpha})`;
    return {
      name: "Custom Photo",
      value: shade,
      text: textColour.css,
      accent: fallbackAccent,
      isCustomPhoto: true,
      backgroundImage: `linear-gradient(135deg, ${shade}, ${shade}), url("${custom.url}")`,
      backgroundPosition: position.css,
      backgroundSize: zoom.css,
      backgroundRepeat: "no-repeat",
    };
  }

  const savedLower = typeof savedTheme === "string" ? savedTheme.toLowerCase() : "";
  const matched = BG_COLOURS.find((c) => c.value === savedTheme || c.name.toLowerCase() === savedLower);
  if (matched) return matched;
  if (savedTheme && typeof savedTheme === "string" && savedTheme.startsWith("#")) {
    return { value: DARK, text: "#ffffff", accent: savedTheme };
  }
  return { value: DARK, text: "#ffffff", accent: fallbackAccent };
}

export function backgroundStyleForTheme(theme) {
  if (theme?.isCustomPhoto) {
    return {
      backgroundColor: DARK,
      backgroundImage: theme.backgroundImage,
      backgroundPosition: theme.backgroundPosition,
      backgroundSize: theme.backgroundSize,
      backgroundRepeat: theme.backgroundRepeat || "no-repeat",
    };
  }
  return { background: theme?.value || DARK };
}

export const FONTS = [
  { name: "Clean", value: "Inter", label: "Inter", sample: "Aa", plan: "free", import: null },
  { name: "Friendly", value: "'DM Sans'", label: "DM Sans", sample: "Aa", plan: "starter", import: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap" },
  { name: "Elegant", value: "'Playfair Display'", label: "Playfair Display", sample: "Aa", plan: "pro", import: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800;900&display=swap" },
];

export const CATEGORIES = [
  "Nail Tech", "Hair & Extensions", "Barber", "Food Seller", "Fresh Produce",
  "Fashion & Clothing", "Clothing", "Fragrance / Home Scent", "Cleaning",
  "Tutoring", "Delivery", "Photography", "Catering", "Phone Repairs", "Other",
];

export const PAYMENT_METHODS = ["Cash", "EFT", "Card", "Yoco", "PayFast", "Other"];
export const PAYMENT_STATUSES = ["Paid", "Unpaid", "Deposit paid"];

export const ICON_TEMPLATES = {
  "Nail Tech": ["💅", "✨", "💜", "🌸", "🦋"],
  "Hair & Extensions": ["💇", "👑", "🌟", "💫", "🎀"],
  "Barber": ["✂️", "💈", "🪒", "⚡", "🔥"],
  "Food Seller": ["🍱", "🍳", "🥘", "🔥", "⭐"],
  "Fresh Produce": ["🥬", "🌿", "🍅", "🌱", "💚"],
  "Fashion & Clothing": ["👗", "👕", "👟", "🧥", "🛍️"],
  "Clothing": ["👕", "👗", "👟", "🧥", "🛍️"],
  "Fragrance / Home Scent": ["✨", "🧴", "🌸", "🚗", "🏠"],
  "Cleaning": ["🧹", "✨", "🫧", "💎", "🌟"],
  "Tutoring": ["📚", "🎓", "⭐", "💡", "🧠"],
  "Delivery": ["🛵", "⚡", "🚀", "📦", "💨"],
  "Photography": ["📸", "🎨", "✨", "🌟", "🎭"],
  "Catering": ["🍽️", "👨‍🍳", "⭐", "🥂", "🎉"],
  "Phone Repairs": ["📱", "⚡", "🔧", "💻", "🛠️"],
  "Other": ["⭐", "💫", "✨", "🌟", "💎"],
};

export const PRODUCT_ICONS = ["🛍️", "👗", "👕", "👟", "🧥", "👜", "💍", "⭐", "✨", "💎", "🔥", "💅", "✂️", "🍱", "🧹", "📚", "🛵", "📸", "🍽️", "📱", "🥬", "💆", "💪", "🎁", "🧴", "💊"];

export const CUSTOMER_STATUSES = [
  { value: "lead", label: "Lead", color: "#767b81", bg: "#f8f8f8", border: "#d4d7db", desc: "Interested but hasn't booked yet" },
  { value: "new", label: "New", color: DARK, bg: SOFT_PINK, border: LIGHT_PINK_BORDER, desc: "Booked once" },
  { value: "regular", label: "Regular", color: PINK_DARK, bg: SOFT_PINK, border: PINK, desc: "Comes back regularly" },
  { value: "vip", label: "VIP", color: DARK, bg: "#fff8e7", border: "#ffb60a", desc: "Your best customers" },
];

export function statusConfig(val) { return CUSTOMER_STATUSES.find((s) => s.value === val) || CUSTOMER_STATUSES[1]; }

export const BOOKING_TIMES = ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];

export const BOOKING_STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: DARK, bg: SOFT_PINK, border: LIGHT_PINK_BORDER },
  done: { label: "Done", color: PINK_DARK, bg: SOFT_PINK, border: PINK },
  cancelled: { label: "Cancelled", color: "#cc3300", bg: "#fff5f5", border: "#ffd0d0" },
};

export const CONTACT_PICKER_SUPPORTED = typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window;
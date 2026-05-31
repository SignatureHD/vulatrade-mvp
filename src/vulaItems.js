export const VULA_ITEM_TYPES = {
  standard_stock: { value: "standard_stock", behaviour: "counter", label: "Products in stock", shortLabel: "Stock item", description: "For items you keep and sell until they are finished.", examples: "Clothes, shoes, perfume, electronics", buttonLabel: "Ask if available", enquiryType: "stock_enquiry" },
  daily_stock: { value: "daily_stock", behaviour: "counter", label: "Fresh or daily stock", shortLabel: "Daily stock", description: "For items you make or sell fresh each day.", examples: "Kotas, bread, muffins, cooked meals", buttonLabel: "Order today", enquiryType: "daily_order" },
  service: { value: "service", behaviour: "agreement", label: "Services people book", shortLabel: "Service", description: "For work that needs a date or time.", examples: "Hair, nails, tutoring, repairs", buttonLabel: "Book this service", enquiryType: "booking_request" },
  made_to_order: { value: "made_to_order", behaviour: "agreement", label: "Made-to-order", shortLabel: "Made to order", description: "For items made after the customer orders.", examples: "Cakes, catering, custom clothing, party packs", buttonLabel: "Request order", enquiryType: "custom_order_request" },
};

export const VULA_ITEM_TYPE_OPTIONS = Object.values(VULA_ITEM_TYPES);
export const VULA_META_MARKER = "__vula_meta";
export const VULA_DESC_META_START = "\n<!--VULA_ITEM_META:";
export const VULA_DESC_META_END = ":VULA_ITEM_META-->";

export const DEFAULT_SERVICE_AVAILABILITY = [
  { day: "Monday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Tuesday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Wednesday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Thursday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Friday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Saturday", enabled: false, start: "09:00", end: "13:00" },
  { day: "Sunday", enabled: false, start: "09:00", end: "13:00" },
  { day: "Public holidays", enabled: false, start: "09:00", end: "13:00" },
];

export const DEFAULT_VULA_META = {
  item_type: "standard_stock",
  track_stock: false,
  stock_quantity: "",
  today_stock_quantity: "",
  today_stock_date: "",
  selling_today: true,
  show_when_sold_out: true,
  allow_preorders: false,
  duration_minutes: "60",
  buffer_minutes: "0",
  working_days: "",
  working_hours: "",
  availability: DEFAULT_SERVICE_AVAILABILITY,
  lead_time_days: "3",
  max_orders_per_day: "",
  max_orders_per_week: "",
  deposit_required: false,
  deposit_amount: "",
  item_code: "",
  collection_available: true,
  delivery_available: false,
  customer_details_needed: "",
};

export function todayIsoDate() { return new Date().toISOString().slice(0, 10); }
export function normaliseItemType(value) { return VULA_ITEM_TYPES[value] ? value : "standard_stock"; }
export function itemTypeConfig(value) { return VULA_ITEM_TYPES[normaliseItemType(value)]; }

export function separateMetaVariants(variants = []) {
  const list = Array.isArray(variants) ? variants : [];
  const metaVariant = list.find((variant) => variant && variant[VULA_META_MARKER]);
  return { meta: metaVariant?.meta || {}, variants: list.filter((variant) => !(variant && variant[VULA_META_MARKER])) };
}

export function buildMetaVariant(meta = {}) { return { [VULA_META_MARKER]: true, id: "vula-meta", name: "", price: "", description: "", meta }; }
export function withVulaMetaVariants(variants = [], meta = {}) { return [...separateMetaVariants(variants).variants, buildMetaVariant(meta)]; }

export function splitVulaDescription(description = "") {
  const text = String(description || "");
  const startIndex = text.indexOf(VULA_DESC_META_START);
  if (startIndex < 0) return { cleanDescription: text, meta: {} };
  const endIndex = text.indexOf(VULA_DESC_META_END, startIndex);
  if (endIndex < 0) return { cleanDescription: text, meta: {} };
  const encoded = text.slice(startIndex + VULA_DESC_META_START.length, endIndex);
  const before = text.slice(0, startIndex).trimEnd();
  const after = text.slice(endIndex + VULA_DESC_META_END.length).trimStart();
  try { return { cleanDescription: `${before}${after ? `\n${after}` : ""}`.trim(), meta: JSON.parse(decodeURIComponent(encoded)) || {} }; }
  catch { return { cleanDescription: `${before}${after ? `\n${after}` : ""}`.trim(), meta: {} }; }
}

export function cleanVulaDescription(description = "") { return splitVulaDescription(description).cleanDescription; }
export function descriptionWithVulaMeta(description = "", meta = {}) { return `${cleanVulaDescription(description).trim()}${VULA_DESC_META_START}${encodeURIComponent(JSON.stringify(meta))}${VULA_DESC_META_END}`; }

function normalizeAvailability(value) {
  const rows = Array.isArray(value) && value.length ? value : DEFAULT_SERVICE_AVAILABILITY;
  const byDay = Object.fromEntries(rows.map((row) => [row.day, row]));
  return DEFAULT_SERVICE_AVAILABILITY.map((row) => ({ ...row, ...(byDay[row.day] || {}) }));
}

export function extractVulaMeta(product = {}) {
  const variantMeta = separateMetaVariants(product.variants || []).meta;
  const descriptionMeta = splitVulaDescription(product.description || "").meta;
  const merged = { ...DEFAULT_VULA_META, ...descriptionMeta, ...variantMeta };
  return {
    ...merged,
    item_type: normaliseItemType(product.item_type || merged.item_type),
    track_stock: product.track_stock ?? merged.track_stock,
    stock_quantity: product.stock_quantity ?? merged.stock_quantity,
    today_stock_quantity: product.today_stock_quantity ?? merged.today_stock_quantity,
    today_stock_date: product.today_stock_date ?? merged.today_stock_date,
    selling_today: product.selling_today ?? merged.selling_today,
    show_when_sold_out: product.show_when_sold_out ?? merged.show_when_sold_out,
    allow_preorders: product.allow_preorders ?? merged.allow_preorders,
    duration_minutes: product.duration_minutes ?? merged.duration_minutes,
    buffer_minutes: product.buffer_minutes ?? merged.buffer_minutes,
    working_days: product.working_days ?? merged.working_days,
    working_hours: product.working_hours ?? merged.working_hours,
    availability: normalizeAvailability(product.availability ?? merged.availability),
    lead_time_days: product.lead_time_days ?? merged.lead_time_days,
    max_orders_per_day: product.max_orders_per_day ?? merged.max_orders_per_day,
    max_orders_per_week: product.max_orders_per_week ?? merged.max_orders_per_week,
    deposit_required: product.deposit_required ?? merged.deposit_required,
    deposit_amount: product.deposit_amount ?? merged.deposit_amount,
    item_code: product.item_code ?? merged.item_code,
    collection_available: product.collection_available ?? merged.collection_available,
    delivery_available: product.delivery_available ?? merged.delivery_available,
    customer_details_needed: product.customer_details_needed ?? merged.customer_details_needed,
  };
}

export function moneyLabel(value) { const amount = Number(value || 0); return amount > 0 ? `R${amount.toLocaleString()}` : "Ask price"; }
export function itemActionLabel(product = {}) { return itemTypeConfig(extractVulaMeta(product).item_type).buttonLabel; }
export function currentStockValue(product = {}) { const meta = extractVulaMeta(product); if (meta.item_type === "daily_stock") return Number(meta.today_stock_quantity || 0); if (meta.item_type === "standard_stock" && meta.track_stock) return Number(meta.stock_quantity || 0); return null; }
export function isSoldOut(product = {}) { if (product.is_sold_out === true) return true; const stock = currentStockValue(product); return stock !== null && stock <= 0; }

export function formatAvailability(meta = {}) {
  const rows = normalizeAvailability(meta.availability);
  const open = rows.filter((row) => row.enabled);
  if (!open.length) return "by arrangement";
  return open.map((row) => `${row.day} ${row.start}-${row.end}`).join(", ");
}

export function buildItemWhatsAppMessage({ businessName, product, variant, customerName = "", customerPhone = "", neededByDate = "", preferredDate = "", preferredTime = "", notes = "" }) {
  const meta = extractVulaMeta(product); const type = meta.item_type; const itemName = variant?.name ? `${product.name} - ${variant.name}` : product.name; const price = variant?.price ?? product.price; const who = customerName ? `\nMy name is ${customerName}.` : ""; const phone = customerPhone ? `\nMy WhatsApp number is ${customerPhone}.` : ""; const noteLine = notes ? `\nNotes: ${notes}` : "";
  if (type === "daily_stock") return `Hi ${businessName}, I would like to order ${itemName} today.\nPrice: ${moneyLabel(price)}${who}${phone}${noteLine}\nPlease let me know if it is still available.`;
  if (type === "service") return `Hi ${businessName}, I would like to book ${itemName}.\nPrice: ${moneyLabel(price)}${preferredDate ? `\nPreferred date: ${preferredDate}` : ""}${preferredTime ? `\nPreferred time: ${preferredTime}` : ""}${who}${phone}${noteLine}\nPlease let me know what times are available.`;
  if (type === "made_to_order") return `Hi ${businessName}, I would like to order ${itemName}.\nStarting price: ${moneyLabel(price)}${neededByDate ? `\nNeeded by: ${neededByDate}` : ""}${who}${phone}${noteLine}\nPlease send me more details.`;
  return `Hi ${businessName}, I saw ${itemName} on your VulaTrade page.\nPrice: ${moneyLabel(price)}${who}${phone}${noteLine}\nPlease let me know if this is still available.`;
}

export function buildReplySuggestion(product = {}) {
  const meta = extractVulaMeta(product); const price = moneyLabel(product.price); const stock = currentStockValue(product);
  if (meta.item_type === "daily_stock") { if (stock !== null && stock <= 0) return `Hi, today’s stock for ${product.name} is sold out. I can let you know when more is available.`; if (stock !== null) return `Hi, yes, ${product.name} is available today. I still have ${stock} left. The price is ${price}.`; return `Hi, yes, ${product.name} is available today. The price is ${price}.`; }
  if (meta.item_type === "service") { const duration = meta.duration_minutes ? ` and takes about ${meta.duration_minutes} minutes` : ""; const deposit = meta.deposit_required ? ` A deposit of ${moneyLabel(meta.deposit_amount)} is required to confirm.` : ""; return `Hi, yes, I can help with ${product.name}. The price is ${price}${duration}. I am usually available ${formatAvailability(meta)}.${deposit}`; }
  if (meta.item_type === "made_to_order") { const lead = meta.lead_time_days ? ` I need ${meta.lead_time_days} day(s) notice.` : ""; const deposit = meta.deposit_required ? ` A deposit of ${moneyLabel(meta.deposit_amount)} is required to confirm.` : ""; return `Hi, yes, I can help with ${product.name}.${lead} The starting price is ${price}.${deposit}`; }
  if (stock !== null && stock <= 0) return `Hi, ${product.name} is sold out at the moment. I can let you know when I get more stock.`;
  if (stock !== null) return `Hi, yes, ${product.name} is available. I have ${stock} left. The price is ${price}.`;
  return `Hi, yes, ${product.name} is available. The price is ${price}.`;
}

export function leadTimeWarning(product = {}, neededByDate = "") {
  const meta = extractVulaMeta(product); if (meta.item_type !== "made_to_order" || !neededByDate || !meta.lead_time_days) return ""; const needed = new Date(`${neededByDate}T00:00:00`); if (Number.isNaN(needed.getTime())) return ""; const earliest = new Date(); earliest.setHours(0, 0, 0, 0); earliest.setDate(earliest.getDate() + Number(meta.lead_time_days || 0)); if (needed < earliest) return `This may be too soon. This Vula usually needs ${meta.lead_time_days} day(s) notice.`; return "";
}

export const FASHION_CATEGORY = "Fashion & Clothing";
export const FASHION_MARKER = "Fashion details";

export function isFashionBusiness(category = "") {
  return /(fashion|clothing|clothes|shoe|sneaker|bag|jewellery|jewelry|accessor|thrift|streetwear|uniform|tailor|boutique)/i.test(category || "");
}

export function parseFashionDescription(description = "") {
  const text = String(description || "");
  const index = text.indexOf(`[${FASHION_MARKER}]`);
  if (index === -1) return { cleanDescription: text.trim(), details: {} };

  const cleanDescription = text.slice(0, index).trim();
  const lines = text.slice(index).split("\n").slice(1);
  const details = {};

  lines.forEach((line) => {
    const parts = line.split(":");
    const key = (parts.shift() || "").trim();
    const value = parts.join(":").trim();
    if (!key || !value) return;
    if (key === "Sizes") details.sizes = value;
    if (key === "Colours") details.colours = value;
    if (key === "Stock") details.stock = value;
    if (key === "Condition") details.condition = value;
    if (key === "Gender") details.gender = value;
    if (key === "Fit") details.fit = value;
    if (key === "Collection") details.collectionArea = value;
    if (key === "Delivery") details.delivery = value;
    if (key === "WhatsApp") details.whatsappText = value;
  });

  return { cleanDescription, details };
}

export function buildFashionDescription(description = "", details = {}) {
  const cleanDescription = parseFashionDescription(description).cleanDescription;
  const rows = [
    details.sizes ? `Sizes: ${details.sizes}` : "",
    details.colours ? `Colours: ${details.colours}` : "",
    details.stock ? `Stock: ${details.stock}` : "",
    details.condition ? `Condition: ${details.condition}` : "",
    details.gender ? `Gender: ${details.gender}` : "",
    details.fit ? `Fit: ${details.fit}` : "",
    details.collectionArea ? `Collection: ${details.collectionArea}` : "",
    details.delivery ? `Delivery: ${details.delivery}` : "",
    details.whatsappText ? `WhatsApp: ${details.whatsappText}` : "",
  ].filter(Boolean);

  if (rows.length === 0) return cleanDescription;
  return `${cleanDescription}\n[${FASHION_MARKER}]\n${rows.join("\n")}`;
}

export function readFashionDetails(product = {}) {
  const parsed = parseFashionDescription(product.description || "").details;
  return {
    sizes: product.sizes || product.size_options || product.sizeOptions || parsed.sizes || "",
    colours: product.colours || product.colors || product.colour_options || product.color_options || product.colourOptions || parsed.colours || "",
    stock: product.stock_quantity || product.stock || product.quantity || parsed.stock || "",
    condition: product.condition || parsed.condition || "",
    gender: product.gender || parsed.gender || "",
    fit: product.fit || parsed.fit || "",
    collectionArea: product.collection_area || product.collectionArea || parsed.collectionArea || "",
    delivery: product.delivery_available || product.deliveryAvailable || product.delivery || parsed.delivery || "",
    whatsappText: product.whatsapp_order_message || product.whatsappOrderMessage || parsed.whatsappText || "",
  };
}

export function availabilityLabel(product = {}) {
  const stock = readFashionDetails(product).stock;
  if (!stock) return "Available";
  const numericStock = Number(stock);
  if (!Number.isNaN(numericStock)) return numericStock > 0 ? `${numericStock} available` : "Sold out";
  return String(stock);
}

export function listFromText(value = "") {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

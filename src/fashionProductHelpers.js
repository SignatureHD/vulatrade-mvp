export const FASHION_CATEGORY = "Fashion & Clothing";

export function isFashionBusiness(category = "") {
  return /(fashion|clothing|clothes|shoe|sneaker|bag|jewellery|jewelry|accessor|thrift|streetwear|uniform|tailor|boutique)/i.test(category || "");
}

export function readFashionDetails(product = {}) {
  return {
    sizes: product.sizes || product.size_options || product.sizeOptions || "",
    colours: product.colours || product.colors || product.colour_options || product.color_options || product.colourOptions || "",
    stock: product.stock_quantity || product.stock || product.quantity || "",
    condition: product.condition || "",
    gender: product.gender || "",
    fit: product.fit || "",
    collectionArea: product.collection_area || product.collectionArea || "",
    delivery: product.delivery_available || product.deliveryAvailable || product.delivery || "",
  };
}

export function availabilityLabel(product = {}) {
  const stock = readFashionDetails(product).stock;
  if (!stock) return "Available";
  const numericStock = Number(stock);
  if (!Number.isNaN(numericStock)) return numericStock > 0 ? `${numericStock} available` : "Sold out";
  return String(stock);
}

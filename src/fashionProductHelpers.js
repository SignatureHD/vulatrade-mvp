export const FASHION_CATEGORY = "Fashion & Clothing";

export function isFashionBusiness(category = "") {
  return /(fashion|clothing|clothes|shoe|sneaker|bag|jewellery|jewelry|accessor|thrift|streetwear|uniform|tailor|boutique)/i.test(category || "");
}

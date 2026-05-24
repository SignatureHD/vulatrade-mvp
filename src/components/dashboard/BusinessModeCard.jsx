import React, { useMemo, useState } from "react";
import { Copy, MessageCircle, Shirt, Sparkles } from "lucide-react";
import { DARK } from "../../constants";

const BRAND = "#ea4c89";

const CLOTHING_CATEGORY_PATTERN = /clothing|clothes|fashion|thrift|pre-loved|preloved|apparel|boutique|tailor|seamstress/i;
const FOOD_CATEGORY_PATTERN = /food|meal|meals|catering|restaurant|takeaway|take away|kitchen|cook|cooked|lunch|dinner|breakfast|snack|bakery|baking|cakes|kota|chisa|shisa|braai/i;

const CLOTHING_WORDS = [
  "clothing", "clothes", "dress", "dresses", "jeans", "denim", "jacket", "hoodie", "shirt", "t-shirt", "tee", "sneaker", "sneakers", "shoe", "shoes", "boots", "apparel", "outfit", "pre-loved", "preloved", "thrift", "fashion", "ladieswear", "menswear", "kidswear", "winter wear", "summer wear"
];

const FOOD_WORDS = [
  "food", "meal", "meals", "lunch", "dinner", "breakfast", "cooked", "cook", "plate", "plates", "portion", "special", "kota", "burger", "chips", "chicken", "beef", "rice", "pap", "vetkoek", "amagwinya", "sandwich", "salad", "soup", "catering", "takeaway", "take away", "collection", "order", "reserved", "reserve"
];

function combinedProductText(products = []) {
  return products.map((product) => `${product.name || ""} ${product.description || ""} ${product.category || ""}`).join(" ").toLowerCase();
}

function countMatches(text, words) {
  if (!text.trim()) return 0;
  return words.filter((word) => text.includes(word)).length;
}

function clothingScore(products = []) {
  const text = combinedProductText(products);
  const matches = countMatches(text, CLOTHING_WORDS);
  return Math.min(100, Math.round((matches / 5) * 100));
}

function foodScore(products = []) {
  const text = combinedProductText(products);
  const matches = countMatches(text, FOOD_WORDS);
  return Math.min(100, Math.round((matches / 5) * 100));
}

function isClothingProduct(product) {
  const text = `${product?.name || ""} ${product?.description || ""} ${product?.category || ""}`.toLowerCase();
  const clothingMatches = countMatches(text, CLOTHING_WORDS);
  const foodMatches = countMatches(text, FOOD_WORDS);
  return clothingMatches > 0 && clothingMatches >= foodMatches;
}

function bestClothingProduct(products = []) {
  return products.find((product) => product?.name && isClothingProduct(product)) || products.find((product) => product?.name) || null;
}

function buildClothingCaption(product, business) {
  const name = product?.name || "New clothing item";
  const price = Number(product?.price || 0);
  const description = product?.description ? ` ${product.description}` : "";
  const area = business?.area ? ` Collection in ${business.area}.` : "";
  const priceText = price > 0 ? ` R${price.toLocaleString("en-ZA")}.` : " Price available on request.";
  return `${name} available.${description}${priceText}${area} WhatsApp me to reserve.`;
}

export function BusinessModeCard({ business, products = [], onAddClothingItem }) {
  const [copied, setCopied] = useState(false);
  const score = useMemo(() => clothingScore(products), [products]);
  const foodConfidence = useMemo(() => foodScore(products), [products]);
  const isClothingBusiness = CLOTHING_CATEGORY_PATTERN.test(business?.category || "");
  const isFoodBusiness = FOOD_CATEGORY_PATTERN.test(business?.category || "") || foodConfidence >= 40;
  const detected = (isClothingBusiness || score >= 40) && !isFoodBusiness;
  const product = bestClothingProduct(products);
  const caption = buildClothingCaption(product, business);

  async function copyCaption() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      return;
    }
    window.prompt("Copy your WhatsApp Status caption:", caption);
  }

  function openWhatsAppStatusHelper() {
    const encoded = encodeURIComponent(caption);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
  }

  if (!detected || products.length === 0) return null;

  return (
    <div style={{ background:"#fff5f9", border:"1.5px solid #f8b8d2", borderRadius:"20px", padding:"18px", marginBottom:"18px" }}>
      <div style={{ display:"flex", gap:"12px", alignItems:"flex-start", marginBottom:"14px" }}>
        <span style={{ width:"44px", height:"44px", borderRadius:"50%", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Shirt size={21} strokeWidth={2.2} color={BRAND} />
        </span>
        <div style={{ flex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"#fff", border:"1px solid #f8b8d2", color:BRAND, borderRadius:"999px", padding:"6px 9px", fontSize:"11px", fontWeight:900, marginBottom:"8px" }}>
            <Sparkles size={13} strokeWidth={2.2} />
            Clothing Mode suggested
          </div>
          <div style={{ fontSize:"16px", fontWeight:900, color:DARK, marginBottom:"5px" }}>Looks like you sell clothing</div>
          <div style={{ fontSize:"13px", color:"#666", lineHeight:1.55 }}>
            Vula can help you manage items, sizes, conditions and WhatsApp selling. This first version gives you quick clothing actions.
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px", marginBottom:"14px" }}>
        {[
          { label:"Detected confidence", value:`${score}%` },
          { label:"Products checked", value:products.length },
          { label:"Suggested mode", value:"Clothing" },
        ].map((item) => (
          <div key={item.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"12px" }}>
            <div style={{ fontSize:"10px", color:"#999", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"5px" }}>{item.label}</div>
            <div style={{ fontSize:"16px", color:DARK, fontWeight:900 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", marginBottom:"14px" }}>
        <div style={{ fontSize:"11px", color:"#999", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" }}>WhatsApp Status caption</div>
        <div style={{ fontSize:"13px", color:DARK, lineHeight:1.6 }}>{caption}</div>
      </div>

      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
        <button type="button" onClick={onAddClothingItem} style={{ flex:"1 1 150px", background:BRAND, color:"#fff", border:"none", borderRadius:"12px", padding:"12px 14px", fontSize:"13px", fontWeight:900, cursor:"pointer" }}>
          Add clothing item
        </button>
        <button type="button" onClick={copyCaption} style={{ flex:"1 1 150px", background:"#fff", color:BRAND, border:"1.5px solid #f8b8d2", borderRadius:"12px", padding:"12px 14px", fontSize:"13px", fontWeight:900, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"7px" }}>
          <Copy size={15} strokeWidth={2.2} /> {copied ? "Copied" : "Copy caption"}
        </button>
        <button type="button" onClick={openWhatsAppStatusHelper} style={{ flex:"1 1 150px", background:"#fff", color:BRAND, border:"1.5px solid #f8b8d2", borderRadius:"12px", padding:"12px 14px", fontSize:"13px", fontWeight:900, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"7px" }}>
          <MessageCircle size={15} strokeWidth={2.2} /> Open WhatsApp
        </button>
      </div>
    </div>
  );
}
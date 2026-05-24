import React, { useMemo, useState } from "react";
import { Shirt } from "lucide-react";
import { DARK, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";
const STATUSES = ["Available", "Reserved", "Sold"];
const CONDITIONS = ["New", "Excellent", "Good", "Fair", "Needs repair"];
const CLOTHING_CATEGORY_PATTERN = /clothing|clothes|fashion|thrift|pre-loved|preloved|apparel|retail/i;

function emptyDetails(product) {
  return {
    clothing_size: product?.clothing_size || "",
    clothing_colour: product?.clothing_colour || "",
    clothing_condition: product?.clothing_condition || "",
    clothing_brand: product?.clothing_brand || "",
    product_status: product?.product_status || "Available",
  };
}

function clothingText(product) {
  return [
    product?.clothing_brand,
    product?.name,
    product?.clothing_size ? `Size ${product.clothing_size}` : "",
    product?.clothing_colour,
    product?.clothing_condition,
    product?.product_status,
  ].filter(Boolean).join(" · ");
}

function hasClothingDetails(product) {
  return Boolean(product?.clothing_size || product?.clothing_colour || product?.clothing_condition || product?.clothing_brand);
}

export function ClothingFieldsPanel({ business, products = [], onProductsChange }) {
  const [editing, setEditing] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState("");
  const isClothingBusiness = CLOTHING_CATEGORY_PATTERN.test(business?.category || "");
  const clothingProducts = useMemo(
    () => products.filter((product) => product?.id && (isClothingBusiness || hasClothingDetails(product))),
    [products, isClothingBusiness]
  );

  function startEdit(product) {
    setEditing((prev) => ({ ...prev, [product.id]: emptyDetails(product) }));
  }

  function updateField(productId, key, value) {
    setEditing((prev) => ({ ...prev, [productId]: { ...(prev[productId] || {}), [key]: value } }));
  }

  async function saveDetails(product) {
    const details = editing[product.id] || emptyDetails(product);
    setSavingId(product.id);
    const { data, error } = await supabase.from("products").update({
      clothing_size: details.clothing_size.trim() || null,
      clothing_colour: details.clothing_colour.trim() || null,
      clothing_condition: details.clothing_condition || null,
      clothing_brand: details.clothing_brand.trim() || null,
      product_status: details.product_status || "Available",
    }).eq("id", product.id).select().single();

    if (error) {
      console.error("Save clothing details:", error);
      alert("Clothing details could not be saved. Please check that the Supabase SQL has been run.");
      setSavingId(null);
      return;
    }

    if (onProductsChange) onProductsChange(products.map((item) => item.id === product.id ? { ...item, ...data } : item));
    setEditing((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    setSavingId(null);
    setToast("Clothing details saved");
    setTimeout(() => setToast(""), 2200);
  }

  async function quickStatus(product, status) {
    setSavingId(product.id);
    const { data, error } = await supabase.from("products").update({ product_status: status }).eq("id", product.id).select().single();
    if (error) {
      console.error("Update product status:", error);
      alert("Status could not be updated. Please check that the Supabase SQL has been run.");
      setSavingId(null);
      return;
    }
    if (onProductsChange) onProductsChange(products.map((item) => item.id === product.id ? { ...item, ...data } : item));
    setSavingId(null);
  }

  if (!isClothingBusiness || clothingProducts.length === 0) return null;

  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px", marginBottom:"18px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
        <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Shirt size={19} strokeWidth={2.2} color={BRAND} />
        </span>
        <div>
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>Clothing details</div>
          <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>Add size, colour, condition, brand and stock status to each item.</div>
        </div>
      </div>

      {toast && <div style={{ background:"#f0fff4", border:"1px solid #b7efc5", color:"#186a3b", borderRadius:"12px", padding:"10px 12px", fontSize:"12px", fontWeight:800, marginBottom:"12px" }}>{toast}</div>}

      <div style={{ display:"grid", gap:"10px" }}>
        {clothingProducts.map((product) => {
          const isEditing = Boolean(editing[product.id]);
          const form = editing[product.id] || emptyDetails(product);
          const status = product.product_status || "Available";
          const statusColour = status === "Sold" ? "#cc3300" : status === "Reserved" ? "#b7791f" : "#186a3b";
          return (
            <div key={product.id} style={{ border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", background:"#fbfbfb" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px", marginBottom:isEditing ? "14px" : "10px" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>{product.name}</div>
                  <div style={{ fontSize:"12px", color:"#888", lineHeight:1.45, marginTop:"3px" }}>{clothingText(product) || "No clothing details yet"}</div>
                </div>
                <span style={{ background:"#fff", border:"1px solid #eeeeea", color:statusColour, borderRadius:"999px", padding:"6px 9px", fontSize:"11px", fontWeight:900, whiteSpace:"nowrap" }}>{status}</span>
              </div>

              {isEditing ? (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"10px", marginBottom:"12px" }}>
                    <div><label style={labelStyle}>Size</label><input style={inputStyle} placeholder="e.g. M / 34 / Size 5" value={form.clothing_size} onChange={(event) => updateField(product.id, "clothing_size", event.target.value)} /></div>
                    <div><label style={labelStyle}>Colour</label><input style={inputStyle} placeholder="e.g. Blue" value={form.clothing_colour} onChange={(event) => updateField(product.id, "clothing_colour", event.target.value)} /></div>
                    <div><label style={labelStyle}>Brand</label><input style={inputStyle} placeholder="e.g. Nike" value={form.clothing_brand} onChange={(event) => updateField(product.id, "clothing_brand", event.target.value)} /></div>
                    <div><label style={labelStyle}>Condition</label><select style={inputStyle} value={form.clothing_condition} onChange={(event) => updateField(product.id, "clothing_condition", event.target.value)}><option value="">Select condition</option>{CONDITIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                    <div><label style={labelStyle}>Status</label><select style={inputStyle} value={form.product_status} onChange={(event) => updateField(product.id, "product_status", event.target.value)}>{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                  </div>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    <button type="button" onClick={() => saveDetails(product)} disabled={savingId === product.id} style={{ background:BRAND, color:"#fff", border:"none", borderRadius:"10px", padding:"9px 13px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>{savingId === product.id ? "Saving..." : "Save details"}</button>
                    <button type="button" onClick={() => setEditing((prev) => { const next = { ...prev }; delete next[product.id]; return next; })} style={{ background:"#fff", color:"#555", border:"1px solid #eeeeea", borderRadius:"10px", padding:"9px 13px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  <button type="button" onClick={() => startEdit(product)} style={{ background:BRAND, color:"#fff", border:"none", borderRadius:"10px", padding:"9px 13px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>Edit clothing details</button>
                  {STATUSES.map((item) => <button key={item} type="button" onClick={() => quickStatus(product, item)} disabled={savingId === product.id || status === item} style={{ background:status === item ? "#fde8f1" : "#fff", color:status === item ? BRAND : "#555", border:"1px solid #eeeeea", borderRadius:"10px", padding:"9px 11px", fontSize:"12px", fontWeight:800, cursor:status === item ? "default" : "pointer" }}>{item}</button>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

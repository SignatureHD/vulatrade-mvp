import React, { useMemo, useState } from "react";
import { DARK, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";
const PRODUCT_TYPES = ["Perfume", "Car diffuser", "Home diffuser", "Room spray", "Refill", "Gift set"];
const SCENT_FAMILIES = ["Fresh", "Sweet", "Floral", "Woody", "Spicy", "Citrus", "Vanilla", "Musk", "Luxury-inspired"];
const STATUSES = ["Available", "Low stock", "Sold out", "Made to order"];
const FRAGRANCE_CATEGORY_PATTERN = /perfume|fragrance|scent|diffuser|spray|aroma/i;

function emptyDetails(product) {
  return {
    fragrance_type: product?.fragrance_type || "",
    scent_family: product?.scent_family || "",
    bottle_size: product?.bottle_size || "",
    fragrance_strength: product?.fragrance_strength || "",
    fragrance_use: product?.fragrance_use || "",
    product_status: product?.product_status || "Available",
  };
}

function fragranceText(product) {
  return [
    product?.fragrance_type,
    product?.scent_family,
    product?.bottle_size,
    product?.fragrance_strength,
    product?.fragrance_use,
    product?.product_status,
  ].filter(Boolean).join(" · ");
}

function hasFragranceDetails(product) {
  return Boolean(product?.fragrance_type || product?.scent_family || product?.bottle_size || product?.fragrance_strength || product?.fragrance_use);
}

export function FragranceFieldsPanel({ business, products = [], onProductsChange }) {
  const [editing, setEditing] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState("");
  const isFragranceBusiness = FRAGRANCE_CATEGORY_PATTERN.test(business?.category || "");
  const fragranceProducts = useMemo(
    () => products.filter((product) => product?.id && (isFragranceBusiness || hasFragranceDetails(product))),
    [products, isFragranceBusiness]
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
      fragrance_type: details.fragrance_type || null,
      scent_family: details.scent_family || null,
      bottle_size: details.bottle_size.trim() || null,
      fragrance_strength: details.fragrance_strength.trim() || null,
      fragrance_use: details.fragrance_use.trim() || null,
      product_status: details.product_status || "Available",
    }).eq("id", product.id).select().single();

    if (error) {
      console.error("Save fragrance details:", error);
      alert("Fragrance details could not be saved. Please check that the Supabase SQL has been run.");
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
    setToast("Fragrance details saved");
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

  if (!isFragranceBusiness || fragranceProducts.length === 0) return null;

  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px", marginBottom:"18px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
        <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:BRAND, fontSize:"20px" }}>✦</span>
        <div>
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>Fragrance details</div>
          <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>Add scent family, product type, bottle size, use and stock status.</div>
        </div>
      </div>

      {toast && <div style={{ background:"#f0fff4", border:"1px solid #b7efc5", color:"#186a3b", borderRadius:"12px", padding:"10px 12px", fontSize:"12px", fontWeight:800, marginBottom:"12px" }}>{toast}</div>}

      <div style={{ display:"grid", gap:"10px" }}>
        {fragranceProducts.map((product) => {
          const isEditing = Boolean(editing[product.id]);
          const form = editing[product.id] || emptyDetails(product);
          const status = product.product_status || "Available";
          const statusColour = status === "Sold out" ? "#cc3300" : status === "Low stock" ? "#b7791f" : "#186a3b";
          return (
            <div key={product.id} style={{ border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", background:"#fbfbfb" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px", marginBottom:isEditing ? "14px" : "10px" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>{product.name}</div>
                  <div style={{ fontSize:"12px", color:"#888", lineHeight:1.45, marginTop:"3px" }}>{fragranceText(product) || "No fragrance details yet"}</div>
                </div>
                <span style={{ background:"#fff", border:"1px solid #eeeeea", color:statusColour, borderRadius:"999px", padding:"6px 9px", fontSize:"11px", fontWeight:900, whiteSpace:"nowrap" }}>{status}</span>
              </div>

              {isEditing ? (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"10px", marginBottom:"12px" }}>
                    <div><label style={labelStyle}>Product type</label><select style={inputStyle} value={form.fragrance_type} onChange={(event) => updateField(product.id, "fragrance_type", event.target.value)}><option value="">Select type</option>{PRODUCT_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                    <div><label style={labelStyle}>Scent family</label><select style={inputStyle} value={form.scent_family} onChange={(event) => updateField(product.id, "scent_family", event.target.value)}><option value="">Select scent</option>{SCENT_FAMILIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                    <div><label style={labelStyle}>Bottle size</label><input style={inputStyle} placeholder="e.g. 50ml / 100ml" value={form.bottle_size} onChange={(event) => updateField(product.id, "bottle_size", event.target.value)} /></div>
                    <div><label style={labelStyle}>Strength / lasting</label><input style={inputStyle} placeholder="e.g. Long-lasting" value={form.fragrance_strength} onChange={(event) => updateField(product.id, "fragrance_strength", event.target.value)} /></div>
                    <div><label style={labelStyle}>Use</label><input style={inputStyle} placeholder="e.g. Ladies / Car / Home" value={form.fragrance_use} onChange={(event) => updateField(product.id, "fragrance_use", event.target.value)} /></div>
                    <div><label style={labelStyle}>Status</label><select style={inputStyle} value={form.product_status} onChange={(event) => updateField(product.id, "product_status", event.target.value)}>{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                  </div>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    <button type="button" onClick={() => saveDetails(product)} disabled={savingId === product.id} style={{ background:BRAND, color:"#fff", border:"none", borderRadius:"10px", padding:"9px 13px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>{savingId === product.id ? "Saving..." : "Save details"}</button>
                    <button type="button" onClick={() => setEditing((prev) => { const next = { ...prev }; delete next[product.id]; return next; })} style={{ background:"#fff", color:"#555", border:"1px solid #eeeeea", borderRadius:"10px", padding:"9px 13px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  <button type="button" onClick={() => startEdit(product)} style={{ background:BRAND, color:"#fff", border:"none", borderRadius:"10px", padding:"9px 13px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>Edit fragrance details</button>
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

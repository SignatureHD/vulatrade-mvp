import React, { useEffect, useRef, useState } from "react";
import { Calculator, Info, PlusCircle, Trash2 } from "lucide-react";
import { LIME, DARK, MAX_IMAGES, CATEGORIES, PAYMENT_METHODS, ICON_TEMPLATES, inputStyle, labelStyle } from "../../constants";
import { compressImage, injectAllUnlockedFonts } from "../../utils";
import { supabase } from "../../lib/supabase";
import { BusinessPagePreview } from "../BusinessPagePreview";
import { ColourPicker, FontPicker } from "../ui";
import { ImageLibrary, ProductImagePicker } from "../ImageLibrary";

const COSTING_SUGGESTIONS = {
  "Food / Catering": ["Ingredients", "Packaging", "Gas / Electricity", "Delivery", "Sauce / extras", "Labour time", "Other"],
  "Hair / Beauty / Nails": ["Product used", "Consumables", "Chair rental", "Assistant / labour", "Transport", "Other"],
  "Cleaning Services": ["Chemicals", "Gloves / PPE", "Transport", "Labour", "Equipment wear", "Other"],
  "Mobile Car Wash": ["Water", "Soap / chemicals", "Cloths / sponges", "Transport", "Labour", "Other"],
  "Clothing / Product Seller": ["Stock cost", "Packaging", "Courier / delivery", "Returns allowance", "Marketing", "Other"],
  "Repairs / Home Services": ["Parts", "Tools / equipment wear", "Transport", "Labour", "Call-out cost", "Other"],
  "General Business": ["Stock", "Supplies", "Transport", "Labour", "Packaging", "Other"],
};

const MARGIN_GUIDANCE = {
  "Food / Catering": ["Cooked meals: 35%-50%", "Snacks/add-ons: 45%-65%", "Drinks/resale items: 20%-40%", "Catering/bulk orders: 30%-50%"],
  "Hair / Beauty / Nails": ["Services: 50%-75%", "Product resale: 25%-50%"],
  "Cleaning Services": ["Service jobs: 40%-65%", "Product/supply resale: 20%-40%"],
  "Mobile Car Wash": ["Service jobs: 40%-65%"],
  "Clothing / Product Seller": ["Clothing resale: 40%-60%", "Low-cost/high-volume items: 20%-40%"],
  "Repairs / Home Services": ["Labour/service work: 50%-70%", "Parts resale: 20%-40%"],
  "General Business": ["Suggested target: 35%-60%"],
};

function pricingBusinessType(category = "") {
  const c = category.toLowerCase();
  if (/(food|cater|kitchen|meal|fresh|produce)/.test(c)) return "Food / Catering";
  if (/(nail|hair|barber|beauty|salon)/.test(c)) return "Hair / Beauty / Nails";
  if (/clean/.test(c)) return "Cleaning Services";
  if (/car wash|wash/.test(c)) return "Mobile Car Wash";
  if (/(clothing|retail|product|seller|fashion)/.test(c)) return "Clothing / Product Seller";
  if (/(repair|home service|maintenance|plumb|electric)/.test(c)) return "Repairs / Home Services";
  return "General Business";
}

function emptyCostItem(name = "") {
  return { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, name, amount: "" };
}

function normaliseCostItems(items = []) {
  return items.map((item) => ({
    id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: item.name || "",
    amount: item.amount ?? "",
  }));
}

function loadLocalCosting(businessId) {
  if (!businessId) return {};
  try {
    return JSON.parse(localStorage.getItem(`vula_product_costing_${businessId}`) || "{}");
  } catch {
    return {};
  }
}

function saveLocalCosting(businessId, productId, costItems) {
  if (!businessId || !productId) return;
  const stored = loadLocalCosting(businessId);
  stored[productId] = normaliseCostItems(costItems);
  localStorage.setItem(`vula_product_costing_${businessId}`, JSON.stringify(stored));
}

function removeLocalCosting(businessId, productId) {
  if (!businessId || !productId) return;
  const stored = loadLocalCosting(businessId);
  delete stored[productId];
  localStorage.setItem(`vula_product_costing_${businessId}`, JSON.stringify(stored));
}

function pricingStatus(grossMargin, businessType) {
  if (grossMargin === null) return { label:"Add costs to check pricing", color:"#888", bg:"#fbfbfb", message:"Add estimated costs and a selling price to see profit, markup and margin." };
  if (grossMargin > 40) return { label:"Good margin", color:"#d93f7b", bg:"#fff5f9", message:"Good margin. This item should leave room for profit if your other costs are controlled." };
  if (grossMargin >= 25) return { label:"Watch margin", color:"#b7791f", bg:"#fff8e7", message:"This may work, but check your transport, data, packaging and other costs." };
  const foodNote = businessType === "Food / Catering" ? " If delivery is included, this item may be underpriced." : "";
  return { label:"Low margin", color:"#cc3300", bg:"#fff5f5", message:`This price may be too low. You may be working hard without keeping enough profit.${foodNote}` };
}

function PricingHelper({ price, costItems, setCostItems, businessCategory }) {
  const businessType = pricingBusinessType(businessCategory);
  const suggestions = COSTING_SUGGESTIONS[businessType] || COSTING_SUGGESTIONS["General Business"];
  const guidance = MARGIN_GUIDANCE[businessType] || MARGIN_GUIDANCE["General Business"];
  const sellingPrice = parseFloat(price) || 0;
  const totalCost = costItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const estimatedProfit = sellingPrice - totalCost;
  const markup = totalCost > 0 ? (estimatedProfit / totalCost) * 100 : null;
  const grossMargin = sellingPrice > 0 ? (estimatedProfit / sellingPrice) * 100 : null;
  const status = pricingStatus(grossMargin, businessType);

  function updateItem(id, key, value) {
    setCostItems(costItems.map((item) => item.id === id ? { ...item, [key]: value } : item));
  }

  function addItem(name = "") {
    setCostItems([...costItems, emptyCostItem(name)]);
  }

  function removeItem(id) {
    setCostItems(costItems.filter((item) => item.id !== id));
  }

  const lowMargin = grossMargin !== null && grossMargin < 25;

  return (
    <div style={{ background:"#fff", border:"1.5px solid #eeeeea", borderRadius:"16px", padding:"16px", marginTop:"4px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", marginBottom:"12px" }}>
        <span style={{ width:"38px", height:"38px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Calculator size={18} strokeWidth={2.2} color="#ea4c89" />
        </span>
        <div>
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>Pricing Helper</div>
          <div style={{ fontSize:"12px", color:"#888", lineHeight:1.45, marginTop:"2px" }}>Cost to Make estimates help you check if this price leaves enough profit.</div>
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:"7px", marginBottom:"14px" }}>
        {suggestions.map((name) => (
          <button key={name} type="button" onClick={() => addItem(name)}
            style={{ border:"1.5px solid #f8b8d2", background:"#fff5f9", color:"#d93f7b", borderRadius:"999px", padding:"7px 10px", fontSize:"11px", fontWeight:800, cursor:"pointer" }}>
            {name}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"12px" }}>
        {costItems.length === 0 ? (
          <div style={{ background:"#fbfbfb", borderRadius:"12px", padding:"13px", fontSize:"12px", color:"#888" }}>Add estimated ingredients, packaging, stock, labour or transport costs.</div>
        ) : costItems.map((item) => (
          <div key={item.id} style={{ display:"grid", gridTemplateColumns:"minmax(0, 1.3fr) minmax(86px, 0.7fr) 34px", gap:"8px", alignItems:"center" }}>
            <input style={{ ...inputStyle, minWidth:0 }} placeholder="Cost item name" value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} />
            <input style={{ ...inputStyle, minWidth:0 }} type="number" min="0" step="0.01" placeholder="Amount" value={item.amount} onChange={(e) => updateItem(item.id, "amount", e.target.value)} />
            <button type="button" onClick={() => removeItem(item.id)} aria-label="Remove cost item"
              style={{ width:"34px", height:"34px", borderRadius:"10px", border:"1px solid #ffd0d0", background:"#fff5f5", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Trash2 size={15} strokeWidth={2.2} color="#cc3300" />
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => addItem()} style={{ background:"#fff", color:"#ea4c89", border:"1.5px solid #f8b8d2", borderRadius:"12px", padding:"10px 12px", fontSize:"12px", fontWeight:900, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:"7px", marginBottom:"14px" }}>
        <PlusCircle size={15} strokeWidth={2.2} />
        Add cost item
      </button>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(128px, 1fr))", gap:"8px", marginBottom:"12px" }}>
        {[
          { label:"Total estimated cost", value:totalCost > 0 ? `R${totalCost.toLocaleString("en-ZA", { minimumFractionDigits:2, maximumFractionDigits:2 })}` : "Add costs" },
          { label:"Estimated profit", value:sellingPrice > 0 && totalCost > 0 ? `R${estimatedProfit.toLocaleString("en-ZA", { minimumFractionDigits:2, maximumFractionDigits:2 })}` : "Needs price + costs" },
          { label:"Markup", value:markup === null ? "Needs costs" : `${markup.toFixed(1)}%` },
          { label:"Gross margin", value:grossMargin === null ? "Needs price" : `${grossMargin.toFixed(1)}%` },
        ].map((item) => (
          <div key={item.label} style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"12px", padding:"11px" }}>
            <div style={{ fontSize:"10px", color:"#888", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"5px" }}>{item.label}</div>
            <div style={{ fontSize:"15px", color:DARK, fontWeight:900 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:status.bg, border:`1px solid ${status.color === "#cc3300" ? "#ffd0d0" : "#f8b8d2"}`, borderRadius:"14px", padding:"12px", marginBottom:"10px" }}>
        <div style={{ fontSize:"13px", fontWeight:900, color:status.color, marginBottom:"4px" }}>{status.label}</div>
        <div style={{ fontSize:"12px", color:"#666", lineHeight:1.45 }}>{status.message}</div>
        {lowMargin && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"10px" }}>
            {["Increase selling price", "Charge delivery separately", "Reduce packaging cost", "Buy in bulk", "Create a better-margin combo"].map((tip) => (
              <span key={tip} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"999px", padding:"6px 8px", fontSize:"11px", color:"#777", fontWeight:700 }}>{tip}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ background:"#fbfbfb", borderRadius:"12px", padding:"12px", marginBottom:"10px" }}>
        <div style={{ fontSize:"12px", fontWeight:900, color:DARK, marginBottom:"7px" }}>{businessType} margin guide</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
          {guidance.map((item) => (
            <span key={item} style={{ border:"1px solid #eeeeea", background:"#fff", borderRadius:"999px", padding:"6px 8px", fontSize:"11px", color:"#777", fontWeight:700 }}>{item}</span>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:"8px", alignItems:"flex-start", background:"#fff8e7", border:"1px solid #f4dfaa", borderRadius:"12px", padding:"10px 11px", fontSize:"11px", color:"#7a5e00", lineHeight:1.45 }}>
        <Info size={15} strokeWidth={2.2} style={{ flexShrink:0, marginTop:"1px" }} />
        <span>These are estimated costs for pricing. Actual expenses should still be recorded on the Expenses page. Pricing Helper saving will be connected once product costing storage is added.</span>
      </div>
    </div>
  );
}

// ── PRODUCTS SECTION ───────────────────────────────────────
export function ProductsSection({ businessId, prefilledProducts, onProductsPrefilled, onProductsChange, userId, businessCategory }) {
  const [products, setProducts]           = useState([]);
  const [images, setImages]               = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [adding, setAdding]               = useState(false);
  const [saving, setSaving]               = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [editForm, setEditForm]           = useState({});
  const [newProduct, setNewProduct]       = useState({ name:"", price:"", description:"", icon:"🛍️", image:null, costItems:[] });
  const [localCosting, setLocalCosting]   = useState({});

  useEffect(() => {
    if (!userId) return;
    async function loadImages() {
      const { data } = await supabase.storage.from("business-images").list(`product-images/${userId}`, { limit:MAX_IMAGES, sortBy:{ column:"created_at", order:"asc" } });
      if (data) {
        const mapped = data
          .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
          .map((f) => {
            const { data:u } = supabase.storage.from("business-images").getPublicUrl(`product-images/${userId}/${f.name}`);
            return { url:u.publicUrl, path:`product-images/${userId}/${f.name}` };
          });
        setImages(mapped);
      }
      setLoadingImages(false);
    }
    loadImages();
  }, [userId]);

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    const storedCosting = loadLocalCosting(businessId);
    setLocalCosting(storedCosting);
    supabase.from("products").select("*").eq("business_id", businessId).order("created_at")
      .then(({ data }) => {
        if (data) {
          const mapped = data.map((p) => ({ ...p, icon: p.image && !p.image.startsWith("http") ? p.image : "🛍️", costItems: storedCosting[p.id] || [] }));
          setProducts(mapped); onProductsChange && onProductsChange(mapped);
        }
        setLoading(false);
      });
  }, [businessId]);

  useEffect(() => {
    if (!prefilledProducts || !businessId || prefilledProducts.length === 0) return;
    async function applyTemplate() {
      await supabase.from("products").delete().eq("business_id", businessId);
      const rows = prefilledProducts.map((p) => ({ business_id:businessId, name:p.name, price:p.price, description:p.description, image:p.icon||"🛍️", is_active:true }));
      const { data } = await supabase.from("products").insert(rows).select();
      if (data) { const mapped = data.map((p) => ({ ...p, icon:p.image })); setProducts(mapped); onProductsChange && onProductsChange(mapped); }
      onProductsPrefilled();
    }
    applyTemplate();
  }, [prefilledProducts, businessId]);

  function updateProducts(list) { setProducts(list); onProductsChange && onProductsChange(list); }

  async function handleAdd() {
    if (!newProduct.name.trim() || !newProduct.price) return;
    setSaving(true);
    const imageValue = newProduct.image || newProduct.icon || "🛍️";
    const { data } = await supabase.from("products").insert([{ business_id:businessId, name:newProduct.name.trim(), price:parseFloat(newProduct.price), description:newProduct.description.trim(), image:imageValue, is_active:true }]).select().single();
    if (data) {
      saveLocalCosting(businessId, data.id, newProduct.costItems);
      const nextCosting = { ...localCosting, [data.id]: normaliseCostItems(newProduct.costItems) };
      setLocalCosting(nextCosting);
      updateProducts([...products, { ...data, icon: data.image && !data.image.startsWith("http") ? data.image : "🛍️", costItems: nextCosting[data.id] }]);
      setNewProduct({ name:"", price:"", description:"", icon:"🛍️", image:null, costItems:[] });
      setAdding(false);
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    removeLocalCosting(businessId, id);
    const nextCosting = { ...localCosting };
    delete nextCosting[id];
    setLocalCosting(nextCosting);
    updateProducts(products.filter((p) => p.id !== id));
  }

  async function handleToggleActive(product) {
    const { data } = await supabase.from("products").update({ is_active:!product.is_active }).eq("id", product.id).select().single();
    if (data) updateProducts(products.map((p) => p.id===data.id ? { ...data, icon: data.image && !data.image.startsWith("http") ? data.image : "🛍️", costItems: localCosting[data.id] || p.costItems || [] } : p));
  }

  async function handleSaveEdit(id) {
    if (!editForm.name.trim() || !editForm.price) return;
    const imageValue = editForm.image || editForm.icon || "🛍️";
    const { data } = await supabase.from("products").update({ name:editForm.name.trim(), price:parseFloat(editForm.price), description:editForm.description.trim(), image:imageValue }).eq("id", id).select().single();
    if (data) {
      saveLocalCosting(businessId, id, editForm.costItems || []);
      const nextCosting = { ...localCosting, [id]: normaliseCostItems(editForm.costItems || []) };
      setLocalCosting(nextCosting);
      updateProducts(products.map((p) => p.id===data.id ? { ...data, icon: data.image && !data.image.startsWith("http") ? data.image : "🛍️", costItems: nextCosting[id] } : p));
      setEditingId(null);
    }
  }

  function productThumb(p, size=40) {
    const val = p.image || p.icon || "🛍️";
    return val.startsWith("http")
      ? <img src={val} alt={p.name} style={{ width:size, height:size, borderRadius:"10px", objectFit:"cover", flexShrink:0, border:"1px solid #f0f0f0" }} />
      : <div style={{ width:size, height:size, background:"#f5f5f5", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>{val}</div>;
  }

  if (!businessId) return (
    <div style={{ background:"#fffbe6", border:"1.5px solid #f0d000", borderRadius:"12px", padding:"16px", fontSize:"13px", color:"#7a5e00" }}>
      Save your business details first, then add your products and services.
    </div>
  );

  return (
    <div>
      {!loadingImages && (
        <div style={{ marginBottom:"28px" }}>
          <ImageLibrary userId={userId} images={images} setImages={setImages} uploading={uploadingImage} setUploading={setUploadingImage} />
        </div>
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
        <div>
          <div style={{ fontSize:"16px", fontWeight:700, color:DARK }}>Products & Services</div>
          <div style={{ fontSize:"13px", color:"#aaa", marginTop:"2px" }}>{products.length} item{products.length!==1?"s":""}</div>
        </div>
        <button onClick={() => setAdding(true)} style={{ backgroundColor:DARK, color:LIME, border:"none", borderRadius:"10px", padding:"9px 16px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>+ Add product</button>
      </div>

      {adding && (
        <div style={{ background:"#fbfbfb", border:"1.5px solid #d4d7db", borderRadius:"14px", padding:"18px", marginBottom:"14px" }}>
          <div style={{ fontSize:"14px", fontWeight:700, color:DARK, marginBottom:"14px" }}>New product or service</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <input style={inputStyle} placeholder="Name e.g. Gel overlay" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name:e.target.value})} />
            <input style={inputStyle} type="number" placeholder="Price e.g. 220" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price:e.target.value})} />
            <PricingHelper
              price={newProduct.price}
              costItems={newProduct.costItems}
              setCostItems={(items) => setNewProduct((p) => ({ ...p, costItems:items }))}
              businessCategory={businessCategory}
            />
            <input style={inputStyle} placeholder="Description (optional)" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description:e.target.value})} />
            <ProductImagePicker images={images} selectedImage={newProduct.image} selectedIcon={newProduct.icon}
              onImageSelect={(url) => setNewProduct((p) => ({...p, image:url}))}
              onIconSelect={(ic) => setNewProduct((p) => ({...p, icon:ic, image:null}))} />
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={handleAdd} disabled={saving} style={{ backgroundColor:LIME, color:"#fff", border:"none", borderRadius:"10px", padding:"10px 20px", fontSize:"13px", fontWeight:700, cursor:"pointer", flex:1 }}>{saving?"Saving...":"Save product"}</button>
              <button onClick={() => { setAdding(false); setNewProduct({name:"",price:"",description:"",icon:"🛍️",image:null,costItems:[]}); }} style={{ background:"#fff", color:"#888", border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"10px 16px", fontSize:"13px", cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div style={{ fontSize:"13px", color:"#aaa", padding:"20px 0" }}>Loading...</div> :
        products.length === 0 ? (
          <div style={{ background:"#fbfbfb", border:"1.5px dashed #ddd", borderRadius:"14px", padding:"32px", textAlign:"center" }}>
            <div style={{ fontSize:"28px", marginBottom:"10px" }}>🛍️</div>
            <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>No products yet. Add your first product or service.</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {products.map((p) => (
              <div key={p.id} style={{ background:"#fff", border:`1.5px solid ${editingId===p.id?LIME:"#eeeeea"}`, borderRadius:"14px", padding:"14px 18px", opacity:p.is_active?1:0.55 }}>
                {editingId===p.id ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm({...editForm,name:e.target.value})} placeholder="Product name" />
                    <input style={inputStyle} type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm,price:e.target.value})} placeholder="Price" />
                    <PricingHelper
                      price={editForm.price}
                      costItems={editForm.costItems || []}
                      setCostItems={(items) => setEditForm((f) => ({ ...f, costItems:items }))}
                      businessCategory={businessCategory}
                    />
                    <input style={inputStyle} value={editForm.description} onChange={(e) => setEditForm({...editForm,description:e.target.value})} placeholder="Description" />
                    <ProductImagePicker images={images} selectedImage={editForm.image} selectedIcon={editForm.icon}
                      onImageSelect={(url) => setEditForm((f) => ({...f,image:url}))}
                      onIconSelect={(ic) => setEditForm((f) => ({...f,icon:ic,image:null}))} />
                    <div style={{ display:"flex", gap:"8px" }}>
                      <button onClick={() => handleSaveEdit(p.id)} style={{ backgroundColor:LIME, color:"#fff", border:"none", borderRadius:"10px", padding:"9px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer", flex:1 }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ background:"#fff", color:"#888", border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"9px 14px", fontSize:"13px", cursor:"pointer" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    {productThumb(p)}
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>{p.name}</div>
                      {p.description && <div style={{ fontSize:"12px", color:"#aaa", marginTop:"2px" }}>{p.description}</div>}
                    </div>
                    <div style={{ fontSize:"16px", fontWeight:900, color:DARK, minWidth:"55px", textAlign:"right" }}>R{p.price}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
	                      <button onClick={() => { setEditingId(p.id); const isUrl=p.image&&p.image.startsWith("http"); setEditForm({name:p.name,price:p.price,description:p.description||"",icon:isUrl?"🛍️":(p.image||p.icon||"🛍️"),image:isUrl?p.image:null,costItems:normaliseCostItems(localCosting[p.id] || p.costItems || [])}); }} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #e0e0e0", background:"#fbfbfb", color:"#555", cursor:"pointer", fontWeight:600 }}>Edit</button>
                      <button onClick={() => handleToggleActive(p)} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #e0e0e0", background:p.is_active?"#fff5f9":"#f5f5f5", color:p.is_active?"#d93f7b":"#aaa", cursor:"pointer", fontWeight:600, whiteSpace:"nowrap" }}>{p.is_active?"Active":"Hidden"}</button>
                      <button onClick={() => handleDelete(p.id)} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #ffd0d0", background:"#fff5f5", color:"#cc3300", cursor:"pointer", fontWeight:600 }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export function ProductsTab({ user, business, setGlobalProducts }) {
  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Products / Services</h2>
        <p style={{ fontSize:"13px", color:"#888" }}>Manage what your business sells. These items appear on your public page.</p>
      </div>
      <ProductsSection
        businessId={business?.id}
        prefilledProducts={null}
        onProductsPrefilled={() => {}}
        onProductsChange={setGlobalProducts}
        userId={user.id}
        businessCategory={business?.category}
      />
    </div>
  );
}

// ── SETUP TAB ──────────────────────────────────────────────
export function SetupTab({ user, business, setBusiness, prefilledTemplate, setPrefilledTemplate, setTab, setGlobalProducts, setGlobalLogoUrl }) {
  const [form, setForm] = useState({
    name:        business?.name         || "",
    owner:       business?.owner        || "",
    category:    business?.category     || "",
    area:        business?.area         || "",
    description: business?.description  || "",
    whatsapp:    business?.whatsapp     || "",
    payment:     business?.payment      || "",
    bgColour:    business?.theme        || "#202021",
    icon:        business?.background_style || "⭐",
    font:        business?.font         || "Inter",
  });
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState("");
  const [savedBusinessId, setSavedBusinessId] = useState(business?.id || null);
  const [prefilledProducts, setPrefilledProducts] = useState(null);
  const [products, setProducts]       = useState([]);
  const [logoUrl, setLogoUrl]         = useState(business?.catalogue || null);
  const [uploading, setUploading]     = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const fileRef = useRef();

  useEffect(() => { injectAllUnlockedFonts(); }, []);

  useEffect(() => {
    if (prefilledTemplate) {
      const icons = ICON_TEMPLATES[prefilledTemplate.category] || ["⭐"];
      setForm((prev) => ({ ...prev, category:prefilledTemplate.category, description:prefilledTemplate.starter, icon:icons[0] }));
      setPrefilledProducts(prefilledTemplate.products);
      setPrefilledTemplate(null);
      setSaved(false);
    }
  }, [prefilledTemplate]);

  useEffect(() => { if (business?.id) setSavedBusinessId(business.id); }, [business]);

  useEffect(() => {
    if (!business?.id) { setProducts([]); return; }
    supabase.from("products").select("*").eq("business_id", business.id).order("created_at")
      .then(({ data }) => {
        if (data) {
          const mapped = data.map((p) => ({ ...p, icon: p.image && !p.image.startsWith("http") ? p.image : "🛍️" }));
          setProducts(mapped);
          setGlobalProducts(mapped);
        }
      });
  }, [business?.id]);

  useEffect(() => {
    if (!prefilledProducts || !savedBusinessId || prefilledProducts.length === 0) return;
    async function applyTemplateProducts() {
      await supabase.from("products").delete().eq("business_id", savedBusinessId);
      const rows = prefilledProducts.map((p) => ({
        business_id:savedBusinessId,
        name:p.name,
        price:p.price,
        description:p.description,
        image:p.icon || "🛍️",
        is_active:true,
      }));
      const { data } = await supabase.from("products").insert(rows).select();
      if (data) {
        const mapped = data.map((p) => ({ ...p, icon:p.image }));
        setProducts(mapped);
        setGlobalProducts(mapped);
      }
      setPrefilledProducts(null);
    }
    applyTemplateProducts();
  }, [prefilledProducts, savedBusinessId]);

  function update(field, value) { setForm((prev) => ({...prev,[field]:value})); setSaved(false); }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const compressed = await compressImage(file);
    const path = `logos/${user.id}.jpg`;
    const { error:upErr } = await supabase.storage.from("business-images").upload(path, compressed, { upsert:true });
    if (!upErr) { const { data } = supabase.storage.from("business-images").getPublicUrl(path); setLogoUrl(data.publicUrl + "?t=" + Date.now()); }
    setUploading(false);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Business name is required."); return; }
    setSaving(true); setError("");
    const slug = form.name.toLowerCase().trim().replaceAll(" ","-").replace(/[^a-z0-9-]/g,"");
    const payload = { name:form.name.trim(), slug, owner:form.owner.trim(), category:form.category, area:form.area.trim(), description:form.description.trim(), whatsapp:form.whatsapp.trim(), payment:form.payment, user_id:user.id, theme:form.bgColour, background_style:form.icon, font:form.font, catalogue:logoUrl||"" };
    const { data, error:err } = await supabase.from("businesses").upsert([payload],{ onConflict:"user_id" }).select().single();
    if (err) { setError(err.message); } else { setSaved(true); setBusiness(data); setSavedBusinessId(data.id); }
    setSaving(false);
  }

  async function handleDelete() {
    if (!savedBusinessId) return;
    setDeleting(true);
    try {
      await supabase.from("products").delete().eq("business_id", savedBusinessId);
      const { data: files } = await supabase.storage.from("business-images").list(`product-images/${user.id}`);
      if (files && files.length > 0) {
        const paths = files.filter((f) => f.name && f.name !== ".emptyFolderPlaceholder").map((f) => `product-images/${user.id}/${f.name}`);
        if (paths.length > 0) await supabase.storage.from("business-images").remove(paths);
      }
      await supabase.storage.from("business-images").remove([`logos/${user.id}.jpg`]);
      await supabase.from("businesses").delete().eq("id", savedBusinessId);
      setBusiness(null);
      setGlobalProducts([]);
      setGlobalLogoUrl(null);
    } catch (err) { console.error("Delete error:", err); }
    setDeleting(false);
  }

  const iconOptions = ICON_TEMPLATES[form.category] || ICON_TEMPLATES["Other"];

  return (
    <div style={{ display:"flex", gap:"40px", alignItems:"flex-start", position:"relative" }}>
      {/* Mobile preview overlay */}
      {showMobilePreview && (
        <div style={{ position:"fixed", inset:0, background:"#fbfbfb", zIndex:200, overflowY:"auto", padding:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
            <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>Live Preview</div>
            <button onClick={() => setShowMobilePreview(false)}
              style={{ padding:"8px 16px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
              Back to editing
            </button>
          </div>
          <BusinessPagePreview form={form} products={products} logoUrl={logoUrl} isFullPage={false} />
        </div>
      )}

      <div style={{ flex:1, minWidth:0 }}>
        {/* Sticky save bar */}
        <div style={{ position:"sticky", top:0, background:"#fbfbfb", zIndex:10, paddingBottom:"16px", paddingTop:"4px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Business Setup</h2>
              <p style={{ fontSize:"13px", color:"#888" }}>Changes update your preview instantly.</p>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => setShowMobilePreview(true)}
                style={{ padding:"12px 16px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"13px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                Preview
              </button>
              <button onClick={handleSave} disabled={saving} style={{ backgroundColor:saving?"#ccc":saved?"#fff5f9":LIME, color:saving?"#fff":saved?"#d93f7b":"#fff", border:saved?"1.5px solid #ea4c89":"none", borderRadius:"12px", padding:"12px 24px", fontSize:"14px", fontWeight:800, cursor:saving?"not-allowed":"pointer", whiteSpace:"nowrap" }}>
                {saving?"Saving...":saved?"✓ Saved":"Save Business"}
              </button>
            </div>
          </div>
          {error && <div style={{ fontSize:"13px", color:"#cc3300", background:"#fff0ee", padding:"10px 14px", borderRadius:"10px", marginTop:"8px" }}>{error}</div>}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"18px", marginBottom:"36px" }}>
          <div><label style={labelStyle}>Business name *</label><input style={inputStyle} placeholder="e.g. Nomsa's Nails" value={form.name} onChange={(e) => update("name",e.target.value)} /></div>
          <div><label style={labelStyle}>Owner name</label><input style={inputStyle} placeholder="Your full name" value={form.owner} onChange={(e) => update("owner",e.target.value)} /></div>
          <div>
            <label style={labelStyle}>Business type</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
              {CATEGORIES.map((cat) => <button key={cat} onClick={() => update("category",cat)} style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:600, cursor:"pointer", border:"1.5px solid", background:form.category===cat?DARK:"#fff", color:form.category===cat?LIME:"#555", borderColor:form.category===cat?DARK:"#e0e0e0" }}>{cat}</button>)}
            </div>
          </div>
          <div><label style={labelStyle}>Area / Location</label><input style={inputStyle} placeholder="e.g. Soweto, Gauteng" value={form.area} onChange={(e) => update("area",e.target.value)} /></div>
          <div><label style={labelStyle}>Business description</label><textarea style={{...inputStyle, minHeight:"90px", resize:"vertical"}} placeholder="Briefly describe what you do..." value={form.description} onChange={(e) => update("description",e.target.value)} /></div>
          <div><label style={labelStyle}>WhatsApp number</label><input style={inputStyle} placeholder="+27 82 000 0000" value={form.whatsapp} onChange={(e) => update("whatsapp",e.target.value)} /></div>
          <div>
            <label style={labelStyle}>Payment method</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
              {PAYMENT_METHODS.map((method) => <button key={method} onClick={() => update("payment",method)} style={{ padding:"8px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:600, cursor:"pointer", border:"1.5px solid", background:form.payment===method?DARK:"#fff", color:form.payment===method?LIME:"#555", borderColor:form.payment===method?DARK:"#e0e0e0" }}>{method}</button>)}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Page background colour</label>
            <ColourPicker value={form.bgColour} onChange={(v) => update("bgColour",v)} onViewPlans={() => setTab("Plans")} />
          </div>
          <div>
            <label style={labelStyle}>Page font</label>
            <div style={{ fontSize:"11px", color:"#aaa", marginBottom:"8px" }}>Applies to your entire business page.</div>
            <FontPicker value={form.font} onChange={(v) => update("font",v)} onViewPlans={() => setTab("Plans")} />
          </div>
          <div>
            <label style={labelStyle}>Business header icon</label>
            <div style={{ fontSize:"11px", color:"#aaa", marginBottom:"8px" }}>Appears in your page header — products have their own images/icons.</div>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {iconOptions.map((ic) => (
                <button key={ic} onClick={() => update("icon",ic)}
                  style={{ width:"44px", height:"44px", borderRadius:"12px", background:form.icon===ic?DARK:"#fff", border:`1.5px solid ${form.icon===ic?DARK:"#e0e0e0"}`, fontSize:"22px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Logo / Photo (optional)</label>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              {logoUrl && <img src={logoUrl} alt="logo" style={{ width:"56px", height:"56px", borderRadius:"14px", objectFit:"cover", border:"1.5px solid #eee" }} />}
              <button onClick={() => fileRef.current.click()} disabled={uploading} style={{ backgroundColor:"#fff", color:DARK, border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"10px 16px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
                {uploading?"Uploading...":logoUrl?"Change photo":"Upload photo"}
              </button>
              {logoUrl && <button onClick={() => setLogoUrl(null)} style={{ background:"transparent", border:"none", color:"#cc3300", fontSize:"12px", cursor:"pointer" }}>Remove</button>}
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoUpload} />
            </div>
            <div style={{ fontSize:"11px", color:"#bbb", marginTop:"6px" }}>Upload from your phone or computer. JPG or PNG.</div>
          </div>
        </div>

        {/* Danger Zone */}
        {savedBusinessId && (
          <div style={{ marginTop:"48px", border:"1.5px solid #ffd0d0", borderRadius:"16px", padding:"24px", background:"#fffafa" }}>
            <div style={{ fontSize:"13px", fontWeight:700, color:"#cc3300", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px" }}>⚠️ Danger Zone</div>
            <div style={{ fontSize:"13px", color:"#888", marginBottom:"16px" }}>
              Deleting your business is permanent. All products, images and your business page will be removed. Your account stays active.
            </div>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)}
                style={{ background:"#fff", color:"#cc3300", border:"1.5px solid #ffd0d0", borderRadius:"10px", padding:"10px 20px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
                Delete this business…
              </button>
            ) : (
              <div style={{ background:"#fff", border:"1.5px solid #ffb0b0", borderRadius:"12px", padding:"18px" }}>
                <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"6px" }}>
                  Type <span style={{ fontFamily:"monospace", background:"#f5f5f5", padding:"2px 6px", borderRadius:"4px" }}>{business?.name}</span> to confirm
                </div>
                <div style={{ fontSize:"12px", color:"#aaa", marginBottom:"12px" }}>This cannot be undone.</div>
                <input
                  style={{ ...inputStyle, marginBottom:"12px", borderColor: confirmText === business?.name ? "#cc3300" : "#e8e8e8" }}
                  placeholder={`Type "${business?.name}" to confirm`}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={handleDelete} disabled={confirmText !== business?.name || deleting}
                    style={{ background: confirmText === business?.name ? "#cc3300" : "#f5f5f5", color: confirmText === business?.name ? "#fff" : "#bbb", border:"none", borderRadius:"10px", padding:"10px 20px", fontSize:"13px", fontWeight:700, cursor: confirmText === business?.name && !deleting ? "pointer" : "not-allowed", flex:1 }}>
                    {deleting ? "Deleting…" : "Yes, delete everything"}
                  </button>
                  <button onClick={() => { setShowDeleteConfirm(false); setConfirmText(""); }}
                    style={{ background:"#fff", color:"#888", border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"10px 16px", fontSize:"13px", cursor:"pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop live preview */}
      <div id="setup-preview-panel" style={{ width:"360px", flexShrink:0, position:"sticky", top:"24px" }}>
        <BusinessPagePreview form={form} products={products} logoUrl={logoUrl} isFullPage={false} />
      </div>
      <style>{`
        @media (max-width: 767px) {
          #setup-preview-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}

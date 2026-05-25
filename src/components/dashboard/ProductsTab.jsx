import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { DARK, LIME, MAX_IMAGES, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";
import { ImageLibrary, ProductImagePicker } from "../ImageLibrary";

function normaliseVariants(variants = []) {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((variant) => ({
      id: variant.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: variant.name || "",
      price: variant.price ?? "",
      description: variant.description || "",
    }))
    .filter((variant) => variant.name || variant.price || variant.description);
}

function cleanVariantsForSave(variants = []) {
  return normaliseVariants(variants)
    .filter((variant) => variant.name.trim() && variant.price !== "")
    .map((variant) => ({
      id: variant.id,
      name: variant.name.trim(),
      price: Number(variant.price) || 0,
      description: variant.description.trim(),
    }));
}

function emptyVariant() {
  return { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, name: "", price: "", description: "" };
}

function productThumb(product, size = 46) {
  const value = product.image || product.icon || "🛍️";
  const isUrl = typeof value === "string" && value.startsWith("http");

  if (isUrl) {
    return <img src={value} alt={product.name} style={{ width:size, height:size, borderRadius:"12px", objectFit:"cover", flexShrink:0, border:"1px solid #f0f0f0" }} />;
  }

  return (
    <div style={{ width:size, height:size, background:"#f5f5f5", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", flexShrink:0 }}>
      {value}
    </div>
  );
}

function VariantEditor({ variants, onChange }) {
  function addVariant() {
    onChange([...(variants || []), emptyVariant()]);
  }

  function updateVariant(id, field, value) {
    onChange((variants || []).map((variant) => variant.id === id ? { ...variant, [field]: value } : variant));
  }

  function removeVariant(id) {
    onChange((variants || []).filter((variant) => variant.id !== id));
  }

  return (
    <div style={{ background:"#fff", border:"1.5px solid #eeeeea", borderRadius:"16px", padding:"14px", marginTop:"4px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px", marginBottom:"10px" }}>
        <div>
          <div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>Variants</div>
          <div style={{ fontSize:"12px", color:"#888", lineHeight:1.45, marginTop:"2px" }}>Add simple options like 4 pieces, 8 pieces, small, large, flavour or package size.</div>
        </div>
        <button type="button" onClick={addVariant} style={{ background:"#fff5f9", color:"#d93f7b", border:"1.5px solid #f8b8d2", borderRadius:"10px", padding:"8px 10px", fontSize:"12px", fontWeight:900, cursor:"pointer", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:"6px" }}>
          <PlusCircle size={14} strokeWidth={2.4} />
          Add
        </button>
      </div>

      {(!variants || variants.length === 0) ? (
        <div style={{ background:"#fbfbfb", borderRadius:"12px", padding:"12px", fontSize:"12px", color:"#888" }}>No variants yet. Leave this empty if the item has one fixed price.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {variants.map((variant) => (
            <div key={variant.id} style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"14px", padding:"12px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 1.2fr) minmax(92px, 0.8fr) 34px", gap:"8px", alignItems:"center", marginBottom:"8px" }}>
                <input style={{ ...inputStyle, minWidth:0 }} placeholder="Variant name e.g. 8 pieces" value={variant.name} onChange={(e) => updateVariant(variant.id, "name", e.target.value)} />
                <input style={{ ...inputStyle, minWidth:0 }} type="number" min="0" step="0.01" placeholder="Price" value={variant.price} onChange={(e) => updateVariant(variant.id, "price", e.target.value)} />
                <button type="button" onClick={() => removeVariant(variant.id)} aria-label="Remove variant" style={{ width:"34px", height:"34px", borderRadius:"10px", border:"1px solid #ffd0d0", background:"#fff5f5", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <Trash2 size={15} strokeWidth={2.2} color="#cc3300" />
                </button>
              </div>
              <input style={inputStyle} placeholder="Variant note (optional)" value={variant.description} onChange={(e) => updateVariant(variant.id, "description", e.target.value)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductsTab({ user, business, setGlobalProducts }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [newProduct, setNewProduct] = useState({ name:"", price:"", description:"", icon:"🛍️", image:null, variants:[] });
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!user?.id) return;
    async function loadImages() {
      const { data } = await supabase.storage.from("business-images").list(`product-images/${user.id}`, { limit:MAX_IMAGES, sortBy:{ column:"created_at", order:"asc" } });
      if (data) {
        const mapped = data
          .filter((file) => file.name && file.name !== ".emptyFolderPlaceholder")
          .map((file) => {
            const { data:url } = supabase.storage.from("business-images").getPublicUrl(`product-images/${user.id}/${file.name}`);
            return { url:url.publicUrl, path:`product-images/${user.id}/${file.name}` };
          });
        setImages(mapped);
      }
      setLoadingImages(false);
    }
    loadImages();
  }, [user?.id]);

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    setLoading(true);
    supabase.from("products").select("*").eq("business_id", business.id).order("created_at")
      .then(({ data, error: loadError }) => {
        if (loadError) {
          console.error("Products load:", loadError);
          setError(loadError.message || "Could not load products.");
        }
        if (data) {
          const mapped = data.map((product) => ({
            ...product,
            icon: product.image && !product.image.startsWith("http") ? product.image : "🛍️",
            variants: normaliseVariants(product.variants || []),
          }));
          setProducts(mapped);
          setGlobalProducts && setGlobalProducts(mapped);
        }
        setLoading(false);
      });
  }, [business?.id]);

  function updateProducts(list) {
    setProducts(list);
    setGlobalProducts && setGlobalProducts(list);
  }

  async function handleAdd() {
    if (!business?.id || !newProduct.name.trim() || !newProduct.price) return;
    setSaving(true);
    setError("");
    const imageValue = newProduct.image || newProduct.icon || "🛍️";
    const payload = {
      business_id: business.id,
      name: newProduct.name.trim(),
      price: Number(newProduct.price) || 0,
      description: newProduct.description.trim(),
      image: imageValue,
      variants: cleanVariantsForSave(newProduct.variants),
      is_active: true,
    };

    const { data, error: insertError } = await supabase.from("products").insert([payload]).select().single();
    if (insertError) {
      console.error("Product add:", insertError);
      setError(insertError.message || "Could not save product. Check that the variants column exists in Supabase.");
    }
    if (data) {
      const mapped = { ...data, icon: data.image && !data.image.startsWith("http") ? data.image : "🛍️", variants: normaliseVariants(data.variants || []) };
      updateProducts([...products, mapped]);
      setNewProduct({ name:"", price:"", description:"", icon:"🛍️", image:null, variants:[] });
      setAdding(false);
    }
    setSaving(false);
  }

  async function handleSaveEdit(id) {
    if (!editForm.name?.trim() || !editForm.price) return;
    setSaving(true);
    setError("");
    const imageValue = editForm.image || editForm.icon || "🛍️";
    const payload = {
      name: editForm.name.trim(),
      price: Number(editForm.price) || 0,
      description: (editForm.description || "").trim(),
      image: imageValue,
      variants: cleanVariantsForSave(editForm.variants || []),
    };

    const { data, error: updateError } = await supabase.from("products").update(payload).eq("id", id).select().single();
    if (updateError) {
      console.error("Product update:", updateError);
      setError(updateError.message || "Could not update product. Check that the variants column exists in Supabase.");
    }
    if (data) {
      const mapped = { ...data, icon: data.image && !data.image.startsWith("http") ? data.image : "🛍️", variants: normaliseVariants(data.variants || []) };
      updateProducts(products.map((product) => product.id === id ? mapped : product));
      setEditingId(null);
      setEditForm({});
    }
    setSaving(false);
  }

  async function handleToggleActive(product) {
    const { data, error: toggleError } = await supabase.from("products").update({ is_active:!product.is_active }).eq("id", product.id).select().single();
    if (toggleError) setError(toggleError.message || "Could not update product status.");
    if (data) {
      const mapped = { ...data, icon: data.image && !data.image.startsWith("http") ? data.image : "🛍️", variants: normaliseVariants(data.variants || []) };
      updateProducts(products.map((item) => item.id === product.id ? mapped : item));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product or service?")) return;
    const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message || "Could not delete product.");
      return;
    }
    updateProducts(products.filter((product) => product.id !== id));
  }

  function startEdit(product) {
    const isUrl = product.image && product.image.startsWith("http");
    setEditingId(product.id);
    setEditForm({
      name: product.name || "",
      price: product.price ?? "",
      description: product.description || "",
      icon: isUrl ? "🛍️" : (product.image || product.icon || "🛍️"),
      image: isUrl ? product.image : null,
      variants: normaliseVariants(product.variants || []),
    });
  }

  if (!business?.id) {
    return (
      <div>
        <div style={{ marginBottom:"20px" }}>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Products / Services</h2>
          <p style={{ fontSize:"13px", color:"#888" }}>Manage what your business sells. These items appear on your public page.</p>
        </div>
        <div style={{ background:"#fffbe6", border:"1.5px solid #f0d000", borderRadius:"12px", padding:"16px", fontSize:"13px", color:"#7a5e00" }}>
          Save your business details first, then add your products and services.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Products / Services</h2>
        <p style={{ fontSize:"13px", color:"#888" }}>Manage what your business sells. Add variants for sizes, quantities, flavours or packages.</p>
      </div>

      {error && <div style={{ background:"#fff5f5", border:"1px solid #ffd0d0", color:"#cc3300", borderRadius:"12px", padding:"12px", fontSize:"13px", marginBottom:"14px" }}>{error}</div>}

      {!loadingImages && (
        <div style={{ marginBottom:"24px" }}>
          <ImageLibrary userId={user.id} images={images} setImages={setImages} uploading={uploadingImage} setUploading={setUploadingImage} />
        </div>
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px", gap:"12px" }}>
        <div>
          <div style={{ fontSize:"16px", fontWeight:800, color:DARK }}>Catalogue items</div>
          <div style={{ fontSize:"13px", color:"#aaa", marginTop:"2px" }}>{products.length} item{products.length!==1?"s":""}</div>
        </div>
        <button onClick={() => setAdding(true)} style={{ backgroundColor:DARK, color:LIME, border:"none", borderRadius:"10px", padding:"9px 16px", fontSize:"13px", fontWeight:800, cursor:"pointer", whiteSpace:"nowrap" }}>+ Add product</button>
      </div>

      {adding && (
        <div style={{ background:"#fbfbfb", border:"1.5px solid #d4d7db", borderRadius:"14px", padding:"18px", marginBottom:"14px" }}>
          <div style={{ fontSize:"14px", fontWeight:900, color:DARK, marginBottom:"14px" }}>New product or service</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <div><label style={labelStyle}>Name</label><input style={inputStyle} placeholder="e.g. Brownies" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name:e.target.value})} /></div>
            <div><label style={labelStyle}>Base price</label><input style={inputStyle} type="number" min="0" step="0.01" placeholder="e.g. 80" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price:e.target.value})} /></div>
            <div><label style={labelStyle}>Description</label><input style={inputStyle} placeholder="Describe the item" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description:e.target.value})} /></div>
            <ProductImagePicker images={images} selectedImage={newProduct.image} selectedIcon={newProduct.icon}
              onImageSelect={(url) => setNewProduct((product) => ({...product, image:url}))}
              onIconSelect={(icon) => setNewProduct((product) => ({...product, icon, image:null}))} />
            <VariantEditor variants={newProduct.variants} onChange={(variants) => setNewProduct((product) => ({ ...product, variants }))} />
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={handleAdd} disabled={saving} style={{ backgroundColor:LIME, color:"#fff", border:"none", borderRadius:"10px", padding:"10px 20px", fontSize:"13px", fontWeight:800, cursor:saving?"not-allowed":"pointer", flex:1 }}>{saving?"Saving...":"Save product"}</button>
              <button onClick={() => { setAdding(false); setNewProduct({name:"",price:"",description:"",icon:"🛍️",image:null,variants:[]}); }} style={{ background:"#fff", color:"#888", border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"10px 16px", fontSize:"13px", cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div style={{ fontSize:"13px", color:"#aaa", padding:"20px 0" }}>Loading...</div> :
        products.length === 0 ? (
          <div style={{ background:"#fbfbfb", border:"1.5px dashed #ddd", borderRadius:"14px", padding:"32px", textAlign:"center" }}>
            <div style={{ fontSize:"28px", marginBottom:"10px" }}>🛍️</div>
            <div style={{ fontSize:"14px", fontWeight:800, color:DARK }}>No products yet. Add your first product or service.</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {products.map((product) => {
              const variants = normaliseVariants(product.variants || []);
              return (
                <div key={product.id} style={{ background:"#fff", border:`1.5px solid ${editingId===product.id?LIME:"#eeeeea"}`, borderRadius:"14px", padding:"14px 18px", opacity:product.is_active?1:0.55 }}>
                  {editingId===product.id ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                      <div><label style={labelStyle}>Name</label><input style={inputStyle} value={editForm.name || ""} onChange={(e) => setEditForm({...editForm,name:e.target.value})} placeholder="Product name" /></div>
                      <div><label style={labelStyle}>Base price</label><input style={inputStyle} type="number" min="0" step="0.01" value={editForm.price ?? ""} onChange={(e) => setEditForm({...editForm,price:e.target.value})} placeholder="Price" /></div>
                      <div><label style={labelStyle}>Description</label><input style={inputStyle} value={editForm.description || ""} onChange={(e) => setEditForm({...editForm,description:e.target.value})} placeholder="Description" /></div>
                      <ProductImagePicker images={images} selectedImage={editForm.image} selectedIcon={editForm.icon}
                        onImageSelect={(url) => setEditForm((form) => ({...form,image:url}))}
                        onIconSelect={(icon) => setEditForm((form) => ({...form,icon,image:null}))} />
                      <VariantEditor variants={editForm.variants || []} onChange={(variants) => setEditForm((form) => ({ ...form, variants }))} />
                      <div style={{ display:"flex", gap:"8px" }}>
                        <button onClick={() => handleSaveEdit(product.id)} disabled={saving} style={{ backgroundColor:LIME, color:"#fff", border:"none", borderRadius:"10px", padding:"9px 18px", fontSize:"13px", fontWeight:800, cursor:saving?"not-allowed":"pointer", flex:1 }}>{saving?"Saving...":"Save"}</button>
                        <button onClick={() => { setEditingId(null); setEditForm({}); }} style={{ background:"#fff", color:"#888", border:"1.5px solid #e0e0e0", borderRadius:"10px", padding:"9px 14px", fontSize:"13px", cursor:"pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
                      {productThumb(product)}
                      <div style={{ flex:"1 1 180px", minWidth:0 }}>
                        <div style={{ fontSize:"14px", fontWeight:800, color:DARK }}>{product.name}</div>
                        {product.description && <div style={{ fontSize:"12px", color:"#aaa", marginTop:"2px", lineHeight:1.45 }}>{product.description}</div>}
                        {variants.length > 0 && <div style={{ fontSize:"11px", color:"#d93f7b", marginTop:"6px", fontWeight:800 }}>{variants.length} variant{variants.length !== 1 ? "s" : ""}</div>}
                      </div>
                      <div style={{ fontSize:"16px", fontWeight:950, color:DARK, minWidth:"60px", textAlign:"right" }}>R{Number(product.price || 0).toLocaleString()}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                        <button onClick={() => startEdit(product)} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #e0e0e0", background:"#fbfbfb", color:"#555", cursor:"pointer", fontWeight:700 }}>Edit</button>
                        <button onClick={() => handleToggleActive(product)} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #e0e0e0", background:product.is_active?"#fff5f9":"#f5f5f5", color:product.is_active?"#d93f7b":"#aaa", cursor:"pointer", fontWeight:700, whiteSpace:"nowrap" }}>{product.is_active?"Active":"Hidden"}</button>
                        <button onClick={() => handleDelete(product.id)} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #ffd0d0", background:"#fff5f5", color:"#cc3300", cursor:"pointer", fontWeight:700 }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

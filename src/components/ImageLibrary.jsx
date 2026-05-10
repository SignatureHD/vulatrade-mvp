import React, { useRef } from "react";
import { LIME, DARK, MAX_IMAGES, PRODUCT_ICONS } from "../constants";
import { compressImage } from "../utils";
import { supabase } from "../lib/supabase";

// ── IMAGE LIBRARY ──────────────────────────────────────────
export function ImageLibrary({ userId, images, setImages, uploading, setUploading }) {
  const fileRef = useRef();
  const atLimit = images.length >= MAX_IMAGES;

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file || atLimit) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const path = `product-images/${userId}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("business-images").upload(path, compressed, { upsert:false });
      if (!error) {
        const { data } = supabase.storage.from("business-images").getPublicUrl(path);
        setImages((prev) => [...prev, { url:data.publicUrl, path }]);
      }
    } catch(err) { console.error("Upload error:", err); }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(img) {
    if (!window.confirm("Remove this image? Products using it will fall back to their icon.")) return;
    await supabase.storage.from("business-images").remove([img.path]);
    setImages((prev) => prev.filter((i) => i.path !== img.path));
  }

  return (
    <div style={{ background:"#fbfbfb", border:"1.5px solid #eeeeea", borderRadius:"16px", padding:"20px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
        <div>
          <div style={{ fontSize:"15px", fontWeight:700, color:DARK }}>Product Image Library</div>
          <div style={{ fontSize:"12px", color:"#aaa", marginTop:"2px" }}>{images.length}/{MAX_IMAGES} images · Upload once, use on any product</div>
        </div>
        {!atLimit && (
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            style={{ backgroundColor:DARK, color:LIME, border:"none", borderRadius:"10px", padding:"9px 16px", fontSize:"13px", fontWeight:700, cursor:uploading?"not-allowed":"pointer", whiteSpace:"nowrap", opacity:uploading?0.6:1 }}>
            {uploading ? "Uploading…" : "+ Add image"}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleUpload} />
      </div>
      {atLimit && (
        <div style={{ fontSize:"12px", color:"#888", background:"#fff", border:"1px solid #d4d7db", borderRadius:"10px", padding:"8px 12px", marginBottom:"12px" }}>
          📦 {MAX_IMAGES}-image limit reached. Delete one to add another. Higher limits on paid plans.
        </div>
      )}
      {images.length === 0 ? (
        <div onClick={() => fileRef.current.click()} style={{ border:"2px dashed #ddd", borderRadius:"12px", padding:"28px", textAlign:"center", cursor:"pointer", marginTop:"12px" }}>
          <div style={{ fontSize:"28px", marginBottom:"8px" }}>🖼️</div>
          <div style={{ fontSize:"13px", fontWeight:600, color:"#888" }}>No images yet</div>
          <div style={{ fontSize:"12px", color:"#bbb", marginTop:"4px" }}>Tap to upload your first product photo</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:"8px", marginTop:"14px" }}>
          {images.map((img) => (
            <div key={img.path} style={{ position:"relative", aspectRatio:"1", borderRadius:"10px", overflow:"hidden", border:"1.5px solid #d4d7db" }}>
              <img src={img.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <button onClick={() => handleDelete(img)}
                style={{ position:"absolute", top:"4px", right:"4px", width:"20px", height:"20px", borderRadius:"50%", background:"rgba(0,0,0,0.65)", border:"none", color:"#fff", fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: MAX_IMAGES - images.length }).map((_,i) => (
            <div key={`e${i}`} onClick={() => fileRef.current.click()}
              style={{ aspectRatio:"1", borderRadius:"10px", border:"1.5px dashed #ddd", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", color:"#ccc" }}>
              +
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PRODUCT IMAGE PICKER ───────────────────────────────────
export function ProductImagePicker({ images, selectedImage, selectedIcon, onImageSelect, onIconSelect }) {
  const [tab, setTab] = React.useState(selectedImage ? "image" : "icon");

  const tabBtn = (key, label) => (
    <button onClick={() => setTab(key)}
      style={{ padding:"6px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:700, border:"none", cursor:"pointer", background: tab===key ? DARK : "transparent", color: tab===key ? LIME : "#888" }}>
      {label}
    </button>
  );

  return (
    <div>
      <label style={{ fontSize:"12px", fontWeight:600, color:"#555", marginBottom:"6px", display:"block" }}>Product visual</label>
      <div style={{ background:"#fbfbfb", border:"1.5px solid #d4d7db", borderRadius:"12px", padding:"12px" }}>
        <div style={{ display:"flex", gap:"4px", marginBottom:"12px", background:"#efefed", borderRadius:"10px", padding:"3px", width:"fit-content" }}>
          {tabBtn("image","📷 Photo")}
          {tabBtn("icon","😀 Icon")}
        </div>
        {tab === "image" && (
          <div>
            {images.length === 0 ? (
              <div style={{ fontSize:"12px", color:"#aaa", padding:"4px 0" }}>No images in your library yet. Add photos above and they'll appear here.</div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:"6px" }}>
                {images.map((img) => (
                  <div key={img.path} onClick={() => onImageSelect(img.url)}
                    style={{ aspectRatio:"1", borderRadius:"8px", overflow:"hidden", cursor:"pointer", border:`2.5px solid ${selectedImage===img.url ? LIME : "transparent"}`, boxShadow: selectedImage===img.url ? `0 0 0 1px ${LIME}` : "none" }}>
                    <img src={img.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  </div>
                ))}
                {selectedImage && (
                  <div onClick={() => onImageSelect(null)}
                    style={{ aspectRatio:"1", borderRadius:"8px", border:"1.5px dashed #ddd", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#bbb", flexDirection:"column", gap:"2px" }}>
                    <span style={{ fontSize:"14px" }}>✕</span><span>Clear</span>
                  </div>
                )}
              </div>
            )}
            {selectedImage && <div style={{ marginTop:"8px", fontSize:"11px", color:"#d93f7b" }}>✓ Photo selected — shows on your page</div>}
          </div>
        )}
        {tab === "icon" && (
          <div>
            {selectedImage && (
              <div style={{ fontSize:"11px", color:"#f0a050", background:"#fff8ee", border:"1px solid #f0d080", borderRadius:"8px", padding:"6px 10px", marginBottom:"10px" }}>
                ⚠️ A photo is selected — choosing an icon will remove it
              </div>
            )}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {PRODUCT_ICONS.map((ic) => (
                <button key={ic} onClick={() => { onIconSelect(ic); onImageSelect(null); }}
                  style={{ width:"38px", height:"38px", borderRadius:"8px", background: selectedIcon===ic && !selectedImage ? DARK : "#fff", border:`1.5px solid ${selectedIcon===ic && !selectedImage ? DARK : "#e0e0e0"}`, fontSize:"20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

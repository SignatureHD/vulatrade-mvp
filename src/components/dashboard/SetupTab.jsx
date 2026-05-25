import React, { useEffect, useRef, useState } from "react";
import { Info, Link as LinkIcon, Trash2 } from "lucide-react";
import { LIME, DARK, CATEGORIES, PAYMENT_METHODS, ICON_TEMPLATES, inputStyle, labelStyle } from "../../constants";
import { compressImage, injectAllUnlockedFonts } from "../../utils";
import { supabase } from "../../lib/supabase";
import { BusinessPagePreview } from "../BusinessPagePreview";
import { ColourPicker, FontPicker } from "../ui";

const SOCIAL_FIELDS = [
  { key:"facebook", label:"Facebook Page", placeholder:"https://facebook.com/your-page" },
  { key:"facebookMarketplace", label:"Facebook Marketplace", placeholder:"Paste your Marketplace profile or listing link" },
  { key:"tiktok", label:"TikTok", placeholder:"https://tiktok.com/@yourname" },
  { key:"instagram", label:"Instagram", placeholder:"https://instagram.com/yourname" },
  { key:"googleBusiness", label:"Google Business Profile", placeholder:"Paste your Google Business Profile link" },
  { key:"website", label:"Website", placeholder:"https://yourwebsite.co.za" },
];

function localSocialKey(userId) {
  return `vula_where_you_sell_${userId}`;
}

function loadLocalSocials(userId) {
  if (!userId) return {};
  try {
    return JSON.parse(localStorage.getItem(localSocialKey(userId)) || "{}");
  } catch {
    return {};
  }
}

function saveLocalSocials(userId, socials) {
  if (!userId) return;
  localStorage.setItem(localSocialKey(userId), JSON.stringify(socials));
}

function socialColumnPayload(form) {
  return {
    facebook_url: form.facebook.trim(),
    facebook_marketplace_url: form.facebookMarketplace.trim(),
    tiktok_url: form.tiktok.trim(),
    instagram_url: form.instagram.trim(),
    google_business_url: form.googleBusiness.trim(),
    website_url: form.website.trim(),
  };
}

function WhereYouSellSection({ form, update }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"18px", padding:"18px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"16px" }}>
        <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <LinkIcon size={19} strokeWidth={2.2} color="#ea4c89" />
        </span>
        <div>
          <div style={{ fontSize:"16px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Where you sell</div>
          <div style={{ fontSize:"12px", color:"#888", lineHeight:1.5 }}>
            Add the places where customers find you. Later, Vula will use these links to help you create posts for each platform.
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:"12px" }}>
        {SOCIAL_FIELDS.map((field) => (
          <div key={field.key}>
            <label style={labelStyle}>{field.label}</label>
            <input
              style={inputStyle}
              placeholder={field.placeholder}
              value={form[field.key] || ""}
              onChange={(e) => update(field.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"8px", alignItems:"flex-start", background:"#fff8e7", border:"1px solid #f4dfaa", borderRadius:"12px", padding:"10px 11px", fontSize:"11px", color:"#7a5e00", lineHeight:1.45, marginTop:"14px" }}>
        <Info size={15} strokeWidth={2.2} style={{ flexShrink:0, marginTop:"1px" }} />
        <span>This does not auto-post yet. For now it simply keeps your selling channels in one place.</span>
      </div>
    </div>
  );
}

export function SetupTab({ user, business, setBusiness, prefilledTemplate, setPrefilledTemplate, setTab, setGlobalProducts, setGlobalLogoUrl }) {
  const localSocials = loadLocalSocials(user?.id);
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
    facebook:    business?.facebook || business?.facebook_url || localSocials.facebook || "",
    facebookMarketplace: business?.facebook_marketplace || business?.facebook_marketplace_url || localSocials.facebookMarketplace || "",
    tiktok:      business?.tiktok || business?.tiktok_url || localSocials.tiktok || "",
    instagram:   business?.instagram || business?.instagram_url || localSocials.instagram || "",
    googleBusiness: business?.google_business || business?.google_business_url || localSocials.googleBusiness || "",
    website:     business?.website || business?.website_url || localSocials.website || "",
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
  }, [prefilledTemplate, setPrefilledTemplate]);

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
  }, [business?.id, setGlobalProducts]);

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
  }, [prefilledProducts, savedBusinessId, setGlobalProducts]);

  function update(field, value) { setForm((prev) => ({...prev,[field]:value})); setSaved(false); }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const compressed = await compressImage(file);
    const path = `logos/${user.id}.jpg`;
    const { error:upErr } = await supabase.storage.from("business-images").upload(path, compressed, { upsert:true });
    if (!upErr) {
      const { data } = supabase.storage.from("business-images").getPublicUrl(path);
      setLogoUrl(data.publicUrl + "?t=" + Date.now());
    }
    setUploading(false);
  }

  async function saveWithFallback(payload, socialPayload) {
    const { data, error:err } = await supabase.from("businesses").upsert([{ ...payload, ...socialPayload }], { onConflict:"user_id" }).select().single();
    if (!err) return { data, error:null, savedSocialsToDatabase:true };

    const message = `${err.message || ""} ${err.details || ""}`.toLowerCase();
    const missingSocialColumn = ["facebook_url", "facebook_marketplace_url", "tiktok_url", "instagram_url", "google_business_url", "website_url", "schema cache"].some((term) => message.includes(term));
    if (!missingSocialColumn) return { data:null, error:err, savedSocialsToDatabase:false };

    const fallback = await supabase.from("businesses").upsert([payload], { onConflict:"user_id" }).select().single();
    return fallback.error
      ? { data:null, error:fallback.error, savedSocialsToDatabase:false }
      : { data:fallback.data, error:null, savedSocialsToDatabase:false };
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Business name is required."); return; }
    setSaving(true); setError("");
    const slug = form.name.toLowerCase().trim().replaceAll(" ","-").replace(/[^a-z0-9-]/g,"");
    const socialPayload = socialColumnPayload(form);
    const localSocialPayload = {
      facebook: form.facebook.trim(),
      facebookMarketplace: form.facebookMarketplace.trim(),
      tiktok: form.tiktok.trim(),
      instagram: form.instagram.trim(),
      googleBusiness: form.googleBusiness.trim(),
      website: form.website.trim(),
    };
    const payload = {
      name:form.name.trim(),
      slug,
      owner:form.owner.trim(),
      category:form.category,
      area:form.area.trim(),
      description:form.description.trim(),
      whatsapp:form.whatsapp.trim(),
      payment:form.payment,
      user_id:user.id,
      theme:form.bgColour,
      background_style:form.icon,
      font:form.font,
      catalogue:logoUrl||"",
    };
    saveLocalSocials(user.id, localSocialPayload);
    const { data, error:err, savedSocialsToDatabase } = await saveWithFallback(payload, socialPayload);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setBusiness(savedSocialsToDatabase ? data : { ...data, ...socialPayload, ...localSocialPayload });
      setSavedBusinessId(data.id);
    }
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
      localStorage.removeItem(localSocialKey(user.id));
      setBusiness(null);
      setGlobalProducts([]);
      setGlobalLogoUrl(null);
    } catch (err) { console.error("Delete error:", err); }
    setDeleting(false);
  }

  const iconOptions = ICON_TEMPLATES[form.category] || ICON_TEMPLATES["Other"];

  return (
    <div style={{ display:"flex", gap:"40px", alignItems:"flex-start", position:"relative" }}>
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

          <WhereYouSellSection form={form} update={update} />

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

        {savedBusinessId && (
          <div style={{ marginTop:"48px", border:"1.5px solid #ffd0d0", borderRadius:"16px", padding:"24px", background:"#fffafa" }}>
            <div style={{ fontSize:"13px", fontWeight:700, color:"#cc3300", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px", display:"flex", alignItems:"center", gap:"7px" }}><Trash2 size={15} /> Danger Zone</div>
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

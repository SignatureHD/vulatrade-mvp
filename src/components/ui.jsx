import React, { useRef, useState } from "react";
import {
  LIME,
  DARK,
  BG_COLOURS,
  FONTS,
  CUSTOM_BACKGROUND_OVERLAYS,
  CUSTOM_BACKGROUND_POSITIONS,
  CUSTOM_BACKGROUND_ZOOMS,
  CUSTOM_TEXT_COLOURS,
  createCustomBackgroundThemeValue,
  isCustomBackgroundTheme,
  parseCustomBackgroundTheme,
  isPlanLocked,
  planLabel,
  statusConfig,
} from "../constants";
import { compressBackgroundImage, injectFont } from "../utils";
import { supabase } from "../lib/supabase";

// ── UPGRADE NUDGE ──────────────────────────────────────────
export function UpgradeNudge({ plan, onViewPlans }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fffbe6", border:"1.5px solid #f0d000", borderRadius:"10px", padding:"10px 14px", marginTop:"10px" }}>
      <div style={{ fontSize:"13px", color:"#7a5e00" }}>
        🔒 <strong>{planLabel(plan)} plan</strong> — unlock more options by upgrading
      </div>
      <button onClick={onViewPlans} style={{ fontSize:"12px", fontWeight:700, color:"#5a4000", background:"transparent", border:"1.5px solid #d0a800", borderRadius:"8px", padding:"5px 12px", cursor:"pointer", whiteSpace:"nowrap" }}>
        See plans →
      </button>
    </div>
  );
}

// ── STATUS BADGE ───────────────────────────────────────────
export function StatusBadge({ status, small }) {
  const s = statusConfig(status);
  return (
    <span style={{
      fontSize: small ? "10px" : "11px",
      fontWeight: 700,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: "6px",
      padding: small ? "1px 6px" : "2px 8px",
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

function selectorButtonStyle(active) {
  return {
    padding:"7px 10px",
    borderRadius:"999px",
    border:`1.5px solid ${active ? DARK : "#e0e0e0"}`,
    background: active ? DARK : "#fff",
    color: active ? "#fff" : "#555",
    fontSize:"11px",
    fontWeight:800,
    cursor:"pointer",
  };
}

function colourButtonStyle(active, css) {
  return {
    ...selectorButtonStyle(active),
    display:"inline-flex",
    alignItems:"center",
    gap:"6px",
  };
}

function ensureCustomTheme(value) {
  return isCustomBackgroundTheme(value) ? parseCustomBackgroundTheme(value) : null;
}

function CustomBackgroundControls({ value, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const settings = parseCustomBackgroundTheme(value);
  const hasCustomPhoto = isCustomBackgroundTheme(value) && Boolean(settings.url);

  function updateSetting(field, nextValue) {
    onChange(createCustomBackgroundThemeValue({ ...settings, [field]: nextValue }));
  }

  async function uploadBackground(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Please upload a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Please upload an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || "pilot";
      const compressed = await compressBackgroundImage(file);
      const path = `backgrounds/${userId}/background.jpg`;
      const { error: uploadError } = await supabase.storage.from("business-images").upload(path, compressed, {
        upsert: true,
        contentType: "image/jpeg",
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("business-images").getPublicUrl(path);
      onChange(createCustomBackgroundThemeValue({
        ...settings,
        url: `${data.publicUrl}?t=${Date.now()}`,
        overlay: settings.overlay || "medium",
        position: settings.position || "center",
        zoom: settings.zoom || "normal",
        headingTextColour: settings.headingTextColour || settings.textColour || "white",
        descriptionTextColour: settings.descriptionTextColour || "grey",
      }));
    } catch (err) {
      console.error("Background upload error:", err);
      setError("Background photo could not be uploaded. Please try a smaller JPG or PNG.");
    }
    event.target.value = "";
    setUploading(false);
  }

  function removeCustomPhoto() {
    onChange(BG_COLOURS[0].value);
  }

  return (
    <div style={{ marginTop:"14px", background:"#fff", border:"1.5px solid #eeeeea", borderRadius:"18px", padding:"16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap:"12px", alignItems:"flex-start", marginBottom:"12px" }}>
        <div>
          <div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>Custom Background Photo</div>
          <div style={{ fontSize:"12px", color:"#888", lineHeight:1.5, marginTop:"3px" }}>
            Upload one background photo. VulaTrade compresses it and adds an overlay so your page stays readable.
          </div>
        </div>
        <span style={{ fontSize:"10px", fontWeight:900, color:"#d93f7b", background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"999px", padding:"5px 8px", whiteSpace:"nowrap" }}>Pro</span>
      </div>

      {hasCustomPhoto && (
        <div style={{ height:"110px", borderRadius:"16px", backgroundImage:`linear-gradient(rgba(0,0,0,0.38), rgba(0,0,0,0.38)), url(${settings.url})`, backgroundSize:"cover", backgroundPosition:"center", marginBottom:"12px", border:"1px solid #eeeeea" }} />
      )}

      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center", marginBottom:"10px" }}>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ background:DARK, color:"#fff", border:"none", borderRadius:"12px", padding:"10px 14px", fontSize:"12px", fontWeight:900, cursor:uploading?"not-allowed":"pointer" }}>
          {uploading ? "Uploading..." : hasCustomPhoto ? "Change photo" : "Upload custom photo"}
        </button>
        {hasCustomPhoto && <button type="button" onClick={removeCustomPhoto} style={{ background:"#fff", color:"#cc3300", border:"1.5px solid #ffd0d0", borderRadius:"12px", padding:"10px 12px", fontSize:"12px", fontWeight:800, cursor:"pointer" }}>Remove</button>}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:"none" }} onChange={uploadBackground} />
      </div>

      <div style={{ fontSize:"11px", color:"#888", lineHeight:1.5, marginBottom:"12px" }}>
        Best results: landscape photo, 1600 × 900 px recommended, minimum 1200 × 675 px, under 5 MB. Avoid screenshots, text-heavy images and very busy photos.
      </div>

      {error && <div style={{ background:"#fff0ee", color:"#cc3300", borderRadius:"10px", padding:"9px 10px", fontSize:"12px", marginBottom:"12px" }}>{error}</div>}

      {hasCustomPhoto && (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div>
            <div style={{ fontSize:"11px", color:"#555", fontWeight:900, marginBottom:"7px" }}>Overlay</div>
            <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
              {CUSTOM_BACKGROUND_OVERLAYS.map((item) => <button type="button" key={item.value} onClick={() => updateSetting("overlay", item.value)} style={selectorButtonStyle(settings.overlay === item.value)}>{item.label}</button>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize:"11px", color:"#555", fontWeight:900, marginBottom:"7px" }}>Photo position</div>
            <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
              {CUSTOM_BACKGROUND_POSITIONS.map((item) => <button type="button" key={item.value} onClick={() => updateSetting("position", item.value)} style={selectorButtonStyle(settings.position === item.value)}>{item.label}</button>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize:"11px", color:"#555", fontWeight:900, marginBottom:"7px" }}>Photo zoom</div>
            <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
              {CUSTOM_BACKGROUND_ZOOMS.map((item) => <button type="button" key={item.value} onClick={() => updateSetting("zoom", item.value)} style={selectorButtonStyle(settings.zoom === item.value)}>{item.label}</button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── COLOUR PICKER ──────────────────────────────────────────
export function ColourPicker({ value, onChange, onViewPlans }) {
  const [nudgePlan, setNudgePlan] = useState(null);

  function handleClick(colour) {
    if (isPlanLocked(colour.plan)) {
      setNudgePlan(nudgePlan === colour.plan ? null : colour.plan);
      return;
    }
    setNudgePlan(null);
    onChange(colour.value);
  }

  return (
    <div>
      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
        {BG_COLOURS.map((c) => {
          const locked = isPlanLocked(c.plan);
          const selected = value === c.value;
          const tier = planLabel(c.plan) || "Free";
          return (
            <button
              key={c.value}
              onClick={() => handleClick(c)}
              title={locked ? `🔒 ${tier} plan — ${c.name}` : `${c.name} · ${tier}`}
              style={{
                width:"74px",
                minHeight:"76px",
                borderRadius:"16px",
                border: selected ? `2px solid ${LIME}` : "1.5px solid #eeeeea",
                background:"#fff",
                cursor:"pointer",
                outline:"none",
                boxShadow: selected ? "0 0 0 2px #fff, 0 0 0 4px #ea4c89" : "none",
                opacity: locked ? 0.55 : 1,
                padding:"7px",
                textAlign:"left",
                position:"relative",
              }}
            >
              <span style={{ display:"block", height:"28px", borderRadius:"10px", background:c.value, border:"1px solid rgba(0,0,0,0.08)", marginBottom:"6px" }} />
              <span style={{ display:"block", fontSize:"10px", color:DARK, fontWeight:850, lineHeight:1.15 }}>{c.name}</span>
              <span style={{ display:"block", fontSize:"9px", color: locked ? "#bbb" : "#999", fontWeight:750, marginTop:"3px" }}>
                {locked ? "🔒 " : ""}{tier}
              </span>
            </button>
          );
        })}
      </div>
      <CustomBackgroundControls value={value} onChange={onChange} />
      <div style={{ fontSize:"11px", color:"#888", marginTop:"10px", lineHeight:1.45 }}>
        Pilot mode: all Starter and Pro colours, patterns and custom photo backgrounds are unlocked for testing.
      </div>
      {nudgePlan && <UpgradeNudge plan={nudgePlan} onViewPlans={() => { setNudgePlan(null); onViewPlans(); }} />}
    </div>
  );
}

export function TextColourPicker({ value, onChange }) {
  const settings = ensureCustomTheme(value);
  const hasCustomPhoto = Boolean(settings?.url);

  function updateTheme(field, nextValue) {
    if (!settings) return;
    onChange(createCustomBackgroundThemeValue({ ...settings, [field]: nextValue }));
  }

  if (!hasCustomPhoto) {
    return (
      <div style={{ marginTop:"12px", background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"14px", padding:"12px", fontSize:"12px", color:"#888", lineHeight:1.45 }}>
        Text colour controls appear after you upload a custom background photo.
      </div>
    );
  }

  const headingValue = settings.headingTextColour || settings.textColour || "white";
  const descriptionValue = settings.descriptionTextColour || "grey";

  return (
    <div style={{ marginTop:"14px", background:"#fff", border:"1.5px solid #eeeeea", borderRadius:"16px", padding:"14px" }}>
      <div style={{ fontSize:"13px", color:DARK, fontWeight:900, marginBottom:"4px" }}>Page text colours</div>
      <div style={{ fontSize:"11px", color:"#888", lineHeight:1.45, marginBottom:"12px" }}>Choose separate colours for the business name and description.</div>
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        <div>
          <div style={{ fontSize:"11px", color:"#555", fontWeight:900, marginBottom:"7px" }}>Business heading colour</div>
          <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
            {CUSTOM_TEXT_COLOURS.map((item) => <button type="button" key={item.value} onClick={() => updateTheme("headingTextColour", item.value)} style={colourButtonStyle(headingValue === item.value, item.css)}><span style={{ width:"10px", height:"10px", borderRadius:"50%", background:item.css, border:"1px solid #d8d8d4" }} />{item.label}</button>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize:"11px", color:"#555", fontWeight:900, marginBottom:"7px" }}>Description colour</div>
          <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
            {CUSTOM_TEXT_COLOURS.map((item) => <button type="button" key={item.value} onClick={() => updateTheme("descriptionTextColour", item.value)} style={colourButtonStyle(descriptionValue === item.value, item.css)}><span style={{ width:"10px", height:"10px", borderRadius:"50%", background:item.css, border:"1px solid #d8d8d4" }} />{item.label}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FONT PICKER ────────────────────────────────────────────
export function FontPicker({ value, onChange, onViewPlans }) {
  const [nudgePlan, setNudgePlan] = useState(null);

  function handleClick(font) {
    if (isPlanLocked(font.plan)) {
      setNudgePlan(nudgePlan === font.plan ? null : font.plan);
      return;
    }
    setNudgePlan(null);
    if (font.import) injectFont(font.import);
    onChange(font.value);
  }

  return (
    <div>
      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
        {FONTS.map((f) => {
          const locked   = isPlanLocked(f.plan);
          const selected = value === f.value;
          return (
            <button
              key={f.value}
              onClick={() => handleClick(f)}
              style={{
                position:"relative",
                padding:"10px 16px",
                borderRadius:"12px",
                border:`1.5px solid ${selected ? DARK : "#e0e0e0"}`,
                background: selected ? DARK : "#fff",
                cursor:"pointer",
                textAlign:"left",
                opacity: locked ? 0.55 : 1,
                minWidth:"110px",
              }}
            >
              <div style={{
                fontSize:"22px",
                fontWeight:700,
                color: selected ? LIME : DARK,
                fontFamily: locked ? "inherit" : (f.value + ", sans-serif"),
                marginBottom:"2px",
                lineHeight:1,
              }}>
                {f.sample}
              </div>
              <div style={{ fontSize:"11px", color: selected ? "#aaa" : "#888", fontWeight:600 }}>
                {locked ? "🔒 " : ""}{f.label}
              </div>
              <div style={{ fontSize:"9px", color:selected ? "#777" : "#bbb", marginTop:"2px" }}>{planLabel(f.plan) || "Free"}</div>
            </button>
          );
        })}
      </div>
      {nudgePlan && <UpgradeNudge plan={nudgePlan} onViewPlans={() => { setNudgePlan(null); onViewPlans(); }} />}
    </div>
  );
}

import React, { useState } from "react";
import { LIME, DARK, BG_COLOURS, FONTS, CUSTOMER_STATUSES, isPlanLocked, planLabel, statusConfig } from "../constants";
import { injectFont } from "../utils";

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
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
        {BG_COLOURS.map((c) => {
          const locked = isPlanLocked(c.plan);
          const selected = value === c.value;
          return (
            <div key={c.value} style={{ position:"relative" }} title={locked ? `🔒 ${planLabel(c.plan)} plan — ${c.name}` : c.name}>
              <button
                onClick={() => handleClick(c)}
                style={{
                  width:"36px", height:"36px", borderRadius:"50%",
                  background: c.value,
                  border: selected ? `3px solid ${LIME}` : "3px solid transparent",
                  cursor:"pointer",
                  outline:"none",
                  boxShadow: selected ? "0 0 0 2px #fff, 0 0 0 4px #ea4c89" : "none",
                  opacity: locked ? 0.5 : 1,
                  filter: locked ? "grayscale(20%)" : "none",
                }}
              />
              {locked && (
                <div style={{ position:"absolute", bottom:"-2px", right:"-2px", width:"14px", height:"14px", borderRadius:"50%", background:"#fff", border:"1px solid #ddd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"8px", lineHeight:1 }}>
                  🔒
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:"14px", marginTop:"8px", flexWrap:"wrap" }}>
        {["free","starter","pro"].map((tier) => {
          const count = BG_COLOURS.filter((c) => c.plan === tier).length;
          const locked = isPlanLocked(tier);
          return (
            <div key={tier} style={{ fontSize:"11px", color: locked ? "#bbb" : "#888", display:"flex", alignItems:"center", gap:"4px" }}>
              {locked && "🔒 "}{planLabel(tier) || "Free"}: {count} colours
            </div>
          );
        })}
      </div>
      {nudgePlan && <UpgradeNudge plan={nudgePlan} onViewPlans={() => { setNudgePlan(null); onViewPlans(); }} />}
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
              {locked && (
                <div style={{ fontSize:"9px", color:"#bbb", marginTop:"2px" }}>{planLabel(f.plan)} plan</div>
              )}
            </button>
          );
        })}
      </div>
      {nudgePlan && <UpgradeNudge plan={nudgePlan} onViewPlans={() => { setNudgePlan(null); onViewPlans(); }} />}
    </div>
  );
}

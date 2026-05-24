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
      <div style={{ fontSize:"11px", color:"#888", marginTop:"10px", lineHeight:1.45 }}>
        Pilot mode: all Starter and Pro colours, patterns and photo backgrounds are unlocked for testing.
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
              <div style={{ fontSize:"9px", color:selected ? "#777" : "#bbb", marginTop:"2px" }}>{planLabel(f.plan) || "Free"}</div>
            </button>
          );
        })}
      </div>
      {nudgePlan && <UpgradeNudge plan={nudgePlan} onViewPlans={() => { setNudgePlan(null); onViewPlans(); }} />}
    </div>
  );
}

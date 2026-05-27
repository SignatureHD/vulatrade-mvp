import React, { useMemo, useState } from "react";
import { DARK, inputStyle, labelStyle } from "../constants";
import { supabase } from "../lib/supabase";
import Logo from "./Logo";

export const CURRENT_CONSENT_VERSION = "2026-05-v1";

const REQUIRED_FIELDS = ["terms_accepted", "privacy_accepted", "popia_accepted"];

const CONSENT_COPY = {
  terms_accepted: "I accept the VulaTrade Terms of Use.",
  privacy_accepted: "I accept the VulaTrade Privacy Policy.",
  popia_accepted: "I consent to VulaTrade processing my personal information for account, business profile, customer, booking, sales and support purposes in line with POPIA.",
  marketing_opt_in: "I would like to receive optional VulaTrade marketing, tips and product updates.",
  whatsapp_opt_in: "I consent to optional WhatsApp communication for support, onboarding reminders and VulaTrade updates.",
};

const EMPTY_CONSENT = {
  terms_accepted: false,
  privacy_accepted: false,
  popia_accepted: false,
  marketing_opt_in: false,
  whatsapp_opt_in: false,
};

function getStoredSignupConsent() {
  try {
    const raw = localStorage.getItem("vula_signup_consent");
    if (!raw) return EMPTY_CONSENT;
    return { ...EMPTY_CONSENT, ...JSON.parse(raw) };
  } catch {
    return EMPTY_CONSENT;
  }
}

export async function getLatestConsentForUser(userId) {
  if (!userId) return { consent: null, error: null };

  const { data, error } = await supabase
    .from("user_consents")
    .select("*")
    .eq("user_id", userId)
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { consent: data || null, error };
}

export function userHasCurrentConsent(consent) {
  return Boolean(
    consent &&
      consent.consent_version === CURRENT_CONSENT_VERSION &&
      REQUIRED_FIELDS.every((field) => consent[field] === true)
  );
}

export function ConsentScreen({ user, onAccepted, onSignOut }) {
  const [form, setForm] = useState(() => getStoredSignupConsent());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const canContinue = useMemo(
    () => REQUIRED_FIELDS.every((field) => form[field] === true),
    [form]
  );

  function toggle(field) {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  async function saveConsent() {
    if (!canContinue || !user?.id) return;

    setSaving(true);
    setMessage("");

    const payload = {
      user_id: user.id,
      terms_accepted: form.terms_accepted,
      privacy_accepted: form.privacy_accepted,
      popia_accepted: form.popia_accepted,
      marketing_opt_in: form.marketing_opt_in,
      whatsapp_opt_in: form.whatsapp_opt_in,
      consent_version: CURRENT_CONSENT_VERSION,
      accepted_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
    };

    const { error } = await supabase.from("user_consents").insert(payload);

    if (error) {
      setMessage(error.message || "Could not save consent. Please try again.");
      setSaving(false);
      return;
    }

    localStorage.removeItem("vula_signup_consent");
    setSaving(false);
    onAccepted?.();
  }

  function renderCheckbox(field, required = false) {
    return (
      <label
        key={field}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          background: required ? "#fff5f9" : "#fff",
          border: `1px solid ${required ? "#f8b8d2" : "#eeeeea"}`,
          borderRadius: "14px",
          padding: "12px",
          cursor: "pointer",
          lineHeight: 1.45,
        }}
      >
        <input
          type="checkbox"
          checked={Boolean(form[field])}
          onChange={() => toggle(field)}
          style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "#ea4c89" }}
        />
        <span style={{ fontSize: "13px", color: DARK }}>
          {CONSENT_COPY[field]} {required && <strong style={{ color: "#d93f7b" }}>*</strong>}
        </span>
      </label>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fbfbfb", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "560px", background: "#fff", borderRadius: "28px", padding: "28px", boxShadow: "0 18px 60px rgba(32,32,33,0.10)", border: "1px solid #eeeeea" }}>
        <div style={{ marginBottom: "22px" }}>
          <Logo size="compact" tagline />
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 900, color: DARK, margin: "0 0 8px" }}>Privacy and consent</h1>
        <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, margin: "0 0 18px" }}>
          Before you continue, please confirm the required VulaTrade legal and POPIA consent items. Optional marketing and WhatsApp communication can be changed later.
        </p>

        <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
          {renderCheckbox("terms_accepted", true)}
          {renderCheckbox("privacy_accepted", true)}
          {renderCheckbox("popia_accepted", true)}
          {renderCheckbox("marketing_opt_in", false)}
          {renderCheckbox("whatsapp_opt_in", false)}
        </div>

        {message && (
          <div style={{ fontSize: "13px", color: "#b42318", background: "#fff0ee", padding: "10px 14px", borderRadius: "12px", marginBottom: "12px", lineHeight: 1.5 }}>
            {message}
          </div>
        )}

        <button
          onClick={saveConsent}
          disabled={!canContinue || saving}
          style={{ width: "100%", backgroundColor: canContinue ? "#ea4c89" : "#d4d7db", color: "#fff", border: "none", borderRadius: "14px", padding: "14px", fontSize: "15px", fontWeight: 900, cursor: canContinue && !saving ? "pointer" : "not-allowed" }}
        >
          {saving ? "Saving consent..." : "Accept and continue"}
        </button>

        <button
          onClick={onSignOut}
          style={{ width: "100%", background: "transparent", color: "#777", border: "none", padding: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginTop: "4px" }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

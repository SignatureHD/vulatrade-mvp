import React, { useMemo, useState } from "react";
import { DARK, inputStyle } from "../constants";
import { supabase } from "../lib/supabase";
import { DEMO_PHONE_ERROR, normalizeSouthAfricanPhone } from "../utils/demoAccess";
import Logo from "./Logo";

const EMPTY_SIGNUP_CONSENT = {
  terms_accepted: false,
  privacy_accepted: false,
  popia_accepted: false,
  marketing_opt_in: false,
  whatsapp_opt_in: false,
};

export function AuthScreen({ initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoPhone, setDemoPhone] = useState("");
  const [signupConsent, setSignupConsent] = useState(EMPTY_SIGNUP_CONSENT);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [demoMessage, setDemoMessage] = useState("");
  const [demoError, setDemoError] = useState("");

  const signupConsentComplete = useMemo(
    () => signupConsent.terms_accepted && signupConsent.privacy_accepted && signupConsent.popia_accepted,
    [signupConsent]
  );

  function toggleSignupConsent(field) {
    setSignupConsent((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  async function handleSignIn() {
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    setLoading(false);
  }

  async function handleSignUp() {
    setMessage("");

    if (!signupConsentComplete) {
      setMessage("Please accept the required Terms, Privacy Policy and POPIA consent before creating your account.");
      return;
    }

    setLoading(true);
    localStorage.setItem("vula_signup_consent", JSON.stringify(signupConsent));

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email to confirm your account. Your consent choices will be saved when you first sign in.");
    }
    setLoading(false);
  }

  async function handleDemoAccess() {
    setLoading(true);
    setDemoMessage("");
    setDemoError("");

    const normalizedPhone = normalizeSouthAfricanPhone(demoPhone);
    if (!normalizedPhone) {
      setDemoError(DEMO_PHONE_ERROR);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc("check_demo_access_number", {
      input_phone_number: normalizedPhone,
    });

    const result = Array.isArray(data) ? data[0] : data;

    if (error) {
      setDemoError(error.message);
      setLoading(false);
      return;
    }

    if (!result?.approved) {
      setDemoError("This number is not on the VulaTrade demo list yet. Please contact us to request access.");
      setLoading(false);
      return;
    }

    const { error: anonError } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          demo_phone_number: normalizedPhone,
          demo_name: result.name || "",
          demo_business_name: result.business_name || "",
        },
      },
    });

    if (anonError) {
      if (anonError.code === "anonymous_provider_disabled") {
        setDemoError("Demo access is approved, but Supabase anonymous sign-ins are not enabled yet. Enable anonymous auth in the existing Supabase project to continue.");
      } else {
        setDemoError(anonError.message);
      }
      setLoading(false);
      return;
    }

    sessionStorage.setItem("vula_demo_phone_number", normalizedPhone);
    setDemoMessage("Demo access approved. Continue to VulaTrade.");
    setLoading(false);
  }

  function renderSignupConsent(field, label, required = false) {
    return (
      <label key={field} style={{ display:"flex", alignItems:"flex-start", gap:"9px", fontSize:"12px", color:DARK, lineHeight:1.45, cursor:"pointer" }}>
        <input
          type="checkbox"
          checked={Boolean(signupConsent[field])}
          onChange={() => toggleSignupConsent(field)}
          style={{ width:"16px", height:"16px", marginTop:"1px", accentColor:"#ea4c89", flexShrink:0 }}
        />
        <span>{label} {required && <strong style={{ color:"#d93f7b" }}>*</strong>}</span>
      </label>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#fbfbfb", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <a
        href="/"
        style={{
          position:"fixed",
          top:"20px",
          left:"20px",
          display:"inline-flex",
          alignItems:"center",
          gap:"8px",
          background:"#fff",
          color:"#ea4c89",
          border:"2px solid #ea4c89",
          borderRadius:"14px",
          padding:"10px 16px",
          fontSize:"14px",
          fontWeight:800,
          boxShadow:"0 10px 30px rgba(32,32,33,0.08)",
          zIndex:10,
          textDecoration:"none",
        }}
      >
        <span aria-hidden="true">←</span>
        Back to Home
      </a>
      <div style={{ width:"100%", maxWidth:"440px", background:"#fff", borderRadius:"28px", padding:"28px", boxShadow:"0 18px 60px rgba(32,32,33,0.10)", border:"1px solid #eeeeea" }}>
        <div style={{ marginBottom:"28px" }}>
          <Logo size="compact" tagline />
        </div>

        <div style={{ background:"#fde8f1", border:"1px solid #f8b8d2", borderRadius:"22px", padding:"18px", marginBottom:"18px" }}>
          <h2 style={{ fontSize:"22px", fontWeight:900, color:DARK, margin:"0 0 6px" }}>Cellphone demo access</h2>
          <p style={{ fontSize:"13px", color:"#454545", lineHeight:1.6, margin:"0 0 14px" }}>Enter an approved South African cellphone number to continue to the VulaTrade demo.</p>
          <input
            type="tel"
            inputMode="tel"
            placeholder="082 123 4567"
            value={demoPhone}
            onChange={(e) => setDemoPhone(e.target.value)}
            style={{ ...inputStyle, background:"#fff", borderColor:"#f8b8d2" }}
          />
          {demoError && (
            <div style={{ fontSize:"13px", color:"#b42318", background:"#fff0ee", padding:"10px 14px", borderRadius:"12px", marginTop:"10px", lineHeight:1.5 }}>
              {demoError}
            </div>
          )}
          {demoMessage && (
            <div style={{ fontSize:"13px", color:"#d93f7b", background:"#fff", padding:"10px 14px", borderRadius:"12px", marginTop:"10px", lineHeight:1.5, fontWeight:700 }}>
              {demoMessage}
            </div>
          )}
          <button
            onClick={handleDemoAccess}
            disabled={loading}
            style={{ width:"100%", backgroundColor:"#ea4c89", color:"#fff", border:"none", borderRadius:"14px", padding:"14px", fontSize:"15px", fontWeight:900, cursor:loading?"not-allowed":"pointer", marginTop:"12px" }}
          >
            {loading ? "Checking access..." : "Continue with cellphone"}
          </button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"18px 0" }}>
          <div style={{ height:"1px", background:"#eeeeea", flex:1 }} />
          <span style={{ fontSize:"11px", color:"#9ba2ac", fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase" }}>or use email</span>
          <div style={{ height:"1px", background:"#eeeeea", flex:1 }} />
        </div>

        <h2 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"6px" }}>{mode==="signin" ? "Sign in" : "Create account"}</h2>
        <p style={{ fontSize:"13px", color:"#888", marginBottom:"18px" }}>{mode==="signin" ? "Welcome back." : "Start building your business today."}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

          {mode === "signup" && (
            <div style={{ background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"14px", padding:"12px", display:"grid", gap:"9px" }}>
              {renderSignupConsent("terms_accepted", "I accept the VulaTrade Terms of Use.", true)}
              {renderSignupConsent("privacy_accepted", "I accept the VulaTrade Privacy Policy.", true)}
              {renderSignupConsent("popia_accepted", "I consent to VulaTrade processing my personal information for account, business profile and support purposes in line with POPIA.", true)}
              {renderSignupConsent("marketing_opt_in", "Send me optional VulaTrade marketing, tips and product updates.")}
              {renderSignupConsent("whatsapp_opt_in", "Contact me on WhatsApp for optional onboarding support and VulaTrade updates.")}
            </div>
          )}

          {message && (
            <div style={{ fontSize:"13px", color:message.includes("Check")?"#d93f7b":"#cc3300", background:message.includes("Check")?"#fff5f9":"#fff0ee", padding:"10px 14px", borderRadius:"10px" }}>
              {message}
            </div>
          )}
          <button onClick={mode==="signin" ? handleSignIn : handleSignUp} disabled={loading || (mode === "signup" && !signupConsentComplete)}
            style={{ backgroundColor:(mode === "signup" && !signupConsentComplete) ? "#d4d7db" : "#ea4c89", color:"#fff", border:"none", borderRadius:"12px", padding:"14px", fontSize:"15px", fontWeight:800, cursor:loading || (mode === "signup" && !signupConsentComplete)?"not-allowed":"pointer", marginTop:"4px" }}>
            {loading ? "Please wait..." : mode==="signin" ? "Sign In" : "Create Account"}
          </button>
          <button onClick={() => { setMode(mode==="signin"?"signup":"signin"); setMessage(""); }}
            style={{ background:"transparent", border:"none", fontSize:"13px", color:"#888", cursor:"pointer", padding:"4px" }}>
            {mode==="signin" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

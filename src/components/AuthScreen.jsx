import React, { useState } from "react";
import { LIME, DARK, inputStyle } from "../constants";
import { supabase } from "../lib/supabase";

export function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignIn() {
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setMessage(error.message); } else { setMessage("Check your email to confirm your account."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f3", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ width:"100%", maxWidth:"400px", background:"#fff", borderRadius:"24px", padding:"36px", boxShadow:"0 4px 32px rgba(0,0,0,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"28px" }}>
          <div style={{ width:"40px", height:"40px", background:DARK, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:900, color:LIME }}>VT</div>
          <div>
            <div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>VulaTrade</div>
            <div style={{ fontSize:"11px", color:"#aaa" }}>Start local. Sell smarter. Grow stronger.</div>
          </div>
        </div>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"6px" }}>{mode==="signin" ? "Sign in" : "Create account"}</h2>
        <p style={{ fontSize:"13px", color:"#888", marginBottom:"24px" }}>{mode==="signin" ? "Welcome back." : "Start building your business today."}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          {message && (
            <div style={{ fontSize:"13px", color:message.includes("Check")?"#5a9a00":"#cc3300", background:message.includes("Check")?"#f0ffe0":"#fff0ee", padding:"10px 14px", borderRadius:"10px" }}>
              {message}
            </div>
          )}
          <button onClick={mode==="signin" ? handleSignIn : handleSignUp} disabled={loading}
            style={{ backgroundColor:LIME, color:DARK, border:"none", borderRadius:"12px", padding:"14px", fontSize:"15px", fontWeight:800, cursor:"pointer", marginTop:"4px" }}>
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

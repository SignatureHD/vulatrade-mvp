import React, { useMemo, useState } from "react";
import { MapPin, Navigation, ShieldCheck } from "lucide-react";
import { DARK, PINK, SOFT_PINK, LIGHT_PINK_BORDER, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";

function cleanCoordinate(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Number(value.toFixed(6));
}

function permissionMessage(error) {
  if (!error) return "Location could not be captured. Please type your area manually.";
  if (error.code === 1) return "Location permission was blocked. You can allow it in your browser settings or type your area manually.";
  if (error.code === 2) return "Your phone could not find your location right now. Try again or type your area manually.";
  if (error.code === 3) return "Location request took too long. Try again or type your area manually.";
  return "Location could not be captured. Please type your area manually.";
}

export function BusinessLocationTab({ business, setBusiness }) {
  const [area, setArea] = useState(business?.location_label || business?.area || "");
  const [latitude, setLatitude] = useState(business?.latitude ?? null);
  const [longitude, setLongitude] = useState(business?.longitude ?? null);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(business?.delivery_radius_km || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const hasPin = useMemo(() => latitude !== null && longitude !== null, [latitude, longitude]);

  function useCurrentLocation() {
    setError("");
    setStatus("");

    if (!navigator.geolocation) {
      setError("This browser does not support location. Please type your area manually.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(cleanCoordinate(position.coords.latitude));
        setLongitude(cleanCoordinate(position.coords.longitude));
        if (!area) setArea("Current location captured");
        setStatus("Location captured. Add or edit the public area name, then save.");
        setLocating(false);
      },
      (geoError) => {
        setError(permissionMessage(geoError));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  async function saveLocation() {
    if (!business?.id) {
      setError("Please save your business setup first, then add your location.");
      return;
    }

    setSaving(true);
    setError("");
    setStatus("");

    const payload = {
      area: area.trim(),
      location_label: area.trim(),
      latitude,
      longitude,
      location_source: hasPin ? "browser_gps" : "manual",
      show_exact_location: false,
      delivery_radius_km: deliveryRadiusKm === "" ? null : Number(deliveryRadiusKm),
    };

    const { data, error: saveError } = await supabase
      .from("businesses")
      .update(payload)
      .eq("id", business.id)
      .select()
      .single();

    if (saveError) {
      setError(saveError.message);
    } else {
      setBusiness(data);
      setStatus("Location saved. VulaTrade will show your area publicly, not the exact pin.");
    }

    setSaving(false);
  }

  return (
    <div style={{ maxWidth:"860px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"18px" }}>
      <div style={{ background:DARK, borderRadius:"24px", padding:"24px", color:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"10px" }}>
          <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:PINK, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <MapPin size={22} strokeWidth={2.4} />
          </span>
          <div>
            <h2 style={{ fontSize:"22px", fontWeight:900, margin:0 }}>Business Location</h2>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.68)", margin:"4px 0 0", lineHeight:1.5 }}>
              Help customers know where you operate. Your public page shows the area, not the exact pin.
            </p>
          </div>
        </div>
      </div>

      <div style={{ background:"#fff", border:"1.5px solid #eeeeea", borderRadius:"20px", padding:"22px", boxShadow:"0 12px 28px rgba(15,23,42,0.04)" }}>
        <label style={labelStyle}>Where do customers usually find you?</label>
        <input
          style={inputStyle}
          placeholder="e.g. Motherwell NU9, Gqeberha"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
        <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", marginTop:"12px" }}>
          <button
            onClick={useCurrentLocation}
            disabled={locating}
            style={{ background:PINK, color:"#fff", border:"none", borderRadius:"14px", padding:"12px 16px", fontSize:"13px", fontWeight:900, cursor:locating?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:"8px" }}
          >
            <Navigation size={16} strokeWidth={2.4} />
            {locating ? "Finding location..." : "Use my current location"}
          </button>
          <button
            onClick={() => { setLatitude(null); setLongitude(null); setStatus("Exact pin removed. Save to keep area only."); }}
            style={{ background:"#fff", color:"#555", border:"1.5px solid #eeeeea", borderRadius:"14px", padding:"12px 16px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}
          >
            Use area only
          </button>
        </div>

        <div style={{ marginTop:"16px", background:SOFT_PINK, border:`1.5px solid ${LIGHT_PINK_BORDER}`, borderRadius:"16px", padding:"14px", display:"flex", gap:"10px", alignItems:"flex-start" }}>
          <ShieldCheck size={18} strokeWidth={2.4} color={PINK} style={{ flexShrink:0, marginTop:"2px" }} />
          <div style={{ fontSize:"12px", color:"#555", lineHeight:1.5 }}>
            <strong style={{ color:DARK }}>Privacy first:</strong> VulaTrade saves the area for your public page and future WhatsApp Status wording. The exact pin is kept hidden by default.
          </div>
        </div>
      </div>

      <div style={{ background:"#fff", border:"1.5px solid #eeeeea", borderRadius:"20px", padding:"22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"12px" }}>
          <div>
            <label style={labelStyle}>Pin status</label>
            <input style={inputStyle} value={hasPin ? "Captured" : "Area only"} readOnly />
          </div>
          <div>
            <label style={labelStyle}>Delivery radius (km)</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 5"
              value={deliveryRadiusKm}
              onChange={(e) => setDeliveryRadiusKm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div style={{ background:"#fff5f5", border:"1.5px solid #ffd0d0", color:"#cc3300", borderRadius:"14px", padding:"13px", fontSize:"13px", fontWeight:700 }}>{error}</div>}
      {status && <div style={{ background:"#fff5f9", border:"1.5px solid #f8b8d2", color:PINK, borderRadius:"14px", padding:"13px", fontSize:"13px", fontWeight:800 }}>{status}</div>}

      <button
        onClick={saveLocation}
        disabled={saving}
        style={{ background:saving?"#ccc":PINK, color:"#fff", border:"none", borderRadius:"16px", padding:"14px 18px", fontSize:"14px", fontWeight:900, cursor:saving?"not-allowed":"pointer" }}
      >
        {saving ? "Saving location..." : "Save location"}
      </button>
    </div>
  );
}

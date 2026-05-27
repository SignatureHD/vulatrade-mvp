import React, { useMemo, useState } from "react";
import { Crosshair, MapPin } from "lucide-react";
import { inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";

export function BusinessLocationTab({ business, setBusiness }) {
  const [form, setForm] = useState(() => ({
    area: business?.area || "",
    location_label: business?.location_label || "",
    delivery_radius_km: business?.delivery_radius_km ?? 5,
    latitude: business?.latitude ?? null,
    longitude: business?.longitude ?? null,
  }));
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");

  const canSave = useMemo(() => !!business?.id && form.area.trim().length > 0, [business?.id, form.area]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("latitude", pos.coords.latitude);
        update("longitude", pos.coords.longitude);
        setMessage("Location captured. Save to apply it to your business profile.");
        setLocating(false);
      },
      () => {
        setMessage("We could not access your location. Please allow permission and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function saveLocation() {
    if (!canSave) return;
    setSaving(true);
    setMessage("");

    const payload = {
      area: form.area.trim(),
      location_label: form.location_label.trim(),
      delivery_radius_km: Number(form.delivery_radius_km) || 0,
      latitude: form.latitude,
      longitude: form.longitude,
    };

    const { error, data } = await supabase
      .from("businesses")
      .update(payload)
      .eq("id", business.id)
      .select("*")
      .single();

    if (error) {
      setMessage(error.message || "Could not save location settings.");
    } else {
      setBusiness(data);
      setMessage("Location settings saved.");
    }
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: "760px" }}>
      <h2 style={{ margin: "0 0 6px", color: "#202021" }}>Business Location</h2>
      <p style={{ margin: "0 0 18px", color: "#777", fontSize: "13px" }}>
        Set the service area customers can see publicly. Exact pin coordinates are kept private.
      </p>

      <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "16px", padding: "16px", display: "grid", gap: "12px" }}>
        <div>
          <label style={labelStyle}>Area shown to customers</label>
          <input style={inputStyle} value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="e.g. Soweto, Johannesburg" />
        </div>

        <div>
          <label style={labelStyle}>Location label (optional)</label>
          <input style={inputStyle} value={form.location_label} onChange={(e) => update("location_label", e.target.value)} placeholder="e.g. Near Bara Taxi Rank" />
        </div>

        <div>
          <label style={labelStyle}>Delivery radius (km)</label>
          <input type="number" min="0" step="1" style={inputStyle} value={form.delivery_radius_km} onChange={(e) => update("delivery_radius_km", e.target.value)} />
        </div>

        <button type="button" onClick={useCurrentLocation} disabled={locating}
          style={{ background: "#fff", border: "1.5px solid #f8b8d2", color: "#ea4c89", borderRadius: "12px", padding: "11px 14px", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", width: "fit-content" }}>
          <Crosshair size={16} />
          {locating ? "Getting location..." : "Use my current location"}
        </button>

        <div style={{ fontSize: "12px", color: "#888", display: "flex", alignItems: "center", gap: "6px" }}>
          <MapPin size={14} />
          Pin captured privately: {form.latitude && form.longitude ? "Yes" : "No"}
        </div>

        <button type="button" onClick={saveLocation} disabled={!canSave || saving}
          style={{ background: "#ea4c89", color: "#fff", border: "none", borderRadius: "12px", padding: "12px 14px", fontWeight: 900, cursor: "pointer", width: "fit-content" }}>
          {saving ? "Saving..." : "Save location"}
        </button>

        {message && <div style={{ fontSize: "12px", color: "#666" }}>{message}</div>}
      </div>
    </div>
  );
}

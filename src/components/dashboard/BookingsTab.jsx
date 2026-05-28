import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, MessageCircle, Plus, Search } from "lucide-react";
import { DARK, BOOKING_TIMES, BOOKING_STATUS_CONFIG, inputStyle, labelStyle } from "../../constants";
import { todayStr, dateLabel } from "../../utils";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";

function normalizeSouthAfricanPhone(value = "") {
  const cleaned = String(value || "").replace(/[\s().-]/g, "");
  if (!cleaned) return "";
  if (/^0[6-8][0-9]{8}$/.test(cleaned)) return `+27${cleaned.slice(1)}`;
  if (/^\+27[6-8][0-9]{8}$/.test(cleaned)) return cleaned;
  if (/^27[6-8][0-9]{8}$/.test(cleaned)) return `+${cleaned}`;
  return "";
}

function bookingReminderMessage({ business, booking }) {
  const time = booking.booking_time ? ` at ${booking.booking_time}` : "";
  const service = booking.service || "your booking";
  const date = dateLabel(booking.booking_date);
  const businessName = business?.name || "my business";
  return `Hi ${booking.customer_name}, just a reminder about your ${service} with ${businessName} on ${date}${time}. Please reply to confirm.`;
}

function openBookingReminder({ business, booking, customer }) {
  const phone = normalizeSouthAfricanPhone(booking.customer_whatsapp || customer?.whatsapp || "");
  const message = bookingReminderMessage({ business, booking });
  const url = phone ? `https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function CustomerSelect({ customers, value, onSelect }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      (customer.name || "").toLowerCase().includes(q) ||
      (customer.whatsapp || "").replace(/\s/g, "").includes(q.replace(/\s/g, ""))
    );
  }, [customers, search]);

  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <div style={{ position: "relative" }}>
        <Search size={15} color="#aaa" style={{ position: "absolute", left: 12, top: 13 }} />
        <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="Search customer by name or WhatsApp" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <select style={{ ...inputStyle, cursor: "pointer" }} value={value || ""} onChange={(event) => onSelect(event.target.value)}>
        <option value="">Select customer</option>
        {filtered.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.whatsapp ? ` · ${customer.whatsapp}` : ""}</option>)}
      </select>
    </div>
  );
}

function BookingForm({ business, customers, products, initial, saving, onSave, onCancel }) {
  const [form, setForm] = useState({
    customer_id: initial?.customer_id || "",
    customer_name: initial?.customer_name || "",
    customer_whatsapp: initial?.customer_whatsapp || "",
    service: initial?.service || "",
    booking_date: initial?.booking_date || todayStr(),
    booking_time: initial?.booking_time || "09:00",
    price: initial?.price || "",
    deposit: initial?.deposit || "",
    notes: initial?.notes || "",
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectCustomer(customerId) {
    const customer = customers.find((item) => item.id === customerId);
    setForm((prev) => ({
      ...prev,
      customer_id: customerId,
      customer_name: customer?.name || prev.customer_name,
      customer_whatsapp: customer?.whatsapp || prev.customer_whatsapp,
    }));
  }

  function selectProduct(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setForm((prev) => ({ ...prev, service: product.name || prev.service, price: product.price || prev.price }));
  }

  const valid = form.customer_name.trim() && form.booking_date;

  return (
    <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "20px", padding: "20px", marginBottom: "20px" }}>
      <div style={{ fontSize: "15px", fontWeight: 900, color: DARK, marginBottom: "14px" }}>{initial?.id ? "Edit booking" : "New booking"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "14px" }}>
        <div>
          <label style={labelStyle}>Customer</label>
          <CustomerSelect customers={customers} value={form.customer_id} onSelect={selectCustomer} />
        </div>
        <div>
          <label style={labelStyle}>Customer name</label>
          <input style={inputStyle} value={form.customer_name} onChange={(event) => update("customer_name", event.target.value)} placeholder="e.g. Rene Fourie" />
        </div>
        <div>
          <label style={labelStyle}>Customer WhatsApp</label>
          <input style={inputStyle} value={form.customer_whatsapp} onChange={(event) => update("customer_whatsapp", event.target.value)} placeholder="e.g. 082 123 4567" />
        </div>
        <div>
          <label style={labelStyle}>Product / service</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value="" onChange={(event) => selectProduct(event.target.value)}>
            <option value="">Choose from products / services</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}{product.price ? ` · R${product.price}` : ""}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Service</label>
          <input style={inputStyle} value={form.service} onChange={(event) => update("service", event.target.value)} placeholder="e.g. Gel overlay" />
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input style={inputStyle} type="date" min={todayStr()} value={form.booking_date} onChange={(event) => update("booking_date", event.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Time</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={form.booking_time} onChange={(event) => update("booking_time", event.target.value)}>
            <option value="">Flexible</option>
            {BOOKING_TIMES.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Price (R)</label>
          <input style={inputStyle} type="number" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={labelStyle}>Deposit (R)</label>
          <input style={inputStyle} type="number" value={form.deposit} onChange={(event) => update("deposit", event.target.value)} placeholder="0" />
        </div>
      </div>
      <div style={{ marginBottom: "14px" }}>
        <label style={labelStyle}>Notes</label>
        <input style={inputStyle} value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Any extra details" />
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={() => onSave(form)} disabled={!valid || saving} style={{ flex: "1 1 180px", border: "none", background: valid ? BRAND : "#e0e0e0", color: valid ? "#fff" : "#aaa", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: 900, cursor: valid ? "pointer" : "not-allowed" }}>{saving ? "Saving..." : "Save booking"}</button>
        <button onClick={onCancel} style={{ flex: "1 1 120px", border: "1px solid #eeeeea", background: "#fff", color: "#555", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

function BookingCard({ business, booking, customer, onEdit, onDelete, onStatusChange }) {
  const config = BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.confirmed;
  const dateText = dateLabel(booking.booking_date);
  const canWhatsApp = Boolean(normalizeSouthAfricanPhone(booking.customer_whatsapp || customer?.whatsapp || ""));

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${config.border}`, borderRadius: "16px", padding: "16px" }}>
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <div style={{ textAlign: "center", minWidth: "54px" }}>
          <div style={{ fontSize: "13px", fontWeight: 900, color: DARK }}>{booking.booking_time || "—"}</div>
          <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px", fontWeight: 700 }}>{dateText}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontSize: "15px", fontWeight: 900, color: DARK }}>{booking.customer_name}</span>
            <span style={{ fontSize: "10px", fontWeight: 800, color: config.color, background: config.bg, border: `1px solid ${config.border}`, borderRadius: "999px", padding: "2px 8px" }}>{config.label}</span>
          </div>
          {booking.service && <div style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>{booking.service}</div>}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", fontSize: "12px", color: "#888" }}>
            {booking.price > 0 && <span>R{Number(booking.price).toLocaleString()}</span>}
            {booking.deposit > 0 && <span style={{ color: BRAND }}>Deposit: R{Number(booking.deposit).toLocaleString()}</span>}
            {booking.customer_whatsapp || customer?.whatsapp ? <span>{booking.customer_whatsapp || customer?.whatsapp}</span> : <span>No WhatsApp number saved</span>}
          </div>
          {booking.notes && <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>{booking.notes}</div>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "14px", borderTop: "1px solid #f5f5f5", paddingTop: "12px", flexWrap: "wrap" }}>
        {booking.status === "confirmed" && <button onClick={() => onStatusChange(booking, "done")} style={{ border: "1px solid #f8b8d2", background: "#fff5f9", color: BRAND, borderRadius: "10px", padding: "8px 12px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Mark done</button>}
        {booking.status !== "cancelled" && <button onClick={() => openBookingReminder({ business, booking, customer })} style={{ border: "none", background: BRAND, color: "#fff", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", fontWeight: 900, cursor: "pointer", display: "inline-flex", gap: "6px", alignItems: "center" }} title={canWhatsApp ? "Open WhatsApp reminder" : "Opens WhatsApp without a saved number"}><MessageCircle size={15} /> Send reminder</button>}
        <button onClick={() => onEdit(booking)} style={{ border: "1px solid #eeeeea", background: "#fff", color: "#555", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Edit</button>
        {booking.status === "confirmed" ? <button onClick={() => onStatusChange(booking, "cancelled")} style={{ border: "1px solid #ffd0d0", background: "#fff5f5", color: "#cc3300", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Cancel</button> : <button onClick={() => onDelete(booking)} style={{ border: "1px solid #ffd0d0", background: "#fff5f5", color: "#cc3300", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Delete</button>}
      </div>
    </div>
  );
}

export function BookingsTab({ business }) {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("today");
  const [toast, setToast] = useState("");
  const today = todayStr();

  const customerById = useMemo(() => customers.reduce((acc, customer) => ({ ...acc, [customer.id]: customer }), {}), [customers]);
  const todayBookings = bookings.filter((booking) => booking.booking_date === today && booking.status === "confirmed");
  const upcomingBookings = bookings.filter((booking) => booking.booking_date > today && booking.status === "confirmed");
  const doneBookings = bookings.filter((booking) => booking.status === "done");
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled");

  const visibleBookings = useMemo(() => {
    if (filter === "today") return todayBookings;
    if (filter === "upcoming") return upcomingBookings;
    if (filter === "done") return doneBookings;
    if (filter === "cancelled") return cancelledBookings;
    return bookings;
  }, [filter, bookings, todayBookings, upcomingBookings, doneBookings, cancelledBookings]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2800);
  }

  async function load() {
    if (!business?.id) { setLoading(false); return; }
    setLoading(true);
    const [{ data: bookingRows }, { data: customerRows }, { data: productRows }] = await Promise.all([
      supabase.from("bookings").select("*").eq("business_id", business.id).order("booking_date").order("booking_time"),
      supabase.from("customers").select("id,name,whatsapp,interested_in,status").eq("business_id", business.id).order("name"),
      supabase.from("products").select("id,name,price,image").eq("business_id", business.id).eq("is_active", true).order("name"),
    ]);
    setBookings(bookingRows || []);
    setCustomers(customerRows || []);
    setProducts(productRows || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [business?.id]);

  async function saveBooking(form) {
    if (!business?.id) return;
    if (form.booking_date < today) { alert("Cannot book a date in the past."); return; }
    setSaving(true);
    let customerId = form.customer_id || null;
    let customer = customers.find((item) => item.id === customerId);

    if (!customerId && form.customer_name.trim()) {
      const { data: newCustomer } = await supabase.from("customers").insert([{ business_id: business.id, name: form.customer_name.trim(), whatsapp: form.customer_whatsapp || null, status: "new", interested_in: form.service ? [form.service] : [] }]).select().single();
      if (newCustomer) {
        setCustomers((prev) => [newCustomer, ...prev]);
        customerId = newCustomer.id;
        customer = newCustomer;
      }
    }

    const payload = {
      business_id: business.id,
      customer_id: customerId,
      customer_name: form.customer_name.trim(),
      customer_whatsapp: form.customer_whatsapp || customer?.whatsapp || "",
      service: form.service.trim(),
      booking_date: form.booking_date,
      booking_time: form.booking_time || null,
      price: form.price ? Number(form.price) : null,
      deposit: form.deposit ? Number(form.deposit) : null,
      notes: form.notes?.trim() || "",
      status: "confirmed",
    };

    if (editTarget) {
      const { data } = await supabase.from("bookings").update(payload).eq("id", editTarget.id).select().single();
      if (data) setBookings((prev) => prev.map((booking) => booking.id === data.id ? data : booking));
      showToast("Booking updated");
    } else {
      const { data } = await supabase.from("bookings").insert([payload]).select().single();
      if (data) setBookings((prev) => [...prev, data]);
      showToast("Booking saved");
    }

    setSaving(false);
    setShowForm(false);
    setEditTarget(null);
  }

  async function changeStatus(booking, status) {
    const { data } = await supabase.from("bookings").update({ status }).eq("id", booking.id).select().single();
    if (data) setBookings((prev) => prev.map((item) => item.id === data.id ? data : item));
    showToast(status === "done" ? `${booking.customer_name} marked done` : "Booking updated");
  }

  async function deleteBooking(booking) {
    if (!window.confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", booking.id);
    setBookings((prev) => prev.filter((item) => item.id !== booking.id));
    showToast("Booking deleted");
  }

  if (!business?.id) return <div style={{ textAlign: "center", padding: "80px 24px" }}><div style={{ fontSize: "40px", marginBottom: "16px" }}>🏪</div><h3 style={{ fontSize: "20px", fontWeight: 800, color: DARK, marginBottom: "8px" }}>Set up your business first</h3></div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: DARK, marginBottom: "2px" }}>Bookings</h2>
          <p style={{ fontSize: "13px", color: "#aaa" }}>{todayBookings.length} today · {upcomingBookings.length} upcoming</p>
        </div>
        <button onClick={() => { setEditTarget(null); setShowForm(true); }} style={{ border: "none", background: BRAND, color: "#fff", borderRadius: "12px", padding: "11px 18px", fontSize: "13px", fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "7px" }}><Plus size={16} /> New Booking</button>
      </div>

      {showForm && <BookingForm business={business} customers={customers} products={products} initial={editTarget} saving={saving} onSave={saveBooking} onCancel={() => { setShowForm(false); setEditTarget(null); }} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        {[{ key: "today", label: "Today", value: todayBookings.length }, { key: "upcoming", label: "Upcoming", value: upcomingBookings.length }, { key: "done", label: "Done", value: doneBookings.length }, { key: "cancelled", label: "Cancelled", value: cancelledBookings.length }, { key: "all", label: "All", value: bookings.length }].map((item) => <button key={item.key} onClick={() => setFilter(item.key)} style={{ textAlign: "left", background: filter === item.key ? "#fde8f1" : "#fff", border: `1px solid ${filter === item.key ? "#f8b8d2" : "#eeeeea"}`, borderRadius: "14px", padding: "14px 16px", cursor: "pointer" }}><div style={{ fontSize: "10px", color: filter === item.key ? BRAND : "#aaa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{item.label}</div><div style={{ fontSize: "22px", fontWeight: 900, color: DARK }}>{item.value}</div></button>)}
      </div>

      <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "20px", padding: "18px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <span style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#fde8f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CalendarDays size={19} color={BRAND} /></span>
        <div><div style={{ fontSize: "15px", color: DARK, fontWeight: 900 }}>One-click booking reminders</div><div style={{ fontSize: "13px", color: "#777", lineHeight: 1.5, marginTop: "3px" }}>Each booking can now open WhatsApp with the customer, date, time and service already filled in.</div></div>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>Loading…</div> : visibleBookings.length === 0 ? <div style={{ background: "#fff", border: "1.5px dashed #d4d7db", borderRadius: "16px", padding: "32px", textAlign: "center", color: "#888", fontSize: "13px" }}>No bookings in this view.</div> : <div style={{ display: "grid", gap: "8px" }}>{visibleBookings.map((booking) => <BookingCard key={booking.id} business={business} booking={booking} customer={customerById[booking.customer_id]} onEdit={(item) => { setEditTarget(item); setShowForm(true); }} onDelete={deleteBooking} onStatusChange={changeStatus} />)}</div>}

      {toast && <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)", background: DARK, color: "#fff", padding: "12px 24px", borderRadius: "999px", fontSize: "13px", fontWeight: 800, zIndex: 2000, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>{toast}</div>}
    </div>
  );
}

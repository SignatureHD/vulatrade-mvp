import React, { useEffect, useState } from "react";
import { LIME, DARK, BOOKING_TIMES, BOOKING_STATUS_CONFIG, inputStyle, labelStyle } from "../../constants";
import { todayStr, dateLabel, formatDate } from "../../utils";
import { supabase } from "../../lib/supabase";

// ── CUSTOMER SEARCH INPUT ──────────────────────────────────
function CustomerSearchInput({ customers, value, onSelect }) {
  const [query, setQuery]   = useState(value?.customer_name || "");
  const [open, setOpen]     = useState(false);
  const [isNew, setIsNew]   = useState(false);

  const matches = query.length > 0
    ? customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  function handleSelect(c) {
    setQuery(c.name); setOpen(false); setIsNew(false);
    onSelect({ customer_id: c.id, customer_name: c.name, interested_in: c.interested_in || [] });
  }

  function handleChange(e) {
    setQuery(e.target.value); setOpen(true); setIsNew(false);
    if (!e.target.value.trim()) onSelect({ customer_id: null, customer_name: "", interested_in: [] });
  }

  function handleCreateNew() {
    setOpen(false); setIsNew(true);
    onSelect({ customer_id: null, customer_name: query.trim(), interested_in: [], isNew: true });
  }

  return (
    <div style={{ position:"relative" }}>
      <input style={{ ...inputStyle, borderColor: isNew ? "#ea4c89" : "#e8e8e8" }}
        placeholder="Type customer name…" value={query} onChange={handleChange}
        onFocus={() => query.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} autoComplete="off" />
      {isNew && <div style={{ fontSize:"11px", color:"#d93f7b", marginTop:"4px" }}>New customer — will be created automatically when you save</div>}
      {open && query.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"1.5px solid #e0e0e0", borderRadius:"12px", boxShadow:"0 8px 24px rgba(0,0,0,0.1)", zIndex:100, overflow:"hidden", marginTop:"4px" }}>
          {matches.map((c) => (
            <div key={c.id} onMouseDown={() => handleSelect(c)}
              style={{ padding:"10px 14px", cursor:"pointer", borderBottom:"1px solid #f5f5f5", display:"flex", flexDirection:"column", gap:"2px" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fbfbfb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
              <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>{c.name}</div>
              {c.whatsapp && <div style={{ fontSize:"12px", color:"#aaa" }}>{c.whatsapp}</div>}
              {c.interested_in?.length > 0 && <div style={{ fontSize:"11px", color:"#d93f7b" }}>Interested in: {c.interested_in.join(", ")}</div>}
            </div>
          ))}
          {matches.length === 0 && query.trim().length > 1 && (
            <div onMouseDown={handleCreateNew}
              style={{ padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fbfbfb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
              <div style={{ width:"24px", height:"24px", borderRadius:"50%", background:LIME, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:800, color:DARK, flexShrink:0 }}>+</div>
              <div>
                <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>Create "{query.trim()}"</div>
                <div style={{ fontSize:"11px", color:"#aaa" }}>New customer, added automatically</div>
              </div>
            </div>
          )}
          {matches.length === 0 && query.trim().length <= 1 && (
            <div style={{ padding:"12px 14px", fontSize:"13px", color:"#aaa" }}>Keep typing to search…</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── BOOKING FORM ───────────────────────────────────────────
function BookingForm({ initial, onSave, onCancel, saving, customers, products }) {
  const today = todayStr();
  const [form, setForm] = useState({
    customer_id:   initial?.customer_id   || null,
    customer_name: initial?.customer_name || "",
    services:      initial?.services      || (initial?.service ? [initial.service] : []),
    booking_date:  initial?.booking_date  || today,
    booking_time:  initial?.booking_time  || "09:00",
    price:         initial?.price         || "",
    deposit:       initial?.deposit       || "",
    notes:         initial?.notes         || "",
    isNewCustomer: false,
  });
  const [interestedIn, setInterestedIn] = useState(initial?.interested_in || []);

  function upd(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function handleCustomerSelect(sel) {
    setForm((p) => ({ ...p, customer_id: sel.customer_id, customer_name: sel.customer_name, isNewCustomer: sel.isNew || false }));
    if (sel.interested_in?.length > 0) {
      setInterestedIn(sel.interested_in);
      const firstMatch = products.find((p) => sel.interested_in.includes(p.name));
      if (firstMatch) {
        const autoServices = sel.interested_in.filter((name) => products.find((p) => p.name === name));
        const autoPrice = autoServices.reduce((sum, name) => { const p = products.find((pr) => pr.name === name); return sum + (p?.price || 0); }, 0);
        setForm((prev) => ({ ...prev, customer_id: sel.customer_id, customer_name: sel.customer_name, isNewCustomer: sel.isNew || false, services: autoServices, price: autoPrice || prev.price }));
      }
    } else {
      setInterestedIn([]);
      setForm((prev) => ({ ...prev, customer_id: sel.customer_id, customer_name: sel.customer_name, isNewCustomer: sel.isNew || false }));
    }
  }

  function handleServiceSelect(p) {
    setForm((prev) => {
      const already = prev.services.includes(p.name);
      const services = already ? prev.services.filter((s) => s !== p.name) : [...prev.services, p.name];
      const total = services.reduce((sum, name) => { const prod = products.find((pr) => pr.name === name); return sum + (prod?.price || 0); }, 0);
      return { ...prev, services, price: total || prev.price };
    });
  }

  const suggestedProducts = interestedIn.length > 0 ? products.filter((p) => interestedIn.includes(p.name)) : products;
  const otherProducts     = interestedIn.length > 0 ? products.filter((p) => !interestedIn.includes(p.name)) : [];
  const valid             = form.customer_name.trim() && form.booking_date;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      <div>
        <label style={labelStyle}>Customer *</label>
        <CustomerSearchInput customers={customers} value={form} onSelect={handleCustomerSelect} />
      </div>
      <div>
        <label style={labelStyle}>Service</label>
        {suggestedProducts.length > 0 && (
          <div style={{ marginBottom:"8px" }}>
            {interestedIn.length > 0 && <div style={{ fontSize:"11px", color:"#d93f7b", fontWeight:600, marginBottom:"6px" }}>Based on what they want</div>}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {suggestedProducts.map((p) => {
                const selected = (form.services || []).includes(p.name);
                return (
                  <button key={p.id} onClick={() => handleServiceSelect(p)}
                    style={{ padding:"8px 14px", borderRadius:"12px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${selected ? LIME : "#e0e0e0"}`, background:selected ? "#fff5f9" : "#fff", color:selected ? "#d93f7b" : "#555" }}>
                    {p.name} {p.price ? `· R${p.price}` : ""}{selected && " ✓"}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {otherProducts.length > 0 && (
          <details style={{ marginTop:"4px" }}>
            <summary style={{ fontSize:"12px", color:"#aaa", cursor:"pointer", marginBottom:"6px" }}>Other services</summary>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"6px" }}>
              {otherProducts.map((p) => {
                const selected = (form.services || []).includes(p.name);
                return (
                  <button key={p.id} onClick={() => handleServiceSelect(p)}
                    style={{ padding:"8px 14px", borderRadius:"12px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:`1.5px solid ${selected ? LIME : "#e0e0e0"}`, background:selected ? "#fff5f9" : "#fff", color:selected ? "#d93f7b" : "#555" }}>
                    {p.name} {p.price ? `· R${p.price}` : ""}
                  </button>
                );
              })}
            </div>
          </details>
        )}
        {(form.services||[]).length > 0 && (
          <div style={{ fontSize:"11px", color:"#d93f7b", marginTop:"6px", fontWeight:600 }}>
            {(form.services||[]).length} service{(form.services||[]).length !== 1 ? "s" : ""} selected · R{form.price || 0} total
          </div>
        )}
        {products.length === 0 && (
          <input style={inputStyle} placeholder="e.g. Gel overlay, Soak off" value={(form.services||[]).join(', ')}
            onChange={(e) => upd("services", e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
        )}
      </div>
      <div style={{ display:"flex", gap:"10px" }}>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Date *</label>
          <input style={inputStyle} type="date" value={form.booking_date} min={today} onChange={(e) => upd("booking_date", e.target.value)} />
        </div>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Time</label>
          <select style={{ ...inputStyle, cursor:"pointer" }} value={form.booking_time} onChange={(e) => upd("booking_time", e.target.value)}>
            <option value="">Flexible</option>
            {BOOKING_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display:"flex", gap:"10px" }}>
        <div style={{ flex:1 }}><label style={labelStyle}>Price (R)</label><input style={inputStyle} type="number" placeholder="0" value={form.price} onChange={(e) => upd("price", e.target.value)} /></div>
        <div style={{ flex:1 }}><label style={labelStyle}>Deposit (R)</label><input style={inputStyle} type="number" placeholder="0" value={form.deposit} onChange={(e) => upd("deposit", e.target.value)} /></div>
      </div>
      <div><label style={labelStyle}>Notes</label><input style={inputStyle} placeholder="Any extra details…" value={form.notes} onChange={(e) => upd("notes", e.target.value)} /></div>
      <div style={{ display:"flex", gap:"8px" }}>
        <button onClick={() => onSave(form)} disabled={!valid || saving}
          style={{ flex:1, backgroundColor:valid ? LIME : "#e0e0e0", color:valid ? "#fff" : "#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:valid ? "pointer" : "not-allowed" }}>
          {saving ? "Saving…" : "Save booking"}
        </button>
        <button onClick={onCancel} style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── BOOKING CARD ───────────────────────────────────────────
function BookingCard({ booking, onStatusChange, onEdit, onDelete, onWhatsApp }) {
  const s  = BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.confirmed;
  const dl = dateLabel(booking.booking_date);

  return (
    <div style={{ background:"#fff", border:`1.5px solid ${s.border}`, borderRadius:"16px", padding:"16px 20px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
        <div style={{ textAlign:"center", minWidth:"48px", flexShrink:0 }}>
          <div style={{ fontSize:"13px", fontWeight:800, color:DARK }}>{booking.booking_time || "—"}</div>
          <div style={{ fontSize:"10px", color:"#aaa", marginTop:"2px", fontWeight:600 }}>{dl}</div>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"15px", fontWeight:800, color:DARK }}>{booking.customer_name}</span>
            <span style={{ fontSize:"10px", fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.border}`, borderRadius:"6px", padding:"1px 7px" }}>{s.label}</span>
          </div>
          {booking.service && <div style={{ fontSize:"13px", color:"#555", marginBottom:"4px" }}>{booking.service}</div>}
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
            {booking.price > 0 && <span style={{ fontSize:"12px", color:"#888" }}>R{booking.price}</span>}
            {booking.deposit > 0 && <span style={{ fontSize:"12px", color:"#d93f7b" }}>Deposit: R{booking.deposit}</span>}
            {booking.notes && <span style={{ fontSize:"12px", color:"#aaa" }}>{booking.notes}</span>}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:"6px", marginTop:"14px", flexWrap:"wrap", borderTop:"1px solid #f5f5f5", paddingTop:"12px" }}>
        {booking.status === "confirmed" && <button onClick={() => onStatusChange(booking, "done")} style={{ padding:"7px 14px", borderRadius:"10px", border:"1.5px solid #ea4c89", background:"#fff5f9", color:"#d93f7b", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Mark done</button>}
        {booking.status !== "cancelled" && <button onClick={() => onWhatsApp(booking)} style={{ padding:"7px 14px", borderRadius:"10px", border:"none", background:"#25d366", color:"#fff", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Reminder</button>}
        <button onClick={() => onEdit(booking)} style={{ padding:"7px 14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Edit</button>
        {booking.status === "confirmed" && <button onClick={() => onStatusChange(booking, "cancelled")} style={{ padding:"7px 14px", borderRadius:"10px", border:"1.5px solid #ffd0d0", background:"#fff5f5", color:"#cc3300", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Cancel</button>}
        {booking.status !== "confirmed" && <button onClick={() => onDelete(booking)} style={{ padding:"7px 14px", borderRadius:"10px", border:"1.5px solid #ffd0d0", background:"#fff5f5", color:"#cc3300", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Delete</button>}
      </div>
    </div>
  );
}

// ── BOOKING REMINDER MODAL ─────────────────────────────────
function BookingReminderModal({ booking, business, onClose }) {
  const time = booking.booking_time ? ` at ${booking.booking_time}` : "";
  const date = dateLabel(booking.booking_date);
  const defaultMsg = `Hi ${booking.customer_name}! Just a reminder about your ${booking.service || "appointment"} on ${date}${time}. Looking forward to seeing you! — ${business?.name || ""}`;
  const [message, setMessage] = useState(defaultMsg);
  const waNumber = booking.customer_whatsapp || "";
  const waUrl = waNumber ? `https://wa.me/${waNumber.replace(/\D/g,"")}?text=${encodeURIComponent(message)}` : null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"32px", width:"100%", maxWidth:"420px", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ fontSize:"18px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Send reminder</h3>
        <p style={{ fontSize:"13px", color:"#aaa", marginBottom:"20px" }}>To {booking.customer_name}</p>
        <textarea style={{ ...inputStyle, minHeight:"120px", resize:"vertical", marginBottom:"16px" }} value={message} onChange={(e) => setMessage(e.target.value)} />
        {!waNumber && (
          <div style={{ fontSize:"12px", color:"#f59e0b", background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:"8px", padding:"8px 12px", marginBottom:"12px" }}>
            No WhatsApp number saved for this customer. Edit the booking to add one.
          </div>
        )}
        <div style={{ display:"flex", gap:"8px" }}>
          {waUrl ? (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ flex:1, display:"block", backgroundColor:"#25d366", color:"#fff", textAlign:"center", padding:"13px", fontSize:"14px", fontWeight:800, borderRadius:"12px", textDecoration:"none" }}>
              Open WhatsApp →
            </a>
          ) : (
            <button disabled style={{ flex:1, backgroundColor:"#e0e0e0", color:"#aaa", border:"none", borderRadius:"12px", padding:"13px", fontSize:"14px", fontWeight:800, cursor:"not-allowed" }}>No number saved</button>
          )}
          <button onClick={onClose} style={{ padding:"13px 18px", borderRadius:"12px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#888", fontSize:"14px", cursor:"pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── MINI CALENDAR ──────────────────────────────────────────
function MiniCalendar({ bookings, selectedDate, onSelectDate, onNewBooking }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const today = new Date().toISOString().slice(0, 10);
  const { year, month } = cursor;
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const bookedDates = new Set(bookings.filter((b) => b.status !== "cancelled").map((b) => b.booking_date));

  function countForDate(ds) {
    return bookings.filter((b) => b.booking_date === ds && b.status !== "cancelled").length;
  }

  function ds(day) {
    return `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  function prevMonth() { setCursor(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }); }
  function nextMonth() { setCursor(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }); }

  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px", marginBottom:"20px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
        <button onClick={prevMonth} style={{ width:"32px", height:"32px", borderRadius:"50%", border:"1.5px solid #e0e0e0", background:"#fff", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"#555" }}>‹</button>
        <div style={{ fontSize:"16px", fontWeight:800, color:DARK }}>{MONTH_NAMES[month]} {year}</div>
        <button onClick={nextMonth} style={{ width:"32px", height:"32px", borderRadius:"50%", border:"1.5px solid #e0e0e0", background:"#fff", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"#555" }}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", marginBottom:"8px" }}>
        {DAY_NAMES.map((d) => <div key={d} style={{ textAlign:"center", fontSize:"11px", fontWeight:700, color:"#bbb", padding:"4px 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:"2px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dateStr = ds(day);
          const isTod   = dateStr === today;
          const isSel   = dateStr === selectedDate;
          const count   = countForDate(dateStr);
          const isPast  = dateStr < today;
          return (
            <div key={dateStr} onClick={() => onSelectDate(dateStr)}
              style={{ borderRadius:"10px", padding:"6px 2px", textAlign:"center", cursor:"pointer", background: isSel ? DARK : isTod ? LIME : "transparent", transition:"background 0.1s" }}
              onMouseEnter={(e) => { if (!isSel && !isTod) e.currentTarget.style.background = "#fbfbfb"; }}
              onMouseLeave={(e) => { if (!isSel && !isTod) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ fontSize:"14px", fontWeight: isTod || isSel ? 800 : 500, color: isSel ? LIME : isTod ? DARK : isPast ? "#ccc" : DARK, lineHeight:1, marginBottom:"4px" }}>{day}</div>
              <div style={{ display:"flex", justifyContent:"center", gap:"2px", minHeight:"6px" }}>
                {count > 0 && Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                  <div key={di} style={{ width:"4px", height:"4px", borderRadius:"50%", background: isSel ? LIME : isTod ? DARK : "#ea4c89" }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ borderTop:"1px solid #f5f5f5", marginTop:"16px", paddingTop:"14px", display:"flex", justifyContent:"flex-end" }}>
        <button onClick={() => onNewBooking(selectedDate || today)}
          style={{ padding:"8px 18px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
          + New booking
        </button>
      </div>
    </div>
  );
}

// ── MAIN BOOKINGS TAB ──────────────────────────────────────
export function BookingsTab({ business }) {
  const [bookings, setBookings]       = useState([]);
  const [customers, setCustomers]     = useState([]);
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [mode, setMode]               = useState("list");
  const [editTarget, setEditTarget]   = useState(null);
  const [saving, setSaving]           = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [reminderFor, setReminderFor] = useState(null);
  const [toast, setToast]             = useState("");
  const [newBookingDate, setNewBookingDate] = useState(null);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2800); }

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    Promise.all([
      supabase.from("bookings").select("*").eq("business_id", business.id).order("booking_date").order("booking_time"),
      supabase.from("customers").select("id,name,whatsapp,interested_in").eq("business_id", business.id),
      supabase.from("products").select("id,name,price,image").eq("business_id", business.id).eq("is_active", true),
    ]).then(([{ data: b }, { data: c }, { data: p }]) => {
      if (b) setBookings(b);
      if (c) setCustomers(c);
      if (p) setProducts(p);
      setLoading(false);
    });
  }, [business?.id]);

  const dayBookings = bookings
    .filter((b) => b.booking_date === selectedDate)
    .sort((a, b) => (a.booking_time || "").localeCompare(b.booking_time || ""));

  const upcomingBookings = bookings
    .filter((b) => b.booking_date > today && b.status === "confirmed")
    .slice(0, 5);

  async function handleSave(form) {
    if (!business?.id) return;
    if (form.booking_date < today) { alert("Cannot book a date in the past."); return; }
    setSaving(true);
    let customerId = form.customer_id;
    if (form.isNewCustomer && form.customer_name.trim()) {
      const { data: newCust } = await supabase.from("customers")
        .insert([{ business_id: business.id, name: form.customer_name.trim(), status: "new", interested_in: [] }])
        .select().single();
      if (newCust) { setCustomers((prev) => [newCust, ...prev]); customerId = newCust.id; showToast(`New customer "${newCust.name}" created ✓`); }
    }
    const cust = customers.find((c) => c.id === customerId);
    const payload = {
      business_id: business.id, customer_id: customerId,
      customer_name: form.customer_name.trim(),
      customer_whatsapp: cust?.whatsapp || "",
      service: (form.services || []).join(", "),
      booking_date: form.booking_date, booking_time: form.booking_time || null,
      price: form.price ? parseFloat(form.price) : null,
      deposit: form.deposit ? parseFloat(form.deposit) : null,
      notes: form.notes?.trim() || "", status: "confirmed",
    };
    if (editTarget) {
      const { data } = await supabase.from("bookings").update(payload).eq("id", editTarget.id).select().single();
      if (data) setBookings((prev) => prev.map((b) => b.id === data.id ? data : b));
      showToast("Booking updated ✓");
    } else {
      const { data } = await supabase.from("bookings").insert([payload]).select().single();
      if (data) { setBookings((prev) => [...prev, data]); setSelectedDate(data.booking_date); }
      showToast("Booking saved ✓");
    }
    setSaving(false); setMode("list"); setEditTarget(null); setNewBookingDate(null);
  }

  async function handleStatusChange(booking, newStatus) {
    const { data } = await supabase.from("bookings").update({ status: newStatus }).eq("id", booking.id).select().single();
    if (data) setBookings((prev) => prev.map((b) => b.id === data.id ? data : b));
    if (newStatus === "done")      showToast(`${booking.customer_name} marked done ✓`);
    if (newStatus === "cancelled") showToast("Booking cancelled");
  }

  async function handleDelete(booking) {
    if (!window.confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", booking.id);
    setBookings((prev) => prev.filter((b) => b.id !== booking.id));
    showToast("Booking deleted");
  }

  const todayCount    = bookings.filter((b) => b.booking_date === today && b.status === "confirmed").length;
  const upcomingCount = bookings.filter((b) => b.booking_date > today  && b.status === "confirmed").length;
  const doneCount     = bookings.filter((b) => b.status === "done").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  if (!business?.id) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <div style={{ fontSize:"40px", marginBottom:"16px" }}>🏪</div>
      <h3 style={{ fontSize:"20px", fontWeight:800, color:DARK, marginBottom:"8px" }}>Set up your business first</h3>
    </div>
  );

  if (mode === "add" || mode === "edit") return (
    <div style={{ maxWidth:"560px" }}>
      <button onClick={() => { setMode("list"); setEditTarget(null); setNewBookingDate(null); }}
        style={{ background:"transparent", border:"none", fontSize:"13px", color:"#aaa", cursor:"pointer", padding:"0 0 16px" }}>← Back</button>
      <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"24px" }}>{mode === "edit" ? "Edit booking" : "New booking"}</h2>
      <BookingForm
        initial={editTarget || (newBookingDate ? { booking_date: newBookingDate, services: [], booking_time: "09:00" } : { services: [], booking_time: "09:00" })}
        onSave={handleSave}
        onCancel={() => { setMode("list"); setEditTarget(null); setNewBookingDate(null); }}
        saving={saving} customers={customers} products={products}
      />
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Bookings</h2>
          <p style={{ fontSize:"13px", color:"#aaa" }}>{todayCount} today · {upcomingCount} upcoming</p>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Today",    value: todayCount },
          { label:"Upcoming", value: upcomingCount },
          { label:"Done",     value: doneCount },
          { label:"Cancelled", value: cancelledCount },
        ].map((s) => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"14px 16px" }}>
            <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{s.label}</div>
            <div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading && <div style={{ textAlign:"center", padding:"60px", color:"#aaa" }}>Loading…</div>}

      {!loading && (
        <>
          <MiniCalendar
            bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate}
            onNewBooking={(date) => { setNewBookingDate(date); setMode("add"); }}
          />

          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
              <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>
                {selectedDate === today ? "Today" : dateLabel(selectedDate)}
                {dayBookings.length > 0 && <span style={{ fontSize:"12px", color:"#aaa", fontWeight:500, marginLeft:"8px" }}>{dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}</span>}
              </div>
              <button onClick={() => { setNewBookingDate(selectedDate); setMode("add"); }}
                style={{ padding:"7px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                + Add
              </button>
            </div>

            {dayBookings.length === 0 ? (
              <div style={{ background:"#fff", border:"1.5px dashed #d4d7db", borderRadius:"16px", padding:"32px", textAlign:"center" }}>
                <div style={{ fontSize:"13px", color:"#bbb", marginBottom:"12px" }}>
                  {selectedDate < today ? "No sales records on this day" : "No sales recorded yet. Add today's first sale or booking."}
                </div>
                {selectedDate >= today && (
                  <button onClick={() => { setNewBookingDate(selectedDate); setMode("add"); }}
                    style={{ padding:"9px 20px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
                    + New booking
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {dayBookings.map((b) => (
                  <BookingCard key={b.id} booking={b}
                    onStatusChange={handleStatusChange}
                    onEdit={(bk) => { setEditTarget({ ...bk, services: bk.service ? bk.service.split(", ") : [] }); setMode("edit"); }}
                    onDelete={handleDelete}
                    onWhatsApp={setReminderFor}
                  />
                ))}
              </div>
            )}

            {selectedDate === today && upcomingBookings.length > 0 && (
              <div style={{ marginTop:"28px" }}>
                <div style={{ fontSize:"12px", fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Coming up</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {upcomingBookings.map((b) => (
                    <div key={b.id} onClick={() => setSelectedDate(b.booking_date)}
                      style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"12px", padding:"10px 16px", display:"flex", alignItems:"center", gap:"12px", cursor:"pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fbfbfb"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                      <div style={{ textAlign:"center", minWidth:"40px" }}>
                        <div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>{new Date(b.booking_date + "T00:00:00").getDate()}</div>
                        <div style={{ fontSize:"10px", color:"#aaa", fontWeight:600 }}>{new Date(b.booking_date + "T00:00:00").toLocaleDateString("en-ZA",{month:"short"})}</div>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px", fontWeight:700, color:DARK }}>{b.customer_name}</div>
                        {b.service && <div style={{ fontSize:"12px", color:"#aaa" }}>{b.service}</div>}
                      </div>
                      {b.booking_time && <div style={{ fontSize:"12px", fontWeight:700, color:"#888" }}>{b.booking_time}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {reminderFor && <BookingReminderModal booking={reminderFor} business={business} onClose={() => setReminderFor(null)} />}

      {toast && (
        <div style={{ position:"fixed", bottom:"28px", left:"50%", transform:"translateX(-50%)", background:DARK, color:LIME, padding:"12px 24px", borderRadius:"999px", fontSize:"13px", fontWeight:700, zIndex:2000, boxShadow:"0 8px 32px rgba(0,0,0,0.25)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

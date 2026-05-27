import React, { useMemo, useState } from "react";
import { Copy, Download, MessageCircle, Sparkles } from "lucide-react";
import { DARK, PINK, SOFT_BORDER, SOFT_PINK, inputStyle, labelStyle } from "../../constants";

const PURPOSES = ["Today's special", "New product", "Available slots", "Customer review", "Before and after", "Payday special", "Clearance sale", "Service promo"];
const LANGUAGES = ["English", "isiXhosa", "isiZulu", "Afrikaans"];
const LOOKS = [
  { label: "Vula Pink", bg: PINK, text: "#fff" },
  { label: "Charcoal", bg: DARK, text: "#fff" },
  { label: "White", bg: "#fff", text: DARK },
  { label: "Soft grey", bg: "#f4f4f5", text: DARK },
];

const card = { background: "#fff", border: `1px solid ${SOFT_BORDER}`, borderRadius: 20, padding: 18 };

function formatPrice(value) {
  const n = Number(value || 0);
  return n ? `R${n.toLocaleString("en-ZA")}` : "";
}

function buildOutput(form) {
  const item = form.productName || "your offer";
  const price = formatPrice(form.price);
  const when = form.deadline || "today";
  const area = form.area || "your area";
  const payment = form.paymentMethods || "cash or EFT";
  const heading = form.purpose || "Today's special";

  if (form.language === "isiXhosa") {
    return {
      title: heading === "Available slots" ? "Iindawo zivulekile" : "Special yanamhlanje",
      line1: item,
      line2: price ? `${price} ${when}` : `Iyafumaneka ${when}`,
      cta: "WhatsApp ngoku",
      caption: `${item} iyafumaneka ${when}. Sithumele i-WhatsApp ukuze u-odole okanye ubhukishe.`,
      reply: `Molo, ewe iyafumaneka. Collection ise ${area}. Ungabhatala nge ${payment}. Ufuna ezi zingaphi okanye ufuna ixesha lini?`,
    };
  }

  if (form.language === "isiZulu") {
    return {
      title: heading === "Available slots" ? "Izikhathi zivulekile" : "Isipesheli sanamuhla",
      line1: item,
      line2: price ? `${price} ${when}` : `Kuyatholakala ${when}`,
      cta: "WhatsApp manje",
      caption: `${item} iyatholakala ${when}. Ngithumele i-WhatsApp ukuze u-ode noma ubhukhe.`,
      reply: `Sawubona, yebo kuyatholakala. Collection ise ${area}. Ungakhokha nge ${payment}. Ufuna okungaki noma isikhathi sini?`,
    };
  }

  if (form.language === "Afrikaans") {
    return {
      title: heading === "Available slots" ? "Plekke beskikbaar" : "Vandag se special",
      line1: item,
      line2: price ? `${price} ${when}` : `Beskikbaar ${when}`,
      cta: "WhatsApp my nou",
      caption: `${item} is ${when} beskikbaar. WhatsApp my om te bestel of te bespreek.`,
      reply: `Hallo, ja dit is beskikbaar. Collection is in ${area}. Jy kan met ${payment} betaal. Hoeveel wil jy bestel of watter tyd werk vir jou?`,
    };
  }

  return {
    title: heading,
    line1: item,
    line2: price ? `${price} ${when}` : `Available ${when}`,
    cta: "WhatsApp me now",
    caption: `${item} available ${when}. Limited orders or slots. Message me to book yours.`,
    reply: `Hi, yes it is available. Collection is in ${area}. You can pay by ${payment}. How many would you like to order or what time works for you?`,
  };
}

function initialForm(business, products) {
  const first = products?.[0] || {};
  return {
    purpose: "Today's special",
    language: "English",
    look: "Vula Pink",
    businessName: business?.name || "",
    productId: first.id || "",
    productName: first.name || "",
    price: first.price || "",
    area: business?.area || business?.location || business?.suburb || "",
    deadline: "today",
    paymentMethods: "cash, EFT or PayShap",
  };
}

export function WhatsAppStatusBuilderTab({ business, products = [] }) {
  const [form, setForm] = useState(() => initialForm(business, products));
  const [copied, setCopied] = useState("");
  const output = useMemo(() => buildOutput(form), [form]);
  const look = LOOKS.find((item) => item.label === form.look) || LOOKS[0];

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function chooseProduct(id) {
    const product = products.find((item) => item.id === id) || {};
    setForm((current) => ({ ...current, productId: id, productName: product.name || current.productName, price: product.price || current.price }));
  }

  async function copyText(type, text) {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 1600);
  }

  function downloadTextFile() {
    const body = `WHATSAPP STATUS\n${output.title}\n${output.line1}\n${output.line2}\n${output.cta}\n\nCAPTION\n${output.caption}\n\nCUSTOMER REPLY\n${output.reply}`;
    const blob = new Blob([body], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "vula-whatsapp-status.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function openWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(output.caption)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: DARK, margin: "0 0 4px" }}>WhatsApp Status Builder</h2>
          <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.55 }}>Create a selling status, caption and customer reply in under 2 minutes.</p>
        </div>
        <div style={{ background: SOFT_PINK, color: PINK, border: "1px solid #f8b8d2", borderRadius: 999, padding: "8px 12px", fontSize: 12, fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 7 }}><Sparkles size={15} /> Sell today</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 12 }}>1. What do you want to promote?</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              {PURPOSES.map((purpose) => <button key={purpose} onClick={() => update("purpose", purpose)} style={{ border: `1.5px solid ${form.purpose === purpose ? PINK : SOFT_BORDER}`, background: form.purpose === purpose ? SOFT_PINK : "#fff", color: form.purpose === purpose ? PINK : "#555", borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 850, cursor: "pointer", textAlign: "left" }}>{purpose}</button>)}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 12 }}>2. Add the details</div>
            <div style={{ display: "grid", gap: 12 }}>
              {products.length > 0 && <div><label style={labelStyle}>Use existing product/service</label><select style={inputStyle} value={form.productId} onChange={(e) => chooseProduct(e.target.value)}><option value="">Start from scratch</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div>}
              <div><label style={labelStyle}>Product or service</label><input style={inputStyle} value={form.productName} onChange={(e) => update("productName", e.target.value)} placeholder="e.g. Fresh kota special" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><div><label style={labelStyle}>Price</label><input style={inputStyle} type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="35" /></div><div><label style={labelStyle}>Area</label><input style={inputStyle} value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="e.g. Soweto" /></div></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><div><label style={labelStyle}>When</label><input style={inputStyle} value={form.deadline} onChange={(e) => update("deadline", e.target.value)} placeholder="today" /></div><div><label style={labelStyle}>Payment</label><input style={inputStyle} value={form.paymentMethods} onChange={(e) => update("paymentMethods", e.target.value)} placeholder="cash, EFT or PayShap" /></div></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><div><label style={labelStyle}>Language</label><select style={inputStyle} value={form.language} onChange={(e) => update("language", e.target.value)}>{LANGUAGES.map((language) => <option key={language} value={language}>{language}</option>)}</select></div><div><label style={labelStyle}>Look</label><select style={inputStyle} value={form.look} onChange={(e) => update("look", e.target.value)}>{LOOKS.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}</select></div></div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...card, background: look.bg, color: look.text, minHeight: 390, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 18px 50px rgba(32,32,33,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: 850, opacity: 0.8 }}>{form.businessName || "VulaTrade business"}</div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 950, lineHeight: 1.05, marginBottom: 18 }}>{output.title}</div>
              <div style={{ fontSize: 44, fontWeight: 950, lineHeight: 1.03, marginBottom: 14 }}>{output.line1}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: look.label === "Vula Pink" ? "#fff" : PINK }}>{output.line2}</div>
            </div>
            <div style={{ display: "inline-flex", alignSelf: "flex-start", background: look.label === "Vula Pink" ? "#fff" : PINK, color: look.label === "Vula Pink" ? PINK : "#fff", borderRadius: 999, padding: "12px 18px", fontSize: 14, fontWeight: 950 }}>{output.cta}</div>
          </div>

          <div style={card}><div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 12 }}>Caption</div><div style={{ background: "#fbfbfb", borderRadius: 14, padding: 14, fontSize: 14, color: DARK, lineHeight: 1.55 }}>{output.caption}</div><button onClick={() => copyText("caption", output.caption)} style={{ marginTop: 10, width: "100%", border: `1.5px solid ${SOFT_BORDER}`, background: "#fff", color: DARK, borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 850, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Copy size={15} /> {copied === "caption" ? "Copied" : "Copy caption"}</button></div>
          <div style={card}><div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 12 }}>Customer reply</div><div style={{ background: "#fbfbfb", borderRadius: 14, padding: 14, fontSize: 14, color: DARK, lineHeight: 1.55 }}>{output.reply}</div><button onClick={() => copyText("reply", output.reply)} style={{ marginTop: 10, width: "100%", border: `1.5px solid ${SOFT_BORDER}`, background: "#fff", color: DARK, borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 850, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Copy size={15} /> {copied === "reply" ? "Copied" : "Copy reply"}</button></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><button onClick={downloadTextFile} style={{ border: `1.5px solid ${SOFT_BORDER}`, background: "#fff", color: DARK, borderRadius: 14, padding: 12, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Download size={16} /> Save text</button><button onClick={openWhatsApp} style={{ border: "none", background: DARK, color: "#fff", borderRadius: 14, padding: 12, fontSize: 13, fontWeight: 950, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><MessageCircle size={17} /> WhatsApp</button></div>
        </div>
      </div>
    </div>
  );
}

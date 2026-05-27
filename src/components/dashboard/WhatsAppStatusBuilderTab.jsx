import React, { useMemo, useState } from "react";
import { Copy, Download, MessageCircle, Sparkles } from "lucide-react";
import { DARK, PINK, SOFT_BORDER, SOFT_PINK, inputStyle, labelStyle } from "../../constants";

const LANGUAGES = ["English", "isiXhosa", "isiZulu", "Afrikaans"];
const PURPOSES = ["Today's special", "New product", "Available slots", "Customer review", "Before and after", "Payday special", "Clearance sale", "Service promo"];

const BACKGROUNDS = [
  { label: "Vula Pink", bg: PINK, text: "#fff", accent: "#fff", type: "solid" },
  { label: "Charcoal", bg: DARK, text: "#fff", accent: PINK, type: "solid" },
  { label: "Clean White", bg: "#fff", text: DARK, accent: PINK, type: "solid" },
  { label: "Soft Grey", bg: "#f4f4f5", text: DARK, accent: PINK, type: "solid" },
  { label: "Food Warm", bg: "#9a3412", text: "#fff", accent: "#fed7aa", type: "warm" },
  { label: "Beauty Glow", bg: "#831843", text: "#fff", accent: "#f9a8d4", type: "glow" },
  { label: "Fashion Drop", bg: "#111827", text: "#fff", accent: "#f472b6", type: "stripe" },
  { label: "Street Market", bg: "#14532d", text: "#fff", accent: "#bbf7d0", type: "market" },
];

const TEMPLATE_PACKS = {
  food: ["Lunch special", "Kota special", "Sunday plates", "Order before 2pm", "Sold out soon"],
  beauty: ["Open slots today", "Before and after", "Weekend bookings", "New price list", "Client review"],
  fashion: ["New stock arrived", "Size available", "Clearance sale", "Payday drop", "Last items left"],
  service: ["Available today", "Book this week", "Mobile service available", "Customer testimonial", "Price from"],
  general: ["Today's special", "New product", "Limited stock", "Payday special", "Referral offer"],
};

const card = { background: "#fff", border: `1px solid ${SOFT_BORDER}`, borderRadius: 20, padding: 18 };

function categoryPack(category = "") {
  const c = category.toLowerCase();
  if (c.includes("food") || c.includes("catering") || c.includes("kota") || c.includes("produce")) return "food";
  if (c.includes("hair") || c.includes("beauty") || c.includes("nail") || c.includes("barber")) return "beauty";
  if (c.includes("fashion") || c.includes("clothing") || c.includes("sneaker") || c.includes("accessor")) return "fashion";
  if (c.includes("service") || c.includes("cleaning") || c.includes("repair") || c.includes("tutor") || c.includes("delivery")) return "service";
  return "general";
}

function priceText(value) {
  const n = Number(value || 0);
  return n ? `R${n.toLocaleString("en-ZA")}` : "";
}

function buildOutput(form) {
  const item = form.productName || "your offer";
  const price = priceText(form.price);
  const when = form.deadline || "today";
  const area = form.area || "your area";
  const payment = form.paymentMethods || "cash or EFT";
  const title = form.template || form.purpose || "Today's special";
  const line2 = price ? `${price} ${when}` : `Available ${when}`;

  if (form.language === "isiXhosa") {
    return { title: title === "Available slots" ? "Iindawo zivulekile" : title, line1: item, line2, cta: "WhatsApp ngoku", caption: `${item} iyafumaneka ${when}. Sithumele i-WhatsApp ukuze u-odole okanye ubhukishe.`, reply: `Molo, ewe iyafumaneka. Collection ise ${area}. Ungabhatala nge ${payment}. Ufuna ezi zingaphi okanye ufuna ixesha lini?` };
  }
  if (form.language === "isiZulu") {
    return { title: title === "Available slots" ? "Izikhathi zivulekile" : title, line1: item, line2, cta: "WhatsApp manje", caption: `${item} iyatholakala ${when}. Ngithumele i-WhatsApp ukuze u-ode noma ubhukhe.`, reply: `Sawubona, yebo kuyatholakala. Collection ise ${area}. Ungakhokha nge ${payment}. Ufuna okungaki noma isikhathi sini?` };
  }
  if (form.language === "Afrikaans") {
    return { title: title === "Available slots" ? "Plekke beskikbaar" : title, line1: item, line2, cta: "WhatsApp my nou", caption: `${item} is ${when} beskikbaar. WhatsApp my om te bestel of te bespreek.`, reply: `Hallo, ja dit is beskikbaar. Collection is in ${area}. Jy kan met ${payment} betaal. Hoeveel wil jy bestel of watter tyd werk vir jou?` };
  }
  return { title, line1: item, line2, cta: "WhatsApp me now", caption: `${item} available ${when}. Limited orders or slots. Message me to book yours.`, reply: `Hi, yes it is available. Collection is in ${area}. You can pay by ${payment}. How many would you like to order or what time works for you?` };
}

function initialForm(business, products) {
  const first = products?.[0] || {};
  return { purpose: "Today's special", template: "", language: "English", background: "Vula Pink", businessName: business?.name || "", productId: first.id || "", productName: first.name || "", price: first.price || "", area: business?.area || business?.location || business?.suburb || "", deadline: "today", paymentMethods: "cash, EFT or PayShap" };
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text || "").split(" ");
  let line = "";
  let lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function drawBackground(ctx, look, w, h) {
  ctx.fillStyle = look.bg;
  ctx.fillRect(0, 0, w, h);
  if (look.type === "warm" || look.type === "glow") {
    const g = ctx.createRadialGradient(w * 0.15, h * 0.1, 80, w * 0.15, h * 0.1, 900);
    g.addColorStop(0, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  if (look.type === "stripe") {
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 18;
    for (let i = -h; i < w; i += 90) {
      ctx.beginPath();
      ctx.moveTo(i, h);
      ctx.lineTo(i + h, 0);
      ctx.stroke();
    }
  }
  if (look.type === "market") {
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    for (let y = 150; y < h; y += 260) for (let x = 80; x < w; x += 260) { ctx.beginPath(); ctx.arc(x, y, 48, 0, Math.PI * 2); ctx.fill(); }
  }
}

export function WhatsAppStatusBuilderTab({ business, products = [] }) {
  const [form, setForm] = useState(() => initialForm(business, products));
  const [copied, setCopied] = useState("");
  const output = useMemo(() => buildOutput(form), [form]);
  const pack = categoryPack(business?.category);
  const templates = [...TEMPLATE_PACKS[pack], ...TEMPLATE_PACKS.general.filter((t) => !TEMPLATE_PACKS[pack].includes(t))];
  const look = BACKGROUNDS.find((item) => item.label === form.background) || BACKGROUNDS[0];

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  function chooseProduct(id) {
    const product = products.find((item) => item.id === id) || {};
    setForm((current) => ({ ...current, productId: id, productName: product.name || current.productName, price: product.price || current.price }));
  }

  async function copyText(type, text) {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 1600);
  }

  function downloadImage() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const w = 1080;
    const h = 1920;
    canvas.width = w;
    canvas.height = h;
    drawBackground(ctx, look, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(70, 90, 940, 1740);
    ctx.fillStyle = look.text;
    ctx.font = "800 44px Arial";
    ctx.fillText(form.businessName || "VulaTrade business", 110, 180);
    ctx.font = "900 92px Arial";
    wrapText(ctx, output.title, 110, 470, 860, 100, 2);
    ctx.font = "900 118px Arial";
    wrapText(ctx, output.line1, 110, 760, 860, 126, 2);
    ctx.fillStyle = look.accent;
    ctx.font = "900 70px Arial";
    wrapText(ctx, output.line2, 110, 1080, 860, 78, 2);
    ctx.fillStyle = look.label === "Vula Pink" ? "#fff" : PINK;
    ctx.beginPath();
    ctx.roundRect(110, 1340, 620, 130, 65);
    ctx.fill();
    ctx.fillStyle = look.label === "Vula Pink" ? PINK : "#fff";
    ctx.font = "900 46px Arial";
    ctx.fillText(output.cta, 160, 1420);
    ctx.fillStyle = look.text;
    ctx.globalAlpha = 0.82;
    ctx.font = "700 36px Arial";
    wrapText(ctx, form.area ? `Area: ${form.area}` : "Message to order", 110, 1640, 860, 46, 2);
    ctx.globalAlpha = 1;
    const link = document.createElement("a");
    link.download = `${(form.productName || "vula-status").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function openWhatsApp() { window.open(`https://wa.me/?text=${encodeURIComponent(output.caption)}`, "_blank", "noopener,noreferrer"); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div><h2 style={{ fontSize: 22, fontWeight: 900, color: DARK, margin: "0 0 4px" }}>Vula Status Maker</h2><p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.55 }}>Create a WhatsApp Status image, caption and customer reply in under 2 minutes.</p></div>
        <div style={{ background: SOFT_PINK, color: PINK, border: "1px solid #f8b8d2", borderRadius: 999, padding: "8px 12px", fontSize: 12, fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 7 }}><Sparkles size={15} /> Sell today</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}><div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 12 }}>1. Choose a template</div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>{templates.slice(0, 8).map((template) => <button key={template} onClick={() => update("template", template)} style={{ border: `1.5px solid ${form.template === template ? PINK : SOFT_BORDER}`, background: form.template === template ? SOFT_PINK : "#fff", color: form.template === template ? PINK : "#555", borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 850, cursor: "pointer", textAlign: "left" }}>{template}</button>)}</div></div>

          <div style={card}><div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 12 }}>2. What do you want to promote?</div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>{PURPOSES.map((purpose) => <button key={purpose} onClick={() => update("purpose", purpose)} style={{ border: `1.5px solid ${form.purpose === purpose ? PINK : SOFT_BORDER}`, background: form.purpose === purpose ? SOFT_PINK : "#fff", color: form.purpose === purpose ? PINK : "#555", borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 850, cursor: "pointer", textAlign: "left" }}>{purpose}</button>)}</div></div>

          <div style={card}><div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 12 }}>3. Add the details</div><div style={{ display: "grid", gap: 12 }}>{products.length > 0 && <div><label style={labelStyle}>Use existing product/service</label><select style={inputStyle} value={form.productId} onChange={(e) => chooseProduct(e.target.value)}><option value="">Start from scratch</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div>}<div><label style={labelStyle}>Product or service</label><input style={inputStyle} value={form.productName} onChange={(e) => update("productName", e.target.value)} placeholder="e.g. Fresh kota special" /></div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><div><label style={labelStyle}>Price</label><input style={inputStyle} type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="35" /></div><div><label style={labelStyle}>Area</label><input style={inputStyle} value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="e.g. Soweto" /></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><div><label style={labelStyle}>When</label><input style={inputStyle} value={form.deadline} onChange={(e) => update("deadline", e.target.value)} placeholder="today" /></div><div><label style={labelStyle}>Payment</label><input style={inputStyle} value={form.paymentMethods} onChange={(e) => update("paymentMethods", e.target.value)} placeholder="cash, EFT or PayShap" /></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><div><label style={labelStyle}>Language</label><select style={inputStyle} value={form.language} onChange={(e) => update("language", e.target.value)}>{LANGUAGES.map((language) => <option key={language} value={language}>{language}</option>)}</select></div><div><label style={labelStyle}>Background</label><select style={inputStyle} value={form.background} onChange={(e) => update("background", e.target.value)}>{BACKGROUNDS.map((bg) => <option key={bg.label} value={bg.label}>{bg.label}</option>)}</select></div></div></div></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...card, background: look.bg, color: look.text, minHeight: 390, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 18px 50px rgba(32,32,33,0.08)", position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", inset: 0, background: look.type === "stripe" ? "repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0 12px, transparent 12px 48px)" : look.type === "warm" || look.type === "glow" ? "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.35), transparent 55%)" : look.type === "market" ? "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.14), transparent 18%), radial-gradient(circle at 90% 70%, rgba(255,255,255,0.1), transparent 16%)" : "none" }} /><div style={{ position: "relative", fontSize: 13, fontWeight: 850, opacity: 0.8 }}>{form.businessName || "VulaTrade business"}</div><div style={{ position: "relative" }}><div style={{ fontSize: 34, fontWeight: 950, lineHeight: 1.05, marginBottom: 18 }}>{output.title}</div><div style={{ fontSize: 44, fontWeight: 950, lineHeight: 1.03, marginBottom: 14 }}>{output.line1}</div><div style={{ fontSize: 24, fontWeight: 900, color: look.accent }}>{output.line2}</div></div><div style={{ position: "relative", display: "inline-flex", alignSelf: "flex-start", background: look.label === "Vula Pink" ? "#fff" : PINK, color: look.label === "Vula Pink" ? PINK : "#fff", borderRadius: 999, padding: "12px 18px", fontSize: 14, fontWeight: 950 }}>{output.cta}</div></div>

          <button onClick={downloadImage} style={{ border: "none", background: PINK, color: "#fff", borderRadius: 14, padding: 13, fontSize: 13, fontWeight: 950, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Download size={17} /> Download Status Image</button>
          <div style={card}><div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 12 }}>Caption</div><div style={{ background: "#fbfbfb", borderRadius: 14, padding: 14, fontSize: 14, color: DARK, lineHeight: 1.55 }}>{output.caption}</div><button onClick={() => copyText("caption", output.caption)} style={{ marginTop: 10, width: "100%", border: `1.5px solid ${SOFT_BORDER}`, background: "#fff", color: DARK, borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 850, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Copy size={15} /> {copied === "caption" ? "Copied" : "Copy caption"}</button></div>
          <div style={card}><div style={{ fontSize: 15, fontWeight: 900, color: DARK, marginBottom: 12 }}>Customer reply</div><div style={{ background: "#fbfbfb", borderRadius: 14, padding: 14, fontSize: 14, color: DARK, lineHeight: 1.55 }}>{output.reply}</div><button onClick={() => copyText("reply", output.reply)} style={{ marginTop: 10, width: "100%", border: `1.5px solid ${SOFT_BORDER}`, background: "#fff", color: DARK, borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 850, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Copy size={15} /> {copied === "reply" ? "Copied" : "Copy reply"}</button></div>
          <button onClick={openWhatsApp} style={{ border: "none", background: DARK, color: "#fff", borderRadius: 14, padding: 13, fontSize: 13, fontWeight: 950, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><MessageCircle size={17} /> Open WhatsApp</button>
          <div style={{ ...card, background: "#fff8fb" }}><div style={{ fontSize: 14, fontWeight: 950, color: DARK, marginBottom: 8 }}>How to post your Status</div><ol style={{ margin: 0, paddingLeft: 18, color: "#666", fontSize: 12, lineHeight: 1.7 }}><li>Tap Download Status Image.</li><li>Tap Copy Caption.</li><li>Open WhatsApp and go to Updates / Status.</li><li>Upload the image, paste the caption, and post.</li></ol></div>
        </div>
      </div>
    </div>
  );
}

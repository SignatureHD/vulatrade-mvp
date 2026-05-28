import React, { useEffect, useMemo, useRef, useState } from "react";
import { Copy, MessageCircle, MessageSquareText } from "lucide-react";
import { DARK, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";

const BUSINESS_TYPES = ["Hair / Beauty / Nails", "Cleaning Services", "Food / Catering", "Mobile Car Wash", "Clothing / Product Seller", "Repairs / Home Services", "General Business"];
const CATEGORIES = ["Daily menu", "Order confirmation", "Collection reminder", "Booking confirmation", "Booking reminder", "Payment reminder", "Thank you message", "Review request", "Weekend special", "Special offer", "Follow-up message", "New product/service announcement"];
const TAGS = ["All customers", "Regular", "VIP", "New Customer", "Interested", "Needs Follow-up", "Owes Money", "Booking Pending", "Promo List"];

const DEFAULT_TEMPLATES = {
  "Daily menu": "Hi [Customer Name], today's menu from [Business Name] is ready. Reply with your order before [Time].",
  "Order confirmation": "Hi [Customer Name], your order with [Business Name] is confirmed. Item: [Service/Product]. Amount: R[Amount]. Please send proof of payment to confirm your order.",
  "Collection reminder": "Hi [Customer Name], your order with [Business Name] will be ready for collection on [Date] at [Time].",
  "Booking confirmation": "Hi [Customer Name], your booking with [Business Name] is confirmed for [Date] at [Time]. We look forward to helping you.",
  "Booking reminder": "Hi [Customer Name], this is a reminder about your booking with [Business Name] on [Date] at [Time]. Please reply YES to confirm.",
  "Payment reminder": "Hi [Customer Name], friendly reminder that R[Amount] is still outstanding for your [Service/Product] order from [Business Name].",
  "Thank you message": "Hi [Customer Name], thank you for supporting [Business Name]. We appreciate your business.",
  "Review request": "Hi [Customer Name], thank you for supporting [Business Name]. If you were happy with your service, please send us a short review.",
  "Weekend special": "Hi [Customer Name], [Business Name] has a weekend special on [Service/Product]. Reply here if you are interested.",
  "Special offer": "Hi [Customer Name], [Business Name] has a special offer on [Service/Product]. Reply to this message if you are interested.",
  "Follow-up message": "Hi [Customer Name], just checking in from [Business Name]. Let us know if you still need help with [Service/Product].",
  "New product/service announcement": "Hi [Customer Name], [Business Name] now offers [Service/Product]. Reply here if you would like more details.",
};

const TYPE_TEMPLATES = {
  "Food / Catering": {
    "Payment reminder": "Hi [Customer Name], friendly reminder that R[Amount] is still outstanding for your [Service/Product] order from [Business Name].",
    "Order confirmation": "Hi [Customer Name], your order with [Business Name] is confirmed. Item: [Service/Product]. Amount: R[Amount]. Please send proof of payment to confirm your order.",
    "Daily menu": "Hi [Customer Name], today's menu from [Business Name] is ready. Reply with your order before [Time].",
  },
  "General Business": {
    "Payment reminder": "Hi [Customer Name], friendly reminder that R[Amount] is still outstanding for [Service/Product]. Thank you, [Business Name].",
  },
};

function businessTypeFromCategory(category = "") {
  const c = category.toLowerCase();
  if (/(food|catering|kitchen|vendor)/.test(c)) return "Food / Catering";
  if (/(nail|hair|barber|beauty)/.test(c)) return "Hair / Beauty / Nails";
  if (/clean/.test(c)) return "Cleaning Services";
  if (/car wash/.test(c)) return "Mobile Car Wash";
  if (/(clothing|retail|seller)/.test(c)) return "Clothing / Product Seller";
  if (/(repair|home service)/.test(c)) return "Repairs / Home Services";
  return "General Business";
}

function defaultCategory(type) {
  if (type === "Food / Catering") return "Daily menu";
  if (type === "General Business") return "Payment reminder";
  return "Booking reminder";
}

function getTemplate(type, category) {
  return TYPE_TEMPLATES[type]?.[category] || DEFAULT_TEMPLATES[category] || DEFAULT_TEMPLATES["Follow-up message"];
}

function fill(template, fields) {
  return template
    .replaceAll("[Customer Name]", fields.customerName || "customer")
    .replaceAll("[Business Name]", fields.businessName || "your business")
    .replaceAll("[Date]", fields.date || "the agreed date")
    .replaceAll("[Time]", fields.time || "the agreed time")
    .replaceAll("[Amount]", fields.amount || "0")
    .replaceAll("[Service/Product]", fields.item || "your service or product");
}

function normalizePhone(value = "") {
  const cleaned = value.replace(/[\s().-]/g, "");
  if (!cleaned) return { ok: true, phone: "" };
  if (/^0[6-8][0-9]{8}$/.test(cleaned)) return { ok: true, phone: `+27${cleaned.slice(1)}` };
  if (/^\+27[6-8][0-9]{8}$/.test(cleaned)) return { ok: true, phone: cleaned };
  if (/^27[6-8][0-9]{8}$/.test(cleaned)) return { ok: true, phone: `+${cleaned}` };
  return { ok: false, phone: "" };
}

function tagFromCustomer(customer) {
  const status = (customer?.status || "").toLowerCase();
  if (status === "vip") return "VIP";
  if (status === "regular") return "Regular";
  if (status === "new") return "New Customer";
  if (status === "lead" || (customer?.interested_in || []).length > 0) return "Interested";
  return "All customers";
}

export function MessagesTab({ business, prefill, onPrefillConsumed }) {
  const initialType = businessTypeFromCategory(business?.category);
  const [businessType, setBusinessType] = useState(initialType);
  const [category, setCategory] = useState(defaultCategory(initialType));
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerTag, setCustomerTag] = useState("All customers");
  const [fields, setFields] = useState({ customerName: "", businessName: business?.name || "", date: "", time: "", amount: "", item: "", phone: "" });
  const [customMessage, setCustomMessage] = useState(getTemplate(initialType, defaultCategory(initialType)));
  const [phoneError, setPhoneError] = useState("");
  const [copied, setCopied] = useState(false);
  const appliedQueryCustomer = useRef(false);
  const appliedPrefillKey = useRef("");

  useEffect(() => {
    const matched = businessTypeFromCategory(business?.category);
    setBusinessType(matched);
    setCategory(defaultCategory(matched));
  }, [business?.category]);

  useEffect(() => {
    if (!business?.id) { setLoadingCustomers(false); return; }
    setLoadingCustomers(true);
    supabase.from("customers")
      .select("id,name,whatsapp,status,total_spent,visit_count,notes,interested_in")
      .eq("business_id", business.id)
      .order("name")
      .then(({ data, error }) => {
        if (error) console.error("Load message customers:", error);
        setCustomers(data || []);
        setLoadingCustomers(false);
      });
  }, [business?.id]);

  useEffect(() => {
    setFields((prev) => ({ ...prev, businessName: business?.name || prev.businessName }));
  }, [business?.name]);

  useEffect(() => {
    setCustomMessage(getTemplate(businessType, category));
    setCopied(false);
  }, [businessType, category]);

  useEffect(() => {
    if (!prefill || appliedPrefillKey.current === prefill.key) return;
    appliedPrefillKey.current = prefill.key || String(Date.now());
    const type = prefill.businessType || businessTypeFromCategory(business?.category);
    const nextCategory = prefill.category || "Payment reminder";
    setBusinessType(type);
    setCategory(nextCategory);
    setCustomerTag(prefill.customerTag || "Owes Money");
    setSelectedCustomerId(prefill.customerId || "");
    setCustomerSearch(prefill.customerName || "");
    setFields((prev) => ({
      ...prev,
      customerName: prefill.customerName || prev.customerName,
      businessName: prefill.businessName || business?.name || prev.businessName,
      amount: prefill.amount ? String(prefill.amount) : prev.amount,
      item: prefill.item || prev.item,
      phone: prefill.phone || prev.phone,
      date: prefill.date || prev.date,
      time: prefill.time || prev.time,
    }));
    setCustomMessage(getTemplate(type, nextCategory));
    onPrefillConsumed?.();
  }, [prefill, business?.category, business?.name, onPrefillConsumed]);

  useEffect(() => {
    if (appliedQueryCustomer.current || customers.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("customerId");
    if (!customerId) return;
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    appliedQueryCustomer.current = true;
    setSelectedCustomerId(customer.id);
    setCustomerTag(tagFromCustomer(customer));
    setFields((prev) => ({ ...prev, customerName: customer.name || prev.customerName, phone: customer.whatsapp || prev.phone }));
  }, [customers]);

  function updateField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (key === "phone") setPhoneError("");
  }

  function customerMatchesTag(customer) {
    const status = (customer.status || "").toLowerCase();
    if (customerTag === "All customers") return true;
    if (customerTag === "Regular") return status === "regular";
    if (customerTag === "VIP") return status === "vip";
    if (customerTag === "New Customer") return status === "new";
    if (customerTag === "Interested") return status === "lead" || (customer.interested_in || []).length > 0;
    return true;
  }

  const filteredCustomers = useMemo(() => customers.filter((customer) => {
    const search = customerSearch.trim().toLowerCase();
    const matchesSearch = !search || (customer.name || "").toLowerCase().includes(search) || (customer.whatsapp || "").replace(/\s/g, "").includes(search.replace(/\s/g, ""));
    return matchesSearch && customerMatchesTag(customer);
  }), [customers, customerSearch, customerTag]);

  function selectCustomer(customerId) {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    setFields((prev) => ({ ...prev, customerName: customer.name || prev.customerName, phone: customer.whatsapp || prev.phone }));
    setCustomerTag(tagFromCustomer(customer));
    setCustomerSearch(customer.name || "");
    setPhoneError("");
  }

  const finalMessage = fill(customMessage, fields);

  async function copyMessage() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(finalMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      return;
    }
    window.prompt("Copy your message:", finalMessage);
  }

  function openWhatsApp() {
    const phone = normalizePhone(fields.phone);
    if (!phone.ok) { setPhoneError("Please enter a valid South African cellphone number."); return; }
    setPhoneError("");
    const url = phone.phone ? `https://wa.me/${phone.phone.replace("+", "")}?text=${encodeURIComponent(finalMessage)}` : `https://wa.me/?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Messages</h2>
        <p style={{ fontSize:"13px", color:"#888" }}>Use ready-made templates to follow up, remind customers and look professional.</p>
      </div>

      <div style={{ background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"18px", padding:"16px", display:"flex", gap:"12px", alignItems:"flex-start", marginBottom:"18px" }}>
        <span style={{ width:"38px", height:"38px", borderRadius:"50%", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><MessageCircle size={18} strokeWidth={2.2} color={BRAND} /></span>
        <div><div style={{ fontSize:"13px", fontWeight:900, color:DARK, marginBottom:"3px" }}>Manual messaging MVP</div><div style={{ fontSize:"12px", color:"#777", lineHeight:1.55 }}>VulaTrade prepares the message. You still review it and open WhatsApp to send.</div></div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:"16px" }}>
        <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px" }}>
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"14px" }}>Choose a template</div>
          <label style={labelStyle}>Business type</label>
          <select style={{ ...inputStyle, marginBottom:"14px" }} value={businessType} onChange={(e) => setBusinessType(e.target.value)}>{BUSINESS_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <label style={labelStyle}>Template category</label>
          <select style={{ ...inputStyle, marginBottom:"14px" }} value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <div style={{ height:"1px", background:"#eeeeea", margin:"4px 0 14px" }} />
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"6px" }}>Choose a customer</div>
          <label style={labelStyle}>Customer tag/group</label>
          <select style={{ ...inputStyle, marginBottom:"12px" }} value={customerTag} onChange={(e) => setCustomerTag(e.target.value)}>{TAGS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <label style={labelStyle}>Search customers</label>
          <input style={{ ...inputStyle, marginBottom:"10px" }} placeholder="Search by name or WhatsApp" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
          <select style={{ ...inputStyle, marginBottom:"14px" }} value={selectedCustomerId} onChange={(e) => selectCustomer(e.target.value)}>
            <option value="">{loadingCustomers ? "Loading customers..." : "Select a customer"}</option>
            {filteredCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.whatsapp ? ` · ${customer.whatsapp}` : ""}</option>)}
          </select>
          {customers.length > 0 && filteredCustomers.length === 0 && <div style={{ fontSize:"12px", color:"#aaa", marginBottom:"14px" }}>No customers match this search or group.</div>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"10px" }}>
            <div><label style={labelStyle}>Customer name</label><input style={inputStyle} value={fields.customerName} onChange={(e) => updateField("customerName", e.target.value)} /></div>
            <div><label style={labelStyle}>Business name</label><input style={inputStyle} value={fields.businessName} onChange={(e) => updateField("businessName", e.target.value)} /></div>
            <div><label style={labelStyle}>Date</label><input style={inputStyle} placeholder="e.g. Friday" value={fields.date} onChange={(e) => updateField("date", e.target.value)} /></div>
            <div><label style={labelStyle}>Time</label><input style={inputStyle} placeholder="e.g. 14:00" value={fields.time} onChange={(e) => updateField("time", e.target.value)} /></div>
            <div><label style={labelStyle}>Amount</label><input style={inputStyle} inputMode="numeric" placeholder="e.g. 250" value={fields.amount} onChange={(e) => updateField("amount", e.target.value)} /></div>
            <div><label style={labelStyle}>Service/product</label><input style={inputStyle} placeholder="e.g. Gel overlay" value={fields.item} onChange={(e) => updateField("item", e.target.value)} /></div>
          </div>
        </div>

        <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}><span style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}><MessageSquareText size={19} strokeWidth={2.2} color={BRAND} /></span><div><div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>Edit your message</div><div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>Placeholders update from the fields.</div></div></div>
          <textarea style={{ ...inputStyle, minHeight:"150px", resize:"vertical", lineHeight:1.55, marginBottom:"14px" }} value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} />
          <label style={labelStyle}>Customer WhatsApp number</label>
          <input style={{ ...inputStyle, borderColor: phoneError ? "#cc3300" : "#eeeeea", marginBottom: phoneError ? "6px" : "14px" }} placeholder="082 123 4567" value={fields.phone} onChange={(e) => updateField("phone", e.target.value)} />
          {phoneError && <div style={{ fontSize:"12px", color:"#cc3300", marginBottom:"14px" }}>{phoneError}</div>}
          <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", marginBottom:"14px" }}><div style={{ fontSize:"11px", color:"#aaa", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" }}>Final message</div><div style={{ fontSize:"13px", color:DARK, lineHeight:1.65, whiteSpace:"pre-wrap" }}>{finalMessage}</div></div>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}><button onClick={copyMessage} style={{ flex:"1 1 150px", background:BRAND, color:"#fff", border:"none", borderRadius:"12px", padding:"12px 16px", fontSize:"13px", fontWeight:900, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px" }}><Copy size={16} strokeWidth={2.2} />{copied ? "Copied" : "Copy Message"}</button><button onClick={openWhatsApp} style={{ flex:"1 1 150px", background:"#fff", color:BRAND, border:"1.5px solid #f8b8d2", borderRadius:"12px", padding:"12px 16px", fontSize:"13px", fontWeight:900, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px" }}><MessageCircle size={16} strokeWidth={2.2} />Open WhatsApp</button></div>
          <div style={{ marginTop:"14px", fontSize:"11px", color:"#888", lineHeight:1.5 }}>Only message customers who have agreed to receive updates from your business.</div>
        </div>
      </div>
    </div>
  );
}

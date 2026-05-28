import React, { useEffect, useMemo, useState } from "react";
import { Link2, MessageCircle, RefreshCw, UserPlus } from "lucide-react";
import { DARK } from "../../constants";
import { supabase } from "../../lib/supabase";
import { formatPhone, waLink } from "../../utils";

const BRAND = "#ea4c89";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "interested", label: "Interested" },
  { value: "quoted", label: "Quoted" },
  { value: "booked", label: "Booked" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "follow_up", label: "Follow-up" },
  { value: "lost", label: "Lost / not now" },
];

function money(value) {
  const amount = Number(value || 0);
  if (!amount) return "Ask price";
  return `R${amount.toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(value) {
  return STATUS_OPTIONS.find((status) => status.value === value)?.label || value || "New";
}

function digitsOnly(value = "") {
  return String(value).replace(/\D/g, "");
}

function samePhone(left = "", right = "") {
  const a = digitsOnly(formatPhone(left));
  const b = digitsOnly(formatPhone(right));
  return Boolean(a && b && a === b);
}

function mergeInterestedIn(current = [], productName = "") {
  const existing = Array.isArray(current) ? current : [];
  if (!productName || existing.includes(productName)) return existing;
  return [...existing, productName];
}

export function EnquiriesTab({ business }) {
  const [enquiries, setEnquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [linkingId, setLinkingId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2800);
  }

  const customerById = useMemo(() => {
    return customers.reduce((acc, customer) => {
      acc[customer.id] = customer;
      return acc;
    }, {});
  }, [customers]);

  const counts = useMemo(() => {
    return enquiries.reduce((acc, enquiry) => {
      acc.total += 1;
      acc[enquiry.status || "new"] = (acc[enquiry.status || "new"] || 0) + 1;
      if (enquiry.customer_id) acc.linked += 1;
      return acc;
    }, { total: 0, linked: 0 });
  }, [enquiries]);

  async function loadEnquiries() {
    if (!business?.id) return;
    setLoading(true);
    setError("");

    const [{ data: enquiryRows, error: loadError }, { data: customerRows, error: customerError }] = await Promise.all([
      supabase
        .from("enquiries")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("customers")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false }),
    ]);

    if (loadError) {
      setError(loadError.message || "Could not load enquiries.");
      setEnquiries([]);
    } else {
      setEnquiries(enquiryRows || []);
    }

    if (customerError) {
      console.warn("Could not load customers for enquiry linking", customerError.message);
      setCustomers([]);
    } else {
      setCustomers(customerRows || []);
    }

    setLoading(false);
  }

  useEffect(() => { loadEnquiries(); }, [business?.id]);

  async function updateEnquiry(id, patch) {
    setSavingId(id);
    setError("");
    const { error: updateError } = await supabase
      .from("enquiries")
      .update(patch)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message || "Could not update enquiry.");
    } else {
      setEnquiries((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
    }
    setSavingId(null);
  }

  async function linkEnquiryToCustomer(enquiry) {
    if (!business?.id || !enquiry?.id) return;

    const phone = formatPhone(enquiry.customer_phone || "");
    const name = (enquiry.customer_name || "").trim();

    if (!phone) {
      setError("Add the customer WhatsApp number first, then link the enquiry.");
      return;
    }

    setLinkingId(enquiry.id);
    setError("");

    const matchingCustomer = customers.find((customer) => samePhone(customer.whatsapp, phone));

    if (matchingCustomer) {
      const patch = {
        whatsapp: formatPhone(matchingCustomer.whatsapp || phone),
        name: matchingCustomer.name || name || "WhatsApp Customer",
        interested_in: mergeInterestedIn(matchingCustomer.interested_in, enquiry.product_name),
        last_contacted: new Date().toISOString(),
      };

      const { data: updatedCustomer, error: customerError } = await supabase
        .from("customers")
        .update(patch)
        .eq("id", matchingCustomer.id)
        .select()
        .single();

      if (customerError) {
        setError(customerError.message || "Could not update existing customer.");
        setLinkingId(null);
        return;
      }

      const enquiryPatch = {
        customer_id: matchingCustomer.id,
        customer_name: updatedCustomer?.name || matchingCustomer.name || name,
        customer_phone: updatedCustomer?.whatsapp || phone,
      };

      const { error: enquiryError } = await supabase.from("enquiries").update(enquiryPatch).eq("id", enquiry.id);
      if (enquiryError) {
        setError(enquiryError.message || "Could not link enquiry to customer.");
      } else {
        setCustomers((current) => current.map((customer) => customer.id === matchingCustomer.id ? (updatedCustomer || { ...customer, ...patch }) : customer));
        setEnquiries((current) => current.map((item) => item.id === enquiry.id ? { ...item, ...enquiryPatch } : item));
        showToast("Linked to existing customer");
      }
      setLinkingId(null);
      return;
    }

    const newCustomerPayload = {
      business_id: business.id,
      name: name || "WhatsApp Customer",
      whatsapp: phone,
      area: "",
      notes: `Created from enquiry about ${enquiry.product_name || "a product/service"}.`,
      status: "lead",
      interested_in: enquiry.product_name ? [enquiry.product_name] : [],
      last_contacted: new Date().toISOString(),
    };

    const { data: newCustomer, error: createError } = await supabase
      .from("customers")
      .insert([newCustomerPayload])
      .select()
      .single();

    if (createError) {
      setError(createError.message || "Could not create customer.");
      setLinkingId(null);
      return;
    }

    const enquiryPatch = {
      customer_id: newCustomer.id,
      customer_name: newCustomer.name,
      customer_phone: newCustomer.whatsapp,
    };

    const { error: enquiryError } = await supabase.from("enquiries").update(enquiryPatch).eq("id", enquiry.id);
    if (enquiryError) {
      setError(enquiryError.message || "Customer created, but enquiry could not be linked.");
    } else {
      setCustomers((current) => [newCustomer, ...current]);
      setEnquiries((current) => current.map((item) => item.id === enquiry.id ? { ...item, ...enquiryPatch } : item));
      showToast("Customer created and linked");
    }

    setLinkingId(null);
  }

  async function saveCustomerField(enquiry, patch) {
    await updateEnquiry(enquiry.id, patch);
    const updatedEnquiry = { ...enquiry, ...patch };
    if (patch.customer_phone && updatedEnquiry.customer_phone) {
      await linkEnquiryToCustomer(updatedEnquiry);
    }
  }

  function followUp(enquiry) {
    const message = `Hi, just following up on your enquiry about ${enquiry.product_name || "my product/service"}. Please let me know if you are still interested.`;
    updateEnquiry(enquiry.id, { status: "follow_up", last_follow_up_at: new Date().toISOString() });

    const linkedCustomer = enquiry.customer_id ? customerById[enquiry.customer_id] : null;
    const targetNumber = enquiry.customer_phone || linkedCustomer?.whatsapp || business?.whatsapp || business?.phone || "";
    if (targetNumber) {
      window.open(waLink(targetNumber, message), "_blank", "noopener,noreferrer");
      return;
    }

    navigator.clipboard?.writeText(message);
  }

  if (!business?.id) {
    return (
      <div style={{ maxWidth: "900px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 950, margin: "0 0 8px", color: DARK }}>Enquiries</h1>
        <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "22px", padding: "22px", color: "#777" }}>
          Set up your business first. Your public page enquiries will appear here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1040px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", marginBottom: "18px", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: BRAND, fontSize: "11px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Lead control</div>
          <h1 style={{ fontSize: "30px", fontWeight: 950, margin: "0 0 8px", color: DARK }}>Enquiries</h1>
          <p style={{ margin: 0, color: "#777", fontSize: "14px", lineHeight: 1.6 }}>Track who asked about what, who needs a reply, and who needs a follow-up.</p>
        </div>
        <button onClick={loadEnquiries} disabled={loading} style={{ border: "1px solid #eeeeea", background: "#fff", borderRadius: "14px", padding: "11px 14px", fontSize: "13px", fontWeight: 850, color: DARK, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <RefreshCw size={16} /> {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "18px", padding: "14px" }}><div style={{ fontSize: "24px", fontWeight: 950, color: DARK }}>{counts.total}</div><div style={{ fontSize: "12px", color: "#888", fontWeight: 800 }}>Total enquiries</div></div>
        <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "18px", padding: "14px" }}><div style={{ fontSize: "24px", fontWeight: 950, color: DARK }}>{counts.new || 0}</div><div style={{ fontSize: "12px", color: "#888", fontWeight: 800 }}>New</div></div>
        <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "18px", padding: "14px" }}><div style={{ fontSize: "24px", fontWeight: 950, color: DARK }}>{counts.linked || 0}</div><div style={{ fontSize: "12px", color: "#888", fontWeight: 800 }}>Linked customers</div></div>
        <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "18px", padding: "14px" }}><div style={{ fontSize: "24px", fontWeight: 950, color: DARK }}>{counts.follow_up || 0}</div><div style={{ fontSize: "12px", color: "#888", fontWeight: 800 }}>Follow-up</div></div>
      </div>

      {error && <div style={{ background: "#fff5f7", border: "1px solid #ffd7e4", color: "#9f1239", borderRadius: "16px", padding: "12px 14px", marginBottom: "14px", fontSize: "13px", fontWeight: 750 }}>{error}</div>}

      {loading ? (
        <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "22px", padding: "24px", color: "#777", fontWeight: 800 }}>Loading enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "24px", padding: "26px", textAlign: "center", boxShadow: "0 14px 42px rgba(15,23,42,0.06)" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#fde8f1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><MessageCircle size={24} color={BRAND} /></div>
          <h2 style={{ margin: "0 0 8px", color: DARK, fontSize: "20px", fontWeight: 950 }}>No enquiries yet</h2>
          <p style={{ margin: 0, color: "#777", fontSize: "14px", lineHeight: 1.6 }}>When someone clicks WhatsApp from your public page, their enquiry will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {enquiries.map((enquiry) => {
            const linkedCustomer = enquiry.customer_id ? customerById[enquiry.customer_id] : null;
            return (
            <div key={enquiry.id} style={{ background: "#fff", border: "1px solid #eeeeea", borderRadius: "22px", padding: "16px", boxShadow: "0 12px 34px rgba(15,23,42,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "12px" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: "17px", fontWeight: 950, color: DARK, marginBottom: "5px" }}>{enquiry.product_name || "General enquiry"}</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", color: "#777", fontSize: "12px", fontWeight: 800 }}>
                    <span>{money(enquiry.product_price)}</span>
                    <span>•</span>
                    <span>{formatDate(enquiry.created_at)}</span>
                    <span>•</span>
                    <span>{enquiry.source || "public_page"}</span>
                  </div>
                </div>
                <span style={{ background: "#fde8f1", color: BRAND, borderRadius: "999px", padding: "7px 10px", fontSize: "12px", fontWeight: 900 }}>{statusLabel(enquiry.status || "new")}</span>
              </div>

              {linkedCustomer && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f7fff5", border: "1px solid #d6f5cc", borderRadius: "14px", padding: "10px 12px", marginBottom: "12px", color: "#247a2b", fontSize: "12px", fontWeight: 850 }}>
                  <Link2 size={15} /> Linked to customer: {linkedCustomer.name} {linkedCustomer.whatsapp ? `(${linkedCustomer.whatsapp})` : ""}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "12px" }}>
                <label style={{ display: "grid", gap: "5px", fontSize: "12px", color: "#888", fontWeight: 850 }}>Customer name
                  <input value={enquiry.customer_name || ""} onChange={(event) => setEnquiries((current) => current.map((item) => item.id === enquiry.id ? { ...item, customer_name: event.target.value } : item))} onBlur={(event) => saveCustomerField(enquiry, { customer_name: event.target.value })} placeholder="Add name" style={{ border: "1px solid #eeeeea", borderRadius: "12px", padding: "10px 11px", fontSize: "13px" }} />
                </label>
                <label style={{ display: "grid", gap: "5px", fontSize: "12px", color: "#888", fontWeight: 850 }}>Customer WhatsApp
                  <input value={enquiry.customer_phone || ""} onChange={(event) => setEnquiries((current) => current.map((item) => item.id === enquiry.id ? { ...item, customer_phone: event.target.value } : item))} onBlur={(event) => saveCustomerField(enquiry, { customer_phone: event.target.value })} placeholder="e.g. 071 123 4567" style={{ border: "1px solid #eeeeea", borderRadius: "12px", padding: "10px 11px", fontSize: "13px" }} />
                </label>
                <label style={{ display: "grid", gap: "5px", fontSize: "12px", color: "#888", fontWeight: 850 }}>Status
                  <select value={enquiry.status || "new"} onChange={(event) => updateEnquiry(enquiry.id, { status: event.target.value })} disabled={savingId === enquiry.id} style={{ border: "1px solid #eeeeea", borderRadius: "12px", padding: "10px 11px", fontSize: "13px", background: "#fff" }}>
                    {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </label>
              </div>

              <label style={{ display: "grid", gap: "5px", fontSize: "12px", color: "#888", fontWeight: 850, marginBottom: "12px" }}>Notes
                <textarea value={enquiry.notes || ""} onChange={(event) => setEnquiries((current) => current.map((item) => item.id === enquiry.id ? { ...item, notes: event.target.value } : item))} onBlur={(event) => updateEnquiry(enquiry.id, { notes: event.target.value })} placeholder="Add notes, payment info or next step" rows={2} style={{ border: "1px solid #eeeeea", borderRadius: "12px", padding: "10px 11px", fontSize: "13px", resize: "vertical" }} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "8px" }}>
                <button onClick={() => linkEnquiryToCustomer(enquiry)} disabled={linkingId === enquiry.id || !enquiry.customer_phone} style={{ border: "1px solid #eeeeea", background: enquiry.customer_phone ? "#fff" : "#f7f7f7", color: enquiry.customer_phone ? DARK : "#aaa", borderRadius: "14px", padding: "12px 14px", fontSize: "13px", fontWeight: 950, cursor: enquiry.customer_phone ? "pointer" : "not-allowed", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                  <UserPlus size={17} /> {linkingId === enquiry.id ? "Linking..." : linkedCustomer ? "Update customer link" : "Create / link customer"}
                </button>
                <button onClick={() => followUp(enquiry)} style={{ border: "none", background: BRAND, color: "#fff", borderRadius: "14px", padding: "12px 14px", fontSize: "13px", fontWeight: 950, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                  <MessageCircle size={17} /> Follow up on WhatsApp
                </button>
              </div>
            </div>
          );})}
        </div>
      )}
      {toast && <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)", background: DARK, color: "#fff", padding: "12px 24px", borderRadius: "999px", fontSize: "13px", fontWeight: 800, zIndex: 2000, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>{toast}</div>}
    </div>
  );
}

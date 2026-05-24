import React from "react";
import { CheckCircle, HeartHandshake, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { DARK } from "../../constants";

const BRAND = "#ea4c89";

const PLAN_CARDS = [
  {
    name: "Vula Kasipreneur",
    badge: "Start here",
    price: "Free",
    description: "For entrepreneurs starting with WhatsApp, cash sales and basic records.",
    button: "Continue free",
    highlighted: false,
    icon: ShieldCheck,
    features: [
      "Public business page",
      "WhatsApp enquiry button",
      "Add products or services",
      "Basic sales tracking",
      "Basic customer list",
      "Basic expense tracking",
      "Customer reviews",
      "Business file starter",
      "Mobile-first dashboard",
    ],
  },
  {
    name: "Vula Small Business",
    badge: "Coming soon",
    price: "Coming soon",
    description: "For regular traders who want better records and a more professional setup.",
    button: "Join waitlist",
    highlighted: true,
    icon: Sparkles,
    features: [
      "Everything in Kasipreneur",
      "Unlimited products or services",
      "Quotes",
      "Invoices",
      "Receipts",
      "Customer history",
      "Expense categories",
      "Monthly sales summary",
      "Downloadable business report",
      "Supplier list",
    ],
  },
  {
    name: "Vula Growing Business",
    badge: "Coming soon",
    price: "Coming soon",
    description: "For businesses ready to manage orders, stock, customers and growth.",
    button: "Notify me",
    highlighted: false,
    icon: Rocket,
    features: [
      "Everything in Small Business",
      "Stock tracking",
      "Order management",
      "Payment link tracking",
      "Promotions and coupons",
      "Customer groups",
      "Staff user access",
      "Sales dashboard",
      "Stock alerts",
      "Growth readiness score",
    ],
  },
  {
    name: "Vula Partner",
    badge: "For programmes",
    price: "Partner pricing",
    description: "For organisations supporting many entrepreneurs.",
    button: "Contact Vula",
    highlighted: false,
    icon: HeartHandshake,
    features: [
      "Multi-business dashboard",
      "Entrepreneur progress tracking",
      "Programme reporting",
      "Business file exports",
      "Funding readiness reports",
      "Supplier development tracking",
      "Custom onboarding",
      "Partner support",
      "White-label options",
    ],
  },
];

function PlanCard({ plan }) {
  const Icon = plan.icon;
  return (
    <div style={{
      background: plan.highlighted ? "#fff" : DARK,
      color: plan.highlighted ? DARK : "#fff",
      border: plan.highlighted ? "1.5px solid #fff" : "1.5px solid #2b2b2d",
      borderRadius: "24px",
      padding: "26px",
      boxShadow: plan.highlighted ? "0 24px 70px rgba(255,255,255,0.08)" : "none",
      minHeight: "100%",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", marginBottom:"18px" }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:"7px", background:plan.highlighted ? "#fde8f1" : "rgba(255,255,255,0.08)", color:plan.highlighted ? BRAND : "#f8b8d2", borderRadius:"999px", padding:"8px 11px", fontSize:"11px", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.06em" }}>
          {plan.badge}
        </span>
        <span style={{ width:"38px", height:"38px", borderRadius:"50%", background:plan.highlighted ? "#fde8f1" : "rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={19} strokeWidth={2.2} color={BRAND} />
        </span>
      </div>

      <h3 style={{ fontSize:"22px", fontWeight:950, margin:"0 0 10px", letterSpacing:"0" }}>{plan.name}</h3>
      <p style={{ fontSize:"14px", color:plan.highlighted ? "#555" : "#bbb", lineHeight:1.65, margin:"0 0 24px" }}>{plan.description}</p>

      <div style={{ fontSize: plan.price === "Free" ? "34px" : "28px", fontWeight:950, marginBottom:"18px", letterSpacing:"-0.02em" }}>
        {plan.price}
      </div>

      <button type="button" style={{
        width:"100%",
        background: plan.highlighted ? BRAND : "#fff",
        color: plan.highlighted ? "#fff" : DARK,
        border:"none",
        borderRadius:"14px",
        padding:"14px 16px",
        fontSize:"14px",
        fontWeight:900,
        cursor:"pointer",
        marginBottom:"22px",
      }}>
        {plan.button}
      </button>

      <div style={{ display:"grid", gap:"11px" }}>
        {plan.features.map((feature) => (
          <div key={feature} style={{ display:"flex", alignItems:"flex-start", gap:"10px", fontSize:"13px", color:plan.highlighted ? "#444" : "#c9c9c9", lineHeight:1.45 }}>
            <CheckCircle size={16} strokeWidth={2.2} color={BRAND} style={{ flexShrink:0, marginTop:"1px" }} />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlansTab() {
  return (
    <div style={{ background:DARK, borderRadius:"28px", padding:"28px", color:"#fff" }}>
      <div style={{ maxWidth:"860px", margin:"0 auto 28px", textAlign:"center" }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", color:"#f8b8d2", borderRadius:"999px", padding:"8px 12px", fontSize:"12px", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"14px" }}>
          <Sparkles size={15} strokeWidth={2.2} />
          Start free. Grow when ready.
        </span>
        <h2 style={{ fontSize:"clamp(30px, 5vw, 48px)", lineHeight:1.05, fontWeight:950, margin:"0 0 12px" }}>Choose the plan that matches your stage</h2>
        <p style={{ fontSize:"15px", color:"#bbb", lineHeight:1.7, margin:"0 auto", maxWidth:"720px" }}>
          The free Kasipreneur plan removes barriers. Start with what you have. Upgrade options will open only when your business needs more tools.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:"18px" }}>
        {PLAN_CARDS.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
      </div>

      <div style={{ textAlign:"center", color:"#aaa", fontSize:"14px", lineHeight:1.7, maxWidth:"760px", margin:"28px auto 0" }}>
        Pilot users keep free access during the pilot. VulaTrade will keep the first step simple so entrepreneurs can build their business page, products, sales records, reviews and business file without pressure.
      </div>
    </div>
  );
}

import { supabase } from "./lib/supabase";
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

async function testConnection() {
  const { data, error } = await supabase.from("profiles").select("*");
  console.log("DATA:", data);
  console.log("ERROR:", error);
}

testConnection();

const statuses = ["New Lead", "Contacted", "Quote Sent", "Booked", "Paid", "Completed", "Follow Up"];

const starterBusiness = {
  name: "Nomsa Nails",
  owner: "Nomsa Mokoena",
  category: "Beauty & Nails",
  area: "Mitchells Plain",
  whatsapp: "27821234567",
  description: "Home-based nail salon offering gel overlays, acrylic sets and soak-offs.",
  payment: "EFT or cash before appointment",
  slug: "nomsa-nails",
};

const starterProducts = [
  { id: 1, name: "Gel overlay", price: 220 },
  { id: 2, name: "Acrylic set", price: 350 },
  { id: 3, name: "Soak off", price: 80 },
];

const starterCustomers = [
  { id: 1, name: "Thabo M.", phone: "082 111 2222", interest: "Gel overlay", status: "Follow Up", value: 220 },
  { id: 2, name: "Ayanda K.", phone: "083 333 4444", interest: "Acrylic set", status: "Paid", value: 350 },
  { id: 3, name: "Nomsa D.", phone: "084 555 6666", interest: "Soak off", status: "Quote Sent", value: 80 },
];

const growthTools = [
  ["WhatsApp Selling Page", "Capture enquiries and bookings from one simple link."],
  ["Customer Follow-up List", "Bring back people who asked but did not buy yet."],
  ["Review Request Flow", "Ask happy customers for reviews and referrals."],
  ["Payment Reminder", "Send a polite payment request with clear details."],
  ["Facebook Group Post", "Advertise your offer in local community groups."],
  ["Repeat Promo", "Send weekly or monthly offers to past customers."],
];

const learningSteps = [
  "Set up WhatsApp Business properly",
  "Create your first local offer",
  "Build a simple price list",
  "Track every enquiry and follow-up",
  "Ask for payment professionally",
  "Know when to register and open a business bank account",
];

function money(value) {
  return `R${Number(value || 0).toLocaleString("en-ZA")}`;
}

function slugify(value) {
  return String(value || "business").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function whatsappLink(number, message) {
  const clean = String(number || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

function Icon({ name, className = "h-5 w-5" }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    check: <path d="M20 6 9 17l-5-5" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    store: <><path d="M4 10h16" /><path d="M5 10l1-6h12l1 6" /><path d="M6 10v10h12V10" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>,
    wallet: <><path d="M3 7a2 2 0 0 1 2-2h14v14H5a2 2 0 0 1-2-2V7z" /><path d="M16 12h4" /></>,
    message: <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.5-5A8 8 0 1 1 21 12z" />,
    spark: <path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z" />,
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

function Button({ children, onClick, variant = "default", className = "" }) {
  const styles = variant === "outline" ? "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50" : variant === "ghost" ? "bg-transparent text-slate-700 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800";
  return <button onClick={onClick} className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${styles} ${className}`}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-lime-300" />
    </label>
  );
}

function Stat({ icon, label, value }) {
  return (
    <Card className="rounded-2xl">
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100"><Icon name={icon} /></div>
        <div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-semibold">{value}</p></div>
      </div>
    </Card>
  );
}

function BusinessPreview({ business, products }) {
  const message = `Hi ${business.name}, I am interested in ${products[0]?.name || "your services"}. Please send me more information.`;
  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="p-6">
        <div className="mb-5 rounded-2xl bg-slate-900 p-5 text-white">
          <p className="text-sm text-lime-300">Public business page</p>
          <h3 className="mt-1 text-2xl font-bold">{business.name}</h3>
          <p className="mt-2 text-sm text-slate-300">{business.category} · {business.area}</p>
          <p className="mt-3 text-sm text-slate-200">{business.description}</p>
          <a href={whatsappLink(business.whatsapp, message)} target="_blank" rel="noreferrer"><Button className="mt-4 w-full bg-lime-300 text-slate-900 hover:bg-lime-400">WhatsApp to Book or Order</Button></a>
        </div>
        <div className="grid gap-3">{products.map((p) => <div key={p.id} className="flex justify-between rounded-xl bg-slate-100 p-3"><span>{p.name}</span><strong>{money(p.price)}</strong></div>)}</div>
        <p className="mt-4 text-xs text-slate-400">Preview URL: vulatrade.co.za/b/{business.slug}</p>
      </div>
    </Card>
  );
}

function VulaTradeApp() {
  const [tab, setTab] = useState("dashboard");
  const [business, setBusiness] = useState(starterBusiness);
  const [products, setProducts] = useState(starterProducts);
  const [customers, setCustomers] = useState(starterCustomers);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", interest: "", status: "New Lead", value: "" });

  const nav = [["dashboard", "Dashboard"], ["setup", "Setup"], ["page", "Business Page"], ["customers", "Customers"], ["messages", "Messages"], ["growth", "Growth"], ["learn", "Learn"]];
  const totalSales = customers.reduce((sum, c) => sum + Number(c.value || 0), 0);
  const openLeads = customers.filter((c) => !["Paid", "Completed"].includes(c.status)).length;
  const followUps = customers.filter((c) => c.status === "Follow Up").length;

  const templates = useMemo(() => [
    ["New enquiry reply", `Hi, thank you for contacting ${business.name}. Please send me what you are interested in and your preferred date/time.`],
    ["Payment request", `Hi, thank you for your order with ${business.name}. Your total is [amount]. Payment method: ${business.payment}. Please send proof of payment once done.`],
    ["Review request", `Thank you for supporting ${business.name}. Please send a short review if you were happy with the service.`],
    ["Repeat promo", `Hi, ${business.name} has a special this week. Reply here if you would like to book or order again.`],
  ], [business]);

  function updateBusiness(field, value) {
    setBusiness((b) => ({ ...b, [field]: value, slug: field === "name" ? slugify(value) : b.slug }));
  }

  function addProduct() {
    if (!newProduct.name.trim()) return;
    setProducts((items) => [...items, { id: Date.now(), name: newProduct.name, price: Number(newProduct.price || 0) }]);
    setNewProduct({ name: "", price: "" });
  }

  function addCustomer() {
    if (!newCustomer.name.trim()) return;
    setCustomers((items) => [...items, { id: Date.now(), ...newCustomer, value: Number(newCustomer.value || 0) }]);
    setNewCustomer({ name: "", phone: "", interest: "", status: "New Lead", value: "" });
  }

  function updateStatus(id, status) {
    setCustomers((items) => items.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 font-bold text-lime-300">VT</div><div><p className="text-lg font-bold leading-tight">VulaTrade</p><p className="text-xs text-slate-500">Start local. Sell smarter. Grow stronger.</p></div></div>
          <nav className="hidden items-center gap-2 md:flex">{nav.map(([id, label]) => <Button key={id} variant={tab === id ? "default" : "ghost"} onClick={() => setTab(id)}>{label}</Button>)}</nav>
          <Button className="bg-lime-300 text-slate-900 hover:bg-lime-400" onClick={() => setTab("setup")}>Create Account</Button>
        </div>
        <div className="overflow-x-auto border-t bg-white px-4 py-2 md:hidden"><div className="flex min-w-max gap-2">{nav.map(([id, label]) => <Button key={id} variant={tab === id ? "default" : "outline"} onClick={() => setTab(id)}>{label}</Button>)}</div></div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-10 grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2 text-sm font-medium text-slate-800"><Icon name="spark" className="h-4 w-4" /> AI-powered tools for small business growth</div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">The simple business operating system for local entrepreneurs.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">VulaTrade gives small businesses the tools to get noticed, capture enquiries, follow up with customers, turn interest into bookings or sales, collect reviews and bring customers back.</p>
            <p className="mt-3 max-w-2xl text-base text-slate-500">Built to help you start local, sell smarter and grow stronger — from your phone.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button className="bg-slate-900 text-white" onClick={() => setTab("setup")}>Start My Business <Icon name="arrow" className="ml-2 h-4 w-4" /></Button><Button variant="outline" onClick={() => setTab("growth")}>Grow My Business</Button></div>
          </div>
          <BusinessPreview business={business} products={products} />
        </section>

        {tab === "dashboard" && <section className="space-y-6"><div className="grid gap-4 md:grid-cols-4"><Stat icon="store" label="Business Page" value="Live" /><Stat icon="users" label="Customers" value={customers.length} /><Stat icon="message" label="Open Leads" value={openLeads} /><Stat icon="wallet" label="Tracked Sales" value={money(totalSales)} /></div><Card><div className="p-6"><h2 className="text-2xl font-bold">Today’s focus</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{[`${followUps} customer follow-up${followUps === 1 ? "" : "s"} due`, "Ask 2 customers for reviews", "Post one WhatsApp Status update", "Check payment status before delivery"].map((item) => <div key={item} className="flex gap-3"><Icon name="check" className="text-lime-600" /><span>{item}</span></div>)}</div></div></Card></section>}

        {tab === "setup" && <section className="space-y-6"><div><h2 className="text-3xl font-bold">Business Setup</h2><p className="text-slate-500">Create the basics needed to sell, get enquiries and get paid.</p></div><div className="grid gap-6 lg:grid-cols-2"><Card><div className="space-y-4 p-6"><h3 className="text-xl font-bold">Business details</h3><div className="grid gap-4 md:grid-cols-2"><Field label="Business name" value={business.name} onChange={(v) => updateBusiness("name", v)} /><Field label="Owner name" value={business.owner} onChange={(v) => updateBusiness("owner", v)} /><Field label="Category" value={business.category} onChange={(v) => updateBusiness("category", v)} /><Field label="Area served" value={business.area} onChange={(v) => updateBusiness("area", v)} /><Field label="WhatsApp number" value={business.whatsapp} onChange={(v) => updateBusiness("whatsapp", v)} /><Field label="Payment method" value={business.payment} onChange={(v) => updateBusiness("payment", v)} /></div></div></Card><Card><div className="space-y-4 p-6"><h3 className="text-xl font-bold">Products or services</h3><div className="grid gap-4 md:grid-cols-2"><Field label="Product/service" value={newProduct.name} onChange={(v) => setNewProduct((p) => ({ ...p, name: v }))} /><Field label="Price" value={newProduct.price} onChange={(v) => setNewProduct((p) => ({ ...p, price: v }))} /></div><Button onClick={addProduct}>Add product/service</Button><div className="grid gap-3">{products.map((p) => <div key={p.id} className="flex justify-between rounded-2xl border border-slate-200 p-4"><span>{p.name}</span><strong>{money(p.price)}</strong></div>)}</div></div></Card></div></section>}

        {tab === "page" && <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><Card><div className="p-6"><h2 className="text-3xl font-bold">My Business Page</h2><p className="mt-2 text-slate-500">Your simple website replacement. Share it on WhatsApp, Facebook, Instagram, TikTok and Google Business Profile.</p><div className="mt-6 space-y-4"><Field label="Business page slug" value={business.slug} onChange={(v) => updateBusiness("slug", slugify(v))} /><div className="rounded-2xl border border-lime-200 bg-lime-50 p-4"><p className="font-semibold">Public link</p><p className="mt-1 text-sm text-slate-600">vulatrade.co.za/b/{business.slug}</p></div></div></div></Card><BusinessPreview business={business} products={products} /></section>}

        {tab === "customers" && <section className="space-y-6"><div><h2 className="text-3xl font-bold">Customer Tracker</h2><p className="text-slate-500">Track leads, orders, payments and follow-ups.</p></div><Card><div className="p-6"><div className="grid gap-4 md:grid-cols-6"><Field label="Name" value={newCustomer.name} onChange={(v) => setNewCustomer((c) => ({ ...c, name: v }))} /><Field label="Phone" value={newCustomer.phone} onChange={(v) => setNewCustomer((c) => ({ ...c, phone: v }))} /><Field label="Interest" value={newCustomer.interest} onChange={(v) => setNewCustomer((c) => ({ ...c, interest: v }))} /><label className="block"><span className="text-sm font-medium text-slate-700">Status</span><select value={newCustomer.status} onChange={(e) => setNewCustomer((c) => ({ ...c, status: e.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5">{statuses.map((s) => <option key={s}>{s}</option>)}</select></label><Field label="Value" value={newCustomer.value} onChange={(v) => setNewCustomer((c) => ({ ...c, value: v }))} /><div className="flex items-end"><Button onClick={addCustomer}>Add</Button></div></div></div></Card><div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">{statuses.map((status) => <Card key={status}><div className="p-4"><h3 className="font-bold">{status}</h3><div className="mt-4 space-y-3">{customers.filter((c) => c.status === status).map((c) => <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-3"><p className="font-semibold">{c.name}</p><p className="text-sm text-slate-500">{c.interest} · {money(c.value)}</p><select value={c.status} onChange={(e) => updateStatus(c.id, e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">{statuses.map((s) => <option key={s}>{s}</option>)}</select></div>)}</div></div></Card>)}</div></section>}

        {tab === "messages" && <section className="space-y-6"><div><h2 className="text-3xl font-bold">Message Templates</h2><p className="text-slate-500">WhatsApp-ready replies, payment requests, review requests and repeat promos.</p></div><div className="grid gap-4 md:grid-cols-2">{templates.map(([title, text]) => <Card key={title}><div className="p-6"><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 rounded-2xl bg-slate-100 p-4 text-slate-600">{text}</p><a href={whatsappLink(business.whatsapp, text)} target="_blank" rel="noreferrer"><Button className="mt-4 bg-lime-300 text-slate-900 hover:bg-lime-400">Open in WhatsApp</Button></a></div></Card>)}</div></section>}

        {tab === "growth" && <section className="space-y-6"><div><h2 className="text-3xl font-bold">Growth Tools</h2><p className="text-slate-500">Capture enquiries, follow up, collect reviews and bring customers back.</p></div><div className="grid gap-4 md:grid-cols-3">{growthTools.map(([name, desc]) => <Card key={name}><div className="p-6"><Icon name="store" className="mb-4 h-8 w-8" /><h3 className="text-xl font-bold">{name}</h3><p className="mt-2 text-slate-500">{desc}</p></div></Card>)}</div></section>}

        {tab === "learn" && <section className="grid gap-6 lg:grid-cols-3"><Card className="lg:col-span-2"><div className="p-6"><h2 className="text-3xl font-bold">Business Setup Roadmap</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{learningSteps.map((item, i) => <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-100 font-bold">{i + 1}</div><div><p className="font-semibold">{item}</p><p className="mt-1 text-sm text-slate-500">Short lesson + checklist</p></div></div>)}</div></div></Card><Card><div className="p-6"><h3 className="text-xl font-bold">Get Paid Toolkit</h3><div className="mt-5 space-y-3">{["Payment links", "EFT and cash tracking", "Payment reminder messages", "Business banking guidance", "Supplier payment basics"].map((item) => <div key={item} className="flex gap-3"><Icon name="wallet" /><span>{item}</span></div>)}</div></div></Card></section>}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<VulaTradeApp />);

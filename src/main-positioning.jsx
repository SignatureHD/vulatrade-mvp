import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function Button({ children, className = "", variant = "default", ...props }) {
  const base = "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-50";
  const styles = variant === "outline"
    ? "border border-slate-300 bg-white text-slate-950 hover:bg-slate-100"
    : variant === "dark"
      ? "bg-black text-white hover:bg-slate-800"
      : "bg-lime-300 text-slate-950 hover:bg-lime-200";
  return <button className={`${base} ${styles} ${className}`} {...props}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

function Icon({ name, className = "h-5 w-5" }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const icons = {
    arrow: <svg {...common}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    bot: <svg {...common}><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4"/><path d="M9 13h.01"/><path d="M15 13h.01"/><path d="M9 17h6"/></svg>,
    card: <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></svg>,
    check: <svg {...common}><path d="M20 6 9 17l-5-5"/></svg>,
    megaphone: <svg {...common}><path d="M3 11v2l14 5V6L3 11Z"/><path d="M7 14v4a2 2 0 0 0 4 0v-2"/><path d="M21 8v8"/></svg>,
    message: <svg {...common}><path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.5-5A8 8 0 1 1 21 12Z"/></svg>,
    repeat: <svg {...common}><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    spark: <svg {...common}><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3Z"/></svg>,
    star: <svg {...common} fill="currentColor" stroke="currentColor"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>,
    store: <svg {...common}><path d="M4 10h16"/><path d="M5 10l1-6h12l1 6"/><path d="M6 10v10h12V10"/><path d="M9 20v-5h6v5"/></svg>,
    wallet: <svg {...common}><path d="M3 7a2 2 0 0 1 2-2h14v14H5a2 2 0 0 1-2-2V7Z"/><path d="M16 12h4"/><path d="M7 9h5"/></svg>,
    users: <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  };
  return icons[name] || icons.spark;
}

const businessTemplates = [
  { id: "nails", name: "Home Nail Salon", icon: "💅", area: "Mitchells Plain", business: "Nomsa Nails", category: "Beauty & Nails", products: [{ name: "Gel overlay", price: 220 }, { name: "Acrylic set", price: 350 }, { name: "Soak off", price: 80 }] },
  { id: "produce", name: "Fresh Produce Reseller", icon: "🥬", area: "Khayelitsha", business: "Kasi Fresh Deals", category: "Fresh Produce", products: [{ name: "Veg combo box", price: 120 }, { name: "Fruit combo bag", price: 90 }, { name: "5L cooking oil", price: 165 }] },
  { id: "barber", name: "Barber / Grooming", icon: "✂️", area: "Soweto", business: "Sharp Cut Studio", category: "Barber", products: [{ name: "Fade cut", price: 100 }, { name: "Beard trim", price: 60 }, { name: "Kids cut", price: 70 }] },
  { id: "delivery", name: "Local Delivery Runner", icon: "🛵", area: "Gugulethu", business: "Quick Kasi Runner", category: "Local Delivery", products: [{ name: "Local delivery", price: 35 }, { name: "Vendor pickup", price: 50 }, { name: "Weekly delivery plan", price: 250 }] },
];

const starterCustomers = [
  { id: 1, name: "Thabo M.", interest: "Gel overlay", status: "New Lead", value: 220 },
  { id: 2, name: "Ayanda K.", interest: "Acrylic set", status: "Quote Sent", value: 350 },
  { id: 3, name: "Nomsa D.", interest: "Soak off", status: "Paid", value: 80 },
  { id: 4, name: "Lunga S.", interest: "Repeat booking", status: "Follow Up", value: 150 },
];

const statuses = ["New Lead", "Contacted", "Quote Sent", "Paid", "Follow Up"];
const formatRand = (value) => `R${Number(value || 0).toLocaleString("en-ZA")}`;

function PhoneMockup({ onDemo }) {
  return <div className="relative mx-auto w-[310px] rounded-[42px] border-[10px] border-black bg-black p-3 shadow-2xl">
    <div className="overflow-hidden rounded-[30px] bg-white">
      <div className="bg-gradient-to-br from-lime-100 via-white to-slate-100 p-5">
        <div className="flex items-center justify-between"><div><p className="text-xs font-medium text-lime-700">AI business page</p><h3 className="text-2xl font-black text-slate-950">Nomsa Nails</h3></div><div className="rounded-full bg-black px-3 py-1 text-xs text-lime-200">Live</div></div>
        <p className="mt-2 text-sm text-slate-600">Beauty & Nails · Mitchells Plain</p>
        <Button onClick={onDemo} className="mt-4 w-full rounded-2xl bg-black text-white hover:bg-slate-800">Open Demo Dashboard</Button>
      </div>
      <div className="space-y-3 p-4">
        {businessTemplates[0].products.map((product) => <div key={product.name} className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">💅</div><div className="flex-1"><p className="text-sm font-bold text-slate-950">{product.name}</p><p className="text-xs text-slate-500">Ready to promote</p></div><p className="text-sm font-black">{formatRand(product.price)}</p></div>)}
      </div>
    </div>
  </div>;
}

function FloatingCard({ className, children }) {
  return <div className={`absolute rounded-3xl bg-white/95 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur ${className}`}>{children}</div>;
}

function LandingPage({ onDemo }) {
  return <div className="min-h-screen bg-[#f8f8f5] text-slate-950">
    <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-40 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-lime-200/40 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <nav className="mb-16 flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-lg font-black text-lime-300">VT</div><div><p className="text-lg font-black">VulaTrade</p><p className="text-xs text-slate-500">Start local. Sell smarter. Grow stronger.</p></div></div><div className="hidden items-center gap-8 text-sm text-slate-700 md:flex"><a href="#features">Features</a><a href="#templates">Templates</a><a href="#how">How it works</a></div><Button onClick={onDemo} variant="dark">Try Demo</Button></nav>
        <div className="text-center"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200"><Icon name="spark" className="h-4 w-4 text-lime-600" /> AI-powered business launch and growth system</div><h1 className="mx-auto max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">Launch your business. Automate your customer journey. Grow while you work.</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">VulaTrade helps aspiring and existing business owners set up, promote, automate and grow using ready-made templates, AI-powered journeys, social growth tools, payment support and simple customer tracking.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button onClick={onDemo} variant="dark" className="px-7 py-6">Choose Business Template <Icon name="arrow" className="ml-2 h-4 w-4" /></Button><Button onClick={onDemo} variant="outline" className="px-7 py-6">Build My Own System</Button></div></div>
        <div className="relative mx-auto mt-14 max-w-5xl"><div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200" /><div className="absolute left-1/2 top-1/2 h-[520px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200" /><PhoneMockup onDemo={onDemo} /><FloatingCard className="left-0 top-8 hidden w-48 md:block"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Icon name="megaphone" className="h-4 w-4 text-lime-600" /> Social Reach</div><p className="text-3xl font-black">+40%</p><p className="text-xs text-slate-500">More local enquiries</p></FloatingCard><FloatingCard className="right-4 top-0 hidden w-48 bg-lime-200 md:block"><p className="text-4xl font-black">8</p><p className="text-sm font-semibold">Sales tracked this week</p><p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-sm font-bold">R1,240</p></FloatingCard></div>
      </div>
    </section>
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-3xl text-center"><p className="font-semibold text-lime-700">AI business system</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Everything a small business needs to start and grow</h2><p className="mt-5 text-lg text-slate-600">Simple tools to launch, sell, follow up and grow.</p></div><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{[{icon:"store",title:"Business templates",text:"Start from a ready-made business setup."},{icon:"bot",title:"AI journeys",text:"Prepare replies, reminders and repeat-sale prompts."},{icon:"megaphone",title:"Social growth",text:"Create content ideas for local selling."},{icon:"wallet",title:"Payment tracking",text:"Track paid, unpaid and follow-up customers."}].map((f)=><Card key={f.title}><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100"><Icon name={f.icon} className="h-7 w-7" /></div><h3 className="text-xl font-black">{f.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{f.text}</p></Card>)}</div></div></section>
    <section id="templates" className="bg-white px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><p className="font-semibold text-lime-700">Ready-made templates</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Pick a business type and launch faster</h2><div className="mt-8 grid gap-4 md:grid-cols-4">{businessTemplates.map((t)=><button key={t.id} onClick={onDemo} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:bg-lime-50 hover:shadow-lg"><div className="text-4xl">{t.icon}</div><p className="mt-4 text-lg font-black">{t.name}</p><p className="mt-2 text-sm text-slate-500">Page + offers + journey prompts</p></button>)}</div></div></section>
    <section id="how" className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl text-center"><p className="font-semibold text-lime-700">How it works</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">From idea to working business system</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{["Choose a template", "Customise your offer", "Track customers and follow up"].map((s,i)=><Card key={s} className="text-left"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-black text-xl font-black text-lime-300">{i+1}</div><h3 className="text-2xl font-black">{s}</h3><p className="mt-4 text-slate-600">Start simple, then improve as the business grows.</p></Card>)}</div></div></section>
  </div>;
}

function DemoDashboard({ onBack }) {
  const [selectedTemplate, setSelectedTemplate] = useState(businessTemplates[0]);
  const [customers, setCustomers] = useState(starterCustomers);
  const [selectedStatus, setSelectedStatus] = useState("New Lead");
  const totalValue = useMemo(() => customers.reduce((sum, customer) => sum + customer.value, 0), [customers]);
  const moveCustomer = (id, status) => setCustomers((items) => items.map((customer) => customer.id === id ? { ...customer, status } : customer));
  const visibleCustomers = customers.filter((customer) => customer.status === selectedStatus);
  const messages = [
    `Hi, thank you for contacting ${selectedTemplate.business}. What would you like to order or book?`,
    `Your total is [amount]. Please send proof of payment so we can confirm your order.`,
    `Thank you for supporting ${selectedTemplate.business}. Please send a quick review if you were happy.`,
  ];
  const socialIdeas = [
    `Behind the scenes: show how ${selectedTemplate.business} prepares an order.`,
    `Before and after post for ${selectedTemplate.category}.`,
    `Customer question of the day: answer one common buying concern.`
  ];
  return <div className="min-h-screen bg-slate-950 text-white">
    <header className="border-b border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-300 font-black text-black">VT</div><div><p className="text-lg font-black">VulaTrade Demo Dashboard</p><p className="text-xs text-slate-400">Template picker · CRM · Messages · Social ideas</p></div></div><Button onClick={onBack} variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">Back to landing</Button></div></header>
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-4 md:grid-cols-4"><Card className="bg-white/5 text-white border-white/10"><p className="text-sm text-slate-400">Selected template</p><p className="mt-2 text-2xl font-black">{selectedTemplate.name}</p></Card><Card className="bg-white/5 text-white border-white/10"><p className="text-sm text-slate-400">Customers</p><p className="mt-2 text-2xl font-black">{customers.length}</p></Card><Card className="bg-white/5 text-white border-white/10"><p className="text-sm text-slate-400">Tracked value</p><p className="mt-2 text-2xl font-black">{formatRand(totalValue)}</p></Card><Card className="bg-lime-300 text-black border-lime-200"><p className="text-sm font-semibold">MVP status</p><p className="mt-2 text-2xl font-black">Demo ready</p></Card></section>
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><Card className="bg-white text-slate-950"><h2 className="text-2xl font-black">1. Choose a business template</h2><p className="mt-2 text-sm text-slate-600">Click a template and the dashboard changes.</p><div className="mt-5 grid gap-3">{businessTemplates.map((template)=><button key={template.id} onClick={()=>setSelectedTemplate(template)} className={`rounded-2xl border p-4 text-left transition ${selectedTemplate.id === template.id ? "border-lime-400 bg-lime-50 ring-2 ring-lime-100" : "border-slate-200 bg-white hover:bg-slate-50"}`}><div className="flex items-center gap-3"><span className="text-3xl">{template.icon}</span><div><p className="font-black">{template.name}</p><p className="text-sm text-slate-500">{template.business} · {template.area}</p></div></div></button>)}</div></Card><Card className="bg-white text-slate-950"><h2 className="text-2xl font-black">2. Business page preview</h2><div className="mt-5 rounded-3xl bg-gradient-to-br from-lime-100 via-white to-slate-100 p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-lime-700">{selectedTemplate.category}</p><h3 className="mt-1 text-4xl font-black">{selectedTemplate.business}</h3><p className="mt-2 text-slate-600">Serving customers in {selectedTemplate.area}</p></div><span className="rounded-full bg-black px-3 py-1 text-sm font-bold text-lime-300">Live preview</span></div><div className="mt-6 grid gap-3 md:grid-cols-3">{selectedTemplate.products.map((product)=><div key={product.name} className="rounded-2xl bg-white p-4 shadow-sm"><p className="font-black">{product.name}</p><p className="mt-2 text-xl font-black">{formatRand(product.price)}</p></div>)}</div><Button className="mt-6 w-full rounded-2xl bg-black text-white hover:bg-slate-800">WhatsApp enquiry button</Button></div></Card></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]"><Card className="bg-white text-slate-950"><h2 className="text-2xl font-black">3. Simple CRM</h2><p className="mt-2 text-sm text-slate-600">Click a stage, then move customers with the buttons.</p><div className="mt-5 flex flex-wrap gap-2">{statuses.map((status)=><button key={status} onClick={()=>setSelectedStatus(status)} className={`rounded-full px-4 py-2 text-sm font-bold ${selectedStatus === status ? "bg-black text-white" : "bg-slate-100 text-slate-700"}`}>{status} ({customers.filter((c)=>c.status===status).length})</button>)}</div><div className="mt-5 space-y-3">{visibleCustomers.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No customers in this stage yet.</div> : visibleCustomers.map((customer)=><div key={customer.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{customer.name}</p><p className="text-sm text-slate-500">{customer.interest} · {formatRand(customer.value)}</p></div><Icon name="users" className="h-5 w-5 text-lime-700" /></div><div className="mt-3 flex flex-wrap gap-2">{statuses.filter((s)=>s!==customer.status).map((status)=><button key={status} onClick={()=>moveCustomer(customer.id, status)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-lime-100">Move to {status}</button>)}</div></div>)}</div></Card><Card className="bg-white text-slate-950"><h2 className="text-2xl font-black">4. Message and social tools</h2><div className="mt-5 space-y-4"><div><p className="font-black">WhatsApp message templates</p><div className="mt-3 space-y-2">{messages.map((message)=><div key={message} className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">{message}</div>)}</div></div><div><p className="font-black">Social growth prompts</p><div className="mt-3 space-y-2">{socialIdeas.map((idea)=><div key={idea} className="rounded-2xl bg-lime-50 p-4 text-sm text-slate-700">{idea}</div>)}</div></div></div></Card></section>
      <section className="rounded-[36px] bg-lime-300 p-8 text-center text-black"><h2 className="text-3xl font-black">Next step: connect this to Supabase</h2><p className="mx-auto mt-3 max-w-2xl text-slate-800">Once the demo flow feels right, we connect signup/login and save businesses, products, customers, messages and payments to your database.</p></section>
    </main>
  </div>;
}

function VulaTradeApp() {
  const [screen, setScreen] = useState("landing");
  return screen === "demo" ? <DemoDashboard onBack={() => setScreen("landing")} /> : <LandingPage onDemo={() => setScreen("demo")} />;
}

const root = createRoot(document.getElementById("root"));
root.render(<VulaTradeApp />);

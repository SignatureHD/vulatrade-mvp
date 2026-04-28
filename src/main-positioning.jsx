import React from "react";

function Button({ children, className = "", variant = "default", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition";
  const styles =
    variant === "outline"
      ? "border border-white/20 bg-transparent text-white hover:bg-white/10"
      : "bg-lime-300 text-slate-950 hover:bg-lime-200";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white/5 border border-white/10 p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

const products = [
  { id: 1, name: "Gel overlay", price: "R220", icon: "💅" },
  { id: 2, name: "Acrylic set", price: "R350", icon: "✨" },
  { id: 3, name: "Soak off", price: "R80", icon: "🧴" },
];

const features = [
  {
    icon: "store",
    title: "Ready-made business templates",
    text: "Choose a business type and start with a page, offers, messages and customer journey already prepared.",
  },
  {
    icon: "bot",
    title: "AI customer journeys",
    text: "Prepare enquiry replies, follow-ups, review requests, payment reminders and repeat-sale prompts.",
  },
  {
    icon: "megaphone",
    title: "Social growth tools",
    text: "Create practical content ideas for TikTok, Facebook, Instagram and local community groups.",
  },
  {
    icon: "card",
    title: "Payment support",
    text: "Track who has paid, who needs a reminder, and what still needs to be followed up.",
  },
];

const steps = [
  "Choose a business template",
  "Customise your offer and payment details",
  "Let VulaTrade guide the customer journey",
];

const logoRow = ["Beauty", "Fresh Produce", "Barber", "Delivery", "Tutoring", "Repairs", "Food", "Cleaning"];

function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    arrow: (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    ),
    bot: (
      <svg {...common}>
        <rect x="4" y="8" width="16" height="12" rx="3" />
        <path d="M12 4v4" />
        <path d="M9 13h.01" />
        <path d="M15 13h.01" />
        <path d="M9 17h6" />
      </svg>
    ),
    card: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </svg>
    ),
    check: (
      <svg {...common}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    megaphone: (
      <svg {...common}>
        <path d="M3 11v2l14 5V6L3 11Z" />
        <path d="M7 14v4a2 2 0 0 0 4 0v-2" />
        <path d="M21 8v8" />
      </svg>
    ),
    message: (
      <svg {...common}>
        <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.5-5A8 8 0 1 1 21 12Z" />
      </svg>
    ),
    repeat: (
      <svg {...common}>
        <path d="m17 2 4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="m7 22-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    spark: (
      <svg {...common}>
        <path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3Z" />
      </svg>
    ),
    star: (
      <svg {...common} fill="currentColor" stroke="currentColor">
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      </svg>
    ),
    store: (
      <svg {...common}>
        <path d="M4 10h16" />
        <path d="M5 10l1-6h12l1 6" />
        <path d="M6 10v10h12V10" />
        <path d="M9 20v-5h6v5" />
      </svg>
    ),
    wallet: (
      <svg {...common}>
        <path d="M3 7a2 2 0 0 1 2-2h14v14H5a2 2 0 0 1-2-2V7Z" />
        <path d="M16 12h4" />
        <path d="M7 9h5" />
      </svg>
    ),
  };

  return icons[name] || icons.spark;
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[310px] rounded-[42px] border-[10px] border-black bg-black p-3 shadow-2xl">
      <div className="overflow-hidden rounded-[30px] bg-white">
        <div className="bg-gradient-to-br from-lime-100 via-white to-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-lime-700">AI business page</p>
              <h3 className="text-2xl font-black text-slate-950">Nomsa Nails</h3>
            </div>
            <div className="rounded-full bg-black px-3 py-1 text-xs text-lime-200">Live</div>
          </div>
          <p className="mt-2 text-sm text-slate-600">Beauty & Nails · Mitchells Plain</p>
          <Button className="mt-4 w-full rounded-2xl bg-black text-white hover:bg-slate-800">
            Enquire or Order
          </Button>
        </div>

        <div className="space-y-3 p-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                {product.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-950">{product.name}</p>
                <p className="text-xs text-slate-500">Ready to promote</p>
              </div>
              <p className="text-sm font-black">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FloatingCard({ className, children }) {
  return (
    <div className={`absolute rounded-3xl bg-white/95 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-40 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-lime-200/40 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <nav className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-lg font-black text-lime-300">VT</div>
            <div>
              <p className="text-lg font-black">VulaTrade</p>
              <p className="text-xs text-slate-500">Start local. Sell smarter. Grow stronger.</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 text-sm text-slate-700 md:flex">
            <a href="#features">Features</a>
            <a href="#templates">Templates</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <Button className="rounded-full bg-black px-6 text-white hover:bg-slate-800">Get Started</Button>
        </nav>

        <div className="text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200">
            <Icon name="spark" className="h-4 w-4 text-lime-600" /> AI-powered business launch and growth system
          </div>
          <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Launch your business. Automate your customer journey. Grow while you work.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            VulaTrade helps aspiring and existing business owners set up, promote, automate and grow using ready-made templates, AI-powered journeys, social growth tools, payment support and simple customer tracking.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button className="rounded-full bg-black px-7 py-6 text-white hover:bg-slate-800">
              Choose Business Template <Icon name="arrow" className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="rounded-full border-black px-7 py-6">
              Build My Own System
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200" />
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200" />

          <PhoneMockup />

          <FloatingCard className="left-0 top-8 hidden w-48 md:block">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Icon name="megaphone" className="h-4 w-4 text-lime-600" /> Social Reach
            </div>
            <p className="text-3xl font-black">+40%</p>
            <p className="text-xs text-slate-500">More local enquiries</p>
          </FloatingCard>

          <FloatingCard className="right-4 top-0 hidden w-48 bg-lime-200 md:block">
            <p className="text-4xl font-black">8</p>
            <p className="text-sm font-semibold">Sales tracked this week</p>
            <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-sm font-bold">R1,240</p>
          </FloatingCard>

          <FloatingCard className="bottom-10 left-20 hidden w-44 bg-yellow-200 md:block">
            <div className="flex items-center gap-2">
              <Icon name="star" className="h-5 w-5 text-black" />
              <Icon name="star" className="h-5 w-5 text-black" />
              <Icon name="star" className="h-5 w-5 text-black" />
              <Icon name="star" className="h-5 w-5 text-black" />
              <Icon name="star" className="h-5 w-5 text-black" />
            </div>
            <p className="mt-2 text-sm font-semibold">Review request ready</p>
          </FloatingCard>

          <FloatingCard className="bottom-16 right-14 hidden w-52 md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Icon name="repeat" className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold">Follow-up due</p>
                <p className="text-xs text-slate-500">2 customers to message</p>
              </div>
            </div>
          </FloatingCard>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
          {logoRow.map((item) => (
            <span key={item} className="text-lg font-black tracking-tight text-slate-700">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-semibold text-lime-700">AI business system</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Everything a small business needs to start and grow</h2>
          <p className="mt-5 text-lg text-slate-600">Not another complicated platform. VulaTrade gives entrepreneurs simple tools that help them launch, sell, follow up and grow.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-slate-950">
                  <Icon name={feature.icon} className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Templates() {
  const templates = ["Nail salon", "Fresh produce reseller", "Barber", "Local delivery", "Cleaning service", "Tutor", "Food seller", "Phone repairs"];
  return (
    <section id="templates" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-semibold text-lime-700">Ready-made templates</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Pick a business type and launch faster</h2>
            <p className="mt-5 text-lg text-slate-600">Each template comes with starter products, messages, payment prompts, follow-ups and a simple customer journey.</p>
            <Button className="mt-7 rounded-full bg-black px-7 py-6 text-white hover:bg-slate-800">Browse Templates</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map((template, index) => (
              <div key={template} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-lime-50 hover:shadow-lg">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white font-black shadow-sm">{index + 1}</div>
                <p className="text-lg font-black">{template}</p>
                <p className="mt-2 text-sm text-slate-500">Page + offers + journey prompts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="font-semibold text-lime-700">How it works</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">From idea to working business system</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="rounded-3xl bg-white p-8 text-left shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-black text-xl font-black text-lime-300">{index + 1}</div>
              <h3 className="text-2xl font-black">{step}</h3>
              <p className="mt-4 text-slate-600">Start simple, then improve your page, content, follow-ups and customer tracking as your business grows.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="pricing" className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[40px] bg-black p-10 text-center text-white sm:p-16">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lime-300 text-black">
          <Icon name="wallet" className="h-8 w-8" />
        </div>
        <h2 className="text-4xl font-black sm:text-5xl">Start local. Sell smarter. Grow stronger.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">Build your first business system with ready-made templates, AI-powered customer journeys, social tools and payment support.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button className="rounded-full bg-lime-300 px-8 py-6 text-black hover:bg-lime-400">Get Started Free</Button>
          <Button variant="outline" className="rounded-full border-white px-8 py-6 text-white hover:bg-white hover:text-black">Book a Demo</Button>
        </div>
      </div>
    </section>
  );
}

export default function VulaTradeLandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f5] text-slate-950">
      <Hero />
      <Features />
      <Templates />
      <HowItWorks />
      <FinalCTA />
    </div>
  );
}
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<VulaTradeLandingPage />);
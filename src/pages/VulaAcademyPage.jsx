import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  MessageCircle,
  ReceiptText,
  Smartphone,
  Sparkles,
  Store,
  Users,
  WalletCards,
} from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import Logo from "../components/Logo";

const PINK = "#ea4c89";
const PINK_DARK = "#d93f7b";
const SOFT_PINK = "#fde8f1";
const DARK = "#202021";
const BORDER = "#eeeeea";

const paths = [
  {
    title: "Cook or bake",
    emoji: "🥟",
    start: "From rand 20",
    bestFor: "Magwinya, vetkoek, muffins, lunch packs, ice blocks or snacks.",
    firstMove: "Make a small batch, sell where people already walk, then record every sale.",
    message:
      "Hi, I am selling fresh magwinya this morning. Rand 3 each. I am near [place]. Reply with how many you want and I will keep them for you.",
  },
  {
    title: "Sell a service",
    emoji: "🧽",
    start: "From rand 0",
    bestFor: "Cleaning, laundry collection, car wash, garden help, nails, hair, delivery help or admin support.",
    firstMove: "Offer one simple service to 10 people you already know. No stock needed.",
    message:
      "Hi, I am taking bookings for [service] this week. My starter price is rand [price]. I can help you on [day/time]. Would you like a slot?",
  },
  {
    title: "Resell essentials",
    emoji: "📦",
    start: "From rand 20",
    bestFor: "Airtime, data, water, ice, cleaning products, phone chargers, school items or small household goods.",
    firstMove: "Start with fast-moving items people already ask for in your area.",
    message:
      "Hi, I am taking orders for [product]. Price is rand [price]. Pay before [time] and collect from [place] or I can deliver nearby.",
  },
  {
    title: "Demand first",
    emoji: "🔎",
    start: "From rand 0",
    bestFor: "Anyone with a phone, WhatsApp groups and access to people asking for things.",
    firstMove: "Ask what people need, take pre-orders, collect payment, then buy only what is already sold.",
    message:
      "I am checking what people in our area need most. What do you struggle to find nearby: school items, cleaning products, food, beauty, clothes or something else?",
  },
];

const starterIdeas = {
  "rand-0": {
    title: "Start with a service",
    copy: "Use your time, skill and network first. Offer one clear service to people nearby before buying stock.",
    examples: ["Cleaning", "Laundry collection", "Car wash", "Hair or nails", "Delivery help", "CV typing"],
  },
  "rand-20": {
    title: "Start with a small daily cash product",
    copy: "Choose something simple, fast-moving and easy to repeat. Keep the first batch small.",
    examples: ["Magwinya", "Ice blocks", "Popcorn", "Sweets", "Airtime", "Water"],
  },
  "rand-50": {
    title: "Test a better mix",
    copy: "You can combine a product and a service or test two small products to see what sells fastest.",
    examples: ["Magwinya + eggs", "Airtime + data", "Cleaning packs", "Lunch orders", "Phone accessories"],
  },
  "rand-100": {
    title: "Build a weekly offer",
    copy: "Create a small repeatable offer with a clear collection point, WhatsApp message and simple record keeping.",
    examples: ["Weekend food orders", "School packs", "Beauty bookings", "Household essentials", "Bulk cleaning products"],
  },
};

const courseModules = [
  { title: "Find one local customer", copy: "Start where trust already exists: your street, church, school, rank, family group or WhatsApp contacts." },
  { title: "Price before you sell", copy: "Know your cost, selling price and profit before you post the message." },
  { title: "Send one clear WhatsApp", copy: "Make the offer simple: what it is, price, where, when and how to pay." },
  { title: "Record the sale", copy: "Capture the sale, customer and cost in VulaTrade. Do not rely on memory." },
  { title: "Build your Business File", copy: "Every sale, review and payment record becomes proof that your business is active." },
];

function SectionHeading({ eyebrow, title, text, center = false }) {
  return (
    <div className={`reveal ${center ? "mx-auto max-w-[900px] text-center" : "max-w-[820px]"}`}>
      <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-5xl lg:text-6xl">{title}</h2>
      {text && <p className="mt-5 text-lg leading-8 text-[#454545]">{text}</p>}
    </div>
  );
}

function PathCard({ path }) {
  return (
    <article className="reveal rounded-[30px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <span className="text-5xl">{path.emoji}</span>
        <span className="rounded-full bg-[#fde8f1] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#d93f7b]">{path.start}</span>
      </div>
      <h3 className="mt-6 text-3xl font-black leading-tight tracking-tight text-[#202021]">{path.title}</h3>
      <p className="mt-4 text-base leading-7 text-[#454545]">{path.bestFor}</p>
      <div className="mt-6 rounded-2xl bg-[#fbfbfb] p-5">
        <p className="text-sm font-black text-[#202021]">First move</p>
        <p className="mt-2 text-sm leading-6 text-[#454545]">{path.firstMove}</p>
      </div>
      <div className="mt-5 rounded-2xl border border-[#f8b8d2] bg-[#fff5f9] p-5">
        <p className="flex items-center gap-2 text-sm font-black text-[#202021]"><MessageCircle className="h-4 w-4 text-[#ea4c89]" /> WhatsApp starter message</p>
        <p className="mt-3 text-sm leading-6 text-[#7a2b50]">{path.message}</p>
      </div>
    </article>
  );
}

function Planner() {
  const [capital, setCapital] = useState("rand-20");
  const [skill, setSkill] = useState("sell");
  const [place, setPlace] = useState("whatsapp");
  const idea = useMemo(() => starterIdeas[capital], [capital]);

  const action =
    skill === "cook"
      ? "Make one small batch, take a photo, post the price, then record the batch cost and sales."
      : skill === "service"
        ? "Offer one service with one price and one booking slot. Record the customer and the payment."
        : skill === "fix"
          ? "Offer a simple fix-it service with a clear starting price and collect before-and-after proof."
          : "Choose one product people already ask for, post one offer, and track every order.";

  const channel =
    place === "rank"
      ? "Sell near the taxi rank or transport point where people already move."
      : place === "school"
        ? "Use school-gate timing and parent groups, but keep the offer simple and respectful."
        : place === "church"
          ? "Use church, community and family networks where trust is already strong."
          : "Use WhatsApp Status and community groups first. Ask people to reply or pre-order.";

  return (
    <section id="planner" className="bg-[#202021] px-5 py-16 text-white lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">2-minute starter planner</p>
          <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">Choose your first move.</h2>
          <p className="mt-5 text-lg leading-8 text-white/65">This is the VulaTrade way: start local, sell smarter and grow stronger. Do not wait for a perfect business idea. Start with one offer you can test today.</p>
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <Logo tagline size="compact" />
          </div>
        </div>

        <div className="reveal rounded-[34px] bg-white p-6 text-[#202021] shadow-[0_30px_90px_rgba(0,0,0,0.26)] sm:p-8">
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-black">
              Money available
              <select value={capital} onChange={(event) => setCapital(event.target.value)} className="rounded-2xl border border-[#eeeeea] px-4 py-4 font-semibold">
                <option value="rand-0">rand 0</option>
                <option value="rand-20">rand 20</option>
                <option value="rand-50">rand 50</option>
                <option value="rand-100">rand 100</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black">
              What you can do
              <select value={skill} onChange={(event) => setSkill(event.target.value)} className="rounded-2xl border border-[#eeeeea] px-4 py-4 font-semibold">
                <option value="sell">I can sell</option>
                <option value="cook">I can cook</option>
                <option value="service">I can offer a service</option>
                <option value="fix">I can fix things</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Where you can sell
              <select value={place} onChange={(event) => setPlace(event.target.value)} className="rounded-2xl border border-[#eeeeea] px-4 py-4 font-semibold">
                <option value="whatsapp">WhatsApp</option>
                <option value="rank">Taxi rank</option>
                <option value="school">School gate</option>
                <option value="church">Church/community</option>
              </select>
            </label>
          </div>

          <div className="mt-7 rounded-[28px] bg-[#fff5f9] p-6 sm:p-8">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#ea4c89]">Your starter plan</span>
            <h3 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{idea.title}</h3>
            <p className="mt-4 text-base leading-7 text-[#454545]">{idea.copy}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {idea.examples.map((example) => (
                <span key={example} className="rounded-full border border-[#f8b8d2] bg-white px-4 py-2 text-sm font-bold text-[#202021]">{example}</span>
              ))}
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-5">
                <p className="text-sm font-black text-[#ea4c89]">Action today</p>
                <p className="mt-2 text-sm leading-6 text-[#454545]">{action}</p>
              </div>
              <div className="rounded-2xl bg-white p-5">
                <p className="text-sm font-black text-[#ea4c89]">Where to sell</p>
                <p className="mt-2 text-sm leading-6 text-[#454545]">{channel}</p>
              </div>
            </div>
          </div>

          <a href="/signup" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ea4c89] px-8 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
            Create my free VulaTrade account <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function VulaAcademyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#202021]">
      <Header />

      <main>
        <section className="relative overflow-hidden bg-[#202021] px-5 py-20 text-white lg:px-20 lg:py-28">
          <div className="absolute right-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[#ea4c89]/30 blur-3xl" />
          <div className="mx-auto grid max-w-[1480px] items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div className="reveal relative z-10">
              <p className="inline-flex rounded-full border border-[#ea4c89]/40 bg-[#ea4c89]/10 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#f8b8d2]">Vula Academy</p>
              <h1 className="mt-7 max-w-[980px] text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                Start with <span className="text-[#ea4c89]">rand 20.</span>
              </h1>
              <p className="mt-7 max-w-[760px] text-xl leading-9 text-white/70">A practical starter course for South African entrepreneurs who want to make the first sale, track the money properly and build proof of trading from day one.</p>
              <div className="mt-7 flex flex-wrap gap-3 text-lg font-black">
                <span className="text-[#ea4c89]">Start local.</span>
                <span className="text-white/35">•</span>
                <span className="text-[#ea4c89]">Sell smarter.</span>
                <span className="text-white/35">•</span>
                <span className="text-[#ea4c89]">Grow stronger.</span>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#planner" className="inline-flex items-center gap-2 rounded-2xl bg-[#ea4c89] px-8 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">Build my 2-minute plan <ArrowRight className="h-5 w-5" /></a>
                <a href="#paths" className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-5 text-lg font-extrabold text-[#202021] transition hover:bg-[#fde8f1]">See starter paths</a>
              </div>
              <p className="mt-5 text-sm font-semibold text-white/45">No hype. No income promises. One local sale, recorded properly, repeated over time.</p>
            </div>

            <div className="reveal relative z-10 rounded-[40px] bg-white p-6 text-[#202021] shadow-[0_35px_90px_rgba(0,0,0,0.3)]">
              <div className="rounded-[30px] bg-[#fbfbfb] p-6">
                <div className="flex items-center justify-between gap-4">
                  <Logo size="compact" tagline />
                  <span className="rounded-full bg-[#fde8f1] px-4 py-2 text-xs font-black text-[#ea4c89]">FREE LESSON</span>
                </div>
                <div className="mt-8 grid gap-3">
                  {[
                    ["First sale", "Record what sold and who bought it"],
                    ["Cost price", "Know what each sale really cost"],
                    ["Profit", "Separate sales money from profit"],
                    ["Business File", "Build proof as you trade"],
                  ].map(([label, copy]) => (
                    <div key={label} className="flex items-center justify-between gap-4 rounded-2xl border border-[#eeeeea] bg-white p-4">
                      <div>
                        <p className="font-black">{label}</p>
                        <p className="text-sm text-[#767b81]">{copy}</p>
                      </div>
                      <span className="text-2xl font-black text-[#ea4c89]">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-10 lg:px-20">
          <div className="reveal mx-auto flex max-w-[1480px] flex-wrap items-center justify-center gap-4 rounded-[34px] border border-[#eeeeea] bg-white p-6 text-center shadow-sm">
            <span className="text-3xl font-black tracking-tight text-[#202021]">Start local.</span>
            <span className="hidden text-3xl font-black text-[#ea4c89] sm:inline">/</span>
            <span className="text-3xl font-black tracking-tight text-[#202021]">Sell smarter.</span>
            <span className="hidden text-3xl font-black text-[#ea4c89] sm:inline">/</span>
            <span className="text-3xl font-black tracking-tight text-[#202021]">Grow stronger.</span>
          </div>
        </section>

        <section className="bg-[#fbfbfb] px-5 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto max-w-[1480px]">
            <SectionHeading
              center
              eyebrow="How the course works"
              title="Do not start with a long course. Start with one action."
              text="The goal is not to study for days. The goal is to choose one small offer, sell locally, record the sale and use VulaTrade to build your Business File."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {courseModules.map((module, index) => (
                <article key={module.title} className="reveal rounded-[26px] border border-[#eeeeea] bg-white p-6 shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fde8f1] text-lg font-black text-[#ea4c89]">{index + 1}</span>
                  <h3 className="mt-6 text-2xl font-black leading-tight tracking-tight text-[#202021]">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#454545]">{module.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="paths" className="bg-white px-5 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto max-w-[1480px]">
            <SectionHeading
              eyebrow="Starter paths"
              title="Four ways to begin with what you already have."
              text="Product businesses are not the only option. Many VulaTrade users can start with a service, a skill, a network or a pre-order before they buy stock."
            />
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {paths.map((path) => (
                <PathCard key={path.title} path={path} />
              ))}
            </div>
          </div>
        </section>

        <Planner />

        <section id="business-file" className="bg-white px-5 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto grid max-w-[1480px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading
                eyebrow="Grow stronger"
                title="The sale matters. The record matters more."
                text="When you record your sales, costs, customers, payments and reviews, you are building a VulaTrade Business File. It is practical proof that your business is active and growing."
              />
              <div className="mt-8 rounded-[28px] border border-[#f8b8d2] bg-[#fff5f9] p-6">
                <p className="text-lg font-black text-[#202021]">This is not a credit score.</p>
                <p className="mt-3 text-base leading-7 text-[#454545]">It is a simple proof-of-trading record that can help you with supplier conversations, stock deals, responsible growth funding and better business decisions when you are ready.</p>
              </div>
            </div>
            <div className="reveal grid gap-4 sm:grid-cols-2">
              {[
                [ReceiptText, "Sales history", "What you sold and when"],
                [Users, "Customer activity", "Who buys and returns"],
                [WalletCards, "Payments", "Cash, EFT, card and links"],
                [ClipboardList, "Expenses", "Stock, transport, data and costs"],
                [BarChart3, "Profit patterns", "What is worth repeating"],
                [FileText, "Business File", "Proof you can build over time"],
              ].map(([Icon, title, copy]) => (
                <article key={title} className="rounded-[26px] border border-[#eeeeea] bg-white p-6 shadow-[0_18px_50px_rgba(32,32,33,0.06)]">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]"><Icon className="h-6 w-6" /></span>
                  <h3 className="mt-5 text-xl font-black text-[#202021]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#454545]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#fde8f1] px-5 py-16 lg:px-20 lg:py-24">
          <div className="reveal mx-auto max-w-[980px] text-center">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">Next step</p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-6xl">Create your business page and record your first sale.</h2>
            <p className="mx-auto mt-5 max-w-[680px] text-lg leading-8 text-[#454545]">Start local. Sell smarter. Grow stronger. VulaTrade gives you the place to show your offer, record your sales and build your Business File from day one.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <a href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-[#ea4c89] px-9 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">Register free <ArrowRight className="h-5 w-5" /></a>
              <a href="/" className="inline-flex items-center gap-2 rounded-2xl bg-white px-9 py-5 text-lg font-extrabold text-[#202021] transition hover:bg-[#fff5f9]">Back to VulaTrade</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import React from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageCircle,
  PiggyBank,
  Search,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import Logo from "../components/Logo";

export const academyRoutes = {
  "/learn": "academy",
  "/learn/academy": "academy",
  "/learn/start-with-r20": "r20Course",
};

const academyCourses = [
  {
    title: "Start with rand 20",
    description:
      "A practical starter course for entrepreneurs who want to make their first sale using what they already have, where they already are.",
    href: "/learn/start-with-r20",
    badge: "First course",
  },
  {
    title: "Set up your VulaTrade business page",
    description: "Learn how to create a page you can share on WhatsApp, Facebook, TikTok and Instagram.",
    href: "/business-page",
    badge: "2-minute setup",
  },
  {
    title: "Record your first sale",
    description: "Turn a once-off sale into a business record that strengthens your Business File.",
    href: "/record-sales",
    badge: "Business File",
  },
];

const starterPaths = [
  {
    title: "Food and daily essentials",
    icon: Store,
    examples: ["Magwinya", "Kota orders", "Lunch plates", "Cold drinks", "Basic grocery bundles"],
    note: "Start where people already walk: taxi ranks, school gates, churches, streets and busy corners.",
  },
  {
    title: "Services from what you can do",
    icon: Users,
    examples: ["Cleaning", "Laundry collection", "Hair or nails", "Car wash", "CV typing", "Delivery help"],
    note: "Services can start with little or no stock. Your first asset is your skill, time and reliability.",
  },
  {
    title: "Buy-and-sell opportunities",
    icon: PiggyBank,
    examples: ["Airtime", "Phone accessories", "Pre-order clothing", "School items", "Cleaning products"],
    note: "Use demand first. Ask what people need, collect orders, then buy only what is already sold.",
  },
];

const twoMinuteSteps = [
  ["Choose your starting point", "What do you have: rand 20, a phone, a skill, a busy street, a freezer, transport, or time?"],
  ["Pick one simple offer", "Do not start with ten ideas. Pick one product or service people nearby already understand."],
  ["Send one WhatsApp message", "Tell people what you offer, the price, where you are and how they can order."],
  ["Record the result", "Add the sale, customer, expense and note in VulaTrade so your Business File starts growing."],
];

const businessFileItems = ["Sales history", "Customer activity", "Payment notes", "Expenses", "Reviews", "Repeat orders"];

function SectionHeading({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-[900px] text-center" : "max-w-[820px]"}>
      {eyebrow && <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">{eyebrow}</p>}
      <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-5xl lg:text-6xl">{title}</h2>
      {text && <p className="mt-5 text-lg leading-8 text-[#454545]">{text}</p>}
    </div>
  );
}

function BrandBand() {
  return (
    <section className="bg-[#202021] px-5 py-10 text-white lg:px-20">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Logo size="compact" tagline className="text-white" />
        <p className="max-w-[680px] text-lg font-semibold leading-8 text-white/70">
          Start local with the people around you. Sell smarter by knowing your numbers. Grow stronger by building proof of trading.
        </p>
      </div>
    </section>
  );
}

function AcademyLanding() {
  return (
    <div className="min-h-screen bg-white text-[#202021]">
      <Header />
      <main>
        <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div className="reveal">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">Vula Academy</p>
              <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-tight text-[#202021] sm:text-6xl lg:text-7xl">
                Learn to start local, sell smarter and grow stronger.
              </h1>
              <p className="mt-7 max-w-[740px] text-xl leading-9 text-[#454545]">
                Vula Academy is the practical learning space inside VulaTrade. Short lessons. Simple actions. Built for South African entrepreneurs who need a quick win, not a long course.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="/learn/start-with-r20" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ea4c89] px-8 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
                  Start with rand 20
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a href="/signup" className="inline-flex items-center justify-center rounded-2xl border-2 border-[#ea4c89] px-8 py-5 text-lg font-extrabold text-[#ea4c89] transition hover:bg-[#fde8f1]">
                  Create free account
                </a>
              </div>
            </div>
            <div className="reveal rounded-[36px] bg-[#f8f8f8] p-6 shadow-[0_20px_70px_rgba(32,32,33,0.08)] sm:p-10">
              <div className="rounded-[28px] bg-white p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]"><BookOpen className="h-7 w-7" /></span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-[#8a8f98]">First lesson</p>
                    <h2 className="text-2xl font-black text-[#202021]">Start with rand 20</h2>
                  </div>
                </div>
                <div className="mt-8 grid gap-4">
                  {["Choose one local offer", "Send one WhatsApp message", "Make one sale", "Record it in VulaTrade"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#eeeeea] p-4">
                      <CheckCircle2 className="h-5 w-5 text-[#ea4c89]" />
                      <span className="font-extrabold text-[#202021]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <BrandBand />

        <section className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto max-w-[1480px]">
            <SectionHeading align="center" eyebrow="Courses" title="Start with one short lesson. Then take the next step." />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {academyCourses.map((course) => (
                <a key={course.title} href={course.href} className="reveal rounded-[30px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(32,32,33,0.12)]">
                  <span className="inline-flex rounded-full bg-[#fde8f1] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#ea4c89]">{course.badge}</span>
                  <h3 className="mt-7 text-3xl font-black leading-tight tracking-tight text-[#202021]">{course.title}</h3>
                  <p className="mt-4 text-base leading-7 text-[#454545]">{course.description}</p>
                  <span className="mt-8 inline-flex items-center gap-2 font-extrabold text-[#ea4c89]">Open lesson <ArrowRight className="h-4 w-4" /></span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function R20Course() {
  return (
    <div className="min-h-screen bg-white text-[#202021]">
      <Header />
      <main>
        <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="reveal">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">Vula Academy starter course</p>
              <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-tight text-[#202021] sm:text-6xl lg:text-7xl">
                Start with rand 20.
              </h1>
              <p className="mt-5 text-3xl font-black tracking-tight text-[#ea4c89]">Start local. Sell smarter. Grow stronger.</p>
              <p className="mt-7 max-w-[760px] text-xl leading-9 text-[#454545]">
                This lesson helps you turn a small starting point into a first sale. It is not about making big promises. It is about taking one local action, learning from the result and recording the proof in VulaTrade.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#starter-planner" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ea4c89] px-8 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
                  Start the 2-minute planner
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a href="/signup" className="inline-flex items-center justify-center rounded-2xl border-2 border-[#ea4c89] px-8 py-5 text-lg font-extrabold text-[#ea4c89] transition hover:bg-[#fde8f1]">
                  Create free VulaTrade account
                </a>
              </div>
            </div>
            <div className="reveal rounded-[36px] bg-[#202021] p-6 text-white sm:p-10">
              <Logo size="default" tagline />
              <div className="mt-10 grid gap-4">
                {[
                  ["Start local", "Sell to people near you first: neighbours, school parents, church groups, taxi ranks and WhatsApp contacts."],
                  ["Sell smarter", "Know your cost, selling price, profit and who bought from you."],
                  ["Grow stronger", "Record your activity so your Business File becomes stronger over time."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-xl font-black text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <BrandBand />

        <section id="starter-planner" className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto max-w-[1480px]">
            <SectionHeading
              align="center"
              eyebrow="2-minute starter planner"
              title="Do not wait for the perfect business idea. Pick one small move."
              text="The aim is not to build everything today. The aim is to make one offer, test demand and record what happens."
            />
            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {twoMinuteSteps.map(([title, text], index) => (
                <article key={title} className="reveal rounded-[30px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.07)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fde8f1] text-lg font-black text-[#ea4c89]">{index + 1}</span>
                  <h3 className="mt-7 text-2xl font-black tracking-tight text-[#202021]">{title}</h3>
                  <p className="mt-4 text-base leading-7 text-[#454545]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto max-w-[1480px]">
            <SectionHeading
              align="center"
              eyebrow="Starter paths"
              title="Choose a path that fits what you already have."
              text="Some people start with stock. Some start with skill. Some start by finding demand before buying anything. All three can work when the offer is simple and local."
            />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {starterPaths.map((path) => {
                const Icon = path.icon;
                return (
                  <article key={path.title} className="reveal rounded-[30px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.07)]">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]"><Icon className="h-7 w-7" /></span>
                    <h3 className="mt-7 text-2xl font-black tracking-tight text-[#202021]">{path.title}</h3>
                    <p className="mt-4 text-base leading-7 text-[#454545]">{path.note}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {path.examples.map((example) => (
                        <span key={example} className="rounded-full border border-[#eeeeea] bg-[#f8f8f8] px-4 py-2 text-sm font-bold text-[#454545]">{example}</span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#202021] px-5 py-16 text-white lg:px-20 lg:py-24">
          <div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">WhatsApp selling</p>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">Send one clear message.</h2>
              <p className="mt-5 text-lg leading-8 text-white/65">Your first message does not need to be fancy. It needs to be clear: what you offer, the price, where you are and how to order.</p>
            </div>
            <div className="rounded-[30px] bg-white p-6 text-[#202021] sm:p-8">
              <div className="flex items-center gap-3 text-[#ea4c89]"><MessageCircle className="h-6 w-6" /><span className="font-black">Starter message</span></div>
              <p className="mt-6 rounded-3xl bg-[#f8f8f8] p-6 text-lg leading-8 text-[#454545]">
                Hi, I am taking orders for [product/service] today. It is rand [price]. I am based in [area]. Message me before [time] if you want one. Collection/delivery is [details].
              </p>
              <p className="mt-5 text-sm font-semibold leading-6 text-[#767b81]">After sending it, record every enquiry and sale in VulaTrade. That is how your Business File starts growing.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto grid max-w-[1480px] items-center gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionHeading
                eyebrow="Business File"
                title="Your first sale is not just money. It is proof."
                text="When you record what happened, your VulaTrade Business File starts to show real trading activity. This is not a credit score and it does not guarantee funding. It is practical proof that your business is active."
              />
              <a href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#ea4c89] px-8 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
                Start building my Business File
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
            <div className="rounded-[36px] bg-white p-6 shadow-[0_18px_50px_rgba(32,32,33,0.07)] sm:p-10">
              <div className="grid gap-4 sm:grid-cols-2">
                {businessFileItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#eeeeea] bg-[#f8f8f8] p-4">
                    <BadgeCheck className="h-5 w-5 text-[#ea4c89]" />
                    <span className="font-extrabold text-[#202021]">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-3xl bg-[#202021] p-6 text-white">
                <div className="flex items-center gap-3"><FileText className="h-6 w-6 text-[#ea4c89]" /><span className="font-black">Start local. Sell smarter. Grow stronger.</span></div>
                <p className="mt-3 text-sm leading-6 text-white/65">One sale becomes one record. Many records become a stronger business story.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
          <div className="reveal mx-auto max-w-[980px] rounded-[36px] bg-[#fde8f1] p-8 text-center sm:p-12">
            <Sparkles className="mx-auto h-10 w-10 text-[#ea4c89]" />
            <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-5xl">Make one offer today.</h2>
            <p className="mx-auto mt-5 max-w-[720px] text-lg leading-8 text-[#454545]">Do not wait until everything is perfect. Choose one local offer, test it, then record the result in VulaTrade.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="/signup" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ea4c89] px-8 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
                Create my free account
                <ArrowRight className="h-5 w-5" />
              </a>
              <a href="/learn/academy" className="inline-flex items-center justify-center rounded-2xl border-2 border-[#ea4c89] px-8 py-5 text-lg font-extrabold text-[#ea4c89] transition hover:bg-white/70">
                Back to Vula Academy
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function AcademyPage({ pageKey = "academy" }) {
  if (pageKey === "r20Course") return <R20Course />;
  return <AcademyLanding />;
}

import React from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  CalendarCheck,
  Check,
  ClipboardList,
  CreditCard,
  FileCheck,
  FileText,
  Link,
  MessageCircle,
  PiggyBank,
  ReceiptText,
  Smartphone,
  Sparkles,
  Star,
  Users,
  WalletCards,
} from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import Logo from "../components/Logo";

export const solutionRoutes = {
  "/business-page": "businessPage",
  "/record-sales": "recordSales",
  "/manage-customers": "manageCustomers",
  "/track-expenses": "trackExpenses",
  "/business-file": "businessFile",
  "/prepare-for-growth": "prepareGrowth",
};

const toolLinks = [
  { label: "Create Business Page", href: "/business-page" },
  { label: "Record Sales", href: "/record-sales" },
  { label: "Manage Customers", href: "/manage-customers" },
  { label: "Track Expenses", href: "/track-expenses" },
  { label: "Build Business File", href: "/business-file" },
  { label: "Prepare for Growth", href: "/prepare-for-growth" },
];

const pages = {
  businessPage: {
    eyebrow: "Business page",
    headline: "Your business page. Ready in minutes.",
    subheadline: "A VulaTrade Business Page is not a complicated website. It is a simple mobile-friendly page you can share on WhatsApp, Facebook, Instagram, TikTok or SMS.",
    primaryCta: "Create My Free Page",
    secondaryCta: "See Example Page",
    secondaryHref: "/b/wendys",
    whatTitle: "What is a VulaTrade Business Page?",
    whatText: "It is your simple link-in-bio business page. Customers can see your services, prices, photos, reviews and WhatsApp button in one place.",
    whyTitle: "Look professional without paying for a website.",
    whyText: "Instead of answering the same questions all day, share one clean link so customers can check the basics before they message you.",
    benefits: ["Show services and prices", "Add photos", "Add reviews", "Add WhatsApp enquiry button", "Share one clean link", "Look professional without paying for a website"],
    steps: [
      ["Add your business name", "Tell customers who you are and what you do."],
      ["Add your services or products", "List your prices, photos and short descriptions."],
      ["Add your WhatsApp number", "Let customers enquire or book with one tap."],
      ["Share your link", "Use your page on WhatsApp Status, Facebook, TikTok, Instagram or SMS."],
    ],
    example: {
      name: "Nomsa's Nails",
      text: "Nomsa shares one page with nail services, prices, photos, reviews and a WhatsApp enquiry button.",
      stats: ["Gel overlay: R220", "Acrylic set: R350", "Soak off: R80"],
    },
    fileText: "When customers enquire, review and buy from your page, those activities help build a simple proof-of-trading history over time.",
    faqs: [
      ["Is this a website?", "It works like a simple website page, but it is easier. You do not need hosting, design skills or a developer."],
      ["How long does it take?", "Less than 2 minutes if you have your business name, WhatsApp number and services ready."],
      ["Is it free?", "Yes. You can start with the free Kasipreneur plan."],
      ["Does it replace WhatsApp?", "No. It makes WhatsApp better by showing customers your services before they message you."],
    ],
    mockupIcon: Smartphone,
  },
  recordSales: {
    eyebrow: "Sales records",
    headline: "Know what you made today.",
    subheadline: "Record daily sales from cash, EFT, PayShap, Yoco, iKhokha or payment links so you stop guessing where your money went.",
    primaryCta: "Start Tracking Sales",
    secondaryCta: "See How It Works",
    secondaryHref: "#how-it-works",
    whatTitle: "What is sales recording?",
    whatText: "It is a simple way to log each sale so you know what came in, how the customer paid and what sold best.",
    whyTitle: "Stop running your business from memory.",
    whyText: "When your sales are clear, you can see busy days, popular services and unpaid money without hunting through chats or notebooks.",
    benefits: ["Track daily income", "See best-selling products or services", "Know who has paid", "Reduce notebook chaos", "Build sales history", "Understand business performance"],
    steps: [
      ["Add the sale amount", "Record what the customer paid."],
      ["Choose the payment method", "Log cash, EFT, PayShap, Yoco, iKhokha or payment links."],
      ["Link it to a customer", "Keep better customer and payment history."],
      ["Review your day", "See what you made and what still needs attention."],
    ],
    example: {
      name: "Kasi Kitchen",
      text: "Kasi Kitchen records lunch orders, cash payments and EFTs at the end of each day.",
      stats: ["Sales today: R1,240", "Best seller: Kota combo", "Unpaid: R120"],
    },
    fileText: "Every sale recorded strengthens your proof of trading and helps show that your business is active.",
    faqs: [
      ["Can I record cash sales?", "Yes. Cash, EFT, PayShap and card machine sales can all be recorded."],
      ["Do I need accounting knowledge?", "No. You only add simple sale details."],
      ["Can I see daily totals?", "Yes. Your dashboard helps you see what you made."],
      ["Does this build my Business File?", "Yes. Sales history is one of the strongest parts of your Business File."],
    ],
    mockupIcon: ReceiptText,
  },
  manageCustomers: {
    eyebrow: "Customer list",
    headline: "Turn once-off buyers into regular customers.",
    subheadline: "Keep customer details, notes, bookings and follow-ups in one place so you can stay organised and bring customers back.",
    primaryCta: "Start Managing Customers",
    secondaryCta: "See How It Works",
    secondaryHref: "#how-it-works",
    whatTitle: "What is customer management?",
    whatText: "It is a simple customer list for names, numbers, notes, bookings and follow-ups.",
    whyTitle: "Regular customers are easier to serve when you remember them.",
    whyText: "Good notes help you remember what people bought, when to follow up and who keeps coming back.",
    benefits: ["Save customer names and numbers", "Track repeat buyers", "Add notes", "Remember bookings", "Send follow-ups", "Build customer history"],
    steps: [
      ["Add customer details", "Save names, numbers and useful notes."],
      ["Link sales or bookings", "See what each customer buys or books."],
      ["Set follow-ups", "Know who to message again."],
      ["Build customer history", "Understand who supports your business."],
    ],
    example: {
      name: "Nomsa's Nails",
      text: "Nomsa tracks repeat customers, favourite colours and follow-up dates for soak-offs.",
      stats: ["Customers: 24", "Repeat buyers: 9", "Follow-ups: 3"],
    },
    fileText: "Customer activity shows that your business has real demand and repeat support.",
    faqs: [
      ["Can I save phone numbers?", "Yes. Save customer numbers and useful notes."],
      ["Can I track repeat customers?", "Yes. You can see customer history over time."],
      ["Can I add notes?", "Yes. Add reminders, preferences and follow-up notes."],
      ["Does it send messages for me?", "For now, it helps you keep track so you know who to contact."],
    ],
    mockupIcon: Users,
  },
  trackExpenses: {
    eyebrow: "Expense tracking",
    headline: "Know what your business really costs.",
    subheadline: "Track stock, transport, airtime, data, rent, supplies and other costs so you can understand your real profit.",
    primaryCta: "Start Tracking Expenses",
    secondaryCta: "See How It Works",
    secondaryHref: "#how-it-works",
    whatTitle: "What is expense tracking?",
    whatText: "It is a simple place to record money going out of your business, from stock to transport and airtime.",
    whyTitle: "Profit is not the same as money collected.",
    whyText: "When you know your costs, you can price better, spend smarter and avoid guessing.",
    benefits: ["Capture expenses", "Understand profit", "Avoid spending blindly", "Track stock and supplies", "Prepare better prices", "Build better records"],
    steps: [
      ["Add the cost", "Record what you spent."],
      ["Choose a category", "Track stock, transport, airtime, data, rent or supplies."],
      ["Add a note", "Keep the reason clear for later."],
      ["Review your profit", "Compare sales and costs more easily."],
    ],
    example: {
      name: "Thabo's Car Wash",
      text: "Thabo tracks soap, water, airtime, transport and daily sales to understand real profit.",
      stats: ["Sales: R850", "Expenses: R210", "Estimated profit: R640"],
    },
    fileText: "Expense records help show how your business operates and where the money goes.",
    faqs: [
      ["What expenses can I add?", "Stock, transport, airtime, data, rent, supplies and other business costs."],
      ["Can I track profit?", "You can compare what came in with what went out."],
      ["Do I need receipts?", "Receipts help, but you can start by recording the expense details."],
      ["Does this help my Business File?", "Yes. Expense records make your business story clearer."],
    ],
    mockupIcon: WalletCards,
  },
  businessFile: {
    eyebrow: "Business File",
    headline: "Your business is already real. Now you can prove it.",
    subheadline: "Your VulaTrade Business File grows as you record sales, customers, payments, reviews and expenses. It helps you build a simple proof-of-trading history over time.",
    primaryCta: "Start Building My Business File",
    secondaryCta: "See How It Works",
    secondaryHref: "#how-it-works",
    whatTitle: "What is a Business File?",
    whatText: "It is a simple record of your business activity, built from the things you already do every day.",
    whyTitle: "Your hustle should not disappear into chats and notebooks.",
    whyText: "Better records may help you in future conversations with suppliers, funders, partners or landlords.",
    benefits: ["Sales history", "Customer activity", "Payment records", "Reviews", "Expense records", "Supplier notes", "Growth readiness"],
    steps: [
      ["Create your page", "Show what your business offers."],
      ["Record activity", "Add sales, customers, payments and expenses."],
      ["Collect reviews", "Build trust with customer feedback."],
      ["Watch your file grow", "Your proof-of-trading history becomes clearer over time."],
    ],
    example: {
      name: "Lindiwe's Cleaning Services",
      text: "Lindiwe records jobs, customers, payments and reviews so her business activity is easier to show.",
      stats: ["Sales history", "Customer activity", "Reviews collected"],
    },
    fileText: "This is the main place where your VulaTrade activity comes together. It is not a credit score and it does not guarantee funding.",
    faqs: [
      ["Is this a credit score?", "No. It is a practical record of business activity."],
      ["Does it guarantee funding?", "No. It may help you have better records for future conversations."],
      ["What goes into it?", "Sales, customers, payments, reviews, expenses and business activity over time."],
      ["Can I start for free?", "Yes. Start with the free Kasipreneur plan."],
    ],
    mockupIcon: FileCheck,
  },
  prepareGrowth: {
    eyebrow: "Growth readiness",
    headline: "Get ready for the next level.",
    subheadline: "As your records grow, VulaTrade helps you prepare for better supplier conversations, funding applications, partnerships and formal business growth.",
    primaryCta: "Prepare My Business for Growth",
    secondaryCta: "See How It Works",
    secondaryHref: "#how-it-works",
    whatTitle: "What does prepare for growth mean?",
    whatText: "It means getting your page, records, customers, reviews and Business File into better shape before bigger opportunities arrive.",
    whyTitle: "Growth is easier when your records are ready.",
    whyText: "When someone asks what your business does, what you sell or how active you are, you should not have to start from scratch.",
    benefits: ["Organised records", "Supplier readiness", "Funding readiness", "Business profile", "Reviews and customer history", "Growth checklist", "Future VulaBuy supplier opportunities"],
    steps: [
      ["Build your profile", "Keep your business details clear and updated."],
      ["Track your records", "Record sales, customers, expenses and payments."],
      ["Review your gaps", "See what information still needs work."],
      ["Prepare for future tools", "VulaBuy supplier opportunities are coming soon."],
    ],
    example: {
      name: "Sizwe Repairs",
      text: "Sizwe uses VulaTrade to organise repair jobs, customers, reviews and sales before approaching new partners.",
      stats: ["Growth checklist", "Supplier notes", "VulaBuy coming soon"],
    },
    fileText: "Your growth readiness is built from the records you add over time. It does not promise approval, but it helps you prepare better.",
    faqs: [
      ["What is VulaBuy?", "VulaBuy is coming soon. It will focus on supplier opportunities, but no functionality is being built here yet."],
      ["Does this guarantee funding?", "No. It helps you prepare better records for future conversations."],
      ["What should I track first?", "Start with sales, customers, expenses and reviews."],
      ["Can small businesses use it?", "Yes. Start where you are and build as you trade."],
    ],
    mockupIcon: BarChart3,
  },
};

function SectionHeading({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-[920px] text-center" : "max-w-[820px]"}>
      {eyebrow && <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">{eyebrow}</p>}
      <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-5xl lg:text-6xl">{title}</h2>
      {text && <p className="mt-5 text-lg leading-8 text-[#454545]">{text}</p>}
    </div>
  );
}

function HeroMockup({ page }) {
  const Icon = page.mockupIcon;

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <div className="absolute -right-1 bottom-10 z-20 hidden rounded-2xl bg-white px-5 py-4 shadow-[0_22px_60px_rgba(32,32,33,0.14)] sm:block">
        <div className="flex items-center gap-2 text-[#ea4c89]">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-extrabold">Business File growing</span>
        </div>
      </div>
      <div className="mx-auto max-h-[690px] overflow-hidden rounded-[42px] border-[10px] border-[#d4d7db] bg-white shadow-[0_42px_100px_rgba(32,32,33,0.18)] sm:w-[360px]">
        <div className="rounded-[32px] bg-white">
          <div className="flex items-center justify-between border-b border-[#eeeeea] px-5 py-4">
            <span className="text-sm font-black text-[#202021]">{page.example.name}</span>
            <span className="rounded-full bg-[#fde8f1] px-3 py-1 text-xs font-bold text-[#ea4c89]">Live</span>
          </div>
          <div className="bg-[#fde8f1] px-5 py-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ea4c89]">VulaTrade tool</p>
            <h3 className="mt-2 text-3xl font-black leading-tight text-[#202021]">{page.headline}</h3>
            <a href="/signup" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ea4c89] px-4 py-4 text-sm font-extrabold text-white">
              <Icon className="h-4 w-4" />
              Start Free
            </a>
          </div>
          <div className="space-y-3 px-5 py-5">
            {page.example.stats.map((stat) => (
              <div key={stat} className="flex items-center gap-3 rounded-2xl border border-[#eeeeea] bg-white p-3 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
                  <Check className="h-5 w-5" />
                </span>
                <span className="text-sm font-extrabold text-[#202021]">{stat}</span>
              </div>
            ))}
            <div className="rounded-2xl bg-[#f8f8f8] p-4">
              <p className="text-sm font-bold leading-6 text-[#202021]">{page.example.text}</p>
            </div>
          </div>
          <div className="border-t border-[#eeeeea] px-5 py-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#767b81]">
              <span>Proof-of-trading record</span>
              <span className="text-[#202021]">68%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[#fde8f1]">
              <div className="h-2 w-[68%] rounded-full bg-[#ea4c89]" />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#eeeeea] bg-white px-3 py-2 text-xs font-extrabold text-[#767b81]">
              <Logo size="small" iconOnly />
              Powered by VulaTrade
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatAndWhy({ page }) {
  return (
    <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1480px] gap-6 lg:grid-cols-2">
        <article className="rounded-[34px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.07)] sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="mt-7 text-3xl font-black tracking-tight text-[#202021]">{page.whatTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-[#454545]">{page.whatText}</p>
        </article>
        <article className="rounded-[34px] border border-[#eeeeea] bg-[#fff5f9] p-7 shadow-[0_18px_50px_rgba(32,32,33,0.05)] sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#ea4c89]">
            <PiggyBank className="h-6 w-6" />
          </span>
          <h2 className="mt-7 text-3xl font-black tracking-tight text-[#202021]">{page.whyTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-[#454545]">{page.whyText}</p>
        </article>
      </div>
    </section>
  );
}

function Benefits({ page }) {
  return (
    <section className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading align="center" eyebrow="Key benefits" title="Built for busy kasipreneurs." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-[#eeeeea] bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
                <Check className="h-4 w-4" />
              </span>
              <span className="font-extrabold text-[#202021]">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps({ page }) {
  return (
    <section id="how-it-works" className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading align="center" eyebrow="How it works" title="Simple enough to use between customers." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {page.steps.map(([title, copy], index) => (
            <article key={title} className="rounded-[30px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.06)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ea4c89] text-lg font-black text-white">{index + 1}</span>
              <h3 className="mt-7 text-2xl font-black tracking-tight text-[#202021]">{title}</h3>
              <p className="mt-4 text-base leading-7 text-[#454545]">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExampleAndFile({ page }) {
  return (
    <section className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1480px] gap-6 lg:grid-cols-2">
        <article className="rounded-[34px] bg-[#202021] p-7 text-white shadow-[0_18px_50px_rgba(32,32,33,0.12)] sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">Example use case</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">{page.example.name}</h2>
          <p className="mt-5 text-lg leading-8 text-white/70">{page.example.text}</p>
          <div className="mt-8 grid gap-3">
            {page.example.stats.map((stat) => (
              <div key={stat} className="rounded-2xl bg-white/8 p-4 font-extrabold text-white/90">{stat}</div>
            ))}
          </div>
        </article>
        <article className="rounded-[34px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.07)] sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
            <FileCheck className="h-6 w-6" />
          </span>
          <h2 className="mt-7 text-3xl font-black tracking-tight text-[#202021]">How this builds your Business File</h2>
          <p className="mt-4 text-lg leading-8 text-[#454545]">{page.fileText}</p>
        </article>
      </div>
    </section>
  );
}

function FAQ({ page }) {
  return (
    <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1100px]">
        <SectionHeading align="center" eyebrow="FAQs" title="Quick answers." />
        <div className="mt-12 grid gap-4">
          {page.faqs.map(([question, answer]) => (
            <details key={question} className="rounded-3xl border border-[#eeeeea] bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none text-lg font-black text-[#202021]">{question}</summary>
              <p className="mt-4 text-base leading-7 text-[#454545]">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExploreMore({ currentKey }) {
  return (
    <section className="bg-[#f8f8f8] px-5 py-12 lg:px-20">
      <div className="mx-auto max-w-[1480px]">
        <h2 className="text-2xl font-black text-[#202021]">Explore more VulaTrade tools</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {toolLinks.map((link) => {
            const isCurrent = solutionRoutes[link.href] === currentKey;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-2xl border px-5 py-3 text-sm font-extrabold transition ${
                  isCurrent
                    ? "border-[#ea4c89] bg-[#ea4c89] text-white"
                    : "border-[#eeeeea] bg-white text-[#202021] hover:border-[#f8b8d2] hover:bg-[#fff5f9]"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ page }) {
  return (
    <section className="bg-white px-5 py-8 lg:px-20 lg:py-12">
      <div className="mx-auto max-w-[1480px] rounded-[36px] bg-[#fde8f1] px-6 py-14 text-center sm:px-10 lg:py-20">
        <h2 className="mx-auto max-w-[820px] text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-6xl">
          Start free today.
        </h2>
        <p className="mx-auto mt-5 max-w-[720px] text-lg leading-8 text-[#454545]">
          Start where you are. Sell smarter, get organised and build proof as you trade.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-[#ea4c89] px-10 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
            {page.primaryCta}
          </a>
          <a href="/business-page" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#ea4c89] px-10 py-5 text-lg font-extrabold text-[#ea4c89] transition hover:bg-white">
            Create Business Page
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function SolutionPage({ pageKey = "businessPage" }) {
  const page = pages[pageKey] || pages.businessPage;

  return (
    <div className="min-h-screen bg-white font-sans text-[#202021]">
      <Header />
      <main>
        <section className="overflow-hidden bg-white px-5 pb-14 pt-16 sm:pb-20 lg:px-20 lg:pt-24">
          <div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ea4c89]">{page.eyebrow}</p>
              <h1 className="mt-5 max-w-[780px] text-[44px] font-black leading-[1.04] tracking-tight text-[#202021] sm:text-[64px] lg:text-[82px]">
                {page.headline}
              </h1>
              <p className="mt-7 max-w-[680px] text-lg leading-8 text-[#454545] sm:text-2xl sm:leading-10">{page.subheadline}</p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-[#ea4c89] px-10 py-5 text-lg font-extrabold text-white shadow-sm transition hover:bg-[#d93f7b]">
                  {page.primaryCta}
                </a>
                <a href={page.secondaryHref} className="inline-flex items-center justify-center rounded-2xl border-2 border-[#ea4c89] px-10 py-5 text-lg font-extrabold text-[#ea4c89] transition hover:bg-[#fde8f1]">
                  {page.secondaryCta}
                </a>
              </div>
              <p className="mt-7 max-w-[620px] text-base font-semibold leading-7 text-[#767b81]">
                Works from your phone. Built for South African entrepreneurs.
              </p>
            </div>
            <div className="rounded-[36px] bg-[#edf5fe] px-5 py-10 sm:px-10 lg:py-16">
              <HeroMockup page={page} />
            </div>
          </div>
        </section>
        <WhatAndWhy page={page} />
        <Benefits page={page} />
        <Steps page={page} />
        <ExampleAndFile page={page} />
        <FAQ page={page} />
        <ExploreMore currentKey={pageKey} />
        <FinalCTA page={page} />
      </main>
      <Footer />
    </div>
  );
}

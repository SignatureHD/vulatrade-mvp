import React from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  Car,
  Check,
  GraduationCap,
  Home,
  Link,
  ListChecks,
  MessageCircle,
  Paintbrush,
  Scissors,
  Shirt,
  Sparkles,
  Star,
  Utensils,
  Wrench,
} from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import Logo from "../components/Logo";

function SectionHeading({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-[920px] text-center" : "max-w-[820px]"}>
      {eyebrow && <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">{eyebrow}</p>}
      <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-5xl lg:text-6xl">{title}</h2>
      {text && <p className="mt-5 text-lg leading-8 text-[#454545]">{text}</p>}
    </div>
  );
}

function PhoneMockup() {
  const services = [
    { name: "Gel overlay", price: "R220" },
    { name: "Acrylic set", price: "R350" },
    { name: "Soak off", price: "R80" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <div className="absolute -right-1 bottom-10 z-20 hidden rounded-2xl bg-white px-5 py-4 shadow-[0_22px_60px_rgba(32,32,33,0.14)] sm:block">
        <div className="flex items-center gap-2 text-[#ea4c89]">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-extrabold">Ready to share on WhatsApp</span>
        </div>
      </div>

      <div className="mx-auto max-h-[700px] overflow-hidden rounded-[42px] border-[10px] border-[#d4d7db] bg-white shadow-[0_42px_100px_rgba(32,32,33,0.18)] sm:w-[360px]">
        <div className="rounded-[32px] bg-white">
          <div className="flex items-center justify-between border-b border-[#eeeeea] px-5 py-4">
            <span className="text-sm font-black text-[#202021]">Nomsa's Nails</span>
            <span className="rounded-full bg-[#fde8f1] px-3 py-1 text-xs font-bold text-[#ea4c89]">Open</span>
          </div>
          <div className="bg-[#fde8f1] px-5 py-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ea4c89]">Mitchells Plain</p>
            <h3 className="mt-2 text-3xl font-black leading-tight text-[#202021]">Nails, lashes and beauty bookings</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#454545]">Fresh sets, neat finishes and easy WhatsApp bookings.</p>
            <a href="/signup" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ea4c89] px-4 py-4 text-sm font-extrabold text-white">
              <MessageCircle className="h-4 w-4" />
              WhatsApp enquiry
            </a>
          </div>

          <div className="grid grid-cols-3 gap-2 px-5 py-5">
            {[Camera, Sparkles, Star].map((Icon, index) => (
              <div key={index} className="flex h-20 items-center justify-center rounded-2xl bg-[#f8f8f8] text-[#ea4c89]">
                <Icon className="h-6 w-6" />
              </div>
            ))}
          </div>

          <div className="space-y-3 px-5 pb-5">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between rounded-2xl border border-[#eeeeea] bg-white p-3 shadow-sm">
                <div>
                  <p className="text-sm font-extrabold text-[#202021]">{service.name}</p>
                  <p className="text-xs text-[#767b81]">Available this week</p>
                </div>
                <span className="rounded-full bg-[#fff8e7] px-3 py-1 text-sm font-black text-[#202021]">{service.price}</span>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 rounded-2xl bg-[#f8f8f8] p-4">
            <div className="flex items-center gap-1 text-[#ffb60a]">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star key={rating} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-2 text-sm font-bold leading-6 text-[#202021]">Clean work and easy to book.</p>
            <p className="mt-1 text-xs text-[#767b81]">Zanele, repeat customer</p>
          </div>

          <div className="border-t border-[#eeeeea] px-5 py-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eeeeea] bg-white px-3 py-2 text-xs font-extrabold text-[#767b81]">
              <Logo size="small" iconOnly />
              Powered by VulaTrade
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplanationSection() {
  const cards = [
    {
      title: "Your link in bio",
      copy: "Add your VulaTrade link to WhatsApp, Facebook, Instagram, TikTok or your SMS replies.",
      icon: Link,
    },
    {
      title: "Your services and prices",
      copy: "Show customers what you offer before they message you.",
      icon: ListChecks,
    },
    {
      title: "Your WhatsApp enquiry button",
      copy: "Customers can contact you quickly without searching for your number.",
      icon: MessageCircle,
    },
  ];

  return (
    <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading
          eyebrow="Simple link-in-bio page"
          title="What is a VulaTrade Business Page?"
          text="It is your simple online business card, price list and booking link in one place. It is not a complicated website. It is a clean page you can share with customers so they can see what you do, what it costs and how to contact you."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-[30px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.07)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-7 text-2xl font-black tracking-tight text-[#202021]">{card.title}</h3>
                <p className="mt-4 text-base leading-7 text-[#454545]">{card.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QuestionsSection() {
  const bullets = [
    "Show your prices clearly",
    "Add photos of your work",
    "Share your location or service area",
    "Add reviews from happy customers",
    "Let customers enquire on WhatsApp",
    "Make your business look more professional",
  ];

  return (
    <section className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          eyebrow="Less back-and-forth"
          title="Stop answering the same questions all day."
          text="How much is it? Where are you based? Do you have photos? What times are available? A VulaTrade Business Page helps answer the basics before the customer messages you."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {bullets.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#eeeeea] bg-white p-4 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
                <Check className="h-4 w-4" />
              </span>
              <span className="font-extrabold text-[#202021]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessTypesSection() {
  const types = [
    { label: "Hair stylists", icon: Scissors },
    { label: "Nail techs", icon: Paintbrush },
    { label: "Barbers", icon: Scissors },
    { label: "Cleaners", icon: Home },
    { label: "Food sellers", icon: Utensils },
    { label: "Clothing sellers", icon: Shirt },
    { label: "Mobile car wash", icon: Car },
    { label: "Repairs and home services", icon: Wrench },
    { label: "Tutors", icon: GraduationCap },
    { label: "Event services", icon: CalendarDays },
  ];

  return (
    <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading align="center" eyebrow="Who it is for" title="Perfect for service businesses and local sellers." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {types.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.label} className="rounded-3xl border border-[#eeeeea] bg-white p-5 text-center shadow-sm">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-black text-[#202021]">{type.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  const steps = [
    { title: "Add your business name", copy: "Tell customers who you are and what you do." },
    { title: "Add your services or products", copy: "List your prices, photos and short descriptions." },
    { title: "Add your WhatsApp number", copy: "Let customers enquire or book with one tap." },
    { title: "Share your link", copy: "Use your page on WhatsApp Status, Facebook, TikTok, Instagram or SMS." },
  ];

  return (
    <section className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading align="center" eyebrow="How it works" title="Get your business online in minutes." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-[30px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.06)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ea4c89] text-lg font-black text-white">{index + 1}</span>
              <h3 className="mt-7 text-2xl font-black tracking-tight text-[#202021]">{step.title}</h3>
              <p className="mt-4 text-base leading-7 text-[#454545]">{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessFileSection() {
  const points = [
    "Services listed",
    "Customer enquiries",
    "Reviews collected",
    "Sales recorded",
    "Payment history",
    "Business activity over time",
  ];

  return (
    <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1480px] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionHeading
          eyebrow="Business File"
          title="Your page also helps build your Business File."
          text="Your VulaTrade Business Page is not just for looking professional. As you add services, customers, reviews and sales, your business starts building a simple proof-of-trading record over time."
        />
        <div className="rounded-[36px] bg-[#fff8e7] p-6 sm:p-10">
          <p className="text-lg font-extrabold leading-8 text-[#202021]">
            Better records may help you in future conversations with suppliers, funders, partners or landlords.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {points.map((point) => (
              <div key={point} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <span className="font-extrabold text-[#202021]">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const rows = [
    ["Takes time to build", "Ready in minutes"],
    ["Can cost money upfront", "Free to start"],
    ["Often needs a laptop", "Works from your phone"],
    ["Can feel too technical", "Easy to update"],
    ["Hard to update quickly", "Built for WhatsApp sharing"],
  ];

  return (
    <section className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading
          eyebrow="Website or not?"
          title="Is it a website?"
          text="Not in the complicated way. A VulaTrade Business Page gives you the useful parts of a website without the cost, setup or stress. It is a simple page built for entrepreneurs who work from their phone."
        />
        <div className="mt-12 overflow-hidden rounded-[32px] border border-[#eeeeea] bg-white shadow-[0_18px_50px_rgba(32,32,33,0.07)]">
          <div className="grid bg-[#202021] text-white sm:grid-cols-2">
            <div className="p-5 text-lg font-black">Normal website</div>
            <div className="border-t border-white/10 p-5 text-lg font-black sm:border-l sm:border-t-0">VulaTrade Business Page</div>
          </div>
          {rows.map(([normal, vula]) => (
            <div key={normal} className="grid border-t border-[#eeeeea] sm:grid-cols-2">
              <div className="p-5 font-semibold text-[#767b81]">{normal}</div>
              <div className="border-t border-[#eeeeea] bg-[#fff5f9] p-5 font-extrabold text-[#202021] sm:border-l sm:border-t-0">
                {vula}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    ["Is this a website?", "It works like a simple website page, but it is easier. You do not need hosting, design skills or a developer. VulaTrade gives you a page you can update from your phone."],
    ["How long does it take to set up?", "Less than 2 minutes if you have your business name, WhatsApp number and services ready."],
    ["Is it really free?", "Yes. You can start with the free Kasipreneur plan."],
    ["Does this replace WhatsApp?", "No. It makes WhatsApp better. Customers first see your services, prices and photos, then they can message you when they are ready."],
    ["Can I use it for services, not products?", "Yes. It is ideal for hair, nails, cleaning, repairs, food, beauty, tutoring, mobile services and local businesses."],
    ["Can I change my page later?", "Yes. You can update your services, prices, photos and details as your business changes."],
  ];

  return (
    <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1100px]">
        <SectionHeading align="center" eyebrow="FAQs" title="Questions entrepreneurs ask." />
        <div className="mt-12 grid gap-4">
          {faqs.map(([question, answer]) => (
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

function FinalCTA() {
  return (
    <section className="bg-white px-5 py-8 lg:px-20 lg:py-12">
      <div className="mx-auto max-w-[1480px] rounded-[36px] bg-[#fde8f1] px-6 py-14 text-center sm:px-10 lg:py-20">
        <h2 className="mx-auto max-w-[820px] text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-6xl">
          Start with a free business page.
        </h2>
        <p className="mx-auto mt-5 max-w-[720px] text-lg leading-8 text-[#454545]">
          Create your VulaTrade page, share your link and start looking professional today.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-[#ea4c89] px-10 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
            Create My Free Page
          </a>
          <a href="/#pricing" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#ea4c89] px-10 py-5 text-lg font-extrabold text-[#ea4c89] transition hover:bg-white">
            View Pricing
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function BusinessPageSolution() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#202021]">
      <Header />
      <main>
        <section className="overflow-hidden bg-white px-5 pb-14 pt-16 sm:pb-20 lg:px-20 lg:pt-24">
          <div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ea4c89]">Start where you are</p>
              <h1 className="mt-5 max-w-[780px] text-[44px] font-black leading-[1.04] tracking-tight text-[#202021] sm:text-[64px] lg:text-[82px]">
                Your business page. Ready in minutes.
              </h1>
              <p className="mt-7 max-w-[660px] text-lg leading-8 text-[#454545] sm:text-2xl sm:leading-10">
                Create a simple mobile-friendly page that shows your services, prices, photos and WhatsApp contact button, so customers can see what you offer without asking the same questions over and over.
              </p>
              <p className="mt-5 max-w-[620px] rounded-2xl border border-[#f8b8d2] bg-[#fff5f9] p-4 text-base font-extrabold leading-7 text-[#202021]">
                A VulaTrade Business Page is your simple link-in-bio business page. It is not a complicated website.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-[#ea4c89] px-10 py-5 text-lg font-extrabold text-white shadow-sm transition hover:bg-[#d93f7b]">
                  Create My Free Page
                </a>
                <a href="/b/wendys" className="inline-flex items-center justify-center rounded-2xl border-2 border-[#ea4c89] px-10 py-5 text-lg font-extrabold text-[#ea4c89] transition hover:bg-[#fde8f1]">
                  See Example Page
                </a>
              </div>
              <p className="mt-7 max-w-[620px] text-base font-semibold leading-7 text-[#767b81]">
                No laptop needed. No website skills needed. Built for your phone.
              </p>
            </div>
            <div className="rounded-[36px] bg-[#edf5fe] px-5 py-10 sm:px-10 lg:py-16">
              <PhoneMockup />
            </div>
          </div>
        </section>
        <ExplanationSection />
        <QuestionsSection />
        <BusinessTypesSection />
        <StepsSection />
        <BusinessFileSection />
        <ComparisonSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

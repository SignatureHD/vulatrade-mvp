import React, { useState } from "react";
import { ArrowRight, CalendarCheck, CircleDollarSign, ClipboardList, Sparkles } from "lucide-react";
import Header from "../components/landing/Header";
import Hero from "../components/landing/Hero";
import FeatureCard from "../components/landing/FeatureCard";
import BusinessTypeCard from "../components/landing/BusinessTypeCard";
import PricingCard from "../components/landing/PricingCard";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";
import {
  businessTypes,
  pricingPlans,
  proofItems,
  solutionFeatures,
  valueIcons,
  whyCards,
} from "../components/landing/landingData";

function SectionHeading({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={`reveal ${align === "center" ? "mx-auto max-w-[900px] text-center" : "max-w-[760px]"}`}>
      {eyebrow && <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">{eyebrow}</p>}
      <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-5xl lg:text-6xl">{title}</h2>
      {text && <p className="mt-5 text-lg leading-8 text-[#454545]">{text}</p>}
    </div>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      title: "Get more bookings",
      copy: "Share one clean business page on WhatsApp, Facebook, TikTok or Instagram so customers can see what you offer and contact you fast.",
      icon: CalendarCheck,
    },
    {
      title: "Stay organised",
      copy: "Track sales, customers, expenses and follow-ups without losing everything in chats, notebooks and screenshots.",
      icon: ClipboardList,
    },
    {
      title: "Look like a pro",
      copy: "Show your services, prices, photos, reviews and contact details in one place, even before you have a website.",
      icon: Sparkles,
    },
  ];

  return (
    <section id="how-it-works" className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading
          align="center"
          eyebrow="Why it helps"
          title="More money. Less admin. More time to do the work."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="reveal rounded-[30px] border border-[#eeeeea] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.07)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <h3 className="mt-7 text-2xl font-black tracking-tight text-[#202021]">{benefit.title}</h3>
                <p className="mt-4 text-base leading-7 text-[#454545]">{benefit.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading
          align="center"
          eyebrow="One simple platform"
          title="One simple platform to get visible, get organised and grow."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {solutionFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessJourneySection() {
  return (
    <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading align="center" eyebrow="Business journey" title="Choose where your business is today." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {businessTypes.map((type) => (
            <BusinessTypeCard key={type.title} type={type} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [billing, setBilling] = useState("monthly");

  return (
    <section id="pricing" className="bg-[#202021] px-5 py-16 text-white lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <div className="reveal mx-auto max-w-[900px] text-center">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ea4c89]">Pricing</p>
          <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            There's a VulaTrade plan for every stage of business.
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/65">Start free. Upgrade when your business is ready.</p>
        </div>

        <div className="reveal mx-auto mt-10 flex max-w-[440px] rounded-2xl bg-white/15 p-1">
          {["monthly", "yearly"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBilling(option)}
              className={`flex-1 rounded-xl px-5 py-4 text-sm font-black capitalize transition ${billing === option ? "bg-white text-[#202021]" : "text-white/75 hover:text-white"}`}
            >
              {option}
            </button>
          ))}
        </div>

        {billing === "yearly" && (
          <p className="reveal mt-5 text-center text-sm font-semibold text-white/60">
            Yearly billing can support future discounts when checkout is connected.
          </p>
        )}

        <div className="mt-12 grid gap-6 lg:grid-cols-2 2xl:grid-cols-4">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="reveal mx-auto mt-10 max-w-[880px] text-center text-base leading-7 text-white/60">
          The free Kasipreneur plan is designed to remove barriers. Start with what you have. Upgrade only when your business needs more.
        </p>
      </div>
    </section>
  );
}

function BusinessFileSection() {
  return (
    <section className="bg-white px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1480px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="Business file"
            title="Your business is already real. Now you can prove it."
            text="Every sale, customer, payment, review and expense helps build your VulaTrade Business File. Over time, this gives you a simple proof-of-trading record you can use for supplier conversations, funding applications, partners and future growth."
          />
          <a href="/signup" className="reveal mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#ea4c89] px-8 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
            Start building your business file
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
        <div className="reveal rounded-[36px] bg-[#fff8e7] p-6 sm:p-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {proofItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-extrabold text-[#202021]">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-2xl bg-[#202021] p-5 text-white">
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-6 w-6 text-[#ea4c89]" />
              <p className="font-black">This is not a credit score.</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/65">Every sale helps strengthen your business file for future growth.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyVulaTradeSection() {
  return (
    <section className="bg-[#f8f8f8] px-5 py-16 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeading align="center" eyebrow="Built for South Africa" title="Built for how South Africans really trade." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {whyCards.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureBand() {
  return (
    <section className="bg-white px-5 py-8 lg:px-20 lg:py-12">
      <div className="reveal mx-auto max-w-[1480px] overflow-hidden rounded-[36px] bg-[#fbe6ea] px-5 py-16 sm:px-10 lg:py-24">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-6xl">
            One app with the records your business needs to grow.
          </h2>
          <a href="/signup" className="mt-9 inline-flex rounded-2xl bg-[#ea4c89] px-12 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
            Get Started
          </a>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {valueIcons.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-center gap-3 rounded-2xl bg-white/70 p-4 text-sm font-black text-[#202021]">
                <Icon className="h-5 w-5 text-[#ea4c89]" />
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#202021]">
      <Header />
      <main>
        <Hero />
        <BenefitsSection />
        <SolutionSection />
        <BusinessJourneySection />
        <PricingSection />
        <BusinessFileSection />
        <WhyVulaTradeSection />
        <FeatureBand />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

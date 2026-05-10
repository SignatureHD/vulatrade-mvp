import React from "react";
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  FileCheck,
  MapPinned,
  MessageCircle,
  PiggyBank,
  ReceiptText,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";

function BusinessPhoneMockup() {
  const updates = [
    { label: "New booking", detail: "Thandi, Friday 14:00", icon: CalendarCheck },
    { label: "Payment received", detail: "R350 acrylic set", icon: CreditCard },
    { label: "Follow-up reminder", detail: "Send care tips to 3 customers", icon: Bell },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -left-4 top-12 hidden rounded-2xl bg-white px-5 py-4 shadow-[0_20px_50px_rgba(32,32,33,0.12)] md:block">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9ba2ac]">Sales Today</p>
        <p className="mt-1 text-3xl font-black text-[#202021]">R1,240</p>
      </div>
      <div className="absolute bottom-8 right-0 z-20 max-w-[230px] rounded-2xl bg-white px-4 py-3 shadow-[0_20px_50px_rgba(32,32,33,0.12)] sm:px-5 sm:py-4 md:-right-2 md:bottom-16 md:max-w-[250px]">
        <div className="flex items-center gap-2 text-[#ea4c89]">
          <FileCheck className="h-4 w-4" />
          <span className="text-sm font-extrabold">Your proof of trading is growing.</span>
        </div>
        <div className="mt-3 h-2 w-40 rounded-full bg-[#fde8f1]">
          <div className="h-2 w-[68%] rounded-full bg-[#ea4c89]" />
        </div>
      </div>

      <div className="mx-auto max-h-[660px] overflow-hidden rounded-[42px] border-[10px] border-[#d4d7db] bg-white shadow-[0_42px_100px_rgba(32,32,33,0.18)] sm:max-h-[710px] sm:w-[360px]">
        <div className="rounded-[32px] bg-white">
          <div className="flex items-center justify-between border-b border-[#eeeeea] px-5 py-4">
            <span className="text-sm font-black text-[#202021]">Nomsa's Hair Studio</span>
            <span className="rounded-full bg-[#fde8f1] px-3 py-1 text-xs font-bold text-[#ea4c89]">Open</span>
          </div>
          <div className="bg-[#fde8f1] px-5 py-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ea4c89]">Soweto</p>
            <h3 className="mt-2 text-3xl font-black leading-tight text-[#202021]">Bookings, payments and customers in one place</h3>
            <a href="/signup" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ea4c89] px-4 py-4 text-sm font-extrabold text-white">
              <MessageCircle className="h-4 w-4" />
              WhatsApp enquiry
            </a>
          </div>
          <div className="space-y-3 px-5 py-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#eeeeea] bg-white p-4 shadow-sm">
                <ReceiptText className="h-5 w-5 text-[#ea4c89]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-[#767b81]">Sales Today</p>
                <p className="mt-1 text-2xl font-black text-[#202021]">R1,240</p>
              </div>
              <div className="rounded-2xl border border-[#eeeeea] bg-white p-4 shadow-sm">
                <Users className="h-5 w-5 text-[#ea4c89]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-[#767b81]">Customers</p>
                <p className="mt-1 text-2xl font-black text-[#202021]">24</p>
              </div>
            </div>
            {updates.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-[#eeeeea] bg-white p-3 shadow-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-[#202021]">{item.label}</span>
                    <span className="block text-xs text-[#767b81]">{item.detail}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-[#eeeeea] px-5 py-4">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#fff5f9] px-3 py-2 text-xs font-extrabold text-[#ea4c89]">
              <CheckCircle2 className="h-4 w-4" />
              Your proof of trading is growing.
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#767b81]">
              <span>Business File Progress</span>
              <span className="text-[#202021]">68%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[#fde8f1]">
              <div className="h-2 w-[68%] rounded-full bg-[#ea4c89]" />
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-[#767b81]">Every sale helps strengthen your business file.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  const items = [
    { label: "2 min setup", icon: Zap },
    { label: "Mobile-first", icon: Smartphone },
    { label: "Free to start", icon: PiggyBank },
    { label: "Built for SA", icon: MapPinned },
  ];

  return (
    <div className="mt-7 grid grid-cols-2 gap-3 rounded-[28px] border border-[#f8b8d2] bg-[#fff5f9] p-3 sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:p-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-extrabold text-[#202021] shadow-sm sm:flex-1 sm:px-4">
            <Icon className="h-4 w-4 shrink-0 text-[#ea4c89]" strokeWidth={2.2} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="overflow-hidden bg-white px-5 pb-14 pt-16 sm:pb-20 lg:px-20 lg:pt-24">
      <div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="reveal">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ea4c89]">Start local. Sell smarter. Grow stronger.</p>
          <h1 className="mt-5 max-w-[760px] text-[44px] font-black leading-[1.04] tracking-tight text-[#202021] sm:text-[64px] lg:text-[82px]">
            You do the work. VulaTrade helps run the business.
          </h1>
          <p className="mt-7 max-w-[620px] text-lg leading-8 text-[#454545] sm:text-2xl sm:leading-10">
            Get a professional booking page, track every cent, follow up with customers and build proof of trading automatically. Look like a pro and grow your hustle, starting free.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-[#ea4c89] px-10 py-5 text-lg font-extrabold text-white shadow-sm transition hover:bg-[#d93f7b]">
              Start Free
            </a>
            <a href="#how-it-works" className="inline-flex items-center justify-center rounded-2xl border-2 border-[#ea4c89] px-10 py-5 text-lg font-extrabold text-[#ea4c89] transition hover:bg-[#fde8f1]">
              See How It Works
            </a>
          </div>
          <p className="mt-7 max-w-[620px] text-base font-semibold leading-7 text-[#767b81]">
            Built for how South Africans really trade: WhatsApp-first, mobile-first and simple enough to use between customers.
          </p>
          <TrustBar />
        </div>
        <div className="reveal delay-100 rounded-[36px] bg-[#edf5fe] px-5 py-10 sm:px-10 lg:py-16">
          <BusinessPhoneMockup />
        </div>
      </div>
    </section>
  );
}

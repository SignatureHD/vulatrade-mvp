import React from "react";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-white px-5 py-20 lg:px-20">
      <div className="reveal mx-auto max-w-[1480px] overflow-hidden rounded-[36px] bg-[#fde8f1] px-6 py-14 text-center sm:px-10 lg:py-20">
        <h2 className="mx-auto max-w-[900px] text-4xl font-black leading-tight tracking-tight text-[#202021] sm:text-6xl">
          Start free today. Build your business one record at a time.
        </h2>
        <p className="mx-auto mt-6 max-w-[720px] text-lg leading-8 text-[#454545]">
          Create your VulaTrade page, share it on WhatsApp and start tracking your business activity.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-[#ea4c89] px-10 py-5 text-lg font-extrabold text-white transition hover:bg-[#d93f7b]">
            Start Free
          </a>
          <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#ea4c89] px-10 py-5 text-lg font-extrabold text-[#ea4c89] transition hover:bg-white">
            See How It Works
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

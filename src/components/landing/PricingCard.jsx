import React from "react";
import { Check } from "lucide-react";

export default function PricingCard({ plan }) {
  return (
    <article className={`reveal flex h-full flex-col rounded-[28px] p-7 ring-1 ${plan.featured ? "bg-white text-[#202021] ring-white" : "bg-[#292929] text-white ring-white/5"}`}>
      {plan.featured && (
        <span className="mb-5 w-fit rounded-full bg-[#fde8f1] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#ea4c89]">
          Popular
        </span>
      )}
      <h3 className="text-2xl font-black">{plan.name}</h3>
      <p className={`mt-4 min-h-[72px] text-base leading-7 ${plan.featured ? "text-[#454545]" : "text-white/60"}`}>{plan.description}</p>
      <div className="mt-8 flex items-end gap-1">
        <span className="text-4xl font-black tracking-tight">{plan.price}</span>
        {plan.period && <span className={`pb-1 text-base font-semibold ${plan.featured ? "text-[#767b81]" : "text-white/50"}`}>{plan.period}</span>}
      </div>
      <a
        href={plan.href}
        className={`mt-7 inline-flex items-center justify-center rounded-2xl px-5 py-4 text-center text-base font-extrabold transition ${
          plan.featured ? "bg-[#ea4c89] text-white hover:bg-[#d93f7b]" : "bg-white text-[#202021] hover:bg-[#fde8f1]"
        }`}
      >
        {plan.cta}
      </a>
      <div className="mt-7 grid gap-3">
        {plan.features.map((feature) => (
          <div key={feature} className={`flex items-start gap-3 text-sm leading-6 ${plan.featured ? "text-[#202021]" : "text-white/75"}`}>
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.featured ? "bg-[#fde8f1] text-[#ea4c89]" : "bg-white/10 text-[#ea4c89]"}`}>
              <Check className="h-3.5 w-3.5" />
            </span>
            {feature}
          </div>
        ))}
      </div>
    </article>
  );
}

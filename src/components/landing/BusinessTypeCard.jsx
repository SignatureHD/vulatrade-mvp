import React from "react";
import { ArrowRight, Check } from "lucide-react";

const toneClasses = {
  green: "bg-[#fde8f1] text-[#ea4c89]",
  yellow: "bg-[#fff8e7] text-[#d89b00]",
  blue: "bg-[#edf5fe] text-[#0267ff]",
  pink: "bg-[#fbe6ea] text-[#d90429]",
};

export default function BusinessTypeCard({ type }) {
  const Icon = type.icon;

  return (
    <article className="reveal flex h-full flex-col rounded-[32px] bg-white p-7 shadow-[0_18px_50px_rgba(32,32,33,0.07)] ring-1 ring-black/5">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${toneClasses[type.tone]}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-6 text-3xl font-black tracking-tight text-[#202021]">{type.title}</h3>
      <p className="mt-4 text-base leading-7 text-[#454545]">{type.description}</p>
      <p className="mt-6 text-sm font-black uppercase tracking-[0.12em] text-[#767b81]">Best for</p>
      <div className="mt-4 grid gap-3">
        {type.bestFor.map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm font-semibold text-[#202021]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fde8f1] text-[#ea4c89]">
              <Check className="h-3.5 w-3.5" />
            </span>
            {item}
          </div>
        ))}
      </div>
      <a href={type.href} className="mt-8 inline-flex items-center gap-2 text-base font-extrabold text-[#ea4c89]">
        {type.cta}
        <ArrowRight className="h-5 w-5" />
      </a>
    </article>
  );
}

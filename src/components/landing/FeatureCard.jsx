import React from "react";

const toneClasses = {
  green: "bg-[#fde8f1] text-[#ea4c89]",
  yellow: "bg-[#fff8e7] text-[#d89b00]",
  blue: "bg-[#edf5fe] text-[#0267ff]",
  pink: "bg-[#fbe6ea] text-[#d90429]",
};

export default function FeatureCard({ icon: Icon, title, description, tone = "green" }) {
  return (
    <article className="reveal rounded-[28px] border border-[#eeeeea] bg-white p-7 shadow-[0_14px_40px_rgba(32,32,33,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(32,32,33,0.10)]">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${toneClasses[tone]}`}>
        <Icon className="h-7 w-7" strokeWidth={2.2} />
      </div>
      <h3 className="mt-7 text-2xl font-black leading-tight text-[#202021]">{title}</h3>
      <p className="mt-4 text-base leading-7 text-[#454545]">{description}</p>
    </article>
  );
}

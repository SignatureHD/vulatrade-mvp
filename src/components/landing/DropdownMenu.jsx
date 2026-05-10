import React from "react";

const toneClasses = {
  green: "bg-[#fde8f1] text-[#ea4c89]",
  yellow: "bg-[#fff8e7] text-[#d89b00]",
  blue: "bg-[#edf5fe] text-[#0267ff]",
  pink: "bg-[#fbe6ea] text-[#d90429]",
};

export default function DropdownMenu({ items, columns = "md:grid-cols-2" }) {
  return (
    <div className="absolute left-1/2 top-full z-50 hidden w-[min(920px,calc(100vw-48px))] -translate-x-1/2 pt-5 group-hover:block group-focus-within:block">
      <div className="rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(32,32,33,0.16)] ring-1 ring-black/5">
        <div className={`grid gap-4 ${columns}`}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                className="group/item flex gap-5 rounded-2xl p-4 transition hover:bg-[#f8f8f8] focus:bg-[#f8f8f8] focus:outline-none"
              >
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${toneClasses[item.tone] || toneClasses.green}`}>
                  <Icon className="h-7 w-7" strokeWidth={2.2} />
                </span>
                <span>
                  <span className="block text-[20px] font-extrabold leading-tight text-[#202021]">
                    {item.title}
                  </span>
                  <span className="mt-2 block text-[15px] leading-7 text-[#454545]">
                    {item.description}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import DropdownMenu from "./DropdownMenu";
import { navDropdowns } from "./landingData";
import Logo from "../Logo";

const navItems = [
  { label: "Business Solutions", dropdown: "solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Learn", dropdown: "learn" },
  { label: "Business Types", dropdown: "businessTypes" },
  { label: "Company", href: "/company", dropdown: "company" },
];

const companyItems = [
  { title: "About VulaTrade", description: "Learn why we are building for South African entrepreneurs.", icon: navDropdowns.businessTypes[3].icon, tone: "green", href: "/about" },
  { title: "Contact", description: "Speak to the VulaTrade team about support, partnerships or sales.", icon: navDropdowns.learn[5].icon, tone: "blue", href: "/contact" },
];

function MobileSection({ title, items }) {
  return (
    <details className="border-b border-[#eeeeea] py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-[#202021]">
        {title}
        <ChevronDown className="h-4 w-4" />
      </summary>
      <div className="mt-3 grid gap-3">
        {items.map((item) => (
          <a key={item.title} href={item.href} className="rounded-xl bg-[#f8f8f8] p-3">
            <span className="block text-sm font-extrabold text-[#202021]">{item.title}</span>
            <span className="mt-1 block text-xs leading-5 text-[#767b81]">{item.description}</span>
          </a>
        ))}
      </div>
    </details>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  const dropdownMap = {
    solutions: navDropdowns.solutions,
    learn: navDropdowns.learn,
    businessTypes: navDropdowns.businessTypes,
    company: companyItems,
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#eeeeea] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-6 px-5 py-4 lg:px-20">
        <Logo href="/" size="default" />

        <nav className="hidden items-center gap-8 xl:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <div key={item.label} className="group relative">
              <a
                href={item.href || "#"}
                className="flex items-center gap-2 text-[19px] font-medium leading-tight text-[#202021] transition hover:text-[#ea4c89]"
              >
                {item.label}
                {item.dropdown && <ChevronDown className="h-5 w-5 transition group-hover:rotate-180" />}
              </a>
              {item.dropdown && (
                <DropdownMenu
                  items={dropdownMap[item.dropdown]}
                  columns={item.dropdown === "businessTypes" || item.dropdown === "company" ? "md:grid-cols-1" : "md:grid-cols-2"}
                />
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <a href="/login" className="rounded-2xl border-2 border-[#ea4c89] px-12 py-5 text-[18px] font-semibold text-[#ea4c89] transition hover:bg-[#fde8f1]">
            Login
          </a>
          <a href="/signup" className="rounded-2xl bg-[#ea4c89] px-12 py-5 text-[18px] font-semibold text-white shadow-sm transition hover:bg-[#d93f7b]">
            Sign Up
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#eeeeea] text-[#202021] xl:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#eeeeea] bg-white px-5 pb-6 xl:hidden">
          <MobileSection title="Business Solutions" items={navDropdowns.solutions} />
          <a href="#pricing" className="block border-b border-[#eeeeea] py-4 text-base font-bold text-[#202021]">Pricing</a>
          <MobileSection title="Learn" items={navDropdowns.learn} />
          <MobileSection title="Business Types" items={navDropdowns.businessTypes} />
          <MobileSection title="Company" items={companyItems} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a href="/login" className="rounded-2xl border-2 border-[#ea4c89] px-6 py-4 text-center font-semibold text-[#ea4c89]">Login</a>
            <a href="/signup" className="rounded-2xl bg-[#ea4c89] px-6 py-4 text-center font-semibold text-white">Sign Up</a>
          </div>
        </div>
      )}
    </header>
  );
}

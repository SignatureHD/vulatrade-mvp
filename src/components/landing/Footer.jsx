import React from "react";
import { footerLinks } from "./landingData";
import Logo from "../Logo";

const legalLinks = [
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "POPIA Consent", href: "/popia-consent" },
];

export default function Footer() {
  return (
    <footer className="bg-[#202021] px-5 py-14 text-white lg:px-20">
      <div className="mx-auto max-w-[1480px]">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <div className="inline-flex rounded-2xl bg-white px-4 py-3">
              <Logo size="compact" tagline />
            </div>
            <p className="mt-5 max-w-[430px] text-base leading-7 text-white/65">
              VulaTrade - helping South African entrepreneurs turn daily trade into real business growth.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerLinks.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">{column.title}</h3>
                <div className="mt-5 grid gap-3">
                  {column.links.map((link) => (
                    <a key={link.label || link} href={link.href || "#"} className="text-sm font-semibold text-white/60 transition hover:text-white">
                      {link.label || link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <span>Copyright 2026 VulaTrade. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <a key={link.href} href={link.href} className="font-semibold text-white/55 transition hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

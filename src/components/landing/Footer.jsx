import React from "react";
import { footerLinks } from "./landingData";
import Logo from "../Logo";

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
                    <a key={link} href="#" className="text-sm font-semibold text-white/60 transition hover:text-white">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/45">
          Copyright 2026 VulaTrade. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

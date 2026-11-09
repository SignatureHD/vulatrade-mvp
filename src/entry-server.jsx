// Server-side render entry. Used only by server.js in production so that
// Google, WhatsApp, Facebook and AI crawlers receive real HTML and meta tags.
import React from "react";
import { renderToString } from "react-dom/server";
import { supabase } from "./lib/supabase";
import LandingPage from "./pages/LandingPage";
import PublicBusinessPage, { publicPageFallback } from "./pages/PublicBusinessPage";
import SolutionPage, { solutionRoutes, pages as solutionPages } from "./pages/SolutionPage";
import VulaAcademyPage from "./pages/VulaAcademyPage";
import LegalPage from "./pages/LegalPage";
import { businessDescriptionOrDefault } from "./businessDescriptions";

const SITE = "https://www.vulatrade.co.za";
const DEFAULT_IMAGE = `${SITE}/vulatrade-og.png`;
const DEFAULT_DESCRIPTION =
  "VulaTrade is a free business app for South African small businesses and kasipreneurs. Get a business page you can share on WhatsApp, track sales, customers and expenses, and build proof of trading from your phone.";

// Routes that belong to the logged-in app. Served as the plain app shell and kept out of search.
const APP_ROUTES = new Set([
  "/login", "/signup", "/dashboard", "/onboarding", "/setup", "/location", "/public-page", "/products",
  "/customers", "/customer-follow-ups", "/enquiries", "/bookings", "/sales", "/expenses", "/reviews",
  "/business-file", "/dashboard/business-file", "/whatsapp-status", "/growth/whatsapp-status-builder",
  "/vuke", "/plans", "/settings", "/money", "/growth", "/messages",
]);

const LEGAL = {
  "/terms": { type: "terms", title: "Terms of Use | VulaTrade", description: "The terms that apply when you use VulaTrade, written in plain language." },
  "/privacy-policy": { type: "privacy", title: "Privacy Policy | VulaTrade", description: "How VulaTrade collects, uses and protects your personal information." },
  "/privacy": { type: "privacy", title: "Privacy Policy | VulaTrade", description: "How VulaTrade collects, uses and protects your personal information.", canonical: "/privacy-policy" },
  "/popia-consent": { type: "popia", title: "POPIA Consent Notice | VulaTrade", description: "How VulaTrade asks for and records your consent under POPIA." },
};

const ACADEMY_PATHS = new Set(["/learn", "/learn/academy", "/learn/academy/start-with-r20"]);

export const publicPaths = ["/", ...Object.keys(solutionRoutes).filter((p) => !APP_ROUTES.has(p)), "/learn/academy", "/terms", "/privacy-policy", "/popia-consent"];

function esc(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function clip(text = "", max = 160) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function buildHead({ title, description, path, image = DEFAULT_IMAGE, noindex = false, type = "website", jsonLd = null }) {
  const url = `${SITE}${path === "/" ? "/" : path}`;
  const desc = clip(description);
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    noindex ? `<meta name="robots" content="noindex, nofollow" />` : `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="VulaTrade" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:locale" content="en_ZA" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  ];
  if (jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`);
  return tags.join("\n    ");
}

// Returns page data, null when the business does not exist, or { failed: true } when
// Supabase could not be reached in time (the browser then loads the page as before).
async function loadPublicPage(slug) {
  try {
    const { data, error } = await supabase
      .rpc("get_public_business_page", { input_slug: slug })
      .abortSignal(AbortSignal.timeout(4000));
    if (!error && data?.business) return data;
    if (error) {
      console.error("SSR public page load:", error.message || error);
      return publicPageFallback(slug) || { failed: true };
    }
  } catch (err) {
    console.error("SSR public page load failed:", err?.message || err);
    return publicPageFallback(slug) || { failed: true };
  }
  return publicPageFallback(slug);
}

function absoluteImage(value) {
  return typeof value === "string" && /^https?:\/\//.test(value) ? value : DEFAULT_IMAGE;
}

function digits(value = "") {
  return String(value).replace(/\D/g, "");
}

// Returns { status, head, html, data }. html === null means "send the app shell".
export async function render(rawPath) {
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;

  const businessMatch = path.match(/^\/b\/([^/]+)$/);
  if (businessMatch) {
    const slug = decodeURIComponent(businessMatch[1]);
    const data = await loadPublicPage(slug);
    if (data?.failed) {
      return {
        status: 200,
        head: buildHead({ title: "VulaTrade business page", description: DEFAULT_DESCRIPTION, path: `/b/${encodeURIComponent(slug)}` }),
        html: null,
        data: null,
      };
    }
    if (!data?.business) {
      return {
        status: 404,
        head: buildHead({ title: "Page not found | VulaTrade", description: "This VulaTrade business page is not available yet.", path, noindex: true }),
        html: null,
        data: null,
      };
    }
    const b = data.business;
    const place = [b.category || "Local business", b.area].filter(Boolean).join(" in ");
    const description = businessDescriptionOrDefault(b.description, b.category) || `${b.name}: ${place}. Enquire on WhatsApp.`;
    const offers = (Array.isArray(data.products) ? data.products : []).filter((p) => p.is_active !== false);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: b.name,
      description: clip(description, 300),
      url: `${SITE}/b/${encodeURIComponent(slug)}`,
      ...(b.area ? { address: { "@type": "PostalAddress", addressLocality: b.area, addressCountry: "ZA" } } : {}),
      ...(b.phone || b.whatsapp ? { telephone: `+${digits(b.phone || b.whatsapp)}` } : {}),
      ...(absoluteImage(b.catalogue || b.logo_url || b.image_url) !== DEFAULT_IMAGE ? { image: absoluteImage(b.catalogue || b.logo_url || b.image_url) } : {}),
      ...(offers.length
        ? {
            makesOffer: offers.slice(0, 30).map((p) => ({
              "@type": "Offer",
              name: p.name,
              ...(Number(p.price) > 0 ? { price: Number(p.price), priceCurrency: "ZAR" } : {}),
            })),
          }
        : {}),
    };
    return {
      status: 200,
      head: buildHead({
        title: `${b.name} | ${place}`,
        description,
        path: `/b/${encodeURIComponent(slug)}`,
        image: absoluteImage(b.catalogue || b.logo_url || b.image_url),
        type: "business.business",
        jsonLd,
      }),
      html: renderToString(<PublicBusinessPage slug={slug} initialData={data} />),
      data,
    };
  }

  if (path.match(/^\/review\/[^/]+$/) || APP_ROUTES.has(path)) {
    return {
      status: 200,
      head: buildHead({ title: "VulaTrade", description: DEFAULT_DESCRIPTION, path, noindex: true }),
      html: null,
      data: null,
    };
  }

  if (LEGAL[path]) {
    const legal = LEGAL[path];
    return {
      status: 200,
      head: buildHead({ title: legal.title, description: legal.description, path: legal.canonical || path }),
      html: renderToString(<LegalPage type={legal.type} />),
      data: null,
    };
  }

  if (ACADEMY_PATHS.has(path)) {
    return {
      status: 200,
      head: buildHead({
        title: "Vula Academy: free business lessons for local entrepreneurs | VulaTrade",
        description: "Free, phone-first lessons that help South African small businesses set up WhatsApp Business, price their offers, track money and grow.",
        path: "/learn/academy",
      }),
      html: renderToString(<VulaAcademyPage />),
      data: null,
    };
  }

  if (solutionRoutes[path]) {
    const key = solutionRoutes[path];
    const page = solutionPages[key] || {};
    return {
      status: 200,
      head: buildHead({ title: `${String(page.headline || page.eyebrow || "").replace(/\.$/, "")} | VulaTrade`, description: page.subheadline || DEFAULT_DESCRIPTION, path }),
      html: renderToString(<SolutionPage pageKey={key} />),
      data: null,
    };
  }

  const isHome = path === "/";
  return {
    status: isHome ? 200 : 404,
    head: buildHead({
      title: isHome ? "VulaTrade | Free business app for South African small businesses" : "Page not found | VulaTrade",
      description: DEFAULT_DESCRIPTION,
      path: isHome ? "/" : path,
      noindex: !isHome,
      jsonLd: isHome
        ? {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "VulaTrade",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: SITE,
            description: DEFAULT_DESCRIPTION,
            offers: { "@type": "Offer", price: "0", priceCurrency: "ZAR" },
          }
        : null,
    }),
    html: renderToString(<LandingPage onSignup={() => {}} onSignin={() => {}} />),
    data: null,
  };
}

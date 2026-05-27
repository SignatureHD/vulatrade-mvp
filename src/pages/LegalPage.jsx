import React from "react";
import Logo from "../components/Logo";

const BRAND = "#ea4c89";
const DARK = "#202021";

const legalPages = {
  terms: {
    title: "VulaTrade Terms of Use",
    updated: "27 May 2026",
    intro:
      "Welcome to VulaTrade. VulaTrade helps entrepreneurs, small businesses and informal traders create a simple online business profile, list products or services, manage customer interest, track basic business activity, and build a practical business file over time. By using VulaTrade, you agree to these Terms of Use.",
    sections: [
      {
        heading: "1. Who may use VulaTrade",
        body: ["You may use VulaTrade if you are allowed to enter into this agreement and provide accurate information when creating your account.", "You are responsible for keeping your login details safe."],
      },
      {
        heading: "2. Your account and business profile",
        body: ["When you create a VulaTrade account, you may add information such as your name, business name, contact details, business location or trading area, products or services, prices, photos, customer enquiries, sales, expenses or booking information.", "You are responsible for making sure the information you add is correct, lawful and not misleading."],
      },
      {
        heading: "3. Public business pages",
        body: ["VulaTrade may allow you to create a public business page. This page may show information you choose to publish, such as your business name, product or service details, pricing, area, photos and contact options.", "Do not upload anything you do not have permission to use."],
      },
      {
        heading: "4. Acceptable use",
        body: ["You agree not to use VulaTrade to sell illegal goods or services, upload false or misleading information, copy another person’s content without permission, abuse others, attempt to access another user’s account, or interfere with the VulaTrade platform.", "We may suspend or remove accounts that misuse the platform."],
      },
      {
        heading: "5. Payments, sales and customer dealings",
        body: ["VulaTrade may help you display products, services, payment options or customer enquiries. Unless clearly stated otherwise, VulaTrade is not the seller of your goods or services.", "You remain responsible for your customer service, product or service quality, prices, refunds, disputes, tax obligations, delivery and collection arrangements."],
      },
      {
        heading: "6. Free and paid features",
        body: ["VulaTrade may offer free features, pilot access and future paid features. If paid features are introduced, we will explain the pricing before you are charged."],
      },
      {
        heading: "7. Platform availability",
        body: ["We aim to keep VulaTrade available and useful, but we cannot guarantee that the platform will always be error-free or available at all times.", "We may update, improve, pause or remove features as the platform grows."],
      },
      {
        heading: "8. Limitation of liability",
        body: ["VulaTrade is provided as a business support tool. We are not responsible for business losses, lost sales, customer disputes, incorrect information entered by users, or decisions made based on platform outputs.", "Use your own judgement before making business, financial or trading decisions."],
      },
      {
        heading: "9. Changes to these terms",
        body: ["We may update these Terms of Use from time to time. If the changes are important, we may ask you to accept the updated version before continuing to use VulaTrade."],
      },
      {
        heading: "10. Contact",
        body: ["For questions about these Terms of Use, contact VulaTrade through the support details provided on the website."],
      },
    ],
  },
  privacy: {
    title: "VulaTrade Privacy Policy",
    updated: "27 May 2026",
    intro:
      "VulaTrade respects your privacy. This Privacy Policy explains what personal information we collect, why we collect it, how we use it, and how we protect it. This policy is written in line with South Africa’s Protection of Personal Information Act, commonly known as POPIA.",
    sections: [
      {
        heading: "1. What information we collect",
        body: ["When you use VulaTrade, we may collect your name, email address, cellphone number, business name, business type, trading area or location, products and services, prices and photos you upload, customer, booking, sales or expense information you choose to add, account login information, support messages, consent records, browser type, device information, IP address and usage activity."],
      },
      {
        heading: "2. Why we collect your information",
        body: ["We use your information to create and manage your account, display your business profile or public business page, help you manage products, services, customers, bookings, sales and expenses, provide onboarding and support, improve the platform, protect user accounts, keep consent and compliance records, and send optional updates only where you have agreed to receive them."],
      },
      {
        heading: "3. Public information",
        body: ["Some information may be visible to the public if you choose to publish it on your VulaTrade business page. This may include business name, trading area, products or services, prices, photos, WhatsApp or contact buttons, and business description.", "You should only publish information you are comfortable sharing."],
      },
      {
        heading: "4. Optional marketing and WhatsApp communication",
        body: ["You may choose whether you want to receive VulaTrade marketing, tips, product updates, WhatsApp onboarding messages or WhatsApp support updates.", "These are optional. You can say no and still use VulaTrade."],
      },
      {
        heading: "5. Sharing your information",
        body: ["We do not sell your personal information.", "We may share limited information with trusted service providers who help us run VulaTrade, such as hosting, database, email, analytics, support or messaging providers. These providers may only use the information for the purpose of helping us provide the service.", "We may also share information where required by law."],
      },
      {
        heading: "6. How we protect your information",
        body: ["We take reasonable steps to protect your personal information from loss, misuse, unauthorised access, disclosure or alteration. This includes using access controls, secure systems and platform-level protections where available."],
      },
      {
        heading: "7. How long we keep your information",
        body: ["We keep your information for as long as needed to provide VulaTrade, comply with legal requirements, resolve disputes, protect our rights, and maintain accurate business and consent records.", "You may request deletion of your account, subject to legal or operational retention requirements."],
      },
      {
        heading: "8. Your rights",
        body: ["You may ask us to confirm what personal information we hold about you, correct your personal information, delete your personal information where allowed, withdraw optional marketing consent, object to certain processing, or ask questions about how your information is used."],
      },
      {
        heading: "9. Children",
        body: ["VulaTrade is not designed for children. Users should not create an account on behalf of a child unless they have the legal right to do so."],
      },
      {
        heading: "10. Changes to this policy",
        body: ["We may update this Privacy Policy from time to time. If the changes are important, we may ask you to accept the updated version before continuing to use VulaTrade."],
      },
      {
        heading: "11. Contact",
        body: ["For privacy questions, contact VulaTrade through the support details provided on the website."],
      },
    ],
  },
  popia: {
    title: "VulaTrade POPIA Consent Notice",
    updated: "27 May 2026",
    intro:
      "This notice explains how VulaTrade processes your personal information in line with South Africa’s Protection of Personal Information Act, known as POPIA. By accepting this notice, you consent to VulaTrade processing your personal information for account, business profile and support purposes.",
    sections: [
      {
        heading: "1. What you are consenting to",
        body: ["You consent to VulaTrade collecting and using your personal information to create your account, identify you as a user, create and manage your business profile, display information you choose to publish on your business page, help you manage products, services, customers, bookings, sales and expenses, provide support and onboarding, improve the platform, keep records of your consent, and protect the platform against misuse."],
      },
      {
        heading: "2. Information we may process",
        body: ["This may include your name, email address, cellphone number, business name, business type, trading area, products or services, prices, photos, customer or booking details you add, sales and expense records you add, support messages, device information, browser information, usage information, consent date and consent version."],
      },
      {
        heading: "3. Why this information is needed",
        body: ["VulaTrade needs this information to provide the service. Without this information, we may not be able to create your account, display your business profile, provide support, or help you use the platform properly."],
      },
      {
        heading: "4. Public business information",
        body: ["Some information may become public if you choose to publish it on your business page. This may include your business name, trading area, product or service details, prices, photos and contact options.", "You control what you add to your business profile."],
      },
      {
        heading: "5. Optional communication",
        body: ["Marketing messages and WhatsApp onboarding updates are optional. You do not have to agree to receive them in order to use VulaTrade.", "You may withdraw optional consent later."],
      },
      {
        heading: "6. Storage and security",
        body: ["VulaTrade will take reasonable steps to store your personal information securely and protect it from unauthorised access, loss or misuse."],
      },
      {
        heading: "7. Your rights",
        body: ["You may request access to your personal information, ask for corrections, withdraw optional consent, or ask questions about how your information is processed."],
      },
      {
        heading: "8. Consent statement",
        body: ["By ticking the POPIA consent box, you confirm: I consent to VulaTrade processing my personal information for account, business profile and support purposes in line with POPIA."],
      },
    ],
  },
};

export default function LegalPage({ type = "terms" }) {
  const page = legalPages[type] || legalPages.terms;

  return (
    <div className="min-h-screen bg-[#fbfbfb] font-sans text-[#202021]">
      <header className="border-b border-[#eeeeea] bg-white px-5 py-5 lg:px-20">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4">
          <a href="/" className="inline-flex rounded-2xl bg-white px-2 py-2" aria-label="Back to VulaTrade home">
            <Logo size="compact" tagline />
          </a>
          <a href="/signup" className="rounded-2xl bg-[#ea4c89] px-5 py-3 text-sm font-black text-white transition hover:bg-[#d93f7b]">
            Join VulaTrade
          </a>
        </div>
      </header>

      <main className="px-5 py-10 lg:px-20 lg:py-16">
        <article className="mx-auto max-w-[900px] rounded-[32px] border border-[#eeeeea] bg-white p-6 shadow-[0_18px_60px_rgba(32,32,33,0.08)] sm:p-10 lg:p-14">
          <p className="text-sm font-black uppercase tracking-[0.16em]" style={{ color: BRAND }}>
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl" style={{ color: DARK }}>
            {page.title}
          </h1>
          <p className="mt-3 text-sm font-bold text-[#777]">Last updated: {page.updated}</p>
          <p className="mt-7 text-lg leading-8 text-[#454545]">{page.intro}</p>

          <div className="mt-10 grid gap-8">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-black tracking-tight" style={{ color: DARK }}>
                  {section.heading}
                </h2>
                <div className="mt-3 grid gap-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-[#454545]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-3xl bg-[#fff5f9] p-5 text-sm leading-7 text-[#454545]">
            These pages are written in plain language for VulaTrade users. They should be reviewed by a South African legal professional before relying on them as formal legal documents.
          </div>
        </article>
      </main>
    </div>
  );
}

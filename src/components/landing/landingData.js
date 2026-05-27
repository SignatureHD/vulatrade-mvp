import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileText,
  GraduationCap,
  HandCoins,
  Headphones,
  HeartHandshake,
  Landmark,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  ReceiptText,
  ShoppingBag,
  Smartphone,
  Star,
  Store,
  Tags,
  Users,
  WalletCards,
} from "lucide-react";

export const navDropdowns = {
  solutions: [
    {
      title: "Create Your Business Page",
      description: "Launch a simple mobile-friendly business page you can share on WhatsApp.",
      icon: Smartphone,
      tone: "green",
      href: "/business-page",
    },
    {
      title: "Record Sales",
      description: "Track daily sales, cash, EFT, PayShap, Yoco and iKhokha payments.",
      icon: ReceiptText,
      tone: "yellow",
      href: "/record-sales",
    },
    {
      title: "Manage Customers",
      description: "Save customer details, repeat buyers, notes and follow-ups.",
      icon: Users,
      tone: "blue",
      href: "/manage-customers",
    },
    {
      title: "Track Expenses",
      description: "Capture stock, transport, airtime, data, rent and other business costs.",
      icon: WalletCards,
      tone: "pink",
      href: "/track-expenses",
    },
    {
      title: "Build Your Business File",
      description: "Create proof of trading over time with sales, customers, reviews and records.",
      icon: FileText,
      tone: "green",
      href: "/business-file",
    },
    {
      title: "Prepare for Growth",
      description: "Use your records to become ready for suppliers, funding, discounts and formal growth.",
      icon: BarChart3,
      tone: "yellow",
      href: "/prepare-for-growth",
    },
  ],
  learn: [
    {
      title: "Vula Academy",
      description: "Free short lessons for entrepreneurs who want to grow their business.",
      icon: GraduationCap,
      tone: "pink",
      href: "/learn/academy",
    },
    {
      title: "Community",
      description: "Learn from other South African entrepreneurs building real businesses.",
      icon: HeartHandshake,
      tone: "green",
      href: "/learn/community",
    },
    {
      title: "Blog",
      description: "Simple business tips, WhatsApp selling advice, money management and growth ideas.",
      icon: BookOpen,
      tone: "yellow",
      href: "/learn/blog",
    },
    {
      title: "Reports",
      description: "Business insights and practical guides for township and informal entrepreneurs.",
      icon: FileBarChart,
      tone: "pink",
      href: "/learn/reports",
    },
    {
      title: "FAQs",
      description: "Find answers to common VulaTrade questions.",
      icon: CircleHelp,
      tone: "blue",
      href: "/faqs",
    },
    {
      title: "Support",
      description: "Get help with your account, business page, records and reports.",
      icon: Headphones,
      tone: "green",
      href: "/support",
    },
  ],
  businessTypes: [
    {
      title: "VulaTrade for Kasipreneurs",
      description: "For township entrepreneurs, informal traders, side hustlers and WhatsApp sellers.",
      icon: Users,
      tone: "green",
      href: "/signup",
    },
    {
      title: "VulaTrade for Small Businesses",
      description: "For regular traders who need better records, customers, invoices and sales tracking.",
      icon: Store,
      tone: "yellow",
      href: "/signup",
    },
    {
      title: "VulaTrade for Growing Businesses",
      description: "For businesses ready to manage stock, orders, payments, staff and stronger reporting.",
      icon: Building2,
      tone: "blue",
      href: "/signup",
    },
    {
      title: "VulaTrade for Enterprise",
      description: "For enterprise development partners, funders, NGOs, suppliers and organisations supporting multiple entrepreneurs.",
      icon: Landmark,
      tone: "green",
      href: "#pricing",
    },
  ],
};

export const solutionFeatures = [
  { title: "Business Page", description: "Create a simple page for your products, services, prices and WhatsApp enquiries.", icon: Smartphone, tone: "blue" },
  { title: "Sales Records", description: "Record daily sales from cash, EFT, PayShap, card machines or payment links.", icon: ReceiptText, tone: "green" },
  { title: "Customer List", description: "Keep track of customers, repeat buyers, enquiries and notes.", icon: Users, tone: "pink" },
  { title: "Expenses", description: "Capture business costs so you can understand what you really make.", icon: WalletCards, tone: "yellow" },
  { title: "Reviews", description: "Collect customer feedback and build trust.", icon: Star, tone: "blue" },
  { title: "Business File", description: "Build a record of your trading history for future growth.", icon: ClipboardCheck, tone: "green" },
];

export const businessTypes = [
  {
    title: "Kasipreneur",
    description: "You sell through WhatsApp, word-of-mouth, cash, community groups or social media.",
    bestFor: ["Hairdressers", "Food sellers", "Cleaners", "Nail techs", "Spaza-style traders", "Clothing sellers", "Mobile services", "Side hustlers"],
    cta: "Start as a Kasipreneur",
    href: "/signup",
    tone: "green",
    icon: Users,
  },
  {
    title: "Small Business",
    description: "You already have regular customers and want better records.",
    bestFor: ["Quotes", "Invoices", "Receipts", "Customer tracking", "Expense records", "Monthly summaries"],
    cta: "Grow as a Small Business",
    href: "/signup",
    tone: "yellow",
    icon: Store,
  },
  {
    title: "Growing Business",
    description: "You are ready for stronger tools to manage orders, stock and customers.",
    bestFor: ["Product catalogues", "Stock tracking", "Order management", "Payment links", "Promotions", "Staff access"],
    cta: "Build a Growing Business",
    href: "/signup",
    tone: "pink",
    icon: BriefcaseBusiness,
  },
  {
    title: "Enterprise",
    description: "You support entrepreneurs at scale.",
    bestFor: ["Enterprise development", "Supplier development", "NGO programmes", "Funders", "Training partners", "Corporate CSI/ESD teams"],
    cta: "Talk to Us",
    href: "#pricing",
    tone: "blue",
    icon: Building2,
  },
];

export const pricingPlans = [
  {
    name: "Vula Kasipreneur",
    badge: "Start here",
    price: "Free",
    description: "For entrepreneurs starting with WhatsApp, cash sales and basic records.",
    features: ["Public business page", "WhatsApp enquiry button", "Add products or services", "Basic sales tracking", "Basic customer list", "Basic expense tracking", "Customer reviews", "Business file starter", "Mobile-first dashboard"],
    cta: "Continue free",
    href: "/signup",
  },
  {
    name: "Vula Small Business",
    badge: "Coming soon",
    price: "Coming soon",
    description: "For regular traders who want better records and a more professional setup.",
    features: ["Everything in Kasipreneur", "Unlimited products or services", "Quotes", "Invoices", "Receipts", "Customer history", "Expense categories", "Monthly sales summary", "Downloadable business report", "Supplier list"],
    cta: "Join waitlist",
    href: "/signup",
    featured: true,
  },
  {
    name: "Vula Growing Business",
    badge: "Coming soon",
    price: "Coming soon",
    description: "For businesses ready to manage orders, stock, customers and growth.",
    features: ["Everything in Small Business", "Stock tracking", "Order management", "Payment link tracking", "Promotions and coupons", "Customer groups", "Staff user access", "Sales dashboard", "Stock alerts", "Growth readiness score"],
    cta: "Notify me",
    href: "/signup",
  },
  {
    name: "Vula Partner",
    badge: "For programmes",
    price: "Partner pricing",
    description: "For organisations supporting many entrepreneurs.",
    features: ["Multi-business dashboard", "Entrepreneur progress tracking", "Programme reporting", "Business file exports", "Funding readiness reports", "Supplier development tracking", "Custom onboarding", "Partner support", "White-label options"],
    cta: "Contact Vula",
    href: "#pricing",
  },
];

export const whyCards = [
  { title: "WhatsApp-first", description: "Most small businesses already sell through WhatsApp. VulaTrade supports that behaviour.", icon: MessageCircle, tone: "green" },
  { title: "Cash and digital payments", description: "Track cash, EFT, PayShap, Yoco, iKhokha and payment links.", icon: CreditCard, tone: "yellow" },
  { title: "Mobile-first", description: "Designed for entrepreneurs who run their business from a phone.", icon: Smartphone, tone: "blue" },
  { title: "Simple records", description: "No complicated accounting system needed.", icon: ClipboardList, tone: "pink" },
  { title: "Growth-ready", description: "Build records that can support future supplier deals, funding and formalisation.", icon: ArrowUpRight, tone: "green" },
];

export const proofItems = [
  { label: "Sales history", icon: BarChart3 },
  { label: "Customer activity", icon: Users },
  { label: "Payment records", icon: Banknote },
  { label: "Reviews", icon: Star },
  { label: "Expense tracking", icon: ReceiptText },
  { label: "Supplier notes", icon: ShoppingBag },
  { label: "Growth readiness", icon: BadgeCheck },
];

export const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Business Page", href: "/business-page" },
      { label: "Sales Records", href: "/record-sales" },
      { label: "Customer List", href: "/manage-customers" },
      { label: "Expenses", href: "/track-expenses" },
      { label: "Business File", href: "/business-file" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Business Types",
    links: [
      { label: "Kasipreneurs", href: "/signup" },
      { label: "Small Businesses", href: "/signup" },
      { label: "Growing Businesses", href: "/signup" },
      { label: "Enterprise", href: "#pricing" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Vula Academy", href: "/learn/academy" },
      { label: "Blog", href: "/learn/blog" },
      { label: "FAQs", href: "/faqs" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export const valueIcons = [
  { label: "Business Page", icon: LayoutDashboard, tone: "green" },
  { label: "Customer Records", icon: Users, tone: "yellow" },
  { label: "Reports", icon: FileBarChart, tone: "blue" },
  { label: "Promotions", icon: Megaphone, tone: "pink" },
  { label: "Payments", icon: HandCoins, tone: "green" },
  { label: "Pricing", icon: Tags, tone: "yellow" },
];

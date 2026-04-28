import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CreditCard,
  FileText,
  Link2,
  Megaphone,
  MessageCircle,
  Paintbrush,
  Plus,
  Repeat2,
  Scissors,
  Sparkles,
  Star,
  Store,
  Truck,
  UserRoundCheck,
  Users,
  Wallet,
  Wheat,
} from 'lucide-react';
import './styles.css';

const statuses = ['New Lead', 'Contacted', 'Quote Sent', 'Booked', 'Paid', 'Completed', 'Follow Up'];
const backgroundOptions = ['Plain', 'Gradient', 'Glow', 'Pattern'];
const fontOptions = ['Clean', 'Friendly', 'Bold'];

const iconMap = {
  arrow: ArrowRight,
  calendar: CalendarDays,
  check: Check,
  creditCard: CreditCard,
  file: FileText,
  link: Link2,
  megaphone: Megaphone,
  message: MessageCircle,
  paint: Paintbrush,
  plus: Plus,
  repeat: Repeat2,
  scissors: Scissors,
  spark: Sparkles,
  star: Star,
  store: Store,
  truck: Truck,
  userCheck: UserRoundCheck,
  users: Users,
  wallet: Wallet,
  wheat: Wheat,
};

const themePresets = {
  Dark: {
    swatch: 'bg-slate-950',
    text: 'text-white',
    muted: 'text-slate-300',
    label: 'text-lime-300',
    chip: 'bg-white/10 text-lime-200',
    button: 'bg-lime-300 text-slate-900 hover:bg-lime-400',
    link: 'text-lime-200',
    product: 'bg-white/10 text-white ring-white/10',
    productText: 'text-slate-300',
    backgrounds: {
      Plain: 'bg-slate-950',
      Gradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800',
      Glow: 'bg-[radial-gradient(circle_at_top_right,_rgba(132,204,22,0.24),_transparent_38%),linear-gradient(135deg,#020617,#0f172a,#111827)]',
      Pattern: 'bg-[linear-gradient(135deg,#020617_25%,#0f172a_25%,#0f172a_50%,#020617_50%,#020617_75%,#0f172a_75%,#0f172a_100%)] bg-[length:28px_28px]',
    },
  },
  Lime: {
    swatch: 'bg-lime-300',
    text: 'text-slate-950',
    muted: 'text-slate-700',
    label: 'text-lime-800',
    chip: 'bg-lime-200 text-slate-900',
    button: 'bg-slate-900 text-white hover:bg-slate-800',
    link: 'text-slate-800',
    product: 'bg-white/70 text-slate-950 ring-lime-200',
    productText: 'text-slate-600',
    backgrounds: {
      Plain: 'bg-lime-50',
      Gradient: 'bg-gradient-to-br from-lime-100 via-white to-lime-50',
      Glow: 'bg-[radial-gradient(circle_at_top_right,_rgba(132,204,22,0.30),_transparent_38%),linear-gradient(135deg,#f7fee7,#ffffff,#ecfccb)]',
      Pattern: 'bg-[linear-gradient(135deg,#f7fee7_25%,#ecfccb_25%,#ecfccb_50%,#f7fee7_50%,#f7fee7_75%,#ecfccb_75%,#ecfccb_100%)] bg-[length:28px_28px]',
    },
  },
  Green: {
    swatch: 'bg-emerald-400',
    text: 'text-slate-950',
    muted: 'text-emerald-900/75',
    label: 'text-emerald-800',
    chip: 'bg-emerald-200 text-emerald-950',
    button: 'bg-slate-900 text-white hover:bg-slate-800',
    link: 'text-emerald-900',
    product: 'bg-white/75 text-slate-950 ring-emerald-200',
    productText: 'text-emerald-900/70',
    backgrounds: {
      Plain: 'bg-emerald-50',
      Gradient: 'bg-gradient-to-br from-emerald-100 via-white to-lime-50',
      Glow: 'bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.25),_transparent_38%),linear-gradient(135deg,#ecfdf5,#ffffff,#f0fdf4)]',
      Pattern: 'bg-[linear-gradient(135deg,#ecfdf5_25%,#d1fae5_25%,#d1fae5_50%,#ecfdf5_50%,#ecfdf5_75%,#d1fae5_75%,#d1fae5_100%)] bg-[length:28px_28px]',
    },
  },
  Pink: {
    swatch: 'bg-pink-300',
    text: 'text-slate-950',
    muted: 'text-rose-900/70',
    label: 'text-rose-800',
    chip: 'bg-rose-200 text-rose-950',
    button: 'bg-slate-900 text-white hover:bg-slate-800',
    link: 'text-rose-900',
    product: 'bg-white/75 text-slate-950 ring-rose-200',
    productText: 'text-rose-900/70',
    backgrounds: {
      Plain: 'bg-rose-50',
      Gradient: 'bg-gradient-to-br from-rose-100 via-pink-50 to-white',
      Glow: 'bg-[radial-gradient(circle_at_top_right,_rgba(244,114,182,0.25),_transparent_38%),linear-gradient(135deg,#fff1f2,#fdf2f8,#ffffff)]',
      Pattern: 'bg-[linear-gradient(135deg,#fff1f2_25%,#ffe4e6_25%,#ffe4e6_50%,#fff1f2_50%,#fff1f2_75%,#ffe4e6_75%,#ffe4e6_100%)] bg-[length:28px_28px]',
    },
  },
  Blue: {
    swatch: 'bg-sky-400',
    text: 'text-slate-950',
    muted: 'text-sky-900/70',
    label: 'text-sky-800',
    chip: 'bg-sky-200 text-sky-950',
    button: 'bg-slate-900 text-white hover:bg-slate-800',
    link: 'text-sky-900',
    product: 'bg-white/75 text-slate-950 ring-sky-200',
    productText: 'text-sky-900/70',
    backgrounds: {
      Plain: 'bg-sky-50',
      Gradient: 'bg-gradient-to-br from-sky-100 via-white to-blue-50',
      Glow: 'bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.25),_transparent_38%),linear-gradient(135deg,#f0f9ff,#ffffff,#eff6ff)]',
      Pattern: 'bg-[linear-gradient(135deg,#f0f9ff_25%,#dbeafe_25%,#dbeafe_50%,#f0f9ff_50%,#f0f9ff_75%,#dbeafe_75%,#dbeafe_100%)] bg-[length:28px_28px]',
    },
  },
  Gold: {
    swatch: 'bg-amber-300',
    text: 'text-slate-950',
    muted: 'text-amber-900/75',
    label: 'text-amber-800',
    chip: 'bg-amber-200 text-amber-950',
    button: 'bg-slate-900 text-white hover:bg-slate-800',
    link: 'text-amber-900',
    product: 'bg-white/75 text-slate-950 ring-amber-200',
    productText: 'text-amber-900/70',
    backgrounds: {
      Plain: 'bg-amber-50',
      Gradient: 'bg-gradient-to-br from-amber-100 via-white to-yellow-50',
      Glow: 'bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.25),_transparent_38%),linear-gradient(135deg,#fffbeb,#ffffff,#fef3c7)]',
      Pattern: 'bg-[linear-gradient(135deg,#fffbeb_25%,#fde68a_25%,#fde68a_50%,#fffbeb_50%,#fffbeb_75%,#fde68a_75%,#fde68a_100%)] bg-[length:28px_28px]',
    },
  },
};

const themeOptions = Object.keys(themePresets);

const stageConfig = {
  'New Lead': { icon: 'spark', badge: 'bg-sky-50 text-sky-700 ring-sky-100', border: 'border-sky-100', empty: 'New enquiries and first-time customer interest will appear here.' },
  Contacted: { icon: 'message', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-100', border: 'border-indigo-100', empty: 'Move customers here after you message or call them.' },
  'Quote Sent': { icon: 'file', badge: 'bg-amber-50 text-amber-700 ring-amber-100', border: 'border-amber-100', empty: 'Customers waiting on a price, quote or offer will appear here.' },
  Booked: { icon: 'calendar', badge: 'bg-purple-50 text-purple-700 ring-purple-100', border: 'border-purple-100', empty: 'Confirmed bookings or orders will appear here.' },
  Paid: { icon: 'wallet', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100', border: 'border-emerald-100', empty: 'Customers who have paid will appear here.' },
  Completed: { icon: 'check', badge: 'bg-lime-50 text-lime-700 ring-lime-100', border: 'border-lime-100', empty: 'Finished jobs and completed orders will appear here.' },
  'Follow Up': { icon: 'repeat', badge: 'bg-rose-50 text-rose-700 ring-rose-100', border: 'border-rose-100', empty: 'Customers who need a reminder or second message will appear here.' },
};

const snapshotTemplates = [
  {
    id: 'nails', name: 'Home Nail Salon', icon: 'paint', accent: 'from-pink-100 to-lime-100', description: 'Ready-made setup for nails, beauty and home appointments.',
    business: { name: 'Nomsa Nails', owner: 'Nomsa Mokoena', category: 'Beauty & Nails', area: 'Mitchells Plain', whatsapp: '27821234567', description: 'Home-based nail salon offering gel overlays, acrylic sets and soak-offs.', payment: 'EFT or cash before appointment', slug: 'nomsa-nails', theme: 'Pink', backgroundStyle: 'Glow', font: 'Clean', catalogue: 'https://wa.me/c/27821234567' },
    products: [{ id: 1, name: 'Gel overlay', price: 220, image: '💅', desc: 'Neat gel overlay for everyday wear.' }, { id: 2, name: 'Acrylic set', price: 350, image: '✨', desc: 'Full acrylic set with basic finish.' }, { id: 3, name: 'Soak off', price: 80, image: '🧴', desc: 'Safe removal before your next set.' }],
  },
  {
    id: 'fresh-produce', name: 'Fresh Produce Reseller', icon: 'wheat', accent: 'from-green-100 to-yellow-100', description: 'For people selling fruit, veg, cooking oil and food basics locally.',
    business: { name: 'Kasi Fresh Deals', owner: 'Sipho Dlamini', category: 'Fresh Produce & Food Basics', area: 'Khayelitsha', whatsapp: '27821234567', description: 'Affordable fruit, veg and grocery basics delivered to local vendors and families.', payment: 'Cash, EFT or payment on delivery', slug: 'kasi-fresh-deals', theme: 'Green', backgroundStyle: 'Gradient', font: 'Friendly', catalogue: 'https://wa.me/c/27821234567' },
    products: [{ id: 1, name: '5L cooking oil', price: 165, image: '🛢️', desc: 'Bulk cooking oil for homes and vendors.' }, { id: 2, name: 'Veg combo box', price: 120, image: '🥬', desc: 'Mixed veg pack for the week.' }, { id: 3, name: 'Fruit combo bag', price: 90, image: '🍎', desc: 'Seasonal fruit at local prices.' }],
  },
  {
    id: 'barber', name: 'Barber / Grooming', icon: 'scissors', accent: 'from-slate-100 to-lime-100', description: 'For barbers, grooming services and appointment-based side hustles.',
    business: { name: 'Sharp Cut Studio', owner: 'Lunga M.', category: 'Barber & Grooming', area: 'Soweto', whatsapp: '27821234567', description: 'Local barber offering clean cuts, fades, beard trims and weekend bookings.', payment: 'Cash, EFT or pay before appointment', slug: 'sharp-cut-studio', theme: 'Dark', backgroundStyle: 'Glow', font: 'Bold', catalogue: 'https://wa.me/c/27821234567' },
    products: [{ id: 1, name: 'Fade cut', price: 100, image: '✂️', desc: 'Clean fade with shape-up.' }, { id: 2, name: 'Beard trim', price: 60, image: '🧔', desc: 'Beard trim and line-up.' }, { id: 3, name: 'Kids cut', price: 70, image: '⭐', desc: 'Quick kids haircut.' }],
  },
  {
    id: 'local-delivery', name: 'Local Delivery Runner', icon: 'truck', accent: 'from-blue-100 to-lime-100', description: 'For people helping local shops, vendors and neighbours with deliveries.',
    business: { name: 'Quick Kasi Runner', owner: 'Anele M.', category: 'Local Delivery', area: 'Gugulethu', whatsapp: '27821234567', description: 'Affordable local delivery for food vendors, small shops and community orders.', payment: 'EFT, cash or payment before delivery', slug: 'quick-kasi-runner', theme: 'Blue', backgroundStyle: 'Glow', font: 'Clean', catalogue: 'https://wa.me/c/27821234567' },
    products: [{ id: 1, name: 'Local delivery', price: 35, image: '🛵', desc: 'Short-distance delivery in your area.' }, { id: 2, name: 'Vendor pickup', price: 50, image: '📦', desc: 'Collect stock or orders from a supplier.' }, { id: 3, name: 'Weekly delivery plan', price: 250, image: '🗓️', desc: 'Set delivery support for regular clients.' }],
  },
];

const starterCustomers = [
  { id: 1, name: 'Thabo M.', phone: '082 111 2222', interest: 'Gel overlay', status: 'Follow Up', value: 220 },
  { id: 2, name: 'Ayanda K.', phone: '083 333 4444', interest: 'Acrylic set', status: 'Paid', value: 350 },
  { id: 3, name: 'Nomsa D.', phone: '084 555 6666', interest: 'Soak off', status: 'Quote Sent', value: 80 },
];

const growthTools = [
  { type: 'link', name: 'WhatsApp Selling Page', desc: 'Capture enquiries and bookings from one simple link.' },
  { type: 'userCheck', name: 'Customer Follow-up List', desc: 'Bring back people who asked but did not buy yet.' },
  { type: 'star', name: 'Review Request Flow', desc: 'Ask happy customers for reviews and referrals.' },
  { type: 'creditCard', name: 'Payment Reminder', desc: 'Send a polite payment request with clear details.' },
  { type: 'megaphone', name: 'Facebook Group Post', desc: 'Advertise your offer in local community groups.' },
  { type: 'repeat', name: 'Repeat Promo', desc: 'Send weekly or monthly offers to past customers.' },
];

const learningSteps = ['Set up WhatsApp Business properly', 'Create your first local offer', 'Build a simple price list', 'Track every enquiry and follow-up', 'Ask for payment professionally', 'Know when to register and open a business bank account'];

function money(value) { return `R${Number(value || 0).toLocaleString('en-ZA')}`; }
function slugify(value) { return String(value || 'business').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function whatsappLink(number, message) { const clean = String(number || '').replace(/[^0-9]/g, ''); return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`; }
function Icon({ name, className = 'h-5 w-5' }) { const LucideIcon = iconMap[name] || Sparkles; return <LucideIcon className={className} strokeWidth={2} />; }

function Button({ children, onClick, variant = 'default', className = '', type = 'button' }) {
  const styles = variant === 'outline' ? 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50' : variant === 'ghost' ? 'bg-transparent text-slate-700 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800';
  return <button type={type} onClick={onClick} className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${styles} ${className}`}>{children}</button>;
}
function Card({ children, className = '' }) { return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>; }
function Field({ label, value, onChange, placeholder }) { return <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ''} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition focus:ring-2 focus:ring-lime-300" /></label>; }
function SelectField({ label, value, onChange, options }) { return <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition focus:ring-2 focus:ring-lime-300">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Stat({ icon, label, value }) { return <Card className="rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-slate-900"><Icon name={icon} /></div><div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-semibold">{value}</p></div></div></Card>; }
function FeatureIcon({ type }) { return <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-50 text-lime-700 ring-1 ring-lime-100"><Icon name={type} className="h-6 w-6" /></div>; }
function EmptyStage({ status }) { const config = stageConfig[status] || {}; return <div className="flex min-h-[170px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center"><div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400"><Icon name={config.icon || 'users'} className="h-4 w-4" /></div><p className="mt-3 text-sm font-semibold text-slate-700">No customers here yet</p><p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500">{config.empty || 'Customers in this stage will appear here.'}</p></div>; }
function ProductVisual({ product }) { return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl ring-1 ring-slate-200">{product.image || '🛍️'}</div>; }

function ThemeSwatches({ business, updateBusiness }) {
  return <div><p className="text-sm font-medium text-slate-700">Quick theme picker</p><div className="mt-2 flex flex-wrap gap-2">{themeOptions.map((themeName) => <button key={themeName} onClick={() => updateBusiness('theme', themeName)} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition hover:bg-slate-50 ${business.theme === themeName ? 'border-slate-900 ring-2 ring-lime-200' : 'border-slate-200'}`}><span className={`h-4 w-4 rounded-full ${themePresets[themeName].swatch}`} />{themeName}</button>)}</div></div>;
}

function BusinessPreview({ business, products }) {
  const theme = themePresets[business.theme] || themePresets.Dark;
  const backgroundClass = theme.backgrounds[business.backgroundStyle || 'Gradient'] || theme.backgrounds.Gradient;
  const message = `Hi ${business.name}, I am interested in ${products[0]?.name || 'your services'}. Please send me more information.`;
  return <Card className="overflow-hidden shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"><div className="p-6"><div className={`mb-5 overflow-hidden rounded-2xl p-5 ${backgroundClass} ${theme.text}`}><div className="flex items-start justify-between gap-4"><div><p className={`text-sm ${theme.label}`}>Public business page</p><h3 className="mt-1 text-2xl font-bold">{business.name}</h3><p className={`mt-2 text-sm ${theme.muted}`}>{business.category} · {business.area}</p></div><div className={`rounded-full px-3 py-1 text-xs ${theme.chip}`}>{business.theme || 'Dark'} / {business.backgroundStyle || 'Gradient'}</div></div><p className={`mt-3 text-sm ${theme.muted}`}>{business.description}</p><a href={whatsappLink(business.whatsapp, message)} target="_blank" rel="noreferrer"><Button className={`mt-4 w-full ${theme.button}`}><Icon name="message" className="mr-2 h-4 w-4" /> WhatsApp to Book or Order</Button></a>{business.catalogue && <a href={business.catalogue} target="_blank" rel="noreferrer" className={`mt-3 block text-center text-xs underline ${theme.link}`}>View WhatsApp catalogue</a>}</div><div className="grid gap-3">{products.map((p) => <div key={p.id} className="flex items-center gap-3 rounded-xl bg-slate-100 p-3"><ProductVisual product={p} /><div className="min-w-0 flex-1"><p className="font-semibold">{p.name}</p><p className="text-xs text-slate-500">{p.desc || 'Product or service item'}</p></div><strong>{money(p.price)}</strong></div>)}</div><p className="mt-4 text-xs text-slate-400">Preview URL: vulatrade.co.za/b/{business.slug}</p></div></Card>;
}

function TemplateCard({ template, isActive, onUse }) {
  return <button onClick={onUse} className={`group rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isActive ? 'border-lime-400 ring-2 ring-lime-100' : 'border-slate-200'}`}><div className={`mb-4 flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br ${template.accent}`}><Icon name={template.icon} className="h-10 w-10 text-slate-800" /></div><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">{template.name}</h3>{isActive && <span className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-semibold text-lime-800">Active</span>}</div><p className="mt-2 text-sm text-slate-500">{template.description}</p><p className="mt-4 text-sm font-semibold text-slate-900 group-hover:text-lime-700">Use this setup →</p></button>;
}
function ProductCard({ product }) { return <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm"><ProductVisual product={product} /><div className="mt-3 flex-1"><p className="font-semibold">{product.name}</p><p className="mt-1 text-sm text-slate-500">{product.desc || 'Add your own photo later or use this starter visual.'}</p></div><p className="mt-3 text-lg font-bold">{money(product.price)}</p></div>; }

function VulaTradeApp() {
  const firstTemplate = snapshotTemplates[0];
  const [tab, setTab] = useState('dashboard');
  const [activeTemplateId, setActiveTemplateId] = useState(firstTemplate.id);
  const [business, setBusiness] = useState(firstTemplate.business);
  const [products, setProducts] = useState(firstTemplate.products);
  const [customers, setCustomers] = useState(starterCustomers);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '🛍️', desc: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', interest: '', status: 'New Lead', value: '' });
  const [draggedCustomerId, setDraggedCustomerId] = useState(null);

  const nav = [['dashboard', 'Dashboard'], ['templates', 'Starter Setups'], ['setup', 'Setup'], ['page', 'Business Page'], ['customers', 'Customers'], ['messages', 'Messages'], ['growth', 'Growth'], ['learn', 'Learn']];
  const totalSales = customers.reduce((sum, c) => sum + Number(c.value || 0), 0);
  const openLeads = customers.filter((c) => !['Paid', 'Completed'].includes(c.status)).length;
  const followUps = customers.filter((c) => c.status === 'Follow Up').length;
  const templates = useMemo(() => [['New enquiry reply', `Hi, thank you for contacting ${business.name}. Please send me what you are interested in and your preferred date/time.`], ['Payment request', `Hi, thank you for your order with ${business.name}. Your total is [amount]. Payment method: ${business.payment}. Please send proof of payment once done.`], ['Review request', `Thank you for supporting ${business.name}. Please send a short review if you were happy with the service.`], ['Repeat promo', `Hi, ${business.name} has a special this week. Reply here if you would like to book or order again.`]], [business]);

  function applyTemplate(template) { setActiveTemplateId(template.id); setBusiness(template.business); setProducts(template.products); setTab('setup'); }
  function updateBusiness(field, value) { setBusiness((b) => ({ ...b, [field]: value, slug: field === 'name' ? slugify(value) : b.slug })); }
  function addProduct() { if (!newProduct.name.trim()) return; setProducts((items) => [...items, { id: Date.now(), name: newProduct.name, price: Number(newProduct.price || 0), image: newProduct.image || '🛍️', desc: newProduct.desc }]); setNewProduct({ name: '', price: '', image: '🛍️', desc: '' }); }
  function addCustomer() { if (!newCustomer.name.trim()) return; setCustomers((items) => [...items, { id: Date.now(), ...newCustomer, value: Number(newCustomer.value || 0) }]); setNewCustomer({ name: '', phone: '', interest: '', status: 'New Lead', value: '' }); }
  function updateStatus(id, status) { setCustomers((items) => items.map((c) => (c.id === id ? { ...c, status } : c))); }
  function startDrag(event, id) { setDraggedCustomerId(id); event.dataTransfer.effectAllowed = 'move'; }
  function dropOnStage(event, status) { event.preventDefault(); if (draggedCustomerId !== null) updateStatus(draggedCustomerId, status); setDraggedCustomerId(null); }

  return <div className="min-h-screen bg-slate-50 text-slate-900"><header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 font-bold text-lime-300">VT</div><div><p className="text-lg font-bold leading-tight">VulaTrade</p><p className="text-xs text-slate-500">Start local. Sell smarter. Grow stronger.</p></div></div><nav className="hidden items-center gap-2 overflow-x-auto md:flex">{nav.map(([id, label]) => <Button key={id} variant={tab === id ? 'default' : 'ghost'} onClick={() => setTab(id)}>{label}</Button>)}</nav><Button className="bg-lime-300 text-slate-900 hover:bg-lime-400" onClick={() => setTab('templates')}>Choose Setup</Button></div><div className="overflow-x-auto border-t bg-white px-4 py-2 md:hidden"><div className="flex min-w-max gap-2">{nav.map(([id, label]) => <Button key={id} variant={tab === id ? 'default' : 'outline'} onClick={() => setTab(id)}>{label}</Button>)}</div></div></header><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><section className="mb-10 grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2 text-sm font-medium text-slate-800"><Icon name="spark" className="h-4 w-4" /> Ready-made business setups for WhatsApp selling</div><h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Choose a business setup. Edit the details. Start selling.</h1><p className="mt-5 max-w-2xl text-lg text-slate-600">VulaTrade gives local entrepreneurs ready-made pages, products, WhatsApp messages, follow-ups and customer tracking.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button className="bg-slate-900 text-white" onClick={() => setTab('templates')}>Choose Starter Setup <Icon name="arrow" className="ml-2 h-4 w-4" /></Button><Button variant="outline" onClick={() => setTab('setup')}>Build My Own</Button></div></div><BusinessPreview business={business} products={products} /></section>{tab === 'dashboard' && <section className="space-y-6"><div className="grid gap-4 md:grid-cols-4"><Stat icon="store" label="Business Page" value="Live" /><Stat icon="users" label="Customers" value={customers.length} /><Stat icon="message" label="Open Leads" value={openLeads} /><Stat icon="wallet" label="Tracked Sales" value={money(totalSales)} /></div><div className="grid gap-6 lg:grid-cols-3"><Card className="lg:col-span-2 transition hover:shadow-md"><div className="p-6"><h2 className="text-2xl font-bold">Launch kit</h2><p className="mt-1 text-slate-500">Your setup includes a page, products, message templates and a customer tracker.</p><div className="mt-5 grid gap-4 md:grid-cols-2"><button onClick={() => setTab('templates')} className="rounded-3xl border border-lime-200 bg-lime-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><FeatureIcon type="spark" /><h3 className="text-xl font-bold">Use a Starter Setup</h3><p className="mt-2 text-slate-600">Select a ready-made business template and edit the details.</p></button><button onClick={() => setTab('growth')} className="rounded-3xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><FeatureIcon type="repeat" /><h3 className="text-xl font-bold">Grow My Business</h3><p className="mt-2 text-slate-600">Use follow-ups, reviews, repeat reminders and social posts to grow.</p></button></div></div></Card><Card className="transition hover:shadow-md"><div className="p-6"><h2 className="mb-4 text-xl font-bold">Today’s focus</h2><div className="space-y-3">{[`${followUps} customer follow-up${followUps === 1 ? '' : 's'} due`, 'Ask 2 customers for reviews', 'Post one WhatsApp Status update', 'Check payment status before delivery'].map((item) => <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-lime-600" /><p className="text-sm text-slate-700">{item}</p></div>)}</div></div></Card></div></section>}{tab === 'templates' && <section className="space-y-6"><div><h2 className="text-3xl font-bold">Starter Setups</h2><p className="text-slate-500">Pick a business snapshot. VulaTrade will load the page, products and message templates for you.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{snapshotTemplates.map((template) => <TemplateCard key={template.id} template={template} isActive={template.id === activeTemplateId} onUse={() => applyTemplate(template)} />)}</div><Card><div className="p-6"><h3 className="text-xl font-bold">What a setup includes</h3><div className="mt-4 grid gap-4 md:grid-cols-4">{['Business page', 'Product visuals', 'WhatsApp messages', 'Customer pipeline'].map((item, index) => <div key={item} className="rounded-2xl bg-slate-50 p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-lime-100 font-bold">{index + 1}</div><p className="font-semibold">{item}</p></div>)}</div></div></Card></section>}{tab === 'setup' && <section className="space-y-6"><div><h2 className="text-3xl font-bold">Business Setup</h2><p className="text-slate-500">Edit your selected setup or build your own from scratch.</p></div><div className="grid gap-6 lg:grid-cols-2"><Card className="transition hover:shadow-md"><div className="space-y-4 p-6"><h3 className="text-xl font-bold">Business details</h3><div className="grid gap-4 md:grid-cols-2"><Field label="Business name" value={business.name} onChange={(v) => updateBusiness('name', v)} /><Field label="Owner name" value={business.owner} onChange={(v) => updateBusiness('owner', v)} /><Field label="Category" value={business.category} onChange={(v) => updateBusiness('category', v)} /><Field label="Area served" value={business.area} onChange={(v) => updateBusiness('area', v)} /><Field label="WhatsApp number" value={business.whatsapp} onChange={(v) => updateBusiness('whatsapp', v)} /><Field label="Payment method" value={business.payment} onChange={(v) => updateBusiness('payment', v)} /><SelectField label="Theme" value={business.theme || 'Dark'} onChange={(v) => updateBusiness('theme', v)} options={themeOptions} /><SelectField label="Background style" value={business.backgroundStyle || 'Gradient'} onChange={(v) => updateBusiness('backgroundStyle', v)} options={backgroundOptions} /><SelectField label="Font style" value={business.font || 'Clean'} onChange={(v) => updateBusiness('font', v)} options={fontOptions} /></div><ThemeSwatches business={business} updateBusiness={updateBusiness} /><Field label="WhatsApp catalogue link" value={business.catalogue || ''} onChange={(v) => updateBusiness('catalogue', v)} placeholder="https://wa.me/c/your-number" /></div></Card><Card className="transition hover:shadow-md"><div className="space-y-4 p-6"><h3 className="text-xl font-bold">Products or services</h3><div className="grid gap-4 md:grid-cols-2"><Field label="Product/service" value={newProduct.name} onChange={(v) => setNewProduct((p) => ({ ...p, name: v }))} /><Field label="Price" value={newProduct.price} onChange={(v) => setNewProduct((p) => ({ ...p, price: v }))} /><Field label="Visual / emoji" value={newProduct.image} onChange={(v) => setNewProduct((p) => ({ ...p, image: v }))} /><Field label="Short description" value={newProduct.desc} onChange={(v) => setNewProduct((p) => ({ ...p, desc: v }))} /></div><Button onClick={addProduct}><Icon name="plus" className="mr-2 h-4 w-4" /> Add product/service</Button><div className="grid gap-3 md:grid-cols-2">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div></div></Card></div></section>}{tab === 'page' && <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><Card className="transition hover:shadow-md"><div className="p-6"><h2 className="text-3xl font-bold">My Business Page</h2><p className="mt-2 text-slate-500">Your simple website replacement. Share it on WhatsApp, Facebook, Instagram, TikTok and Google Business Profile.</p><div className="mt-6 space-y-4"><Field label="Business page slug" value={business.slug} onChange={(v) => updateBusiness('slug', slugify(v))} /><div className="rounded-2xl border border-lime-200 bg-lime-50 p-4"><p className="font-semibold">Public link</p><p className="mt-1 text-sm text-slate-600">vulatrade.co.za/b/{business.slug}</p></div><Button>Copy Page Link</Button></div></div></Card><BusinessPreview business={business} products={products} /></section>}{tab === 'customers' && <section className="space-y-6"><div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><h2 className="text-3xl font-bold">Customer Tracker</h2><p className="text-slate-500">Track leads, orders, payments and follow-ups. Drag customers between stages or use the dropdown.</p></div><div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white"><span className="text-slate-300">Pipeline value: </span><strong>{money(totalSales)}</strong></div></div><Card><div className="p-6"><div className="grid gap-4 md:grid-cols-6"><Field label="Name" value={newCustomer.name} onChange={(v) => setNewCustomer((c) => ({ ...c, name: v }))} /><Field label="Phone" value={newCustomer.phone} onChange={(v) => setNewCustomer((c) => ({ ...c, phone: v }))} /><Field label="Interest" value={newCustomer.interest} onChange={(v) => setNewCustomer((c) => ({ ...c, interest: v }))} /><SelectField label="Status" value={newCustomer.status} onChange={(v) => setNewCustomer((c) => ({ ...c, status: v }))} options={statuses} /><Field label="Value" value={newCustomer.value} onChange={(v) => setNewCustomer((c) => ({ ...c, value: v }))} /><div className="flex items-end"><Button className="w-full" onClick={addCustomer}>Add</Button></div></div></div></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{statuses.map((status) => { const stageCustomers = customers.filter((c) => c.status === status); const stageTotal = stageCustomers.reduce((sum, c) => sum + Number(c.value || 0), 0); const config = stageConfig[status] || {}; return <Card key={status} className={`min-h-[290px] transition hover:shadow-md ${config.border || ''}`}><div onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropOnStage(event, status)} className="h-full p-4"><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.badge}`}><Icon name={config.icon} className="h-3.5 w-3.5" />{status}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{stageCustomers.length}</span></div><p className="mt-2 text-xs text-slate-500">Total: <strong>{money(stageTotal)}</strong></p><div className="mt-4 space-y-3">{stageCustomers.length === 0 ? <EmptyStage status={status} /> : stageCustomers.map((c) => <div key={c.id} draggable onDragStart={(event) => startDrag(event, c.id)} className="cursor-grab rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-slate-500">{c.interest} · {money(c.value)}</p>{c.phone && <p className="mt-1 text-xs text-slate-400">{c.phone}</p>}</div><Icon name="users" className="h-4 w-4 text-slate-300" /></div><select value={c.status} onChange={(e) => updateStatus(c.id, e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">{statuses.map((s) => <option key={s}>{s}</option>)}</select></div>)}</div></div></Card>; })}</div></section>}{tab === 'messages' && <section className="space-y-6"><div><h2 className="text-3xl font-bold">Message Templates</h2><p className="text-slate-500">WhatsApp-ready replies, payment requests, review requests and repeat promos.</p></div><div className="grid gap-4 md:grid-cols-2">{templates.map(([title, text]) => <Card key={title} className="transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex h-full min-h-[285px] flex-col p-6"><FeatureIcon type="message" /><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 rounded-2xl bg-slate-100 p-4 text-slate-600">{text}</p><a href={whatsappLink(business.whatsapp, text)} target="_blank" rel="noreferrer" className="mt-auto pt-5"><Button className="bg-lime-300 text-slate-900 hover:bg-lime-400"><Icon name="message" className="mr-2 h-4 w-4" /> Open in WhatsApp</Button></a></div></Card>)}</div></section>}{tab === 'growth' && <section className="space-y-6"><div><h2 className="text-3xl font-bold">Growth Tools</h2><p className="text-slate-500">Capture enquiries, follow up, collect reviews and bring customers back.</p></div><div className="grid gap-4 md:grid-cols-3">{growthTools.map((tool) => <Card key={tool.name} className="transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex h-full flex-col p-6"><FeatureIcon type={tool.type} /><h3 className="text-xl font-bold">{tool.name}</h3><p className="mt-2 flex-1 text-slate-500">{tool.desc}</p><Button variant="outline" className="mt-5 w-full">Open tool</Button></div></Card>)}</div></section>}{tab === 'learn' && <section className="grid gap-6 lg:grid-cols-3"><Card className="lg:col-span-2 transition hover:shadow-md"><div className="p-6"><h2 className="text-3xl font-bold">Business Setup Roadmap</h2><p className="mt-2 text-slate-500">Move from idea to income with simple steps.</p><div className="mt-6 grid gap-4 md:grid-cols-2">{learningSteps.map((item, i) => <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-100 font-bold">{i + 1}</div><div><p className="font-semibold">{item}</p><p className="mt-1 text-sm text-slate-500">Short lesson + checklist</p></div></div>)}</div></div></Card><Card className="transition hover:shadow-md"><div className="p-6"><h3 className="text-xl font-bold">Get Paid Toolkit</h3><p className="mt-2 text-slate-500">Teach users how to receive and track payments safely.</p><div className="mt-5 space-y-3">{['Payment links', 'EFT and cash tracking', 'Payment reminder messages', 'Business banking guidance', 'Supplier payment basics'].map((item) => <div key={item} className="flex gap-3"><Icon name="wallet" className="h-5 w-5 text-lime-700" /><span>{item}</span></div>)}</div></div></Card></section>}</main></div>;
}

createRoot(document.getElementById('root')).render(<VulaTradeApp />);

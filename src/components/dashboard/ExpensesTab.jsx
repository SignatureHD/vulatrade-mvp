import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileCheck, Package, Store, WalletCards } from "lucide-react";
import { DARK, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";
import { appendExpenseToGoogleSheet } from "../../lib/googleWorkspace";

const BRAND = "#ea4c89";

const STANDARD_EXPENSE_CATEGORIES = [
  "Stock", "Airtime", "Data", "Transport", "Rent", "Supplies", "Packaging", "Electricity", "Equipment", "Marketing", "Repairs", "Other",
];

const EXPENSE_PAYMENT_METHODS = ["Cash", "EFT", "Card", "Yoco", "iKhokha", "PayShap", "Other"];
const EXPENSE_PERIODS = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_3_months", label: "Last 3 months" },
];

const EXPENSE_SUGGESTIONS = {
  "Food / Catering": ["Ingredients", "Packaging", "Gas / Electricity", "Transport", "Delivery costs", "Cooking supplies", "Cleaning supplies", "Market stock", "Airtime / Data"],
  "Hair / Beauty / Nails": ["Hair products", "Nail products", "Tools", "Chair rental", "Towels / consumables", "Transport", "Airtime / Data", "Marketing", "Cleaning supplies"],
  "Cleaning Services": ["Cleaning chemicals", "Gloves / PPE", "Transport", "Equipment", "Airtime / Data", "Staff wages", "Uniforms", "Marketing"],
  "Mobile Car Wash": ["Water", "Soap / chemicals", "Cloths / sponges", "Transport", "Equipment", "Airtime / Data", "Marketing"],
  "Clothing / Product Seller": ["Stock", "Packaging", "Courier / delivery", "Transport", "Airtime / Data", "Marketing", "Returns / exchanges"],
  "Repairs / Home Services": ["Parts", "Tools", "Transport", "Airtime / Data", "Equipment", "Marketing", "Call-out costs"],
  "General Business": ["Stock", "Airtime", "Data", "Transport", "Supplies", "Marketing", "Rent", "Other"],
};

function todayInputValue() { return new Date().toISOString().slice(0, 10); }
function businessTypeFromCategory(category = "") {
  const c = category.toLowerCase();
  if (/(food|catering|fresh produce|kasi kitchen|kitchen|vendor)/.test(c)) return "Food / Catering";
  if (/(nail|hair|barber|beauty|extension)/.test(c)) return "Hair / Beauty / Nails";
  if (/clean/.test(c)) return "Cleaning Services";
  if (/car wash/.test(c)) return "Mobile Car Wash";
  if (/(clothing|retail|product seller|seller)/.test(c)) return "Clothing / Product Seller";
  if (/(repair|phone repair|home repair)/.test(c)) return "Repairs / Home Services";
  return "General Business";
}
function productName(products, id) { return id ? (products.find((product) => product.id === id)?.name || "Linked product") : ""; }
function expenseDateValue(expense) { return expense.expense_date || expense.created_at?.slice(0, 10) || todayInputValue(); }
function monthStart(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function addMonths(date, amount) { return new Date(date.getFullYear(), date.getMonth() + amount, 1); }
function toInputDate(date) { return date.toISOString().slice(0, 10); }
function formatRand(value) { return `R${Number(value || 0).toLocaleString()}`; }
function totalAmount(rows = []) { return rows.reduce((sum, expense) => sum + Number(expense.amount || 0), 0); }

function periodRange(period) {
  const now = new Date();
  const thisMonthStart = monthStart(now);
  if (period === "last_month") {
    const start = addMonths(thisMonthStart, -1);
    return { start: toInputDate(start), end: toInputDate(thisMonthStart), label: start.toLocaleDateString("en-ZA", { month:"long", year:"numeric" }) };
  }
  if (period === "last_3_months") {
    const start = addMonths(thisMonthStart, -2);
    const end = addMonths(thisMonthStart, 1);
    return { start: toInputDate(start), end: toInputDate(end), label: `${start.toLocaleDateString("en-ZA", { month:"short" })} - ${now.toLocaleDateString("en-ZA", { month:"short", year:"numeric" })}` };
  }
  return { start: toInputDate(thisMonthStart), end: toInputDate(addMonths(thisMonthStart, 1)), label: now.toLocaleDateString("en-ZA", { month:"long", year:"numeric" }) };
}
function previousPeriodRange(period, activeRange) {
  const startDate = new Date(`${activeRange.start}T00:00:00`);
  const endDate = new Date(`${activeRange.end}T00:00:00`);
  const months = period === "last_3_months" ? 3 : 1;
  const start = addMonths(startDate, -months);
  const end = addMonths(endDate, -months);
  return { start: toInputDate(start), end: toInputDate(end), label: start.toLocaleDateString("en-ZA", { month:"long", year:"numeric" }) };
}
function expenseInPeriod(expense, range) {
  const value = expenseDateValue(expense);
  return value >= range.start && value < range.end;
}
function categoryTotals(rows = []) {
  return rows.reduce((map, expense) => {
    const key = expense.category || "Other";
    map[key] = (map[key] || 0) + Number(expense.amount || 0);
    return map;
  }, {});
}
function categoryComparison(currentRows = [], previousRows = []) {
  const current = categoryTotals(currentRows);
  const previous = categoryTotals(previousRows);
  const keys = Array.from(new Set([...Object.keys(current), ...Object.keys(previous)]));
  return keys.map((category) => {
    const currentAmount = current[category] || 0;
    const previousAmount = previous[category] || 0;
    return { category, currentAmount, previousAmount, difference: currentAmount - previousAmount };
  }).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}
function supplierSummary(rows = []) {
  const suppliers = rows.reduce((map, expense) => {
    const supplier = (expense.supplier_name || "").trim();
    if (!supplier) return map;
    if (!map[supplier]) map[supplier] = { name:supplier, total:0, count:0, lastDate:null, categories:new Set(), items:new Set() };
    map[supplier].total += Number(expense.amount || 0);
    map[supplier].count += 1;
    if (expense.category) map[supplier].categories.add(expense.category);
    if (expense.name) map[supplier].items.add(expense.name);
    const date = expenseDateValue(expense);
    if (!map[supplier].lastDate || date > map[supplier].lastDate) map[supplier].lastDate = date;
    return map;
  }, {});
  return Object.values(suppliers).map((supplier) => ({ ...supplier, categories:Array.from(supplier.categories), items:Array.from(supplier.items) })).sort((a, b) => b.total - a.total);
}
function comparisonMessage(totalCurrent, totalPrevious, periodLabel, previousLabel) {
  const diff = totalCurrent - totalPrevious;
  if (totalCurrent === 0 && totalPrevious === 0) return `No expenses recorded for ${periodLabel} or ${previousLabel} yet.`;
  if (diff > 0) return `Expenses are up by ${formatRand(diff)} compared with ${previousLabel}. Check which category increased before changing prices.`;
  if (diff < 0) return `Expenses are down by ${formatRand(Math.abs(diff))} compared with ${previousLabel}. Good sign if sales stayed the same or improved.`;
  return `Expenses are the same as ${previousLabel}.`;
}
function addStageOneDetailsToNotes(expense) {
  const lines = [];
  if (expense.supplier.trim()) lines.push(`Bought from: ${expense.supplier.trim()}`);
  if (expense.productName) lines.push(`Linked product: ${expense.productName}`);
  if (expense.receiptUrl.trim()) lines.push(`Receipt/photo: ${expense.receiptUrl.trim()}`);
  if (expense.notes.trim()) lines.push(expense.notes.trim());
  return lines.join("\n");
}

function AccordionSection({ title, subtitle, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", marginBottom:"14px", overflow:"hidden" }}>
      <button type="button" onClick={() => setOpen((value) => !value)} style={{ width:"100%", border:"none", background:"transparent", padding:"16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", cursor:"pointer", textAlign:"left" }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>{title}</div>
          {subtitle && <div style={{ fontSize:"12px", color:"#888", marginTop:"3px", lineHeight:1.35 }}>{subtitle}</div>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
          {badge && <span style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"999px", padding:"7px 10px", fontSize:"12px", fontWeight:900, color:DARK }}>{badge}</span>}
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>
      {open && <div style={{ padding:"0 16px 16px" }}>{children}</div>}
    </div>
  );
}

function ExpenseFormModal({ initialCategory, products = [], onSave, onClose, saving = false }) {
  const [form, setForm] = useState({ name:"", amount:"", category:initialCategory || "", date:todayInputValue(), method:"Cash", supplier:"", linkedProductId:"", receiptUrl:"", notes:"" });
  const [error, setError] = useState("");
  function update(key, value) { setForm((prev) => ({ ...prev, [key]: value })); setError(""); }
  function save() {
    const amount = parseFloat(form.amount);
    if (!form.name.trim()) { setError("Expense name is required."); return; }
    if (!amount || amount <= 0) { setError("Amount must be greater than 0."); return; }
    if (!form.category.trim()) { setError("Category is required."); return; }
    onSave({ ...form, amount, productName: productName(products, form.linkedProductId) });
  }
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(32,32,33,0.48)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"18px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"22px", width:"100%", maxWidth:"620px", boxShadow:"0 24px 70px rgba(32,32,33,0.25)", maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:"12px", marginBottom:"18px" }}>
          <div><h3 style={{ fontSize:"19px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Add Expense</h3><p style={{ fontSize:"12px", color:"#888" }}>Record what you bought and what it was for.</p></div>
          <button onClick={onClose} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #eeeeea", background:"#fff", color:"#767b81", fontSize:"18px", cursor:"pointer" }}>x</button>
        </div>
        {error && <div style={{ background:"#fff5f5", border:"1px solid #ffd0d0", color:"#cc3300", borderRadius:"12px", padding:"10px 12px", fontSize:"13px", marginBottom:"14px" }}>{error}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))", gap:"12px", marginBottom:"14px" }}>
          <div><label style={labelStyle}>Expense name</label><input style={inputStyle} placeholder="e.g. Eggs, bags, delivery" value={form.name} onChange={(event) => update("name", event.target.value)} autoFocus /></div>
          <div><label style={labelStyle}>Amount (R)</label><input style={inputStyle} type="number" min="0" placeholder="0" value={form.amount} onChange={(event) => update("amount", event.target.value)} /></div>
          <div><label style={labelStyle}>Category</label><input style={inputStyle} placeholder="e.g. Ingredients" value={form.category} onChange={(event) => update("category", event.target.value)} /></div>
          <div><label style={labelStyle}>Date</label><input style={inputStyle} type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></div>
          <div><label style={labelStyle}>Payment method</label><select style={{ ...inputStyle, cursor:"pointer" }} value={form.method} onChange={(event) => update("method", event.target.value)}>{EXPENSE_PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}</select></div>
          <div><label style={labelStyle}>Bought from / supplier</label><input style={inputStyle} placeholder="e.g. Boxer, spaza" value={form.supplier} onChange={(event) => update("supplier", event.target.value)} /></div>
          <div><label style={labelStyle}>Linked product / service</label><select style={{ ...inputStyle, cursor:"pointer" }} value={form.linkedProductId} onChange={(event) => update("linkedProductId", event.target.value)}><option value="">Not linked</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div>
          <div><label style={labelStyle}>Receipt/photo link</label><input style={inputStyle} placeholder="Optional" value={form.receiptUrl} onChange={(event) => update("receiptUrl", event.target.value)} /></div>
        </div>
        <div style={{ marginBottom:"16px" }}><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, minHeight:"78px", resize:"vertical" }} placeholder="Optional details" value={form.notes} onChange={(event) => update("notes", event.target.value)} /></div>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          <button onClick={save} disabled={saving} style={{ flex:"1 1 180px", background:BRAND, color:"#fff", border:"none", borderRadius:"12px", padding:"13px 18px", fontSize:"14px", fontWeight:900, cursor:saving?"not-allowed":"pointer", opacity:saving?0.72:1 }}>{saving ? "Saving..." : "Save Expense"}</button>
          <button onClick={onClose} disabled={saving} style={{ flex:"1 1 120px", background:"#fff", color:"#555", border:"1.5px solid #e0e0e0", borderRadius:"12px", padding:"13px 18px", fontSize:"14px", fontWeight:800, cursor:saving?"not-allowed":"pointer", opacity:saving?0.72:1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function ExpensesTab({ business }) {
  const businessType = businessTypeFromCategory(business?.category);
  const suggestedCategories = EXPENSE_SUGGESTIONS[businessType] || EXPENSE_SUGGESTIONS["General Business"];
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [period, setPeriod] = useState("this_month");
  const [modalCategory, setModalCategory] = useState(null);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [savingExpense, setSavingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState("");
  const [toast, setToast] = useState("");

  const categories = useMemo(() => Array.from(new Set([...suggestedCategories, ...STANDARD_EXPENSE_CATEGORIES])), [suggestedCategories]);
  const activeRange = useMemo(() => periodRange(period), [period]);
  const previousRange = useMemo(() => previousPeriodRange(period, activeRange), [period, activeRange]);
  const filteredExpenses = useMemo(() => expenses.filter((expense) => expenseInPeriod(expense, activeRange)), [expenses, activeRange]);
  const previousExpenses = useMemo(() => expenses.filter((expense) => expenseInPeriod(expense, previousRange)), [expenses, previousRange]);
  const totalExpenses = totalAmount(filteredExpenses);
  const previousTotalExpenses = totalAmount(previousExpenses);
  const totalDifference = totalExpenses - previousTotalExpenses;
  const comparisonRows = useMemo(() => categoryComparison(filteredExpenses, previousExpenses), [filteredExpenses, previousExpenses]);
  const supplierRows = useMemo(() => supplierSummary(filteredExpenses), [filteredExpenses]);
  const filteredCategoryCount = new Set(filteredExpenses.map((expense) => expense.category).filter(Boolean)).size;
  const topCategory = comparisonRows.filter((row) => row.currentAmount > 0).sort((a, b) => b.currentAmount - a.currentAmount)[0];

  async function loadExpenses() {
    if (!business?.id) { setExpenses([]); setProducts([]); setLoadingExpenses(false); return; }
    setLoadingExpenses(true); setExpenseError("");
    const [{ data: expenseRows, error: expenseLoadError }, { data: productRows }] = await Promise.all([
      supabase.from("expenses").select("*").eq("business_id", business.id).order("expense_date", { ascending:false }),
      supabase.from("products").select("id,name").eq("business_id", business.id).order("name"),
    ]);
    if (expenseLoadError) { console.error("Load expenses:", expenseLoadError); setExpenseError("Expenses could not be loaded. Please refresh and try again."); setExpenses([]); } else { setExpenses(expenseRows || []); }
    setProducts(productRows || []); setLoadingExpenses(false);
  }
  useEffect(() => { loadExpenses(); }, [business?.id]);
  function openForm(category = "") { setModalCategory(category); }

  async function insertExpense(payload, legacyPayload) {
    const { data, error } = await supabase.from("expenses").insert([payload]).select().single();
    if (!error) return { data, error:null };
    const message = `${error.message || ""} ${error.details || ""}`.toLowerCase();
    const missingStageOneColumn = message.includes("supplier_name") || message.includes("linked_product_id") || message.includes("receipt_url") || message.includes("schema cache");
    if (!missingStageOneColumn) return { data:null, error };
    const fallback = await supabase.from("expenses").insert([legacyPayload]).select().single();
    return fallback.error ? { data:null, error:fallback.error } : { data:fallback.data, error:null };
  }

  async function handleSaveExpense(expense) {
    if (!business?.id) { setExpenseError("Create your business profile before adding expenses."); return; }
    setSavingExpense(true); setExpenseError("");
    const stageOneNotes = addStageOneDetailsToNotes(expense);
    const basePayload = { business_id:business.id, name:expense.name.trim(), amount:expense.amount, category:expense.category.trim(), expense_date:expense.date, payment_method:expense.method, notes:expense.notes.trim() || null };
    const payload = { ...basePayload, supplier_name:expense.supplier.trim() || null, linked_product_id:expense.linkedProductId || null, receipt_url:expense.receiptUrl.trim() || null };
    const legacyPayload = { ...basePayload, notes:stageOneNotes || null };
    const { data, error } = await insertExpense(payload, legacyPayload);
    if (error) { console.error("Save expense:", error); setExpenseError("Expense could not be saved. Please check the details and try again."); setSavingExpense(false); return; }

    let syncedToGoogle = false;

    try {
      const { data: workspace, error: workspaceError } = await supabase
        .from("business_workspaces")
        .select("google_spreadsheet_id")
        .eq("business_id", business.id)
        .maybeSingle();

      if (!workspaceError && workspace?.google_spreadsheet_id) {
        const linkedProduct = products.find((product) => product.id === data.linked_product_id);

        await appendExpenseToGoogleSheet(workspace.google_spreadsheet_id, {
          ...data,
          linked_product_name: linkedProduct?.name || "",
        });

        syncedToGoogle = true;
      }
    } catch (syncError) {
      console.error("Google expense sync:", syncError);
    }

    setExpenses((prev) => [data, ...prev]);
    setModalCategory(null);
    setToast(syncedToGoogle ? "Expense saved and synced to Google Sheets." : "Expense saved.");
    setTimeout(() => setToast(""), 2800);
    setSavingExpense(false);
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <div><h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Expenses</h2><p style={{ fontSize:"13px", color:"#aaa" }}>Costs going out: stock, airtime, transport, rent and supplies.</p></div>
        <button onClick={() => openForm()} style={{ backgroundColor:BRAND, color:"#fff", border:"none", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>Add Expense</button>
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"18px", padding:"18px", marginBottom:"16px", display:"flex", alignItems:"flex-start", gap:"14px" }}>
        <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><FileCheck size={19} strokeWidth={2.2} color={BRAND} /></span>
        <div><div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Expenses help show what your business really costs.</div><div style={{ fontSize:"13px", color:"#777", lineHeight:1.55 }}>Track the important numbers first. Open the detail sections when you need more.</div></div>
      </div>

      {expenseError && <div style={{ background:"#fff5f5", border:"1px solid #ffd0d0", color:"#cc3300", borderRadius:"14px", padding:"12px 14px", fontSize:"13px", fontWeight:700, marginBottom:"16px" }}>{expenseError}</div>}

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"18px", padding:"14px", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", flexWrap:"wrap" }}>
          <div><div style={{ fontSize:"13px", fontWeight:900, color:DARK }}>Showing {activeRange.label}</div><div style={{ fontSize:"11px", color:"#888", marginTop:"2px" }}>Change the period to compare costs.</div></div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>{EXPENSE_PERIODS.map((item) => { const active = period === item.value; return <button key={item.value} type="button" onClick={() => setPeriod(item.value)} style={{ border:`1.5px solid ${active ? BRAND : "#eeeeea"}`, background:active ? BRAND : "#fff", color:active ? "#fff" : "#555", borderRadius:"999px", padding:"9px 12px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>{item.label}</button>; })}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(145px, 1fr))", gap:"10px", marginBottom:"14px" }}>
        {[
          { label:"Total expenses", value:formatRand(totalExpenses) },
          { label:"Biggest cost", value:topCategory ? `${topCategory.category} ${formatRand(topCategory.currentAmount)}` : "None" },
          { label:"Categories", value:filteredCategoryCount || "None" },
          { label:"Vs previous", value:`${totalDifference > 0 ? "+" : totalDifference < 0 ? "-" : ""}${formatRand(Math.abs(totalDifference))}` },
        ].map((item) => <div key={item.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px" }}><div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{item.label}</div><div style={{ fontSize:"18px", fontWeight:900, color:DARK, lineHeight:1.2 }}>{item.value}</div></div>)}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px", marginBottom:"14px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", marginBottom:"12px" }}><div><div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>Top expense categories</div><div style={{ fontSize:"12px", color:"#888", marginTop:"3px" }}>Your biggest costs for {activeRange.label}.</div></div></div>
        {comparisonRows.filter((row) => row.currentAmount > 0).length === 0 ? <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px", fontSize:"13px", color:"#777" }}>No expenses recorded for this period yet.</div> : <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>{comparisonRows.filter((row) => row.currentAmount > 0).sort((a, b) => b.currentAmount - a.currentAmount).slice(0, 5).map((row) => <div key={row.category} style={{ display:"flex", justifyContent:"space-between", gap:"10px", border:"1px solid #eeeeea", borderRadius:"12px", padding:"11px 12px" }}><div style={{ fontSize:"13px", fontWeight:900, color:DARK }}>{row.category}</div><div style={{ fontSize:"13px", fontWeight:900, color:DARK }}>{formatRand(row.currentAmount)}</div></div>)}</div>}
      </div>

      <AccordionSection title="Expense comparison" subtitle={`${activeRange.label} compared with ${previousRange.label}`} badge={`${totalDifference > 0 ? "+" : totalDifference < 0 ? "-" : ""}${formatRand(Math.abs(totalDifference))}`}>
        <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"14px", padding:"12px", fontSize:"13px", color:"#666", lineHeight:1.55, marginBottom:"12px" }}>{comparisonMessage(totalExpenses, previousTotalExpenses, activeRange.label, previousRange.label)}</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:"10px", marginBottom:"12px" }}>{[{ label:"Current", value:formatRand(totalExpenses) }, { label:"Previous", value:formatRand(previousTotalExpenses) }, { label:"Difference", value:`${totalDifference > 0 ? "+" : totalDifference < 0 ? "-" : ""}${formatRand(Math.abs(totalDifference))}` }].map((item) => <div key={item.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"12px" }}><div style={{ fontSize:"10px", color:"#aaa", fontWeight:800, textTransform:"uppercase", marginBottom:"5px" }}>{item.label}</div><div style={{ fontSize:"17px", fontWeight:900, color:DARK }}>{item.value}</div></div>)}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>{comparisonRows.slice(0, 5).map((row) => <div key={row.category} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"10px", border:"1px solid #eeeeea", borderRadius:"12px", padding:"11px 12px" }}><div><div style={{ fontSize:"13px", fontWeight:900, color:DARK }}>{row.category}</div><div style={{ fontSize:"11px", color:"#888", marginTop:"2px" }}>{formatRand(row.currentAmount)} now · {formatRand(row.previousAmount)} before</div></div><div style={{ fontSize:"12px", fontWeight:900, color:row.difference > 0 ? "#b7791f" : row.difference < 0 ? "#2f855a" : "#888" }}>{row.difference > 0 ? "+" : row.difference < 0 ? "-" : ""}{formatRand(Math.abs(row.difference))}</div></div>)}</div>
      </AccordionSection>

      <AccordionSection title="Suppliers" subtitle={`Who you bought from in ${activeRange.label}.`} badge={`${supplierRows.length} supplier${supplierRows.length === 1 ? "" : "s"}`}>
        {supplierRows.length === 0 ? <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px", fontSize:"13px", color:"#777" }}>No suppliers recorded for this period yet. Add “Bought from / supplier” when saving an expense.</div> : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:"10px" }}>{supplierRows.slice(0, 6).map((supplier) => <div key={supplier.name} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px" }}><div style={{ display:"flex", alignItems:"center", gap:"10px" }}><span style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}><Store size={17} strokeWidth={2.2} color={BRAND} /></span><div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>{supplier.name}</div><div style={{ fontSize:"11px", color:"#888", marginTop:"2px" }}>{supplier.count} purchase{supplier.count === 1 ? "" : "s"}</div></div><div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>{formatRand(supplier.total)}</div></div></div>)}</div>}
      </AccordionSection>

      <AccordionSection title="Suggested for your business" subtitle={`${businessType} expense ideas. Tap one to quick add.`} badge={`${suggestedCategories.length} ideas`}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>{suggestedCategories.map((category) => <button key={category} onClick={() => openForm(category)} style={{ border:"1.5px solid #f8b8d2", background:"#fff5f9", color:"#d93f7b", borderRadius:"999px", padding:"9px 13px", fontSize:"12px", fontWeight:800, cursor:"pointer" }}>{category}</button>)}</div>
      </AccordionSection>

      <AccordionSection title="All categories" subtitle="Tap a category to add an expense quickly." badge={`${categories.length} categories`}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px" }}>{categories.map((category) => <button key={category} onClick={() => openForm(category)} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", textAlign:"left" }}><span style={{ width:"34px", height:"34px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}><WalletCards size={16} strokeWidth={2.2} color={BRAND} /></span><span style={{ fontSize:"13px", fontWeight:800, color:DARK }}>{category}</span></button>)}</div>
      </AccordionSection>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", flexWrap:"wrap", marginBottom:"10px" }}><div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>Recent expenses</div><div style={{ fontSize:"12px", color:"#888", fontWeight:700 }}>{activeRange.label}</div></div>
        {loadingExpenses ? <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"24px", textAlign:"center", color:"#888", fontSize:"13px" }}>Loading expenses...</div> : filteredExpenses.length === 0 ? <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"24px", textAlign:"center", color:"#888", fontSize:"13px" }}>No expenses recorded for this period.</div> : <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>{filteredExpenses.map((expense) => { const linkedProductName = productName(products, expense.linked_product_id); return <div key={expense.id} style={{ display:"flex", alignItems:"center", gap:"12px", border:"1px solid #eeeeea", borderRadius:"14px", padding:"13px 14px" }}><span style={{ width:"38px", height:"38px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><WalletCards size={17} strokeWidth={2.2} color={BRAND} /></span><div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>{expense.name}</div><div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>{expense.category} · {expense.payment_method || "Other"} · {new Date(expenseDateValue(expense) + "T00:00:00").toLocaleDateString("en-ZA", { day:"numeric", month:"short" })}</div>{(expense.supplier_name || linkedProductName) && <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginTop:"6px" }}>{expense.supplier_name && <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontSize:"11px", color:"#777", background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"999px", padding:"4px 7px" }}><Store size={12} /> {expense.supplier_name}</span>}{linkedProductName && <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontSize:"11px", color:"#777", background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"999px", padding:"4px 7px" }}><Package size={12} /> {linkedProductName}</span>}</div>}</div><div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>{formatRand(expense.amount)}</div></div>; })}</div>}
      </div>

      {modalCategory !== null && <ExpenseFormModal initialCategory={modalCategory} products={products} onSave={handleSaveExpense} onClose={() => setModalCategory(null)} saving={savingExpense} />}
      {toast && <div style={{ position:"fixed", bottom:"86px", left:"50%", transform:"translateX(-50%)", background:DARK, color:"#fff", padding:"12px 20px", borderRadius:"999px", fontSize:"13px", fontWeight:800, zIndex:2000, boxShadow:"0 10px 30px rgba(32,32,33,0.2)", whiteSpace:"nowrap" }}>{toast}</div>}
    </div>
  );
}

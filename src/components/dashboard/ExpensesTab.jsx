import React, { useEffect, useMemo, useState } from "react";
import { FileCheck, Package, Store, WalletCards } from "lucide-react";
import { DARK, inputStyle, labelStyle } from "../../constants";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";

const STANDARD_EXPENSE_CATEGORIES = [
  "Stock",
  "Airtime",
  "Data",
  "Transport",
  "Rent",
  "Supplies",
  "Packaging",
  "Electricity",
  "Equipment",
  "Marketing",
  "Repairs",
  "Other",
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

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

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

function productName(products, id) {
  if (!id) return "";
  return products.find((product) => product.id === id)?.name || "Linked product";
}

function expenseDateValue(expense) {
  return expense.expense_date || expense.created_at?.slice(0, 10) || todayInputValue();
}

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function toInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function periodRange(period) {
  const now = new Date();
  const thisMonthStart = monthStart(now);
  if (period === "last_month") {
    const start = addMonths(thisMonthStart, -1);
    const end = thisMonthStart;
    return { start: toInputDate(start), end: toInputDate(end), label: start.toLocaleDateString("en-ZA", { month:"long", year:"numeric" }) };
  }
  if (period === "last_3_months") {
    const start = addMonths(thisMonthStart, -2);
    const end = addMonths(thisMonthStart, 1);
    return { start: toInputDate(start), end: toInputDate(end), label: `${start.toLocaleDateString("en-ZA", { month:"short" })} - ${now.toLocaleDateString("en-ZA", { month:"short", year:"numeric" })}` };
  }
  const end = addMonths(thisMonthStart, 1);
  return { start: toInputDate(thisMonthStart), end: toInputDate(end), label: now.toLocaleDateString("en-ZA", { month:"long", year:"numeric" }) };
}

function previousPeriodRange(period, activeRange) {
  const startDate = new Date(`${activeRange.start}T00:00:00`);
  const endDate = new Date(`${activeRange.end}T00:00:00`);
  const months = period === "last_3_months" ? 3 : 1;
  const start = addMonths(startDate, -months);
  const end = addMonths(endDate, -months);
  return {
    start: toInputDate(start),
    end: toInputDate(end),
    label: months === 3
      ? `${start.toLocaleDateString("en-ZA", { month:"short" })} - ${addMonths(end, -1).toLocaleDateString("en-ZA", { month:"short", year:"numeric" })}`
      : start.toLocaleDateString("en-ZA", { month:"long", year:"numeric" }),
  };
}

function expenseInPeriod(expense, range) {
  const value = expenseDateValue(expense);
  return value >= range.start && value < range.end;
}

function totalAmount(rows = []) {
  return rows.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function formatRand(value) {
  return `R${Number(value || 0).toLocaleString()}`;
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
    const difference = currentAmount - previousAmount;
    return { category, currentAmount, previousAmount, difference };
  }).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}

function supplierSummary(rows = []) {
  const suppliers = rows.reduce((map, expense) => {
    const supplier = (expense.supplier_name || "").trim();
    if (!supplier) return map;
    if (!map[supplier]) {
      map[supplier] = {
        name: supplier,
        total: 0,
        count: 0,
        lastDate: null,
        categories: new Set(),
        items: new Set(),
      };
    }
    const entry = map[supplier];
    entry.total += Number(expense.amount || 0);
    entry.count += 1;
    if (expense.category) entry.categories.add(expense.category);
    if (expense.name) entry.items.add(expense.name);
    const date = expenseDateValue(expense);
    if (!entry.lastDate || date > entry.lastDate) entry.lastDate = date;
    return map;
  }, {});

  return Object.values(suppliers)
    .map((supplier) => ({
      ...supplier,
      categories: Array.from(supplier.categories),
      items: Array.from(supplier.items),
    }))
    .sort((a, b) => b.total - a.total);
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

function ExpenseFormModal({ initialCategory, products = [], onSave, onClose, saving = false }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: initialCategory || "",
    date: todayInputValue(),
    method: "Cash",
    supplier: "",
    linkedProductId: "",
    receiptUrl: "",
    notes: "",
  });
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function save() {
    const amount = parseFloat(form.amount);
    if (!form.name.trim()) { setError("Expense name is required."); return; }
    if (!amount || amount <= 0) { setError("Amount must be greater than 0."); return; }
    if (!form.category.trim()) { setError("Category is required."); return; }
    const selectedProductName = productName(products, form.linkedProductId);
    onSave({ ...form, amount, productName: selectedProductName });
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(32,32,33,0.48)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"18px" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"22px", width:"100%", maxWidth:"620px", boxShadow:"0 24px 70px rgba(32,32,33,0.25)", maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", marginBottom:"18px" }}>
          <div>
            <h3 style={{ fontSize:"19px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Add Expense</h3>
            <p style={{ fontSize:"12px", color:"#888" }}>Record what you bought, who you bought from, and what it was for.</p>
          </div>
          <button onClick={onClose} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #eeeeea", background:"#fff", color:"#767b81", fontSize:"18px", cursor:"pointer" }}>×</button>
        </div>

        {error && <div style={{ background:"#fff5f5", border:"1px solid #ffd0d0", color:"#cc3300", borderRadius:"12px", padding:"10px 12px", fontSize:"13px", marginBottom:"14px" }}>{error}</div>}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))", gap:"12px", marginBottom:"14px" }}>
          <div>
            <label style={labelStyle}>Expense name</label>
            <input style={inputStyle} placeholder="e.g. Eggs, carrier bags, delivery" value={form.name} onChange={(e) => update("name", e.target.value)} autoFocus />
          </div>
          <div>
            <label style={labelStyle}>Amount (R)</label>
            <input style={inputStyle} type="number" min="0" placeholder="0" value={form.amount} onChange={(e) => update("amount", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <input style={inputStyle} placeholder="e.g. Ingredients" value={form.category} onChange={(e) => update("category", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input style={inputStyle} type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Payment method</label>
            <select style={{ ...inputStyle, cursor:"pointer" }} value={form.method} onChange={(e) => update("method", e.target.value)}>
              {EXPENSE_PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Bought from / supplier</label>
            <input style={inputStyle} placeholder="e.g. Boxer, spaza, Mama Thandi" value={form.supplier} onChange={(e) => update("supplier", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Linked product / service</label>
            <select style={{ ...inputStyle, cursor:"pointer" }} value={form.linkedProductId} onChange={(e) => update("linkedProductId", e.target.value)}>
              <option value="">Not linked</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Receipt/photo link</label>
            <input style={inputStyle} placeholder="Optional Drive/photo link" value={form.receiptUrl} onChange={(e) => update("receiptUrl", e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom:"16px" }}>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...inputStyle, minHeight:"78px", resize:"vertical" }} placeholder="Optional details, quantities, or why you bought it" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>

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
  const supplierCount = supplierRows.length;
  const filteredCategoryCount = new Set(filteredExpenses.map((expense) => expense.category).filter(Boolean)).size;

  async function loadExpenses() {
    if (!business?.id) {
      setExpenses([]);
      setProducts([]);
      setLoadingExpenses(false);
      return;
    }
    setLoadingExpenses(true);
    setExpenseError("");

    const [{ data: expenseRows, error: expenseLoadError }, { data: productRows }] = await Promise.all([
      supabase.from("expenses").select("*").eq("business_id", business.id).order("expense_date", { ascending: false }),
      supabase.from("products").select("id,name").eq("business_id", business.id).order("name"),
    ]);

    if (expenseLoadError) {
      console.error("Load expenses:", expenseLoadError);
      setExpenseError("Expenses could not be loaded. Please refresh and try again.");
      setExpenses([]);
    } else {
      setExpenses(expenseRows || []);
    }
    setProducts(productRows || []);
    setLoadingExpenses(false);
  }

  useEffect(() => {
    loadExpenses();
  }, [business?.id]);

  function openForm(category = "") {
    setModalCategory(category);
  }

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
    if (!business?.id) {
      setExpenseError("Create your business profile before adding expenses.");
      return;
    }
    setSavingExpense(true);
    setExpenseError("");

    const stageOneNotes = addStageOneDetailsToNotes(expense);
    const basePayload = {
      business_id: business.id,
      name: expense.name.trim(),
      amount: expense.amount,
      category: expense.category.trim(),
      expense_date: expense.date,
      payment_method: expense.method,
      notes: expense.notes.trim() || null,
    };
    const payload = {
      ...basePayload,
      supplier_name: expense.supplier.trim() || null,
      linked_product_id: expense.linkedProductId || null,
      receipt_url: expense.receiptUrl.trim() || null,
      notes: expense.notes.trim() || null,
    };
    const legacyPayload = {
      ...basePayload,
      notes: stageOneNotes || null,
    };

    const { data, error } = await insertExpense(payload, legacyPayload);

    if (error) {
      console.error("Save expense:", error);
      setExpenseError("Expense could not be saved. Please check the details and try again.");
      setSavingExpense(false);
      return;
    }

    setExpenses((prev) => [data, ...prev]);
    setModalCategory(null);
    setToast("Expense saved. Supplier and product details are now easier to track.");
    setTimeout(() => setToast(""), 2800);
    setSavingExpense(false);
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <div>
          <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Expenses</h2>
          <p style={{ fontSize:"13px", color:"#aaa" }}>Costs going out: stock, airtime, data, transport, rent and supplies.</p>
        </div>
        <button onClick={() => openForm()} style={{ backgroundColor:BRAND, color:"#fff", border:"none", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>
          Add Expense
        </button>
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"18px", padding:"18px", marginBottom:"20px", display:"flex", alignItems:"flex-start", gap:"14px" }}>
        <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <FileCheck size={19} strokeWidth={2.2} color={BRAND} />
        </span>
        <div>
          <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Expenses help show what your business really costs.</div>
          <div style={{ fontSize:"13px", color:"#777", lineHeight:1.55 }}>Tracking what you bought, who supplied it and which product it supported strengthens your Business File over time.</div>
        </div>
      </div>

      {expenseError && (
        <div style={{ background:"#fff5f5", border:"1px solid #ffd0d0", color:"#cc3300", borderRadius:"14px", padding:"12px 14px", fontSize:"13px", fontWeight:700, marginBottom:"20px" }}>
          {expenseError}
        </div>
      )}

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"18px", padding:"14px", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:"13px", fontWeight:900, color:DARK }}>Showing {activeRange.label}</div>
            <div style={{ fontSize:"11px", color:"#888", marginTop:"2px" }}>Totals and recent expenses update when you change the period.</div>
          </div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {EXPENSE_PERIODS.map((item) => {
              const active = period === item.value;
              return (
                <button key={item.value} type="button" onClick={() => setPeriod(item.value)}
                  style={{ border:`1.5px solid ${active ? BRAND : "#eeeeea"}`, background:active ? BRAND : "#fff", color:active ? "#fff" : "#555", borderRadius:"999px", padding:"9px 12px", fontSize:"12px", fontWeight:900, cursor:"pointer" }}>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Total expenses", value:formatRand(totalExpenses) },
          { label:"Categories used", value:filteredCategoryCount || "None" },
          { label:"Suppliers", value:supplierCount || "Add" },
          { label:"Period expenses", value:filteredExpenses.length },
        ].map((s) => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px" }}>
            <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>{s.label}</div>
            <div style={{ fontSize:"22px", fontWeight:900, color:DARK }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", flexWrap:"wrap", marginBottom:"12px" }}>
          <div>
            <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Expense comparison</div>
            <div style={{ fontSize:"12px", color:"#888" }}>{activeRange.label} compared with {previousRange.label}</div>
          </div>
          <div style={{ background: totalDifference > 0 ? "#fff8e7" : totalDifference < 0 ? "#f0fff4" : "#fbfbfb", border:"1px solid #eeeeea", borderRadius:"999px", padding:"8px 11px", fontSize:"12px", fontWeight:900, color:DARK }}>
            {totalDifference > 0 ? "+" : totalDifference < 0 ? "-" : ""}{formatRand(Math.abs(totalDifference))}
          </div>
        </div>
        <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"14px", padding:"12px", fontSize:"13px", color:"#666", lineHeight:1.55, marginBottom:"12px" }}>
          {comparisonMessage(totalExpenses, previousTotalExpenses, activeRange.label, previousRange.label)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px", marginBottom:"12px" }}>
          {[
            { label:"Current period", value:formatRand(totalExpenses) },
            { label:"Previous period", value:formatRand(previousTotalExpenses) },
            { label:"Difference", value:`${totalDifference > 0 ? "+" : totalDifference < 0 ? "-" : ""}${formatRand(Math.abs(totalDifference))}` },
          ].map((item) => (
            <div key={item.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"14px", padding:"12px" }}>
              <div style={{ fontSize:"10px", color:"#aaa", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"5px" }}>{item.label}</div>
              <div style={{ fontSize:"17px", fontWeight:900, color:DARK }}>{item.value}</div>
            </div>
          ))}
        </div>
        {comparisonRows.length === 0 ? (
          <div style={{ fontSize:"12px", color:"#888" }}>Add expenses in two periods to see category changes.</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {comparisonRows.slice(0, 5).map((row) => (
              <div key={row.category} style={{ display:"grid", gridTemplateColumns:"minmax(0, 1fr) auto", gap:"10px", alignItems:"center", border:"1px solid #eeeeea", borderRadius:"12px", padding:"11px 12px" }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:"13px", fontWeight:900, color:DARK }}>{row.category}</div>
                  <div style={{ fontSize:"11px", color:"#888", marginTop:"2px" }}>{formatRand(row.currentAmount)} now · {formatRand(row.previousAmount)} before</div>
                </div>
                <div style={{ fontSize:"12px", fontWeight:900, color:row.difference > 0 ? "#b7791f" : row.difference < 0 ? "#2f855a" : "#888", whiteSpace:"nowrap" }}>
                  {row.difference > 0 ? "+" : row.difference < 0 ? "-" : ""}{formatRand(Math.abs(row.difference))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", flexWrap:"wrap", marginBottom:"12px" }}>
          <div>
            <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Suppliers</div>
            <div style={{ fontSize:"12px", color:"#888" }}>Who you bought from in {activeRange.label}.</div>
          </div>
          <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"999px", padding:"8px 11px", fontSize:"12px", fontWeight:900, color:DARK }}>
            {supplierRows.length} supplier{supplierRows.length === 1 ? "" : "s"}
          </div>
        </div>
        {supplierRows.length === 0 ? (
          <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"14px", padding:"16px", fontSize:"13px", color:"#777", lineHeight:1.55 }}>
            No suppliers recorded for this period yet. Add “Bought from / supplier” when saving an expense to build your supplier history.
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:"10px" }}>
            {supplierRows.slice(0, 6).map((supplier) => (
              <div key={supplier.name} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                  <span style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Store size={17} strokeWidth={2.2} color={BRAND} />
                  </span>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontSize:"14px", fontWeight:900, color:DARK, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{supplier.name}</div>
                    <div style={{ fontSize:"11px", color:"#888", marginTop:"2px" }}>{supplier.count} purchase{supplier.count === 1 ? "" : "s"}</div>
                  </div>
                  <div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>{formatRand(supplier.total)}</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"10px" }}>
                  <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"12px", padding:"9px" }}>
                    <div style={{ fontSize:"9px", color:"#aaa", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.06em" }}>Last buy</div>
                    <div style={{ fontSize:"12px", fontWeight:800, color:DARK, marginTop:"3px" }}>{supplier.lastDate ? new Date(`${supplier.lastDate}T00:00:00`).toLocaleDateString("en-ZA", { day:"numeric", month:"short" }) : "-"}</div>
                  </div>
                  <div style={{ background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"12px", padding:"9px" }}>
                    <div style={{ fontSize:"9px", color:"#aaa", fontWeight:900, textTransform:"uppercase", letterSpacing:"0.06em" }}>Categories</div>
                    <div style={{ fontSize:"12px", fontWeight:800, color:DARK, marginTop:"3px" }}>{supplier.categories.length}</div>
                  </div>
                </div>
                {supplier.items.length > 0 && (
                  <div style={{ fontSize:"11px", color:"#777", lineHeight:1.45 }}>
                    Common items: {supplier.items.slice(0, 3).join(", ")}{supplier.items.length > 3 ? "…" : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"18px", marginBottom:"20px" }}>
        <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Suggested for your business</div>
        <div style={{ fontSize:"12px", color:"#888", marginBottom:"14px" }}>{businessType} expense ideas. Tap one to quick add.</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
          {suggestedCategories.map((category) => (
            <button key={category} onClick={() => openForm(category)}
              style={{ border:"1.5px solid #f8b8d2", background:"#fff5f9", color:"#d93f7b", borderRadius:"999px", padding:"9px 13px", fontSize:"12px", fontWeight:800, cursor:"pointer" }}>
              {category}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"10px" }}>All categories</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {categories.map((category) => (
          <button key={category} onClick={() => openForm(category)} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"14px", display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", textAlign:"left" }}>
            <span style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <WalletCards size={17} strokeWidth={2.2} color={BRAND} />
            </span>
            <span style={{ fontSize:"13px", fontWeight:800, color:DARK }}>{category}</span>
          </button>
        ))}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", flexWrap:"wrap", marginBottom:"10px" }}>
          <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>Recent expenses</div>
          <div style={{ fontSize:"12px", color:"#888", fontWeight:700 }}>{activeRange.label}</div>
        </div>
        {loadingExpenses ? (
          <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"24px", textAlign:"center", color:"#888", fontSize:"13px" }}>
            Loading expenses...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"24px", textAlign:"center", color:"#888", fontSize:"13px" }}>
            No expenses recorded for this period. Add stock, transport, airtime or supplies to understand what your business really costs.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {filteredExpenses.map((expense) => {
              const linkedProductName = productName(products, expense.linked_product_id);
              return (
                <div key={expense.id} style={{ display:"flex", alignItems:"center", gap:"12px", border:"1px solid #eeeeea", borderRadius:"14px", padding:"13px 14px" }}>
                  <span style={{ width:"38px", height:"38px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <WalletCards size={17} strokeWidth={2.2} color={BRAND} />
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"14px", fontWeight:900, color:DARK }}>{expense.name}</div>
                    <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>{expense.category} · {expense.payment_method || "Other"} · {new Date(expenseDateValue(expense) + "T00:00:00").toLocaleDateString("en-ZA", { day:"numeric", month:"short" })}</div>
                    {(expense.supplier_name || linkedProductName) && (
                      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginTop:"6px" }}>
                        {expense.supplier_name && <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontSize:"11px", color:"#777", background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"999px", padding:"4px 7px" }}><Store size={12} /> {expense.supplier_name}</span>}
                        {linkedProductName && <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontSize:"11px", color:"#777", background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"999px", padding:"4px 7px" }}><Package size={12} /> {linkedProductName}</span>}
                      </div>
                    )}
                    {expense.notes && <div style={{ fontSize:"12px", color:"#aaa", marginTop:"4px", whiteSpace:"pre-line" }}>{expense.notes}</div>}
                  </div>
                  <div style={{ fontSize:"15px", fontWeight:900, color:DARK }}>{formatRand(expense.amount)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalCategory !== null && <ExpenseFormModal initialCategory={modalCategory} products={products} onSave={handleSaveExpense} onClose={() => setModalCategory(null)} saving={savingExpense} />}
      {toast && (
        <div style={{ position:"fixed", bottom:"86px", left:"50%", transform:"translateX(-50%)", background:DARK, color:"#fff", padding:"12px 20px", borderRadius:"999px", fontSize:"13px", fontWeight:800, zIndex:2000, boxShadow:"0 10px 30px rgba(32,32,33,0.2)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

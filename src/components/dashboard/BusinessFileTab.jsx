import React, { useEffect, useState } from "react";
import { CheckCircle, Circle, FileCheck, ReceiptText, Star, Users, WalletCards } from "lucide-react";
import { DARK } from "../../constants";
import { supabase } from "../../lib/supabase";

const BRAND = "#ea4c89";
const GOOGLE_SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const WORKSPACE_FOLDERS = ["Expenses", "Receipts", "Sales", "Stock", "Customers", "Reports"];
const TRACKER_SHEETS = [
  {
    title: "Expense Tracker",
    headers: ["Date", "Supplier / Bought From", "Expense Name", "Category", "Linked Product / Service", "Amount", "Payment Method", "Receipt Link", "Notes", "Added From", "VulaTrade Expense ID"],
  },
  {
    title: "Stock Tracker",
    headers: ["Product / Stock Item", "Category", "Qty Bought", "Qty Sold", "Balance", "Cost Price", "Selling Price", "Supplier", "Last Updated", "Added From", "VulaTrade Product ID"],
  },
  {
    title: "Sales Tracker",
    headers: ["Date", "Customer", "Product / Service", "Amount", "Payment Status", "Payment Method", "Reference", "Notes", "Added From", "VulaTrade Sale ID"],
  },
  {
    title: "Customer Tracker",
    headers: ["Customer Name", "Cell Number", "WhatsApp Consent", "Last Purchase", "Total Spend", "Notes", "Added From", "VulaTrade Customer ID"],
  },
];

function averageRating(reviews) {
  const approved = reviews.filter((review) => review.approved);
  if (approved.length === 0) return "0.0";
  const total = approved.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return (total / approved.length).toFixed(1);
}

function cleanName(value, fallback = "Business") {
  return String(value || fallback).replace(/[\\/:*?"<>|]/g, "-").trim() || fallback;
}

function googleApiErrorMessage(error) {
  if (!error) return "Google setup failed. Please try again.";
  if (typeof error === "string") return error;
  return error.message || error.error_description || error.error || "Google setup failed. Please try again.";
}

function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const existing = document.querySelector("script[data-google-identity]");
    if (existing) {
      existing.addEventListener("load", resolve, { once:true });
      existing.addEventListener("error", () => reject(new Error("Google sign-in script could not load.")), { once:true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Google sign-in script could not load."));
    document.head.appendChild(script);
  });
}

function requestGoogleAccessToken() {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error("Missing VITE_GOOGLE_CLIENT_ID. Add it to .env.local and restart npm run dev."));
      return;
    }
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (response?.error) reject(new Error(response.error));
        else resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt:"consent" });
  });
}

async function googleFetch(accessToken, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || data?.message || `Google API error: ${response.status}`);
  return data;
}

async function createDriveFolder(accessToken, name, parentId) {
  const body = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    ...(parentId ? { parents:[parentId] } : {}),
  };
  return googleFetch(accessToken, "https://www.googleapis.com/drive/v3/files", { method:"POST", body:JSON.stringify(body) });
}

async function createWorkspaceSpreadsheet(accessToken, businessName) {
  const spreadsheet = await googleFetch(accessToken, "https://sheets.googleapis.com/v4/spreadsheets", {
    method:"POST",
    body:JSON.stringify({
      properties:{ title:`VulaTrade Business Workspace - ${businessName}` },
      sheets:TRACKER_SHEETS.map((sheet) => ({ properties:{ title:sheet.title } })),
    }),
  });

  await Promise.all(TRACKER_SHEETS.map((sheet) => googleFetch(
    accessToken,
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet.spreadsheetId}/values/${encodeURIComponent(`${sheet.title}!A1:K1`)}?valueInputOption=RAW`,
    { method:"PUT", body:JSON.stringify({ values:[sheet.headers] }) }
  )));

  return spreadsheet;
}

async function moveFileToFolder(accessToken, fileId, folderId) {
  const metadata = await googleFetch(accessToken, `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`);
  const previousParents = (metadata.parents || []).join(",");
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}${previousParents ? `&removeParents=${previousParents}` : ""}&fields=id,parents`;
  return googleFetch(accessToken, url, { method:"PATCH", body:JSON.stringify({}) });
}

export function BusinessFileTab({ business, setTab }) {
  const [stats, setStats] = useState({
    customers: 0,
    payments: 0,
    salesTotal: 0,
    bookings: 0,
    expenses: 0,
    reviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    averageRating: "0.0",
  });
  const [loading, setLoading] = useState(true);
  const [googleFileStatus, setGoogleFileStatus] = useState("");
  const [googleWorkspace, setGoogleWorkspace] = useState(null);
  const [googleSetupBusy, setGoogleSetupBusy] = useState(false);

  useEffect(() => {
    async function loadSavedWorkspace() {
      if (!business?.id) {
        setGoogleWorkspace(null);
        return;
      }

      const { data, error } = await supabase
        .from("business_workspaces")
        .select("*")
        .eq("business_id", business.id)
        .maybeSingle();

      if (error) {
        console.error("Load business workspace:", error);
        setGoogleWorkspace(null);
        return;
      }

      if (data?.google_root_folder_url && data?.google_spreadsheet_url) {
        setGoogleWorkspace({
          rootFolderId: data.google_root_folder_id,
          rootFolderUrl: data.google_root_folder_url,
          spreadsheetId: data.google_spreadsheet_id,
          spreadsheetUrl: data.google_spreadsheet_url,
          folders: {
            Expenses: data.expenses_folder_id,
            Receipts: data.receipts_folder_id,
            Sales: data.sales_folder_id,
            Stock: data.stock_folder_id,
            Customers: data.customers_folder_id,
            Reports: data.reports_folder_id,
          },
          createdAt: data.created_at,
        });
        setGoogleFileStatus("Business Workspace already connected.");
      } else {
        setGoogleWorkspace(null);
      }
    }

    loadSavedWorkspace();
  }, [business?.id]);

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      supabase.from("customers").select("id").eq("business_id", business.id),
      supabase.from("payments").select("amount,status").eq("business_id", business.id),
      supabase.from("bookings").select("id,status").eq("business_id", business.id),
      supabase.from("expenses").select("id").eq("business_id", business.id),
      supabase.from("reviews").select("id,rating,approved").eq("business_id", business.id),
    ]).then(([{ data: customers }, { data: payments }, { data: bookings }, { data: expenses }, { data: reviews }]) => {
      const revenue = (payments || [])
        .filter((payment) => payment.status === "Paid" || payment.status === "Deposit paid")
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const reviewRows = reviews || [];
      setStats({
        customers: customers?.length || 0,
        payments: payments?.length || 0,
        salesTotal: revenue,
        bookings: bookings?.filter((booking) => booking.status === "done").length || 0,
        expenses: expenses?.length || 0,
        reviews: reviewRows.length,
        approvedReviews: reviewRows.filter((review) => review.approved).length,
        pendingReviews: reviewRows.filter((review) => !review.approved).length,
        averageRating: averageRating(reviewRows),
      });
      setLoading(false);
    });
  }, [business?.id]);

  async function handleCreateGoogleWorkspace() {
    if (!business?.id) { setGoogleFileStatus("Create your business profile before setting up a workspace."); return; }
    setGoogleSetupBusy(true);
    setGoogleFileStatus("Connecting to Google...");
    try {
      await loadGoogleIdentityScript();
      const accessToken = await requestGoogleAccessToken();
      const businessName = cleanName(business?.name, "VulaTrade Business");
      setGoogleFileStatus("Creating your main Google Drive folder...");
      const rootFolder = await createDriveFolder(accessToken, `VulaTrade Business Workspace - ${businessName}`);

      setGoogleFileStatus("Creating business folders...");
      const folderEntries = await Promise.all(WORKSPACE_FOLDERS.map(async (folderName) => {
        const folder = await createDriveFolder(accessToken, folderName, rootFolder.id);
        return [folderName, folder.id];
      }));
      const folders = Object.fromEntries(folderEntries);

      setGoogleFileStatus("Creating tracking spreadsheet...");
      const spreadsheet = await createWorkspaceSpreadsheet(accessToken, businessName);
      await moveFileToFolder(accessToken, spreadsheet.spreadsheetId, rootFolder.id);

      const workspace = {
        rootFolderId:rootFolder.id,
        rootFolderUrl:`https://drive.google.com/drive/folders/${rootFolder.id}`,
        spreadsheetId:spreadsheet.spreadsheetId,
        spreadsheetUrl:spreadsheet.spreadsheetUrl,
        folders,
        createdAt:new Date().toISOString(),
      };
      window.localStorage.setItem(`vula-google-workspace-${business.id}`, JSON.stringify(workspace));
      setGoogleWorkspace(workspace);
      setGoogleFileStatus("Business Workspace created. Your folders and starter tracking sheets are now in Google Drive.");
    } catch (error) {
      console.error("Google workspace setup failed", error);
      setGoogleFileStatus(googleApiErrorMessage(error));
    } finally {
      setGoogleSetupBusy(false);
    }
  }

  const checklist = [
    { label:"Business profile created", done:Boolean(business?.name) },
    { label:"Public page ready", done:Boolean(business?.slug) },
    { label:"Customer activity recorded", done:stats.customers > 0 },
    { label:"Sales history started", done:stats.payments > 0 },
    { label:"First expense recorded", done:stats.expenses > 0 },
    { label:"Completed work tracked", done:stats.bookings > 0 },
    { label:"Customer reviews approved", done:stats.approvedReviews > 0 },
  ];
  const doneCount = checklist.filter((item) => item.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);
  const reviewProofText = stats.approvedReviews > 0
    ? `Customer proof: ${stats.approvedReviews} approved review${stats.approvedReviews === 1 ? "" : "s"}, average rating ${stats.averageRating} stars.`
    : stats.pendingReviews > 0
      ? `Customer proof: ${stats.pendingReviews} review${stats.pendingReviews === 1 ? "" : "s"} waiting for approval.`
      : "Customer proof: no approved reviews yet.";

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Business File</h2>
        <p style={{ fontSize:"13px", color:"#aaa" }}>Your proof-of-trading record grows as you use VulaTrade.</p>
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"22px", padding:"22px", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"18px" }}>
          <span style={{ width:"48px", height:"48px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FileCheck size={22} strokeWidth={2.2} color={BRAND} />
          </span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>Proof of trading</div>
            <div style={{ fontSize:"12px", color:"#888", lineHeight:1.5, marginTop:"3px" }}>
              Better records may help you in future conversations with suppliers, funders, partners or landlords.
            </div>
          </div>
        </div>
        <div style={{ height:"10px", background:"#f5f5f5", borderRadius:"999px", overflow:"hidden", marginBottom:"10px" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:BRAND, borderRadius:"999px" }} />
        </div>
        <div style={{ fontSize:"12px", color:"#888", fontWeight:700 }}>{progress}% complete</div>
      </div>

      <div style={{ background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"18px", padding:"16px", marginBottom:"20px", display:"flex", alignItems:"flex-start", gap:"12px" }}>
        <span style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Star size={18} strokeWidth={2.2} color={BRAND} />
        </span>
        <div>
          <div style={{ fontSize:"14px", fontWeight:900, color:DARK, marginBottom:"4px" }}>Review proof</div>
          <div style={{ fontSize:"13px", color:"#666", lineHeight:1.55 }}>{loading ? "Loading review proof..." : reviewProofText}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Sales history", value:`R${stats.salesTotal.toLocaleString()}`, icon:ReceiptText },
          { label:"Customer activity", value:stats.customers, icon:Users },
          { label:"Payment records", value:stats.payments, icon:WalletCards },
          { label:"Expense records", value:stats.expenses, icon:FileCheck },
          { label:"Approved reviews", value:stats.approvedReviews, icon:Star },
          { label:"Average rating", value:stats.approvedReviews > 0 ? `${stats.averageRating} ★` : "0.0 ★", icon:Star },
          { label:"Pending reviews", value:stats.pendingReviews, icon:Star },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"16px", padding:"16px" }}>
              <Icon size={18} strokeWidth={2.2} color={BRAND} />
              <div style={{ fontSize:"22px", fontWeight:900, color:DARK, marginTop:"12px" }}>{loading ? "…" : stat.value}</div>
              <div style={{ fontSize:"11px", color:"#888", fontWeight:700, marginTop:"4px" }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px", marginBottom:"20px" }}>
        <div style={{ fontSize:"15px", fontWeight:900, color:DARK, marginBottom:"6px" }}>Business Workspace Setup</div>
        <div style={{ fontSize:"13px", color:"#666", lineHeight:1.55, marginBottom:"14px" }}>
          Connect Google Drive and automatically create organised folders and tracking sheets for your business.
        </div>
        <div style={{ background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"14px", padding:"12px", fontSize:"12px", color:"#666", fontWeight:700, marginBottom:"14px" }}>
          This connects to your saved Google Business Workspace and keeps your business records organised.
        </div>
        <button
          type="button"
          disabled={googleSetupBusy || Boolean(googleWorkspace)}
          onClick={handleCreateGoogleWorkspace}
          style={{ background:BRAND, color:"#fff", border:"none", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:(googleSetupBusy || googleWorkspace) ? "not-allowed" : "pointer", opacity:(googleSetupBusy || googleWorkspace) ? 0.72 : 1 }}
        >
          {googleSetupBusy ? "Setting Up..." : googleWorkspace ? "Business Workspace Connected" : "Set Up My Business Workspace"}
        </button>
        {googleFileStatus && (
          <div style={{ marginTop:"12px", background:"#fbfbfb", border:"1px solid #eeeeea", borderRadius:"14px", padding:"12px", fontSize:"13px", color:"#555", lineHeight:1.5 }}>
            {googleFileStatus}
          </div>
        )}
        {googleWorkspace && (
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginTop:"12px" }}>
            <a href={googleWorkspace.rootFolderUrl} target="_blank" rel="noreferrer" style={{ color:BRAND, fontSize:"13px", fontWeight:900, textDecoration:"none" }}>Open Drive folder</a>
            <a href={googleWorkspace.spreadsheetUrl} target="_blank" rel="noreferrer" style={{ color:BRAND, fontSize:"13px", fontWeight:900, textDecoration:"none" }}>Open tracker sheet</a>
          </div>
        )}
      </div>

      <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
        <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"14px" }}>Progress checklist</div>
        <div style={{ display:"grid", gap:"10px", marginBottom:"18px" }}>
          {checklist.map((item) => {
            const Icon = item.done ? CheckCircle : Circle;
            return (
              <div key={item.label} style={{ display:"flex", alignItems:"center", gap:"10px", fontSize:"13px", fontWeight:700, color:item.done ? DARK : "#888" }}>
                <Icon size={19} strokeWidth={2.2} color={item.done ? BRAND : "#c6cbd1"} />
                {item.label}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          <button onClick={() => setTab("Sales")} style={{ background:BRAND, color:"#fff", border:"none", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>
            Record a sale
          </button>
          <button onClick={() => setTab("Reviews")} style={{ background:"#fff", color:BRAND, border:"1.5px solid #f8b8d2", borderRadius:"12px", padding:"11px 18px", fontSize:"13px", fontWeight:800, cursor:"pointer" }}>
            Request reviews
          </button>
        </div>
      </div>
    </div>
  );
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ");

function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load Google Identity Services."));
    document.body.appendChild(script);
  });
}

export async function getGoogleAccessToken() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Missing VITE_GOOGLE_CLIENT_ID in .env.local");
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: "" });
  });
}

async function googleFetch(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google API error ${response.status}: ${errorText}`);
  }

  return response.json();
}


const TRACKER_SHEETS = {
  EXPENSES: { id: 0, title: "Expense Tracker", tabColor: { red: 0.9176, green: 0.298, blue: 0.5373 }, columns: 11 },
  STOCK: { id: 1, title: "Stock Tracker", tabColor: { red: 0.1255, green: 0.1255, blue: 0.1294 }, columns: 11 },
  SALES: { id: 2, title: "Sales Tracker", tabColor: { red: 0.9176, green: 0.298, blue: 0.5373 }, columns: 12 },
  CUSTOMERS: { id: 3, title: "Customer Tracker", tabColor: { red: 0.9922, green: 0.9098, blue: 0.9451 }, columns: 10 },
};

const VULA_SHEET_COLORS = {
  pink: { red: 0.9176, green: 0.298, blue: 0.5373 },
  charcoal: { red: 0.1255, green: 0.1255, blue: 0.1294 },
  softPink: { red: 0.9922, green: 0.9098, blue: 0.9451 },
  borderPink: { red: 0.9725, green: 0.7216, blue: 0.8235 },
  lightGrey: { red: 0.9333, green: 0.9333, blue: 0.9176 },
  white: { red: 1, green: 1, blue: 1 },
};

function columnWidthRequests(sheetId, widths = []) {
  return widths.map((pixelSize, index) => ({
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: "COLUMNS",
        startIndex: index,
        endIndex: index + 1,
      },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  }));
}

function formatRangeRequest(sheetId, startColumnIndex, endColumnIndex, numberFormat) {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 1000,
        startColumnIndex,
        endColumnIndex,
      },
      cell: {
        userEnteredFormat: {
          numberFormat,
        },
      },
      fields: "userEnteredFormat.numberFormat",
    },
  };
}

async function brandTrackerSpreadsheet(token, spreadsheetId) {
  const sheetConfigs = Object.values(TRACKER_SHEETS);

  const requests = sheetConfigs.flatMap((sheet) => [
    {
      updateSheetProperties: {
        properties: {
          sheetId: sheet.id,
          gridProperties: { frozenRowCount: 1 },
          tabColor: sheet.tabColor,
        },
        fields: "gridProperties.frozenRowCount,tabColor",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheet.id,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: sheet.columns,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: VULA_SHEET_COLORS.charcoal,
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: {
              foregroundColor: VULA_SHEET_COLORS.white,
              bold: true,
              fontSize: 10,
            },
          },
        },
        fields: "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,wrapStrategy,textFormat)",
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: sheet.id,
          dimension: "ROWS",
          startIndex: 0,
          endIndex: 1,
        },
        properties: { pixelSize: 42 },
        fields: "pixelSize",
      },
    },
    {
      updateBorders: {
        range: {
          sheetId: sheet.id,
          startRowIndex: 0,
          endRowIndex: 1000,
          startColumnIndex: 0,
          endColumnIndex: sheet.columns,
        },
        top: { style: "SOLID", width: 1, color: VULA_SHEET_COLORS.lightGrey },
        bottom: { style: "SOLID", width: 1, color: VULA_SHEET_COLORS.lightGrey },
        left: { style: "SOLID", width: 1, color: VULA_SHEET_COLORS.lightGrey },
        right: { style: "SOLID", width: 1, color: VULA_SHEET_COLORS.lightGrey },
        innerHorizontal: { style: "SOLID", width: 1, color: VULA_SHEET_COLORS.lightGrey },
        innerVertical: { style: "SOLID", width: 1, color: VULA_SHEET_COLORS.lightGrey },
      },
    },
    {
      addBanding: {
        bandedRange: {
          range: {
            sheetId: sheet.id,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: 0,
            endColumnIndex: sheet.columns,
          },
          rowProperties: {
            firstBandColor: VULA_SHEET_COLORS.white,
            secondBandColor: VULA_SHEET_COLORS.softPink,
          },
        },
      },
    },
  ]);

  requests.push(
    ...columnWidthRequests(TRACKER_SHEETS.EXPENSES.id, [110, 180, 180, 140, 190, 110, 150, 190, 240, 130, 190]),
    ...columnWidthRequests(TRACKER_SHEETS.STOCK.id, [190, 140, 100, 100, 100, 110, 120, 160, 130, 130, 190]),
    ...columnWidthRequests(TRACKER_SHEETS.SALES.id, [110, 170, 190, 100, 110, 120, 140, 150, 160, 240, 130, 190]),
    ...columnWidthRequests(TRACKER_SHEETS.CUSTOMERS.id, [180, 150, 140, 130, 120, 240, 130, 190, 140, 140]),

    formatRangeRequest(TRACKER_SHEETS.EXPENSES.id, 0, 1, { type: "DATE", pattern: "yyyy-mm-dd" }),
    formatRangeRequest(TRACKER_SHEETS.EXPENSES.id, 5, 6, { type: "CURRENCY", pattern: '"R"#,##0.00' }),

    formatRangeRequest(TRACKER_SHEETS.STOCK.id, 2, 5, { type: "NUMBER", pattern: "#,##0" }),
    formatRangeRequest(TRACKER_SHEETS.STOCK.id, 5, 7, { type: "CURRENCY", pattern: '"R"#,##0.00' }),
    formatRangeRequest(TRACKER_SHEETS.STOCK.id, 8, 9, { type: "DATE", pattern: "yyyy-mm-dd" }),

    formatRangeRequest(TRACKER_SHEETS.SALES.id, 0, 1, { type: "DATE", pattern: "yyyy-mm-dd" }),
    formatRangeRequest(TRACKER_SHEETS.SALES.id, 3, 4, { type: "NUMBER", pattern: "#,##0" }),
    formatRangeRequest(TRACKER_SHEETS.SALES.id, 4, 6, { type: "CURRENCY", pattern: '"R"#,##0.00' }),

    formatRangeRequest(TRACKER_SHEETS.CUSTOMERS.id, 3, 4, { type: "DATE", pattern: "yyyy-mm-dd" }),
    formatRangeRequest(TRACKER_SHEETS.CUSTOMERS.id, 4, 5, { type: "CURRENCY", pattern: '"R"#,##0.00' })
  );

  return googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, token, {
    method: "POST",
    body: JSON.stringify({ requests }),
  });
}

async function createDriveFolder(token, name, parentId = null) {
  const body = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };

  if (parentId) {
    body.parents = [parentId];
  }

  const folder = await googleFetch("https://www.googleapis.com/drive/v3/files", token, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    id: folder.id,
    name,
    url: `https://drive.google.com/drive/folders/${folder.id}`,
  };
}

async function createSpreadsheet(token, name, parentId) {
  const spreadsheetFile = await googleFetch("https://www.googleapis.com/drive/v3/files", token, {
    method: "POST",
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [parentId],
    }),
  });

  const spreadsheetId = spreadsheetFile.id;

  await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, token, {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: TRACKER_SHEETS.EXPENSES.id,
              title: "Expense Tracker",
            },
            fields: "title",
          },
        },
        {
          addSheet: {
            properties: {
              sheetId: TRACKER_SHEETS.STOCK.id,
              title: "Stock Tracker",
            },
          },
        },
        {
          addSheet: {
            properties: {
              sheetId: TRACKER_SHEETS.SALES.id,
              title: "Sales Tracker",
            },
          },
        },
        {
          addSheet: {
            properties: {
              sheetId: TRACKER_SHEETS.CUSTOMERS.id,
              title: "Customer Tracker",
            },
          },
        },
      ],
    }),
  });

  const headers = {
    valueInputOption: "RAW",
    data: [
      {
        range: "Expense Tracker!A1:K1",
        values: [[
          "Date",
          "Supplier / Bought From",
          "Expense Name",
          "Category",
          "Linked Product / Service",
          "Amount",
          "Payment Method",
          "Receipt Link",
          "Notes",
          "Added From",
          "VulaTrade Expense ID",
        ]],
      },
      {
        range: "Stock Tracker!A1:K1",
        values: [[
          "Product / Stock Item",
          "Category",
          "Qty Bought",
          "Qty Sold",
          "Balance",
          "Cost Price",
          "Selling Price",
          "Supplier",
          "Last Updated",
          "Added From",
          "VulaTrade Product ID",
        ]],
      },
      {
        range: "Sales Tracker!A1:L1",
        values: [[
          "Date",
          "Customer",
          "Product / Service",
          "Quantity",
          "Unit Price",
          "Total Amount",
          "Payment Status",
          "Payment Method",
          "Reference",
          "Notes",
          "Added From",
          "VulaTrade Sale ID",
        ]],
      },
      {
        range: "Customer Tracker!A1:J1",
        values: [[
          "Customer Name",
          "Cell Number",
          "WhatsApp Consent",
          "Last Purchase",
          "Total Spend",
          "Notes",
          "Added From",
          "VulaTrade Customer ID",
        ]],
      },
    ],
  };

  await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, token, {
    method: "POST",
    body: JSON.stringify(headers),
  });

  await brandTrackerSpreadsheet(token, spreadsheetId);

  return {
    id: spreadsheetId,
    name,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

export async function createBusinessWorkspace(businessName = "My Business") {
  const token = await getGoogleAccessToken();

  const safeBusinessName = businessName || "My Business";

  const rootFolder = await createDriveFolder(
    token,
    `VulaTrade Business Workspace - ${safeBusinessName}`
  );

  const folders = {};

  for (const folderName of ["Expenses", "Receipts", "Sales", "Stock", "Customers", "Reports"]) {
    folders[folderName] = await createDriveFolder(token, folderName, rootFolder.id);
  }

  const spreadsheet = await createSpreadsheet(
    token,
    `${safeBusinessName} - VulaTrade Trackers`,
    rootFolder.id
  );

  return {
    rootFolder,
    folders,
    spreadsheet,
    createdAt: new Date().toISOString(),
  };
}


export async function getBusinessGoogleSpreadsheetId(supabaseClient, businessId) {
  if (!businessId) return null;

  try {
    const { data, error } = await supabaseClient
      .from("business_workspaces")
      .select("google_spreadsheet_id")
      .eq("business_id", businessId)
      .maybeSingle();

    if (!error && data?.google_spreadsheet_id) {
      return data.google_spreadsheet_id;
    }

    if (error) {
      console.warn("Google workspace lookup failed, trying local fallback:", error.message);
    }
  } catch (error) {
    console.warn("Google workspace lookup failed, trying local fallback:", error);
  }

  try {
    const localWorkspace = window.localStorage.getItem(`vula-google-workspace-${businessId}`);
    if (!localWorkspace) return null;

    const parsedWorkspace = JSON.parse(localWorkspace);
    return parsedWorkspace?.spreadsheetId || parsedWorkspace?.google_spreadsheet_id || null;
  } catch (error) {
    console.warn("Google workspace local fallback failed:", error);
    return null;
  }
}

export async function appendExpenseToGoogleSheet(spreadsheetId, expense) {
  if (!spreadsheetId) {
    throw new Error("Missing Google spreadsheet ID.");
  }

  const token = await getGoogleAccessToken();

  const values = [[
    expense.expense_date || expense.date || "",
    expense.supplier_name || "",
    expense.name || "",
    expense.category || "",
    expense.linked_product_name || "",
    expense.amount || "",
    expense.payment_method || "",
    expense.receipt_url || "",
    expense.notes || "",
    "VulaTrade",
    expense.id || "",
  ]];

  return googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Expense%20Tracker!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ values }),
    }
  );
}

export async function appendStockToGoogleSheet(spreadsheetId, product) {
  if (!spreadsheetId) {
    throw new Error("Missing Google spreadsheet ID.");
  }

  const token = await getGoogleAccessToken();

  const meta = product.item_setup || product.vula || {};
  const itemType = product.item_type || meta.item_type || "";

  const movement = product.stock_movement || null;

  const qtyBought =
    movement
      ? movement.qty_bought || ""
      : itemType === "daily_stock"
        ? meta.today_stock_quantity || ""
        : meta.stock_quantity || "";

  const qtySold = movement?.qty_sold || "";

  const balance =
    movement?.balance ?? qtyBought;

  const values = [[
    product.name || "",
    itemType || product.category || "",
    qtyBought,
    qtySold,
    balance,
    "",
    product.price || "",
    "",
    new Date().toISOString().slice(0, 10),
    "VulaTrade",
    product.id || "",
  ]];

  return googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Stock%20Tracker!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ values }),
    }
  );
}

export async function appendSaleToGoogleSheet(spreadsheetId, sale) {
  if (!spreadsheetId) {
    throw new Error("Missing Google spreadsheet ID.");
  }

  const token = await getGoogleAccessToken();

  const quantity = Number(sale.quantity || 1);
  const totalAmount = Number(sale.amount || 0);
  const unitPrice = sale.unit_price ?? (quantity > 0 ? totalAmount / quantity : totalAmount);

  const values = [[
    (sale.created_at || new Date().toISOString()).slice(0, 10),
    sale.customer_name || "",
    sale.product_or_service || sale.reference || "",
    quantity,
    unitPrice,
    totalAmount,
    sale.status || "",
    sale.method || "",
    sale.reference || "",
    sale.notes || "",
    "VulaTrade",
    sale.id || "",
  ]];

  return googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sales%20Tracker!A:L:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ values }),
    }
  );
}

export async function updateSalesTrackerHeaders(spreadsheetId) {
  if (!spreadsheetId) {
    throw new Error("Missing Google spreadsheet ID.");
  }

  const token = await getGoogleAccessToken();

  const values = [[
    "Date",
    "Customer",
    "Product / Service",
    "Quantity",
    "Unit Price",
    "Total Amount",
    "Payment Status",
    "Payment Method",
    "Reference",
    "Notes",
    "Added From",
    "VulaTrade Sale ID",
  ]];

  return googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sales%20Tracker!A1:L1?valueInputOption=USER_ENTERED`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ values }),
    }
  );
}

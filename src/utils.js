import { FONTS, isPlanLocked } from "./constants";

// ── FONT INJECTION ─────────────────────────────────────────
export function injectFont(url) {
  if (!url) return;
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

export function injectAllUnlockedFonts() {
  FONTS.forEach((f) => {
    if (!isPlanLocked(f.plan) && f.import) injectFont(f.import);
  });
}

// ── IMAGE COMPRESSION ──────────────────────────────────────
export async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        0.8
      );
    };
    img.src = url;
  });
}

// ── CUSTOMER HELPERS ───────────────────────────────────────
export function normaliseWhatsappNumber(number = "") {
  let digits = String(number).replace(/[\s()\-]/g, "").replace(/^\+/, "").replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return `27${digits.slice(1)}`;
  if (digits.startsWith("27")) return digits;
  return digits;
}

export function waLink(number, message = "") {
  const clean = normaliseWhatsappNumber(number);
  const msg = encodeURIComponent(message);
  return `https://wa.me/${clean}${msg ? `?text=${msg}` : ""}`;
}

export function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function formatPhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10)
    return "+27" + digits.slice(1);
  if (digits.startsWith("27") && digits.length === 11)
    return "+" + digits;
  return raw.trim();
}

export async function pickFromContacts() {
  const supported =
    typeof navigator !== "undefined" &&
    "contacts" in navigator &&
    "ContactsManager" in window;
  if (!supported) return null;
  try {
    const results = await navigator.contacts.select(["name", "tel"], {
      multiple: true,
    });
    return results.map((c) => ({
      name: c.name?.[0] || "",
      whatsapp: c.tel?.[0] ? formatPhone(c.tel[0]) : "",
    }));
  } catch {
    return null;
  }
}

// ── BOOKING DATE HELPERS ────────────────────────────────────
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export function isTomorrow(dateStr) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === tomorrow.toISOString().slice(0, 10);
}

export function dateLabel(dateStr) {
  if (isToday(dateStr)) return "Today";
  if (isTomorrow(dateStr)) return "Tomorrow";
  return formatDate(dateStr);
}

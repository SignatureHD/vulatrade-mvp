export const DEMO_PHONE_ERROR = "Please enter a valid South African cellphone number.";

export function normalizeSouthAfricanPhone(value) {
  const cleaned = String(value || "").replace(/[\s()-]/g, "");

  if (/^0[6-8][0-9]{8}$/.test(cleaned)) {
    return `+27${cleaned.slice(1)}`;
  }

  if (/^\+27[6-8][0-9]{8}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^27[6-8][0-9]{8}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
}

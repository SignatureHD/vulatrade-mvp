export const CUSTOMER_JOURNEY = [
  { value: "new_enquiry", label: "New enquiry", color: "#767b81", bg: "#f8f8f8", border: "#d4d7db", desc: "Customer has asked about something" },
  { value: "followed_up", label: "Replied / followed up", color: "#202021", bg: "#fde8f1", border: "#f8b8d2", desc: "You have replied or followed up" },
  { value: "price_sent", label: "Price / quote sent", color: "#d93f7b", bg: "#fff5f9", border: "#ea4c89", desc: "Price, quote or offer has been sent" },
  { value: "booking_requested", label: "Booking requested", color: "#6b4e16", bg: "#fff8e7", border: "#ffcf66", desc: "Customer wants a booking, but it is not confirmed yet" },
  { value: "booked", label: "Booked", color: "#202021", bg: "#eef7ff", border: "#b8dfff", desc: "Booking is confirmed" },
  { value: "payment_pending", label: "Payment pending", color: "#9f1239", bg: "#fff5f7", border: "#ffd7e4", desc: "Payment still needs to be made or confirmed" },
  { value: "paid", label: "Paid", color: "#166534", bg: "#f0fdf4", border: "#bbf7d0", desc: "Customer has paid" },
  { value: "completed", label: "Completed / delivered", color: "#155e75", bg: "#ecfeff", border: "#a5f3fc", desc: "Work, order or delivery is complete" },
  { value: "lost", label: "Lost / not now", color: "#cc3300", bg: "#fff5f5", border: "#ffd0d0", desc: "Customer is not going ahead now" },
];

export const DEFAULT_CUSTOMER_TAGS = ["Regular", "VIP", "Nurture later"];

export const JOURNEY_LABELS = CUSTOMER_JOURNEY.reduce((map, item) => ({ ...map, [item.value]: item.label }), {});

export function journeyConfig(value) {
  return CUSTOMER_JOURNEY.find((item) => item.value === value) || CUSTOMER_JOURNEY[0];
}

export function normaliseJourneyStatus(value) {
  const status = String(value || "").toLowerCase();
  const map = {
    lead: "new_enquiry",
    new: "new_enquiry",
    interested: "new_enquiry",
    replied: "followed_up",
    follow_up: "followed_up",
    followed_up: "followed_up",
    quote_sent: "price_sent",
    quoted: "price_sent",
    price_sent: "price_sent",
    waiting_payment: "payment_pending",
    payment_pending: "payment_pending",
    booking_requested: "booking_requested",
    booked: "booked",
    paid: "paid",
    completed: "completed",
    done: "completed",
    regular: "new_enquiry",
    vip: "new_enquiry",
    lost: "lost",
  };
  return map[status] || "new_enquiry";
}

export function journeyForCustomer(customer = {}) {
  if (customer.stage) return normaliseJourneyStatus(customer.stage);
  return normaliseJourneyStatus(customer.status);
}

export function tagsForCustomer(customer = {}) {
  const tags = Array.isArray(customer.tags) ? [...customer.tags] : [];
  if (customer.status === "regular" && !tags.includes("Regular")) tags.push("Regular");
  if (customer.status === "vip" && !tags.includes("VIP")) tags.push("VIP");
  if ((customer.status === "lost" || customer.stage === "lost") && !tags.includes("Nurture later")) tags.push("Nurture later");
  return [...new Set(tags)];
}

export function statusPatchForJourney(value, currentCustomer = {}) {
  const stage = normaliseJourneyStatus(value);
  const tags = tagsForCustomer(currentCustomer);
  if (stage === "lost" && !tags.includes("Nurture later")) tags.push("Nurture later");
  return { stage, tags };
}

export function archiveJourney(value) {
  return ["paid", "completed", "lost"].includes(normaliseJourneyStatus(value));
}

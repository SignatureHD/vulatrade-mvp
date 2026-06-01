export function extractCustomerMessage(enquiry = {}) {
  const notes = String(enquiry.notes || "").trim();
  if (notes) return notes;

  const message = String(enquiry.message || "").trim();
  if (!message) return "";

  const marker = "Notes:";
  const index = message.toLowerCase().lastIndexOf(marker.toLowerCase());
  if (index >= 0) return message.slice(index + marker.length).trim();

  return "";
}

export function fullWhatsAppMessage(enquiry = {}) {
  return String(enquiry.message || "").trim();
}

export function nextEnquiryAction(enquiry = {}, normaliseJourneyStatus = (value) => value) {
  const stage = normaliseJourneyStatus(enquiry.status);
  if (stage === "booking_requested") return "Next: reply, confirm a time, or mark as booked.";
  if (stage === "payment_pending") return "Next: follow up for payment or mark as paid.";
  if (stage === "booked") return "Next: complete the booking, then mark completed.";
  if (stage === "new_enquiry") return "Next: reply on WhatsApp, then move the journey forward.";
  if (stage === "followed_up") return "Next: wait for reply or send price/booking details.";
  return "Next: update the journey when something changes.";
}

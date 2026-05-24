export const DEFAULT_BUSINESS_DESCRIPTIONS = {
  "Nail Tech": "We offer nail care and beauty services, including neat, stylish treatments for everyday wear, special occasions and regular self-care.",
  "Hair & Extensions": "We offer hair services and extensions to help clients look and feel confident with styles suited to their taste, budget and lifestyle.",
  "Barber": "We offer barbering services, including fresh cuts, grooming and styling for clients who want to look sharp and feel confident.",
  "Food Seller": "We sell prepared food, meals and tasty items for customers who want convenient, affordable and satisfying food.",
  "Fresh Produce": "We sell fresh produce and everyday food items to help customers access quality ingredients at fair prices.",
  "Clothing": "We sell clothing and fashion items, including everyday wear, special pieces and selected items for different styles and budgets.",
  "Fragrance / Home Scent": "We sell fragrance products, including perfumes, car diffusers, home diffusers and room sprays to help people smell good and keep their spaces fresh.",
  "Cleaning": "We offer cleaning services to help homes, offices and spaces stay neat, fresh and well cared for.",
  "Tutoring": "We offer tutoring and learning support to help learners improve their confidence, understanding and results.",
  "Delivery": "We offer delivery and collection support to help customers move items quickly, safely and conveniently.",
  "Photography": "We offer photography services to help clients capture important moments, products, events and memories.",
  "Catering": "We offer catering and food services for events, gatherings and customers who need tasty, reliable meals.",
  "Phone Repairs": "We offer phone repair and support services to help customers fix devices and stay connected.",
};

export function defaultBusinessDescription(category) {
  return DEFAULT_BUSINESS_DESCRIPTIONS[category] || "";
}

export function businessDescriptionOrDefault(description, category) {
  return description?.trim() || defaultBusinessDescription(category);
}

const DEFAULT_DESCRIPTION_VALUES = new Set(Object.values(DEFAULT_BUSINESS_DESCRIPTIONS));
let autofillInstalled = false;

function setTextareaValue(textarea, value) {
  const prototype = Object.getPrototypeOf(textarea);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor?.set) {
    descriptor.set.call(textarea, value);
  } else {
    textarea.value = value;
  }
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function installBusinessDescriptionAutofill() {
  if (autofillInstalled || typeof document === "undefined") return;
  autofillInstalled = true;

  document.addEventListener("click", (event) => {
    const button = event.target?.closest?.("button");
    if (!button) return;
    const category = button.textContent?.trim();
    const nextDescription = defaultBusinessDescription(category);
    if (!nextDescription) return;

    window.setTimeout(() => {
      const textarea = Array.from(document.querySelectorAll("textarea"))
        .find((field) => field.placeholder === "Briefly describe what you do...");
      if (!textarea) return;

      const currentValue = textarea.value.trim();
      const shouldAutofill = !currentValue || DEFAULT_DESCRIPTION_VALUES.has(currentValue);
      if (!shouldAutofill) return;

      setTextareaValue(textarea, nextDescription);
    }, 0);
  }, true);
}

installBusinessDescriptionAutofill();

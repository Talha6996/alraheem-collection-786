import type { CartItem, Money, Product } from "@shared/commerce/types";

const WHATSAPP_BUSINESS_NUMBER = "923361243334";

export function formatMoney(money: Money | null | undefined) {
  if (!money) return "PKR —";
  const amount = Number(money.amount);
  const formatted = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
  return `${money.currencyCode === "PKR" ? "PKR" : money.currencyCode} ${formatted}`;
}

export function primaryVariant(product: Product) {
  return product.variants[0] ?? null;
}

function whatsappUrl(message: string) {
  const url = new URL(`https://wa.me/${WHATSAPP_BUSINESS_NUMBER}`);
  url.searchParams.set("text", message);
  return url.toString();
}

export function createProductOrderUrl({ title, price, productUrl }: { title: string; price: string; productUrl: string }) {
  return whatsappUrl(`Hello ALRAHEEM COLLECTION 786, I would like to order:\n\n• ${title}\n• Price: ${price}\n• Product: ${productUrl}\n\nPlease confirm availability, delivery charges and payment details.\n\nMy name:\nMy delivery city/address:`);
}

export function createCartOrderUrl(items: CartItem[], subtotal: Money) {
  const orderLines = items.map(item => `• ${item.productTitle}${item.variantTitle !== "Default Title" ? ` (${item.variantTitle})` : ""} × ${item.quantity} — ${formatMoney(item.lineTotal)}`).join("\n");
  return whatsappUrl(`Hello ALRAHEEM COLLECTION 786, I would like to place a direct order:\n\n${orderLines}\n\nSubtotal: ${formatMoney(subtotal)}\n\nPlease confirm availability, delivery charges and payment details.\n\nMy name:\nMy delivery city/address:`);
}

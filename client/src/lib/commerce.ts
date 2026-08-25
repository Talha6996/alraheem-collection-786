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

/** A sale is shown only when Shopify's real compare-at amount exceeds the current price. */
export function isGenuineSale(price: Money | null | undefined, compareAtPrice: Money | null | undefined) {
  if (!price || !compareAtPrice || price.currencyCode !== compareAtPrice.currencyCode) return false;
  const currentAmount = Number(price.amount);
  const previousAmount = Number(compareAtPrice.amount);
  return Number.isFinite(currentAmount) && Number.isFinite(previousAmount) && previousAmount > currentAmount;
}

/** Keeps cart-line compare-at totals accurate when a customer buys more than one discounted item. */
export function multiplyMoney(money: Money | null | undefined, quantity: number): Money | null {
  if (!money || !Number.isFinite(quantity)) return null;
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) return null;
  return { amount: (amount * Math.max(0, quantity)).toFixed(2), currencyCode: money.currencyCode };
}

export type StockStatus = { label: string; detail: string; tone: "available" | "limited" | "soldout" };

/**
 * Shopify Storefront intentionally exposes sale availability, not private stock
 * counts. Store owners can add an exact tag such as "Only 2 left" when they
 * want that shopper-facing label to appear.
 */
export function getStockStatus(product: Product): StockStatus {
  if (!product.availableForSale) {
    return { label: "Out of stock", detail: "This piece is currently unavailable to order.", tone: "soldout" };
  }

  const exactCountTag = product.tags.find(tag => /^only\s+\d+\s+left$/i.test(tag.trim()));
  if (exactCountTag) {
    return { label: exactCountTag, detail: "Limited availability — order soon.", tone: "limited" };
  }

  if (product.tags.some(tag => /^(low stock|limited stock|limited availability)$/i.test(tag.trim()))) {
    return { label: "Limited availability", detail: "Please order soon or confirm on WhatsApp.", tone: "limited" };
  }

  return { label: "In stock", detail: "Available to order now.", tone: "available" };
}

function whatsappUrl(message: string) {
  const url = new URL(`https://wa.me/${WHATSAPP_BUSINESS_NUMBER}`);
  url.searchParams.set("text", message);
  return url.toString();
}

export function createStoreWhatsAppUrl() {
  return whatsappUrl("Hello ALRAHEEM COLLECTION 786, I would like help choosing a product or placing an order.");
}

export function createProductOrderUrl({ title, price, productUrl }: { title: string; price: string; productUrl: string }) {
  return whatsappUrl(`Hello ALRAHEEM COLLECTION 786, I would like to order:\n\n• ${title}\n• Price: ${price}\n• Product: ${productUrl}\n\nPlease confirm availability, delivery charges and payment details.\n\nMy name:\nMy delivery city/address:`);
}

export function createCartOrderUrl(items: CartItem[], subtotal: Money) {
  const orderLines = items.map(item => `• ${item.productTitle}${item.variantTitle !== "Default Title" ? ` (${item.variantTitle})` : ""} × ${item.quantity} — ${formatMoney(item.lineTotal)}`).join("\n");
  return whatsappUrl(`Hello ALRAHEEM COLLECTION 786, I would like to place a direct order:\n\n${orderLines}\n\nSubtotal: ${formatMoney(subtotal)}\n\nPlease confirm availability, delivery charges and payment details.\n\nMy name:\nMy delivery city/address:`);
}

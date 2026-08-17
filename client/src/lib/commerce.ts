import type { Money, Product } from "@shared/commerce/types";

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

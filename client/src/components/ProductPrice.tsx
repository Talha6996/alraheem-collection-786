import type { Money } from "@shared/commerce/types";
import * as React from "react";
import { formatMoney, isGenuineSale } from "@/lib/commerce";

type ProductPriceProps = {
  price: Money | null | undefined;
  compareAtPrice?: Money | null;
  className?: string;
  compact?: boolean;
};

/** Renders Shopify's real old price only for an actual, currently lower sale price. */
export function ProductPrice({ price, compareAtPrice, className = "", compact = false }: ProductPriceProps) {
  const sale = isGenuineSale(price, compareAtPrice);
  const salePriceClass = compact
    ? "text-sm font-extrabold text-[#111111]"
    : "text-[15px] font-extrabold text-[#111111] sm:text-base";
  const originalPriceClass = compact
    ? "text-[9px] font-semibold text-[#c62828] decoration-[#c62828]"
    : "text-[11px] font-semibold text-[#c62828] decoration-[#c62828]";
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`} aria-label={sale ? `Sale price ${formatMoney(price)}, previously ${formatMoney(compareAtPrice)}` : `Price ${formatMoney(price)}`}>
      <strong className={sale ? salePriceClass : "font-bold text-[#123f72]"}>{formatMoney(price)}</strong>
      {sale ? <del className={originalPriceClass}>{formatMoney(compareAtPrice)}</del> : null}
      {sale && !compact ? <span className="text-[9px] font-extrabold uppercase tracking-[.11em] text-[#bb492d]">Sale</span> : null}
    </span>
  );
}

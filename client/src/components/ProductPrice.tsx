import type { Money } from "@shared/commerce/types";
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
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`} aria-label={sale ? `Sale price ${formatMoney(price)}, previously ${formatMoney(compareAtPrice)}` : `Price ${formatMoney(price)}`}>
      <strong className={sale ? "font-extrabold text-[#bb492d]" : "font-bold text-[#123f72]"}>{formatMoney(price)}</strong>
      {sale ? <del className={`text-slate-500 ${compact ? "text-[11px]" : "text-sm"}`}>{formatMoney(compareAtPrice)}</del> : null}
      {sale && !compact ? <span className="text-[9px] font-extrabold uppercase tracking-[.11em] text-[#bb492d]">Sale</span> : null}
    </span>
  );
}

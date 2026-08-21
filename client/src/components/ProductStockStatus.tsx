import React from "react";
import type { StockStatus } from "@/lib/commerce";

export default function ProductStockStatus({ status }: { status: StockStatus }) {
  const toneClass = status.tone === "soldout"
    ? "border-[#bb492d] bg-[#fbeae5] text-[#8f321d]"
    : status.tone === "limited"
      ? "border-[#d7a13f] bg-[#fff6df] text-[#8c5d0d]"
      : "border-[#92b5a0] bg-[#edf7ef] text-[#275c37]";

  return <div>
    <div className={`inline-flex w-fit items-center gap-2 border px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.12em] ${toneClass}`} aria-label={`Availability: ${status.label}`}><span className="size-1.5 rounded-full bg-current" />{status.label}</div>
    <p className="mt-2 text-xs text-slate-500">{status.detail}</p>
  </div>;
}

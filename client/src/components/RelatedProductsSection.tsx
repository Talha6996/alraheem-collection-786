import React from "react";
import { Link } from "wouter";
import type { Product } from "@shared/commerce/types";
import ProductCard from "@/components/ProductCard";

type RelatedProductsSectionProps = { products: Product[] };

export default function RelatedProductsSection({ products }: RelatedProductsSectionProps) {
  return <section className="mt-20 border-t border-[#d8d0c2] pt-12" aria-labelledby="related-pieces-heading"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow"><span />More to explore</p><h2 id="related-pieces-heading" className="font-serif text-4xl text-[#123f72]">Related <i>pieces.</i></h2></div><Link href="/shop" className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#123f72] underline underline-offset-4">Shop all</Link></div>{products.length ? <div className="product-grid">{products.map((item, index) => <ProductCard key={item.handle} product={item} index={index + 1} />)}</div> : <div className="border border-dashed border-[#d8d0c2] bg-[#f7f1e8] px-6 py-8 text-sm leading-6 text-slate-600"><strong className="block font-serif text-xl text-[#123f72]">More pieces are coming soon.</strong><span>Explore the full collection to discover other available styles.</span></div>}</section>;
}

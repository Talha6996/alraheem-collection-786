import { ArrowLeft, Sparkles, Tag } from "lucide-react";
import { Link } from "wouter";
import ProductCard from "@/components/ProductCard";
import { useCatalogueProducts } from "@/hooks/useCatalogueProducts";
import type { Product } from "@shared/commerce/types";

type PromotionKind = "new" | "sale";

function isSaleProduct(product: Product) {
  return product.variants.some(variant => variant.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount));
}

export default function PromotionCatalogue({ kind }: { kind: PromotionKind }) {
  const { data: products = [], isLoading, error } = useCatalogueProducts({ first: 80, sort: "NEWEST" });
  const isNew = kind === "new";
  const filtered = isNew ? products.slice(0, 24) : products.filter(isSaleProduct);
  const icon = isNew ? <Sparkles size={15} /> : <Tag size={15} />;
  const eyebrow = isNew ? "Just arrived" : "Limited-time prices";
  const title = isNew ? <>New <i>arrivals.</i></> : <>The <i>sale.</i></>;
  const description = isNew ? "The latest pieces added to the ALRAHEEM COLLECTION 786 collection." : "Current pieces with a genuine marked-down price.";

  return <section className="bg-[#fffdf9] py-8 md:py-14"><div className="container"><Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#123f72]"><ArrowLeft size={14} /> Back to shop</Link><div className="mb-10 max-w-2xl"><p className="eyebrow"><span />{eyebrow}</p><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#123f72] text-[#f9f6ef]">{icon}</span><h1 className="font-serif text-5xl tracking-[-.04em] text-[#123f72] md:text-7xl">{title}</h1></div><p className="mt-5 text-sm leading-7 text-slate-600">{description}</p></div>{isLoading ? <div className="product-grid" aria-busy="true">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[3/4] animate-pulse bg-[#eee8dd]" />)}</div> : error ? <div className="border border-[#bb492d] bg-[#fbeae5] p-6 text-sm text-[#8f321d]">The latest products could not be loaded. Please refresh or return shortly.</div> : filtered.length ? <div className="product-grid">{filtered.map((product, index) => <ProductCard key={product.handle} product={product} index={index + 1} />)}</div> : <div className="border border-dashed border-[#d8d0c2] bg-[#f9f6ef] px-6 py-14 text-center"><h2 className="font-serif text-3xl text-[#123f72]">Nothing here just yet.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{isNew ? "New pieces will appear here as soon as they are added to the collection." : "Sale pieces will appear here whenever a regular price is reduced."}</p><Link href="/shop" className="mt-6 inline-flex text-[10px] font-extrabold uppercase tracking-[.14em] text-[#123f72] underline underline-offset-4">Browse all pieces</Link></div>}</div></section>;
}

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { SlidersHorizontal } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

function queryValue(key: string) {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

export default function Shop() {
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 24 });
  const [activeCategory, setActiveCategory] = useState<string>(() => queryValue("category"));
  const query = queryValue("q").toLowerCase();
  const activeTag = queryValue("tag");
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(product => product.productType ?? "").filter(Boolean)))], [products]);
  const visible = useMemo(() => products.filter(product => {
    const categoryMatch = !activeCategory || activeCategory === "All" || product.productType === activeCategory;
    const tagMatch = !activeTag || product.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase());
    const queryMatch = !query || `${product.title} ${product.productType} ${product.tags.join(" ")}`.toLowerCase().includes(query);
    return categoryMatch && tagMatch && queryMatch;
  }), [activeCategory, activeTag, products, query]);

  return <section className="bg-[#fffdf9] py-12 md:py-20"><div className="container"><p className="eyebrow"><span />The shop</p><div className="flex flex-col justify-between gap-8 border-b border-[#d8d0c2] pb-8 md:flex-row md:items-end"><div><h1 className="font-serif text-5xl leading-[.92] tracking-[-.04em] text-[#123f72] md:text-7xl">The considered <i className="text-[#bb492d]">edit.</i></h1><p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">Live pieces from ALRAHEEM COLLECTION 786, presented with PKR pricing and a direct path to secure checkout.</p></div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#647182]"><SlidersHorizontal size={16} /> {visible.length} piece{visible.length === 1 ? "" : "s"} found</div></div><div className="filter-row">{categories.map(category => <button type="button" key={category} className={!activeCategory && category === "All" || activeCategory === category ? "is-active" : ""} onClick={() => setActiveCategory(category === "All" ? "" : category)}>{category}</button>)}</div>{isLoading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-[#eee8dd]" />)}</div> : visible.length ? <div className="product-grid">{visible.map((product, index) => <ProductCard key={product.id} product={product} index={index + 1} />)}</div> : <div className="empty-collection"><p>No pieces match this part of the edit yet.</p><Link href="/shop" className="text-button">See every live piece</Link></div>}</div></section>;
}

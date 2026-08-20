import { useMemo, useState } from "react";
import { Link } from "wouter";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCatalogueProducts } from "@/hooks/useCatalogueProducts";
import { findStoreCategory, STORE_CATEGORIES } from "@/lib/storeCategories";

function queryValue(key: string) {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<string>(() => findStoreCategory(queryValue("category"))?.collectionHandle ?? "");
  const activeStoreCategory = useMemo(() => STORE_CATEGORIES.find(category => category.collectionHandle === activeCategory), [activeCategory]);
  const catalogueInput = useMemo(() => activeStoreCategory ? { first: 24, collectionHandle: activeStoreCategory.collectionHandle } : { first: 24 }, [activeStoreCategory]);
  const { data: products = [], isLoading } = useCatalogueProducts(catalogueInput);
  const query = queryValue("q").toLowerCase();
  const activeTag = queryValue("tag");
  const visible = useMemo(() => products.filter(product => {
    const tagMatch = !activeTag || product.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase());
    const queryMatch = !query || `${product.title} ${product.productType} ${product.tags.join(" ")}`.toLowerCase().includes(query);
    return tagMatch && queryMatch;
  }), [activeTag, products, query]);

  return <section className="bg-[#fffdf9] py-12 md:py-20"><div className="container"><p className="eyebrow"><span />The shop</p><div className="flex flex-col justify-between gap-8 border-b border-[#d8d0c2] pb-8 md:flex-row md:items-end"><div><h1 className="font-serif text-5xl leading-[.92] tracking-[-.04em] text-[#123f72] md:text-7xl">The considered <i className="text-[#bb492d]">edit.</i></h1><p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">Live pieces from ALRAHEEM COLLECTION 786, presented in PKR with direct WhatsApp ordering and secure checkout.</p></div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#647182]"><SlidersHorizontal size={16} /> {visible.length} piece{visible.length === 1 ? "" : "s"} found</div></div><div className="filter-row"><button type="button" className={!activeCategory ? "is-active" : ""} onClick={() => setActiveCategory("")}>All</button>{STORE_CATEGORIES.map(category => <button type="button" key={category.collectionHandle} className={activeCategory === category.collectionHandle ? "is-active" : ""} onClick={() => setActiveCategory(category.collectionHandle)}>{category.name}</button>)}</div>{isLoading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-[#eee8dd]" />)}</div> : visible.length ? <div className="product-grid">{visible.map((product, index) => <ProductCard key={product.id} product={product} index={index + 1} />)}</div> : <div className="empty-collection"><p>{activeStoreCategory ? `${activeStoreCategory.name} is being arranged.` : "The live collection is being arranged."}</p><p className="max-w-xs text-center text-xs leading-5 text-[#647182]">New pieces will appear here as they are added from Shopify.</p><Link href="/contact" className="text-button">Contact the studio</Link></div>}</div></section>;
}

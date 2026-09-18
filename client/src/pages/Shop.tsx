import { useMemo, useState } from "react";
import { Link } from "wouter";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCatalogueProducts } from "@/hooks/useCatalogueProducts";
import { findStoreCategory, STORE_CATEGORIES } from "@/lib/storeCategories";
import { trpc } from "@/lib/trpc";

function queryValue(key: string) {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<string>(() => findStoreCategory(queryValue("category"))?.collectionHandle ?? queryValue("category"));
  const { data: liveCollections = [] } = trpc.commerce.collections.list.useQuery({ first: 50 }, { staleTime: 30_000, refetchInterval: 60_000 });
  const availableCategories = useMemo(() => {
    const known = new Map(STORE_CATEGORIES.map(category => [category.collectionHandle, { ...category, title: category.name }]));
    for (const collection of liveCollections) {
      if (!known.has(collection.handle)) known.set(collection.handle, { name: collection.title, title: collection.title, collectionHandle: collection.handle, productType: collection.handle, href: `/shop?category=${encodeURIComponent(collection.handle)}`, image: STORE_CATEGORIES[0]?.image ?? "", sourceFile: "shopify", position: "dynamic" });
    }
    return Array.from(known.values());
  }, [liveCollections]);
  const activeStoreCategory = useMemo(() => availableCategories.find(category => category.collectionHandle === activeCategory), [activeCategory, availableCategories]);
  const catalogueInput = useMemo(() => activeCategory ? { all: true, collectionHandle: activeCategory } : { all: true }, [activeCategory]);
  const { data: products = [], isLoading } = useCatalogueProducts(catalogueInput);
  const query = queryValue("q").toLowerCase();
  const activeTag = queryValue("tag");
  const [activeBudget, setActiveBudget] = useState<number>(() => Number(queryValue("budget")) || 0);
  const visible = useMemo(() => products.filter(product => {
    const tagMatch = !activeTag || product.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase());
    const queryMatch = !query || `${product.title} ${product.productType} ${product.tags.join(" ")}`.toLowerCase().includes(query);
    const budgetMatch = !activeBudget || Number(product.priceRange.min.amount) < activeBudget;
    return tagMatch && queryMatch && budgetMatch;
  }), [activeBudget, activeTag, products, query]);

  return <section className="bg-[#fffdf9] py-12 md:py-20"><div className="container"><p className="eyebrow"><span />The shop</p><div className="flex flex-col justify-between gap-8 border-b border-[#d8d0c2] pb-8 md:flex-row md:items-end"><div><h1 className="font-serif text-5xl leading-[.92] tracking-[-.04em] text-[#123f72] md:text-7xl">The considered <i className="text-[#bb492d]">edit.</i></h1><p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">Live pieces from ALRAHEEM COLLECTION 786, presented in PKR with direct WhatsApp ordering and secure checkout.</p></div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#647182]"><SlidersHorizontal size={16} /> {visible.length} piece{visible.length === 1 ? "" : "s"} found</div></div><div className="mt-7 flex flex-col gap-3 rounded-sm border border-[#d8d0c2] bg-[#f9f6ef] p-4 sm:flex-row sm:items-center sm:justify-between"><label htmlFor="collection-select" className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#123f72]">Browse collections</label><select id="collection-select" value={activeCategory} onChange={event => setActiveCategory(event.target.value)} className="w-full rounded-sm border border-[#cfc5b5] bg-white px-4 py-3 text-sm font-bold text-[#123f72] outline-none focus:border-[#bb492d] sm:max-w-sm"><option value="">All collections</option>{availableCategories.map(category => <option key={category.collectionHandle} value={category.collectionHandle}>{category.name}</option>)}</select></div><div className="mt-5 flex flex-wrap items-center gap-2"><span className="mr-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#58708a]">Shop by budget</span>{[{ label: "All prices", value: 0 }, { label: "Under PKR 2,000", value: 2000 }, { label: "Under PKR 5,000", value: 5000 }, { label: "Under PKR 10,000", value: 10000 }].map(option => <button key={option.value} type="button" className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] transition ${activeBudget === option.value ? "border-[#123f72] bg-[#123f72] text-white" : "border-[#d8d0c2] text-[#58708a] hover:border-[#123f72]"}`} onClick={() => setActiveBudget(option.value)}>{option.label}</button>)}</div>{isLoading ? <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-[#eee8dd]" />)}</div> : visible.length ? <div className="product-grid mt-7">{visible.map((product, index) => <ProductCard key={product.id} product={product} index={index + 1} />)}</div> : <div className="empty-collection"><p>{activeStoreCategory ? `${activeStoreCategory.name} is being arranged.` : "No pieces match these filters just now."}</p><p className="max-w-xs text-center text-xs leading-5 text-[#647182]">Try another budget or browse the full collection.</p><Link href="/contact" className="text-button">Contact the studio</Link></div>}</div></section>;
}

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { STORE_CATEGORIES } from "@/lib/storeCategories";

const jewellerySubcategoryNames = new Set([
  "party set", "1 carat bangles", "bangles", "gold plated bangles",
  "1 carat earrings", "brand earrings", "jewllery sets", "jewellery sets",
  "1 carat jewellery sets", "ladies watches",
]);

function isJewellerySubcategory(category: { name: string; productType: string }) {
  return jewellerySubcategoryNames.has(category.name.trim().toLowerCase()) || jewellerySubcategoryNames.has(category.productType.trim().toLowerCase());
}

export default function Jewellery() {
  const { data: liveCollections = [], isLoading } = trpc.commerce.collections.list.useQuery(
    { first: 50 },
    { staleTime: 30_000, refetchInterval: 60_000 }
  );
  const known = new Map(STORE_CATEGORIES.map(category => [category.collectionHandle, category]));
  for (const collection of liveCollections) {
    if (!known.has(collection.handle)) known.set(collection.handle, {
      name: collection.title,
      productType: collection.handle,
      collectionHandle: collection.handle,
      href: `/shop?category=${encodeURIComponent(collection.handle)}`,
      image: collection.image?.url ?? STORE_CATEGORIES[0]?.image ?? "",
      sourceFile: "shopify",
      position: "dynamic",
    });
  }
  const collections = Array.from(known.values()).filter(isJewellerySubcategory);

  return <main className="min-h-[70vh] bg-[#f9f6ef] py-12 md:py-20"><div className="container"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-[#58708a] hover:text-[#bb492d]"><ArrowLeft size={14} /> Back to home</Link><div className="mx-auto max-w-3xl text-center"><p className="eyebrow justify-center"><span />ALRAHEEM COLLECTION 786</p><h1 className="mt-4 font-serif text-5xl leading-none text-[#123f72] md:text-7xl">Choose your <i>jewellery.</i></h1><p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#58708a]">Explore our jewellery collections and choose the style you would like to browse.</p></div><section className="mt-12"><div className="mb-6 flex items-end justify-between gap-4"><h2 className="font-serif text-2xl text-[#123f72]">Select a collection</h2><span className="text-right text-[10px] font-extrabold uppercase tracking-[.12em] text-[#58708a]">Live from Shopify</span></div>{isLoading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-[#eee8dd]" />)}</div> : collections.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-5">{collections.map(category => <Link key={category.collectionHandle} href={category.href} className="group border border-[#e6dfd3] bg-white"><div className="aspect-[4/5] overflow-hidden bg-[#eee8dd]"><img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" /></div><div className="p-4"><b className="block text-xs uppercase tracking-[.08em] text-[#123f72]">{category.name}</b><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#bb492d]">Browse collection <ArrowRight size={11} /></span></div></Link>)}</div> : <div className="border border-[#d8d0c2] bg-white p-8 text-center text-sm text-[#58708a]">Jewellery collections will appear here as soon as Shopify publishes them.</div>}</section></div></main>;
}

export { isJewellerySubcategory, jewellerySubcategoryNames };

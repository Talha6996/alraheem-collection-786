import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import HomePromoBanner from "@/components/HomePromoBanner";
import { useCatalogueProducts } from "@/hooks/useCatalogueProducts";
import { storefrontAsset } from "@/lib/storeAssets";
import { STORE_CATEGORIES } from "@/lib/storeCategories";
import { trpc } from "@/lib/trpc";

const assets = {
  logo: storefrontAsset("/manus-storage/alraheem-collection-786-exact-logo_6b12493a.png"),
  hero: storefrontAsset("/manus-storage/alraheem-hero-user-replacement_4761f1e6.png"),
};

const jewellerySubcategoryNames = new Set([
  "party set",
  "1 carat bangles",
  "bangles",
  "gold plated bangles",
  "1 carat earrings",
  "brand earrings",
  "jewllery sets",
  "jewellery sets",
  "1 carat jewellery sets",
  "ladies watches",
]);

function isJewellerySubcategory(category: { name: string; productType: string }) {
  return jewellerySubcategoryNames.has(category.name.trim().toLowerCase()) || jewellerySubcategoryNames.has(category.productType.trim().toLowerCase());
}

export default function Home() {
  const [loadPromotions, setLoadPromotions] = useState(false);
  const [jewelleryOpen, setJewelleryOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadPromotions(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const { data: products = [], isLoading } = useCatalogueProducts(
    { first: 8 },
    { enabled: loadPromotions }
  );
  const { data: liveCollections = [] } = trpc.commerce.collections.list.useQuery(
    { first: 50 },
    { staleTime: 30_000, refetchInterval: 60_000 }
  );
  const homepageCategories = useMemo(() => {
    const known = new Map(STORE_CATEGORIES.map(category => [category.collectionHandle, category]));
    for (const collection of liveCollections) {
      if (!known.has(collection.handle)) {
        known.set(collection.handle, {
          name: collection.title,
          productType: collection.handle,
          collectionHandle: collection.handle,
          href: `/shop?category=${encodeURIComponent(collection.handle)}`,
          image: collection.image?.url ?? STORE_CATEGORIES[0]?.image ?? "",
          sourceFile: "shopify",
          position: "dynamic",
        });
      }
    }
    return Array.from(known.values());
  }, [liveCollections]);

  const jewellerySubcategories = homepageCategories.filter(isJewellerySubcategory);
  const topLevelCategories = homepageCategories.filter(category =>
    category.collectionHandle !== "jewellery" && !isJewellerySubcategory(category)
  );
  const jewelleryImage = STORE_CATEGORIES.find(category => category.collectionHandle === "jewellery")?.image ?? "";

  return <><section className="hero-section"><div className="hero-copy"><p className="eyebrow"><span />ALRAHEEM COLLECTION 786</p><h1>Pieces<br />with<br /><i>presence.</i></h1><p>From jewellery and handbags to considered suits and bridal sets, discover pieces selected for meaningful moments.</p><div className="hero-buttons"><Link href="/shop" className="button-primary">Shop the collection <ArrowRight size={15} /></Link><button type="button" className="text-button" onClick={() => setJewelleryOpen(true)}>Explore jewellery <ArrowRight size={15} /></button></div><div className="hero-caption"><span>01</span> Jewellery, signature accessories and occasion dressing</div></div><div className="hero-visual"><img src={assets.hero} alt="ALRAHEEM COLLECTION 786 fashion collection" fetchPriority="high" decoding="async" /><div className="hero-logo-plaque"><img src={assets.logo} alt="ALRAHEEM COLLECTION 786 official logo" decoding="async" /></div><div className="hero-image-caption">Celebrating colour &amp; craft</div></div></section><HomePromoBanner products={products} loading={!loadPromotions || isLoading} /><section className="category-section container"><div className="section-intro"><div><p className="eyebrow"><span />Browse the collection</p><h2>Find your <i>piece.</i></h2></div><p>Choose Jewellery to browse its live subcollections, or explore another collection.</p></div><div className="category-grid category-grid--seven"><button type="button" className={`category-card text-left ${jewelleryOpen ? "ring-2 ring-[#bb492d]" : ""}`} onClick={() => setJewelleryOpen(value => !value)} aria-expanded={jewelleryOpen}><img src={jewelleryImage} className="object-center" alt="Jewellery" loading="lazy" decoding="async" /><div className="category-card-overlay" /><div><small>01 / Collection</small><b>JEWELLERY</b><em>{jewelleryOpen ? "Hide collections" : "Choose a collection"} <ArrowRight size={13} /></em></div></button>{topLevelCategories.map((category, index) => <Link key={category.productType} href={category.href} className="category-card"><img src={category.image} className={category.position} alt={category.name} loading="lazy" decoding="async" /><div className="category-card-overlay" /><div><small>{String(index + 2).padStart(2, "0")} / Collection</small><b>{category.name}</b><em>Explore <ArrowRight size={13} /></em></div></Link>)}{jewelleryOpen && <div className="col-span-full border border-[#d8d0c2] bg-[#fffdf9] p-5 md:p-7"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow"><span />Jewellery collection</p><h3 className="font-serif text-2xl text-[#123f72]">Choose a jewellery <i>collection.</i></h3></div><span className="text-right text-[10px] font-extrabold uppercase tracking-[.12em] text-[#58708a]">Live from Shopify</span></div>{jewellerySubcategories.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{jewellerySubcategories.map(category => <Link key={category.collectionHandle} href={category.href} className="group border border-[#e6dfd3] bg-white"><div className="aspect-[4/5] overflow-hidden bg-[#eee8dd]"><img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" /></div><div className="p-3"><b className="block text-xs uppercase tracking-[.08em] text-[#123f72]">{category.name}</b><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#bb492d]">Explore <ArrowRight size={11} /></span></div></Link>)}</div> : <p className="text-sm text-[#58708a]">Jewellery subcollections will appear here as soon as Shopify publishes them.</p>}</div>}</div></section><section className="editorial-band"><div className="container editorial-band-inner"><div className="editorial-band-copy"><p className="eyebrow"><span />Bridal sets</p><h2>For the moment<br /><i>you will remember.</i></h2><p>Explore pieces selected for celebrations, milestones and meaningful gifting.</p><Link href="/shop?category=Bridal+Sets" className="button-light">Explore bridal sets <ArrowRight size={14} /></Link></div><div className="editorial-band-image gift-composition"><div className="gift-card gift-card--one" /><div className="gift-card gift-card--two" /></div></div></section></>;
}

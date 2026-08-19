import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import HomePromoBanner from "@/components/HomePromoBanner";
import { STORE_CATEGORIES } from "@/lib/storeCategories";

const assets = {
  logo: "/manus-storage/alraheem-collection-786-exact-logo_6b12493a.png",
  hero: "/manus-storage/alraheem-hero-user-replacement_4761f1e6.png",
};

export default function Home() {
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 8 });

  return <><section className="hero-section"><div className="hero-copy"><p className="eyebrow"><span />ALRAHEEM COLLECTION 786</p><h1>Pieces<br />with<br /><i>presence.</i></h1><p>From jewellery and handbags to considered suits and bridal sets, discover pieces selected for meaningful moments.</p><div className="hero-buttons"><Link href="/shop" className="button-primary">Shop the collection <ArrowRight size={15} /></Link><Link href="/shop?category=Jewellery" className="text-button">Explore jewellery</Link></div><div className="hero-caption"><span>01</span> Jewellery, signature accessories and occasion dressing</div></div><div className="hero-visual"><img src={assets.hero} alt="ALRAHEEM COLLECTION 786 fashion collection" /><div className="hero-logo-plaque"><img src={assets.logo} alt="ALRAHEEM COLLECTION 786 official logo" /></div><div className="hero-image-caption">Celebrating colour &amp; craft</div></div></section><HomePromoBanner products={products} loading={isLoading} /><section className="category-section container"><div className="section-intro"><div><p className="eyebrow"><span />Browse the collection</p><h2>Find your <i>piece.</i></h2></div><p>Seven signature categories, each presented with a distinct point of view.</p></div><div className="category-grid category-grid--seven">{STORE_CATEGORIES.map((category, index) => <Link key={category.productType} href={category.href} className="category-card"><img src={category.image} className={category.position} alt={category.name} /><div className="category-card-overlay" /><div><small>{String(index + 1).padStart(2, "0")} / Collection</small><b>{category.name}</b><em>Explore <ArrowRight size={13} /></em></div></Link>)}</div></section><section className="editorial-band"><div className="container editorial-band-inner"><div className="editorial-band-copy"><p className="eyebrow"><span />Bridal sets</p><h2>For the moment<br /><i>you will remember.</i></h2><p>Explore pieces selected for celebrations, milestones and meaningful gifting.</p><Link href="/shop?category=Bridal+Sets" className="button-light">Explore bridal sets <ArrowRight size={14} /></Link></div><div className="editorial-band-image gift-composition"><div className="gift-card gift-card--one" /><div className="gift-card gift-card--two" /></div></div></section></>;
}

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Pause, Play, Sparkles, Tag } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/commerce/types";
import { formatMoney, primaryVariant } from "@/lib/commerce";

type PromotionSlide = {
  kind: "new" | "sale";
  eyebrow: string;
  title: string;
  copy: string;
  button: string;
  product: Product;
  price: string;
  previousPrice?: string;
};

function isSaleProduct(product: Product) {
  return product.variants.some(variant => {
    if (!variant.compareAtPrice) return false;
    return Number(variant.compareAtPrice.amount) > Number(variant.price.amount);
  });
}

export function createPromotionSlides(products: Product[]): PromotionSlide[] {
  if (!products.length) return [];
  const newArrival = products.find(product => product.tags.some(tag => /new\s*(in|arrival)/i.test(tag))) ?? products[0];
  const slides: PromotionSlide[] = [{
    kind: "new",
    eyebrow: "New arrivals",
    title: newArrival.title,
    copy: "Just added to the ALRAHEEM COLLECTION 786 edit. Discover the latest piece before it moves on.",
    button: "Shop new arrival",
    product: newArrival,
    price: formatMoney(newArrival.priceRange.min),
  }];
  const sale = products.find(isSaleProduct);
  if (sale) {
    const variant = sale.variants.find(item => item.compareAtPrice && Number(item.compareAtPrice.amount) > Number(item.price.amount)) ?? primaryVariant(sale);
    slides.push({
      kind: "sale",
      eyebrow: "Special offer",
      title: sale.title,
      copy: "A considered offer on a live ALRAHEEM piece. Available while current stock remains.",
      button: "View special offer",
      product: sale,
      price: formatMoney(variant?.price ?? sale.priceRange.min),
      previousPrice: variant?.compareAtPrice ? formatMoney(variant.compareAtPrice) : undefined,
    });
  }
  return slides;
}

export default function HomePromoBanner({ products, loading }: { products: Product[]; loading: boolean }) {
  const slides = useMemo(() => createPromotionSlides(products), [products]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => setActive(current => Math.min(current, Math.max(0, slides.length - 1))), [slides.length]);
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion || slides.length < 2) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (loading) return <section className="promo-banner is-loading" aria-label="Loading promotional offers"><div className="container"><div className="promo-skeleton" /></div></section>;
  if (!slides.length) return null;

  const slide = slides[active] ?? slides[0];
  const image = slide.product.images[0];
  return <section className="promo-banner" aria-label="New arrivals and special offers" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="container promo-banner-inner">
      <div className="promo-banner-copy" aria-live="polite">
        <p className="eyebrow"><span />{slide.eyebrow}</p>
        <h2>{slide.kind === "sale" ? <>A beautiful <i>offer.</i></> : <>Fresh to the <i>edit.</i></>}</h2>
        <h3>{slide.title}</h3>
        <p>{slide.copy}</p>
        <div className="promo-price"><strong>{slide.price}</strong>{slide.previousPrice && <del>{slide.previousPrice}</del>}</div>
        <Link href={`/product/${slide.product.handle}`} className="button-primary">{slide.button} <ArrowRight size={14} /></Link>
        <div className="promo-controls"><div className="promo-dots" aria-label="Promotional banner slides">{slides.map((item, index) => <button key={`${item.kind}-${item.product.id}`} type="button" className={active === index ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Show ${item.eyebrow}: ${item.product.title}`} aria-current={active === index} />)}</div>{slides.length > 1 && <button type="button" className="promo-pause" onClick={() => setPaused(value => !value)} aria-label={paused ? "Resume banner rotation" : "Pause banner rotation"}>{paused ? <Play size={13} /> : <Pause size={13} />}{paused ? "Play" : "Pause"}</button>}</div>
      </div>
      <Link href={`/product/${slide.product.handle}`} className="promo-banner-image" aria-label={`View ${slide.title}`}>
        {image ? <img src={image.url} alt={image.altText ?? slide.title} loading="lazy" decoding="async" /> : <div className="promo-image-fallback"><Sparkles size={30} /></div>}
        <div className={`promo-badge ${slide.kind}`}><span>{slide.kind === "sale" ? <Tag size={13} /> : <Sparkles size={13} />}</span>{slide.kind === "sale" ? "Sale" : "New"}</div>
      </Link>
    </div>
  </section>;
}

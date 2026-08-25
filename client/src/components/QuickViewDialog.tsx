import { useState } from "react";
import { ExternalLink, MessageCircle, ShoppingBag, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import type { Product } from "@shared/commerce/types";
import { useCart } from "@/contexts/CartContext";
import { createProductOrderUrl, formatMoney, primaryVariant } from "@/lib/commerce";

const FALLBACK_IMAGE = "/manus-storage/alraheem-accessories-flatlay_814b21f8.jpg";

export function QuickViewDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const { addItem, loading } = useCart();
  const variant = primaryVariant(product);
  const image = product.images[0];
  const orderUrl = createProductOrderUrl({
    title: product.title,
    price: formatMoney(product.priceRange.min),
    productUrl: `${window.location.origin}/product/${product.handle}`,
  });

  const addToBag = async () => {
    if (!variant?.availableForSale) return;
    try {
      await addItem(variant.id);
      toast.success(`${product.title} is in your bag.`);
      setOpen(false);
    } catch (error) {
      toast.error("We could not add that piece just now.", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  return <>
    <button className="quick-view" type="button" onClick={() => setOpen(true)}>Quick view</button>
    {open ? <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-label={`Quick view of ${product.title}`}>
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close quick view" onClick={() => setOpen(false)} />
      <section className="relative grid w-full max-w-4xl overflow-hidden bg-[#fffdf9] shadow-2xl md:grid-cols-[.9fr_1.1fr]">
        <button type="button" onClick={() => setOpen(false)} aria-label="Close quick view" className="absolute right-3 top-3 z-10 rounded-full bg-[#fffdf9]/90 p-2 text-[#123f72] shadow-sm hover:bg-white"><X size={18} /></button>
        <div className="min-h-72 bg-[#f2ede4] p-4"><img className="h-full w-full object-contain" src={image?.url ?? FALLBACK_IMAGE} alt={image?.altText ?? product.title} /></div>
        <div className="flex flex-col p-7 md:p-9"><p className="eyebrow"><span />{product.productType || "ALRAHEEM edit"}</p><h2 className="mt-2 font-serif text-4xl leading-none text-[#123f72] md:text-5xl">{product.title}</h2><p className="mt-4 text-lg text-[#bb492d]">{formatMoney(product.priceRange.min)}</p><p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">{product.description || "A considered piece from the ALRAHEEM COLLECTION 786 edit."}</p><div className="mt-auto flex flex-wrap gap-3 pt-7"><button type="button" className="button-primary" disabled={!variant?.availableForSale || loading} onClick={addToBag}><ShoppingBag size={15} /> {variant?.availableForSale ? "Add to bag" : "Unavailable"}</button><a href={orderUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[45px] items-center gap-2 bg-[#25D366] px-4 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#062e19] hover:bg-[#1fb85a]"><MessageCircle size={15} /> WhatsApp</a><Link href={`/product/${product.handle}`} onClick={() => setOpen(false)} className="inline-flex min-h-[45px] items-center gap-2 border border-[#123f72] px-4 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#123f72]">Full details <ExternalLink size={14} /></Link></div></div>
      </section>
    </div> : null}
  </>;
}

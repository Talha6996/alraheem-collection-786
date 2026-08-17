import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { formatMoney, primaryVariant } from "@/lib/commerce";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:handle");
  const handle = params?.handle ?? "";
  const { data: product, isLoading } = trpc.commerce.products.byHandle.useQuery({ handle }, { enabled: Boolean(handle) });
  const { addItem, loading } = useCart();
  const { isSaved, toggle } = useWishlist();
  const variant = product ? primaryVariant(product) : null;

  const addToBag = async () => {
    if (!product || !variant?.availableForSale) return;
    try { await addItem(variant.id); toast.success(`${product.title} is in your bag.`); }
    catch (error) { toast.error("We could not add that piece.", { description: error instanceof Error ? error.message : "Please try again." }); }
  };

  if (isLoading) return <section className="container grid min-h-[70vh] place-items-center"><p className="text-sm text-slate-500">Arranging the piece…</p></section>;
  if (!product) return <section className="container flex min-h-[70vh] flex-col items-center justify-center text-center"><p className="eyebrow"><span />Not found</p><h1 className="font-serif text-5xl text-[#123f72]">This piece has moved on.</h1><Link href="/shop" className="button-primary mt-6">Return to the edit</Link></section>;

  const saved = isSaved(product.handle);
  return <section className="bg-[#fffdf9] py-8 md:py-14"><div className="container"><Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#123f72]"><ArrowLeft size={14} /> Back to the edit</Link><div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr]"><div className="bg-[#eee8dd] p-3"><img className="aspect-[4/5] w-full object-cover" src={product.images[0]?.url ?? "/manus-storage/alraheem-apparel-stilllife_45d8153a.jpg"} alt={product.images[0]?.altText ?? product.title} /></div><div className="flex flex-col justify-center"><p className="eyebrow"><span />{product.productType || "ALRAHEEM edit"}</p><h1 className="font-serif text-5xl leading-[.92] tracking-[-.04em] text-[#123f72] md:text-7xl">{product.title}</h1><p className="mt-5 text-xl text-[#bb492d]">{formatMoney(product.priceRange.min)}</p><p className="mt-7 max-w-xl text-sm leading-7 text-slate-600">{product.description || "A considered piece created for the ease and intent of everyday dressing."}</p><div className="mt-6 flex flex-wrap gap-2">{product.tags.map(tag => <span key={tag} className="border border-[#d8d0c2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#58708a]">{tag}</span>)}</div><div className="mt-9 flex flex-wrap gap-3"><button type="button" className="button-primary" onClick={addToBag} disabled={!variant?.availableForSale || loading}><ShoppingBag size={15} /> {variant?.availableForSale ? "Add to bag" : "Unavailable"}</button><button type="button" onClick={() => toggle(product.handle)} className="inline-flex min-h-[45px] items-center gap-2 border border-[#123f72] px-4 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#123f72]"><Heart size={15} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save piece"}</button></div><p className="mt-7 border-t border-[#d8d0c2] pt-5 text-xs leading-6 text-slate-500">Complimentary delivery applies on orders over PKR 5,000. Secure checkout opens with our store partner.</p></div></div></div></section>;
}

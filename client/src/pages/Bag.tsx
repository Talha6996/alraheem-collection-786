import { ArrowRight, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { createCartOrderUrl, formatMoney, multiplyMoney } from "@/lib/commerce";
import { ProductPrice } from "@/components/ProductPrice";

export default function Bag() {
  const { cart, loading, updateQuantity, removeItem, proceedToCheckout } = useCart();
  const safely = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      toast.error("Your bag could not be changed.", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };
  const items = cart?.items ?? [];
  const whatsappOrderUrl = cart ? createCartOrderUrl(items, cart.subtotal) : "";

  return (
    <section className="min-h-[70vh] bg-[#fffdf9] py-12 md:py-20">
      <div className="container max-w-5xl">
        <p className="eyebrow"><span />Your selection</p>
        <h1 className="font-serif text-5xl tracking-[-.04em] text-[#123f72] md:text-7xl">Your shopping bag.</h1>
        {items.length ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_330px]">
            <div className="divide-y divide-[#d8d0c2] border-y border-[#d8d0c2]">
              {items.map(item => (
                <article key={item.lineId} className="flex gap-4 py-5 sm:gap-6">
                  <img className="h-32 w-24 object-cover sm:h-40 sm:w-32" src={item.image?.url ?? "/manus-storage/alraheem-accessories-flatlay_814b21f8.jpg"} alt={item.image?.altText ?? item.productTitle} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-[#123f72]">{item.productTitle}</h2>
                        {item.variantTitle !== "Default Title" && <p className="mt-1 text-xs text-slate-500">{item.variantTitle}</p>}
                      </div>
                      <ProductPrice className="justify-end text-sm" compact price={item.lineTotal} compareAtPrice={multiplyMoney(item.compareAtPrice, item.quantity)} />
                    </div>
                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex items-center border border-[#d8d0c2]">
                        <button type="button" aria-label={`Decrease ${item.productTitle}`} className="p-2 hover:bg-[#eee8dd]" disabled={loading} onClick={() => safely(() => updateQuantity(item.lineId, Math.max(0, item.quantity - 1)))}><Minus size={14} /></button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button type="button" aria-label={`Increase ${item.productTitle}`} className="p-2 hover:bg-[#eee8dd]" disabled={loading} onClick={() => safely(() => updateQuantity(item.lineId, item.quantity + 1))}><Plus size={14} /></button>
                      </div>
                      <button type="button" className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.13em] text-[#bb492d]" disabled={loading} onClick={() => safely(() => removeItem(item.lineId))}><Trash2 size={13} /> Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="h-fit bg-[#123f72] p-7 text-[#f9f6ef]">
              <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#f3b49d]">Order summary</p>
              <div className="mt-6 flex justify-between border-b border-white/20 pb-4 text-sm"><span>Subtotal</span><span className="font-bold">{formatMoney(cart?.subtotal)}</span></div>
              <p className="my-5 text-xs leading-6 text-[#cbd6e2]">Choose secure checkout for an online order, or use WhatsApp to confirm cash-on-delivery and delivery details directly with our team.</p>
              <button type="button" className="button-light w-full justify-center" disabled={loading} onClick={proceedToCheckout}>Secure checkout <ArrowRight size={14} /></button>
              <a className="mt-3 flex min-h-[45px] items-center justify-center gap-2 bg-[#25D366] px-4 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#062e19] transition hover:bg-[#1fb85a]" href={whatsappOrderUrl} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Order on WhatsApp</a>
              <Link href="/shop" className="mt-5 block text-center text-[10px] font-extrabold uppercase tracking-[.13em] text-[#f9f6ef] underline underline-offset-4">Continue shopping</Link>
            </aside>
          </div>
        ) : (
          <div className="mt-10 grid min-h-80 place-items-center bg-[#f5f1e9] px-6 text-center">
            <div><ShoppingBag className="mx-auto text-[#bb492d]" size={32} /><h2 className="mt-4 font-serif text-4xl text-[#123f72]">Your bag is waiting.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Choose a piece from the live ALRAHEEM edit to begin.</p><Link href="/shop" className="button-primary mt-6">Shop the edit <ArrowRight size={14} /></Link></div>
          </div>
        )}
      </div>
    </section>
  );
}

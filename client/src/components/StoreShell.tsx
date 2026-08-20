import { type ReactNode, useState } from "react";
import { ArrowRight, Heart, Menu, MessageCircle, PackageCheck, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { createCartOrderUrl, formatMoney } from "@/lib/commerce";
import { STORE_CATEGORIES } from "@/lib/storeCategories";

const LOGO = "/manus-storage/alraheem-collection-786-exact-logo_6b12493a.png";
const navigation = STORE_CATEGORIES.map(category => [category.name, category.href] as const);

function CartDrawer() {
  const { cart, isOpen, closeCart, loading, updateQuantity, removeItem, proceedToCheckout } = useCart();
  if (!isOpen) return null;

  const safely = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      toast.error("The bag could not be updated.", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <aside className="flex h-full w-full max-w-md flex-col bg-[#fffdf9] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#d8d0c2] px-6 py-5">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#bb492d]">Your selection</p><h2 className="font-serif text-3xl text-[#123f72]">Shopping bag</h2></div>
          <button type="button" onClick={closeCart} aria-label="Close shopping bag" className="rounded-full p-2 text-[#123f72] hover:bg-[#eee8dd]"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart?.items.length ? cart.items.map(item => (
            <article key={item.lineId} className="flex gap-4 border-b border-[#e5ded2] py-4 first:pt-0">
              <img className="h-24 w-20 object-cover" src={item.image?.url ?? STORE_CATEGORIES[0].image} alt={item.image?.altText ?? item.productTitle} loading="lazy" decoding="async" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[#123f72]">{item.productTitle}</h3>
                {item.variantTitle !== "Default Title" && <p className="mt-1 text-xs text-slate-500">{item.variantTitle}</p>}
                <p className="mt-2 text-sm text-[#bb492d]">{formatMoney(item.lineTotal)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-[#d8d0c2] text-xs font-bold">
                    <button type="button" className="px-2.5 py-1.5 hover:bg-[#eee8dd]" disabled={loading} onClick={() => safely(() => updateQuantity(item.lineId, Math.max(0, item.quantity - 1)))} aria-label={`Decrease ${item.productTitle} quantity`}>−</button>
                    <span className="min-w-7 text-center">{item.quantity}</span>
                    <button type="button" className="px-2.5 py-1.5 hover:bg-[#eee8dd]" disabled={loading} onClick={() => safely(() => updateQuantity(item.lineId, item.quantity + 1))} aria-label={`Increase ${item.productTitle} quantity`}>+</button>
                  </div>
                  <button type="button" className="text-[10px] font-bold uppercase tracking-[.12em] text-[#bb492d] underline underline-offset-4" disabled={loading} onClick={() => safely(() => removeItem(item.lineId))}>Remove</button>
                </div>
              </div>
            </article>
          )) : <div className="flex h-full min-h-80 flex-col items-center justify-center text-center"><ShoppingBag size={28} className="mb-4 text-[#bb492d]" /><h3 className="font-serif text-3xl text-[#123f72]">Your bag is quiet.</h3><p className="mt-3 max-w-[230px] text-sm leading-6 text-slate-500">Find a piece that feels like yours in the latest collection.</p><Link href="/shop" onClick={closeCart} className="mt-6 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#123f72] underline underline-offset-4">Browse the collection</Link></div>}
        </div>
        {cart?.items.length ? <div className="border-t border-[#d8d0c2] bg-[#f5f1e9] p-6"><div className="mb-4 flex justify-between text-sm font-bold text-[#123f72]"><span>Subtotal</span><span>{formatMoney(cart.subtotal)}</span></div><Link href="/bag" onClick={closeCart} className="mb-3 block text-center text-[10px] font-extrabold uppercase tracking-[.14em] text-[#123f72] underline underline-offset-4">View full bag</Link><button type="button" onClick={proceedToCheckout} className="button-primary w-full justify-center" disabled={loading}>Secure checkout <ArrowRight size={14} /></button><a className="mt-3 flex min-h-[45px] items-center justify-center gap-2 bg-[#25D366] px-4 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#062e19] transition hover:bg-[#1fb85a]" href={createCartOrderUrl(cart.items, cart.subtotal)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Order on WhatsApp</a></div> : null}
      </aside>
    </div>
  );
}

function Header() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { count } = useWishlist();

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setLocation(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
    setOpen(false);
  };

  return <header className="bg-[#f9f6ef]"><div className="announcement-bar"><p><PackageCheck size={12} /> A considered edit for every day — complimentary delivery on orders over PKR 5,000</p><Link className="announcement-link" href="/track-order">Track your order <ArrowRight size={12} /></Link></div><div className="utility-nav"><div className="utility-links"><Link href="/shop">Shop all</Link><Link href={STORE_CATEGORIES[0].href}>Jewellery</Link><Link href={STORE_CATEGORIES[5].href}>Bridal sets</Link></div><Link href="/track-order">Track your order</Link></div><div className="container header-main"><Link href="/" className="brand-lockup" aria-label="ALRAHEEM COLLECTION 786 home"><img className="brand-logo" src={LOGO} alt="ALRAHEEM COLLECTION 786 official logo" fetchPriority="high" decoding="async" /></Link><form className="search-field" onSubmit={submitSearch}><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the collection" aria-label="Search the collection" /><button type="submit" aria-label="Search"><ArrowRight size={15} /></button></form><div className="header-actions"><Link href="/contact" aria-label="Contact ALRAHEEM COLLECTION 786"><UserRound size={20} /></Link><Link href="/wishlist" aria-label="View saved items" className="relative"><Heart size={20} />{count > 0 && <span className="count-badge">{count}</span>}</Link><button type="button" aria-label="Open shopping bag" onClick={openCart}><ShoppingBag size={20} />{itemCount > 0 && <span className="count-badge">{itemCount}</span>}</button><button className="mobile-menu-button" type="button" onClick={() => setOpen(value => !value)} aria-label="Toggle navigation">{open ? <X size={22} /> : <Menu size={22} />}</button></div></div><nav className="main-nav" aria-label="Primary navigation">{navigation.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>{open && <div className="border-t border-[#d8d0c2] bg-[#fffdf9] px-5 py-4 md:hidden"><div className="grid gap-3">{navigation.map(([label, href]) => <Link key={label} onClick={() => setOpen(false)} href={href} className="border-b border-[#eee8dd] pb-3 text-[11px] font-extrabold uppercase tracking-[.12em] text-[#123f72]">{label}</Link>)}<Link href="/track-order" onClick={() => setOpen(false)} className="pt-1 text-[11px] font-extrabold uppercase tracking-[.12em] text-[#bb492d]">Track your order</Link></div></div>}</header>;
}

function Footer() {
  return <footer className="bg-[#123f72] text-[#f9f6ef]"><div className="container grid gap-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]"><div><div className="brand-lockup brand-lockup--footer"><img className="brand-logo" src={LOGO} alt="ALRAHEEM COLLECTION 786 official logo" loading="lazy" decoding="async" /></div><p className="mt-5 max-w-60 text-xs leading-6 text-[#cbd6e2]">Everyday, arranged with intention. Jewellery, statement accessories and considered dressing in one collection.</p></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#f3b49d]">Shop</p><div className="mt-4 grid gap-2 text-xs text-[#dce5ee]"><Link href="/shop">All pieces</Link>{STORE_CATEGORIES.map(category => <Link key={category.collectionHandle} href={category.href}>{category.name}</Link>)}</div></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#f3b49d]">Help</p><div className="mt-4 grid gap-2 text-xs text-[#dce5ee]"><Link href="/bag">Your bag</Link><Link href="/track-order">Delivery details</Link><Link href="/contact">Contact us</Link></div></div><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#f3b49d]">Stay in the loop</p><p className="mt-4 text-xs leading-6 text-[#dce5ee]">Follow the collection for category releases and new pieces.</p><Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#f9f6ef] underline underline-offset-4">Get in touch <ArrowRight size={13} /></Link></div></div><div className="border-t border-white/15 py-4 text-center text-[9px] uppercase tracking-[.14em] text-[#a9bacd]">© 2026 ALRAHEEM COLLECTION 786 · Curated with intention</div></footer>;
}

export default function StoreShell({ children }: { children: ReactNode }) {
  return <><Header /><main>{children}</main><Footer /><CartDrawer /></>;
}

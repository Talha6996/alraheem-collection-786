import { Heart } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";

export default function Wishlist() {
  const { handles } = useWishlist();
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 24 });
  const saved = products.filter(product => handles.includes(product.handle));
  return <section className="min-h-[70vh] bg-[#fffdf9] py-12 md:py-20"><div className="container"><p className="eyebrow"><span />Return to these</p><h1 className="font-serif text-5xl tracking-[-.04em] text-[#123f72] md:text-7xl">Saved pieces.</h1>{isLoading ? <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{[1, 2].map(item => <div key={item} className="aspect-[4/5] animate-pulse bg-[#eee8dd]" />)}</div> : saved.length ? <div className="product-grid mt-10">{saved.map((product, index) => <ProductCard product={product} index={index + 1} key={product.id} />)}</div> : <div className="mt-10 grid min-h-80 place-items-center bg-[#f5f1e9] px-6 text-center"><div><Heart className="mx-auto text-[#bb492d]" size={32} /><h2 className="mt-4 font-serif text-4xl text-[#123f72]">Nothing saved yet.</h2><p className="mt-3 text-sm text-slate-500">Tap the heart on a piece to keep it close.</p><Link href="/shop" className="button-primary mt-6">See the collection</Link></div></div>}</div></section>;
}

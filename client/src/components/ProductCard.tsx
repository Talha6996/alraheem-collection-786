import type { Product } from "@shared/commerce/types";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { formatMoney, primaryVariant } from "@/lib/commerce";

const FALLBACK_IMAGE = "/manus-storage/alraheem-accessories-flatlay_814b21f8.jpg";

export default function ProductCard({ product, index = 1 }: { product: Product; index?: number }) {
  const { addItem, loading } = useCart();
  const { isSaved, toggle } = useWishlist();
  const variant = primaryVariant(product);
  const saved = isSaved(product.handle);

  const addToBag = async () => {
    if (!variant?.availableForSale) return;
    try {
      await addItem(variant.id);
      toast.success(`${product.title} is in your bag.`);
    } catch (error) {
      toast.error("We could not add that item just now.", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  return (
    <article className="product-card group">
      <div className="product-image-wrap">
        <Link href={`/product/${product.handle}`} aria-label={`View ${product.title}`}>
          <img src={product.images[0]?.url ?? FALLBACK_IMAGE} alt={product.images[0]?.altText ?? product.title} loading="lazy" decoding="async" />
        </Link>
        <span className="product-badge">{product.tags[0] ?? "The edit"}</span>
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          type="button"
          aria-label={saved ? `Remove ${product.title} from saved items` : `Save ${product.title}`}
          onClick={() => toggle(product.handle)}
        >
          <Heart size={15} fill={saved ? "currentColor" : "none"} />
        </button>
        <span className="product-index">{String(index).padStart(2, "0")}</span>
        <button className="quick-add" type="button" disabled={!variant?.availableForSale || loading} onClick={addToBag}>
          <ShoppingBag size={13} /> {variant?.availableForSale ? "Add to bag" : "Unavailable"}
        </button>
      </div>
      <div className="product-copy">
        <small>{product.productType || "ALRAHEEM EDIT"}</small>
        <h3><Link href={`/product/${product.handle}`}>{product.title}</Link></h3>
        <p>{formatMoney(product.priceRange.min)}</p>
        <span>{product.tags.slice(0, 2).join(" · ") || "Considered everyday piece"}</span>
      </div>
    </article>
  );
}

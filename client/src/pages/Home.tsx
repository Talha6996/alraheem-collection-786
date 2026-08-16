/**
 * Heritage Atelier design system: ivory field, Alraheem Indigo framing, and restrained rust-red accents.
 * Typography: DM Serif Display headlines paired with Manrope UI. Maintain asymmetric editorial commerce rhythm.
 */
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

const productImages = {
  navy: "/manus-storage/alraheem-apparel-stilllife_45d8153a.jpg",
  bag: "/manus-storage/alraheem-bag-flatlay_c2eac318.jpg",
  scarf: "/manus-storage/alraheem-accessories-flatlay_aea503c4.jpg",
  fragrance: "/manus-storage/alraheem-fragrance-campaign_3b6051bf.jpg",
  jewels: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
  dress: "/manus-storage/alraheem-modest-fashion_f03d3f6e.jpg",
};

const products = [
  { id: 1, name: "Navy Satin Co-ord", category: "Apparel", price: "Rs. 4,950", image: productImages.navy, badge: "New" },
  { id: 2, name: "Woven Day Bag", category: "Bags", price: "Rs. 3,750", image: productImages.bag, badge: "Limited" },
  { id: 3, name: "Indigo Print Scarf", category: "Accessories", price: "Rs. 1,850", image: productImages.scarf, badge: "Edit pick" },
  { id: 4, name: "Amber Veil Eau de Parfum", category: "Fragrance", price: "Rs. 3,250", image: productImages.fragrance, badge: "Signature" },
  { id: 5, name: "Golden Hour Hoops", category: "Accessories", price: "Rs. 1,650", image: productImages.jewels, badge: "New" },
  { id: 6, name: "Stone Pleat Dress", category: "Apparel", price: "Rs. 5,450", image: productImages.dress, badge: "Bestseller" },
];

const filters = ["All", "Apparel", "Bags", "Accessories", "Fragrance"];

const navItems = ["New In", "Apparel", "Bags & Accessories", "Beauty", "Fragrances", "Modest Edit", "Gifts"];

function notify(label: string) {
  toast(`${label} is coming soon`, { description: "This storefront preview is ready for the next collection update." });
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [saved, setSaved] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const filterMatch = activeFilter === "All" || product.category === activeFilter || (activeFilter === "Bags" && product.category === "Bags");
      const queryMatch = !term || `${product.name} ${product.category}`.toLowerCase().includes(term);
      return filterMatch && queryMatch;
    });
  }, [activeFilter, search]);

  const handleNav = (item: string) => {
    const matchingFilter = item === "Bags & Accessories" ? "Bags" : item === "Fragrances" ? "Fragrance" : item === "Beauty" ? "All" : item;
    if (filters.includes(matchingFilter)) {
      setActiveFilter(matchingFilter);
      document.getElementById("collection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      notify(`${item} collection`);
    }
    setMobileMenuOpen(false);
  };

  const toggleSaved = (id: number) => {
    setSaved((previous) => previous.includes(id) ? previous.filter((productId) => productId !== id) : [...previous, id]);
  };

  const addToCart = (name: string) => {
    setCartCount((count) => count + 1);
    toast("Added to your bag", { description: name });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f9f6ef] text-[#15283d]">
      <div className="announcement-bar">
        <p><Sparkles size={14} aria-hidden="true" /> A considered edit for every day — complimentary delivery on orders over Rs. 5,000</p>
        <button onClick={() => notify("Order tracking")} className="announcement-link">Track your order <ChevronRight size={13} /></button>
      </div>

      <header className="sticky top-0 z-50 border-b border-[#15283d]/10 bg-[#f9f6ef]/95 backdrop-blur-xl">
        <div className="utility-nav">
          <div className="utility-links" aria-label="Shop departments">
            <button onClick={() => handleNav("Beauty")}>Beauty</button>
            <button onClick={() => handleNav("Apparel")}>Fashion</button>
            <button onClick={() => notify("The 786 edit")}>The 786 edit</button>
          </div>
          <button onClick={() => notify("Order tracking")} className="tracking-link">Track your order</button>
        </div>
        <div className="container header-main">
          <button className="mobile-menu-button" aria-label="Open menu" onClick={() => setMobileMenuOpen(true)}><Menu size={22} /></button>
          <a href="#top" className="brand-lockup" aria-label="ALRAHEEM COLLECTION 786 home">
            <img src="/manus-storage/alraheem-collection-786-logo_82dad365.jpeg" alt="ALRAHEEM COLLECTION 786 circular logo" className="brand-logo" />
            <span className="brand-name">ALRAHEEM <em>COLLECTION 786</em></span>
          </a>
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the collection" aria-label="Search the collection" />
            {search && <button onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}
          </label>
          <div className="header-actions">
            <button onClick={() => notify("Your account")} aria-label="Your account"><UserRound size={20} /></button>
            <button onClick={() => notify("Saved pieces")} aria-label="Saved pieces" className="relative"><Heart size={20} />{saved.length > 0 && <span className="count-badge">{saved.length}</span>}</button>
            <button onClick={() => notify("Your bag")} aria-label="Shopping bag" className="relative"><ShoppingBag size={20} />{cartCount > 0 && <span className="count-badge">{cartCount}</span>}</button>
          </div>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => <button key={item} onClick={() => handleNav(item)}>{item}</button>)}
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-panel" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="mobile-panel-top"><span>Browse the collection</span><button aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><X size={22} /></button></div>
          {navItems.map((item) => <button key={item} onClick={() => handleNav(item)}>{item}<ArrowRight size={18} /></button>)}
          <div className="mobile-panel-note"><img src="/manus-storage/alraheem-brand-symbol_eb0fc086.png" alt="" /> Curated in small, considered drops.</div>
        </div>
      )}

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span /> The late-summer edit</div>
            <h1>Pieces with<br /><i>presence.</i></h1>
            <p>From everyday elegance to finishing details, find a collection arranged for the way you move through the day.</p>
            <div className="hero-buttons">
              <button className="button-primary" onClick={() => { setActiveFilter("Apparel"); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); }}>Shop the edit <ArrowRight size={17} /></button>
              <button className="text-button" onClick={() => notify("Lookbook")}>View lookbook</button>
            </div>
            <div className="hero-caption"><span>01</span> An edit of fashion, fragrance & everyday objects</div>
          </div>
          <div className="hero-visual">
            <img src="/manus-storage/alraheem-hero-editorial_b35836ae.jpg" alt="Woman in deep navy modest fashion in a warm editorial studio" />
            <div className="hero-stamp"><b>ALRAHEEM</b><span>CURATED<br />WITH CARE</span></div>
            <div className="hero-image-caption">Draped in deep indigo</div>
          </div>
        </section>

        <section className="category-section container">
          <div className="section-intro"><div><p className="eyebrow"><span /> Browse by mood</p><h2>Everyday, <i>arranged.</i></h2></div><p>Explore small pleasures, foundational pieces, and gifts that feel personal.</p></div>
          <div className="category-grid">
            <button className="category-card category-card--apparel" onClick={() => handleNav("Apparel")}>
              <img src="/manus-storage/alraheem-neutral-dress_e98ae032.jpg" alt="Woman in neutral modest fashion styling" />
              <span className="category-card-overlay" /><div><small>01 / Apparel</small><b>Made to move</b><em>Discover <ArrowRight size={16} /></em></div>
            </button>
            <button className="category-card category-card--accessories" onClick={() => handleNav("Bags & Accessories")}>
              <img src="/manus-storage/alraheem-bag-flatlay_c2eac318.jpg" alt="Curated fashion accessories in an editorial flat lay" />
              <span className="category-card-overlay" /><div><small>02 / Accessories</small><b>The finishing touch</b><em>Discover <ArrowRight size={16} /></em></div>
            </button>
            <button className="category-card category-card--fragrance" onClick={() => handleNav("Fragrances")}>
              <img src="/manus-storage/alraheem-fragrance-campaign_3b6051bf.jpg" alt="Amber fragrance bottle on an indigo and ivory plinth" />
              <span className="category-card-overlay" /><div><small>03 / Fragrance</small><b>Leave a trace</b><em>Discover <ArrowRight size={16} /></em></div>
            </button>
          </div>
        </section>

        <section id="collection" className="collection-section">
          <div className="container">
            <div className="collection-head"><div><p className="eyebrow"><span /> Selected for now</p><h2>Current <i>favourites.</i></h2></div><div className="collection-side-note"><img src="/manus-storage/alraheem-brand-symbol_eb0fc086.png" alt="" /><p>Six pieces in the 786 edit,<br />selected for texture and ease.</p><button onClick={() => notify("Full collection")} className="text-button desktop-only">View the whole collection <ArrowRight size={16} /></button></div></div>
            <div className="filter-row" role="tablist" aria-label="Filter products">
              {filters.map((filter) => <button key={filter} role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? "is-active" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
            </div>
            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image-wrap">
                      <span className="product-index">0{product.id}</span>
                      <img src={product.image} alt={product.name} />
                      <span className="product-badge">{product.badge}</span>
                      <button className={`save-button ${saved.includes(product.id) ? "saved" : ""}`} onClick={() => toggleSaved(product.id)} aria-label={`Save ${product.name}`}><Heart size={18} fill={saved.includes(product.id) ? "currentColor" : "none"} /></button>
                      <button className="quick-add" onClick={() => addToCart(product.name)}>Add to bag <ShoppingBag size={16} /></button>
                    </div>
                    <div className="product-copy"><small>{product.category}</small><h3>{product.name}</h3><p>{product.price}</p><span>Chosen for the 786 edit</span></div>
                  </article>
                ))}
              </div>
            ) : <div className="empty-collection"><Search size={22} /><p>No pieces matched “{search}”.</p><button className="text-button" onClick={() => { setSearch(""); setActiveFilter("All"); }}>Clear filters</button></div>}
          </div>
        </section>

        <section className="editorial-band">
          <div className="container editorial-band-inner">
            <div className="editorial-band-copy"><p className="eyebrow"><span /> The gift edit</p><h2>Something considered,<br /><i>for someone close.</i></h2><p>Small marks of affection, selected to be kept, worn, and remembered.</p><button className="button-light" onClick={() => notify("Gift guide")}>Explore gifts <ArrowRight size={17} /></button></div>
            <div className="editorial-band-image gift-composition" aria-hidden="true"><div className="gift-box gift-box--back" /><div className="gift-box gift-box--front"><span /><span /></div><div className="gift-seal"><img src="/manus-storage/alraheem-brand-symbol_eb0fc086.png" alt="" /></div><div className="diagonal-detail" /></div>
          </div>
        </section>

        <section className="promise-section container">
          <div className="promise-copy"><p className="eyebrow"><span /> The Alraheem way</p><h2>Easy to choose.<br /><i>Easy to receive.</i></h2></div>
          <div className="promise-list">
            <div><Truck size={23} /><h3>Countrywide delivery</h3><p>Delivered with care, wherever you are in Pakistan.</p></div>
            <div><PackageCheck size={23} /><h3>Thoughtful packing</h3><p>Every order is prepared as a small occasion.</p></div>
            <div><Heart size={23} /><h3>Selected with intention</h3><p>Fewer pieces, better considered. Always.</p></div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="newsletter-symbol"><img src="/manus-storage/alraheem-brand-symbol_eb0fc086.png" alt="" /></div>
          <div><p className="eyebrow"><span /> The inside note</p><h2>New arrivals, without the noise.</h2><p>Join for first look at thoughtful drops, special pairings, and gifting notes.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); toast("You’re on the list", { description: "The next inside note will arrive in your inbox." }); }}><input aria-label="Email address" type="email" placeholder="Your email address" required /><button type="submit" aria-label="Subscribe"><ArrowRight size={19} /></button></form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand"><img src="/manus-storage/alraheem-collection-786-logo_82dad365.jpeg" alt="ALRAHEEM COLLECTION 786 logo" /><p>Everyday, arranged with intention.</p></div>
          <div><h3>Shop</h3><button onClick={() => handleNav("Apparel")}>Apparel</button><button onClick={() => handleNav("Bags & Accessories")}>Bags & accessories</button><button onClick={() => handleNav("Fragrances")}>Fragrance</button><button onClick={() => notify("Gift guide")}>Gifts</button></div>
          <div><h3>Help</h3><button onClick={() => notify("Delivery details")}>Delivery details</button><button onClick={() => notify("Returns")}>Returns</button><button onClick={() => notify("Order tracking")}>Track your order</button><button onClick={() => notify("Contact")}>Contact us</button></div>
          <div><h3>Find us</h3><p>Follow the collection for new notes and recent arrivals.</p><button onClick={() => notify("Instagram")}>Instagram <ArrowRight size={14} /></button></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 ALRAHEEM COLLECTION 786</span><span>Made for considered shopping</span></div>
      </footer>
    </div>
  );
}

import { describe, expect, it } from "vitest";
import type { Product } from "@shared/commerce/types";
import { createCartOrderUrl, createProductOrderUrl, createStoreWhatsAppUrl, getStockStatus } from "./commerce";

function productWithTags(tags: string[], availableForSale = true): Product {
  return {
    id: "product-1",
    handle: "test-piece",
    title: "Test Piece",
    description: "",
    vendor: "ALRAHEEM COLLECTION 786",
    productType: "Jewellery",
    tags,
    availableForSale,
    images: [],
    media: [],
    variants: [],
  };
}

describe("WhatsApp direct-order links", () => {
  it("creates a pre-filled direct-order link for one product", () => {
    const url = new URL(createProductOrderUrl({ title: "Navy Satin Co-ord", price: "PKR 4,950", productUrl: "https://store.example/product/navy-satin-co-ord" }));

    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/923361243334");
    expect(url.searchParams.get("text")).toContain("Navy Satin Co-ord");
    expect(url.searchParams.get("text")).toContain("PKR 4,950");
  });

  it("creates a bag message with quantities and PKR subtotal", () => {
    const url = new URL(createCartOrderUrl([{
      lineId: "line-1", variantId: "variant-1", productHandle: "navy-satin-co-ord", productTitle: "Navy Satin Co-ord", variantTitle: "Default Title", image: null, unitPrice: { amount: "4950", currencyCode: "PKR" }, quantity: 2, lineTotal: { amount: "9900", currencyCode: "PKR" },
    }], { amount: "9900", currencyCode: "PKR" }));

    expect(url.searchParams.get("text")).toContain("Navy Satin Co-ord × 2");
    expect(url.searchParams.get("text")).toContain("Subtotal: PKR 9,900");
  });

  it("creates a site-wide WhatsApp help link for the verified business number", () => {
    const url = new URL(createStoreWhatsAppUrl());
    expect(url.pathname).toBe("/923361243334");
    expect(url.searchParams.get("text")).toContain("help choosing a product");
  });
});

describe("Shopify storefront stock labels", () => {
  it("uses public availability and optional owner tags without inventing inventory counts", () => {
    expect(getStockStatus(productWithTags([], false))).toMatchObject({ label: "Out of stock", tone: "soldout" });
    expect(getStockStatus(productWithTags(["Only 2 left"]))).toMatchObject({ label: "Only 2 left", tone: "limited" });
    expect(getStockStatus(productWithTags(["Low stock"]))).toMatchObject({ label: "Limited availability", tone: "limited" });
    expect(getStockStatus(productWithTags([]))).toMatchObject({ label: "In stock", tone: "available" });
  });
});

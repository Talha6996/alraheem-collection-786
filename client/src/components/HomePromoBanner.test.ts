import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPromotionSlides } from "./HomePromoBanner";
import type { Product } from "@shared/commerce/types";

const product = (overrides: Partial<Product> = {}): Product => ({
  id: "product-1", handle: "collection-piece", title: "Collection Piece", description: "", descriptionHtml: "", productType: "Jewellery", vendor: "ALRAHEEM", tags: ["New In"], images: [], priceRange: { min: { amount: "4950", currencyCode: "PKR" }, max: { amount: "4950", currencyCode: "PKR" } }, options: [], variants: [{ id: "variant-1", title: "Default Title", price: { amount: "4950", currencyCode: "PKR" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] }], ...overrides,
});

describe("createPromotionSlides", () => {
  it("returns no promotions when the live catalogue is empty", () => {
    expect(createPromotionSlides([])).toEqual([]);
  });

  it("shows the latest item as a new-arrival promotion without inventing a sale", () => {
    const slides = createPromotionSlides([product()]);
    expect(slides).toHaveLength(1);
    expect(slides[0]).toMatchObject({ kind: "new", price: "PKR 4,950" });
  });

  it("adds a special-offer promotion only when a genuine compare-at price exists", () => {
    const slides = createPromotionSlides([product({ variants: [{ id: "variant-1", title: "Default Title", price: { amount: "3750", currencyCode: "PKR" }, compareAtPrice: { amount: "4950", currencyCode: "PKR" }, availableForSale: true, selectedOptions: [] }] })]);
    expect(slides).toHaveLength(2);
    expect(slides[1]).toMatchObject({ kind: "sale", price: "PKR 3,750", previousPrice: "PKR 4,950" });
  });

  it("keeps promotion images free of the bottom-right NEW/sparkle badge", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/HomePromoBanner.tsx"), "utf8");
    expect(source).not.toContain("promo-badge");
  });
});

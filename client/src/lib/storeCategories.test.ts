import { describe, expect, it } from "vitest";
import { findStoreCategory, isStoreCategory, STORE_CATEGORIES } from "./storeCategories";

describe("STORE_CATEGORIES", () => {
  it("defines the requested storefront categories including the published PARTY SET collection", () => {
    expect(STORE_CATEGORIES.map(category => category.name)).toEqual([
      "JEWELLERY",
      "HANDBAGS",
      "LADIES SUIT",
      "MENS SUIT",
      "BRANDED KARA",
      "BRIDAL SETS",
      "MENS BRACELET",
      "PARTY SET",
    ]);
    expect(new Set(STORE_CATEGORIES.map(category => category.collectionHandle)).size).toBe(8);
    expect(STORE_CATEGORIES.map(category => category.collectionHandle)).toEqual([
      "jewellery", "handbags", "ladies-suit", "mens-suit", "branded-kara", "bridal-sets", "mens-bracelet", "party-set",
    ]);
    expect(findStoreCategory("Party Set")?.href).toBe("/shop?category=party-set");
  });

  it("resolves legacy product-type URLs to the matching manual collection handle", () => {
    expect(findStoreCategory("Branded Kara")?.collectionHandle).toBe("branded-kara");
    expect(findStoreCategory("BRANDED KARA")?.collectionHandle).toBe("branded-kara");
    expect(findStoreCategory("branded-kara")?.name).toBe("BRANDED KARA");
    expect(isStoreCategory("Jewellery")).toBe(true);
    expect(isStoreCategory("Unassigned collection")).toBe(false);
  });
});

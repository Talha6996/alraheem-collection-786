import { describe, expect, it } from "vitest";
import { findStoreCategory, isStoreCategory, STORE_CATEGORIES } from "./storeCategories";

describe("STORE_CATEGORIES", () => {
  it("defines exactly the seven requested storefront categories", () => {
    expect(STORE_CATEGORIES.map(category => category.name)).toEqual([
      "JEWELLERY",
      "HANDBAGS",
      "LADIES SUIT",
      "MENS SUIT",
      "BRANDED KARA",
      "BRIDAL SETS",
      "MENS BRACELET",
    ]);
    expect(new Set(STORE_CATEGORIES.map(category => category.collectionHandle)).size).toBe(7);
    expect(STORE_CATEGORIES.map(category => category.collectionHandle)).toEqual([
      "jewellery", "handbags", "ladies-suit", "mens-suit", "branded-kara", "bridal-sets", "mens-bracelet",
    ]);
  });

  it("resolves legacy product-type URLs to the matching manual collection handle", () => {
    expect(findStoreCategory("Branded Kara")?.collectionHandle).toBe("branded-kara");
    expect(findStoreCategory("BRANDED KARA")?.collectionHandle).toBe("branded-kara");
    expect(findStoreCategory("branded-kara")?.name).toBe("BRANDED KARA");
    expect(isStoreCategory("Jewellery")).toBe(true);
    expect(isStoreCategory("Unassigned collection")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { isStoreCategory, STORE_CATEGORIES } from "./storeCategories";

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
    expect(new Set(STORE_CATEGORIES.map(category => category.productType)).size).toBe(7);
  });

  it("recognises the product types used by collection filtering", () => {
    expect(isStoreCategory("Jewellery")).toBe(true);
    expect(isStoreCategory("Unassigned collection")).toBe(false);
  });
});

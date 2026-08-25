import { describe, expect, it } from "vitest";
import type { Product } from "@shared/commerce/types";
import { getPersonalizedProducts, getRecentlyViewedProducts, getRelatedProducts } from "./productDiscovery";

function product(handle: string, overrides: Partial<Product> = {}): Product {
  return { id: handle, handle, title: handle, description: "", descriptionHtml: "", productType: "Jewellery", vendor: null, tags: ["gold"], availableForSale: true, images: [], media: [], priceRange: { min: { amount: "1000", currencyCode: "PKR" }, max: { amount: "1000", currencyCode: "PKR" } }, options: [], variants: [], ...overrides };
}

describe("product discovery helpers", () => {
  it("keeps browser-history order while excluding the product currently open", () => {
    const catalogue = [product("current"), product("second"), product("third")];
    expect(getRecentlyViewedProducts(catalogue, ["current", "third", "second"], "current").map(item => item.handle)).toEqual(["third", "second"]);
  });

  it("returns matching related pieces without returning the product currently open", () => {
    const current = product("current");
    const unrelated = product("other", { productType: "Handbags", tags: ["leather"] });
    expect(getRelatedProducts([current, product("same-type"), product("same-tag", { productType: "Bridal", tags: ["gold"] }), unrelated], current).map(item => item.handle)).toEqual(["same-type", "same-tag"]);
    expect(getRelatedProducts([current, unrelated], current)).toEqual([]);
  });

  it("uses recent local browsing signals to recommend unviewed matching pieces", () => {
    const catalogue = [
      product("current"),
      product("viewed-jewellery"),
      product("recommended-tag", { productType: "Bridal", tags: ["gold"] }),
      product("recommended-type"),
      product("unrelated", { productType: "Handbags", tags: ["leather"] }),
    ];
    expect(getPersonalizedProducts(catalogue, ["viewed-jewellery"], "current").map(item => item.handle)).toEqual(["recommended-type", "recommended-tag"]);
  });
});

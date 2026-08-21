// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Product } from "@shared/commerce/types";
import { RECENTLY_VIEWED_KEY, useRecentlyViewed } from "./useRecentlyViewed";

afterEach(() => { cleanup(); window.localStorage.clear(); });

function product(handle: string): Product {
  return { id: handle, handle, title: handle, description: "", descriptionHtml: "", productType: null, vendor: null, tags: [], availableForSale: true, images: [], media: [], priceRange: { min: { amount: "1000", currencyCode: "PKR" }, max: { amount: "1000", currencyCode: "PKR" } }, options: [], variants: [] };
}

describe("useRecentlyViewed", () => {
  it("persists browser-local visits in newest-first order without duplicate handles", () => {
    const { result, rerender } = renderHook(({ item }) => useRecentlyViewed(item), { initialProps: { item: product("current") } });
    act(() => rerender({ item: product("second") }));
    act(() => rerender({ item: product("current") }));
    expect(result.current).toEqual(["current", "second"]);
    expect(JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]")).toEqual(["current", "second"]);
  });
});

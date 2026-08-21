// @vitest-environment jsdom

import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ProductStockStatus from "./ProductStockStatus";
import { getStockStatus } from "@/lib/commerce";
import type { Product } from "@shared/commerce/types";

afterEach(cleanup);

describe("ProductStockStatus", () => {
  it("renders shopper-safe in-stock, low-stock, and out-of-stock messages", () => {
    const inStock = render(createElement(ProductStockStatus, { status: { label: "In stock", detail: "Available to order now.", tone: "available" } }));
    expect(inStock.getByLabelText("Availability: In stock")).toBeTruthy();
    cleanup();
    const lowStock = render(createElement(ProductStockStatus, { status: { label: "Only 2 left", detail: "Limited availability — order soon.", tone: "limited" } }));
    expect(lowStock.getByLabelText("Availability: Only 2 left")).toBeTruthy();
    cleanup();
    const soldOut = render(createElement(ProductStockStatus, { status: { label: "Out of stock", detail: "This piece is currently unavailable to order.", tone: "soldout" } }));
    expect(soldOut.getByText("This piece is currently unavailable to order.")).toBeTruthy();
  });

  it("uses owner-controlled Shopify tags for low stock and safely falls back when no tag is present", () => {
    const baseProduct = { id: "1", handle: "test-piece", title: "Test piece", description: "", descriptionHtml: "", productType: "Jewellery", vendor: null, images: [], media: [], priceRange: { min: { amount: "1000", currencyCode: "PKR" }, max: { amount: "1000", currencyCode: "PKR" } }, options: [], variants: [], availableForSale: true } satisfies Omit<Product, "tags">;
    const taggedStatus = getStockStatus({ ...baseProduct, tags: ["Only 2 left"] });
    const taggedView = render(createElement(ProductStockStatus, { status: taggedStatus }));
    expect(taggedView.getByLabelText("Availability: Only 2 left")).toBeTruthy();
    cleanup();
    const normalStatus = getStockStatus({ ...baseProduct, tags: [] });
    const normalView = render(createElement(ProductStockStatus, { status: normalStatus }));
    expect(normalView.getByLabelText("Availability: In stock")).toBeTruthy();
  });
});

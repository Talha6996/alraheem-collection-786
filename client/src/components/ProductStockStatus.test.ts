// @vitest-environment jsdom

import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ProductStockStatus from "./ProductStockStatus";

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
});

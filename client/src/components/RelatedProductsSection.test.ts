// @vitest-environment jsdom

import { createElement } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RelatedProductsSection from "./RelatedProductsSection";

describe("RelatedProductsSection", () => {
  it("shows a clear empty state when Shopify has no suitable related pieces", () => {
    const view = render(createElement(RelatedProductsSection, { products: [] }));
    expect(view.getByRole("heading", { name: /related pieces/i })).toBeTruthy();
    expect(view.getByText("More pieces are coming soon.")).toBeTruthy();
    expect(view.getByText(/explore the full collection/i)).toBeTruthy();
  });
});

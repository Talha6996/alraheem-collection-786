import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductPrice } from "./ProductPrice";

describe("ProductPrice", () => {
  const salePrice = { amount: "1800.00", currencyCode: "PKR" };
  const originalPrice = { amount: "2500.00", currencyCode: "PKR" };

  it("renders a larger bold black sale price with a smaller red crossed-out original price", () => {
    const markup = renderToStaticMarkup(
      createElement(ProductPrice, { price: salePrice, compareAtPrice: originalPrice }),
    );

    expect(markup).toContain("text-[#111111]");
    expect(markup).toContain("font-extrabold");
    expect(markup).toContain("text-[15px]");
    expect(markup).toContain("<del");
    expect(markup).toContain("text-[#c62828]");
    expect(markup).toContain("text-[11px]");
  });

  it("does not show a red original price when there is no genuine sale", () => {
    const markup = renderToStaticMarkup(
      createElement(ProductPrice, { price: salePrice, compareAtPrice: salePrice }),
    );

    expect(markup).not.toContain("<del");
    expect(markup).not.toContain("text-[#c62828]");
  });
});

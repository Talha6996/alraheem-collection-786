import { describe, expect, it } from "vitest";
import { createCartOrderUrl, createProductOrderUrl } from "./commerce";

describe("WhatsApp direct-order links", () => {
  it("creates a pre-filled direct-order link for one product", () => {
    const url = new URL(createProductOrderUrl({ title: "Navy Satin Co-ord", price: "PKR 4,950", productUrl: "https://store.example/product/navy-satin-co-ord" }));

    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/923361243334");
    expect(url.searchParams.get("text")).toContain("Navy Satin Co-ord");
    expect(url.searchParams.get("text")).toContain("PKR 4,950");
  });

  it("creates a bag message with quantities and PKR subtotal", () => {
    const url = new URL(createCartOrderUrl([{
      lineId: "line-1", variantId: "variant-1", productHandle: "navy-satin-co-ord", productTitle: "Navy Satin Co-ord", variantTitle: "Default Title", image: null, unitPrice: { amount: "4950", currencyCode: "PKR" }, quantity: 2, lineTotal: { amount: "9900", currencyCode: "PKR" },
    }], { amount: "9900", currencyCode: "PKR" }));

    expect(url.searchParams.get("text")).toContain("Navy Satin Co-ord × 2");
    expect(url.searchParams.get("text")).toContain("Subtotal: PKR 9,900");
  });
});

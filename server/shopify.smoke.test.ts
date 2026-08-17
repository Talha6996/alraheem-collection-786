/**
 * Live smoke test for the Shopify Storefront integration.
 *
 * Goal: prove the store actually returns at least one usable product with
 * the three things a storefront needs to render — a title, an image, and a
 * non-zero price. If this passes, the homepage and PDP will work; if it
 * fails, there's an integration / catalog issue, not a UI bug.
 *
 * Behavior:
 *   - Calls the real Storefront API via `listProducts()` (no mocking).
 *   - Auto-skips when `SHOPIFY_STORE_DOMAIN` and the storefront token aren't
 *     configured, so CI environments without credentials stay green.
 *   - Logs the first 3 normalized products so the agent can see the actual
 *     output (titles, prices, image URLs) without reaching for `curl`.
 *
 * For a more verbose, standalone version see `scripts/shopify-probe.mjs`.
 */

import { describe, expect, it } from "vitest";
import {
  createCart,
  isShopifyConfigured,
  listProducts,
  updateCartLines,
} from "./_core/shopify";

const configured = isShopifyConfigured();

describe.skipIf(!configured)("shopify smoke (live)", () => {
  it(
    "returns at least one product with title, image, and non-zero price",
    { timeout: 30_000 },
    async () => {
    const products = await listProducts({ first: 10 });

    // Print a compact view so the agent can see the actual normalized output
    // (titles, prices, image URLs) directly in test logs.
    const preview = products.slice(0, 3).map(p => ({
      handle: p.handle,
      title: p.title,
      price: `${p.priceRange.min.amount} ${p.priceRange.min.currencyCode}`,
      firstImage: p.images[0]?.url ?? null,
      variantCount: p.variants.length,
    }));
    // eslint-disable-next-line no-console
    console.log("[shopify smoke] products:", JSON.stringify(preview, null, 2));

    expect(products.length).toBeGreaterThanOrEqual(1);

    const usable = products.find(p => {
      const hasTitle = typeof p.title === "string" && p.title.trim().length > 0;
      const hasImage = (p.images[0]?.url ?? "").length > 0;
      const priceNum = Number.parseFloat(p.priceRange.min.amount);
      const hasPrice = Number.isFinite(priceNum) && priceNum > 0;
      return hasTitle && hasImage && hasPrice;
    });

      expect(
        usable,
        "No product had all three of: title, first image URL, and price > 0"
      ).toBeTruthy();
    }
  );

  it(
    "updates a live cart quantity and returns a matching PKR subtotal",
    { timeout: 30_000 },
    async () => {
      const [product] = await listProducts({ first: 1 });
      const variant = product?.variants.find(item => item.availableForSale);

      expect(variant, "Expected a sellable Shopify product variant").toBeTruthy();
      if (!variant) return;

      const created = await createCart([{ variantId: variant.id, quantity: 1 }]);
      expect(created.itemCount).toBe(1);
      expect(created.subtotal.currencyCode).toBe("PKR");

      const line = created.items[0];
      expect(line, "Expected the created cart to contain a line item").toBeTruthy();
      if (!line) return;

      const updated = await updateCartLines(created.id, [{ lineId: line.lineId, quantity: 2 }]);
      const expectedSubtotal = Number(variant.price.amount) * 2;

      expect(updated.itemCount).toBe(2);
      expect(updated.items[0]?.quantity).toBe(2);
      expect(updated.subtotal.currencyCode).toBe("PKR");
      expect(Number(updated.subtotal.amount)).toBeCloseTo(expectedSubtotal, 2);
    }
  );
});

// Visible reminder when the suite is skipped — keeps it from looking like a
// silent pass on misconfigured sandboxes.
describe.skipIf(configured)("shopify smoke (skipped)", () => {
  it("is skipped because SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_API_ACCESS_TOKEN are not set", () => {
    expect(true).toBe(true);
  });
});

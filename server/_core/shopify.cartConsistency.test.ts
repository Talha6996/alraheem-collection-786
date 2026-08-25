import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateCartLines } from "./shopify";

const fetchMock = vi.fn();

function ok(data: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ data }),
    text: async () => "",
  } as Response);
}

function rawCart(quantity: number) {
  return {
    id: "gid://shopify/Cart/1",
    checkoutUrl: "https://test.myshopify.com/checkouts/1",
    totalQuantity: quantity,
    cost: {
      totalAmount: { amount: String(2_500 * quantity), currencyCode: "PKR" },
      subtotalAmount: { amount: String(2_500 * quantity), currencyCode: "PKR" },
    },
    lines: {
      edges: [{
        node: {
          id: "gid://shopify/CartLine/1",
          quantity,
          cost: { totalAmount: { amount: String(2_500 * quantity), currencyCode: "PKR" } },
          merchandise: {
            id: "gid://shopify/ProductVariant/1",
            title: "Default Title",
            price: { amount: "2500", currencyCode: "PKR" },
            product: {
              handle: "piece",
              title: "Piece",
              images: { edges: [] },
            },
          },
        },
      }],
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  process.env.SHOPIFY_STORE_DOMAIN = "test.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_API_ACCESS_TOKEN = "test-token";
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("updateCartLines", () => {
  it("refreshes a stale mutation snapshot once and returns the accepted quantity", async () => {
    ok({ cartLinesUpdate: { cart: rawCart(1), userErrors: [] } });
    ok({ cart: rawCart(2) });

    const result = updateCartLines("gid://shopify/Cart/1", [{ lineId: "gid://shopify/CartLine/1", quantity: 2 }]);
    await vi.advanceTimersByTimeAsync(150);

    await expect(result).resolves.toMatchObject({
      itemCount: 2,
      subtotal: { amount: "5000", currencyCode: "PKR" },
      items: [{ lineId: "gid://shopify/CartLine/1", quantity: 2 }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[1]?.body)).toContain("query getCart");
  });
});

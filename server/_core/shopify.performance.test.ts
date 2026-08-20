import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearProductListCache, listProducts } from "./shopify";

describe("Shopify catalogue performance", () => {
  beforeEach(() => {
    clearProductListCache();
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "example.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_API_ACCESS_TOKEN", "test-storefront-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses a compact card fragment for catalogue lists and serves a warm collection request from cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { collection: { products: { edges: [] } } } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await listProducts({ first: 3, collectionHandle: "performance-test" });
    await listProducts({ first: 3, collectionHandle: "performance-test" });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).query as string;
    expect(body).toContain("fragment ProductCardFields");
    expect(body).toContain("images(first: 1)");
    expect(body).toContain("variants(first: 5)");
    expect(body).not.toContain("descriptionHtml");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

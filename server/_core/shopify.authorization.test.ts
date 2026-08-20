import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearProductListCache, getProductByHandle, listProducts } from "./shopify";

describe("Shopify Storefront API authorization errors", () => {
  beforeEach(() => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "example.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_API_ACCESS_TOKEN", "test-storefront-token");
  });

  afterEach(() => {
    clearProductListCache();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps an HTTP 403 response into the catalogue error surfaced by the storefront", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Access denied", { status: 403 }))
    );

    await expect(getProductByHandle("white-stone-kara")).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Shopify Storefront API returned HTTP 403",
    });
  });

  it("keeps a Custom App public Storefront token on the server-side request contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { products: { edges: [] } } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(listProducts()).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("example.myshopify.com"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Shopify-Storefront-Access-Token": "test-storefront-token",
        }),
      })
    );
  });
});

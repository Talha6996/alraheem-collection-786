import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearProductListCache, getProductByHandle, listProducts } from "./shopify";

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

  it("retains products from later Shopify pages for an unbounded collection request", async () => {
    const product = (id: string) => ({
      id: `gid://shopify/Product/${id}`,
      title: `Piece ${id}`,
      handle: `piece-${id}`,
      productType: "Jewellery",
      vendor: "ALRAHEEM COLLECTION 786",
      tags: [],
      availableForSale: true,
      priceRange: { minVariantPrice: { amount: "1000.00", currencyCode: "PKR" }, maxVariantPrice: { amount: "1000.00", currencyCode: "PKR" } },
      images: { edges: [] },
      variants: { edges: [] },
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { collection: { products: { edges: Array.from({ length: 24 }, (_, index) => ({ node: product(String(index + 1)) })), pageInfo: { hasNextPage: true, endCursor: "cursor-24" } } } } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { collection: { products: { edges: [{ node: product("25") }], pageInfo: { hasNextPage: false, endCursor: null } } } } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const products = await listProducts({ collectionHandle: "jewellery", all: true });

    expect(products).toHaveLength(25);
    expect(products.at(-1)?.handle).toBe("piece-25");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[1]?.body)).toContain("cursor-24");
  });

  it("requests the full Shopify image set for an individual product gallery", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            productByHandle: {
              id: "gid://shopify/Product/1",
              title: "Gallery Piece",
              handle: "gallery-piece",
              description: "",
              descriptionHtml: "",
              productType: null,
              vendor: null,
              tags: [],
              options: [],
              priceRange: {
                minVariantPrice: { amount: "100.00", currencyCode: "PKR" },
                maxVariantPrice: { amount: "100.00", currencyCode: "PKR" },
              },
              images: { edges: [] },
              variants: { edges: [] },
            },
          },
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await getProductByHandle("gallery-piece");

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).query as string;
    expect(body).toContain("images(first: 250)");
  });
});

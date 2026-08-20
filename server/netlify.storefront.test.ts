import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "../netlify/functions/api";
import { createProductOrderUrl } from "../client/src/lib/commerce";
import { clearProductListCache } from "./_core/shopify";
import { STOREFRONT_TRPC_PATHS, createNetlifyStorefrontApp } from "./_core/storefrontApp";
import { appRouter } from "./routers";
import { storefrontRouter } from "./routers/storefront";

const projectRoot = resolve(import.meta.dirname, "..");
const fetchMock = vi.fn();

beforeEach(() => {
  clearProductListCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  process.env.SHOPIFY_STORE_DOMAIN = "test.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_API_ACCESS_TOKEN = "test-token";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function ok(data: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ data }),
    text: async () => "",
  } as Response);
}

function netlifyEvent(path: string, method: "GET" | "POST", input?: unknown) {
  const query =
    method === "GET"
      ? `batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: input ?? null } }))}`
      : "";
  return {
    httpMethod: method,
    path,
    rawUrl: `https://store.example${path}${query ? `?${query}` : ""}`,
    rawQuery: query,
    headers: method === "POST" ? { "content-type": "application/json" } : {},
    queryStringParameters: method === "GET" ? { batch: "1", input: JSON.stringify({ 0: { json: input ?? null } }) } : null,
    multiValueQueryStringParameters: null,
    body: method === "POST" ? JSON.stringify({ json: input }) : null,
    isBase64Encoded: false,
  } as any;
}

describe("Netlify storefront adapter", () => {
  it("reuses the exact Shopify commerce router and exposes no Manus-only router namespaces", () => {
    const record = (storefrontRouter as any)._def.record;
    const managedRecord = (appRouter as any)._def.record;

    expect(Object.keys(record)).toEqual(["commerce"]);
    expect(record.commerce).toStrictEqual(managedRecord.commerce);
  });

  it("keeps the client API contract available at both local and Netlify function paths", () => {
    const app = createNetlifyStorefrontApp();
    expect(STOREFRONT_TRPC_PATHS).toEqual([
      "/api/trpc",
      "/.netlify/functions/api/trpc",
    ]);
    expect(app.locals.storefrontTrpcPaths).toEqual(STOREFRONT_TRPC_PATHS);
  });

  it("routes API calls before the SPA fallback and builds the deployed static output", () => {
    const config = readFileSync(resolve(projectRoot, "netlify.toml"), "utf8");

    expect(config).toContain('command = "pnpm run build:netlify"');
    expect(config).toContain('publish = "dist/public"');
    expect(config).toContain('from = "/api/*"');
    expect(config.indexOf('from = "/api/*"')).toBeLessThan(config.indexOf('from = "/*"'));
    expect(config).not.toContain("external_node_modules");
  });

  it("keeps Manus OAuth and storage proxy modules out of the Netlify function import path", () => {
    const appSource = readFileSync(
      resolve(projectRoot, "server/_core/storefrontApp.ts"),
      "utf8"
    );

    expect(appSource).not.toContain("./oauth");
    expect(appSource).not.toContain("./storageProxy");
    expect(appSource).not.toContain("../routers\"");
  });

  it("serves the Shopify product-list contract through the Netlify function path", async () => {
    ok({
      products: {
        edges: [
          {
            node: {
              id: "gid://shopify/Product/1",
              title: "Netlify Product",
              handle: "netlify-product",
              description: "",
              descriptionHtml: "",
              productType: "Branded Kara",
              vendor: "ALRAHEEM",
              tags: [],
              options: [],
              priceRange: {
                minVariantPrice: { amount: "2500", currencyCode: "PKR" },
                maxVariantPrice: { amount: "2500", currencyCode: "PKR" },
              },
              images: { edges: [] },
              variants: { edges: [] },
            },
          },
        ],
      },
    });

    const result = await handler(
      netlifyEvent("/.netlify/functions/api/trpc/commerce.products.list", "GET", {})
    );

    if (result.statusCode !== 200) throw new Error(result.body);
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("netlify-product");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("preserves Shopify cart checkout and WhatsApp ordering links through the Netlify-ready contract", async () => {
    ok({
      cartCreate: {
        cart: {
          id: "gid://shopify/Cart/1",
          checkoutUrl: "https://test.myshopify.com/checkout/netlify",
          totalQuantity: 1,
          cost: {
            totalAmount: { amount: "2500", currencyCode: "PKR" },
            subtotalAmount: { amount: "2500", currencyCode: "PKR" },
          },
          lines: { edges: [] },
        },
        userErrors: [],
      },
    });

    const result = await handler(
      netlifyEvent("/.netlify/functions/api/trpc/commerce.cart.create", "POST", {
        lines: [{ variantId: "gid://shopify/ProductVariant/1", quantity: 1 }],
      })
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("channel=online_store");

    const whatsapp = createProductOrderUrl({
      title: "Netlify Product",
      price: "PKR 2,500",
      productUrl: "https://store.example/product/netlify-product",
    });
    expect(whatsapp).toContain("wa.me/923361243334");
    expect(new URL(whatsapp).searchParams.get("text")).toContain("Netlify Product");
  });
});

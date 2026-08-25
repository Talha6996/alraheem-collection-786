import crypto from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { REFERRAL_DISCOUNT_PERCENT, getShopifyAdminAccessToken, resetShopifyAdminTokenCache, verifyShopifyWebhook } from "./shopifyPaidOrder";

const previousSecret = process.env.SHOPIFY_WEBHOOK_API_SECRET;
const previousClientId = process.env.SHOPIFY_CLIENT_ID;
const previousClientSecret = process.env.SHOPIFY_CLIENT_SECRET;
const previousStoreDomain = process.env.SHOPIFY_STORE_DOMAIN;
const previousAdminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

afterEach(() => {
  vi.unstubAllGlobals();
  resetShopifyAdminTokenCache();
  if (previousSecret === undefined) delete process.env.SHOPIFY_WEBHOOK_API_SECRET;
  else process.env.SHOPIFY_WEBHOOK_API_SECRET = previousSecret;
  if (previousClientId === undefined) delete process.env.SHOPIFY_CLIENT_ID;
  else process.env.SHOPIFY_CLIENT_ID = previousClientId;
  if (previousClientSecret === undefined) delete process.env.SHOPIFY_CLIENT_SECRET;
  else process.env.SHOPIFY_CLIENT_SECRET = previousClientSecret;
  if (previousStoreDomain === undefined) delete process.env.SHOPIFY_STORE_DOMAIN;
  else process.env.SHOPIFY_STORE_DOMAIN = previousStoreDomain;
  if (previousAdminToken === undefined) delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  else process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = previousAdminToken;
});

describe("verifyShopifyWebhook", () => {
  it("uses the approved 17 percent qualifying-purchase referral reward", () => {
    expect(REFERRAL_DISCOUNT_PERCENT).toBe(17);
  });

  it("accepts an HMAC produced by Shopify's shared webhook secret", () => {
    process.env.SHOPIFY_WEBHOOK_API_SECRET = "signed-webhook-secret";
    const body = Buffer.from('{"id":123,"email":"buyer@example.com"}', "utf8");
    const signature = crypto.createHmac("sha256", process.env.SHOPIFY_WEBHOOK_API_SECRET).update(body).digest("base64");
    expect(verifyShopifyWebhook(body, signature)).toBe(true);
  });

  it("rejects a missing, altered, or incorrectly signed request", () => {
    process.env.SHOPIFY_WEBHOOK_API_SECRET = "signed-webhook-secret";
    const body = Buffer.from('{"id":123}', "utf8");
    expect(verifyShopifyWebhook(body)).toBe(false);
    expect(verifyShopifyWebhook(body, "not-valid")).toBe(false);
    expect(verifyShopifyWebhook(Buffer.from('{"id":124}', "utf8"), crypto.createHmac("sha256", "another-secret").update(body).digest("base64"))).toBe(false);
  });

  it("uses the Shopify client-credentials grant once and caches the short-lived server token", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "alraheem786-9khraaqr-anchor-cedar-jcs11ees.myshopify.com";
    process.env.SHOPIFY_CLIENT_ID = "client-id";
    process.env.SHOPIFY_CLIENT_SECRET = "client-secret";
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ access_token: "short-lived-token", expires_in: 86_399 }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getShopifyAdminAccessToken()).resolves.toBe("short-lived-token");
    await expect(getShopifyAdminAccessToken()).resolves.toBe("short-lived-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://alraheem786-9khraaqr-anchor-cedar-jcs11ees.myshopify.com/admin/oauth/access_token");
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).toContain("grant_type=client_credentials");
  });
});

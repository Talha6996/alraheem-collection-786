import crypto from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { REFERRAL_DISCOUNT_PERCENT, verifyShopifyWebhook } from "./shopifyPaidOrder";

const previousSecret = process.env.SHOPIFY_WEBHOOK_API_SECRET;

afterEach(() => {
  if (previousSecret === undefined) delete process.env.SHOPIFY_WEBHOOK_API_SECRET;
  else process.env.SHOPIFY_WEBHOOK_API_SECRET = previousSecret;
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
});

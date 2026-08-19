import { describe, expect, it } from "vitest";
import { SHOPIFY_API_VERSION } from "./shopify";

describe("Shopify Storefront API configuration", () => {
  it("uses the current supported stable Storefront API version", () => {
    expect(SHOPIFY_API_VERSION).toBe("2026-07");
  });
});

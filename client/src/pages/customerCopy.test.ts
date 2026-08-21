import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const customerFacingPages = [
  "client/src/pages/Contact.tsx",
  "client/src/pages/Shop.tsx",
  "client/src/pages/PromotionCatalogue.tsx",
];

describe("customer-facing storefront copy", () => {
  it("does not expose the private commerce platform name", () => {
    for (const path of customerFacingPages) {
      const source = readFileSync(resolve(process.cwd(), path), "utf8");
      expect(source).not.toMatch(/shopify/i);
    }
  });
});

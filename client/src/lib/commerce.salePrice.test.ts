import { describe, expect, it } from "vitest";
import { isGenuineSale, multiplyMoney } from "./commerce";

describe("genuine Shopify sale pricing", () => {
  const current = { amount: "1800.00", currencyCode: "PKR" };
  const previous = { amount: "2500.00", currencyCode: "PKR" };

  it("shows an old price only when Shopify's compare-at value is higher", () => {
    expect(isGenuineSale(current, previous)).toBe(true);
    expect(isGenuineSale(current, { amount: "1800.00", currencyCode: "PKR" })).toBe(false);
    expect(isGenuineSale(current, { amount: "1500.00", currencyCode: "PKR" })).toBe(false);
    expect(isGenuineSale(current, { amount: "2500.00", currencyCode: "USD" })).toBe(false);
  });

  it("calculates the correct original total for a multi-quantity bag line", () => {
    expect(multiplyMoney(previous, 3)).toEqual({ amount: "7500.00", currencyCode: "PKR" });
  });
});

import { describe, expect, it } from "vitest";
import { getStorefrontTrpcEndpoint } from "./trpcEndpoint";

describe("getStorefrontTrpcEndpoint", () => {
  it("uses the direct Netlify function path for production Netlify builds", () => {
    expect(getStorefrontTrpcEndpoint(true)).toBe(
      "/.netlify/functions/api/trpc"
    );
  });

  it("keeps the existing API contract for local and Manus builds", () => {
    expect(getStorefrontTrpcEndpoint(false)).toBe("/api/trpc");
  });
});

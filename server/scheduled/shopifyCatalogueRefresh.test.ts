import { describe, expect, it, vi } from "vitest";

const { authenticateRequest, refreshProductListCache } = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  refreshProductListCache: vi.fn(),
}));

vi.mock("../_core/sdk", () => ({
  sdk: { authenticateRequest },
}));
vi.mock("../_core/shopify", () => ({
  refreshProductListCache,
}));

import { handleShopifyCatalogueRefresh } from "./shopifyCatalogueRefresh";

function responseMock() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as any;
  res.status.mockReturnValue(res);
  return res;
}

describe("scheduled Shopify catalogue refresh", () => {
  it("rejects unauthenticated requests", async () => {
    authenticateRequest.mockRejectedValueOnce(new Error("unauthenticated"));
    const res = responseMock();

    await handleShopifyCatalogueRefresh({} as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(refreshProductListCache).not.toHaveBeenCalled();
  });

  it("rejects non-cron users", async () => {
    authenticateRequest.mockResolvedValueOnce({ isCron: false });
    const res = responseMock();

    await handleShopifyCatalogueRefresh({} as any, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(refreshProductListCache).not.toHaveBeenCalled();
  });

  it("silently warms the catalogue for cron requests", async () => {
    authenticateRequest.mockResolvedValueOnce({ isCron: true });
    refreshProductListCache.mockResolvedValueOnce(44);
    const res = responseMock();

    await handleShopifyCatalogueRefresh({} as any, res);

    expect(refreshProductListCache).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, refreshedProducts: 44 });
  });

  it("returns a safe service response when Shopify refresh fails", async () => {
    authenticateRequest.mockResolvedValueOnce({ isCron: true });
    refreshProductListCache.mockRejectedValueOnce(new Error("provider unavailable"));
    const res = responseMock();

    await handleShopifyCatalogueRefresh({} as any, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: "Catalogue refresh unavailable" });
  });
});

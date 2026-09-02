import type { Request, Response } from "express";
import { refreshProductListCache } from "../_core/shopify";
import { sdk } from "../_core/sdk";

/**
 * Heartbeat callback for silent catalogue warming. Only the platform's cron
 * identity may invoke this route; ordinary shoppers never see its response.
 */
export async function handleShopifyCatalogueRefresh(
  req: Request,
  res: Response
): Promise<void> {
  let user;
  try {
    user = await sdk.authenticateRequest(req);
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!user.isCron) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const refreshedProducts = await refreshProductListCache();
    res.status(200).json({ ok: true, refreshedProducts });
  } catch (error) {
    console.error("[Shopify refresh] Scheduled catalogue refresh failed", error);
    res.status(503).json({ error: "Catalogue refresh unavailable" });
  }
}

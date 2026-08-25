import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { storefrontRouter } from "../routers/storefront";
import { createStorefrontContext } from "./storefrontContext";
import { processShopifyPaidOrder, verifyShopifyWebhook } from "./shopifyPaidOrder";

/**
 * Netlify rewrites `/api/*` to this function path. Keeping both mounts means
 * Shopify calls retain the same `/api/trpc` URL in local, Manus, and Netlify
 * environments.
 */
export const STOREFRONT_TRPC_PATHS = [
  "/api/trpc",
  "/.netlify/functions/api/trpc",
  "/trpc",
];

export const SHOPIFY_PAID_ORDER_WEBHOOK_PATHS = [
  "/api/webhooks/shopify/orders-paid",
  "/.netlify/functions/api/webhooks/shopify/orders-paid",
  "/webhooks/shopify/orders-paid",
];

function addBodyParsers(app: express.Express) {
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
}

function addShopifyPaidOrderWebhook(app: express.Express) {
  app.post(SHOPIFY_PAID_ORDER_WEBHOOK_PATHS, express.raw({ type: "application/json", limit: "2mb" }), async (req, res) => {
    if (!Buffer.isBuffer(req.body) || !verifyShopifyWebhook(req.body, req.header("x-shopify-hmac-sha256") ?? undefined)) {
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }
    const webhookId = req.header("x-shopify-webhook-id");
    if (!webhookId) {
      res.status(400).json({ error: "Missing webhook id" });
      return;
    }
    try {
      await processShopifyPaidOrder(JSON.parse(req.body.toString("utf8")), webhookId);
      res.status(200).json({ accepted: true });
    } catch (error) {
      console.error("[shopify-paid-order]", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
}

/**
 * Public, Shopify-only application used by Netlify Functions. It deliberately
 * excludes Manus OAuth, storage proxy, and notification routes. The commerce
 * router and its Storefront API operations are shared unchanged with local
 * development.
 */
export function createNetlifyStorefrontApp() {
  const app = express();
  addShopifyPaidOrderWebhook(app);
  addBodyParsers(app);
  app.locals.storefrontTrpcPaths = STOREFRONT_TRPC_PATHS;
  app.use(
    STOREFRONT_TRPC_PATHS,
    createExpressMiddleware({
      router: storefrontRouter,
      createContext: createStorefrontContext,
    })
  );
  return app;
}

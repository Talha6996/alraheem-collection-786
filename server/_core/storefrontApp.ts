import { timingSafeEqual } from "node:crypto";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { storefrontRouter } from "../routers/storefront";
import { createStorefrontContext } from "./storefrontContext";
import {
	ensureShopifyOrdersPaidSubscription,
	getReleasedAppOrdersPaidSubscription,
	processShopifyPaidOrder,
	verifyShopifyWebhook,
} from "./shopifyPaidOrder";

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

// Temporary operational route. It is never linked from the storefront and is
// removed immediately after the owner-approved one-time activation check.
export const SHOPIFY_ACTIVATION_VERIFIER_PATHS = [
  "/api/internal/shopify-activation-verify",
  "/.netlify/functions/api/internal/shopify-activation-verify",
  "/internal/shopify-activation-verify",
];

function verifierSecretMatches(provided: string | undefined) {
  const expected = process.env.SHOPIFY_ACTIVATION_CHECK_TOKEN;
  if (!provided || !expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

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

function addTemporaryShopifyActivationVerifier(app: express.Express) {
  app.post(SHOPIFY_ACTIVATION_VERIFIER_PATHS, async (req, res) => {
    const authorization = req.header("authorization");
    const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    if (!verifierSecretMatches(bearer)) {
      // A non-descriptive response avoids advertising an operational endpoint.
      res.status(404).end();
      return;
    }
    try {
		const requestedAction = req.header("x-shopify-activation-action");
		if (requestedAction === "register-orders-paid") {
			const result = await ensureShopifyOrdersPaidSubscription();
			// The subscription identifier is deliberately withheld. This temporary
			// action is only for the owner-approved registration step and has no
			// access to orders, customers, rewards, reviews, or discounts.
			res.status(200).json({
				tokenExchange: "ok",
				releasedAppOwnsOrdersPaidSubscription: true,
				registration: result.created ? "created" : "already-present",
			});
			return;
		}
      const subscription = await getReleasedAppOrdersPaidSubscription();
      // Credentials, access tokens, subscription IDs, order data, and customer
      // data must never leave this function. Only one-time pass/fail metadata
      // is returned to the holder of the temporary Netlify secret.
      res.status(200).json({
        tokenExchange: "ok",
        releasedAppOwnsOrdersPaidSubscription: Boolean(subscription),
      });
    } catch (error) {
      console.error("[shopify-activation-verifier] verification failed", error instanceof Error ? error.message : "unknown error");
      res.status(502).json({ verification: "failed" });
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
  addTemporaryShopifyActivationVerifier(app);
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

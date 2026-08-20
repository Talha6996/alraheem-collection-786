import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { storefrontRouter } from "../routers/storefront";
import { createStorefrontContext } from "./storefrontContext";

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

function addBodyParsers(app: express.Express) {
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
}

/**
 * Public, Shopify-only application used by Netlify Functions. It deliberately
 * excludes Manus OAuth, storage proxy, and notification routes. The commerce
 * router and its Storefront API operations are shared unchanged with local
 * development.
 */
export function createNetlifyStorefrontApp() {
  const app = express();
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

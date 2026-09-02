import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { handleShopifyCatalogueRefresh } from "../scheduled/shopifyCatalogueRefresh";

function addBodyParsers(app: express.Express) {
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
}

/** Existing local/Manus runtime application. */
export function createManagedRuntimeApp() {
  const app = express();
  addBodyParsers(app);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.post("/api/scheduled/shopify-catalogue-refresh", handleShopifyCatalogueRefresh);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}

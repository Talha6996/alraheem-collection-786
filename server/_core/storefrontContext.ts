import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { TrpcContext } from "./context";

/**
 * Public Shopify commerce requires no account session. Keeping this context in
 * its own module prevents the Netlify function from loading Manus OAuth code.
 */
export function createStorefrontContext(
  opts: CreateExpressContextOptions
): TrpcContext {
  return {
    req: opts.req,
    res: opts.res,
    user: null,
  };
}

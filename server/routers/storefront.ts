import { router } from "../_core/trpc";
import { commerceRouter } from "./commerce";

/** Independent public API surface: Shopify catalogue, cart, and checkout only. */
export const storefrontRouter = router({
  commerce: commerceRouter,
});

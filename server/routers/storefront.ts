import { router } from "../_core/trpc";
import { commerceRouter } from "./commerce";
import { customerRouter } from "./customer";
import { guideRouter } from "./guide";

/** Independent public API surface: Shopify catalogue, cart, and checkout only. */
export const storefrontRouter = router({
  commerce: commerceRouter,
  customer: customerRouter,
  guide: guideRouter,
});

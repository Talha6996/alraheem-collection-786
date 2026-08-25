# Customer Data Service Setup

The production customer-data service is a Supabase project named `alraheem-customer-data`, located in the South Asia (Mumbai) region.

- Project URL: `https://omdrakuodqbzcwgiixne.supabase.co`
- Table exposure was disabled during creation.
- Row-level security was enabled during creation.
- Netlify requires the protected server-only environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Never place the Supabase secret/service key or Shopify Admin token in browser code, repository files, public documentation, or customer-facing variables.

## Qualifying-purchase safeguards

The required schema in `supabase/customer-data-schema.sql` was applied successfully through a one-time project-restricted management token. That token was deleted immediately after the migration and is no longer active. The schema creates **no fabricated customers, purchases, ratings, reviews, or rewards**. All customer-data tables use row-level security, and the server service key is used only inside Netlify functions.

The protected paid-order endpoint is `/api/webhooks/shopify/orders-paid`. It accepts only a Shopify HMAC-signed order-paid event, records the order and its actual product IDs once, then makes a review possible only when the authenticated customer has a matching recorded purchase. A referral reward can be issued only once after a referred customer’s qualifying paid order. The approved reward is a one-use **17% discount**, generated server-side using a Shopify Admin API token.

## Remaining Shopify configuration

Shopify's custom-app settings screen was returning a Shopify technical-error page as of 25 August 2026. The live endpoint remains intentionally inactive until the existing custom app has the `read_orders` and `write_discounts` Admin API scopes, a protected Admin API token, its app API secret for HMAC validation, and an `orders/paid` webhook subscription pointing to the endpoint above. This prevents any unverified review or reward from being issued while the provider-side setup is incomplete.

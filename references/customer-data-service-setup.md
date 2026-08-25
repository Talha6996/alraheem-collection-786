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

On the current Dev Dashboard draft based on `alraheem-netlify-storefront-2`, the existing storefront checkout and catalogue scopes were preserved and the approved Admin scopes `read_orders` and `write_discounts` were added. This manual version form exposes the Webhooks API-version selector but no per-topic event-destination control. After release, the signed `orders/paid` subscription will be created through the Admin API using a private token stored only in Netlify.

On 25 August 2026, the approved configuration was released as active `alraheem-netlify-storefront-3`. The Dev Dashboard App settings view exposes an app Client ID and secret but no static Admin API access token; the correct supported token flow is being verified before any credential is copied or stored.

### Official credential guidance

Shopify's official client-credentials guide confirms that a Dev Dashboard app acting on its own organization’s store exchanges the app client ID and client secret at `https://{shop}.myshopify.com/admin/oauth/access_token` using `grant_type=client_credentials`. The returned token expires after 24 hours and should be cached server-side then refreshed before expiry; it must not be inserted in browser code. Shopify also documents that the client secret signs webhooks and must remain in protected environment configuration. Sources: [Shopify client-credentials grant](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant) and [Shopify credential management](https://shopify.dev/docs/apps/build/authentication-authorization/manage-credentials).

On 25 August 2026, the owner-opened Shopify Apps page successfully displayed the installed **ALRAHEEM NETLIFY STOREFRONT** app. Its visible permissions cover Online Store, Other data, and Products. The app detail does not show the required Orders access or discount-writing access, so the next required change remains in Shopify's **Develop apps** configuration for this app: enable `read_orders` and `write_discounts`, reinstall or update the app, securely store the resulting Admin API token in Netlify, then register the signed `orders/paid` event subscription. No Shopify token value is recorded in this file.

Shopify's custom-app settings screen was returning a Shopify technical-error page as of 25 August 2026. The live endpoint remains intentionally inactive until the existing custom app has the `read_orders` and `write_discounts` Admin API scopes, a protected Admin API token, its app API secret for HMAC validation, and an `orders/paid` webhook subscription pointing to the endpoint above. This prevents any unverified review or reward from being issued while the provider-side setup is incomplete.

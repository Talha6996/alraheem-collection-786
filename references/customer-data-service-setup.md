# Customer Data Service Setup

The production customer-data service is a Supabase project named `alraheem-customer-data`, located in the South Asia (Mumbai) region.

- Project URL: `https://omdrakuodqbzcwgiixne.supabase.co`
- Table exposure was disabled during creation.
- Row-level security was enabled during creation.
- Netlify requires the protected server-only environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Never place the Supabase secret/service key or Shopify Admin token in browser code, repository files, public documentation, or customer-facing variables.

## Qualifying-purchase safeguards

**Current status — paused by the owner on 26 August 2026.** Referral-discount activation is not live, no released-app paid-order subscription was created, and no referral reward is issued. The remaining notes document dormant server-side safeguards only; they do not activate the feature.

The required schema in `supabase/customer-data-schema.sql` was applied successfully through a one-time project-restricted management token. That token was deleted immediately after the migration and is no longer active. The schema creates **no fabricated customers, purchases, ratings, reviews, or rewards**. All customer-data tables use row-level security, and the server service key is used only inside Netlify functions.

The protected paid-order endpoint is `/api/webhooks/shopify/orders-paid`. It accepts only a Shopify HMAC-signed order-paid event, records the order and its actual product IDs once, then makes a review possible only when the authenticated customer has a matching recorded purchase. A referral reward can be issued only once after a referred customer’s qualifying paid order. The approved reward is a one-use **17% discount**, generated server-side using a Shopify Admin API token.

## Shopify production configuration

On 25 August 2026, the approved configuration was released as active `alraheem-netlify-storefront-3`, preserving the storefront scopes and adding the approved `read_orders` and `write_discounts` Admin scopes. The Netlify function uses Shopify’s client-credentials grant to obtain a short-lived Admin API token only in server memory, refreshes it before expiry, and never returns it to a browser.

The live store currently exposes one `ORDERS_PAID` subscription at `https://alraheemcollection786.netlify.app/.netlify/functions/api/webhooks/shopify/orders-paid`, but it was created by a different app integration and must not be treated as signed by the released app's client secret. The deployed webhook endpoint was safely checked with an unsigned empty request and correctly returned `401 Invalid webhook signature`; no customer, order, review, reward, or discount record was generated during that check.

### Official credential guidance

Shopify's official client-credentials guide confirms that a Dev Dashboard app acting on its own organization’s store exchanges the app client ID and client secret at `https://{shop}.myshopify.com/admin/oauth/access_token` using `grant_type=client_credentials`. The returned token expires after 24 hours and should be cached server-side then refreshed before expiry; it must not be inserted in browser code. Shopify also documents that the client secret signs webhooks and must remain in protected environment configuration. Sources: [Shopify client-credentials grant](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant) and [Shopify credential management](https://shopify.dev/docs/apps/build/authentication-authorization/manage-credentials).

### Safe remaining activation check

The positive client-credentials exchange is now verified in production. A read-only `webhookSubscriptions` query under the released app’s own server-only token confirmed that it owns **no** `ORDERS_PAID` subscription. The owner-approved, idempotent attempt to create that shop-specific subscription was rejected by Shopify with `You cannot create a webhook subscription with the specified topic`; it created no callback, order, customer, review, reward, or discount.

Shopify's current documentation says that webhook topics require the matching access scope and recommends using an **app-specific** webhook configuration released with the app version. Its order-webhook example uses `read_orders`. The required provider-side correction is to configure `orders/paid` for the released app in Shopify Dev Dashboard and release a new app version, then re-run only the metadata verifier. Sources: [Manage webhook subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe) and [Create a webhook subscription](https://shopify.dev/docs/apps/build/webhooks/get-started).

### App-specific configuration finding — 25 August 2026

The released version editor in the connected Shopify Dev Dashboard exposes only the `Webhooks API version` selector; it does not expose a control for adding regular app-specific topics. Shopify’s current official documentation states that regular app-specific webhook subscriptions are defined through `[[webhooks.subscriptions]]` in `shopify.app.toml` and released through `shopify app deploy`; the Dev Dashboard version editor is documented only for updating the webhook API version. The relevant production declaration is:

```toml
[webhooks]
api_version = "2026-07"

[[webhooks.subscriptions]]
topics = ["orders/paid"]
uri = "https://alraheemcollection786.netlify.app/.netlify/functions/api/webhooks/shopify/orders-paid"
```

This is an app-specific subscription, which Shopify says is configuration-managed rather than listed by the Admin API query. Source: [Manage webhook subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe) and [App configuration](https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration).

The owner approved a one-time, temporary verifier to obtain the positive token-exchange and subscription-ownership proof without creating commerce data. The checkpoint containing that verifier is `f63e6b7b`; its Netlify production deployment started on 25 August 2026 and must complete before the verifier secret is configured and the check is run. The endpoint requires a separate `SHOPIFY_ACTIVATION_CHECK_TOKEN`, uses constant-time bearer comparison, returns only pass/fail metadata, and must be removed with the secret immediately after the result is recorded.

Initial Netlify polling showed the verifier deployment still in the building state. No manual deploy, provider mutation, or customer-data operation was performed while it was building.

At the read-only deploy-detail check, Netlify had prepared `main@f63e6b7`, completed dependency installation, and started the configured build script. The log reported only its standard ignored-build-scripts warning; it showed no build failure at that point.

The subsequent deploy log confirmed that Vite completed, the `api.ts` Netlify function was packaged, and Netlify scanned 217 files with no secret detected. At that time the platform was still in its final publishing stage.

The Netlify settings check confirmed that the existing `SHOPIFY_CLIENT_SECRET` remains restricted to Builds, Functions, and Runtime in one deploy context. The separate verifier token will use the same Functions/Runtime production restriction and will be deleted as soon as the result has been recorded.

For the owner-approved one-time check, a separate high-entropy `SHOPIFY_ACTIVATION_CHECK_TOKEN` was generated locally and prepared in Netlify as a masked secret. Its value is intentionally omitted from all source, documentation, logs, and deployment notes.

Netlify accepted the temporary token with a single protected Production value. It is displayed as restricted to Builds, Functions, and Runtime and remains separate from all permanent commerce credentials. After the initial path/authorization diagnostics, the one-time value was rotated and the unchanged `main@b405aaf` deployment was refreshed successfully. Netlify reported one function deployed and both redirect rules processed. The value remains temporary and must be deleted after the protected operation.

The verifier code deployment was confirmed as published (`main@f63e6b7`, with one function deployed and both redirect rules processed). Its initial call returned the intentional non-descriptive `404`, consistent with the token having been added after that function bundle was published. Netlify was therefore instructed to redeploy the unchanged `main` head so the current runtime receives the temporary token; this action creates no Shopify or customer records.

Because the existing subscription was originally created through the store-management integration, its signing-app ownership cannot be inferred from the read-only subscription listing alone. Do not delete it or create a duplicate automatically. Before replacing it, obtain owner approval and invoke the server-only helper from a protected operational context; then remove the stale subscription only after the released app’s callback is confirmed. No secret, token, or credential value is recorded in this file.

### Retired temporary activation access — 26 August 2026

After the owner paused referral activation, the temporary `SHOPIFY_ACTIVATION_CHECK_TOKEN` was deleted from Netlify Production and the temporary verifier route was removed from the Netlify function code. The permanent signed paid-order route remains in code and continues to require a valid Shopify HMAC; without a released app-specific `orders/paid` subscription, it receives no live referral-processing events. The final cleanup checkpoint is `a5ad19a8`, and its Netlify production deployment has published successfully with two redirect rules and one function deployed. A harmless public request to the retired temporary route returned `404`, while an unsigned empty request to the permanent paid-order route returned `401 Invalid webhook signature`; neither request carried an order payload or created customer, review, reward, discount, or other commerce data.

# Shopify Custom App and Storefront Token Research

## Current official findings

The existing Netlify server code calls the **Storefront API** using `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN`; it sends that token in Shopify’s `X-Shopify-Storefront-Access-Token` header. This is the correct interface for public product browsing and cart operations.

Shopify’s current documentation warns that new **admin-created custom apps** can no longer be created directly in Shopify Admin. The older admin-created-app token documented there is for the **Admin API**, not the Storefront API. Therefore, the former instruction to create a token directly through an old-style Shopify Admin Custom App must not be used for this Netlify storefront. [1]

The supported current custom-app route is to create an API-only app in the **Shopify Dev Dashboard**, create and release a version with the required Admin API scopes, then install it on the owner’s store. For an app acting on a store in the owner’s Shopify organization, Shopify documents the client-credentials grant: the app exchanges its Client ID and Client Secret for a short-lived Admin API token. [2] [3]

Shopify’s Admin GraphQL API provides `storefrontAccessTokenCreate`, which creates a public Storefront API token for buyer-facing storefronts. The resulting Storefront token is what belongs in Netlify as `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN`; it is separate from the temporary Admin token and continues to use the existing server code without modification. [4]

| Credential | Where it belongs | Purpose | Never expose? |
| --- | --- | --- | --- |
| Custom App Client ID | Netlify Function environment | Requests temporary Admin access | Yes |
| Custom App Client Secret | Netlify Function environment | Requests temporary Admin access | Yes |
| Temporary Admin access token | Memory only during a token-creation/rotation action | Calls `storefrontAccessTokenCreate` | Yes |
| Storefront access token | `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN` in Netlify Function environment | Existing product, collection, cart, and checkout calls | Yes |

The Netlify preparation already keeps `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN` server-side. The change required is documentation and a safe one-time/store-owned method for creating a compatible Storefront token; the public Shopify commerce API contract does not change.

## References

[1] [Shopify: Generate access tokens for admin-created custom apps](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/generate-app-access-tokens-admin)

[2] [Shopify: Create apps using the Dev Dashboard](https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard)

[3] [Shopify: Authenticate an app for stores in your organization](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant)

[4] [Shopify: `storefrontAccessTokenCreate` Admin GraphQL mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/storefrontAccessTokenCreate)

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

## Current Dev Dashboard screen

The current **Versions** page shows one **API access** section with an upper **Scopes** field and a **Select scopes** control. It does not show a separate “Enable Storefront API access” switch. The required unauthenticated Storefront API scopes belong in that upper field; the optional scope and redirect-URL fields are not needed for this storefront. After the version is released and installed, the Custom App’s client credentials obtain a short-lived Admin API token, which is used once to run `storefrontAccessTokenCreate` and produce the Netlify Storefront token. [2] [3] [4]

## Client-credentials 400 investigation

Shopify documents that the client-credentials request must target `https://{shop}.myshopify.com/admin/oauth/access_token` and send the Custom App client ID, client secret, and `grant_type=client_credentials`. The resulting Admin API token expires after 24 hours. [5]

For a Dev Dashboard app, Shopify’s most relevant documented 400 condition is `shop_not_permitted`: client credentials work only when both the app and the target store belong to the same Shopify organization in the Dev Dashboard. Merely owning or installing the app on a store does not establish that organization relationship. The immediate next step is to surface the response body locally without disclosing credentials, then confirm whether the target store appears under the same Dev Dashboard organization as the app. [5]

The owner’s local diagnostic returned Shopify’s exact response: `Oauth error app_not_installed: The application is not installed on this shop.` This is a prerequisite issue, not a credential leak or a Netlify issue. The active Custom App version and scopes are correct; the app must now be installed or authorized on `alraheem786-9khraaqr-anchor-cedar-jcs11ees.myshopify.com` before the client-credentials request can return an Admin API token.

Shopify’s official store-admin instructions for Dev Dashboard Custom Apps are: **Shopify Admin → Settings → Apps → Develop apps → Build apps in Dev Dashboard → select the Custom App → Installs → Install app → select the target store if prompted → Install**. The client-credentials flow requires this installation and issues a 24-hour Admin API token only after the app is installed. [6] [7]

## References

[6] [Shopify Help: Installing and setting up apps](https://help.shopify.com/en/manual/apps/install-setup-apps)

[7] [Shopify Dev Docs: Using the client credentials grant](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant)

## Sources

[5] [Shopify: Authenticate an app for stores in your organization](https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens)

## References

[1] [Shopify: Generate access tokens for admin-created custom apps](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/generate-app-access-tokens-admin)

[2] [Shopify: Create apps using the Dev Dashboard](https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard)

[3] [Shopify: Authenticate an app for stores in your organization](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant)

[4] [Shopify: `storefrontAccessTokenCreate` Admin GraphQL mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/storefrontAccessTokenCreate)

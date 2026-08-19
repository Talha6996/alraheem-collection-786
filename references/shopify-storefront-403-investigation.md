# Shopify Storefront API 403 investigation

## Verified observations

- On 2026-08-19, the project catalogue probe returned HTTP 403 from the configured Storefront API endpoint. The response body was Shopify’s **Access denied** page, not a GraphQL error response.
- The same **Access denied / Your request was blocked** page was returned from the connected store’s public root URL, confirming this is broader than one homepage query or a single product.
- Shopify Admin API access remains available for the connected trial store, so the shop identity and product-management connection are intact.
- The authenticated Shopify Admin homepage shows **Unlock your online store** and states that the store is password-protected until it is ready to go live. This prevents normal public-store access and is the outstanding store-level restriction to remove.
- The same homepage shows the Manus project domain `alraheem786-9khraaqr.manus.space` as the storefront destination; the application itself remains the intended customer-facing site.

## Code hardening

The storefront adapter was moved from the retired `2025-04` Storefront API version to the current stable `2026-07` version. Shopify says Storefront API versions are supported for a minimum of 12 months and requests to inaccessible versions fall forward; production storefronts should specify a currently supported stable version.

## References

- [Shopify API versioning](https://shopify.dev/docs/api/usage/versioning)
- [Shopify Storefront API reference](https://shopify.dev/docs/api/storefront/latest)

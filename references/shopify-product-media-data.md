# Shopify Product Media and Availability Reference

**Retrieved:** 21 August 2026

The Shopify Storefront API `Product` object exposes `availableForSale` for a product and a `media` connection for associated product media, including images and videos. Shopify documents that the media connection supports images, 3D models, and videos. Product availability is intentionally represented as a public sale-availability flag in this storefront; private exact inventory quantities are not requested.

Shopify-hosted `Video` media provides an `alt` label, a preview image, and one or more source URLs with format and dimension information. The storefront will request Shopify-hosted video sources and render the supplied video directly when a product has video media.

## Sources

- [Product — Shopify Storefront API](https://shopify.dev/docs/api/storefront/latest/objects/Product)
- [Video — Shopify Storefront API](https://shopify.dev/docs/api/storefront/latest/objects/Video)

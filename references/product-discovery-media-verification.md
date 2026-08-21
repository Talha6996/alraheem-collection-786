# Product Discovery, Media, and WhatsApp Feature Verification

**Date:** 21 August 2026

## Implemented storefront features

| Feature | Verification |
|---|---|
| Full-screen product media | The product gallery provides a labelled full-screen control. The component test opens its modal and verifies navigation inside it. Touch swipe handlers change media when the swipe passes the interaction threshold. |
| Shopify product videos | The storefront media contract normalizes Shopify video entries and renders browser-native video controls with a preview image. The gallery test confirms image and video media can coexist and the video is shown in full screen. |
| Recently viewed | Product pages save visited Shopify products in browser-local storage and render them as cards, excluding the current product. No customer data is sent to the server. |
| Related products | The product page derives up to four live, available items from the Shopify catalogue, prioritizing matching collection/category and excluding the current item. |
| Stock status | Out-of-stock availability comes directly from Shopify. "Only 2 left" and limited-availability messages can be deliberately enabled with the owner’s product tags; the storefront does not invent inventory counts. |
| New Arrivals and Sale | `/new-arrivals` lists recent available Shopify products. `/sale` only lists products with a genuine compare-at markdown. |
| Floating WhatsApp | A persistent bottom-right button uses the verified `923361243334` business number. |

## Visual checks

Desktop checks confirmed the persistent WhatsApp button, the New Arrivals catalogue grid, and clear stock information alongside the Party Set product. Mobile checks confirmed the New Arrivals cards and WhatsApp button fit within a 375 px viewport; the Party Set gallery maintains its full-screen entry point and touch-friendly media controls.

## Test status

Focused commerce and product-gallery tests pass, including full-screen video rendering. The Netlify production build completes. The full suite reports one pre-existing live Shopify cart smoke-test discrepancy: Shopify returned a stale quantity of 1 after a requested live-cart update to 2. The feature-specific tests all pass, and the storefront changes do not alter cart mutation code.

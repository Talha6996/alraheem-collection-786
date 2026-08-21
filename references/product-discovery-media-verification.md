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

On the deployed public Party Set page, the `View product media full screen` control opened a dark full-screen viewer with an enlarged first Shopify image, `1 / 3 · Swipe to browse` guidance, a close control, and previous/next controls. The same deployed page showed the `IN STOCK` availability label, a related-pieces section without the current Party Set item, and the persistent bottom-right WhatsApp button.

The deployed viewer’s next-media control was then used successfully: the count changed from `1 / 3` to `2 / 3`, and the enlarged photo changed to the second Shopify image. This confirms live full-screen media navigation as well as the in-component interaction tests.

Closing the viewer returned the customer to the same product page with the selected second image shown in the normal gallery, confirming that the modal does not interrupt product details, stock status, checkout controls, related pieces, or global WhatsApp access.

After visiting the second public product, `Rectangle white stone Kara Bangle`, the deployed page displayed `Party Set` under `YOUR BROWSING HISTORY / Recently viewed` and did not list the current Kara Bangle there. Its `Related pieces` showed Party Set and ZULBERY BAG but excluded the current Kara Bangle. The second product also displayed the public `IN STOCK` status, confirming real product-page stock, recently viewed, and current-product-exclusion behaviour.

The deployed `/new-arrivals` route loaded the latest live Shopify products—Party Set, ZULBERY BAG, Rectangle white stone Kara Bangle, and White Stone Kara—in a customer-facing catalogue grid. Its header navigation includes both New Arrivals and Sale, and the site-wide WhatsApp button remained visible at the lower right.

The deployed unavailable `ZULBERY BAG` product page displayed `OUT OF STOCK` and `This piece is currently unavailable to order.` Its normal add-to-bag control was replaced with an unavailable button, while WhatsApp remained available for an owner/customer availability enquiry. The same page listed the two earlier visits in Recently viewed and excluded the current ZULBERY BAG item.

The deployed `/sale` page loaded Party Set, Rectangle white stone Kara Bangle, and White Stone Kara under `The sale.` The page labels the content as `Current Shopify pieces with a genuine marked-down compare-at price`, confirming that the dedicated route is populated from real Shopify markdown data rather than invented sale products.

## Related-product and low-stock edge states

When Shopify has no matching related products, the product page now shows the customer-facing message **“More pieces are coming soon.”** with a direct route to the full collection; a jsdom component test covers this deterministic empty state.

Shopify’s public Storefront API reveals whether an item is sellable but does not expose a reliable public inventory count. To show a deliberate low-stock message, add one of these exact product tags in Shopify: `Only 2 left`, `Low stock`, `Limited stock`, or `Limited availability`. The storefront renders the matching limited-availability badge. Without one of these owner-controlled tags, customers safely see **In stock** rather than a made-up quantity. The low-stock component test verifies both the `Only 2 left` tag path and the no-tag fallback.

## Test status

Focused commerce and product-gallery tests pass, including full-screen video rendering. The Netlify production build completes. The full suite reports one pre-existing live Shopify cart smoke-test discrepancy: Shopify returned a stale quantity of 1 after a requested live-cart update to 2. The feature-specific tests all pass, and the storefront changes do not alter cart mutation code.

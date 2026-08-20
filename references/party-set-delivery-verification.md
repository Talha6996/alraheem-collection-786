# PARTY SET and Pakistan Delivery Verification

## Shopify configuration

On 20 August 2026, Shopify Admin API verification confirmed that the active Domestic Pakistan delivery method is named **Standard** and remains priced at **PKR 250.00**. The method definition is `gid://shopify/DeliveryMethodDefinition/906517446870`.

The owner-created **PARTY SET** collection has handle `party-set`, ID `gid://shopify/Collection/480887767254`, an owner-supplied Shopify collection image, and is published to the **Online Store** publication (`gid://shopify/Publication/204778963158`). Shopify currently reports no products assigned to this collection.

## Storefront deployment status

Local visual verification shows PARTY SET in the homepage category grid, desktop navigation, footer, and the Shop category filter. The public Netlify site was initially serving the prior seven-category build immediately after checkpoint `13606b58`, then refreshed successfully after the automatic build. The live homepage now displays PARTY SET as category 08, and `https://alraheemcollection786.netlify.app/shop?category=party-set` recognizes the filter correctly.

The owner-created PARTY SET collection currently has no products assigned in Shopify, so its live Shop view correctly reports zero pieces until products are manually added to that collection.

The checked Shopify checkout session has no delivery address, so Shopify does not yet render a customer-facing shipping-option label in that session. This is expected behaviour: shipping labels are calculated after delivery address information is provided. The Shopify Admin API directly confirms the active Domestic rate is **Standard** at **PKR 250.00**, without altering the price, and the same configuration governs checkout calculation.

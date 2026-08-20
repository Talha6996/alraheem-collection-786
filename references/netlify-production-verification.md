# Netlify Production Verification

## Production URL

`https://alraheemcollection786.netlify.app/`

## Initial check — 20 August 2026

The production Netlify deployment loaded successfully. The homepage title and navigation rendered, and a subsequent rendered-page check confirmed that the circular ALRAHEEM logo and portrait hero image were delivered successfully from the configured public asset path.

The direct route `/shop?category=branded-kara` also rendered correctly through Netlify. At the time of checking, it displayed `0 PIECES FOUND`; the deployed Shopify catalogue response therefore still requires investigation before launch verification can be completed.

The Netlify dashboard confirms that the `api` serverless function is deployed and active in production. A direct anonymous request to its public tRPC endpoint returned HTTP 502, so the next check is the function invocation detail and its production error output.

The function remains listed as active in the Netlify production dashboard after the failed public request.

## Bundle correction

The production HTTP 502 body identified `Runtime.ImportModuleError: Cannot find module 'express'`. The Netlify configuration had marked Express as an external function dependency, but Netlify did not supply that external package at runtime. The `external_node_modules` setting was removed so the esbuild function bundler includes Express in the deployed `api` function. The complete test suite passed (29 tests passed, 1 skipped), and the Netlify production build completed after the change. A new deployment is required before rechecking the live endpoint.

Netlify automatically detected the correction from the connected `main` branch and began publishing production deploy `main@27be993`.

## Request-path correction

After the dependency correction deployed, the live endpoint returned HTTP 200 but an empty body. Netlify strips `/.netlify/functions/api` from the request path before handing it to the Express adapter, so the function receives `/trpc/...`. The public Shopify router is now mounted at `/trpc` as well as the local and direct function paths. Automated coverage now exercises this stripped production path; the focused adapter test, full suite (29 passed, 1 skipped), and Netlify production build all passed. A final automatic deployment will publish this routing correction for live verification.

Netlify detected the routing correction and started the final production deploy `main@0ee540c`; at the latest check it was uploading, while the preceding dependency fix `main@27be993` was published.

## Batched-query delivery correction

Direct requests to `/.netlify/functions/api/trpc/commerce.products.list` returned the expected JSON body, while the public `/api/trpc/...` redirect produced an empty body. The deployed client now selects the direct function endpoint only in Netlify builds through `VITE_NETLIFY_FUNCTIONS=true`, configured in `netlify.toml`. Local and Manus builds keep `/api/trpc`. The unit suite now has 31 passing tests and 1 skipped test, and a Netlify-configured production build was inspected to confirm the direct endpoint is embedded in the generated client bundle. Final live verification is pending the automatic redeploy.

## Final deployment status

Netlify automatically began production deploy `main@2dc9950`. Its Vite build, function bundling, and secret scan all completed successfully. At the latest dashboard check, Netlify’s Deploying, Cleanup, and Post-processing stages remained pending, so the existing live site continues to serve the preceding published version. No live catalogue conclusion has been made until this deployment finishes.

Further verification remains required for the seven category images, Shopify catalogue requests, bag flow, checkout hand-off, WhatsApp ordering link, and mobile rendering.

## Confirmed Shopify collection visibility

The independent Storefront token initially returned products but only the `frontpage` and `party-set` collection handles, because the seven existing manual collections were published only to the Manus sales channel. The seven manual categories were also published to Shopify’s Online Store channel without changing their memberships or product records. The live Netlify Storefront API now lists all required handles: `jewellery`, `handbags`, `ladies-suit`, `mens-suit`, `branded-kara`, `bridal-sets`, and `mens-bracelet`.

The live `branded-kara` endpoint now returns two products and the rendered route `https://alraheemcollection786.netlify.app/shop?category=branded-kara` displays both cards at PKR 2,250.

## Cloudinary delivery audit in progress

All nine expected public Cloudinary URLs returned HTTP 200 on 20 August 2026: the logo, hero image, and the seven category images. The deployed JavaScript bundle embeds the configured Cloudinary base `https://res.cloudinary.com/olyxyinv/image/upload`; it also retains `/manus-storage/` strings as source-path inputs to the runtime asset helper, so a final runtime-page audit is still required to confirm that rendered image URLs—not merely the compiled source—use Cloudinary.

## Completed rendered-asset and routing verification

The rendered production homepage was inspected after image loading completed. It displayed the supplied logo, hero image, and all seven category cards. Its browser-rendered image tags resolved to Cloudinary for every brand asset and to Shopify CDN only for the live product image; the rendered HTML contained **zero** image references to `/manus-storage/`.

The live Netlify product route for `rectangle-white-stone-kara-bangle` resolved after its normal loading transition and displayed the Shopify title, PKR 2,250 price, product image, `ADD TO BAG`, and `ORDER ON WHATSAPP` actions. The live Branded Kara catalogue route also displays the two published Shopify products, confirming the direct serverless tRPC route and manual collection publication work together in production.

## Successful live Shopify and asset verification

The independent Shopify Storefront token initially exposed the products but not the seven manual collection handles because those collections were published only to the Manus sales channel. The seven existing manual collections were additionally published to Shopify’s Online Store channel without changing their memberships or products. The live Storefront API now returns all required handles: `jewellery`, `handbags`, `ladies-suit`, `mens-suit`, `branded-kara`, `bridal-sets`, and `mens-bracelet`.

The live `branded-kara` query now returns two published products, and the rendered Netlify route `/shop?category=branded-kara` displays both product cards at PKR 2,250. The homepage also renders the supplied circular logo and hero graphic. Direct checks of the Cloudinary logo and a category image returned HTTP 200, confirming the independent storefront is reading its branded images from the owner-controlled Cloudinary account rather than Manus storage.

## Live bag and WhatsApp verification

On the live product page for `rectangle-white-stone-kara-bangle`, selecting **ADD TO BAG** opened the shopping-bag drawer with the correct product, quantity of 1, and PKR 2,250 subtotal. The drawer also rendered the **SECURE CHECKOUT** control. The **ORDER ON WHATSAPP** product link was inspected without opening a chat; it resolves to the configured WhatsApp number `923361243334` with the product name, price, canonical Netlify product URL, and delivery-information prompt prefilled. The checkout button was not activated because it may proceed into a customer payment flow.

## Approved Shopify checkout handoff test

With owner approval, the shopping-bag **SECURE CHECKOUT** action opened Shopify checkout for the correct product, quantity of 1, and PKR 2,250 item price. No contact, address, delivery, or payment information was entered and no order was submitted. Shopify checkout currently displays the notice **“This store can’t accept payments right now.”** The storefront-to-checkout handoff is therefore working, but accepting card or online payments requires the store owner to configure an active payment provider in Shopify. WhatsApp ordering remains available for manual order confirmation.

## Cash on Delivery activation and checkout verification

At the owner’s request, **Cash on Delivery (COD)** was enabled in Shopify under Manual payment methods. The live Shopify checkout was reopened without entering customer information or submitting an order. It now displays `Cash on Delivery (COD)` in the Payment section for the published Rectangle white stone Kara Bangle, confirming that the store can accept manual-payment orders.

The test checkout currently presents one available shipping method at **PKR 4,619** and estimated taxes of **PKR 360**. These are Shopify shipping and tax settings, not Netlify charges. Review these business settings before accepting customer orders if the amounts are not intentional.

## Shipping investigation in progress

The production checkout exposes a single Pakistan shipping method at PKR 4,619 before a city or postal code has been entered. This identifies the amount as the current Shopify delivery-zone/rate configuration rather than a charge introduced by Netlify or Cash on Delivery. The Shopify Shipping and delivery settings page has been opened for inspection; detailed rate controls are still loading in the connected browser.

After a refresh, Shopify showed one General profile covering all products, one fulfilment location, and two delivery zones. The General profile editor is now open for zone-level inspection.

The Domestic Pakistan zone contains a single flat `معیاری` (standard) rate of **PKR 4,619** with a displayed transit time of 3–5 business days. Shopify’s official guidance distinguishes merchant-set flat rates from carrier or app-calculated rates. Flat rates can be fixed or vary by order amount or product weight; carrier-calculated rates use order weight, dimensions, and destination, but Shopify currently limits third-party carrier-calculated shipping to Advanced, Plus, or eligible Grow plans with an additional fee. Sources: [Shopify: Setting up shipping zones and rates](https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/setting-up-shipping-rates) and [Shopify: Third-party carrier-calculated shipping](https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping).

## Approved Pakistan delivery-rate correction

The owner approved a **PKR 250 delivery charge across Pakistan**. The active Domestic-zone rate was identified as Shopify Delivery Method Definition `906517446870`; it was a flat PKR 4,619 rate. The Shopify `deliveryProfileUpdate` response confirms that the same active domestic method now has a flat price of **PKR 250.00**, with no update errors. The international rate, products, collection setup, and Cash on Delivery configuration were not changed.

The browser session could not reopen an expired synthetic checkout cart for a rendered-price screenshot. A fresh checkout refresh in the owner’s browser is still required to visually confirm the PKR 250 price after the customer has selected Pakistan and entered a delivery address.

The owner refreshed a live Shopify checkout and provided the rendered confirmation. The shipping method shows the updated PKR 250 charge alongside Cash on Delivery, which verifies that the corrected Pakistan rate is live. The remaining requested change is to rename this delivery method from its Urdu label to `Standard` without changing the PKR 250 amount.

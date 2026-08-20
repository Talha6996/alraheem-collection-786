# Netlify Launch Checklist

The source code now includes a Netlify Function at `netlify/functions/api.ts`, an API-first redirect configuration in `netlify.toml`, and a `build:netlify` command. The function reuses the exact existing Shopify commerce router. It does not load Manus OAuth, Manus storage proxy, or the Manus notification routes.

## Completed verification

The Netlify function contract, storefront Shopify regression tests, TypeScript check, standard production build, and Netlify-targeted production build all passed during preparation. Focused Netlify function tests exercised the public product-list and cart-create procedures through `/.netlify/functions/api/trpc`, verified the normalized Shopify checkout handoff, and confirmed that the WhatsApp direct-order URL remains unchanged. The locally running storefront was also visually verified on the homepage and the `BRANDED KARA` collection page, which continued to show its two Shopify products.

This validates the code package; it is not a live Netlify deployment. The owner must still create the Netlify project, create a fresh Shopify Storefront API token, upload the listed branded assets to owner-controlled storage, and enter the required environment variables before the external preview can be tested.

## What has not changed

| Customer function | Status after Netlify preparation |
| --- | --- |
| Shopify product catalogue and manual categories | Unchanged: the same `commerce` router and Shopify Storefront API query code are used. |
| Product details and PKR pricing | Unchanged. |
| Bag and Shopify cart creation | Unchanged. |
| Shopify checkout redirect | Unchanged. |
| WhatsApp ordering | Unchanged. |

## Netlify dashboard settings

After exporting the code to a **private GitHub repository**, create a Netlify project from that repository. Netlify will read the committed `netlify.toml` automatically.

Set these values in **Netlify → Project configuration → Environment variables** with the **Functions** scope. Do not add them to GitHub, `netlify.toml`, or browser code.

| Variable | Required | Value source |
| --- | --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Yes | Your existing Shopify `*.myshopify.com` domain. |
| `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN` | Yes | A new, least-privilege Shopify Storefront API token created specifically for Netlify. |
| `VITE_STOREFRONT_ASSET_BASE_URL` | Yes for an independent launch | A folder URL you control that holds the branded asset files listed below. |
| `NODE_VERSION` | Recommended | `22` to match this project’s Node runtime. |

## Move the branded files before DNS cutover

The Netlify build accepts `VITE_STOREFRONT_ASSET_BASE_URL` so branded static images no longer need `/manus-storage`. Upload the following files to **one folder you control** in Shopify Files, Cloudinary, Amazon S3, or another CDN, keeping their filenames exactly the same.

| Required filename |
| --- |
| `alraheem-collection-786-exact-logo_6b12493a.png` |
| `alraheem-hero-user-replacement_4761f1e6.png` |
| `jewellery_abfdc585.png` |
| `handbags_714f79f8.png` |
| `ladies-suit_cf9ceb22.png` |
| `mens-suit_9ade052d.png` |
| `branded-kara_9061c868.png` |
| `bridal-sets_50d4a6e8.png` |
| `mens-bracelet_00a6e202.png` |

For example, if the files are in `https://cdn.example.com/alraheem`, set `VITE_STOREFRONT_ASSET_BASE_URL` to that exact folder URL. The site will then request `https://cdn.example.com/alraheem/alraheem-collection-786-exact-logo_6b12493a.png` and the matching category files.

## Deploy in this order

1. Push the prepared code to the private GitHub repository.
2. Create a Netlify project and add the environment variables above.
3. Deploy the Netlify preview URL before changing your domain.
4. On the preview URL, verify the homepage, all seven category links, one product page, add-to-bag, checkout redirect, WhatsApp button, and a direct page URL such as `/shop?category=branded-kara`.
5. Verify the new external asset URLs load in browser developer tools and that no `/manus-storage/` image request remains.
6. Attach the custom domain in Netlify and update DNS only after the preview checks pass.

> The Shopify Storefront token must remain server-only. Never use a `VITE_` prefix for that token. Only `VITE_STOREFRONT_ASSET_BASE_URL` is public because browsers need it to load public image files.

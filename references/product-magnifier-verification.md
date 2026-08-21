# Product Magnifier Verification

**Date:** 21 August 2026

## Public-page check

The deployed Party Set product page at `https://alraheemcollection786.netlify.app/product/party-set` was opened at a laptop-sized viewport. Moving the cursor over the main Shopify image displayed a separate circular magnifier box. A second cursor position confirmed that the lens moved with the cursor and showed a different, enlarged portion of the jewellery image while the main product image stayed at its natural, unchanged size.

The final live check captured the lens in two clearly different locations: first above the necklace near the upper-left of the product image, then lower-right over the necklace detail. In both cases the full, unscaled product image remained visible behind the separate circular preview.

## Automated check

`client/src/components/ProductGallery.test.ts` runs in a browser-like environment and confirms that the lens starts absent, appears after mouse entry, updates left/top coordinates and background focus after mouse movement, preserves the unscaled main-image class, and disappears after mouse exit. The focused Vitest run passed with four tests, and `pnpm run build:netlify` completed successfully.

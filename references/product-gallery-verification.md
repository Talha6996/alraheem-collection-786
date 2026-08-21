# Product Gallery Verification

## Shopify source check

The active Shopify product **Party Set** (`party-set`) has three image media records. The Storefront product-detail query now requests up to 250 product images, so all customer-uploaded Shopify images are available to the website gallery.

## Development storefront check

The product page at `/product/party-set` loaded the Party Set gallery with the visible image counter **1 / 3**. The primary image uses contained framing instead of a cover crop, preserving the complete source image within the product frame. Thumbnail and next/previous controls remain available to show every uploaded image.

The desktop next-image control was selected successfully and advanced the counter from **1 / 3** to **2 / 3**, visibly replacing the primary photo with the second Shopify image. This confirms the gallery uses the full uploaded image array rather than only the first product photo.

# Storefront Performance Optimization Record

## Objective

Reduce first-view work and make return visits feel immediate without changing the Shopify catalogue, product pages, bag, WhatsApp ordering, or checkout behavior.

## Applied improvements

| Area | Change | Customer effect |
| --- | --- | --- |
| Catalogue network reads | Added a 60-second server-side cache keyed by listing and manual collection handle. | Repeated catalogue requests avoid an unnecessary Shopify round trip. |
| Repeat browsing | Saved the last successful product grid in browser storage for up to seven days and refresh it in the background. | A returning shopper sees the previous catalogue immediately instead of waiting for Shopify. |
| Initial homepage work | Deferred the promotional catalogue request and cart restoration until after the first render. | The hero and navigation become interactive sooner. |
| Product payloads | Reduced catalogue-card GraphQL reads to the fields the cards display. | Less Shopify response data is transferred and normalized. |
| JavaScript | Split every non-home route and deferred toast UI until idle time. | First-time homepage visitors download fewer scripts; secondary pages load only when opened. |
| Fonts and paint work | Added font preconnect links, moved font loading out of CSS imports, prioritized visible imagery, and applied content visibility to below-the-fold sections. | Faster first paint and less offscreen rendering work. |

## Measured validation

The production build’s initial JavaScript asset was reduced from **204.50 KB gzip** to **181.77 KB gzip**: a reduction of **22.73 KB (11.1%)**. Secondary pages now build as separate on-demand assets.

The complete test suite passed with **22 tests passed and 1 skipped**, and the production build completed successfully. Desktop and 375-pixel mobile visual checks confirmed that the home layout remains intact.

## Remaining external dependency

The first uncached Shopify catalogue response can still depend on Shopify network latency. The storefront now minimizes the visible impact through lightweight requests, background refreshes, server caching, and immediate browser restoration on repeat visits.

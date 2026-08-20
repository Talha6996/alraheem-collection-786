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

Further verification remains required for the seven category images, Shopify catalogue requests, bag flow, checkout hand-off, WhatsApp ordering link, and mobile rendering.

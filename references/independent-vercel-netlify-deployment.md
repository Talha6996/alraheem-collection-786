# Independent Vercel or Netlify Deployment Guide

## Recommendation

Choose **Vercel** for this project. The storefront already has a React/Vite frontend and an Express/tRPC backend, and Vercel supports Express as a serverless function. Netlify can also host it, but it requires wrapping the Express application in a Netlify Function and configuring explicit API redirects. Neither host can run the current project unchanged because the existing server entry point, authentication, analytics, and hosted static assets include Manus-specific services. [1] [2]

> **Important:** Do not copy any Manus-injected token, Forge key, OAuth key, or database credential into GitHub, Vercel, Netlify, or chat. Create replacement credentials that you own, then store them only as encrypted host environment variables.

## What remains linked to Shopify

The storefront can remain fully linked to Shopify after migration. Product titles, prices, product media, collections, inventory availability, Shopify cart creation, and Shopify checkout all continue through the Shopify Storefront API. WhatsApp ordering is browser-side and stays unchanged.

| Current responsibility | Independent replacement |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Your existing `alraheem786-9khraaqr-anchor-cedar-jcs11ees.myshopify.com` domain, stored as a server environment variable. |
| `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN` | Create a **new Custom App public Storefront API access token** for the external deployment with only product-listing, product-tag, and cart/checkout access. The paid Headless channel is not required. Store it only in the function/server environment. |
| `/api/trpc` commerce routes | Deploy as Vercel Functions or a Netlify Function, preserving the same relative `/api/trpc` path. |
| Shopify cart and checkout | Retain the existing Storefront API cart calls; no migration of customer carts is needed. |
| WhatsApp ordering | No Shopify or host change required. |

## Work required before deployment

The following changes are required to remove all Manus runtime dependency.

| Area | Required change |
| --- | --- |
| Express server | Split `server/_core/index.ts` into a reusable Express `app` export and a local-only `listen()` launcher. Serverless hosting invokes the exported app; it must not start its own persistent port listener. |
| tRPC | Keep the existing `/api/trpc` middleware inside that exported app. The frontend uses same-origin calls, so it needs no URL change when the API and frontend share the same host. |
| Static assets | Re-upload every `/manus-storage/...` image—logo, hero, and category images—to a non-Manus location you control, such as Shopify Files, Cloudinary, Amazon S3, or host-supported asset storage. Replace the URLs in the source code. |
| Storage proxy | Remove `registerStorageProxy()` and the `BUILT_IN_FORGE_API_*` environment variables after all `/manus-storage` assets have been migrated. |
| User login | The current OAuth route uses Manus OAuth. For a public Shopify storefront, it can be removed if no user sign-in is needed. If sign-in is retained, replace it with an independent provider such as Shopify Customer Accounts, Auth0, Clerk, or Firebase Authentication, and use a new session secret. |
| Database | Public product browsing, Shopify cart, checkout, and WhatsApp ordering do not require the current Manus user database. If the user-account feature remains, provision your own managed MySQL-compatible database and set a new `DATABASE_URL`. |
| Analytics and Vite plugins | Remove the Manus analytics snippet, `vite-plugin-manus-runtime`, the development debug collector, and all `VITE_*FORGE*`, `VITE_APP_ID`, and `OAUTH_SERVER_URL` references. |

## Preferred path: deploy on Vercel

### 1. Export the project to a private GitHub repository

Use the project’s GitHub export feature, then create a **private** repository. Do not commit `.env`, `.env.local`, database URLs, API tokens, or downloaded production configuration.

### 2. Make the app serverless-compatible

Create an application module that builds and exports the Express application, including the JSON parser and `/api/trpc` middleware, but does **not** call `listen()`. Create a Vercel API entry that default-exports that app. Vercel documents that Express can be deployed as a Vercel Function when the Express app is exported from a supported entry file. [2]

Keep the Vite frontend build output as `dist/public`. Configure the project’s build command as `pnpm build` and publish `dist/public`. Add SPA rewrites so a direct visit to `/shop` or `/product/<handle>` serves the React app rather than a host 404. Vercel documents this requirement for Vite SPAs. [1]

### 3. Add Vercel environment variables

In **Vercel → Project Settings → Environment Variables**, create fresh production and preview values as needed:

| Variable | Required | Notes |
| --- | --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Yes | The `*.myshopify.com` store domain, without secret data. |
| `SHOPIFY_STOREFRONT_API_ACCESS_TOKEN` | Yes | New token, server-only; never prefix it with `VITE_`. |
| `JWT_SECRET` | Only if external login remains | Generate a new random secret. |
| `DATABASE_URL` | Only if external user accounts remain | Points to your independently hosted database. |
| `NODE_ENV` | Yes | `production` for the production deployment. |

Vercel stores variables outside source code and scopes them to development, preview, and production deployments. A change applies to new deployments, so redeploy after updating values. [3]

### 4. Deploy and test before DNS cutover

Connect the GitHub repository in Vercel and deploy a preview first. Test the homepage, each collection link, a product page, add-to-bag, Shopify checkout redirect, WhatsApp order button, direct links to `/shop` and a product route, and mobile navigation. Only after all checks pass should you add your external custom domain and update its DNS records according to the host’s current domain instructions.

## Alternative path: deploy on Netlify

Netlify supports the same React/Vite frontend and can run the Express backend as a Netlify Function. The backend must be wrapped with `serverless-http`, then `/api/*` must be rewritten to that function. Netlify’s official Express guide provides this pattern. [4]

### Required Netlify configuration concept

Use a `netlify.toml` that builds the frontend to `dist/public`, declares the functions directory, routes `/api/*` to the Express function, and routes all other browser paths to `index.html`. The API rewrite must appear before the SPA rewrite.

```toml
[build]
  command = "pnpm build"
  publish = "dist/public"

[functions]
  directory = "netlify/functions"
  external_node_modules = ["express"]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Create the Shopify and optional login/database values in **Netlify → Project configuration → Environment variables**, not in `netlify.toml`. Netlify states that variables declared only in `netlify.toml` are not available to serverless functions at runtime; runtime variables must include the **Functions** scope. [5]

## Shopify checklist before going live

1. In Shopify Dev Dashboard, create a **Custom App** dedicated to the external host; never reuse a Manus-managed secret.
2. Request only `unauthenticated_read_product_listings`, `unauthenticated_read_product_tags`, `unauthenticated_read_checkouts`, and `unauthenticated_write_checkouts`, then generate a public Storefront token through `storefrontAccessTokenCreate`.
3. Add the external deployment domain in the relevant Shopify app settings if Shopify prompts for an allowed domain.
4. Keep all seven manual collections published to **Manus** while the current site remains live. The Custom App token accesses the same published product and collection data; a paid Headless storefront publication is not needed.
5. Test a real cart and checkout with a low-risk product before announcing the new domain.

## Safe cutover sequence

1. Keep the Manus site active while preparing the Vercel or Netlify preview.
2. Test the preview end-to-end with the fresh Shopify token and independently hosted assets.
3. Attach the custom domain to the external host and verify HTTPS, direct routes, and mobile behavior.
4. Change DNS only after the external deployment works correctly.
5. Retain the Manus checkpoint until the external site has operated correctly for several days, then remove any obsolete tokens from the external project or Shopify app.

## References

[1] [Vercel: Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)

[2] [Vercel: Express on Vercel](https://vercel.com/docs/frameworks/backend/express)

[3] [Vercel: Environment Variables](https://vercel.com/docs/environment-variables)

[4] [Netlify: Express on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/express/)

[5] [Netlify: Environment Variables and Serverless Functions](https://docs.netlify.com/build/functions/environment-variables/)

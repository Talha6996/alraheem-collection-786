# External Hosting Research — Vercel and Netlify

## Official Vercel guidance

Vercel identifies Vite as a frontend build system. A Vite single-page app needs a rewrite to `index.html` for deep links such as `/shop` and `/product/:handle` to work. Vercel Functions can provide backend endpoints, and Vercel specifically documents Express applications as running in a Vercel Function when the app is exported from a supported entry file.

Vercel environment variables are configured outside source control, scoped by production, preview, and development environments, and are available during function execution. They must be added again in Vercel; existing Manus-injected values do not transfer automatically.

Sources:

- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/frameworks/backend/express
- https://vercel.com/docs/environment-variables

## Official Netlify guidance

Netlify detects Vite projects and normally uses the Vite build command with `dist` as the published folder. It also documents a Vite plugin for local emulation of Netlify serverless functions, redirects, environment variables, and other platform features. A Vite SPA needs a rewrite rule that serves `index.html` for browser routes, otherwise direct visits to paths such as `/shop` return 404.

Source:

- https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/

Netlify also documents deploying an Express application as a Netlify Function by wrapping it with `serverless-http` and routing `/api/*` to the function. Runtime secrets must be created in the Netlify user interface, CLI, or API with the **Functions** scope; variables placed only in `netlify.toml` are not available to functions at runtime.

Sources:

- https://docs.netlify.com/build/frameworks/framework-setup-guides/express/
- https://docs.netlify.com/build/functions/environment-variables/
- https://docs.netlify.com/build/environment-variables/get-started/

## Implication for ALRAHEEM COLLECTION 786

The storefront is not a static-only Vite site. It has an Express and tRPC server, Shopify Storefront API credentials that must stay server-side, optional MySQL/Drizzle dependencies, Manus OAuth endpoints, a Manus storage proxy, and Manus-specific runtime plugins. An independent deployment must replace or remove those Manus-specific pieces and deploy the frontend together with equivalent server functions or a Node server.

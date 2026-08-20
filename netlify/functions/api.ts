import type { Handler } from "@netlify/functions";
import serverless from "serverless-http";
import { createNetlifyStorefrontApp } from "../../server/_core/storefrontApp";

// This function exposes the unchanged public commerce contract at `/api/trpc`.
// Shopify credentials stay server-side in Netlify environment variables.
export const handler: Handler = serverless(createNetlifyStorefrontApp());

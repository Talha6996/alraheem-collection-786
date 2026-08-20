/**
 * Netlify's redirect layer can omit batched tRPC query parameters when it
 * rewrites `/api/trpc/*`. Netlify builds therefore use the deployed function
 * endpoint directly, while local and Manus builds retain the existing API URL.
 */
export function getStorefrontTrpcEndpoint(isNetlifyBuild: boolean) {
  return isNetlifyBuild
    ? "/.netlify/functions/api/trpc"
    : "/api/trpc";
}

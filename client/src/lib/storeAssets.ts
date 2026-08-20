const MANUS_ASSET_PREFIX = "/manus-storage/";

function configuredAssetBase() {
  const value = import.meta.env.VITE_STOREFRONT_ASSET_BASE_URL?.trim();
  return value ? value.replace(/\/+$/, "") : null;
}

/**
 * Uses the existing asset during local preview. On Netlify, set
 * VITE_STOREFRONT_ASSET_BASE_URL to a folder you control containing the same
 * named brand files, such as Shopify Files or a CDN.
 */
export function storefrontAsset(path: string) {
  const base = configuredAssetBase();
  if (!base || !path.startsWith(MANUS_ASSET_PREFIX)) return path;
  return `${base}/${path.slice(MANUS_ASSET_PREFIX.length)}`;
}

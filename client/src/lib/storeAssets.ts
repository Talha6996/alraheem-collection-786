const MANUS_ASSET_PREFIX = "/manus-storage/";

/** Public logo delivery URL used by the independent Netlify storefront. */
export const STOREFRONT_LOGO = "https://res.cloudinary.com/olyxyinv/image/upload/v1787239168/alraheem-collection-786-exact-logo_6b12493a.png";

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

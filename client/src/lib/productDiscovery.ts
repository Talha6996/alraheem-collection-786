import type { Product } from "@shared/commerce/types";

export function getRecentlyViewedProducts(catalogue: Product[], viewedHandles: string[], currentHandle: string) {
  return viewedHandles
    .filter(handle => handle !== currentHandle)
    .map(handle => catalogue.find(item => item.handle === handle))
    .filter((item): item is Product => Boolean(item))
    .slice(0, 4);
}

export function getRelatedProducts(catalogue: Product[], currentProduct: Product) {
  return catalogue
    .filter(item => item.handle !== currentProduct.handle)
    .filter(item => item.productType === currentProduct.productType || item.tags.some(tag => currentProduct.tags.includes(tag)))
    .slice(0, 4);
}

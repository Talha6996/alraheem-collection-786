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

export function getPersonalizedProducts(catalogue: Product[], viewedHandles: string[], currentHandle: string) {
  const viewed = catalogue.filter(item => viewedHandles.includes(item.handle) && item.handle !== currentHandle);
  if (!viewed.length) return [];
  const types = new Set(viewed.map(item => item.productType).filter(Boolean));
  const tags = new Set(viewed.flatMap(item => item.tags));
  return catalogue
    .filter(item => item.handle !== currentHandle && !viewedHandles.includes(item.handle))
    .map(item => ({ item, score: (types.has(item.productType) ? 3 : 0) + item.tags.filter(tag => tags.has(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, 4)
    .map(({ item }) => item);
}

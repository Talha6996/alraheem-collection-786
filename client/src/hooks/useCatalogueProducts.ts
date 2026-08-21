import type { Product } from "@shared/commerce/types";
import { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";

type CatalogueInput = { first: number; collectionHandle?: string; sort?: "NEWEST" | "TITLE" };
type StoredCatalogue = { savedAt: number; products: Product[] };

const CACHE_PREFIX = "alraheem:catalogue:v1:";
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function storageKey(input: CatalogueInput) {
  return `${CACHE_PREFIX}${input.collectionHandle ?? "all"}:${input.sort ?? "TITLE"}:${input.first}`;
}

function readCachedCatalogue(input: CatalogueInput): StoredCatalogue | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(storageKey(input));
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredCatalogue;
    if (!Array.isArray(parsed.products) || !Number.isFinite(parsed.savedAt) || Date.now() - parsed.savedAt > MAX_CACHE_AGE_MS) {
      window.localStorage.removeItem(storageKey(input));
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function writeCachedCatalogue(input: CatalogueInput, products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(input), JSON.stringify({ savedAt: Date.now(), products }));
  } catch {
    // Storage can be unavailable in private mode; the live query still works.
  }
}

/**
 * Displays the last successful product grid immediately on a repeat visit,
 * while React Query refreshes it in the background when the data is stale.
 */
export function useCatalogueProducts(input: CatalogueInput, options?: { enabled?: boolean }) {
  const stableInput = useMemo(
    () => ({ first: input.first, ...(input.collectionHandle ? { collectionHandle: input.collectionHandle } : {}), ...(input.sort ? { sort: input.sort } : {}) }),
    [input.collectionHandle, input.first, input.sort]
  );
  const cached = useMemo(() => readCachedCatalogue(stableInput), [stableInput]);
  const query = trpc.commerce.products.list.useQuery(stableInput, {
    enabled: options?.enabled,
    initialData: cached?.products,
    initialDataUpdatedAt: cached?.savedAt,
  });

  useEffect(() => {
    if (query.data) writeCachedCatalogue(stableInput, query.data);
  }, [query.data, stableInput]);

  return query;
}

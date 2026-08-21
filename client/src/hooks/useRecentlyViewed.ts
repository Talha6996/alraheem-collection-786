import { useEffect, useState } from "react";
import type { Product } from "@shared/commerce/types";

export const RECENTLY_VIEWED_KEY = "alraheem:recently-viewed";
const RECENTLY_VIEWED_UPDATED_EVENT = "alraheem:recently-viewed-updated";
const MAX_RECENT_ITEMS = 8;

function readRecentHandles(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((handle): handle is string => typeof handle === "string") : [];
  } catch {
    return [];
  }
}

/** Browser-local product history; it never sends browsing history to the store. */
export function useRecentlyViewed(product: Product | undefined) {
  const [handles, setHandles] = useState<string[]>(readRecentHandles);

  useEffect(() => {
    const sync = () => setHandles(readRecentHandles());
    window.addEventListener("storage", sync);
    window.addEventListener(RECENTLY_VIEWED_UPDATED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(RECENTLY_VIEWED_UPDATED_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (!product?.handle) return;
    const next = [product.handle, ...readRecentHandles().filter(handle => handle !== product.handle)].slice(0, MAX_RECENT_ITEMS);
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    setHandles(next);
    window.dispatchEvent(new Event(RECENTLY_VIEWED_UPDATED_EVENT));
  }, [product?.handle]);

  return handles;
}

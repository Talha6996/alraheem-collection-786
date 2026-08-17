import { useCallback, useEffect, useMemo, useState } from "react";

const WISHLIST_KEY = "alraheem:wishlist";
const WISHLIST_EVENT = "alraheem:wishlist-updated";

function readWishlist(): string[] {
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [handles, setHandles] = useState<string[]>(() => (typeof window === "undefined" ? [] : readWishlist()));

  useEffect(() => {
    const sync = () => setHandles(readWishlist());
    window.addEventListener("storage", sync);
    window.addEventListener(WISHLIST_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(WISHLIST_EVENT, sync);
    };
  }, []);

  const toggle = useCallback((handle: string) => {
    setHandles(current => {
      const next = current.includes(handle) ? current.filter(item => item !== handle) : [...current, handle];
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(WISHLIST_EVENT));
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      handles,
      count: handles.length,
      isSaved: (handle: string) => handles.includes(handle),
      toggle,
    }),
    [handles, toggle]
  );
}

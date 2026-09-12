import { describe, expect, it, vi } from "vitest";
import { enableManualScrollRestoration, resetScrollPosition } from "./scrollRestoration";

describe("scroll restoration", () => {
  it("resets the document to the top after navigation", () => {
    const scrollTo = vi.fn();

    resetScrollPosition({ scrollTo });

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  it("prevents browser history from restoring the previous footer position", () => {
    const history = { scrollRestoration: "auto" as ScrollRestoration };

    const restore = enableManualScrollRestoration({ history });

    expect(history.scrollRestoration).toBe("manual");
    restore();
    expect(history.scrollRestoration).toBe("auto");
  });
});

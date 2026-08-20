import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useCatalogueProducts", () => ({
  useCatalogueProducts: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/components/HomePromoBanner", () => ({
  default: () => null,
}));

vi.mock("wouter", async () => {
  const React = await import("react");

  return {
    Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      React.createElement("a", props, children),
  };
});

import Home from "./Home";

describe("Home", () => {
  it("uses the user-supplied hero image while retaining category and editorial paths", () => {
    const markup = renderToStaticMarkup(createElement(Home));

    expect(markup).not.toContain("Current");
    expect(markup).not.toContain("favourites");
    expect(markup).toContain("/manus-storage/alraheem-hero-user-replacement_4761f1e6.png");
    expect(markup).toContain('alt="ALRAHEEM COLLECTION 786 fashion collection"');
    expect(markup).toContain("Find your");
    expect(markup).toContain("For the moment");
    expect(markup).toContain('decoding="async"');
    expect(markup).toContain('loading="lazy"');
  });
});

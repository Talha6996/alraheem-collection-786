import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useCatalogueProducts", () => ({
  useCatalogueProducts: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/components/HomePromoBanner", () => ({
  default: () => null,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    commerce: {
      collections: {
        list: {
          useQuery: () => ({ data: [] }),
        },
      },
    },
  },
}));

vi.mock("wouter", async () => {
  const React = await import("react");

  return {
    Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      React.createElement("a", props, children),
  };
});

import Home, { isJewellerySubcategory } from "./Home";

describe("Home", () => {
  it("keeps 1 CARAT JEWELLERY SETS inside the Jewellery chooser", () => {
    expect(isJewellerySubcategory({ name: "1 CARAT JEWELLERY SETS", productType: "1-carat-jewellery-sets" })).toBe(true);
    expect(isJewellerySubcategory({ name: "1 CARAT JEWLLERY SETS", productType: "1-carat-jewellery-sets" })).toBe(true);
  });

  it("uses the user-supplied hero image while retaining category and editorial paths", () => {
    const markup = renderToStaticMarkup(createElement(Home));

    expect(markup).not.toContain("Current");
    expect(markup).not.toContain("favourites");
    expect(markup).toContain("https://i.postimg.cc/8PnT2J4P/bli.jpg");
    expect(markup).toContain('alt="ALRAHEEM COLLECTION 786 fashion collection"');
    expect(markup).toContain("Find your");
    expect(markup).toContain("For the moment");
    expect(markup).toContain('decoding="async"');
    expect(markup).toContain('loading="lazy"');
  });
});

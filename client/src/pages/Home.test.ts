import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    commerce: {
      products: {
        list: {
          useQuery: () => ({ data: [], isLoading: false }),
        },
      },
    },
  },
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
  it("omits the removed Current favourites section while retaining category and editorial paths", () => {
    const markup = renderToStaticMarkup(createElement(Home));

    expect(markup).not.toContain("Current");
    expect(markup).not.toContain("favourites");
    expect(markup).toContain("Find your");
    expect(markup).toContain("For the moment");
  });
});

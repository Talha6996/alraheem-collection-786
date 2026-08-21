import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import ProductGallery from "./ProductGallery";

const galleryImages = [
  { url: "https://cdn.example.com/product-front.jpg", altText: "Front view" },
  { url: "https://cdn.example.com/product-side.jpg", altText: "Side view" },
  { url: "https://cdn.example.com/product-detail.jpg", altText: "Detail view" },
];

describe("ProductGallery", () => {
  it("renders every supplied product image as an accessible gallery choice without cropping the primary image", () => {
    const markup = renderToStaticMarkup(
      createElement(ProductGallery, {
        images: galleryImages,
        productHandle: "gallery-piece",
        productTitle: "Gallery Piece",
      })
    );

    for (const image of galleryImages) {
      expect(markup).toContain(image.url);
    }
    expect(markup).toContain('aria-label="View image 3 of 3"');
    expect(markup).toContain('aria-label="View next product image"');
    expect(markup).toContain("product-gallery-main-image");
    expect(markup).toContain("object-contain");
    expect(markup).not.toContain("object-cover");
  });

  it("provides a clear fallback when Shopify has no product images", () => {
    const markup = renderToStaticMarkup(
      createElement(ProductGallery, {
        images: [],
        productHandle: "image-pending",
        productTitle: "Image Pending",
      })
    );

    expect(markup).toContain("Product photos coming soon");
  });

  it("provides a separate magnifying lens on laptop and desktop fine-pointer devices", () => {
    const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    const componentSource = readFileSync(resolve(process.cwd(), "client/src/components/ProductGallery.tsx"), "utf8");

    expect(styles).toContain("@media (min-width: 1024px) and (hover: hover) and (pointer: fine)");
    expect(styles).toContain(".product-gallery-magnifier");
    expect(styles).toContain("background-size: 250%");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(componentSource).toContain("onMouseMove={updateMagnifier}");
    expect(componentSource).toContain('className="product-gallery-magnifier"');
    expect(componentSource).not.toContain("is-zoomed");
  });
});

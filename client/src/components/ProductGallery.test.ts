import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
});

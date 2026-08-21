// @vitest-environment jsdom

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProductGallery from "./ProductGallery";

afterEach(cleanup);

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
    expect(markup).toContain('aria-label="View next product media"');
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
    expect(componentSource).toContain("onMouseMove={fullScreen ? undefined : updateMagnifier}");
    expect(componentSource).toContain('className="product-gallery-magnifier"');
    expect(componentSource).not.toContain("is-zoomed");
  });

  it("mounts, moves, and removes the magnifier in response to real mouse interaction", () => {
    const { container, getByAltText } = render(
      createElement(ProductGallery, {
        images: galleryImages,
        productHandle: "interactive-gallery-piece",
        productTitle: "Interactive Gallery Piece",
      })
    );
    const mainImage = getByAltText("Front view");
    const galleryFrame = mainImage.parentElement;
    const bounds = {
      bottom: 650,
      height: 600,
      left: 100,
      right: 700,
      top: 50,
      width: 600,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    } as DOMRect;

    expect(galleryFrame).not.toBeNull();
    vi.spyOn(mainImage, "getBoundingClientRect").mockReturnValue(bounds);
    vi.spyOn(galleryFrame!, "getBoundingClientRect").mockReturnValue(bounds);
    expect(container.querySelector(".product-gallery-magnifier")).toBeNull();

    fireEvent.mouseEnter(mainImage, { clientX: 280, clientY: 260 });
    const firstLens = container.querySelector<HTMLElement>(".product-gallery-magnifier");
    expect(firstLens).not.toBeNull();
    expect(firstLens?.style.left).toBe("198px");
    expect(firstLens?.style.top).toBe("122px");
    expect(firstLens?.style.backgroundPosition).toBe("30% 35%");
    expect(firstLens?.style.backgroundImage).toContain("product-front.jpg");

    fireEvent.mouseMove(mainImage, { clientX: 520, clientY: 350 });
    const movedLens = container.querySelector<HTMLElement>(".product-gallery-magnifier");
    expect(movedLens?.style.left).toBe("226px");
    expect(movedLens?.style.top).toBe("212px");
    expect(movedLens?.style.backgroundPosition).toBe("70% 50%");
    expect(mainImage.className).toContain("product-gallery-main-image");
    expect(mainImage.className).not.toContain("is-zoomed");

    fireEvent.mouseLeave(mainImage);
    expect(container.querySelector(".product-gallery-magnifier")).toBeNull();
  });

  it("opens a full-screen viewer and renders Shopify-hosted product videos alongside images", () => {
    const { getAllByLabelText, getAllByRole, getByRole, getByLabelText } = render(
      createElement(ProductGallery, {
        images: galleryImages,
        media: [
          { type: "image", image: galleryImages[0] },
          { type: "video", altText: "Jewellery movement video", previewImage: galleryImages[1], sources: [{ url: "https://cdn.example.com/piece.mp4", mimeType: "video/mp4" }] },
        ],
        productHandle: "media-piece",
        productTitle: "Media Piece",
      })
    );

    expect(getByLabelText("View video 2 of 2")).toBeTruthy();
    fireEvent.click(getByRole("button", { name: "View product media full screen" }));
    expect(getByRole("dialog", { name: "Media Piece full screen media" })).toBeTruthy();
    fireEvent.click(getAllByRole("button", { name: "View next product media" }).at(-1)!);
    expect(getAllByLabelText("Jewellery movement video").at(-1)?.tagName).toBe("VIDEO");
  });

  it("changes full-screen media after a deliberate touch swipe", () => {
    const { getByRole, getByLabelText } = render(createElement(ProductGallery, { images: galleryImages, productHandle: "swipe-piece", productTitle: "Swipe Piece" }));
    fireEvent.click(getByRole("button", { name: "View product media full screen" }));
    const dialog = getByRole("dialog", { name: "Swipe Piece full screen media" });
    fireEvent.touchStart(dialog, { touches: [{ clientX: 240 }] });
    fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 120 }] });
    expect(getByLabelText("View image 2 of 3").getAttribute("aria-current")).toBe("true");
  });
});

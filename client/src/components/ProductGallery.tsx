import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Image } from "@shared/commerce/types";

type ProductGalleryProps = {
  images: Image[];
  productHandle: string;
  productTitle: string;
};

type LensPosition = {
  left: number;
  top: number;
  backgroundX: number;
  backgroundY: number;
};

const LENS_SIZE = 176;
const LENS_GAP = 18;

export default function ProductGallery({ images, productHandle, productTitle }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lensPosition, setLensPosition] = useState<LensPosition | null>(null);
  const imageCount = images.length;
  const activeImage = images[activeImageIndex] ?? null;

  useEffect(() => {
    setActiveImageIndex(0);
    setLensPosition(null);
  }, [productHandle]);

  useEffect(() => {
    setActiveImageIndex(currentIndex => Math.min(currentIndex, Math.max(imageCount - 1, 0)));
  }, [imageCount]);

  if (!activeImage) {
    return (
      <div className="grid aspect-[4/5] place-items-center bg-[#eee8dd] p-8 text-center text-[#58708a]">
        <div>
          <ImageIcon className="mx-auto mb-3" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-[.13em]">Product photos coming soon</p>
        </div>
      </div>
    );
  }

  const goToPreviousImage = () => {
    setActiveImageIndex(currentIndex => (currentIndex - 1 + imageCount) % imageCount);
  };

  const goToNextImage = () => {
    setActiveImageIndex(currentIndex => (currentIndex + 1) % imageCount);
  };

  const updateMagnifier = (event: React.MouseEvent<HTMLImageElement>) => {
    const { currentTarget } = event;
    const galleryFrame = currentTarget.parentElement;

    if (!galleryFrame) return;

    const imageBounds = currentTarget.getBoundingClientRect();
    const frameBounds = galleryFrame.getBoundingClientRect();
    const horizontalPosition = Math.min(100, Math.max(0, ((event.clientX - imageBounds.left) / imageBounds.width) * 100));
    const verticalPosition = Math.min(100, Math.max(0, ((event.clientY - imageBounds.top) / imageBounds.height) * 100));
    const frameX = event.clientX - frameBounds.left;
    const frameY = event.clientY - frameBounds.top;
    const preferredLeft = frameX + LENS_GAP;
    const left = preferredLeft + LENS_SIZE <= frameBounds.width
      ? preferredLeft
      : Math.max(0, frameX - LENS_SIZE - LENS_GAP);
    const top = Math.min(Math.max(0, frameY - LENS_SIZE / 2), Math.max(0, frameBounds.height - LENS_SIZE));

    setLensPosition({
      left,
      top,
      backgroundX: horizontalPosition,
      backgroundY: verticalPosition,
    });
  };

  const clearMagnifier = () => setLensPosition(null);

  return (
    <section aria-label={`${productTitle} image gallery`} className="space-y-3">
      <div className="group relative grid aspect-[4/5] place-items-center overflow-hidden bg-[#eee8dd] p-2 sm:p-4">
        <img
          className="product-gallery-main-image h-full w-full object-contain"
          src={activeImage.url}
          alt={activeImage.altText || `${productTitle} — image ${activeImageIndex + 1}`}
          fetchPriority="high"
          decoding="async"
          onMouseEnter={updateMagnifier}
          onMouseMove={updateMagnifier}
          onMouseLeave={clearMagnifier}
        />
        {lensPosition ? (
          <div
            className="product-gallery-magnifier"
            aria-hidden="true"
            style={{
              left: lensPosition.left,
              top: lensPosition.top,
              backgroundImage: `url(${activeImage.url})`,
              backgroundPosition: `${lensPosition.backgroundX}% ${lensPosition.backgroundY}%`,
            }}
          />
        ) : null}
        {imageCount > 1 ? (
          <>
            <button
              type="button"
              aria-label="View previous product image"
              className="absolute left-3 grid size-10 place-items-center rounded-full border border-[#d8d0c2] bg-[#fffdf9e6] text-[#123f72] opacity-100 shadow-sm transition hover:bg-[#fffdf9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123f72] sm:opacity-0 sm:group-hover:opacity-100"
              onClick={goToPreviousImage}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="View next product image"
              className="absolute right-3 grid size-10 place-items-center rounded-full border border-[#d8d0c2] bg-[#fffdf9e6] text-[#123f72] opacity-100 shadow-sm transition hover:bg-[#fffdf9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123f72] sm:opacity-0 sm:group-hover:opacity-100"
              onClick={goToNextImage}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#123f72e6] px-2.5 py-1 text-[10px] font-bold tracking-[.12em] text-white">
              {activeImageIndex + 1} / {imageCount}
            </p>
          </>
        ) : null}
      </div>

      {imageCount > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Choose a product image">
          {images.map((image, imageIndex) => {
            const isActive = imageIndex === activeImageIndex;
            return (
              <button
                key={`${image.url}-${imageIndex}`}
                type="button"
                aria-label={`View image ${imageIndex + 1} of ${imageCount}`}
                aria-current={isActive ? "true" : undefined}
                className={`shrink-0 border-2 bg-[#eee8dd] p-0.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123f72] ${
                  isActive ? "border-[#123f72]" : "border-transparent hover:border-[#bb492d]"
                }`}
                onClick={() => setActiveImageIndex(imageIndex)}
              >
                <img
                  src={image.url}
                  alt=""
                  className="size-16 object-contain sm:size-20"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

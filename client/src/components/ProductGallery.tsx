import { ChevronLeft, ChevronRight, Expand, ImageIcon, Play, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Image, ProductMedia } from "@shared/commerce/types";

type ProductGalleryProps = {
  images: Image[];
  media?: ProductMedia[];
  productHandle: string;
  productTitle: string;
};

type VideoEntry = Extract<ProductMedia, { type: "video" }>;
type GalleryEntry = { type: "image"; image: Image } | VideoEntry;
type LensPosition = { left: number; top: number; backgroundX: number; backgroundY: number };

const LENS_SIZE = 176;
const LENS_GAP = 18;
const SWIPE_THRESHOLD = 42;

function mediaEntries(images: Image[], media: ProductMedia[] = []): GalleryEntry[] {
  const normalized = media.filter((entry): entry is GalleryEntry => entry.type === "image" || entry.type === "video");
  return normalized.length ? normalized : images.map(image => ({ type: "image", image }));
}

function entryLabel(entry: GalleryEntry, productTitle: string, index: number) {
  return entry.type === "image"
    ? entry.image.altText || `${productTitle} — image ${index + 1}`
    : entry.altText || `${productTitle} — product video ${index + 1}`;
}

function VideoPlayer({ entry, title, fullScreen = false }: { entry: VideoEntry; title: string; fullScreen?: boolean }) {
  return (
    <video className={fullScreen ? "max-h-[82vh] max-w-full" : "h-full w-full object-contain"} controls playsInline poster={entry.previewImage?.url} aria-label={title}>
      {entry.sources.map(source => <source key={source.url} src={source.url} type={source.mimeType ?? undefined} />)}
      Your browser does not support embedded product videos.
    </video>
  );
}

export default function ProductGallery({ images, media, productHandle, productTitle }: ProductGalleryProps) {
  const entries = useMemo(() => mediaEntries(images, media), [images, media]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lensPosition, setLensPosition] = useState<LensPosition | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const entryCount = entries.length;
  const activeEntry = entries[activeIndex] ?? null;

  useEffect(() => {
    setActiveIndex(0);
    setLensPosition(null);
    setLightboxOpen(false);
  }, [productHandle]);

  useEffect(() => setActiveIndex(current => Math.min(current, Math.max(entryCount - 1, 0))), [entryCount]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [lightboxOpen]);

  if (!activeEntry) {
    return <div className="grid aspect-[4/5] place-items-center bg-[#eee8dd] p-8 text-center text-[#58708a]"><div><ImageIcon className="mx-auto mb-3" aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[.13em]">Product photos coming soon</p></div></div>;
  }

  const goToPrevious = () => setActiveIndex(current => (current - 1 + entryCount) % entryCount);
  const goToNext = () => setActiveIndex(current => (current + 1) % entryCount);
  const updateMagnifier = (event: React.MouseEvent<HTMLImageElement>) => {
    const galleryFrame = event.currentTarget.parentElement;
    if (!galleryFrame) return;
    const imageBounds = event.currentTarget.getBoundingClientRect();
    const frameBounds = galleryFrame.getBoundingClientRect();
    const backgroundX = Math.min(100, Math.max(0, ((event.clientX - imageBounds.left) / imageBounds.width) * 100));
    const backgroundY = Math.min(100, Math.max(0, ((event.clientY - imageBounds.top) / imageBounds.height) * 100));
    const frameX = event.clientX - frameBounds.left;
    const frameY = event.clientY - frameBounds.top;
    const preferredLeft = frameX + LENS_GAP;
    setLensPosition({
      left: preferredLeft + LENS_SIZE <= frameBounds.width ? preferredLeft : Math.max(0, frameX - LENS_SIZE - LENS_GAP),
      top: Math.min(Math.max(0, frameY - LENS_SIZE / 2), Math.max(0, frameBounds.height - LENS_SIZE)),
      backgroundX,
      backgroundY,
    });
  };

  const handleTouchStart = (event: React.TouchEvent) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start === null || end === undefined || Math.abs(start - end) < SWIPE_THRESHOLD || entryCount < 2) return;
    start > end ? goToNext() : goToPrevious();
  };

  const renderActiveMedia = (fullScreen = false) => activeEntry.type === "image" ? (
    <img
      className={fullScreen ? "max-h-[82vh] max-w-full object-contain" : "product-gallery-main-image h-full w-full object-contain"}
      src={activeEntry.image.url}
      alt={entryLabel(activeEntry, productTitle, activeIndex)}
      fetchPriority="high"
      decoding="async"
      onMouseEnter={fullScreen ? undefined : updateMagnifier}
      onMouseMove={fullScreen ? undefined : updateMagnifier}
      onMouseLeave={fullScreen ? undefined : () => setLensPosition(null)}
    />
  ) : <VideoPlayer entry={activeEntry} title={entryLabel(activeEntry, productTitle, activeIndex)} fullScreen={fullScreen} />;

  return (
    <section aria-label={`${productTitle} media gallery`} className="space-y-3">
      <div className="group relative grid aspect-[4/5] place-items-center overflow-hidden bg-[#eee8dd] p-2 sm:p-4" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {renderActiveMedia()}
        {lensPosition && activeEntry.type === "image" ? <div className="product-gallery-magnifier" aria-hidden="true" style={{ left: lensPosition.left, top: lensPosition.top, backgroundImage: `url(${activeEntry.image.url})`, backgroundPosition: `${lensPosition.backgroundX}% ${lensPosition.backgroundY}%` }} /> : null}
        <button type="button" aria-label="View product media full screen" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-[#d8d0c2] bg-[#fffdf9e6] text-[#123f72] shadow-sm transition hover:bg-[#fffdf9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123f72]" onClick={() => setLightboxOpen(true)}><Expand size={17} aria-hidden="true" /></button>
        {entryCount > 1 ? <><button type="button" aria-label="View previous product media" className="absolute left-3 grid size-10 place-items-center rounded-full border border-[#d8d0c2] bg-[#fffdf9e6] text-[#123f72] opacity-100 shadow-sm transition hover:bg-[#fffdf9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123f72] sm:opacity-0 sm:group-hover:opacity-100" onClick={goToPrevious}><ChevronLeft size={18} aria-hidden="true" /></button><button type="button" aria-label="View next product media" className="absolute right-3 grid size-10 place-items-center rounded-full border border-[#d8d0c2] bg-[#fffdf9e6] text-[#123f72] opacity-100 shadow-sm transition hover:bg-[#fffdf9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123f72] sm:opacity-0 sm:group-hover:opacity-100" onClick={goToNext}><ChevronRight size={18} aria-hidden="true" /></button><p className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#123f72e6] px-2.5 py-1 text-[10px] font-bold tracking-[.12em] text-white">{activeIndex + 1} / {entryCount}</p></> : null}
      </div>
      {entryCount > 1 ? <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Choose product media">{entries.map((entry, index) => <button key={`${entry.type}-${index}-${entry.type === "image" ? entry.image.url : entry.sources[0]?.url}`} type="button" aria-label={`View ${entry.type} ${index + 1} of ${entryCount}`} aria-current={activeIndex === index ? "true" : undefined} className={`relative shrink-0 border-2 bg-[#eee8dd] p-0.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123f72] ${activeIndex === index ? "border-[#123f72]" : "border-transparent hover:border-[#bb492d]"}`} onClick={() => setActiveIndex(index)}>{entry.type === "image" ? <img src={entry.image.url} alt="" className="size-16 object-contain sm:size-20" loading="lazy" decoding="async" /> : <><img src={entry.previewImage?.url ?? images[0]?.url ?? ""} alt="" className="size-16 object-contain sm:size-20" loading="lazy" decoding="async" /><span className="absolute inset-0 grid place-items-center bg-[#123f72]/40 text-white"><Play size={20} fill="currentColor" /></span></>}</button>)}</div> : null}
      {lightboxOpen ? <div className="fixed inset-0 z-[70] grid place-items-center bg-[#071d36]/95 p-4" role="dialog" aria-modal="true" aria-label={`${productTitle} full screen media`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}><button type="button" aria-label="Close full screen media" className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20" onClick={() => setLightboxOpen(false)}><X size={21} /></button><div className="grid max-h-full max-w-full place-items-center">{renderActiveMedia(true)}</div>{entryCount > 1 ? <><button type="button" aria-label="View previous product media" className="absolute left-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={goToPrevious}><ChevronLeft size={22} /></button><button type="button" aria-label="View next product media" className="absolute right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={goToNext}><ChevronRight size={22} /></button><p className="absolute bottom-5 text-xs font-bold tracking-[.14em] text-white">{activeIndex + 1} / {entryCount} · Swipe to browse</p></> : null}</div> : null}
    </section>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';

type GalleryImage = {
  url: string;
  alt_text?: string | null;
  is_primary?: boolean | null;
};

/**
 * Swipeable product gallery — mobile-friendly, works with mouse drag too.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const list = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDelta = useRef(0);

  const go = useCallback(
    (dir: number) => {
      if (list.length <= 1) return;
      setIndex((i) => (i + dir + list.length) % list.length);
    },
    [list.length]
  );

  if (list.length === 0) {
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-sm">
        <span className="text-surface-400">No image</span>
      </div>
    );
  }

  const current = list[index];

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square touch-pan-y overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-sm ring-1 ring-black/5"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          touchDelta.current = 0;
        }}
        onTouchMove={(e) => {
          if (touchStartX.current == null) return;
          touchDelta.current = e.touches[0].clientX - touchStartX.current;
        }}
        onTouchEnd={() => {
          if (Math.abs(touchDelta.current) > 40) {
            go(touchDelta.current < 0 ? 1 : -1);
          }
          touchStartX.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.url}
          src={current.url}
          alt={current.alt_text || productName}
          className="h-full w-full object-contain p-6 sm:p-10 select-none"
          draggable={false}
        />

        {list.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Image ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition ${
                    i === index ? 'w-5 bg-brand-500' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
              {index + 1} / {list.length}
            </span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {list.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${
                i === index
                  ? 'border-brand-500 ring-2 ring-brand-500/30'
                  : 'border-surface-200 opacity-80 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

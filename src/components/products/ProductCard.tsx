import Link from 'next/link';
import Image from 'next/image';
import { formatNaira, slugify } from '@/lib/utils';
import type { Product } from '@/types';

function dealUrlFor(product: Product): string {
  const bestOffer = product.product_offers
    ?.filter((o) => o.status === 'active')
    ?.sort((a, b) => a.price - b.price)?.[0];

  const raw = (bestOffer?.affiliate_url || bestOffer?.product_url || '').trim();
  if (
    raw &&
    !/^https?:\/\/(www\.)?(jumia\.com\.ng|amazon\.com|konga\.com)\/?$/i.test(raw) &&
    !/^https?:\/\/(www\.)?amazon\.com\/\?/i.test(raw)
  ) {
    return raw;
  }
  return `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(product.name)}`;
}

function StarRow({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value || 0));
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={`h-4 w-4 ${i < Math.round(v) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
            aria-hidden
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold tabular-nums text-slate-500">{v.toFixed(1)}</span>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0];
  const activeOffers =
    product.product_offers?.filter((o) => o.status === 'active')?.sort((a, b) => a.price - b.price) ??
    [];
  const bestOffer = activeOffers[0];
  const storeCount = activeOffers.length || (bestOffer ? 1 : 0);
  const pathSlug = slugify(String(product.slug || product.name || 'product'));
  const productHref = `/products/${pathSlug}`;
  const dealHref = dealUrlFor(product);
  const storeName = bestOffer?.stores?.name || 'store';
  const brandName = product.brands?.name?.toUpperCase() || null;
  const hasOriginal =
    bestOffer?.original_price != null && bestOffer.original_price > bestOffer.price;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-sky-100 via-white to-blue-50 p-[1px] shadow-[0_10px_40px_-12px_rgba(37,99,235,0.35)] transition hover:shadow-[0_16px_48px_-12px_rgba(37,99,235,0.45)]">
      <div className="flex h-full flex-col rounded-[1.3rem] bg-white px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
        {brandName && (
          <span className="inline-flex w-fit items-center rounded-md bg-[#2f6bff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
            {brandName}
          </span>
        )}

        <Link href={productHref} className="relative mt-3 block">
          <div className="relative mx-auto h-36 w-full max-w-[200px] sm:h-40">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt_text || product.name}
                fill
                className="object-contain transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, 220px"
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-400">
                No image
              </div>
            )}
          </div>
        </Link>

        <Link href={productHref} className="mt-3 block">
          <h3 className="line-clamp-2 text-[15px] font-extrabold leading-snug tracking-tight text-slate-900 sm:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2">
          <StarRow value={product.avg_rating || 0} />
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-sky-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 4l9 5.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
          </svg>
          <span>
            {storeCount} store{storeCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2.5">
          {bestOffer ? (
            <>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3.5 py-1.5 text-base font-extrabold tabular-nums text-white shadow-sm sm:text-lg">
                {formatNaira(bestOffer.price)}
              </span>
              {hasOriginal && (
                <span className="pb-1 text-sm font-semibold tabular-nums text-slate-400 line-through">
                  {formatNaira(bestOffer.original_price)}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm font-semibold text-slate-500">Check price on store</span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2.5 pt-4">
          <a
            href={dealHref}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.65)] transition hover:from-emerald-600 hover:to-green-600 active:scale-[0.99]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 11.2a2 2 0 001.96 1.6H17a2 2 0 001.94-1.5L21 8H7" />
            </svg>
            View deal on {storeName}
            <span aria-hidden className="text-base leading-none">
              →
            </span>
          </a>
          <Link
            href={productHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-sky-200 bg-white px-4 py-2.5 text-sm font-bold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50 active:scale-[0.99]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
            </svg>
            Details on TechPick
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

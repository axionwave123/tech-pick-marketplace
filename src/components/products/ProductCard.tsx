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
    bestOffer?.original_price != null && Number(bestOffer.original_price) > Number(bestOffer.price);
  const rating = Math.max(0, Math.min(5, product.avg_rating || 0));

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex h-full flex-col p-2.5 sm:p-3">
        <div className="flex items-start justify-between gap-2">
          {brandName ? (
            <span className="inline-flex items-center rounded-md bg-[#2f6bff] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
              {brandName}
            </span>
          ) : (
            <span />
          )}
          <span className="text-[10px] font-medium tabular-nums text-slate-400">
            {storeCount} store{storeCount === 1 ? '' : 's'}
          </span>
        </div>

        <Link href={productHref} className="relative mt-1.5 block">
          <div className="relative mx-auto h-[88px] w-full max-w-[160px] sm:h-[100px]">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt_text || product.name}
                fill
                className="object-contain transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 40vw, 160px"
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-[10px] text-slate-400">
                No image
              </div>
            )}
          </div>
        </Link>

        <Link href={productHref} className="mt-1.5 block">
          <h3 className="line-clamp-2 min-h-[2.1rem] text-[12px] font-bold leading-snug text-slate-900 sm:text-[13px]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-0.5 flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <svg
              key={i}
              viewBox="0 0 20 20"
              className={`h-2.5 w-2.5 ${i < Math.round(rating) ? 'fill-amber-400' : 'fill-slate-200'}`}
              aria-hidden
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-[10px] font-semibold tabular-nums text-slate-400">{rating.toFixed(1)}</span>
        </div>

        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
          {bestOffer ? (
            <>
              <span className="text-[15px] font-extrabold tabular-nums tracking-tight text-slate-900 sm:text-base">
                {formatNaira(bestOffer.price)}
              </span>
              {hasOriginal && (
                <span className="text-[11px] font-medium tabular-nums text-slate-400 line-through">
                  {formatNaira(bestOffer.original_price)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold text-slate-500">Check price</span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-1.5 pt-2">
          <a
            href={dealHref}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex w-full items-center justify-center gap-1 rounded-full bg-emerald-500 px-2.5 py-2 text-[11px] font-bold leading-tight text-white transition hover:bg-emerald-600 active:scale-[0.99] sm:text-xs"
          >
            View deal on {storeName}
            <span aria-hidden>→</span>
          </a>
          <Link
            href={productHref}
            className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold leading-tight text-sky-700 transition hover:bg-sky-50 active:scale-[0.99] sm:text-xs"
          >
            Details
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

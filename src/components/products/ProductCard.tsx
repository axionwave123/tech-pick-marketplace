import Link from 'next/link';
import Image from 'next/image';
import { formatNaira, formatDiscount, slugify } from '@/lib/utils';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/types';

function dealUrlFor(product: Product): string {
  const bestOffer = product.product_offers
    ?.filter((o) => o.status === 'active')
    ?.sort((a, b) => a.price - b.price)?.[0];

  const raw = (bestOffer?.affiliate_url || bestOffer?.product_url || '').trim();
  // Reject empty or bare store homepages
  if (
    raw &&
    !/^https?:\/\/(www\.)?(jumia\.com\.ng|amazon\.com|konga\.com)\/?$/i.test(raw) &&
    !/^https?:\/\/(www\.)?amazon\.com\/\?/i.test(raw)
  ) {
    return raw;
  }
  // Always work: Jumia search for this product name
  return `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(product.name)}`;
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0];
  const bestOffer = product.product_offers
    ?.filter((o) => o.status === 'active')
    ?.sort((a, b) => a.price - b.price)?.[0];
  const discount = bestOffer
    ? formatDiscount(bestOffer.original_price, bestOffer.price)
    : null;

  const pathSlug = slugify(String(product.slug || product.name || 'product'));
  const productHref = `/products/${pathSlug}`;
  const dealHref = dealUrlFor(product);
  const storeName = bestOffer?.stores?.name || 'Jumia';

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-surface-200 bg-white shadow-card transition hover:shadow-card-hover">
      <Link href={productHref} className="block">
        {/* Pure white canvas so product photos fill cleanly */}
        <div className="relative h-28 bg-white sm:h-32">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt_text || product.name}
              fill
              className="object-contain p-2 transition group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-surface-400">No image</div>
          )}
          {discount && (
            <Badge variant="discount" className="absolute left-1.5 top-1.5">
              {discount}
            </Badge>
          )}
        </div>
        <div className="border-t border-surface-100 px-2 pb-1 pt-1.5">
          {product.brands && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-600">
              {product.brands.name}
            </p>
          )}
          <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-surface-900 group-hover:text-brand-700 sm:text-sm">
            {product.name}
          </h3>
          <div className="mt-0.5 scale-90 origin-left">
            <Rating value={product.avg_rating || 0} />
          </div>
          {bestOffer ? (
            <div className="mt-1">
              <p className="text-sm font-bold text-surface-900 sm:text-base">{formatNaira(bestOffer.price)}</p>
              {bestOffer.original_price && bestOffer.original_price > bestOffer.price && (
                <p className="text-[10px] text-surface-500 line-through">
                  {formatNaira(bestOffer.original_price)}
                </p>
              )}
              <p className="text-[10px] text-surface-500">
                {product.product_offers?.filter((o) => o.status === 'active').length || 1} store
              </p>
            </div>
          ) : (
            <p className="mt-1 text-xs font-medium text-surface-600">Check price on Jumia</p>
          )}
        </div>
      </Link>

      <div className="mt-auto flex flex-col gap-1.5 px-2 pb-2">
        <a
          href={dealHref}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 sm:text-xs"
        >
          View deal on {storeName}
        </a>
        <Link
          href={productHref}
          className="flex w-full items-center justify-center rounded-lg border border-surface-200 bg-surface-50 px-2 py-1 text-[10px] font-semibold text-surface-700 hover:bg-surface-100 sm:text-[11px]"
        >
          Details on TechPick
        </Link>
      </div>
    </div>
  );
}

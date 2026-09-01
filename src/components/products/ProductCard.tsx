import Link from 'next/link';
import Image from 'next/image';
import { formatNaira, formatDiscount } from '@/lib/utils';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0];
  const bestOffer = product.product_offers
    ?.filter((o) => o.status === 'active')
    ?.sort((a, b) => a.price - b.price)?.[0];
  const discount = bestOffer
    ? formatDiscount(bestOffer.original_price, bestOffer.price)
    : null;
  const dealUrl = bestOffer?.affiliate_url || bestOffer?.product_url || null;
  const storeName = bestOffer?.stores?.name || 'store';
  // Always use a URL-safe slug path
  const slug = encodeURIComponent(String(product.slug || '').trim());

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-surface-200 bg-white shadow-card transition hover:shadow-card-hover">
      <Link href={`/products/${slug}`} className="block">
        <div className="relative aspect-[4/3] bg-surface-50">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt_text || product.name}
              fill
              className="object-contain p-2 transition group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-surface-500">No image</div>
          )}
          {discount && (
            <Badge variant="discount" className="absolute left-1.5 top-1.5">
              {discount}
            </Badge>
          )}
        </div>
        <div className="px-2.5 pb-1 pt-2">
          {product.brands && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-600">
              {product.brands.name}
            </p>
          )}
          <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-surface-900 group-hover:text-brand-700 sm:text-sm">
            {product.name}
          </h3>
          <div className="mt-1 scale-90 origin-left">
            <Rating value={product.avg_rating || 0} />
          </div>
          {bestOffer ? (
            <div className="mt-1.5">
              <p className="text-sm font-bold text-surface-900 sm:text-base">{formatNaira(bestOffer.price)}</p>
              {bestOffer.original_price && bestOffer.original_price > bestOffer.price && (
                <p className="text-[10px] text-surface-500 line-through">
                  {formatNaira(bestOffer.original_price)}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-1.5 text-xs font-medium text-surface-600">Price unavailable</p>
          )}
        </div>
      </Link>

      {dealUrl && (
        <div className="mt-auto px-2.5 pb-2.5">
          <a
            href={dealUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 sm:text-xs"
          >
            View deal on {storeName}
          </a>
        </div>
      )}
    </div>
  );
}

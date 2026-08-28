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

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card transition hover:shadow-card-hover"
    >
      <div className="relative aspect-square bg-surface-50">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt_text || product.name}
            fill
            className="object-contain p-4 transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-surface-300 text-sm">No image</div>
        )}
        {discount && (
          <Badge variant="discount" className="absolute left-2 top-2">
            {discount}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {product.brands && (
          <p className="text-xs font-medium uppercase tracking-wide text-surface-400">{product.brands.name}</p>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-surface-900 group-hover:text-brand-700">
          {product.name}
        </h3>
        <div className="mt-2">
          <Rating value={product.avg_rating || 0} />
        </div>
        <div className="mt-auto pt-3">
          {bestOffer ? (
            <>
              <p className="text-lg font-bold text-surface-900">{formatNaira(bestOffer.price)}</p>
              {bestOffer.original_price && bestOffer.original_price > bestOffer.price && (
                <p className="text-xs text-surface-400 line-through">{formatNaira(bestOffer.original_price)}</p>
              )}
              <p className="mt-1 text-xs text-surface-500">
                {product.product_offers?.length || 0} store{(product.product_offers?.length || 0) !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <p className="text-sm text-surface-500">Price unavailable</p>
          )}
        </div>
      </div>
    </Link>
  );
}

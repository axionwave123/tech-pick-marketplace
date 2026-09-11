import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/data/products';
import { formatNaira, relativeTime, formatDiscount } from '@/lib/utils';
import { Rating, ScoreBadge } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { CompareButton } from '@/components/product/CompareButton';
import { StoreLogo } from '@/components/product/StoreLogo';
import { ReviewVideo } from '@/components/product/ReviewVideo';
import { ProductGallery } from '@/components/product/ProductGallery';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.seo_title || product?.name || 'Product',
    description: product?.seo_description || product?.short_description || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = product.product_images || [];
  const offers = (product.product_offers || [])
    .filter((o) => o.status === 'active')
    .map((o) => {
      const ship =
        o.shipping_fee != null && !Number.isNaN(Number(o.shipping_fee))
          ? Number(o.shipping_fee)
          : null;
      const productPrice = Number(o.price) || 0;
      const total = productPrice + (ship ?? 0);
      return { ...o, shipping_fee: ship, _total: total };
    })
    .sort((a, b) => a._total - b._total);
  const best = offers[0];
  const lowestTotal = best?._total;
  const specs = (product.product_specifications || []).sort(
    (a, b) =>
      (a.specification_definitions?.sort_order ?? 0) -
      (b.specification_definitions?.sort_order ?? 0)
  );
  const editorial = Array.isArray(product.editorial_reviews)
    ? product.editorial_reviews[0]
    : product.editorial_reviews;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="text-sm text-surface-400 light:text-surface-500">
        <Link href="/" className="hover:text-brand-400 light:hover:text-brand-600">
          Home
        </Link>
        {product.categories && (
          <>
            <span className="mx-1 text-surface-600 light:text-surface-400">/</span>
            <Link
              href={`/categories/${product.categories.slug}`}
              className="hover:text-brand-400 light:hover:text-brand-600"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <span className="mx-1 text-surface-600 light:text-surface-400">/</span>
        <span className="text-white light:text-surface-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={(images || []).slice().sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return 0;
          })}
          productName={product.name}
        />

        <div>
          {product.brands && (
            <p className="text-sm font-medium uppercase tracking-wide text-surface-300 light:text-surface-500">
              {product.brands.name}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-bold text-white light:text-surface-900">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Rating value={product.avg_rating || 0} size="md" />
            <span className="text-sm text-surface-300 light:text-surface-500">
              {product.review_count} ratings
            </span>
            {editorial?.rating != null && (
              <Badge variant="info">TechPick {editorial.rating}/10</Badge>
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-surface-600/80 bg-gradient-to-b from-surface-900 to-surface-950 shadow-lg ring-1 ring-white/5 light:border-slate-200 light:from-white light:to-slate-50 light:ring-slate-200/60">
            <div className="border-b border-surface-700/80 bg-surface-900/80 px-5 py-4 light:border-slate-100 light:bg-white">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold tracking-tight text-white light:text-slate-900">
                  Price comparison
                </h2>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-400 light:bg-emerald-50 light:text-emerald-700">
                  {offers.length} store{offers.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="mt-1 text-xs text-surface-400 light:text-slate-500">
                Product price + shipping · sorted by total to pay · verify on retailer site
              </p>
            </div>
            <ul className="divide-y divide-surface-800/80 light:divide-slate-100">
              {offers.map((o) => {
                const isBest = o._total === lowestTotal;
                const storeName = o.stores?.name || 'Store';
                const logoUrl = o.stores?.logo_url;
                const dealHref = o.affiliate_url || o.product_url;
                const hasDiscount = o.original_price != null && o.original_price > o.price;
                const ship = o.shipping_fee;
                return (
                  <li
                    key={o.id}
                    className={
                      isBest
                        ? 'relative bg-emerald-950/30 px-4 py-4 light:bg-emerald-50/60'
                        : 'px-4 py-4'
                    }
                  >
                    {isBest && (
                      <span className="absolute right-3 top-3 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        Best total
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <StoreLogo name={storeName} logoUrl={logoUrl} size={44} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white light:text-slate-900">{storeName}</p>
                        <p className="mt-0.5 text-[11px] text-surface-400 light:text-slate-500">
                          Checked {relativeTime(o.last_checked_at)}
                        </p>
                        <div className="mt-2.5 space-y-1">
                          <div className="flex items-center justify-between gap-2 text-xs text-surface-300 light:text-slate-600">
                            <span>Product</span>
                            <span className="font-semibold tabular-nums text-white light:text-slate-900">
                              {formatNaira(o.price)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-xs text-surface-300 light:text-slate-600">
                            <span>Shipping</span>
                            <span className="font-semibold tabular-nums text-white light:text-slate-900">
                              {ship == null ? 'Check on site' : ship === 0 ? 'Free' : formatNaira(ship)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 border-t border-surface-700/60 pt-1.5 light:border-slate-200">
                            <span className="text-xs font-bold uppercase tracking-wide text-surface-400 light:text-slate-500">
                              Total
                            </span>
                            <span
                              className={
                                isBest
                                  ? 'text-lg font-bold tabular-nums text-emerald-300 light:text-emerald-700'
                                  : 'text-lg font-bold tabular-nums text-white light:text-slate-900'
                              }
                            >
                              {formatNaira(o._total)}
                              {ship == null && (
                                <span className="ml-1 text-[10px] font-medium text-amber-400/90">+ shipping?</span>
                              )}
                            </span>
                          </div>
                          {hasDiscount && (
                            <p className="text-[11px] text-surface-400 light:text-slate-500">
                              Was <span className="line-through">{formatNaira(o.original_price!)}</span>{' '}
                              <span className="font-semibold text-red-400 light:text-red-600">
                                {formatDiscount(o.original_price!, o.price)}
                              </span>{' '}
                              on product price
                            </p>
                          )}
                        </div>
                        {dealHref && (
                          <div className="mt-3">
                            <a
                              href={dealHref}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className={
                                isBest
                                  ? 'inline-flex items-center rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500'
                                  : 'view-deal-btn inline-flex items-center rounded-lg border-2 px-3.5 py-2 text-xs font-bold shadow-sm transition'
                              }
                            >
                              View deal →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
              {offers.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-surface-400 light:text-slate-500">
                  No active offers yet.
                </li>
              )}
            </ul>
            {offers.length > 1 && (
              <div className="border-t border-surface-700/80 bg-surface-900/50 px-5 py-3 text-center text-[11px] text-surface-400 light:border-slate-100 light:bg-slate-50 light:text-slate-500">
                Save up to{' '}
                <span className="font-bold text-emerald-400 light:text-emerald-600">
                  {formatNaira(Math.max(...offers.map((o) => o._total)) - (lowestTotal || 0))}
                </span>{' '}
                by picking the best total
              </div>
            )}
            <p className="border-t border-surface-800 px-4 py-2 text-[10px] text-surface-500 light:border-slate-100 light:text-slate-500">
              Affiliate links may earn TechPick NG a commission. Prices and shipping change on retailer sites.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <CompareButton productId={product.id} />
          </div>

          <ReviewVideo
            url={(product as { review_video_url?: string | null }).review_video_url}
            title={`${product.name} review`}
          />
        </div>
      </div>

      <div className="mt-12 space-y-10">
          {product.what_stands_out && (
            <section>
              <h2 className="text-xl font-bold text-white light:text-surface-900">
                What makes it stand out
              </h2>
              <p className="mt-3 text-surface-200 light:text-surface-700">{product.what_stands_out}</p>
            </section>
          )}

          <section className="grid gap-6 sm:grid-cols-2">
            {product.strengths && product.strengths.length > 0 && (
              <div className="rounded-2xl border border-emerald-800/50 light:border-emerald-100 bg-emerald-950/40 light:bg-emerald-50/50 p-5">
                <h3 className="font-semibold text-emerald-300 light:text-emerald-900">Strengths</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-100/90 light:text-emerald-900/80">
                  {product.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.things_to_consider && product.things_to_consider.length > 0 && (
              <div className="rounded-2xl border border-amber-800/50 light:border-amber-100 bg-amber-950/40 light:bg-amber-50/50 p-5">
                <h3 className="font-semibold text-amber-300 light:text-amber-900">Things to consider</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-100/90 light:text-amber-900/80">
                  {product.things_to_consider.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {specs.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white light:text-surface-900">Specifications</h2>
              <dl className="mt-4 divide-y divide-surface-800 light:divide-surface-100 rounded-2xl border border-surface-700 light:border-surface-200">
                {specs.map((s) => (
                  <div key={s.id} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
                    <dt className="text-surface-400 light:text-surface-500">
                      {s.specification_definitions?.label}
                    </dt>
                    <dd className="font-medium text-white light:text-surface-900">
                      {s.value_text ??
                        (s.value_number != null
                          ? `${s.value_number}${s.specification_definitions?.unit ? ` ${s.specification_definitions.unit}` : ''}`
                          : '—')}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {editorial && editorial.status === 'published' && (
            <section className="rounded-2xl border border-surface-700 light:border-surface-200 bg-surface-900 light:bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white light:text-surface-900">TechPick Analysis</h2>
                  <p className="mt-1 text-sm text-surface-400 light:text-surface-500">
                    Editorial summary — based on available public information.
                  </p>
                </div>
                {editorial.rating != null && <ScoreBadge score={editorial.rating} label="/10" />}
              </div>
              {editorial.summary && (
                <p className="mt-4 text-surface-200 light:text-surface-700">{editorial.summary}</p>
              )}
              {editorial.verdict && (
                <div className="mt-4 rounded-xl bg-surface-800 light:bg-surface-50 p-4">
                  <p className="text-sm font-semibold text-white light:text-surface-900">Verdict</p>
                  <p className="mt-1 text-sm text-sm text-surface-200 light:text-surface-700">{editorial.verdict}</p>
                </div>
              )}
            </section>
          )}
      </div>
    </div>
  );
}

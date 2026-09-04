import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/data/products';
import { formatNaira, relativeTime, formatDiscount } from '@/lib/utils';
import { Rating, ScoreBadge } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { CompareButton } from '@/components/product/CompareButton';
import { StoreLogo } from '@/components/product/StoreLogo';

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
  const primary = images.find((i) => i.is_primary) || images[0];
  const offers = (product.product_offers || [])
    .filter((o) => o.status === 'active')
    .sort((a, b) => a.price - b.price);
  const best = offers[0];
  const lowestPrice = best?.price;
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
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-sm ring-1 ring-black/5">
          {primary ? (
            <Image
              src={primary.url}
              alt={primary.alt_text || product.name}
              fill
              className="object-contain p-6 sm:p-10"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-surface-400">No image</div>
          )}
        </div>

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

          {best && (
            <div className="mt-6 rounded-2xl border border-surface-200 bg-white p-5 text-slate-900">
              <p className="text-sm text-slate-500">Best deal we found</p>
              <p className="text-3xl font-bold text-slate-900">{formatNaira(best.price)}</p>
              {best.original_price && best.original_price > best.price && (
                <p className="text-sm text-slate-500">
                  <span className="line-through">{formatNaira(best.original_price)}</span>{' '}
                  <Badge variant="discount" className="ml-2">
                    {formatDiscount(best.original_price, best.price)}
                  </Badge>
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                via {best.stores?.name || 'store'} · Last checked {relativeTime(best.last_checked_at)}
              </p>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                {offers.map((o) => (
                  <a
                    key={o.id}
                    href={o.affiliate_url || o.product_url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500 hover:shadow-lg"
                  >
                    <StoreLogo name={o.stores?.name || 'Store'} logoUrl={o.stores?.logo_url} size={32} />
                    <span>Check price on {o.stores?.name || 'store'}</span>
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Affiliate / outbound links may earn TechPick NG a commission. Prices change on retailer
                sites.
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <CompareButton productId={product.id} />
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
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
                  <h2 className="text-xl font-bold text-white light:text-surface-900">
                    TechPick Analysis
                  </h2>
                  <p className="mt-1 text-sm text-surface-400 light:text-surface-500">
                    Editorial summary — based on available public information, not a claim of physical
                    lab testing unless stated.
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
                  <p className="mt-1 text-sm text-surface-200 light:text-surface-700">{editorial.verdict}</p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* ——— Professional price comparison ——— */}
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-surface-600/80 bg-gradient-to-b from-surface-900 to-surface-950 shadow-lg ring-1 ring-white/5 light:border-slate-200 light:from-white light:to-slate-50 light:ring-slate-200/60">
            <div className="border-b border-surface-700/80 bg-surface-900/80 px-5 py-4 light:border-slate-100 light:bg-white">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold tracking-tight text-white light:text-slate-900">
                  Price comparison
                </h3>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-400 light:bg-emerald-50 light:text-emerald-700">
                  {offers.length} store{offers.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="mt-1 text-xs text-surface-400 light:text-slate-500">
                Sorted by lowest price · verify on retailer site
              </p>
            </div>

            <ul className="divide-y divide-surface-800/80 light:divide-slate-100">
              {offers.map((o, index) => {
                const isBest = o.price === lowestPrice;
                const storeName = o.stores?.name || 'Store';
                const logoUrl = o.stores?.logo_url;
                const dealHref = o.affiliate_url || o.product_url;
                const hasDiscount =
                  o.original_price != null && o.original_price > o.price;

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
                        Best price
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <StoreLogo name={storeName} logoUrl={logoUrl} size={44} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-white light:text-slate-900">
                            {storeName}
                          </p>
                          {index === 0 && !isBest && (
                            <span className="text-[10px] font-medium text-surface-500">#1</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-surface-400 light:text-slate-500">
                          Checked {relativeTime(o.last_checked_at)}
                        </p>

                        <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                          <div>
                            <p
                              className={
                                isBest
                                  ? 'text-lg font-bold text-emerald-300 light:text-emerald-700'
                                  : 'text-lg font-bold text-white light:text-slate-900'
                              }
                            >
                              {formatNaira(o.price)}
                            </p>
                            {hasDiscount && (
                              <p className="text-xs text-surface-400 light:text-slate-500">
                                <span className="line-through">
                                  {formatNaira(o.original_price!)}
                                </span>{' '}
                                <span className="font-semibold text-red-400 light:text-red-600">
                                  {formatDiscount(o.original_price!, o.price)}
                                </span>
                              </p>
                            )}
                          </div>

                          {dealHref && (
                            <a
                              href={dealHref}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className={
                                isBest
                                  ? 'inline-flex items-center rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500'
                                  : 'inline-flex items-center rounded-lg border-2 border-white/35 bg-white/15 px-3.5 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-sm transition hover:border-white/60 hover:bg-white/25 light:border-slate-300 light:bg-white light:text-slate-800 light:hover:border-brand-400 light:hover:bg-slate-50'
                              }
                            >
                              View deal →
                            </a>
                          )}
                        </div>
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
                  {formatNaira(Math.max(...offers.map((o) => o.price)) - (lowestPrice || 0))}
                </span>{' '}
                by picking the best price
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

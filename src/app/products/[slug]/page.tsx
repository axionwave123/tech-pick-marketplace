import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/data/products';
import { formatNaira, relativeTime, formatDiscount } from '@/lib/utils';
import { Rating, ScoreBadge } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';

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
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-surface-700 light:border-surface-200 bg-surface-900 light:bg-surface-50">
          {primary ? (
            <Image
              src={primary.url}
              alt={primary.alt_text || product.name}
              fill
              className="object-contain p-8"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-surface-500">No image</div>
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
              <div className="mt-4 flex flex-wrap gap-2">
                {offers.map((o) => (
                  <a
                    key={o.id}
                    href={o.affiliate_url || o.product_url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Check price on {o.stores?.name || 'store'}
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
            <Link href={`/compare?ids=${product.id}`} className="compare-btn">
              Add to compare
            </Link>
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

        <aside className="space-y-6">
          <div className="rounded-2xl border border-surface-700 light:border-surface-200 p-5">
            <h3 className="font-semibold text-white light:text-surface-900">Price comparison</h3>
            <ul className="mt-4 space-y-3">
              {offers.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium text-white light:text-surface-900">{o.stores?.name}</p>
                    <p className="text-xs text-surface-400">{relativeTime(o.last_checked_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white light:text-surface-900">{formatNaira(o.price)}</p>
                    <a
                      href={o.affiliate_url || o.product_url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="text-xs font-medium text-brand-400 light:text-brand-600 hover:underline"
                    >
                      View deal
                    </a>
                  </div>
                </li>
              ))}
              {offers.length === 0 && (
                <li className="text-sm text-surface-400 light:text-surface-500">No active offers.</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

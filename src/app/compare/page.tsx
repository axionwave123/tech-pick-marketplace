import type { ReactNode } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { formatNaira } from '@/lib/utils';
import { RemoveFromCompare } from '@/components/product/RemoveFromCompare';

export const metadata = { title: 'Compare Products' };
export const dynamic = 'force-dynamic';

type CompareProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  avg_rating: number | null;
  review_count: number | null;
  brands: { name: string } | null;
  categories: { name: string; slug: string } | null;
  product_images: { url: string; is_primary: boolean | null; alt_text: string | null }[] | null;
  product_offers: {
    price: number;
    original_price: number | null;
    status: string;
    product_url: string | null;
    affiliate_url: string | null;
    stores: { name: string } | null;
  }[] | null;
};

async function loadProducts(ids: string[]): Promise<CompareProduct[]> {
  if (!ids.length || !isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id, name, slug, short_description, avg_rating, review_count,
      brands ( name ),
      categories ( name, slug ),
      product_images ( url, is_primary, alt_text ),
      product_offers ( price, original_price, status, product_url, affiliate_url, stores ( name ) )
    `
    )
    .in('id', ids)
    .eq('status', 'published');

  if (error || !data) return [];

  const rows = data as unknown as CompareProduct[];
  const map = new Map(rows.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean) as CompareProduct[];
}

function bestOffer(p: CompareProduct) {
  const offers = (p.product_offers || []).filter((o) => o.status === 'active');
  if (!offers.length) return null;
  return offers.reduce((a, b) => (a.price <= b.price ? a : b));
}

function primaryImage(p: CompareProduct) {
  const imgs = p.product_images || [];
  return imgs.find((i) => i.is_primary)?.url || imgs[0]?.url || null;
}

const SPEC_ICONS: Record<string, ReactNode> = {
  Brand: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  Category: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  'Best price': (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  Was: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  Store: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A3 3 0 015.672 2.25h12.656a3 3 0 012.122.879l1.19 1.19a3.004 3.004 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
    </svg>
  ),
  Rating: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  Summary: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
};

function SpecRow({ label, children }: { label: string; children: ReactNode }) {
  const icon = SPEC_ICONS[label];
  return (
    <div className="flex flex-col gap-0.5 border-b border-surface-800/80 py-2.5 last:border-0 light:border-slate-100 sm:flex-row sm:items-start sm:gap-3">
      <dt className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-surface-500 light:text-slate-500 sm:w-28">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="min-w-0 flex-1 break-words text-sm font-medium leading-snug text-surface-100 light:text-slate-800">
        {children}
      </dd>
    </div>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsRaw } = await searchParams;
  const ids = (idsRaw || '')
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const products = await loadProducts(ids);

  const gridClass =
    products.length <= 1
      ? 'grid-cols-1 max-w-md mx-auto'
      : products.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : products.length === 3
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-white light:text-slate-900 sm:text-3xl">
        Product Comparison
      </h1>
      <p className="mt-2 max-w-2xl text-sm font-medium text-surface-200 light:text-slate-600 sm:text-base">
        Compare up to 4 products. Add them from each product page with{' '}
        <strong className="text-white light:text-slate-900">Add to compare</strong>.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/categories/smartphones"
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-bold text-white hover:bg-brand-500"
        >
          Browse phones
        </Link>
        <Link
          href="/categories/laptops"
          className="rounded-lg bg-surface-800 px-3 py-2 text-sm font-bold text-white hover:bg-surface-700 light:bg-slate-200 light:text-slate-900"
        >
          Browse laptops
        </Link>
        <Link
          href="/search"
          className="rounded-lg bg-surface-800 px-3 py-2 text-sm font-bold text-white hover:bg-surface-700 light:bg-slate-200 light:text-slate-900"
        >
          Search products
        </Link>
        {products.length > 0 && (
          <Link
            href="/compare"
            className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm font-bold text-red-200 hover:bg-red-900/40"
          >
            Clear comparison
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-surface-600 bg-surface-900/60 p-6 text-center light:border-slate-300 light:bg-slate-100 sm:p-8">
          <p className="text-lg font-semibold text-white light:text-slate-900">
            No products selected yet
          </p>
          <ol className="mx-auto mt-4 max-w-md space-y-3 text-left text-sm text-surface-300 light:text-slate-600">
            <li>
              <strong className="text-white light:text-slate-900">1.</strong> Tap{' '}
              <Link href="/categories/smartphones" className="font-semibold text-brand-400 underline">
                Browse phones
              </Link>{' '}
              (or laptops).
            </li>
            <li>
              <strong className="text-white light:text-slate-900">2.</strong> Open any product.
            </li>
            <li>
              <strong className="text-white light:text-slate-900">3.</strong> Tap the{' '}
              <strong className="text-white light:text-slate-900">Add to compare</strong> button on that
              product page.
            </li>
            <li>
              <strong className="text-white light:text-slate-900">4.</strong> Open a second product and
              tap Add to compare again — both appear here.
            </li>
          </ol>
        </div>
      ) : (
        <div className={`mt-6 grid gap-4 sm:gap-5 ${gridClass}`}>
          {products.map((p) => {
            const img = primaryImage(p);
            const offer = bestOffer(p);
            const dealUrl = offer?.affiliate_url || offer?.product_url;
            const rating =
              p.avg_rating != null && p.avg_rating > 0
                ? `${Number(p.avg_rating).toFixed(1)} (${p.review_count || 0})`
                : '—';
            const was =
              offer?.original_price && offer.original_price > offer.price
                ? formatNaira(offer.original_price)
                : '—';

            return (
              <article
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-surface-700 bg-surface-900/90 shadow-lg light:border-slate-200 light:bg-white light:shadow-md"
              >
                <div className="relative border-b border-surface-800 bg-surface-950/50 px-4 pb-4 pt-5 light:border-slate-100 light:bg-slate-50/80">
                  <div className="absolute right-3 top-3">
                    <RemoveFromCompare productId={p.id} allIds={ids} />
                  </div>
                  <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm sm:h-32 sm:w-32">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-xs text-surface-400">No image</span>
                    )}
                  </div>
                  <Link
                    href={`/products/${p.slug}`}
                    className="mt-3 block text-center text-base font-bold leading-snug text-white hover:text-brand-300 light:text-slate-900 light:hover:text-brand-600"
                  >
                    {p.name}
                  </Link>
                </div>

                <dl className="flex-1 px-4 py-1">
                  <SpecRow label="Brand">{p.brands?.name || '—'}</SpecRow>
                  <SpecRow label="Category">{p.categories?.name || '—'}</SpecRow>
                  <SpecRow label="Best price">
                    <span className="text-base font-bold text-emerald-400 light:text-emerald-700">
                      {offer ? formatNaira(offer.price) : 'No price'}
                    </span>
                  </SpecRow>
                  <SpecRow label="Was">{was}</SpecRow>
                  <SpecRow label="Store">{offer?.stores?.name || '—'}</SpecRow>
                  <SpecRow label="Rating">{rating}</SpecRow>
                  <SpecRow label="Summary">
                    <span className="whitespace-normal break-words">
                      {p.short_description || '—'}
                    </span>
                  </SpecRow>
                </dl>

                <div className="mt-auto border-t border-surface-800 p-4 light:border-slate-100">
                  {dealUrl ? (
                    <a
                      href={dealUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500"
                    >
                      View deal
                    </a>
                  ) : (
                    <span className="block text-center text-sm text-surface-500">No deal link</span>
                  )}
                  <Link
                    href={`/products/${p.slug}`}
                    className="mt-2 block text-center text-xs font-semibold text-brand-400 hover:underline"
                  >
                    Full product page →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {products.length > 0 && products.length < 4 && (
        <p className="mt-6 text-sm text-surface-400 light:text-slate-600">
          You can add {4 - products.length} more product{products.length === 3 ? '' : 's'}. Open
          another product page and tap <strong>Add to compare</strong>.
        </p>
      )}
    </div>
  );
}

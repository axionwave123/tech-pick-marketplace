import type { ReactNode } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { formatNaira, formatDiscount } from '@/lib/utils';
import { RemoveFromCompare } from '@/components/product/RemoveFromCompare';
import { StoreLogo } from '@/components/product/StoreLogo';

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
    stores: { name: string; logo_url: string | null } | null;
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
      product_offers ( price, original_price, status, product_url, affiliate_url, stores ( name, logo_url ) )
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
    <svg className="h-3.5 w-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  Category: (
    <svg className="h-3.5 w-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  Rating: (
    <svg className="h-3.5 w-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  About: (
    <svg className="h-3.5 w-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
};

function SpecRow({ label, children }: { label: string; children: ReactNode }) {
  const icon = SPEC_ICONS[label];
  return (
    <div className="flex gap-3 border-b border-surface-800/70 py-3 last:border-0 light:border-slate-100">
      <dt className="flex w-[5.5rem] shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-surface-400 light:text-slate-500">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-white light:text-slate-900">
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

  const prices = products
    .map((p) => {
      const o = bestOffer(p);
      return o ? { id: p.id, price: o.price } : null;
    })
    .filter(Boolean) as { id: string; price: number }[];
  const lowestPrice = prices.length ? Math.min(...prices.map((x) => x.price)) : null;
  const bestDealId =
    lowestPrice != null ? prices.find((x) => x.price === lowestPrice)?.id ?? null : null;

  const gridClass =
    products.length <= 1
      ? 'grid-cols-1 max-w-md mx-auto'
      : products.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : products.length === 3
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-surface-700/80 bg-gradient-to-br from-surface-900 via-surface-900 to-brand-950/40 px-5 py-6 light:border-slate-200 light:from-white light:via-slate-50 light:to-brand-50 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400 light:text-brand-600">
          Side-by-side
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white light:text-slate-900 sm:text-3xl">
          Product comparison
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-surface-300 light:text-slate-600 sm:text-base">
          {products.length > 0
            ? `You are comparing ${products.length} product${products.length === 1 ? '' : 's'}. Scroll each card to see brand, price, store, and deal.`
            : 'Add products from any product page using Add to compare, then return here.'}
        </p>
        {products.length > 0 && bestDealId && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/30 light:bg-emerald-50 light:text-emerald-800 light:ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Lowest price is highlighted with a green Best deal badge
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/categories/smartphones"
          className="rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-500"
        >
          Browse phones
        </Link>
        <Link
          href="/categories/laptops"
          className="rounded-xl bg-surface-800 px-3.5 py-2 text-sm font-bold text-white hover:bg-surface-700 light:bg-slate-200 light:text-slate-900"
        >
          Browse laptops
        </Link>
        <Link
          href="/search"
          className="rounded-xl bg-surface-800 px-3.5 py-2 text-sm font-bold text-white hover:bg-surface-700 light:bg-slate-200 light:text-slate-900"
        >
          Search products
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-surface-600 bg-surface-900/60 p-6 text-center light:border-slate-300 light:bg-slate-50 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/20 text-brand-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </div>
          <p className="mt-4 text-lg font-bold text-white light:text-slate-900">Nothing to compare yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-surface-400 light:text-slate-600">
            Open a product, tap <strong className="text-white light:text-slate-800">Add to compare</strong>, then
            open another product and do the same.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/categories/smartphones"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500"
            >
              Start with phones
            </Link>
            <Link
              href="/categories/laptops"
              className="rounded-xl border border-surface-600 px-4 py-2.5 text-sm font-bold text-surface-200 hover:bg-surface-800 light:border-slate-300 light:text-slate-800"
            >
              Or laptops
            </Link>
          </div>
        </div>
      ) : (
        <div className={`mt-8 grid gap-5 sm:gap-6 ${gridClass}`}>
          {products.map((p, index) => {
            const img = primaryImage(p);
            const offer = bestOffer(p);
            const dealUrl = offer?.affiliate_url || offer?.product_url;
            const storeName = offer?.stores?.name || null;
            const storeLogo = offer?.stores?.logo_url || null;
            const discount = offer ? formatDiscount(offer.original_price, offer.price) : null;
            const isBest = bestDealId === p.id;
            const rating =
              p.avg_rating != null && p.avg_rating > 0
                ? `${Number(p.avg_rating).toFixed(1)} · ${p.review_count || 0} reviews`
                : 'No ratings yet';
            const was =
              offer?.original_price && offer.original_price > offer.price
                ? formatNaira(offer.original_price)
                : null;

            return (
              <article
                key={p.id}
                className={`relative flex flex-col overflow-hidden rounded-3xl border bg-surface-900 shadow-xl transition light:bg-white ${
                  isBest
                    ? 'border-emerald-500/50 ring-2 ring-emerald-500/30 light:border-emerald-400 light:ring-emerald-200'
                    : 'border-surface-700 light:border-slate-200 light:shadow-md'
                }`}
              >
                {isBest && (
                  <div className="absolute left-0 top-0 z-10 rounded-br-2xl bg-emerald-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
                    Best deal
                  </div>
                )}

                <div className="absolute right-3 top-3 z-10">
                  <RemoveFromCompare productId={p.id} allIds={ids} />
                </div>

                <div className="relative bg-gradient-to-b from-white to-slate-100 px-5 pb-4 pt-10">
                  <div className="mx-auto flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain drop-shadow-md"
                      />
                    ) : (
                      <span className="text-sm text-slate-400">No image</span>
                    )}
                  </div>
                  {discount && (
                    <span className="absolute bottom-3 left-4 rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                      {discount} off
                    </span>
                  )}
                </div>

                <div className="border-b border-surface-800 px-5 py-4 light:border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-surface-500 light:text-slate-400">
                    Product {index + 1} of {products.length}
                  </p>
                  <Link
                    href={`/products/${p.slug}`}
                    className="mt-1 block font-display text-lg font-bold leading-snug tracking-tight text-white hover:text-brand-300 light:text-slate-900 light:hover:text-brand-600"
                  >
                    {p.name}
                  </Link>

                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <span
                      className={`font-display text-2xl font-bold tracking-tight ${
                        isBest
                          ? 'text-emerald-400 light:text-emerald-600'
                          : 'text-white light:text-slate-900'
                      }`}
                    >
                      {offer ? formatNaira(offer.price) : 'No price'}
                    </span>
                    {was && (
                      <span className="pb-0.5 text-sm font-medium text-surface-500 line-through light:text-slate-400">
                        {was}
                      </span>
                    )}
                  </div>

                  {storeName && (
                    <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-surface-700/80 bg-surface-950/50 px-3 py-2 light:border-slate-200 light:bg-slate-50">
                      <StoreLogo name={storeName} logoUrl={storeLogo} size={32} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500 light:text-slate-500">
                          Best price at
                        </p>
                        <p className="truncate text-sm font-bold text-white light:text-slate-900">
                          {storeName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <dl className="flex-1 px-5 py-1">
                  <SpecRow label="Brand">{p.brands?.name || '—'}</SpecRow>
                  <SpecRow label="Category">{p.categories?.name || '—'}</SpecRow>
                  <SpecRow label="Rating">{rating}</SpecRow>
                  <SpecRow label="About">
                    <span className="text-[13px] font-medium leading-relaxed text-surface-200 light:text-slate-700">
                      {p.short_description || 'No summary yet.'}
                    </span>
                  </SpecRow>
                </dl>

                <div className="mt-auto space-y-2 border-t border-surface-800 p-4 light:border-slate-100">
                  {dealUrl ? (
                    <a
                      href={dealUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98] ${
                        isBest
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                          : 'bg-brand-600 hover:bg-brand-500 shadow-brand-900/20'
                      }`}
                    >
                      {storeName ? (
                        <>
                          <StoreLogo name={storeName} logoUrl={storeLogo} size={22} />
                          <span>View deal on {storeName}</span>
                        </>
                      ) : (
                        <span>View deal</span>
                      )}
                    </a>
                  ) : (
                    <span className="block rounded-2xl bg-surface-800 py-3 text-center text-sm text-surface-400">
                      No deal link
                    </span>
                  )}
                  <Link
                    href={`/products/${p.slug}`}
                    className="block text-center text-xs font-semibold text-brand-400 hover:underline light:text-brand-600"
                  >
                    Full product details →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {products.length > 0 && products.length < 4 && (
        <div className="mt-8 rounded-2xl border border-dashed border-surface-700 bg-surface-900/40 px-4 py-4 text-center light:border-slate-300 light:bg-slate-50">
          <p className="text-sm text-surface-300 light:text-slate-600">
            Room for <strong className="text-white light:text-slate-900">{4 - products.length}</strong> more
            product{products.length === 3 ? '' : 's'}. Open another product and tap{' '}
            <strong className="text-white light:text-slate-900">Add to compare</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

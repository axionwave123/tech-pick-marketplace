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

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-surface-800/80 py-2.5 last:border-0 light:border-slate-100 sm:flex-row sm:items-start sm:gap-3">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-surface-500 light:text-slate-500 sm:w-24">
        {label}
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

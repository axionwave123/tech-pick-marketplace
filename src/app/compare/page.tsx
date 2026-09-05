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

  const rows: { label: string; values: (string | null)[] }[] = [];

  if (products.length) {
    rows.push({
      label: 'Brand',
      values: products.map((p) => p.brands?.name || '—'),
    });
    rows.push({
      label: 'Category',
      values: products.map((p) => p.categories?.name || '—'),
    });
    rows.push({
      label: 'Best price',
      values: products.map((p) => {
        const o = bestOffer(p);
        return o ? formatNaira(o.price) : 'No price';
      }),
    });
    rows.push({
      label: 'Was',
      values: products.map((p) => {
        const o = bestOffer(p);
        return o?.original_price && o.original_price > o.price
          ? formatNaira(o.original_price)
          : '—';
      }),
    });
    rows.push({
      label: 'Store',
      values: products.map((p) => bestOffer(p)?.stores?.name || '—'),
    });
    rows.push({
      label: 'Rating',
      values: products.map((p) =>
        p.avg_rating != null && p.avg_rating > 0
          ? `${Number(p.avg_rating).toFixed(1)} (${p.review_count || 0})`
          : '—'
      ),
    });
    rows.push({
      label: 'Summary',
      values: products.map((p) => p.short_description || '—'),
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white light:text-slate-900">
        Product Comparison
      </h1>
      <p className="mt-2 max-w-2xl text-base font-medium text-surface-200 light:text-slate-600">
        Compare up to 4 products side by side. You do{' '}
        <strong className="text-white light:text-slate-900">not</strong> type products here. Add them
        from each product page using the{' '}
        <strong className="text-white light:text-slate-900">Add to compare</strong> button.
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
        <div className="mt-10 rounded-2xl border border-dashed border-surface-600 bg-surface-900/60 p-8 text-center light:border-slate-300 light:bg-slate-100">
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
              tap Add to compare again — both appear in this table.
            </li>
          </ol>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-surface-700 light:border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-surface-900 light:bg-slate-100">
                <th className="sticky left-0 z-10 bg-surface-900 px-4 py-3 font-medium text-surface-400 light:bg-slate-100 light:text-slate-500">
                  Spec
                </th>
                {products.map((p) => {
                  const img = primaryImage(p);
                  return (
                    <th key={p.id} className="px-4 py-3 align-top">
                      <div className="flex flex-col items-start gap-2">
                        <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt={p.name}
                              className="h-full w-full object-contain p-1.5"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-surface-400">
                              No img
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/products/${p.slug}`}
                          className="font-bold text-white hover:text-brand-300 light:text-slate-900 light:hover:text-brand-600"
                        >
                          {p.name}
                        </Link>
                        <RemoveFromCompare productId={p.id} allIds={ids} />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800 light:divide-slate-200">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-surface-900/40 light:hover:bg-slate-50">
                  <th className="sticky left-0 z-10 bg-surface-950 px-4 py-3 font-medium text-surface-400 light:bg-white light:text-slate-500">
                    {row.label}
                  </th>
                  {row.values.map((v, i) => (
                    <td
                      key={`${row.label}-${products[i].id}`}
                      className="px-4 py-3 text-surface-100 light:text-slate-800"
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="sticky left-0 z-10 bg-surface-950 px-4 py-3 font-medium text-surface-400 light:bg-white light:text-slate-500">
                  Deal
                </th>
                {products.map((p) => {
                  const o = bestOffer(p);
                  const url = o?.affiliate_url || o?.product_url;
                  return (
                    <td key={`deal-${p.id}`} className="px-4 py-3">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          View deal
                        </a>
                      ) : (
                        <span className="text-surface-500">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
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

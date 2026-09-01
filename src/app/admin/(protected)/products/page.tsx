import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { formatNaira } from '@/lib/utils';
import { DeleteProductButton } from './DeleteProductButton';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const { q } = await searchParams;
  const query = (q || '').trim();

  const supabase = await createClient();
  let req = supabase
    .from('products')
    .select(
      'id, name, slug, status, updated_at, categories(name), product_offers(price, status, product_url)'
    )
    .order('updated_at', { ascending: false })
    .limit(200);

  if (query) {
    req = req.or(`name.ilike.%${query}%,slug.ilike.%${query}%`);
  }

  const { data: products } = await req;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit / delete products</h1>
          <p className="mt-1 text-sm text-surface-400">
            Search, open Edit, change price or deal link, or Delete permanently.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
        >
          + Add product
        </Link>
      </div>

      <form action="/admin/products" method="get" className="mt-5 flex max-w-xl gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by product name…"
          className="min-w-0 flex-1 rounded-lg border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white placeholder:text-surface-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500"
        >
          Search
        </button>
        {query && (
          <Link
            href="/admin/products"
            className="rounded-lg px-3 py-2.5 text-sm text-surface-400 hover:text-white"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="mt-3 text-sm text-surface-400">
        {(products || []).length} product{(products || []).length === 1 ? '' : 's'}
        {query ? ` matching “${query}”` : ''}
      </p>

      {/* Mobile-friendly cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {(products || []).map((p: any) => {
          const prices = (p.product_offers || [])
            .filter((o: any) => o.status === 'active')
            .map((o: any) => Number(o.price));
          const min = prices.length ? Math.min(...prices) : null;
          return (
            <div key={p.id} className="rounded-xl border border-surface-800 bg-surface-900 p-4">
              <p className="font-semibold text-white">{p.name}</p>
              <p className="text-xs text-surface-500">{p.slug}</p>
              <p className="mt-1 text-sm text-surface-300">
                {p.status} · {min != null ? formatNaira(min) : 'No price'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white"
                >
                  Edit
                </Link>
                <Link
                  href={`/products/${p.slug}`}
                  target="_blank"
                  className="rounded-lg bg-surface-800 px-3 py-2 text-xs font-semibold text-surface-200"
                >
                  View site
                </Link>
                <DeleteProductButton productId={p.id} productName={p.name} />
              </div>
            </div>
          );
        })}
        {(!products || products.length === 0) && (
          <p className="py-8 text-center text-surface-500">
            {query ? 'No products match that search.' : 'No products yet.'}
          </p>
        )}
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-xl border border-surface-800 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 text-surface-400">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {(products || []).map((p: any) => {
              const prices = (p.product_offers || [])
                .filter((o: any) => o.status === 'active')
                .map((o: any) => Number(o.price));
              const min = prices.length ? Math.min(...prices) : null;
              return (
                <tr key={p.id} className="hover:bg-surface-900/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-medium text-white hover:text-brand-400"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-surface-500">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-surface-400">{p.categories?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface-800 px-2 py-0.5 text-xs capitalize">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-surface-300">
                    {min != null ? formatNaira(min) : '—'}
                  </td>
                  <td className="px-4 py-3 text-surface-500">
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-500"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/products/${p.slug}`}
                        className="rounded-lg bg-surface-800 px-3 py-1.5 text-xs font-semibold text-surface-200 hover:bg-surface-700"
                        target="_blank"
                      >
                        View site
                      </Link>
                      <DeleteProductButton productId={p.id} productName={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-surface-500">
                  {query ? 'No products match that search.' : 'No products yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

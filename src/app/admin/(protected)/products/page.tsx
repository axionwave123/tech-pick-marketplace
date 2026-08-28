import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { formatNaira } from '@/lib/utils';

export default async function AdminProductsPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, status, updated_at, categories(name), product_offers(price, status)')
    .order('updated_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Add product
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 text-surface-400">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {(products || []).map((p: any) => {
              const prices = (p.product_offers || [])
                .filter((o: any) => o.status === 'active')
                .map((o: any) => o.price);
              const min = prices.length ? Math.min(...prices) : null;
              return (
                <tr key={p.id} className="hover:bg-surface-900/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-white hover:text-brand-400">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-surface-400">{p.categories?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface-800 px-2 py-0.5 text-xs capitalize">{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-surface-300">{min != null ? formatNaira(min) : '—'}</td>
                  <td className="px-4 py-3 text-surface-500">
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatNaira, relativeTime } from '@/lib/utils';

export default async function AdminOffersPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data } = await supabase
    .from('product_offers')
    .select('id, price, original_price, discount_percent, availability, last_checked_at, status, products(name), stores(name)')
    .order('last_checked_at', { ascending: true })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Offers & Prices</h1>
      <p className="mt-2 text-sm text-surface-400">Designed for future API/feed updates. Sorted by oldest last-checked first.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 text-surface-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Last checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {(data || []).map((o: any) => (
              <tr key={o.id}>
                <td className="px-4 py-3 text-white">{o.products?.name}</td>
                <td className="px-4 py-3">{o.stores?.name}</td>
                <td className="px-4 py-3">{formatNaira(o.price)}</td>
                <td className="px-4 py-3">{o.discount_percent != null ? `${o.discount_percent}%` : '—'}</td>
                <td className="px-4 py-3">{o.availability}</td>
                <td className="px-4 py-3 text-surface-400">{relativeTime(o.last_checked_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

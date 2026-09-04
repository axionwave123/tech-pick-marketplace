import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatNaira } from '@/lib/utils';
import { AddStoreForm, EditStoreForm } from './StoreForm';
import { DeleteStoreButton } from './DeleteStoreButton';

export const dynamic = 'force-dynamic';

export default async function AdminStoresPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data: stores } = await supabase.from('stores').select('*').order('name');

  // Count offers + avg discount per store
  const { data: offers } = await supabase
    .from('product_offers')
    .select('store_id, price, original_price, discount_percent, status');

  const stats = new Map<
    string,
    { count: number; withDiscount: number; samplePrices: number[] }
  >();

  for (const o of offers || []) {
    if (o.status !== 'active') continue;
    const s = stats.get(o.store_id) || { count: 0, withDiscount: 0, samplePrices: [] };
    s.count += 1;
    if (o.discount_percent && Number(o.discount_percent) > 0) s.withDiscount += 1;
    if (o.price != null && Number(o.price) > 0 && s.samplePrices.length < 3) {
      s.samplePrices.push(Number(o.price));
    }
    stats.set(o.store_id, s);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Stores</h1>
          <p className="mt-2 max-w-2xl text-sm text-surface-400">
            Manage Jumia, Amazon, Temu, Konga and any other retailer. Each product can have a{' '}
            <strong className="text-surface-200">different price and discount per store</strong> — set
            those on <Link href="/admin/offers" className="text-brand-400 underline">See prices</Link>{' '}
            or when editing a product.
          </p>
        </div>
        <Link
          href="/admin/offers"
          className="rounded-lg bg-surface-800 px-3 py-2 text-sm font-bold text-white hover:bg-surface-700"
        >
          See prices by store →
        </Link>
      </div>

      <div className="mt-8">
        <AddStoreForm />
      </div>

      <h2 className="mt-10 text-lg font-bold text-white">Your stores</h2>
      <p className="mt-1 text-sm text-surface-400">
        {(stores || []).length} store{(stores || []).length === 1 ? '' : 's'}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {(stores || []).map((s: any) => {
          const st = stats.get(s.id) || { count: 0, withDiscount: 0, samplePrices: [] };
          return (
            <div
              key={s.id}
              className="rounded-xl border border-surface-800 bg-surface-900 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{s.name}</h3>
                  <p className="text-xs text-surface-500">{s.slug}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${
                    s.status === 'active'
                      ? 'bg-emerald-900/50 text-emerald-300'
                      : 'bg-surface-800 text-surface-400'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              {s.website_url && (
                <a
                  href={s.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block truncate text-xs text-brand-400 hover:underline"
                >
                  {s.website_url}
                </a>
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-surface-300">
                <span className="rounded-lg bg-surface-800 px-2 py-1">
                  {st.count} active price{st.count === 1 ? '' : 's'}
                </span>
                <span className="rounded-lg bg-surface-800 px-2 py-1">
                  {st.withDiscount} with discount
                </span>
                <span className="rounded-lg bg-surface-800 px-2 py-1">
                  {s.country_code || 'NG'}
                </span>
              </div>

              {st.samplePrices.length > 0 && (
                <p className="mt-2 text-xs text-surface-500">
                  Sample: {st.samplePrices.map((p) => formatNaira(p)).join(' · ')}
                </p>
              )}

              <div className="mt-5 border-t border-surface-800 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">
                  Edit store
                </p>
                <EditStoreForm
                  store={{
                    id: s.id,
                    name: s.name,
                    slug: s.slug,
                    website_url: s.website_url,
                    logo_url: s.logo_url,
                    country_code: s.country_code,
                    status: s.status,
                  }}
                />
                <div className="mt-3">
                  <DeleteStoreButton storeId={s.id} storeName={s.name} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(!stores || stores.length === 0) && (
        <p className="mt-6 text-center text-surface-500">No stores yet. Add one above.</p>
      )}

      <div className="mt-10 rounded-xl border border-surface-800 bg-surface-900/50 p-5 text-sm text-surface-300">
        <p className="font-semibold text-white">How discounts work per store</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Add the store here (Jumia, Amazon, Temu…).</li>
          <li>
            Open a product → <strong>Edit</strong> → set price, original price, and store (or use{' '}
            <Link href="/admin/offers" className="text-brand-400 underline">
              See prices
            </Link>
            ).
          </li>
          <li>
            Discount % is calculated from original vs current price — so Jumia can be −11% while Amazon
            is −5% on the same product.
          </li>
        </ol>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatNaira, relativeTime } from '@/lib/utils';
import { RunTrackButton } from './RunTrackButton';

export const dynamic = 'force-dynamic';

export default async function TrackingPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();

  const [{ data: runs }, { data: history }, { data: stale }, { data: oos }] = await Promise.all([
    supabase
      .from('price_track_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10),
    supabase
      .from('price_history')
      .select(
        'id, price, availability, checked_at, notes, products(name), stores(name)'
      )
      .order('checked_at', { ascending: false })
      .limit(40),
    supabase
      .from('product_offers')
      .select('id, price, last_checked_at, availability, products(name), stores(name)')
      .eq('status', 'active')
      .order('last_checked_at', { ascending: true, nullsFirst: true })
      .limit(15),
    supabase
      .from('product_offers')
      .select('id, price, last_checked_at, products(name), stores(name)')
      .eq('status', 'active')
      .eq('availability', 'out_of_stock')
      .limit(20),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Price & inventory tracking</h1>
          <p className="mt-1 max-w-2xl text-sm text-surface-400">
            Runs daily at 06:00 UTC (about 7:00 AM WAT). Checks store links, logs price history, and
            flags out-of-stock offers.
          </p>
        </div>
        <RunTrackButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-surface-800 bg-surface-900 p-4">
          <p className="text-xs text-surface-500">Last run</p>
          <p className="mt-1 text-lg font-bold text-white">
            {runs?.[0] ? relativeTime(runs[0].started_at) : 'Never'}
          </p>
          <p className="mt-1 text-xs text-surface-400">{runs?.[0]?.summary || '—'}</p>
        </div>
        <div className="rounded-xl border border-surface-800 bg-surface-900 p-4">
          <p className="text-xs text-surface-500">Out of stock alerts</p>
          <p className="mt-1 text-lg font-bold text-amber-300">{(oos || []).length}</p>
        </div>
        <div className="rounded-xl border border-surface-800 bg-surface-900 p-4">
          <p className="text-xs text-surface-500">Oldest check (rotate next)</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {(stale?.[0] as any)?.products?.name || '—'}
          </p>
          <p className="text-xs text-surface-400">
            {stale?.[0]?.last_checked_at ? relativeTime(stale[0].last_checked_at) : 'never'}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-white">Recent cron runs</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-surface-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-900 text-surface-400">
              <tr>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Checked</th>
                <th className="px-4 py-3">Price Δ</th>
                <th className="px-4 py-3">Stock alerts</th>
                <th className="px-4 py-3">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {(runs || []).map((r: any) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-surface-300">
                    {r.started_at ? new Date(r.started_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 capitalize text-white">{r.status}</td>
                  <td className="px-4 py-3">{r.offers_checked ?? '—'}</td>
                  <td className="px-4 py-3">{r.prices_changed ?? '—'}</td>
                  <td className="px-4 py-3">{r.inventory_alerts ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-surface-400">{r.summary || '—'}</td>
                </tr>
              ))}
              {(!runs || runs.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-surface-500">
                    No runs yet. Click “Run tracking now”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(oos || []).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-amber-300">Out of stock</h2>
          <ul className="mt-3 space-y-2">
            {(oos || []).map((o: any) => (
              <li
                key={o.id}
                className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-sm text-surface-200"
              >
                {o.products?.name} · {o.stores?.name} · {formatNaira(o.price)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Price history (latest)</h2>
          <Link href="/admin/offers" className="text-sm text-brand-400 hover:underline">
            All offers →
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border border-surface-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-900 text-surface-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {(history || []).map((h: any) => (
                <tr key={h.id}>
                  <td className="px-4 py-3 text-white">{h.products?.name || '—'}</td>
                  <td className="px-4 py-3">{h.stores?.name || '—'}</td>
                  <td className="px-4 py-3">{formatNaira(h.price)}</td>
                  <td className="px-4 py-3 capitalize">{h.availability || '—'}</td>
                  <td className="px-4 py-3 text-surface-400">{relativeTime(h.checked_at)}</td>
                  <td className="px-4 py-3 text-xs text-surface-500">{h.notes || '—'}</td>
                </tr>
              ))}
              {(!history || history.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-surface-500">
                    No history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

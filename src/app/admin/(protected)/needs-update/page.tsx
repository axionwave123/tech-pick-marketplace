import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatNaira, relativeTime } from '@/lib/utils';
import { PublishButton } from './PublishButton';

export default async function NeedsUpdatePage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select(
      `
      id, name, slug, status, updated_at, created_at,
      brands ( name ),
      categories ( name ),
      product_images ( id, is_primary ),
      product_offers ( id, price, status, last_checked_at, stores ( name ) )
    `
    )
    .order('updated_at', { ascending: true })
    .limit(200);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  type Row = {
    id: string;
    name: string;
    status: string;
    reasons: string[];
    minPrice: number | null;
    lastChecked: string | null;
  };

  const rows: Row[] = [];

  for (const p of products || []) {
    const reasons: string[] = [];
    const images = (p as any).product_images || [];
    const offers = ((p as any).product_offers || []).filter((o: any) => o.status === 'active');

    if (p.status === 'draft') reasons.push('Draft — not published');
    if (images.length === 0) reasons.push('Missing image');
    if (offers.length === 0) reasons.push('No active price');

    let lastChecked: string | null = null;
    for (const o of offers) {
      if (o.last_checked_at) {
        if (!lastChecked || o.last_checked_at < lastChecked) lastChecked = o.last_checked_at;
        if (new Date(o.last_checked_at).getTime() < sevenDaysAgo) {
          if (!reasons.includes('Price older than 7 days')) reasons.push('Price older than 7 days');
        }
      }
    }

    if (reasons.length === 0) continue;

    const prices = offers.map((o: any) => Number(o.price)).filter((n: number) => !Number.isNaN(n));
    rows.push({
      id: p.id,
      name: p.name,
      status: p.status,
      reasons,
      minPrice: prices.length ? Math.min(...prices) : null,
      lastChecked,
    });
  }

  // Drafts first, then missing image/price, then stale
  rows.sort((a, b) => {
    const score = (r: Row) =>
      (r.reasons.some((x) => x.includes('Draft')) ? 0 : 10) +
      (r.reasons.some((x) => x.includes('image')) ? 0 : 5) +
      (r.reasons.some((x) => x.includes('price')) ? 0 : 3);
    return score(a) - score(b);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Needs update</h1>
      <p className="mt-2 max-w-2xl text-sm text-surface-400">
        Products that are drafts, missing an image or price, or have prices not checked in 7+ days. Fix
        these before they go live (or to keep live prices honest).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/research"
          className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-500 sm:text-sm"
        >
          AI Research → new draft
        </Link>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-surface-800 px-3 py-2 text-xs font-bold text-white hover:bg-surface-700 sm:text-sm"
        >
          Add product manually
        </Link>
      </div>

      <p className="mt-6 text-sm font-medium text-surface-300">
        {rows.length} product{rows.length === 1 ? '' : 's'} need attention
      </p>

      <div className="mt-3 overflow-x-auto rounded-xl border border-surface-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 text-surface-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Why</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Last checked</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-surface-900/50">
                <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-surface-800 px-2 py-0.5 text-xs capitalize text-surface-200">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ul className="space-y-0.5">
                    {r.reasons.map((reason) => (
                      <li key={reason} className="text-xs text-amber-300/90">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3 text-surface-300">
                  {r.minPrice != null ? formatNaira(r.minPrice) : '—'}
                </td>
                <td className="px-4 py-3 text-surface-500">{relativeTime(r.lastChecked)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/admin/products/new"
                      className="text-xs font-semibold text-brand-400 hover:underline"
                    >
                      Add image / price
                    </Link>
                    {r.status === 'draft' && <PublishButton productId={r.id} />}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-surface-500">
                  Nothing needs update right now. Nice work.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

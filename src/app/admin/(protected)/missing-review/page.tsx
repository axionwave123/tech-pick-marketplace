import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  review_video_url?: string | null;
  brands?: { name?: string } | { name?: string }[] | null;
  categories?: { name?: string } | { name?: string }[] | null;
};

export default async function MissingReviewVideoPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      status,
      review_video_url,
      brands ( name ),
      categories ( name )
    `
    )
    .in('status', ['published', 'draft'])
    .order('name', { ascending: true })
    .limit(500);

  const rows = ((data || []) as Row[]).filter((p) => {
    const v = p.review_video_url;
    return !v || !String(v).trim();
  });

  const published = rows.filter((p) => p.status === 'published').length;
  const drafts = rows.filter((p) => p.status === 'draft').length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Missing YouTube review</h1>
          <p className="mt-1 text-sm text-surface-400">
            Products with no review video URL. Open a product and paste a YouTube link in{' '}
            <span className="text-surface-300">Review video URL</span>.
          </p>
        </div>
        <p className="text-xs font-medium text-surface-500">
          {rows.length} product{rows.length === 1 ? '' : 's'}
          {rows.length > 0 ? ` · ${published} published · ${drafts} draft` : ''}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-emerald-300">All products have a review video link.</p>
          <Link href="/admin/products" className="mt-3 inline-block text-sm text-brand-300 hover:underline">
            Back to products
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-surface-800">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-surface-800 bg-surface-900/90 text-[11px] font-bold uppercase tracking-wide text-surface-400">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Brand</th>
                  <th className="hidden px-4 py-3 md:table-cell">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/80">
                {rows.map((p) => {
                  const brand = Array.isArray(p.brands) ? p.brands[0]?.name : p.brands?.name;
                  const category = Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name;
                  return (
                    <tr key={p.id} className="bg-surface-950/40 hover:bg-surface-900/60">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{p.name}</p>
                        {p.slug && (
                          <p className="mt-0.5 truncate text-[11px] text-surface-500">{p.slug}</p>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-surface-300 sm:table-cell">{brand || '—'}</td>
                      <td className="hidden px-4 py-3 text-surface-300 md:table-cell">{category || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            p.status === 'published'
                              ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300'
                              : 'rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300'
                          }
                        >
                          {p.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {p.slug && (
                            <Link
                              href={`/products/${p.slug}`}
                              className="rounded-lg border border-surface-700 px-2.5 py-1 text-[11px] font-semibold text-surface-300 hover:border-brand-500 hover:text-white"
                            >
                              View
                            </Link>
                          )}
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-500"
                          >
                            Add YouTube link
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

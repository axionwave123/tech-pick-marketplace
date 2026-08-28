import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminReviewsPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data } = await supabase
    .from('editorial_reviews')
    .select('id, title, rating, status, updated_at, products(name, slug)')
    .order('updated_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Editorial Reviews</h1>
        <span className="text-sm text-surface-400">Draft · Publish · Unpublish</span>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 text-surface-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {(data || []).map((r: any) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-white">{r.products?.name || r.title}</td>
                <td className="px-4 py-3">{r.rating ?? '—'}</td>
                <td className="px-4 py-3 capitalize text-surface-300">{r.status}</td>
                <td className="px-4 py-3 text-surface-500">
                  {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-surface-500">
        Community reviews are moderated separately under Moderation. Users cannot edit editorial reviews.
      </p>
    </div>
  );
}

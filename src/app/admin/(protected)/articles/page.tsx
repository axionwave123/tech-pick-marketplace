import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, title, status, article_type, featured_image_url, updated_at')
    .order('updated_at', { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500"
        >
          + Add article
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 text-surface-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {(data || []).map((a) => (
              <tr key={a.id} className="text-surface-200">
                <td className="px-4 py-3 font-medium text-white">{a.title}</td>
                <td className="px-4 py-3">{a.article_type || '—'}</td>
                <td className="px-4 py-3">{a.status}</td>
                <td className="px-4 py-3 text-surface-500">
                  {a.updated_at ? new Date(a.updated_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-surface-500">
                  No articles yet.{' '}
                  <Link href="/admin/articles/new" className="text-brand-400 underline">
                    Create one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

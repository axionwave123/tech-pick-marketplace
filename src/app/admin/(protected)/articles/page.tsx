import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DeleteArticleButton } from './DeleteArticleButton';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, title, status, article_type, featured_image_url, updated_at, slug')
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
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {(data || []).map((a) => (
              <tr key={a.id} className="text-surface-200">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {a.featured_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.featured_image_url}
                        alt=""
                        className="h-12 w-16 shrink-0 rounded-lg border border-surface-700 object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-surface-700 bg-surface-800 text-[10px] text-surface-500">
                        No img
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{a.title}</p>
                      {a.slug && (
                        <p className="truncate text-[11px] text-surface-500">/{a.slug}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{a.article_type || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      a.status === 'published'
                        ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400'
                        : a.status === 'draft'
                          ? 'rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-400'
                          : 'rounded-full bg-surface-700 px-2 py-0.5 text-[11px] font-bold text-surface-300'
                    }
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-surface-500">
                  {a.updated_at ? new Date(a.updated_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {a.slug && a.status === 'published' && (
                      <Link
                        href={`/articles/${a.slug}`}
                        className="rounded-lg border border-surface-700 px-2.5 py-1 text-[11px] font-bold text-surface-300 hover:border-brand-500 hover:text-white"
                      >
                        View
                      </Link>
                    )}
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-500"
                    >
                      Edit
                    </Link>
                    <DeleteArticleButton id={a.id} title={a.title} />
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-surface-500">
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

import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { relativeTime } from '@/lib/utils';
import { DeleteProductButton } from '../products/DeleteProductButton';

export const dynamic = 'force-dynamic';

export default async function AdminDraftsPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data: drafts } = await supabase
    .from('products')
    .select(
      `id, name, slug, updated_at, created_at,
       categories ( name ),
       product_images ( id, url, is_primary ),
       product_offers ( id, price )`
    )
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Draft products</h1>
          <p className="mt-1 max-w-xl text-sm text-surface-400">
            Drafts are not on the public site. Edit, publish, or delete ones you no longer need.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/research"
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-bold text-white hover:bg-brand-500"
          >
            AI Research
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-surface-800 px-3 py-2 text-sm font-bold text-white hover:bg-surface-700"
          >
            + Add product
          </Link>
        </div>
      </div>

      <p className="mt-5 text-sm text-surface-400">
        {(drafts || []).length} draft{(drafts || []).length === 1 ? '' : 's'}
      </p>

      {/* Mobile cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {(drafts || []).map((p: any) => {
          const img =
            (p.product_images || []).find((i: any) => i.is_primary)?.url ||
            p.product_images?.[0]?.url;
          return (
            <div key={p.id} className="rounded-xl border border-surface-800 bg-surface-900 p-4">
              <div className="flex gap-3">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover bg-surface-800" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-800 text-xs text-surface-500">
                    No img
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-surface-500">{p.categories?.name || 'No category'}</p>
                  <p className="text-xs text-surface-500">Updated {relativeTime(p.updated_at)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white"
                >
                  Edit
                </Link>
                <DeleteProductButton productId={p.id} productName={p.name} />
              </div>
            </div>
          );
        })}
        {(!drafts || drafts.length === 0) && (
          <p className="py-10 text-center text-surface-500">No drafts. Use AI Research or Add product.</p>
        )}
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-x-auto rounded-xl border border-surface-800 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 text-surface-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {(drafts || []).map((p: any) => {
              const hasImg = (p.product_images || []).length > 0;
              return (
                <tr key={p.id} className="hover:bg-surface-900/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-white hover:text-brand-400">
                      {p.name}
                    </Link>
                    <p className="text-xs text-surface-500">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-surface-400">{p.categories?.name || '—'}</td>
                  <td className="px-4 py-3 text-surface-300">{hasImg ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-surface-500">{relativeTime(p.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-500"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton productId={p.id} productName={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!drafts || drafts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-surface-500">
                  No drafts right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

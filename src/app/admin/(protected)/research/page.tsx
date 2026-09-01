import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ResearchForm } from './ResearchForm';

export default async function AIResearchPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data: drafts } = await supabase
    .from('products')
    .select('id, name, slug, status, created_at, brands(name), categories(name)')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(15);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">AI Research</h1>
      <p className="mt-2 max-w-2xl text-sm text-surface-400">
        Pipeline: product name → draft in database → you add image & price → approve / publish. Never
        auto-publishes to the public site.
      </p>

      <ResearchForm />

      <div className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Recent drafts</h2>
          <Link href="/admin/needs-update" className="text-sm font-semibold text-brand-400 hover:underline">
            All items needing update →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-900 text-surface-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {(drafts || []).map((p: any) => (
                <tr key={p.id} className="hover:bg-surface-900/50">
                  <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-3 text-surface-400">{p.brands?.name || '—'}</td>
                  <td className="px-4 py-3 text-surface-400">{p.categories?.name || '—'}</td>
                  <td className="px-4 py-3 text-surface-500">
                    {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
              {(!drafts || drafts.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-surface-500">
                    No drafts yet. Run research above to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

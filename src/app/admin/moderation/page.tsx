import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ModerationPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data } = await supabase
    .from('user_reviews')
    .select('id, rating, title, body, status, created_at, products(name)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Community Moderation</h1>
      <p className="mt-2 text-sm text-surface-400">Approve, reject, flag, or remove community reviews and comments.</p>
      <div className="mt-6 space-y-3">
        {(data || []).length === 0 && (
          <p className="text-sm text-surface-500">No community reviews yet.</p>
        )}
        {(data || []).map((r: any) => (
          <div key={r.id} className="rounded-xl border border-surface-800 bg-surface-900 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-white">{r.products?.name}</p>
              <span className="text-xs capitalize text-surface-400">{r.status}</span>
            </div>
            <p className="mt-1 text-sm text-surface-300">{r.title || r.body || '—'}</p>
            <p className="mt-2 text-xs text-surface-500">Rating: {r.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

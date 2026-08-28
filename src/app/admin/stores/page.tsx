import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminStoresPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const { data: stores } = await supabase.from('stores').select('*').order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Stores & Affiliate Programs</h1>
      <p className="mt-2 text-sm text-surface-400">
        Multi-store ready. Tracking configuration is per program — not one URL format for all partners.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(stores || []).map((s) => (
          <div key={s.id} className="rounded-xl border border-surface-800 bg-surface-900 p-5">
            <h2 className="font-semibold text-white">{s.name}</h2>
            <p className="mt-1 text-xs text-surface-500">{s.slug}</p>
            <p className="mt-2 text-sm capitalize text-surface-300">{s.status}</p>
            {s.website_url && (
              <a href={s.website_url} className="mt-2 block text-xs text-brand-400 hover:underline" target="_blank" rel="noreferrer">
                Website
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

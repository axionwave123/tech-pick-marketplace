import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();

  const [
    products,
    articles,
    editorial,
    comments,
    stores,
    offers,
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('editorial_reviews').select('id', { count: 'exact', head: true }),
    supabase.from('user_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('stores').select('id', { count: 'exact', head: true }),
    supabase.from('product_offers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  const stats = [
    { label: 'Products', value: products.count ?? 0 },
    { label: 'Articles', value: articles.count ?? 0 },
    { label: 'Editorial reviews', value: editorial.count ?? 0 },
    { label: 'Pending community', value: comments.count ?? 0 },
    { label: 'Stores', value: stores.count ?? 0 },
    { label: 'Active offers', value: offers.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-surface-400">Welcome back, Admin</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-surface-800 bg-surface-900 p-5">
            <p className="text-sm text-surface-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-surface-800 bg-surface-900 p-5">
        <h2 className="font-semibold text-white">System notes</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-surface-400">
          <li>AI research never auto-publishes — approve in AI Research.</li>
          <li>Affiliate click analytics can be fed via analytics_events.</li>
          <li>Offers needing updates: filter by last_checked_at in Offers.</li>
        </ul>
      </div>
    </div>
  );
}

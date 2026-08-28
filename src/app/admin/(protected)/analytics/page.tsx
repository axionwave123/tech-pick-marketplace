import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export default async function AnalyticsPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <p className="mt-2 text-sm text-surface-400">
        Events: page_view, product_view, search, affiliate_click, store_click via analytics_events.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['Page views', 'Product views', 'Searches', 'Affiliate clicks'].map((label) => (
          <div key={label} className="rounded-xl border border-surface-800 bg-surface-900 p-5">
            <p className="text-sm text-surface-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}

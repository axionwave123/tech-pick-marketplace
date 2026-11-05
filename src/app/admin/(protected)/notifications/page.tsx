import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { getAdminAlerts } from '@/lib/admin/alerts';
import { EnableBrowserNotifications } from './EnableBrowserNotifications';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Notifications · Admin' };

export default async function AdminNotificationsPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const { total, high, alerts } = await getAdminAlerts();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Notifications</h1>
      <p className="mt-1 text-sm text-surface-400">
        Things that need your attention — drafts to publish, reports, reviews, and products marked for
        update.
      </p>

      <div className="mt-4">
        <EnableBrowserNotifications highPriority={high} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-surface-800 bg-surface-900 px-4 py-3">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-surface-500">Total open</p>
        </div>
        <div className="rounded-xl border border-surface-800 bg-surface-900 px-4 py-3">
          <p className="text-2xl font-bold text-red-400">{high}</p>
          <p className="text-xs text-surface-500">High priority</p>
        </div>
        <div className="rounded-xl border border-surface-800 bg-surface-900 px-4 py-3">
          <p className="text-2xl font-bold text-emerald-400">{alerts.length === 0 ? '✓' : alerts.length}</p>
          <p className="text-xs text-surface-500">{alerts.length === 0 ? 'All clear' : 'Alert groups'}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {alerts.length === 0 && (
          <li className="rounded-xl border border-surface-800 bg-surface-900 px-4 py-8 text-center text-surface-500">
            Nothing waiting. When drafts, reports, or reviews pile up, they show here.
          </li>
        )}
        {alerts.map((a) => (
          <li key={a.id}>
            <Link
              href={a.href}
              className="flex items-start justify-between gap-3 rounded-xl border border-surface-800 bg-surface-900 px-4 py-4 transition hover:border-brand-500/40"
            >
              <div>
                <p className="font-semibold text-white">{a.title}</p>
                <p className="mt-1 text-sm text-surface-400">{a.detail}</p>
                <p className="mt-2 text-xs font-semibold text-brand-400">Open →</p>
              </div>
              {a.count != null && (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-bold ${
                    a.severity === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {a.count}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-xl border border-dashed border-surface-700 px-4 py-4 text-sm text-surface-400">
        <p className="font-semibold text-surface-200">Publish drafts</p>
        <p className="mt-1">
          Go to{' '}
          <Link href="/admin/drafts" className="font-semibold text-brand-400 hover:underline">
            Drafts
          </Link>{' '}
          and press the green <strong className="text-emerald-400">Publish</strong> button on any product
          to put it on the public site.
        </p>
      </div>
    </div>
  );
}

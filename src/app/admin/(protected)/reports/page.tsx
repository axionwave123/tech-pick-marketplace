import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { updateReportStatus } from '@/app/actions/reports';
import Link from 'next/link';

export const metadata = { title: 'User reports' };
export const dynamic = 'force-dynamic';

const TYPE_LABEL: Record<string, string> = {
  problem: 'Problem',
  wrong_price: 'Wrong price',
  wrong_info: 'Wrong info',
  bug: 'Bug',
  suggestion: 'Suggestion',
  other: 'Other',
};

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  read: 'bg-sky-500/20 text-sky-300 ring-sky-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
};

async function loadReports() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

export default async function AdminReportsPage() {
  const reports = await loadReports();
  const newCount = reports.filter((r) => r.status === 'new').length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">User reports</h1>
          <p className="mt-1 text-sm text-surface-400">
            Problems and feedback submitted from the site Report button or Contact page.
          </p>
        </div>
        {newCount > 0 && (
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-bold text-amber-300 ring-1 ring-amber-500/40">
            {newCount} new
          </span>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-surface-700 bg-surface-900/50 p-10 text-center">
          <p className="font-semibold text-white">No reports yet</p>
          <p className="mt-2 text-sm text-surface-400">
            When users tap the floating Report button and send a message, it will show up here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-surface-700 bg-surface-900/80 p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${STATUS_STYLE[r.status] || STATUS_STYLE.new}`}
                  >
                    {r.status}
                  </span>
                  <span className="rounded-full bg-surface-800 px-2.5 py-0.5 text-xs font-semibold text-surface-200">
                    {TYPE_LABEL[r.report_type] || r.report_type}
                  </span>
                  <time className="text-xs text-surface-500" dateTime={r.created_at}>
                    {new Date(r.created_at).toLocaleString('en-NG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-surface-100">
                {r.message}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-400">
                {r.name && <span>Name: {r.name}</span>}
                {r.email && (
                  <span>
                    Email:{' '}
                    <a href={`mailto:${r.email}`} className="text-brand-400 hover:underline">
                      {r.email}
                    </a>
                  </span>
                )}
                {r.page_url && (
                  <span className="max-w-full truncate">
                    Page:{' '}
                    <a
                      href={r.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 hover:underline"
                    >
                      {r.page_url}
                    </a>
                  </span>
                )}
              </div>

              {r.admin_note && (
                <p className="mt-2 rounded-lg bg-surface-800/80 px-3 py-2 text-xs text-surface-300">
                  Note: {r.admin_note}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {r.status === 'new' && (
                  <form
                    action={async () => {
                      'use server';
                      await updateReportStatus(r.id, 'read');
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg bg-sky-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-500"
                    >
                      Mark read
                    </button>
                  </form>
                )}
                {r.status !== 'resolved' && (
                  <form
                    action={async () => {
                      'use server';
                      await updateReportStatus(r.id, 'resolved');
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      Mark resolved
                    </button>
                  </form>
                )}
                {r.status === 'resolved' && (
                  <form
                    action={async () => {
                      'use server';
                      await updateReportStatus(r.id, 'new');
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-bold text-surface-200 hover:bg-surface-600"
                    >
                      Reopen
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xs text-surface-500">
        <Link href="/admin/dashboard" className="hover:text-surface-300">
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}

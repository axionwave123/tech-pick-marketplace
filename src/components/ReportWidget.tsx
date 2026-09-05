'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { submitUserReport } from '@/app/actions/reports';

const TYPES = [
  { value: 'problem', label: 'Problem / issue' },
  { value: 'wrong_price', label: 'Wrong price' },
  { value: 'wrong_info', label: 'Wrong product info' },
  { value: 'bug', label: 'Website bug' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'other', label: 'Other' },
];

/**
 * Floating "Report" button + modal form — always visible on public pages.
 */
export function ReportWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setPageUrl(typeof window !== 'undefined' ? window.location.href : '');
  }, [open]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('page_url', pageUrl);
    startTransition(async () => {
      const res = await submitUserReport(fd);
      if (res.ok) {
        setDone(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error);
      }
    });
  }

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setDone(false);
          setError(null);
        }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-900/40 ring-2 ring-white/10 transition hover:bg-brand-500 active:scale-95 light:ring-slate-200"
        aria-label="Report a problem"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <span className="hidden sm:inline">Report</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-surface-700 bg-surface-900 shadow-2xl sm:rounded-2xl light:border-slate-200 light:bg-white"
          >
            <div className="flex items-center justify-between border-b border-surface-700 px-5 py-4 light:border-slate-200">
              <div>
                <h2 id="report-title" className="text-lg font-bold text-white light:text-slate-900">
                  Report a problem
                </h2>
                <p className="text-xs text-surface-400 light:text-slate-500">
                  Wrong price, broken link, bug — we will review it in admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-white light:hover:bg-slate-100 light:hover:text-slate-900"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {done ? (
              <div className="space-y-4 p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-white light:text-slate-900">Report sent</p>
                <p className="text-sm text-surface-400 light:text-slate-600">
                  Thank you. Our team can see it on the admin reports page.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-500"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3 p-5">
                <div>
                  <label className="block text-xs font-semibold text-surface-300 light:text-slate-700">
                    What is this about?
                  </label>
                  <select
                    name="report_type"
                    defaultValue="problem"
                    className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-950 px-3 py-2.5 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-300 light:text-slate-700">
                    Describe the problem <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="e.g. Price for Galaxy A17 on Jumia is wrong, or product image not loading..."
                    className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-950 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 light:text-slate-700">
                      Your name (optional)
                    </label>
                    <input
                      name="name"
                      type="text"
                      className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-950 px-3 py-2.5 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 light:text-slate-700">
                      Email (optional)
                    </label>
                    <input
                      name="email"
                      type="email"
                      className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-950 px-3 py-2.5 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
                    />
                  </div>
                </div>
                {error && (
                  <p className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300 light:bg-red-50 light:text-red-700">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-500 disabled:opacity-60"
                >
                  {pending ? 'Sending…' : 'Submit report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

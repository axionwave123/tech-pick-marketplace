'use client';

import { useState, useTransition } from 'react';
import { submitUserReport } from '@/app/actions/reports';

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    if (typeof window !== 'undefined') {
      fd.set('page_url', window.location.href);
    }
    if (!fd.get('report_type')) fd.set('report_type', 'problem');
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

  if (done) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-700/50 bg-emerald-950/30 p-6 text-center light:border-emerald-200 light:bg-emerald-50">
        <p className="font-bold text-emerald-300 light:text-emerald-800">Message sent</p>
        <p className="mt-1 text-sm text-surface-300 light:text-emerald-700">
          We received your report and can see it in the admin panel.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-sm font-semibold text-brand-400 hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-white light:text-slate-800">Name</label>
        <input
          className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-900 px-4 py-2.5 text-white light:border-slate-300 light:bg-white light:text-slate-900"
          name="name"
          type="text"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-white light:text-slate-800">Email</label>
        <input
          className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-900 px-4 py-2.5 text-white light:border-slate-300 light:bg-white light:text-slate-900"
          name="email"
          type="email"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-white light:text-slate-800">Type</label>
        <select
          name="report_type"
          defaultValue="problem"
          className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-900 px-4 py-2.5 text-white light:border-slate-300 light:bg-white light:text-slate-900"
        >
          <option value="problem">Problem / issue</option>
          <option value="wrong_price">Wrong price</option>
          <option value="wrong_info">Wrong product info</option>
          <option value="bug">Website bug</option>
          <option value="suggestion">Suggestion</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-white light:text-slate-800">Message</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-surface-600 bg-surface-900 px-4 py-2.5 text-white light:border-slate-300 light:bg-white light:text-slate-900"
          name="message"
          rows={5}
          required
          placeholder="Describe the problem..."
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300 light:bg-red-50 light:text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white hover:bg-brand-500 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send report'}
      </button>
    </form>
  );
}

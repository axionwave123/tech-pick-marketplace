'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { runResearch, type ResearchState } from './actions';

export function ResearchForm() {
  const [state, setState] = useState<ResearchState>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await runResearch({}, fd);
      setState(result);
      if (result.success) {
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-surface-800 bg-surface-900 p-6">
      <p className="text-sm text-surface-400">
        Type a product name. We search the web (Wikipedia + search results) for{' '}
        <strong className="text-surface-200">images, ₦ prices, Jumia links, and specs</strong>, then save a{' '}
        <strong className="text-surface-200">draft</strong> only — never auto-published. Review under{' '}
        <strong className="text-surface-200">Needs update</strong> or Product list, then publish.
      </p>
      <p className="mt-2 text-xs text-surface-500">
        Tip: use a clear model name (e.g. “Infinix Hot 60i” or “Samsung Galaxy A26 8GB”). Research can take
        5–15 seconds.
      </p>

      {state.error && (
        <p className="mt-4 rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <div className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
          <p>{state.success}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {state.productId && (
              <Link
                href={`/admin/products/${state.productId}`}
                className="font-semibold text-brand-300 hover:underline"
              >
                Edit draft →
              </Link>
            )}
            <Link href="/admin/needs-update" className="font-semibold text-brand-300 hover:underline">
              Needs update →
            </Link>
            <Link href="/admin/products" className="font-semibold text-brand-300 hover:underline">
              Product list →
            </Link>
          </div>
        </div>
      )}

      <label className="mt-4 block text-sm text-surface-300">
        Product name to research *
        <input
          name="name"
          required
          className="mt-1 w-full max-w-md rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          placeholder="Samsung Galaxy A26"
        />
      </label>

      <label className="mt-4 block text-sm text-surface-300">
        Optional notes (what to check)
        <textarea
          name="notes"
          rows={2}
          className="mt-1 w-full max-w-md rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          placeholder="Focus on 8GB / 256GB variant…"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
      >
        {pending ? 'Searching web + creating draft…' : 'Run research → create draft'}
      </button>
    </form>
  );
}

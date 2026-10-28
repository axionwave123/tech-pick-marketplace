'use client';

import { useState, useTransition } from 'react';
import { Upload, FileCode2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { importJumiaXmlAction, type ImportSummary } from './actions';

export function ImportClient() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [fileName, setFileName] = useState<string>('');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setResult(null);
    startTransition(async () => {
      const res = await importJumiaXmlAction(fd);
      setResult(res);
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md light:border-slate-200 light:bg-white"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400">
            <FileCode2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white light:text-slate-900">
              Jumia XML import assistant
            </h2>
            <p className="mt-1 text-sm text-surface-300 light:text-slate-600">
              Upload your Jumia product XML. We create or update products, set the image, and attach
              a Jumia store price + link. New products default to <strong>draft</strong> so you can
              review before publishing.
            </p>
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-10 transition hover:border-brand-500/50 hover:bg-brand-500/5 light:border-slate-300 light:bg-slate-50">
          <Upload className="mb-2 h-8 w-8 text-brand-400" />
          <span className="text-sm font-semibold text-white light:text-slate-800">
            {fileName || 'Choose Jumia XML file'}
          </span>
          <span className="mt-1 text-xs text-surface-400 light:text-slate-500">
            .xml · max 12 MB · up to 300 products per run
          </span>
          <input
            type="file"
            name="xml_file"
            accept=".xml,text/xml,application/xml"
            required
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-surface-200 light:text-slate-700">
              New product status
            </span>
            <select
              name="status"
              defaultValue="draft"
              className="w-full rounded-lg border border-white/15 bg-surface-900 px-3 py-2 text-sm text-white light:border-slate-200 light:bg-white light:text-slate-900"
            >
              <option value="draft">Draft (recommended)</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-surface-200 light:text-slate-700">
              Max products this run
            </span>
            <input
              type="number"
              name="max_items"
              min={1}
              max={300}
              defaultValue={100}
              className="w-full rounded-lg border border-white/15 bg-surface-900 px-3 py-2 text-sm text-white light:border-slate-200 light:bg-white light:text-slate-900"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Run import
            </>
          )}
        </button>
      </form>

      {result?.error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 light:text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {result.error}
        </div>
      )}

      {result && !result.error && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: 'In file', value: result.totalParsed ?? 0 },
              { label: 'Created', value: result.created ?? 0 },
              { label: 'Updated', value: result.updated ?? 0 },
              { label: 'Skipped', value: result.skipped ?? 0 },
              { label: 'Errors', value: result.errors ?? 0 },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center light:border-slate-200 light:bg-white"
              >
                <div className="text-xl font-bold text-white light:text-slate-900">{s.value}</div>
                <div className="text-xs text-surface-400 light:text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-emerald-300 light:text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Import finished. Review drafts under Admin → Drafts, prices under See prices.
          </div>

          {result.rows && result.rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10 light:border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-surface-400 light:bg-slate-50 light:text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 light:divide-slate-100">
                  {result.rows.map((r, i) => (
                    <tr key={`${r.name}-${i}`} className="text-surface-100 light:text-slate-800">
                      <td className="max-w-[220px] truncate px-3 py-2 font-medium">{r.name}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            r.action === 'created'
                              ? 'text-emerald-400'
                              : r.action === 'updated'
                                ? 'text-sky-400'
                                : r.action === 'error'
                                  ? 'text-red-400'
                                  : 'text-surface-400'
                          }
                        >
                          {r.action}
                        </span>
                      </td>
                      <td className="max-w-[280px] truncate px-3 py-2 text-surface-400 light:text-slate-500">
                        {r.detail || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

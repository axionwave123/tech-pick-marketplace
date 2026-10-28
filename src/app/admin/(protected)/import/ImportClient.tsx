'use client';

import { useState, useTransition } from 'react';
import { Upload, FileCode2, Loader2, CheckCircle2, AlertCircle, Store } from 'lucide-react';
import { importJumiaXmlAction, type ImportSummary } from './actions';
import { importStoreFeedAction } from './storeFeedActions';

type Tab = 'jumia' | 'stores';

export function ImportClient() {
  const [tab, setTab] = useState<Tab>('jumia');
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [fileName, setFileName] = useState('');

  function run(action: (fd: FormData) => Promise<ImportSummary>, form: HTMLFormElement) {
    const fd = new FormData(form);
    setResult(null);
    startTransition(async () => {
      const res = await action(fd);
      setResult(res);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 light:border-slate-200 light:bg-slate-100">
        <button
          type="button"
          onClick={() => {
            setTab('jumia');
            setResult(null);
            setFileName('');
          }}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${
            tab === 'jumia'
              ? 'bg-brand-600 text-white shadow'
              : 'text-surface-300 hover:text-white light:text-slate-600 light:hover:text-slate-900'
          }`}
        >
          Phase 1 · Jumia XML
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('stores');
            setResult(null);
            setFileName('');
          }}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${
            tab === 'stores'
              ? 'bg-brand-600 text-white shadow'
              : 'text-surface-300 hover:text-white light:text-slate-600 light:hover:text-slate-900'
          }`}
        >
          Phase 2 · Amazon / Temu
        </button>
      </div>

      {tab === 'jumia' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(importJumiaXmlAction, e.currentTarget);
          }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md light:border-slate-200 light:bg-white"
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white light:text-slate-900">
                Jumia XML → create products
              </h2>
              <p className="mt-1 text-sm text-surface-300 light:text-slate-600">
                Creates or updates products, images, and Jumia prices. New items default to{' '}
                <strong>draft</strong>.
              </p>
            </div>
          </div>

          <FileDrop
            fileName={fileName}
            setFileName={setFileName}
            name="xml_file"
            accept=".xml,text/xml,application/xml"
          />

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

          <SubmitButton pending={pending} label="Run Jumia import" />
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(importStoreFeedAction, e.currentTarget);
          }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md light:border-slate-200 light:bg-white"
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white light:text-slate-900">
                Amazon / Temu / Konga → match and attach prices
              </h2>
              <p className="mt-1 text-sm text-surface-300 light:text-slate-600">
                Upload a CSV (or XML) with <strong>name</strong>, <strong>price</strong>, and ideally{' '}
                <strong>url</strong>. We fuzzy-match names to products already in the catalog and add
                that store offer. <strong>No new products</strong> are created.
              </p>
            </div>
          </div>

          <label className="mb-4 block text-sm">
            <span className="mb-1 block font-medium text-surface-200 light:text-slate-700">Store</span>
            <select
              name="store"
              defaultValue="amazon"
              required
              className="w-full rounded-lg border border-white/15 bg-surface-900 px-3 py-2 text-sm text-white light:border-slate-200 light:bg-white light:text-slate-900"
            >
              <option value="amazon">Amazon</option>
              <option value="temu">Temu</option>
              <option value="konga">Konga</option>
            </select>
          </label>

          <FileDrop
            fileName={fileName}
            setFileName={setFileName}
            name="feed_file"
            accept=".csv,.tsv,.txt,.xml,text/csv,text/xml,application/xml"
            hint=".csv / .tsv / .xml · headers like name, price, url"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-surface-200 light:text-slate-700">
                Min name match %
              </span>
              <select
                name="min_score"
                defaultValue="0.62"
                className="w-full rounded-lg border border-white/15 bg-surface-900 px-3 py-2 text-sm text-white light:border-slate-200 light:bg-white light:text-slate-900"
              >
                <option value="0.55">55% (looser)</option>
                <option value="0.62">62% (recommended)</option>
                <option value="0.72">72% (stricter)</option>
                <option value="0.85">85% (very strict)</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-surface-200 light:text-slate-700">
                Max rows this run
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

          <SubmitButton pending={pending} label="Match and attach store prices" />
        </form>
      )}

      {result?.error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 light:text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {result.error}
        </div>
      )}

      {result && !result.error && <ResultPanel result={result} phase={tab} />}
    </div>
  );
}

function FileDrop({
  fileName,
  setFileName,
  name,
  accept,
  hint,
}: {
  fileName: string;
  setFileName: (s: string) => void;
  name: string;
  accept: string;
  hint?: string;
}) {
  return (
    <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-10 transition hover:border-brand-500/50 hover:bg-brand-500/5 light:border-slate-300 light:bg-slate-50">
      <Upload className="mb-2 h-8 w-8 text-brand-400" />
      <span className="text-sm font-semibold text-white light:text-slate-800">
        {fileName || 'Choose file'}
      </span>
      <span className="mt-1 text-xs text-surface-400 light:text-slate-500">
        {hint || '.xml · max 12 MB · up to 300 products per run'}
      </span>
      <input
        type="file"
        name={name}
        accept={accept}
        required
        className="sr-only"
        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
      />
    </label>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Working…
        </>
      ) : (
        <>
          <Upload className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}

function ResultPanel({ result, phase }: { result: ImportSummary; phase: Tab }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'In file', value: result.totalParsed ?? 0 },
          {
            label: phase === 'jumia' ? 'Created' : 'Matched',
            value: phase === 'jumia' ? (result.created ?? 0) : (result.updated ?? 0),
          },
          { label: phase === 'jumia' ? 'Updated' : 'Offers set', value: result.updated ?? 0 },
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
        {phase === 'jumia'
          ? 'Import finished. Review drafts and See prices.'
          : 'Matching finished. Check See prices for Amazon / Temu / Konga offers.'}
      </div>

      {result.rows && result.rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10 light:border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-surface-400 light:bg-slate-50 light:text-slate-500">
              <tr>
                <th className="px-3 py-2">Feed name</th>
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
                  <td className="max-w-[320px] truncate px-3 py-2 text-surface-400 light:text-slate-500">
                    {r.detail || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

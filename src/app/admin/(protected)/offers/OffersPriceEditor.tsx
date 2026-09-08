'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { updateOfferPrices, type UpdateOfferPriceState } from './actions';
import { formatNaira } from '@/lib/utils';

export type EditorOffer = {
  id: string;
  price: number;
  original_price: number | null;
  availability: string | null;
  last_checked_at: string | null;
  product_url: string | null;
  store_id: string;
  store_name: string;
  store_logo: string | null;
};

export type EditorProduct = {
  id: string;
  name: string;
  slug: string;
  status: string;
  offers: EditorOffer[];
};

type Draft = { price: string; original_price: string };

function relativeShort(iso: string | null) {
  if (!iso) return 'never';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function OffersPriceEditor({ products }: { products: EditorProduct[] }) {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [q, setQ] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [message, setMessage] = useState<UpdateOfferPriceState>({});
  const [pending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === 'published' && p.status !== 'published') return false;
      if (filter === 'draft' && p.status !== 'draft') return false;
      if (term && !p.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [products, filter, q]);

  function getDraft(o: EditorOffer): Draft {
    return (
      drafts[o.id] || {
        price: String(o.price ?? ''),
        original_price: o.original_price != null ? String(o.original_price) : '',
      }
    );
  }

  function setField(id: string, field: keyof Draft, value: string, base: EditorOffer) {
    setDrafts((prev) => {
      const cur = prev[id] || {
        price: String(base.price ?? ''),
        original_price: base.original_price != null ? String(base.original_price) : '',
      };
      return { ...prev, [id]: { ...cur, [field]: value } };
    });
  }

  function isDirty(o: EditorOffer) {
    const d = drafts[o.id];
    if (!d) return false;
    const orig = o.original_price != null ? String(o.original_price) : '';
    return String(o.price) !== d.price.trim() || orig !== d.original_price.trim();
  }

  function saveOffers(list: EditorOffer[], productId?: string) {
    const payload = list.map((o) => {
      const d = getDraft(o);
      return {
        id: o.id,
        price: Number(d.price),
        original_price: d.original_price.trim() === '' ? null : Number(d.original_price),
      };
    });
    const fd = new FormData();
    fd.set('offers_json', JSON.stringify(payload));
    setMessage({});
    if (productId) setSavingId(productId);
    startTransition(async () => {
      const res = await updateOfferPrices({}, fd);
      setMessage(res);
      if (res.success) {
        setDrafts((prev) => {
          const next = { ...prev };
          for (const o of list) delete next[o.id];
          return next;
        });
      }
      setSavingId(null);
    });
  }

  const tabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'published' as const, label: 'Published' },
    { id: 'draft' as const, label: 'Needs update / drafts' },
  ];

  return (
    <div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={
                filter === t.id
                  ? 'rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white'
                  : 'rounded-full border border-surface-700 bg-surface-900 px-3.5 py-1.5 text-xs font-semibold text-surface-300 hover:border-brand-500 hover:text-white'
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search product…"
          className="w-full rounded-xl border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none sm:w-64"
        />
      </div>

      {(message.success || message.error) && (
        <p
          className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-medium ${
            message.success
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {message.success || message.error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-surface-700 bg-surface-900/50 px-6 py-16 text-center text-sm text-surface-400">
          No products with store prices in this filter.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {filtered.map((p) => {
            const dirty = p.offers.filter(isDirty);
            const lowest = [...p.offers].sort((a, b) => a.price - b.price)[0]?.price;
            const saving = pending && savingId === p.id;
            return (
              <div key={p.id} className="overflow-hidden rounded-xl border border-surface-800 bg-surface-900/40">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-500/25 bg-gradient-to-r from-brand-600/25 via-surface-900 to-surface-900 px-4 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-extrabold leading-snug tracking-tight text-white sm:text-lg">
                        {p.name}
                      </h2>
                      <span
                        className={
                          p.status === 'published'
                            ? 'shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30'
                            : 'shrink-0 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 ring-1 ring-amber-400/30'
                        }
                      >
                        {p.status === 'published' ? 'Published' : 'Needs update'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-surface-300">
                      {p.offers.length} store{p.offers.length === 1 ? '' : 's'}
                      {lowest != null && (
                        <>
                          {' '}
                          · best{' '}
                          <span className="font-bold text-emerald-400">{formatNaira(lowest)}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {p.slug && (
                      <>
                        <Link href={`/products/${p.slug}`} className="rounded-lg border border-surface-700 px-2.5 py-1 text-[11px] font-semibold text-surface-300 hover:border-brand-500 hover:text-white">
                          View
                        </Link>
                        <Link href={`/admin/products/${p.id}`} className="rounded-lg border border-surface-700 px-2.5 py-1 text-[11px] font-semibold text-surface-300 hover:border-brand-500 hover:text-white">
                          Edit product
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={dirty.length === 0 || pending}
                      onClick={() => saveOffers(dirty, p.id)}
                      className="rounded-lg bg-brand-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving ? 'Saving…' : dirty.length ? `Save ${dirty.length}` : 'Saved'}
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-surface-800/80">
                  {p.offers.map((o) => {
                    const d = getDraft(o);
                    const dirtyRow = isDirty(o);
                    return (
                      <div
                        key={o.id}
                        className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-end sm:justify-between ${dirtyRow ? 'bg-brand-500/5' : ''}`}
                      >
                        <div className="min-w-0 sm:w-48">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-white/20">
                              {o.store_logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={o.store_logo}
                                  alt=""
                                  width={28}
                                  height={28}
                                  className="h-full w-full object-contain p-0.5"
                                />
                              ) : (
                                <span className="text-[11px] font-bold text-surface-800">
                                  {(o.store_name || '?').charAt(0)}
                                </span>
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white">{o.store_name}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`price-${o.id}`) as HTMLInputElement | null;
                                  el?.focus();
                                  el?.select();
                                }}
                                className="mt-0.5 text-[11px] font-bold text-brand-300 hover:text-brand-200 hover:underline"
                              >
                                Edit store price
                              </button>
                            </div>
                          </div>
                          <p className="mt-1 text-[11px] text-surface-500">Checked {relativeShort(o.last_checked_at)}</p>
                          {o.product_url && (
                            <a href={o.product_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block truncate text-[11px] font-medium text-brand-300 hover:underline">
                              Open store link
                            </a>
                          )}
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-2 sm:max-w-md">
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-surface-500">Current ₦</span>
                            <input
                              id={`price-${o.id}`}
                              type="number"
                              min="1"
                              step="1"
                              value={d.price}
                              onChange={(e) => setField(o.id, 'price', e.target.value, o)}
                              className="w-full rounded-lg border border-surface-700 bg-surface-950 px-2.5 py-2 text-sm font-semibold text-white focus:border-brand-500 focus:outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-surface-500">Original ₦</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={d.original_price}
                              onChange={(e) => setField(o.id, 'original_price', e.target.value, o)}
                              placeholder="optional"
                              className="w-full rounded-lg border border-surface-700 bg-surface-950 px-2.5 py-2 text-sm text-white placeholder:text-surface-600 focus:border-brand-500 focus:outline-none"
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          disabled={!dirtyRow || pending}
                          onClick={() => saveOffers([o], p.id)}
                          className="shrink-0 rounded-lg border border-brand-500/40 bg-brand-600/20 px-3 py-2 text-xs font-bold text-brand-200 hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Save price
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

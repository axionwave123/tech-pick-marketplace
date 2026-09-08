'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { updateOfferPrices, type UpdateOfferPriceState } from './actions';
import { formatNaira, fuzzyMatches } from '@/lib/utils';

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
  brand: string | null;
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

function bestPrice(p: EditorProduct) {
  if (!p.offers.length) return null;
  return Math.min(...p.offers.map((o) => o.price));
}

export function OffersPriceEditor({ products }: { products: EditorProduct[] }) {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [message, setMessage] = useState<UpdateOfferPriceState>({});
  const [pending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);

  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.brand?.trim()) set.add(p.brand.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'en'));
  }, [products]);

  const filtered = useMemo(() => {
    const min = minPrice.trim() === '' ? null : Number(minPrice);
    const max = maxPrice.trim() === '' ? null : Number(maxPrice);
    return products.filter((p) => {
      if (filter === 'published' && p.status !== 'published') return false;
      if (filter === 'draft' && p.status !== 'draft') return false;
      if (brand && (p.brand || '') !== brand) return false;
      if (q.trim() && !fuzzyMatches(`${p.name} ${p.brand || ''}`, q)) return false;
      const best = bestPrice(p);
      if (min != null && !Number.isNaN(min) && (best == null || best < min)) return false;
      if (max != null && !Number.isNaN(max) && (best == null || best > max)) return false;
      return true;
    });
  }, [products, filter, q, brand, minPrice, maxPrice]);

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

  const hasExtraFilters = Boolean(brand || minPrice || maxPrice);

  return (
    <div>
      <div className="mt-5 flex flex-col gap-3">
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

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search (typos ok) e.g. Samung, Elitebok…"
            className="w-full rounded-xl border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none sm:min-w-[220px] sm:flex-1"
          />
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min ₦"
              className="w-24 rounded-xl border border-surface-700 bg-surface-950 px-2.5 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
            />
            <span className="text-xs text-surface-500">–</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max ₦"
              className="w-24 rounded-xl border border-surface-700 bg-surface-950 px-2.5 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
          {(q || hasExtraFilters) && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                setBrand('');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="text-xs font-semibold text-surface-400 hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>
        <p className="text-[11px] text-surface-500">
          {filtered.length} product{filtered.length === 1 ? '' : 's'}
          {q ? ' · fuzzy search on' : ''}
        </p>
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
          No products match these filters.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {filtered.map((p) => {
            const dirty = p.offers.filter(isDirty);
            const lowest = bestPrice(p);
            const saving = pending && savingId === p.id;
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#000000]">
                {/* Product header — pure black bg, pure white name (matches screenshot) */}
                <div className="border-b border-white/10 bg-[#000000] px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className="text-[15px] font-bold leading-snug tracking-tight text-[#ffffff]"
                      title={p.name}
                    >
                      {p.name}
                    </h2>
                    <span
                      className={
                        p.status === 'published'
                          ? 'shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400'
                          : 'shrink-0 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300'
                      }
                    >
                      {p.status === 'published' ? 'Published' : 'Needs update'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-400">
                    {p.offers.length} store{p.offers.length === 1 ? '' : 's'}
                    {lowest != null && (
                      <>
                        {' '}
                        · best <span className="font-semibold text-emerald-400">{formatNaira(lowest)}</span>
                      </>
                    )}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.slug && (
                      <>
                        <Link
                          href={`/products/${p.slug}`}
                          className="rounded-full border border-zinc-600 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-400 hover:text-white"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="rounded-full border border-zinc-600 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-400 hover:text-white"
                        >
                          Edit product
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={dirty.length === 0 || pending}
                      onClick={() => saveOffers(dirty, p.id)}
                      className="rounded-full bg-[#1e3a8a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : dirty.length ? `Save ${dirty.length}` : 'Saved'}
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-white/5 bg-[#0a0a0a]">
                  {p.offers.map((o) => {
                    const d = getDraft(o);
                    const dirtyRow = isDirty(o);
                    return (
                      <div
                        key={o.id}
                        className={`flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-end sm:justify-between ${
                          dirtyRow ? 'bg-brand-500/5' : ''
                        }`}
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
                          <p className="mt-1 text-[11px] text-surface-500">
                            Checked {relativeShort(o.last_checked_at)}
                          </p>
                          {o.product_url && (
                            <a
                              href={o.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block truncate text-[11px] font-medium text-brand-300 hover:underline"
                            >
                              Open store link
                            </a>
                          )}
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-2 sm:max-w-md">
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-surface-500">
                              Current ₦
                            </span>
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
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-surface-500">
                              Original ₦
                            </span>
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

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export type ArticleCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  article_type: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  filter_category?: string | null;
  filter_price?: string | null;
  filter_need?: string | null;
};

const CATEGORIES = [
  { id: 'phone', label: 'Phone', keywords: ['phone', 'smartphone', 'mobile', 'iphone', 'android', 'galaxy', 'redmi', 'tecno', 'infinix', 'samsung'] },
  { id: 'laptop', label: 'Laptop', keywords: ['laptop', 'notebook', 'macbook', 'chromebook', 'ultrabook', 'pc'] },
  { id: 'audio', label: 'Audio', keywords: ['audio', 'headphone', 'earbud', 'earphone', 'speaker', 'headset', 'buds'] },
  { id: 'others', label: 'Others', keywords: [] },
] as const;

const PRICES = [
  { id: 'under100', label: 'Under 100k', keywords: ['under 100', 'under n100', 'below 100', 'budget', '100,000', '100k'] },
  { id: '100to200', label: '100k - 200k', keywords: ['100k-200', '100k - 200', 'mid-range', '150,000', 'between 100', '200k'] },
  { id: '200to300', label: '200k - 300k', keywords: ['200k-300', '200k - 300', '250,000', '300,000'] },
  { id: 'over300', label: '300k+', keywords: ['300k', 'above 300', 'premium', 'flagship', 'over 300', '500,000'] },
] as const;

const NEEDS = [
  { id: 'gaming', label: 'Gaming', keywords: ['gaming', 'gamer', 'game', 'fps', 'pubg', 'cod'] },
  { id: 'content', label: 'Content creation', keywords: ['content', 'creator', 'camera', 'photo', 'video', 'vlog', 'youtube'] },
  { id: 'office', label: 'Office work', keywords: ['office', 'work', 'productivity', 'business', 'excel', 'docs'] },
  { id: 'students', label: 'Students', keywords: ['student', 'school', 'campus', 'study', 'college', 'uni'] },
] as const;

const typeLabels: Record<string, string> = {
  buying_guide: 'Buying guide',
  comparison: 'Comparison',
  how_to: 'How-to',
  tech_tips: 'Tips',
  news: 'News',
  other: 'Guide',
};

function textHaystack(a: ArticleCard) {
  return `${a.title} ${a.excerpt || ''} ${a.article_type || ''}`.toLowerCase();
}

function matchesKeywords(hay: string, keywords: readonly string[]) {
  if (!keywords.length) return true;
  return keywords.some((k) => hay.includes(k.toLowerCase()));
}

function matchesCategory(a: ArticleCard, selected: string) {
  if (a.filter_category) {
    if (selected === 'others') {
      return a.filter_category === 'others' || !['phone', 'laptop', 'audio'].includes(a.filter_category);
    }
    return a.filter_category === selected;
  }
  const cat = CATEGORIES.find((c) => c.id === selected);
  if (!cat) return true;
  const hay = textHaystack(a);
  if (cat.id === 'others') {
    const isKnown = CATEGORIES.filter((c) => c.id !== 'others').some((c) =>
      matchesKeywords(hay, c.keywords)
    );
    return !isKnown;
  }
  return matchesKeywords(hay, cat.keywords);
}

function matchesPrice(a: ArticleCard, selected: string) {
  if (a.filter_price) return a.filter_price === selected;
  const p = PRICES.find((x) => x.id === selected);
  if (!p) return true;
  return matchesKeywords(textHaystack(a), p.keywords);
}

function matchesNeed(a: ArticleCard, selected: string) {
  if (a.filter_need) return a.filter_need === selected;
  const n = NEEDS.find((x) => x.id === selected);
  if (!n) return true;
  return matchesKeywords(textHaystack(a), n.keywords);
}

export function ArticlesFilter({ articles }: { articles: ArticleCard[] }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [need, setNeed] = useState<string | null>(null);
  const [applied, setApplied] = useState<{
    category: string | null;
    price: string | null;
    need: string | null;
  }>({ category: null, price: null, need: null });

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (applied.category && !matchesCategory(a, applied.category)) return false;
      if (applied.price && !matchesPrice(a, applied.price)) return false;
      if (applied.need && !matchesNeed(a, applied.need)) return false;
      return true;
    });
  }, [articles, applied]);

  const hasSelection = category || price || need;
  const hasApplied = applied.category || applied.price || applied.need;

  function onSearch() {
    setApplied({ category, price, need });
    setOpen(false);
  }

  function onClear() {
    setCategory(null);
    setPrice(null);
    setNeed(null);
    setApplied({ category: null, price: null, need: null });
  }

  function toggle(group: 'category' | 'price' | 'need', id: string) {
    if (group === 'category') setCategory((c) => (c === id ? null : id));
    if (group === 'price') setPrice((p) => (p === id ? null : id));
    if (group === 'need') setNeed((n) => (n === id ? null : id));
  }

  const chip = (active: boolean, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'shrink-0 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm'
          : 'shrink-0 rounded-full border border-surface-600 bg-surface-900 px-3 py-1.5 text-xs font-semibold text-surface-200 hover:border-brand-500/50 hover:text-white light:border-slate-300 light:bg-white light:text-slate-700'
      }
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="mt-6 rounded-2xl border border-surface-700/80 bg-surface-900/80 light:border-slate-200 light:bg-white">
        <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-600 bg-surface-950 px-3 py-2 text-sm font-bold text-white light:border-slate-300 light:bg-slate-50 light:text-slate-900"
            aria-expanded={open}
          >
            Filter by
            <svg
              className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {hasApplied && (
            <div className="flex flex-wrap items-center gap-1.5">
              {applied.category && (
                <span className="rounded-full bg-brand-600/20 px-2.5 py-1 text-[11px] font-bold text-brand-300 light:text-brand-700">
                  {CATEGORIES.find((c) => c.id === applied.category)?.label}
                </span>
              )}
              {applied.price && (
                <span className="rounded-full bg-brand-600/20 px-2.5 py-1 text-[11px] font-bold text-brand-300 light:text-brand-700">
                  {PRICES.find((p) => p.id === applied.price)?.label}
                </span>
              )}
              {applied.need && (
                <span className="rounded-full bg-brand-600/20 px-2.5 py-1 text-[11px] font-bold text-brand-300 light:text-brand-700">
                  {NEEDS.find((n) => n.id === applied.need)?.label}
                </span>
              )}
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] font-semibold text-surface-400 underline hover:text-white light:hover:text-slate-800"
              >
                Clear
              </button>
            </div>
          )}

          <p className="ml-auto text-[11px] font-medium text-surface-500">
            {filtered.length} guide{filtered.length === 1 ? '' : 's'}
          </p>
        </div>

        {open && (
          <div className="border-t border-surface-800 px-3 pb-4 pt-3 light:border-slate-200 sm:px-4">
            <div className="max-h-[min(52vh,360px)] overflow-y-auto overscroll-contain pr-1">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-surface-500">Category</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap">
                    {CATEGORIES.map((c) => chip(category === c.id, c.label, () => toggle('category', c.id)))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-surface-500">Price</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap">
                    {PRICES.map((p) => chip(price === p.id, p.label, () => toggle('price', p.id)))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-surface-500">Need</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap">
                    {NEEDS.map((n) => chip(need === n.id, n.label, () => toggle('need', n.id)))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onSearch}
                disabled={!hasSelection && !hasApplied}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Search guides
              </button>
              <button
                type="button"
                onClick={onClear}
                className="rounded-xl border border-surface-600 px-4 py-2.5 text-sm font-semibold text-surface-300 hover:border-surface-500 hover:text-white light:border-slate-300 light:text-slate-600"
              >
                Reset
              </button>
              <p className="text-[11px] text-surface-500 sm:ml-2">Pick category, price or need then Search</p>
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-surface-600 bg-surface-900/50 px-6 py-12 text-center light:border-slate-300 light:bg-slate-50">
          <p className="text-sm font-medium text-surface-300 light:text-slate-600">No guides match these filters.</p>
          <button type="button" onClick={onClear} className="mt-3 text-sm font-bold text-brand-400 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:gap-6">
          {filtered.map((a) => {
            const label =
              typeLabels[a.article_type || 'other'] ||
              (a.article_type || 'Guide').replace(/_/g, ' ');
            return (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-surface-700/80 bg-surface-900/80 shadow-card transition hover:border-brand-500/40 hover:shadow-lg light:border-slate-200 light:bg-white light:shadow-sm sm:flex-row"
              >
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-surface-800 light:bg-slate-100 sm:aspect-auto sm:h-auto sm:w-44 md:w-56 lg:w-64">
                  {a.featured_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.featured_image_url}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:absolute sm:inset-0"
                    />
                  ) : (
                    <div className="flex h-full min-h-[140px] items-center justify-center text-surface-500 sm:absolute sm:inset-0">
                      <svg className="h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center p-4 sm:p-5 md:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400 light:text-brand-600">{label}</p>
                  <h2 className="mt-1 text-base font-bold leading-snug text-white light:text-slate-900 sm:text-lg">{a.title}</h2>
                  {a.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-surface-300 light:text-slate-600">{a.excerpt}</p>
                  )}
                  <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white transition group-hover:bg-brand-500">
                    Read Guide <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

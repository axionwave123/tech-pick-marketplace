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
  { id: 'under100', label: 'Under 100k', keywords: ['under 100', 'under N100', 'below 100', 'budget', '100,000', '100k'] },
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

const categoryLabels: Record<string, string> = {
  phone: 'Phone',
  laptop: 'Laptop',
  audio: 'Audio',
  others: 'Others',
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

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
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
  const featured = !hasApplied && filtered.length > 0 ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;

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
          ? 'shrink-0 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm ring-2 ring-brand-400/40'
          : 'shrink-0 rounded-full border border-surface-600/80 bg-surface-950/80 px-3.5 py-1.5 text-xs font-semibold text-surface-200 transition hover:border-brand-500/50 hover:text-white light:border-slate-300 light:bg-white light:text-slate-700 light:hover:border-brand-400'
      }
    >
      {label}
    </button>
  );

  function Card({ a, large }: { a: ArticleCard; large?: boolean }) {
    const label =
      typeLabels[a.article_type || 'other'] ||
      (a.article_type || 'Guide').replace(/_/g, ' ');
    const date = formatDate(a.published_at);
    const cat = a.filter_category ? categoryLabels[a.filter_category] : null;

    if (large) {
      return (
        <Link
          href={`/articles/${a.slug}`}
          className="group relative grid overflow-hidden rounded-3xl border border-surface-700/70 bg-surface-900/90 shadow-card transition duration-300 hover:border-brand-500/40 hover:shadow-card-hover light:border-slate-200 light:bg-white light:shadow-sm lg:grid-cols-2"
        >
          <div className="relative aspect-[16/11] overflow-hidden bg-surface-800 light:bg-slate-100 lg:aspect-auto lg:min-h-[320px]">
            {a.featured_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.featured_image_url}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center bg-gradient-to-br from-brand-900/40 to-surface-900">
                <span className="text-sm font-semibold text-surface-400">Featured guide</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950/70 via-transparent to-transparent lg:hidden" />
            <span className="absolute left-4 top-4 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
              Latest
            </span>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 light:text-brand-600">
                {label}
              </span>
              {cat && (
                <span className="rounded-full bg-surface-800 px-2 py-0.5 text-[10px] font-semibold text-surface-300 light:bg-slate-100 light:text-slate-600">
                  {cat}
                </span>
              )}
              {date && (
                <span className="text-[11px] text-surface-500 light:text-slate-500">{date}</span>
              )}
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold leading-snug text-white transition group-hover:text-brand-300 light:text-slate-900 light:group-hover:text-brand-700 sm:text-3xl">
              {a.title}
            </h2>
            {a.excerpt && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-surface-300 light:text-slate-600 sm:text-base">
                {a.excerpt}
              </p>
            )}
            <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition group-hover:bg-brand-500 group-hover:shadow-neon">
              Read guide
              <svg className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>
        </Link>
      );
    }

    return (
      <Link
        href={`/articles/${a.slug}`}
        className="group flex flex-col overflow-hidden rounded-2xl border border-surface-700/70 bg-surface-900/80 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-card-hover light:border-slate-200 light:bg-white light:shadow-sm"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-800 light:bg-slate-100">
          {a.featured_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.featured_image_url}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900">
              <svg className="h-10 w-10 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface-950/50 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 light:text-brand-600">
              {label}
            </span>
            {cat && (
              <span className="rounded-full bg-surface-800/80 px-2 py-0.5 text-[10px] font-semibold text-surface-400 light:bg-slate-100 light:text-slate-600">
                {cat}
              </span>
            )}
          </div>
          <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-white transition group-hover:text-brand-300 light:text-slate-900 light:group-hover:text-brand-700 sm:text-lg">
            {a.title}
          </h2>
          {a.excerpt && (
            <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-surface-400 light:text-slate-600">
              {a.excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-surface-800/80 pt-3 light:border-slate-100">
            <span className="text-[11px] text-surface-500 light:text-slate-500">{date || 'Guide'}</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 transition group-hover:text-brand-300 light:text-brand-600">
              Read
              <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="mt-10">
      <div className="sticky top-16 z-20 rounded-2xl border border-surface-700/80 bg-surface-950/90 shadow-lg backdrop-blur-md light:border-slate-200 light:bg-white/95">
        <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-500"
            aria-expanded={open}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filter
            <svg
              className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`}
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
                <span className="rounded-full bg-brand-600/20 px-2.5 py-1 text-[11px] font-bold text-brand-300 light:bg-brand-50 light:text-brand-700">
                  {CATEGORIES.find((c) => c.id === applied.category)?.label}
                </span>
              )}
              {applied.price && (
                <span className="rounded-full bg-brand-600/20 px-2.5 py-1 text-[11px] font-bold text-brand-300 light:bg-brand-50 light:text-brand-700">
                  {PRICES.find((p) => p.id === applied.price)?.label}
                </span>
              )}
              {applied.need && (
                <span className="rounded-full bg-brand-600/20 px-2.5 py-1 text-[11px] font-bold text-brand-300 light:bg-brand-50 light:text-brand-700">
                  {NEEDS.find((n) => n.id === applied.need)?.label}
                </span>
              )}
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] font-semibold text-surface-400 underline decoration-surface-600 underline-offset-2 hover:text-white light:hover:text-slate-800"
              >
                Clear
              </button>
            </div>
          )}

          <p className="ml-auto text-[11px] font-medium text-surface-500">
            <span className="tabular-nums text-surface-300 light:text-slate-700">{filtered.length}</span>
            {' '}guide{filtered.length === 1 ? '' : 's'}
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
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-surface-600 bg-surface-900/40 px-6 py-16 text-center light:border-slate-300 light:bg-slate-50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-800 light:bg-slate-200">
            <svg className="h-7 w-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="mt-4 text-base font-medium text-surface-300 light:text-slate-600">
            No guides match these filters.
          </p>
          <p className="mt-1 text-sm text-surface-500">Try a different combination or clear filters.</p>
          <button
            type="button"
            onClick={onClear}
            className="mt-5 rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-500"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {featured && <Card a={featured} large />}
          {rest.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <Card key={a.id} a={a} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

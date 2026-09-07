'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { relativeTime } from '@/lib/utils';

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
  { id: 'under50', label: 'Under 50k', keywords: ['under 50', 'below 50', '50,000', '50k', 'cheap'] },
  { id: 'under100', label: 'Under 100k', keywords: ['under 100', 'below 100', 'budget', '100,000', '100k'] },
  { id: '100to200', label: '100k - 200k', keywords: ['100k-200', '100k - 200', 'mid-range', '150,000', '200k'] },
  { id: '200to300', label: '200k - 300k', keywords: ['200k-300', '200k - 300', '250,000', '300,000'] },
  { id: '300to500', label: '300k - 500k', keywords: ['300k-500', '300k - 500', '400,000', '500k'] },
  { id: 'over500', label: '500k+', keywords: ['500k', 'above 500', 'premium', 'flagship', 'over 500'] },
] as const;

const NEEDS = [
  { id: 'gaming', label: 'Gaming', keywords: ['gaming', 'gamer', 'game', 'fps', 'pubg', 'cod'] },
  { id: 'content', label: 'Content creation', keywords: ['content', 'creator', 'camera', 'photo', 'video', 'vlog', 'youtube'] },
  { id: 'office', label: 'Office work', keywords: ['office', 'work', 'productivity', 'business', 'excel', 'docs'] },
  { id: 'students', label: 'Students', keywords: ['student', 'school', 'campus', 'study', 'college', 'uni'] },
  { id: 'personal', label: 'Personal / everyday', keywords: ['personal', 'everyday', 'daily', 'casual', 'general use'] },
  { id: 'battery', label: 'Long battery', keywords: ['battery', 'endurance', 'all-day', 'stamina'] },
  { id: 'camera', label: 'Camera focus', keywords: ['camera', 'photo', 'selfie', 'zoom', 'portrait'] },
  { id: 'travel', label: 'Travel', keywords: ['travel', 'portable', 'lightweight', 'trip'] },
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

function FeedRow({ a }: { a: ArticleCard }) {
  const label = typeLabels[a.article_type || 'other'] || 'Guide';
  const when = relativeTime(a.published_at);

  return (
    <Link
      href={`/articles/${a.slug}`}
      className="group flex items-center gap-3 rounded-[1.15rem] border border-white/[0.06] bg-[#1a1a1c] px-3.5 py-3.5 shadow-[0_0_0_1px_rgba(47,107,255,0.04)] transition hover:border-[#2f6bff]/45 hover:bg-[#222226] hover:shadow-[0_0_24px_-8px_rgba(47,107,255,0.45)] sm:gap-4 sm:px-4 sm:py-4"
    >
      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-3 text-[15px] font-semibold leading-snug tracking-tight text-zinc-50 group-hover:text-[#9db7ff] sm:text-[16px]">
          {a.title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-zinc-400">
          <span className="inline-flex items-center gap-1.5 font-medium text-zinc-300">
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-[#2f6bff] to-sky-400 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(47,107,255,0.55)]">
              T
            </span>
            TechPick NG
          </span>
          <span className="text-zinc-600">·</span>
          <span>{when}</span>
          <span className="hidden text-zinc-600 sm:inline">·</span>
          <span className="hidden rounded-full bg-[#2f6bff]/15 px-2 py-0.5 text-[10px] font-semibold text-[#9db7ff] sm:inline">
            {label}
          </span>
        </div>
      </div>
      <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl bg-zinc-800 ring-1 ring-white/10 sm:h-[80px] sm:w-[80px]">
        {a.featured_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.featured_image_url}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2550] to-zinc-900 text-[10px] font-semibold text-[#9db7ff]">
            Guide
          </div>
        )}
      </div>
    </Link>
  );
}

export function ArticlesFilter({ articles }: { articles: ArticleCard[] }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [need, setNeed] = useState<string | null>(null);
  const [applied, setApplied] = useState({
    category: null as string | null,
    price: null as string | null,
    need: null as string | null,
  });

  const hasSelection = !!(category || price || need);
  const hasApplied = !!(applied.category || applied.price || applied.need);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (applied.category && !matchesCategory(a, applied.category)) return false;
      if (applied.price && !matchesPrice(a, applied.price)) return false;
      if (applied.need && !matchesNeed(a, applied.need)) return false;
      return true;
    });
  }, [articles, applied]);

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
          ? 'shrink-0 rounded-full bg-[#2f6bff] px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_0_12px_rgba(47,107,255,0.45)]'
          : 'shrink-0 rounded-full border border-white/10 bg-[#141416] px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-[#2f6bff]/50 hover:text-white'
      }
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-[#141416] shadow-[0_0_0_1px_rgba(47,107,255,0.08)]">
        <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2f6bff] px-4 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(47,107,255,0.35)] transition hover:bg-blue-500"
            aria-expanded={open}
          >
            Filter
            <svg className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <p className="ml-auto text-[12px] font-medium text-zinc-500">
            <span className="font-bold tabular-nums text-zinc-200">{filtered.length}</span> result
            {filtered.length === 1 ? '' : 's'}
          </p>
        </div>

        {open && (
          <div className="space-y-4 border-t border-white/10 px-3 pb-4 pt-3 sm:px-4">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Category</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap">
                {CATEGORIES.map((c) => chip(category === c.id, c.label, () => toggle('category', c.id)))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Price</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap">
                {PRICES.map((p) => chip(price === p.id, p.label, () => toggle('price', p.id)))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Need</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap">
                {NEEDS.map((n) => chip(need === n.id, n.label, () => toggle('need', n.id)))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={onSearch}
                disabled={!hasSelection && !hasApplied}
                className="rounded-xl bg-[#2f6bff] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Search guides
              </button>
              <button
                type="button"
                onClick={onClear}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-[#141416] px-6 py-16 text-center">
          <p className="text-base font-semibold text-zinc-200">No guides match these filters</p>
          <p className="mt-1 text-sm text-zinc-500">Try another combination or clear filters</p>
          <button
            type="button"
            onClick={onClear}
            className="mt-5 rounded-full bg-[#2f6bff] px-5 py-2 text-sm font-bold text-white hover:bg-blue-500"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2.5 sm:gap-3">
          {filtered.map((a) => (
            <FeedRow key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

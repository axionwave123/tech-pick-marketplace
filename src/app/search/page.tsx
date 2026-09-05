import Link from 'next/link';
import { searchProducts, getCategories } from '@/lib/data/products';
import { ProductCard } from '@/components/products/ProductCard';

export const metadata = { title: 'Browse products · TechPick NG' };
export const dynamic = 'force-dynamic';

function buildSearchHref(q: string, category?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  const s = params.toString();
  return s ? `/search?${s}` : '/search';
}

/** Simple category icons for visual polish */
const CATEGORY_ICONS: Record<string, string> = {
  smartphones: '📱',
  laptops: '💻',
  tablets: '📟',
  audio: '🎧',
  gaming: '🎮',
  tvs: '📺',
  wearables: '⌚',
  cameras: '📷',
  accessories: '🔌',
  'power-banks': '🔋',
  power: '🔋',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const query = (q || '').trim();
  const categorySlug = (category || '').trim();

  const [categories, products] = await Promise.all([
    getCategories(),
    searchProducts(query, { categorySlug: categorySlug || undefined, limit: 48 }),
  ]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const pageTitle = query
    ? `Results for “${query}”`
    : activeCategory
      ? activeCategory.name
      : 'Browse products';

  return (
    <div className="min-h-screen">
      {/* ——— Hero header ——— */}
      <div className="relative overflow-hidden border-b border-surface-800/80 bg-gradient-to-br from-surface-950 via-surface-900 to-brand-950/40 light:border-slate-200 light:from-slate-50 light:via-white light:to-brand-50/60">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl light:bg-brand-400/15" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl light:bg-emerald-400/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-400 light:text-brand-600">
            TechPick NG · Compare prices
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white light:text-slate-900 sm:text-4xl">
            {pageTitle}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-surface-300 light:text-slate-600 sm:text-base">
            {query || activeCategory
              ? `${products.length} product${products.length === 1 ? '' : 's'} found · prices from Jumia, Temu & partners`
              : 'Discover phones, laptops & more — compare deals across Nigerian stores'}
          </p>

          {/* Search bar */}
          <form
            action="/search"
            method="get"
            className="mt-6 flex max-w-2xl overflow-hidden rounded-2xl border border-surface-600/80 bg-surface-900/80 shadow-lg ring-1 ring-white/5 backdrop-blur light:border-slate-200 light:bg-white light:ring-slate-200/80"
          >
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            <div className="flex flex-1 items-center gap-2 px-4">
              <svg
                className="h-5 w-5 shrink-0 text-surface-400 light:text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                name="q"
                defaultValue={query}
                placeholder="Search phones, laptops, brands…"
                className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white placeholder:text-surface-500 focus:outline-none light:text-slate-900 light:placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 bg-brand-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-500 sm:px-6"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ——— Category pills (horizontal scroll on mobile) ——— */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-surface-400 light:text-slate-500">
              Categories
            </p>
            {categorySlug && (
              <Link
                href={buildSearchHref(query)}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 light:text-brand-600 light:hover:text-brand-700"
              >
                Clear filter
              </Link>
            )}
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <Link
              href={buildSearchHref(query)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                !categorySlug
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                  : 'border border-surface-600/80 bg-surface-800/80 text-surface-200 hover:border-brand-500/40 hover:bg-surface-700 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:border-brand-300 light:hover:bg-brand-50'
              }`}
            >
              All
            </Link>
            {categories.map((c) => {
              const icon = CATEGORY_ICONS[c.slug] || '📦';
              const active = categorySlug === c.slug;
              return (
                <Link
                  key={c.id}
                  href={buildSearchHref(query, c.slug)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                      : 'border border-surface-600/80 bg-surface-800/80 text-surface-200 hover:border-brand-500/40 hover:bg-surface-700 light:border-slate-200 light:bg-white light:text-slate-700 light:hover:border-brand-300 light:hover:bg-brand-50'
                  }`}
                >
                  <span className="text-base leading-none" aria-hidden>
                    {icon}
                  </span>
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ——— Results toolbar ——— */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-700/60 bg-surface-900/40 px-4 py-3 light:border-slate-200 light:bg-slate-50/80">
          <p className="text-sm font-medium text-surface-200 light:text-slate-700">
            <span className="font-bold text-white light:text-slate-900">{products.length}</span>
            {' '}
            product{products.length === 1 ? '' : 's'}
            {activeCategory ? (
              <>
                {' '}in <span className="font-semibold text-brand-300 light:text-brand-600">{activeCategory.name}</span>
              </>
            ) : null}
          </p>
          <p className="text-xs text-surface-400 light:text-slate-500">
            Sorted by relevance · verify prices on store sites
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-surface-700/80 bg-surface-900/80 p-5 shadow-lg ring-1 ring-white/5 light:border-slate-200 light:bg-white light:ring-slate-200/60">
              <h2 className="text-sm font-bold text-white light:text-slate-900">Browse by category</h2>
              <ul className="mt-4 space-y-0.5">
                <li>
                  <Link
                    href={buildSearchHref(query)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                      !categorySlug
                        ? 'bg-brand-600/20 font-semibold text-brand-300 light:bg-brand-50 light:text-brand-700'
                        : 'text-surface-300 hover:bg-surface-800 hover:text-white light:text-slate-600 light:hover:bg-slate-50 light:hover:text-slate-900'
                    }`}
                  >
                    <span className="text-base">✨</span>
                    All categories
                  </Link>
                </li>
                {categories.map((c) => {
                  const icon = CATEGORY_ICONS[c.slug] || '📦';
                  const active = categorySlug === c.slug;
                  return (
                    <li key={c.id}>
                      <Link
                        href={buildSearchHref(query, c.slug)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                          active
                            ? 'bg-brand-600/20 font-semibold text-brand-300 light:bg-brand-50 light:text-brand-700'
                            : 'text-surface-300 hover:bg-surface-800 hover:text-white light:text-slate-600 light:hover:bg-slate-50 light:hover:text-slate-900'
                        }`}
                      >
                        <span className="text-base">{icon}</span>
                        {c.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 rounded-xl bg-gradient-to-br from-brand-600/20 to-emerald-600/10 p-4 light:from-brand-50 light:to-emerald-50">
                <p className="text-xs font-bold text-brand-300 light:text-brand-700">Price tip</p>
                <p className="mt-1 text-xs leading-relaxed text-surface-300 light:text-slate-600">
                  Open a product to compare Jumia, Temu and other store prices side by side.
                </p>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-600 bg-surface-900/40 px-6 py-16 text-center light:border-slate-300 light:bg-slate-50">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 text-3xl light:bg-white light:shadow-md">
                  🔍
                </div>
                <h3 className="mt-4 text-lg font-bold text-white light:text-slate-900">No products found</h3>
                <p className="mt-2 max-w-sm text-sm text-surface-400 light:text-slate-500">
                  Try another keyword or pick a different category. New deals are added regularly.
                </p>
                <Link
                  href="/search"
                  className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-500"
                >
                  View all products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

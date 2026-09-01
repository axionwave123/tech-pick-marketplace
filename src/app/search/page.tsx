import Link from 'next/link';
import { searchProducts, getCategories } from '@/lib/data/products';
import { ProductCard } from '@/components/products/ProductCard';

export const metadata = { title: 'Search' };
export const dynamic = 'force-dynamic';

function buildSearchHref(q: string, category?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  const s = params.toString();
  return s ? `/search?${s}` : '/search';
}

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-white light:text-slate-900 sm:text-3xl">
        {query ? (
          <>
            Search results for <span className="text-brand-300 light:text-brand-600">“{query}”</span>
          </>
        ) : activeCategory ? (
          <>
            <span className="text-brand-300 light:text-brand-600">{activeCategory.name}</span> products
          </>
        ) : (
          'Browse products'
        )}
      </h1>
      <p className="mt-1 text-sm font-medium text-surface-300 light:text-slate-500">
        {products.length} product{products.length === 1 ? '' : 's'}
        {activeCategory ? ` in ${activeCategory.name}` : ''}
      </p>

      {/* Category filter — always visible */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-surface-400 light:text-slate-500">
          Filter by category
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildSearchHref(query)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold sm:text-sm ${
              !categorySlug
                ? 'bg-brand-600 text-white'
                : 'bg-surface-800 text-surface-200 hover:bg-surface-700 light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200'
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildSearchHref(query, c.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold sm:text-sm ${
                categorySlug === c.slug
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-800 text-surface-200 hover:bg-surface-700 light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <form action="/search" method="get" className="mt-5 flex max-w-xl gap-2">
        {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
        <input
          name="q"
          defaultValue={query}
          placeholder="Search phones, laptops…"
          className="min-w-0 flex-1 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 light:border-slate-200 light:bg-white light:text-slate-900"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500"
        >
          Search
        </button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden rounded-2xl border border-surface-700 bg-surface-900 p-4 light:border-slate-200 light:bg-white lg:block">
          <h2 className="text-sm font-bold text-white light:text-slate-900">Categories</h2>
          <ul className="mt-3 space-y-1">
            <li>
              <Link
                href={buildSearchHref(query)}
                className={`block rounded-lg px-2 py-1.5 text-sm ${
                  !categorySlug
                    ? 'bg-brand-600/20 font-semibold text-brand-300 light:text-brand-700'
                    : 'text-surface-300 hover:bg-surface-800 light:text-slate-600 light:hover:bg-slate-50'
                }`}
              >
                All categories
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={buildSearchHref(query, c.slug)}
                  className={`block rounded-lg px-2 py-1.5 text-sm ${
                    categorySlug === c.slug
                      ? 'bg-brand-600/20 font-semibold text-brand-300 light:text-brand-700'
                      : 'text-surface-300 hover:bg-surface-800 light:text-slate-600 light:hover:bg-slate-50'
                  }`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          {products.length === 0 && (
            <p className="font-medium text-surface-200 light:text-slate-600">
              No products matched. Try another category or keyword.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

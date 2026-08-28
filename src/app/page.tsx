import Link from 'next/link';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { getPublishedProducts, getDeals } from '@/lib/data/products';
import { createClient } from '@/lib/supabase/server';

const categories = [
  { slug: 'smartphones', label: 'Phones', emoji: '📱' },
  { slug: 'laptops', label: 'Laptops', emoji: '💻' },
  { slug: 'tablets', label: 'Tablets', emoji: '📟' },
  { slug: 'audio', label: 'Audio', emoji: '🎧' },
  { slug: 'wearables', label: 'Watches', emoji: '⌚' },
  { slug: 'gaming', label: 'Gaming', emoji: '🎮' },
  { slug: 'tvs', label: 'TVs', emoji: '📺' },
  { slug: 'power-banks', label: 'Power', emoji: '🔋' },
];

export default async function HomePage() {
  const [products, deals] = await Promise.all([
    getPublishedProducts(8),
    getDeals(4),
  ]);

  let articles: { id: string; title: string; slug: string; excerpt: string | null }[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3);
    articles = data || [];
  } catch {
    /* empty until DB connected */
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-surface-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Find. Compare.\n              <span className="text-brand-200">Buy Smart.</span>
            </h1>
            <p className="mt-4 text-lg text-brand-100">
              Real reviews. Better prices. Smarter choices for tech in Nigeria.
            </p>
            <form action="/search" method="get" className="mt-8">
              <div className="flex overflow-hidden rounded-2xl bg-white shadow-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <input
                    name="q"
                    placeholder="Search for products, brands, categories…"
                    className="w-full border-0 py-4 pl-12 pr-4 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-600 px-6 font-semibold text-white hover:bg-brand-500 sm:px-8"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-surface-200 bg-white p-3 text-center shadow-card transition hover:border-brand-200 hover:shadow-card-hover"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-medium text-surface-700">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-surface-900">Trending Products</h2>
          <Link href="/search" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
        {products.length === 0 ? (
          <EmptyState message="Connect Supabase and run migrations + seed to see demo products." />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Deals */}
      <section className="bg-surface-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-surface-900">Best Deals Today</h2>
            <Link href="/deals" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              All deals
            </Link>
          </div>
          {deals.length === 0 ? (
            <EmptyState message="No discounted offers in seed data yet." />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-surface-900">Latest Articles</h2>
          <Link href="/articles" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            All articles
          </Link>
        </div>
        {articles.length === 0 ? (
          <EmptyState message="No published articles yet." />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:shadow-card-hover"
              >
                <h3 className="font-semibold text-surface-900">{a.title}</h3>
                {a.excerpt && <p className="mt-2 line-clamp-2 text-sm text-surface-600">{a.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-surface-200 bg-brand-600 py-12 text-center text-white">
        <h2 className="text-2xl font-bold">Get the best deals & reviews</h2>
        <p className="mt-2 text-brand-100">Newsletter coming soon — build with verified data only.</p>
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 px-6 py-12 text-center text-sm text-surface-500">
      {message}
    </div>
  );
}

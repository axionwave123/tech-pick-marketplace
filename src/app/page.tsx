import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { getPublishedProducts, getDeals } from '@/lib/data/products';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

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

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, deals] = await Promise.all([
    getPublishedProducts(8),
    getDeals(4),
  ]);

  let articles: { id: string; title: string; slug: string; excerpt: string | null }[] = [];
  if (isSupabaseConfigured()) {
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
      /* ignore until DB connected */
    }
  }

  return (
    <div>
      {/* Hero — matches mockup: headline + search + product visual */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-surface-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find. Compare.
              <br />
              <span className="text-brand-200">Buy Smart.</span>
            </h1>
            <p className="mt-4 text-base text-brand-100 sm:text-lg">
              Real reviews. Best prices. Smarter choices for tech in Nigeria.
            </p>
            <form action="/search" method="get" className="mt-6 sm:mt-8">
              <div className="flex overflow-hidden rounded-2xl bg-white shadow-lg">
                <input
                  name="q"
                  placeholder="Search for products, brands, categories…"
                  className="min-w-0 flex-1 border-0 px-4 py-3.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-0 sm:px-5 sm:py-4 sm:text-base"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-brand-600 px-5 font-semibold text-white hover:bg-brand-500 sm:px-8"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Hero product visual (design image) — visible on all sizes, stronger on desktop */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80"
                alt="Featured smartphones and tech devices"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 45vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent" />
            </div>
            {/* Decorative floating cards feel */}
            <div className="pointer-events-none absolute -right-2 -top-2 hidden h-24 w-20 rounded-2xl bg-white/10 backdrop-blur-sm sm:block" />
            <div className="pointer-events-none absolute -bottom-3 -left-3 hidden h-16 w-28 rounded-2xl bg-brand-400/20 backdrop-blur-sm sm:block" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 sm:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-surface-200 bg-white p-2.5 text-center shadow-card transition hover:border-brand-200 hover:shadow-card-hover sm:gap-2 sm:p-3"
            >
              <span className="text-xl sm:text-2xl">{c.emoji}</span>
              <span className="text-[10px] font-medium text-surface-700 sm:text-xs">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 flex items-end justify-between sm:mb-6">
          <h2 className="text-xl font-bold text-surface-900 sm:text-2xl">Trending Products</h2>
          <Link href="/search" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
        {products.length === 0 ? (
          <EmptyState message="Connect Supabase and run migrations + seed to see demo products." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface-50 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between sm:mb-6">
            <h2 className="text-xl font-bold text-surface-900 sm:text-2xl">Best Deals Today</h2>
            <Link href="/deals" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              All deals
            </Link>
          </div>
          {deals.length === 0 ? (
            <EmptyState message="No discounted offers yet." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-5 flex items-end justify-between sm:mb-6">
          <h2 className="text-xl font-bold text-surface-900 sm:text-2xl">Latest Articles</h2>
          <Link href="/articles" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            All articles
          </Link>
        </div>
        {articles.length === 0 ? (
          <EmptyState message="No published articles yet." />
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {articles.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition hover:shadow-card-hover sm:p-6"
              >
                <h3 className="font-semibold text-surface-900">{a.title}</h3>
                {a.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-surface-600">{a.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-surface-200 bg-brand-600 py-10 text-center text-white sm:py-12">
        <h2 className="text-xl font-bold sm:text-2xl">Get the best deals &amp; reviews</h2>
        <p className="mt-2 text-sm text-brand-100 sm:text-base">Newsletter coming soon.</p>
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

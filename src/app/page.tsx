import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/products/ProductCard';
import { getPublishedProducts, getDeals } from '@/lib/data/products';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { categoryImages } from '@/lib/category-images';

const categories = [
  { slug: 'smartphones', label: 'Phones', key: 'phones' as const },
  { slug: 'laptops', label: 'Laptops', key: 'laptops' as const },
  { slug: 'tablets', label: 'Tablets', key: 'tablets' as const },
  { slug: 'audio', label: 'Audio', key: 'audio' as const },
  { slug: 'wearables', label: 'Watches', key: 'watches' as const },
  { slug: 'gaming', label: 'Gaming', key: 'gaming' as const },
  { slug: 'tvs', label: 'TVs', key: 'tvs' as const },
  { slug: 'power-banks', label: 'Power', key: 'power' as const },
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
      /* ignore */
    }
  }

  return (
    <div className="bg-surface-950 light:bg-slate-50">
      <section className="relative min-h-[65vh] overflow-hidden sm:min-h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1600&q=85"
            alt=""
            fill
            priority
            className="object-cover object-center opacity-60"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-surface-950 light:to-slate-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-brand-950/50 to-black/30" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[65vh] max-w-7xl flex-col justify-center px-4 py-14 sm:min-h-[70vh] sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-200 drop-shadow sm:text-sm">
              Tech · Nigeria · Smart shopping
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              Find. Compare.
              <br />
              <span className="text-brand-200">Buy Smart.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base font-medium leading-relaxed text-white/95 drop-shadow sm:text-lg">
              Real reviews. Best prices. Smarter choices for tech in Nigeria.
            </p>
            <form action="/search" method="get" className="mt-8">
              <div className="flex overflow-hidden rounded-2xl border border-white/20 bg-white shadow-xl">
                <input
                  name="q"
                  placeholder="Search phones, laptops, brands…"
                  className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-0 sm:px-5 sm:py-4 sm:text-base"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-500 sm:px-8 sm:text-base"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8 sm:gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-surface-700/80 bg-surface-900/80 p-2 text-center shadow-card transition hover:border-brand-500/50 hover:shadow-neon light:border-slate-200 light:bg-white light:shadow-sm light:hover:border-brand-400 sm:p-2.5"
            >
              <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={categoryImages[c.key]}
                  alt={c.label}
                  width={120}
                  height={120}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-[11px] font-semibold text-surface-100 light:text-slate-800 sm:text-xs">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 flex items-end justify-between sm:mb-6">
          <h2 className="font-display text-xl font-bold tracking-tight text-white light:text-slate-900 sm:text-2xl">
            Trending Products
          </h2>
          <Link href="/search" className="text-sm font-semibold text-brand-300 light:text-brand-600">
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

      <section className="border-y border-surface-800 bg-surface-900/50 py-10 light:border-slate-200 light:bg-slate-100/80 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between sm:mb-6">
            <h2 className="font-display text-xl font-bold tracking-tight text-white light:text-slate-900 sm:text-2xl">
              Best Deals Today
            </h2>
            <Link href="/deals" className="text-sm font-semibold text-brand-300 light:text-brand-600">
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
          <h2 className="font-display text-xl font-bold tracking-tight text-white light:text-slate-900 sm:text-2xl">
            Latest Articles
          </h2>
          <Link href="/articles" className="text-sm font-semibold text-brand-300 light:text-brand-600">
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
                className="rounded-2xl border border-surface-700 bg-surface-900 p-5 light:border-slate-200 light:bg-white sm:p-6"
              >
                <h3 className="font-display font-semibold text-white light:text-slate-900">{a.title}</h3>
                {a.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-surface-200 light:text-slate-600">{a.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-surface-800 bg-brand-600 py-10 text-center text-white sm:py-12">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Get the best deals &amp; reviews</h2>
        <p className="mt-2 text-sm font-medium text-brand-50 sm:text-base">Newsletter coming soon.</p>
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-600 bg-surface-900/60 px-6 py-12 text-center text-sm font-medium text-surface-300 light:border-slate-300 light:bg-slate-100 light:text-slate-600">
      {message}
    </div>
  );
}

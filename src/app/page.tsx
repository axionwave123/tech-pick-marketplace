import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/products/ProductCard';
import { getDeals } from '@/lib/data/products';
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
  const deals = await getDeals(6);

  let articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    article_type: string | null;
    published_at: string | null;
  }[] = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, featured_image_url, article_type, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4);
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

            {/* Mature secondary CTA — guides / articles list */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/articles"
                className="group inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-brand-300/50 hover:bg-white/15 hover:shadow-brand-500/10"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/90 text-white shadow-sm ring-1 ring-white/20 transition group-hover:bg-brand-400">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </span>
                <span>Read article</span>
                <svg
                  className="h-4 w-4 text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/articles"
                className="text-sm font-medium text-white/70 underline-offset-4 transition hover:text-white hover:underline"
              >
                All guides
              </Link>
            </div>
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Shop with TechPick NG */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="rounded-3xl border border-surface-700/80 bg-surface-900/80 px-5 py-8 light:border-slate-200 light:bg-white sm:px-8 sm:py-10">
          <h2 className="text-center font-display text-xl font-bold tracking-tight text-white light:text-slate-900 sm:text-2xl">
            Why Shop with TechPick NG?
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Compare with Confidence',
                body: 'We compare prices from multiple trusted stores so you always get the best deal.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                ),
              },
              {
                title: 'Real-time Price Updates',
                body: 'Prices change fast. We update regularly so you never miss out on the latest offers.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Expert Reviews & Guides',
                body: 'Honest reviews, buying guides and comparisons to help you make smarter choices.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                title: 'Safe & Transparent',
                body: 'We only link to trusted stores. Your safety and satisfaction come first.',
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
            ].map((f) => (
              <div key={f.title} className="text-center sm:text-left">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600/15 text-brand-400 light:bg-brand-50 light:text-brand-600 sm:mx-0">
                  {f.icon}
                </div>
                <h3 className="mt-3 text-sm font-bold text-white light:text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-surface-400 light:text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides & Articles */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between sm:mb-6">
          <h2 className="font-display text-xl font-bold tracking-tight text-white light:text-slate-900 sm:text-2xl">
            Popular Guides & Articles
          </h2>
          <Link href="/articles" className="text-sm font-semibold text-brand-300 light:text-brand-600">
            View all articles →
          </Link>
        </div>
        {articles.length === 0 ? (
          <EmptyState message="No published articles yet. Add some from Admin → Articles." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((a) => {
              const typeLabel =
                (
                  {
                    buying_guide: 'Buying guide',
                    comparison: 'Comparison',
                    how_to: 'How-to',
                    tech_tips: 'Tips',
                    news: 'News',
                    other: 'Article',
                  } as Record<string, string>
                )[a.article_type || 'other'] || 'Article';
              const dateStr = a.published_at
                ? new Date(a.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;
              return (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  className="group overflow-hidden rounded-2xl border border-surface-700/80 bg-surface-900/80 shadow-card transition hover:border-brand-500/40 light:border-slate-200 light:bg-white light:shadow-sm"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-800 light:bg-slate-100">
                    {a.featured_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.featured_image_url}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-surface-500">
                        <svg className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400 light:text-brand-600">
                      {typeLabel}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white light:text-slate-900">
                      {a.title}
                    </h3>
                    {dateStr && (
                      <p className="mt-2 text-[11px] text-surface-500 light:text-slate-500">{dateStr}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-surface-800 bg-brand-600 py-10 text-center text-white sm:py-12">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Get the best deals & reviews</h2>
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

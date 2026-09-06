import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { ArticlesFilter } from '@/components/articles/ArticlesFilter';

export const metadata = {
  title: 'Articles & Buying Guides',
  description:
    'Honest buying guides, comparisons and tech tips to help you buy smarter in Nigeria.',
};
export const dynamic = 'force-dynamic';

export default async function ArticlesHub() {
  let articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    article_type: string | null;
    featured_image_url: string | null;
    published_at: string | null;
    filter_category: string | null;
    filter_price: string | null;
    filter_need: string | null;
  }[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('articles')
        .select(
          'id, title, slug, excerpt, article_type, featured_image_url, published_at, filter_category, filter_price, filter_need'
        )
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      articles = data || [];
    } catch {
      articles = [];
    }
  }

  const guideCount = articles.length;

  return (
    <div className="min-h-[70vh] bg-surface-950 light:bg-slate-50">
      <section className="relative overflow-hidden border-b border-surface-800 light:border-slate-200/80">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.28),transparent)] light:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.14),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl light:bg-brand-400/20"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-600/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-200 light:border-brand-200 light:bg-white light:text-brand-700 light:shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400 light:bg-brand-500" />
              </span>
              Buying guides
            </span>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white light:text-slate-900 sm:text-5xl">
              Guides that help you
              <span className="mt-1 block text-brand-300 light:text-brand-600">
                buy tech with confidence
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-surface-300 light:text-slate-600 sm:text-lg">
              Clear budgets, real needs, and honest picks for shoppers in Nigeria - no jargon,
              no filler.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-baseline gap-2 rounded-2xl border border-surface-700 bg-surface-900/90 px-4 py-3 light:border-slate-200 light:bg-white light:shadow-sm">
                <span className="font-display text-2xl font-bold tabular-nums text-white light:text-slate-900">
                  {guideCount}
                </span>
                <span className="text-xs font-semibold text-surface-400 light:text-slate-500">
                  guide{guideCount === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Phones', 'Laptops', 'Audio', 'Students', 'Gaming'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-surface-700 bg-surface-900/60 px-3 py-1.5 text-[11px] font-semibold text-surface-300 light:border-slate-200 light:bg-white light:text-slate-600 light:shadow-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-surface-600 bg-surface-900/50 px-6 py-20 text-center light:border-slate-300 light:bg-white">
            <p className="text-base font-medium text-surface-300 light:text-slate-600">
              No published guides yet - check back soon.
            </p>
          </div>
        ) : (
          <ArticlesFilter articles={articles} />
        )}
      </div>
    </div>
  );
}

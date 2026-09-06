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
    <div className="relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.22)_0%,_transparent_60%)] light:bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12)_0%,_transparent_65%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* Hero */}
        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-300 light:border-brand-200 light:bg-brand-50 light:text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 light:bg-brand-500" />
            Buying guides · Comparisons · Tips
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white light:text-slate-900 sm:text-4xl md:text-5xl">
            Find the right tech
            <span className="block bg-gradient-to-r from-brand-300 via-brand-400 to-sky-300 bg-clip-text text-transparent light:from-brand-600 light:via-brand-500 light:to-sky-600">
              before you spend
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-surface-300 light:text-slate-600 sm:text-lg">
            Honest guides written for Nigerian shoppers — clear budgets, real needs, and picks you
            can actually buy.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-surface-700/80 bg-surface-900/70 px-4 py-2.5 light:border-slate-200 light:bg-white">
              <span className="text-xl font-bold tabular-nums text-white light:text-slate-900">
                {guideCount}
              </span>
              <span className="text-xs font-medium text-surface-400 light:text-slate-500">
                published guide{guideCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="hidden items-center gap-1.5 text-xs text-surface-400 sm:flex light:text-slate-500">
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-400 light:text-emerald-700">
                No fluff
              </span>
              <span className="rounded-full bg-surface-800 px-2.5 py-1 font-semibold text-surface-300 light:bg-slate-100 light:text-slate-600">
                Local prices
              </span>
              <span className="rounded-full bg-surface-800 px-2.5 py-1 font-semibold text-surface-300 light:bg-slate-100 light:text-slate-600">
                Real needs
              </span>
            </div>
          </div>
        </header>

        {articles.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-dashed border-surface-600 bg-surface-900/40 px-6 py-16 text-center light:border-slate-300 light:bg-white">
            <p className="text-base font-medium text-surface-300 light:text-slate-600">
              No published guides yet — check back soon.
            </p>
          </div>
        ) : (
          <ArticlesFilter articles={articles} />
        )}
      </div>
    </div>
  );
}

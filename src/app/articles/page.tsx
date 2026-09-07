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

  return (
    <div className="min-h-[70vh] bg-[#0b0b0c]">
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgba(47,107,255,0.35),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-600/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-200">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Buying guides
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Guides worth your time
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Clear budgets, real needs, and honest picks for shoppers in Nigeria — designed for
            reading, not skimming past.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#141416] px-6 py-20 text-center">
            <p className="text-base font-medium text-zinc-400">
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

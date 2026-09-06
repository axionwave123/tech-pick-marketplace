import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const metadata = { title: 'Articles & Buying Guides' };
export const dynamic = 'force-dynamic';

const typeLabels: Record<string, string> = {
  buying_guide: 'Best phones',
  comparison: 'Comparison',
  how_to: 'How-to',
  tech_tips: 'Tips',
  news: 'News',
  other: 'Guide',
};

export default async function ArticlesHub() {
  let articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    article_type: string | null;
    featured_image_url: string | null;
    published_at: string | null;
  }[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, article_type, featured_image_url, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      articles = data || [];
    } catch {
      articles = [];
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white light:text-slate-900">
        Articles & Buying Guides
      </h1>
      <p className="mt-2 max-w-2xl text-base font-medium text-surface-200 light:text-slate-600">
        Honest guides, comparisons and tips to help you buy tech smarter in Nigeria.
      </p>

      {articles.length === 0 ? (
        <p className="mt-10 text-base font-medium text-surface-300 light:text-slate-500">
          No published articles yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:gap-6">
          {articles.map((a) => {
            const label =
              typeLabels[a.article_type || 'other'] ||
              (a.article_type || 'Guide').replace(/_/g, ' ');
            return (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-surface-700/80 bg-surface-900/80 shadow-card transition hover:border-brand-500/40 hover:shadow-lg light:border-slate-200 light:bg-white light:shadow-sm sm:flex-row"
              >
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-surface-800 light:bg-slate-100 sm:aspect-auto sm:h-auto sm:w-44 md:w-56 lg:w-64">
                  {a.featured_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.featured_image_url}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:absolute sm:inset-0"
                    />
                  ) : (
                    <div className="flex h-full min-h-[140px] items-center justify-center text-surface-500 sm:absolute sm:inset-0">
                      <svg
                        className="h-12 w-12 opacity-40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-center p-4 sm:p-5 md:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400 light:text-brand-600">
                    {label}
                  </p>
                  <h2 className="mt-1 text-base font-bold leading-snug text-white light:text-slate-900 sm:text-lg">
                    {a.title}
                  </h2>
                  {a.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-surface-300 light:text-slate-600">
                      {a.excerpt}
                    </p>
                  )}
                  <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white transition group-hover:bg-brand-500">
                    Read Guide
                    <span aria-hidden>\u2192</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

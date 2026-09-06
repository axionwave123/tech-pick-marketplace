import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { ArticlesFilter } from '@/components/articles/ArticlesFilter';

export const metadata = { title: 'Articles & Buying Guides' };
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
        <ArticlesFilter articles={articles} />
      )}
    </div>
  );
}

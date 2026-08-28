import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const metadata = { title: 'Articles' };
export const dynamic = 'force-dynamic';

export default async function ArticlesHub() {
  let articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    article_type: string | null;
  }[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, article_type, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      articles = data || [];
    } catch {
      articles = [];
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900">Articles Hub</h1>
      <p className="mt-2 text-surface-600">Buying guides, comparisons, how-tos, and tech tips.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/articles/${a.slug}`}
            className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition hover:shadow-card-hover"
          >
            {a.article_type && (
              <span className="text-xs font-semibold uppercase text-brand-600">
                {a.article_type.replace('_', ' ')}
              </span>
            )}
            <h2 className="mt-2 font-semibold text-surface-900">{a.title}</h2>
            {a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-surface-600">{a.excerpt}</p>}
          </Link>
        ))}
      </div>
      {articles.length === 0 && (
        <p className="mt-8 text-surface-500">No published articles yet.</p>
      )}
    </div>
  );
}

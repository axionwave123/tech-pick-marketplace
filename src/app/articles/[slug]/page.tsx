import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArticleCommentForm } from '@/components/ArticleCommentForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isSupabaseConfigured()) return { title: 'Article' };
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  return {
    title: data?.title || 'Article',
    description: data?.excerpt || undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!article) notFound();

  const { data: comments } = await supabase
    .from('article_comments')
    .select('id, author_name, body, created_at')
    .eq('article_id', article.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50);

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
    )[article.article_type || 'other'] || 'Article';

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-surface-400 light:text-surface-500">
        <Link href="/articles" className="hover:text-brand-400 light:hover:text-brand-600">
          Articles
        </Link>
        <span className="mx-1 text-surface-600 light:text-surface-400">/</span>
        <span className="text-white light:text-surface-900">{article.title}</span>
      </nav>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-brand-400">
        {typeLabel}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white light:text-surface-900 sm:text-4xl">
        {article.title}
      </h1>
      {article.published_at && (
        <p className="mt-2 text-sm text-surface-400 light:text-surface-500">
          {new Date(article.published_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
      {article.excerpt && (
        <p className="mt-4 text-lg text-surface-200 light:text-surface-600">{article.excerpt}</p>
      )}

      {article.featured_image_url && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-surface-700 light:border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featured_image_url}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}

      <div className="prose prose-invert light:prose-slate mt-8 max-w-none whitespace-pre-wrap text-surface-100 light:text-surface-800">
        {article.content}
      </div>

      <p className="mt-10 text-xs text-surface-400 light:text-surface-500">
        Content is editorial. Affiliate links, when present, may generate commission. Verify prices on
        retailer sites.
      </p>

      {/* Comments */}
      <section className="mt-12 border-t border-surface-800 pt-10 light:border-slate-200">
        <h2 className="font-display text-xl font-bold text-white light:text-slate-900">
          Comments ({(comments || []).length})
        </h2>
        <div className="mt-5">
          <ArticleCommentForm articleId={article.id} />
        </div>
        <ul className="mt-8 space-y-4">
          {(comments || []).map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-surface-700 bg-surface-900/60 p-4 light:border-slate-200 light:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-white light:text-slate-900">{c.author_name}</p>
                <time className="text-[11px] text-surface-500">
                  {new Date(c.created_at).toLocaleDateString('en-NG', {
                    dateStyle: 'medium',
                  })}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-surface-200 light:text-slate-700">
                {c.body}
              </p>
            </li>
          ))}
          {(comments || []).length === 0 && (
            <p className="text-sm text-surface-500">Be the first to comment.</p>
          )}
        </ul>
      </section>
    </article>
  );
}

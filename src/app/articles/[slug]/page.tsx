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

const typeLabels: Record<string, string> = {
  buying_guide: 'Buying guide',
  comparison: 'Comparison',
  how_to: 'How-to',
  tech_tips: 'Tips',
  news: 'News',
  other: 'Article',
};

const categoryLabels: Record<string, string> = {
  phone: 'Phone',
  laptop: 'Laptop',
  audio: 'Audio',
  others: 'Others',
};

const priceLabels: Record<string, string> = {
  under100: 'Under 100k',
  '100to200': '100k - 200k',
  '200to300': '200k - 300k',
  over300: '300k+',
};

const needLabels: Record<string, string> = {
  gaming: 'Gaming',
  content: 'Content creation',
  office: 'Office work',
  students: 'Students',
};

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

  const typeLabel = typeLabels[article.article_type || 'other'] || 'Article';
  const published = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const tags = [
    article.filter_category && categoryLabels[article.filter_category],
    article.filter_price && priceLabels[article.filter_price],
    article.filter_need && needLabels[article.filter_need],
  ].filter(Boolean) as string[];

  let related: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    article_type: string | null;
  }[] = [];
  try {
    let q = supabase
      .from('articles')
      .select('id, title, slug, excerpt, featured_image_url, article_type')
      .eq('status', 'published')
      .neq('id', article.id)
      .order('published_at', { ascending: false })
      .limit(3);
    if (article.filter_category) {
      q = q.eq('filter_category', article.filter_category);
    }
    const { data } = await q;
    related = data || [];
    if (related.length < 3) {
      const { data: more } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, featured_image_url, article_type')
        .eq('status', 'published')
        .neq('id', article.id)
        .order('published_at', { ascending: false })
        .limit(3);
      const ids = new Set(related.map((r) => r.id));
      for (const m of more || []) {
        if (!ids.has(m.id) && related.length < 3) related.push(m);
      }
    }
  } catch {
    related = [];
  }

  const paragraphs = (article.content || '')
    .split(/\n\n+/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-surface-950 light:bg-slate-50">
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm">
          <Link
            href="/articles"
            className="font-semibold text-brand-400 transition hover:text-brand-300 light:text-brand-600 light:hover:text-brand-700"
          >
            Guides
          </Link>
          <span className="text-surface-600 light:text-slate-400">/</span>
          <span className="line-clamp-1 font-medium text-surface-400 light:text-slate-500">
            {article.title}
          </span>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            {typeLabel}
          </span>
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-surface-700 bg-surface-900 px-2.5 py-1 text-[11px] font-semibold text-surface-300 light:border-slate-200 light:bg-white light:text-slate-600 light:shadow-sm"
            >
              {t}
            </span>
          ))}
          {published && (
            <time className="text-xs font-medium text-surface-500 light:text-slate-500">
              {published}
            </time>
          )}
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-white light:text-slate-900 sm:text-4xl md:text-[2.6rem]">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-surface-300 light:text-slate-600 sm:text-xl">
            {article.excerpt}
          </p>
        )}

        {article.featured_image_url && (
          <figure className="mt-8 overflow-hidden rounded-3xl border border-surface-700/60 bg-white shadow-lg light:border-slate-200 light:shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.featured_image_url}
              alt=""
              className="aspect-[16/10] w-full object-cover sm:aspect-[2/1]"
            />
          </figure>
        )}

        <div className="mt-10 rounded-3xl border border-surface-800 bg-surface-900/40 px-5 py-8 light:border-slate-200 light:bg-white light:px-8 light:py-10 light:shadow-sm sm:mt-12 sm:px-8 sm:py-10">
          <div className="space-y-5 text-[1.05rem] leading-[1.85] text-surface-100 light:text-slate-700 sm:text-[1.125rem]">
            {paragraphs.map((para: string, i: number) => (
              <p key={i} className="whitespace-pre-wrap">
                {para}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-surface-800 bg-surface-900/50 px-5 py-4 light:border-amber-100 light:bg-amber-50/80">
          <p className="text-xs leading-relaxed text-surface-400 light:text-amber-900/70">
            Editorial guide for Nigerian shoppers. Prices change - always confirm on the retailer
            site. Affiliate links may earn a small commission at no extra cost to you.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 rounded-full border border-surface-700 bg-surface-900 px-4 py-2 text-sm font-bold text-brand-300 transition hover:border-brand-500/50 hover:text-brand-200 light:border-slate-200 light:bg-white light:text-brand-700 light:shadow-sm light:hover:border-brand-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All buying guides
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl font-bold text-white light:text-slate-900">
              Keep reading
            </h2>
            <p className="mt-1 text-sm text-surface-400 light:text-slate-500">
              More guides you might find useful
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/articles/${r.slug}`}
                  className="group overflow-hidden rounded-2xl border border-surface-700/80 bg-surface-900 transition hover:border-brand-500/40 light:border-slate-200 light:bg-white light:shadow-sm light:hover:border-brand-300 light:hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-200 light:bg-slate-100">
                    {r.featured_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.featured_image_url}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400 light:text-brand-600">
                      {typeLabels[r.article_type || 'other'] || 'Guide'}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-brand-300 light:text-slate-900 light:group-hover:text-brand-700">
                      {r.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 border-t border-surface-800 pt-12 light:border-slate-200">
          <h2 className="font-display text-xl font-bold text-white light:text-slate-900">
            Comments
          </h2>
          <p className="mt-1 text-sm text-surface-400 light:text-slate-500">
            Share a tip or ask a question about this guide
          </p>

          <div className="mt-6 rounded-2xl border border-surface-800 bg-surface-900/50 p-4 light:border-slate-200 light:bg-white light:p-5 light:shadow-sm">
            <ArticleCommentForm articleId={article.id} />
          </div>

          <ul className="mt-6 space-y-3">
            {(comments || []).map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-surface-700/80 bg-surface-900/60 p-4 light:border-slate-200 light:bg-white light:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {(c.author_name || '?').slice(0, 1).toUpperCase()}
                    </span>
                    <p className="text-sm font-bold text-white light:text-slate-900">
                      {c.author_name}
                    </p>
                  </div>
                  <time className="text-[11px] font-medium text-surface-500 light:text-slate-500">
                    {new Date(c.created_at).toLocaleDateString('en-NG', {
                      dateStyle: 'medium',
                    })}
                  </time>
                </div>
                <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-surface-200 light:text-slate-700">
                  {c.body}
                </p>
              </li>
            ))}
            {(comments || []).length === 0 && (
              <p className="rounded-2xl border border-dashed border-surface-700 px-4 py-10 text-center text-sm text-surface-500 light:border-slate-300 light:bg-slate-50 light:text-slate-500">
                Be the first to comment.
              </p>
            )}
          </ul>
        </section>
      </article>
    </div>
  );
}

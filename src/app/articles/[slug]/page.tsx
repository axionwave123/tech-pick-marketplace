import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-surface-400 light:text-surface-500">
        <Link href="/articles" className="hover:text-brand-400 light:hover:text-brand-600">
          Articles
        </Link>
        <span className="mx-1 text-surface-600 light:text-surface-400">/</span>
        <span className="text-white light:text-surface-900">{article.title}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-white light:text-surface-900 sm:text-4xl">
        {article.title}
      </h1>
      {article.excerpt && (
        <p className="mt-4 text-lg text-surface-200 light:text-surface-600">{article.excerpt}</p>
      )}
      <div className="prose prose-invert light:prose-slate mt-8 max-w-none whitespace-pre-wrap text-surface-100 light:text-surface-800">
        {article.content}
      </div>
      <p className="mt-10 text-xs text-surface-400 light:text-surface-500">
        Content is editorial. Affiliate links, when present, may generate commission. Verify prices on
        retailer sites.
      </p>
    </article>
  );
}

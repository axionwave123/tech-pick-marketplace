import { requireAdmin } from '@/lib/auth/admin';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArticleForm } from '../ArticleForm';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, content, featured_image_url, article_type, status')
    .eq('id', id)
    .maybeSingle();

  if (!article) notFound();

  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-brand-400 hover:underline">
        ← All articles
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-white">Edit article</h1>
      <p className="mt-1 text-sm text-surface-400">{article.title}</p>
      <ArticleForm
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          featured_image_url: article.featured_image_url,
          article_type: article.article_type,
          status: article.status,
        }}
      />
    </div>
  );
}

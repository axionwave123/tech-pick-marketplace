'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { slugify } from '@/lib/utils';

export type ArticleFormState = { error?: string; success?: string };

const ALLOWED_CATEGORIES = ['phone', 'laptop', 'audio', 'others'] as const;
const ALLOWED_PRICES = [
  'under50',
  'under100',
  '100to200',
  '200to300',
  '300to500',
  'over500',
] as const;
const ALLOWED_NEEDS = [
  'gaming',
  'content',
  'office',
  'students',
  'personal',
  'battery',
  'camera',
  'travel',
] as const;

async function db() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  return createClient();
}

function parseArticleFields(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  let slug = String(formData.get('slug') || '').trim();
  const excerpt = String(formData.get('excerpt') || '').trim() || null;
  const content = String(formData.get('content') || '').trim() || null;
  const featured_image_url = String(formData.get('featured_image_url') || '').trim() || null;
  const article_type = String(formData.get('article_type') || 'other');
  const status = String(formData.get('status') || 'draft');

  const filter_category_raw = String(formData.get('filter_category') || '').trim();
  const filter_price_raw = String(formData.get('filter_price') || '').trim();
  const filter_need_raw = String(formData.get('filter_need') || '').trim();
  let content_blocks: unknown = [];
  try {
    const raw = String(formData.get('content_blocks') || '[]');
    content_blocks = JSON.parse(raw);
    if (!Array.isArray(content_blocks)) content_blocks = [];
  } catch {
    content_blocks = [];
  }

  if (!title) return { error: 'Title is required.' as const };
  if (!slug) slug = slugify(title);
  else slug = slugify(slug);

  const allowedTypes = ['buying_guide', 'comparison', 'how_to', 'tech_tips', 'news', 'other'];
  const type = allowedTypes.includes(article_type) ? article_type : 'other';
  if (!['draft', 'published', 'archived'].includes(status)) {
    return { error: 'Invalid status.' as const };
  }

  const filter_category =
    filter_category_raw && (ALLOWED_CATEGORIES as readonly string[]).includes(filter_category_raw)
      ? filter_category_raw
      : null;
  const filter_price =
    filter_price_raw && (ALLOWED_PRICES as readonly string[]).includes(filter_price_raw)
      ? filter_price_raw
      : null;
  const filter_need =
    filter_need_raw && (ALLOWED_NEEDS as readonly string[]).includes(filter_need_raw)
      ? filter_need_raw
      : null;

  return {
    title,
    slug,
    excerpt,
    content,
    content_blocks,
    featured_image_url,
    article_type: type,
    status,
    filter_category,
    filter_price,
    filter_need,
  };
}

export async function createArticle(
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };

  const parsed = parseArticleFields(formData);
  if ('error' in parsed && !('title' in parsed)) {
    return { error: (parsed as { error: string }).error };
  }
  const {
    title,
    slug,
    excerpt,
    content,
    content_blocks,
    featured_image_url,
    article_type,
    status,
    filter_category,
    filter_price,
    filter_need,
  } = parsed as {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    content_blocks: unknown;
    featured_image_url: string | null;
    article_type: string;
    status: string;
    filter_category: string | null;
    filter_price: string | null;
    filter_need: string | null;
  };

  const supabase = await db();
  const { error } = await supabase.from('articles').insert({
    title,
    slug,
    excerpt,
    content,
    content_blocks,
    featured_image_url,
    article_type,
    status,
    filter_category,
    filter_price,
    filter_need,
    published_at: status === 'published' ? new Date().toISOString() : null,
  });

  if (error) {
    return {
      error: error.message.includes('duplicate')
        ? 'Slug already exists. Change the slug.'
        : error.message,
    };
  }

  revalidatePath('/articles');
  revalidatePath('/');
  revalidatePath('/admin/articles');
  redirect('/admin/articles');
}

export async function updateArticle(
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };

  const id = String(formData.get('id') || '').trim();
  if (!id) return { error: 'Missing article id.' };

  const parsed = parseArticleFields(formData);
  if ('error' in parsed && !('title' in parsed)) {
    return { error: (parsed as { error: string }).error };
  }
  const {
    title,
    slug,
    excerpt,
    content,
    content_blocks,
    featured_image_url,
    article_type,
    status,
    filter_category,
    filter_price,
    filter_need,
  } = parsed as {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    content_blocks: unknown;
    featured_image_url: string | null;
    article_type: string;
    status: string;
    filter_category: string | null;
    filter_price: string | null;
    filter_need: string | null;
  };

  const supabase = await db();
  const { data: existing } = await supabase
    .from('articles')
    .select('status, published_at')
    .eq('id', id)
    .maybeSingle();

  const published_at =
    status === 'published'
      ? existing?.published_at || new Date().toISOString()
      : null;

  const { error } = await supabase
    .from('articles')
    .update({
      title,
      slug,
      excerpt,
      content,
      content_blocks,
      featured_image_url,
      article_type,
      status,
      filter_category,
      filter_price,
      filter_need,
      published_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return {
      error: error.message.includes('duplicate')
        ? 'Slug already exists. Change the slug.'
        : error.message,
    };
  }

  revalidatePath('/articles');
  revalidatePath(`/articles/${slug}`);
  revalidatePath('/');
  revalidatePath('/admin/articles');
  redirect('/admin/articles');
}

export async function deleteArticle(articleId: string): Promise<ArticleFormState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };
  if (!articleId) return { error: 'Missing article id.' };

  const supabase = await db();

  await supabase.from('article_comments').delete().eq('article_id', articleId);

  const { error } = await supabase.from('articles').delete().eq('id', articleId);
  if (error) return { error: error.message };

  revalidatePath('/articles');
  revalidatePath('/');
  revalidatePath('/admin/articles');
  redirect('/admin/articles');
}

export async function submitArticleComment(
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const article_id = String(formData.get('article_id') || '').trim();
  const author_name = String(formData.get('author_name') || '').trim().slice(0, 80);
  const author_email = String(formData.get('author_email') || '').trim().slice(0, 120) || null;
  const body = String(formData.get('body') || '').trim().slice(0, 2000);

  if (!article_id) return { ok: false, error: 'Missing article.' };
  if (!author_name || author_name.length < 2) return { ok: false, error: 'Please enter your name.' };
  if (!body || body.length < 3) return { ok: false, error: 'Write a short comment.' };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('article_comments').insert({
      article_id,
      author_name,
      author_email,
      body,
      status: 'approved',
    });
    if (error) {
      const service = createServiceClient();
      const { error: e2 } = await service.from('article_comments').insert({
        article_id,
        author_name,
        author_email,
        body,
        status: 'approved',
      });
      if (e2) {
        console.error(e2);
        return { ok: false, error: 'Could not post comment.' };
      }
    }
    revalidatePath('/articles');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: 'Could not post comment.' };
  }
}

'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  createArticle,
  updateArticle,
  type ArticleFormState,
} from '@/app/actions/articles';

export type ArticleInitial = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  article_type: string | null;
  status: string | null;
};

export function ArticleForm({ initial }: { initial?: ArticleInitial }) {
  const isEdit = Boolean(initial?.id);
  const [state, setState] = useState<ArticleFormState>({});
  const [imageUrl, setImageUrl] = useState(initial?.featured_image_url || '');
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setState({ error: 'Image must be under 5MB.' });
      return;
    }
    setUploading(true);
    setState({});
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `articles/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        setState({ error: `Upload failed: ${error.message}` });
        setUploading(false);
        return;
      }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (err) {
      setState({ error: err instanceof Error ? err.message : 'Upload failed' });
    }
    setUploading(false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (imageUrl) fd.set('featured_image_url', imageUrl);
    else fd.set('featured_image_url', '');
    if (isEdit && initial) fd.set('id', initial.id);
    startTransition(async () => {
      const result = isEdit ? await updateArticle({}, fd) : await createArticle({}, fd);
      if (result?.error) setState(result);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 grid max-w-2xl gap-4 rounded-xl border border-surface-800 bg-surface-900 p-6"
    >
      {state.error && (
        <p className="rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <label className="block text-sm text-surface-300">
        Title *
        <input
          name="title"
          required
          defaultValue={initial?.title || ''}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          placeholder="Best Phones Under \u20a6200,000 in Nigeria"
        />
      </label>

      <label className="block text-sm text-surface-300">
        Slug (optional)
        <input
          name="slug"
          defaultValue={initial?.slug || ''}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          placeholder="best-phones-under-200k"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-surface-300">
          Type
          <select
            name="article_type"
            defaultValue={initial?.article_type || 'buying_guide'}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          >
            <option value="buying_guide">Buying guide</option>
            <option value="comparison">Comparison</option>
            <option value="how_to">How-to</option>
            <option value="tech_tips">Tips</option>
            <option value="news">News</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block text-sm text-surface-300">
          Status
          <select
            name="status"
            defaultValue={initial?.status || 'published'}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <label className="block text-sm text-surface-300">
        Excerpt (short summary for cards)
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={initial?.excerpt || ''}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          placeholder="A quick guide to the best budget phones\u2026"
        />
      </label>

      <label className="block text-sm text-surface-300">
        Full content
        <textarea
          name="content"
          rows={12}
          defaultValue={initial?.content || ''}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white"
          placeholder="Write your article here\u2026"
        />
      </label>

      <div className="rounded-lg border border-surface-700 bg-surface-950 p-4">
        <p className="text-sm font-semibold text-white">Featured image</p>
        <p className="mt-1 text-xs text-surface-400">
          Shows on the articles list, homepage cards, and the top of the article page.
        </p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onFileChange}
          className="mt-3 block w-full text-sm text-surface-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        {uploading && <p className="mt-2 text-xs text-brand-400">Uploading\u2026</p>}
        <label className="mt-3 block text-sm text-surface-300">
          Or image URL
          <input
            name="featured_image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-white"
            placeholder="https://\u2026"
          />
        </label>
        {imageUrl && (
          <div className="mt-3 overflow-hidden rounded-xl border border-surface-700 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
          </div>
        )}
        {imageUrl && (
          <button
            type="button"
            onClick={() => setImageUrl('')}
            className="mt-2 text-xs font-semibold text-red-400 hover:underline"
          >
            Remove image
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={pending || uploading}
        className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
      >
        {pending ? 'Saving\u2026' : isEdit ? 'Save changes' : 'Publish article'}
      </button>
    </form>
  );
}

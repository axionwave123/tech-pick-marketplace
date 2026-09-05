'use client';

import { useState, useTransition } from 'react';
import { submitArticleComment, type CommentFormState } from '@/app/actions/articles';

export function ArticleCommentForm({ articleId }: { articleId: string }) {
  const [state, setState] = useState<CommentFormState>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set('article_id', articleId);
    startTransition(async () => {
      const result = await submitArticleComment({}, fd);
      setState(result || {});
      if (result?.success) form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-surface-700 bg-surface-900/60 p-5 light:border-slate-200 light:bg-slate-50">
      <h3 className="text-sm font-bold text-white light:text-slate-900">Leave a comment</h3>
      {state.error && (
        <p className="mt-2 rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-2 rounded-lg border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          Thanks! Your comment was submitted and will appear after review.
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-surface-400 light:text-slate-600">
          Name *
          <input
            name="author_name"
            required
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
            placeholder="Your name"
          />
        </label>
        <label className="block text-xs text-surface-400 light:text-slate-600">
          Email (optional)
          <input
            name="author_email"
            type="email"
            maxLength={120}
            className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
            placeholder="you@email.com"
          />
        </label>
      </div>
      <label className="mt-3 block text-xs text-surface-400 light:text-slate-600">
        Comment *
        <textarea
          name="body"
          required
          rows={4}
          maxLength={2000}
          className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
          placeholder="Share your thoughts…"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Post comment'}
      </button>
    </form>
  );
}

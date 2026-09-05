'use client';

import { useState, useTransition } from 'react';
import { submitArticleComment } from '@/app/actions/articles';

export function ArticleCommentForm({ articleId }: { articleId: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('article_id', articleId);
    startTransition(async () => {
      const res = await submitArticleComment(fd);
      if (res.ok) {
        setDone(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-700/40 bg-emerald-950/30 p-5 text-center light:border-emerald-200 light:bg-emerald-50">
        <p className="font-bold text-emerald-300 light:text-emerald-800">Comment posted</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-2 text-sm font-semibold text-brand-400 hover:underline"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-surface-700 bg-surface-900/80 p-5 light:border-slate-200 light:bg-white">
      <p className="text-sm font-bold text-white light:text-slate-900">Leave a comment</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="author_name"
          required
          placeholder="Your name *"
          className="rounded-xl border border-surface-600 bg-surface-950 px-3 py-2.5 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
        />
        <input
          name="author_email"
          type="email"
          placeholder="Email (optional)"
          className="rounded-xl border border-surface-600 bg-surface-950 px-3 py-2.5 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
        />
      </div>
      <textarea
        name="body"
        required
        rows={4}
        placeholder="Share your thoughts…"
        className="w-full rounded-xl border border-surface-600 bg-surface-950 px-3 py-2.5 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-500 disabled:opacity-60"
      >
        {pending ? 'Posting…' : 'Post comment'}
      </button>
    </form>
  );
}

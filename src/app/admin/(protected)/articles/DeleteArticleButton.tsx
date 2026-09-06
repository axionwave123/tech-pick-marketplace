'use client';

import { useTransition } from 'react';
import { deleteArticle } from '@/app/actions/articles';

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm('Delete article "' + title + '"? This cannot be undone.')) return;
    startTransition(async () => {
      await deleteArticle(id);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="rounded-lg border border-red-800/60 bg-red-950/40 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-900/50 disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete'}
    </button>
  );
}

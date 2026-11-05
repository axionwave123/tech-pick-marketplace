'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { publishDraft } from '../research/actions';

type Props = {
  productId: string;
  /** solid = big green button on drafts page */
  variant?: 'link' | 'solid';
};

export function PublishButton({ productId, variant = 'link' }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onPublish() {
    startTransition(async () => {
      const res = await publishDraft(productId);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (variant === 'solid') {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={onPublish}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? 'Publishing…' : 'Publish'}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onPublish}
      className="text-left text-xs font-semibold text-emerald-400 hover:underline disabled:opacity-50"
    >
      {pending ? 'Publishing…' : 'Publish now'}
    </button>
  );
}

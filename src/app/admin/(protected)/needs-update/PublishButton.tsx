'use client';

import { useTransition } from 'react';
import { publishDraft } from '../research/actions';

export function PublishButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await publishDraft(productId);
        });
      }}
      className="text-left text-xs font-semibold text-emerald-400 hover:underline disabled:opacity-50"
    >
      {pending ? 'Publishing…' : 'Publish now'}
    </button>
  );
}

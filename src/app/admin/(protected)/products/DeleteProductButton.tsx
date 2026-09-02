'use client';

import { useTransition } from 'react';
import { deleteProduct } from './actions';

export function DeleteProductButton({
  productId,
  productName,
  compact = false,
}: {
  productId: string;
  productName: string;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            `Delete “${productName}”? This removes the product, its images, and prices. This cannot be undone.`
          )
        ) {
          return;
        }
        startTransition(async () => {
          await deleteProduct(productId);
        });
      }}
      className={
        compact
          ? 'rounded-lg border border-red-800 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/50 disabled:opacity-50'
          : 'rounded-lg border border-red-700 bg-red-950/50 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-900/50 disabled:opacity-50'
      }
    >
      {pending ? 'Deleting…' : compact ? 'Delete' : 'Delete product'}
    </button>
  );
}

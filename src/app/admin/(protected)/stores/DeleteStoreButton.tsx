'use client';

import { useTransition } from 'react';
import { deleteStore } from './actions';

export function DeleteStoreButton({
  storeId,
  storeName,
}: {
  storeId: string;
  storeName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useStateMsg();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete store “${storeName}”? Only works if it has no product prices.`)) return;
          startTransition(async () => {
            const res = await deleteStore(storeId);
            if (res.error) setMsg(res.error);
            else setMsg(res.success || 'Deleted');
          });
        }}
        className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/50 disabled:opacity-50"
      >
        {pending ? '…' : 'Delete'}
      </button>
      {msg && <p className="mt-1 text-xs text-amber-300">{msg}</p>}
    </div>
  );
}

function useStateMsg() {
  const { useState } = require('react') as typeof import('react');
  return useState('' as string);
}

'use client';

import { useState, useTransition } from 'react';
import { runTrackingNow } from './actions';

export function RunTrackButton() {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await runTrackingNow();
            setMsg(res.error || res.summary || 'Done');
          });
        }}
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500 disabled:opacity-50"
      >
        {pending ? 'Tracking… (up to 60s)' : 'Run tracking now'}
      </button>
      {msg && <p className="max-w-xs text-right text-xs text-surface-400">{msg}</p>}
    </div>
  );
}

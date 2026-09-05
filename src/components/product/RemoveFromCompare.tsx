'use client';

import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'techpick_compare_ids';

function readIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * X control under each product column on /compare — removes that product from the list.
 */
export function RemoveFromCompare({
  productId,
  allIds,
}: {
  productId: string;
  allIds: string[];
}) {
  const router = useRouter();

  function onRemove() {
    const next = allIds.filter((id) => id !== productId);
    try {
      const stored = readIds().filter((id) => id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(0, 4)));
    } catch {
      // ignore storage errors
    }
    if (next.length === 0) {
      router.push('/compare');
    } else {
      router.push(`/compare?ids=${next.join(',')}`);
    }
  }

  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove from comparison"
      title="Remove from comparison"
      className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-surface-600 bg-surface-800 text-surface-300 transition hover:border-red-500/60 hover:bg-red-950/50 hover:text-red-300 active:scale-95 light:border-slate-300 light:bg-white light:text-slate-500 light:hover:border-red-300 light:hover:bg-red-50 light:hover:text-red-600"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

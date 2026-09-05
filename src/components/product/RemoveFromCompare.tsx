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
 * Remove control — sits on the product image corner.
 * White pill so it stays clear on any photo background.
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
      // ignore
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-600 shadow-md backdrop-blur transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

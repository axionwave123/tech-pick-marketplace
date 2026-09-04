'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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

function writeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 4)));
}

/**
 * Professional secondary action — outline style that blends with the page,
 * not a solid white sticker.
 */
export function CompareButton({ productId }: { productId: string }) {
  const [href, setHref] = useState(`/compare?ids=${productId}`);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const ids = readIds();
    setAdded(ids.includes(productId));
    const next = ids.includes(productId) ? ids : [...ids, productId].slice(0, 4);
    setHref(`/compare?ids=${next.join(',')}`);
  }, [productId]);

  const onClick = () => {
    const ids = readIds();
    const next = ids.includes(productId) ? ids : [...ids, productId].slice(0, 4);
    writeIds(next);
    setAdded(true);
    setHref(`/compare?ids=${next.join(',')}`);
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        added
          ? 'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-500/60 bg-brand-600/15 px-5 text-sm font-semibold text-brand-300 transition hover:bg-brand-600/25 light:border-brand-600 light:bg-brand-50 light:text-brand-700 light:hover:bg-brand-100'
          : 'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-surface-500 bg-transparent px-5 text-sm font-semibold text-surface-100 transition hover:border-surface-300 hover:bg-white/5 light:border-slate-300 light:text-slate-800 light:hover:border-slate-400 light:hover:bg-slate-50'
      }
    >
      {added ? (
        <>
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          In compare list
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4 shrink-0 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          Add to compare
        </>
      )}
    </Link>
  );
}

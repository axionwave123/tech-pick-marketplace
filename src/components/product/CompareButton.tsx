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
 * High-contrast secondary action — white text in dark mode, dark text in light mode.
 * Contrast is enforced via .compare-btn rules in globals.css.
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
          ? 'compare-btn compare-btn--added inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 px-5 text-sm font-semibold shadow-sm transition'
          : 'compare-btn inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 px-5 text-sm font-semibold shadow-sm transition'
      }
    >
      <svg
        className="h-4 w-4 shrink-0 opacity-95"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.25}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
        />
      </svg>
      {added ? 'Compare products' : 'Add to compare'}
    </Link>
  );
}

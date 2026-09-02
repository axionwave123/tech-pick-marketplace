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
 * Dark page: white button + black label
 * Light page: black button + white label
 * Uses global .compare-btn with !important so nothing washes it out.
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
      className="compare-btn"
      // Inline fallback if CSS fails to load
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        padding: '0 16px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 700,
        textDecoration: 'none',
        border: '1px solid #94a3b8',
        backgroundColor: '#ffffff',
        color: '#000000',
      }}
    >
      <span
        style={{
          color: 'inherit',
          fontWeight: 700,
        }}
      >
        {added ? 'Compare list →' : 'Add to compare'}
      </span>
    </Link>
  );
}

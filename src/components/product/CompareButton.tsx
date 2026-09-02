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
 * High-contrast compare CTA:
 * Dark theme → white bg + black text
 * Light theme → dark bg + white text
 */
export function CompareButton({ productId }: { productId: string }) {
  const [isLight, setIsLight] = useState(false);
  const [href, setHref] = useState(`/compare?ids=${productId}`);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const read = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

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

  const style: React.CSSProperties = isLight
    ? {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        padding: '0 16px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 700,
        textDecoration: 'none',
        border: '1px solid #1e293b',
        backgroundColor: '#0f172a',
        color: '#ffffff',
      }
    : {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        padding: '0 16px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 700,
        textDecoration: 'none',
        border: '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        color: '#000000',
      };

  return (
    <Link href={href} style={style} onClick={onClick}>
      {added ? 'Compare list →' : 'Add to compare'}
    </Link>
  );
}

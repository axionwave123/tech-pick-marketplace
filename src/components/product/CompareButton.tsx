'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * High-contrast compare CTA:
 * - Dark page → white background, black text
 * - Light page → black background, white text
 * Styles are applied via inline style so global CSS cannot wash out the label.
 */
export function CompareButton({ productId }: { productId: string }) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const read = () => {
      const html = document.documentElement;
      setIsLight(html.classList.contains('light'));
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

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
    <Link href={`/compare?ids=${productId}`} style={style}>
      Add to compare
    </Link>
  );
}

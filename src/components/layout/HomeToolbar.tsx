'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const quickLinks = [
  { href: '/categories/smartphones', label: 'Categories' },
  { href: '/deals', label: 'Deals' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/articles', label: 'Articles' },
  { href: '/compare', label: 'Compare' },
  { href: '/search', label: 'Search' },
];

/** Visible bar directly under the hero — theme toggle + main nav */
export function HomeToolbar() {
  return (
    <div className="border-b border-surface-700 bg-surface-900/95 light:border-slate-200 light:bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-surface-400 light:text-slate-500">
            Theme
          </span>
          <ThemeToggle />
          <span className="hidden text-xs text-surface-400 sm:inline light:text-slate-500">
            Dark / Light
          </span>
        </div>

        <div className="hidden h-6 w-px bg-surface-700 sm:block light:bg-slate-200" />

        <nav
          className="flex min-w-0 flex-1 gap-2 overflow-x-auto scrollbar-hide"
          aria-label="Quick navigation"
        >
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-surface-600 bg-surface-800 px-3.5 py-1.5 text-xs font-semibold text-surface-100 transition hover:border-brand-500 hover:bg-brand-600 hover:text-white light:border-slate-200 light:bg-slate-50 light:text-slate-800 light:hover:border-brand-500 light:hover:bg-brand-600 light:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

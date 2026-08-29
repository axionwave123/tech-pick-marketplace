'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';

const labels: Record<string, string> = {
  categories: 'Categories',
  smartphones: 'Phones',
  laptops: 'Laptops',
  tablets: 'Tablets',
  audio: 'Audio',
  wearables: 'Watches',
  gaming: 'Gaming',
  tvs: 'TVs',
  'power-banks': 'Power',
  deals: 'Deals',
  reviews: 'Reviews',
  articles: 'Articles',
  compare: 'Compare',
  search: 'Search',
  products: 'Products',
  profile: 'Profile',
  about: 'About',
  contact: 'Contact',
  admin: 'Admin',
};

function titleCase(segment: string) {
  if (labels[segment]) return labels[segment];
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function PageNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on home
  if (!pathname || pathname === '/') return null;

  const parts = pathname.split('/').filter(Boolean);
  const crumbs = parts.map((part, i) => {
    const href = '/' + parts.slice(0, i + 1).join('/');
    return { href, label: titleCase(part) };
  });

  return (
    <div className="sticky top-14 z-40 border-b border-surface-700/80 bg-surface-900/95 backdrop-blur-md dark:border-surface-700/80 dark:bg-surface-900/95 light:border-surface-200 light:bg-white/95 sm:top-16">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 lg:px-8">
        {/* Back — large, obvious */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-500/40 bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-neon transition hover:bg-brand-500 active:scale-[0.98]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden xs:inline sm:inline">Back</span>
        </button>

        {/* Home shortcut */}
        <Link
          href="/"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-600 text-surface-200 transition hover:border-brand-500/50 hover:text-white light:border-surface-300 light:text-surface-700 light:hover:text-brand-700"
          aria-label="Home"
        >
          <Home className="h-4 w-4" />
        </Link>

        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="min-w-0 flex-1 overflow-x-auto scrollbar-hide"
        >
          <ol className="flex items-center gap-1 text-xs sm:text-sm">
            <li className="hidden sm:block">
              <Link
                href="/"
                className="font-medium text-surface-400 hover:text-brand-300 light:text-surface-500 light:hover:text-brand-600"
              >
                Home
              </Link>
            </li>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={c.href} className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-surface-500 light:text-surface-400" />
                  {last ? (
                    <span className="truncate font-semibold text-white light:text-surface-900">
                      {c.label}
                    </span>
                  ) : (
                    <Link
                      href={c.href}
                      className="truncate font-medium text-surface-400 hover:text-brand-300 light:text-surface-500 light:hover:text-brand-600"
                    >
                      {c.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}

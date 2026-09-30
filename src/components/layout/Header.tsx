'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const nav = [
  { href: '/categories/smartphones', label: 'Categories', match: '/categories' },
  { href: '/deals', label: 'Deals', match: '/deals' },
  { href: '/reviews', label: 'Reviews', match: '/reviews' },
  { href: '/articles', label: 'Articles', match: '/articles' },
  { href: '/compare', label: 'Compare', match: '/compare' },
];

function isActive(pathname: string | null, match: string) {
  if (!pathname) return false;
  return pathname === match || pathname.startsWith(`${match}/`);
}

export function Header() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    const params = new URLSearchParams();
    params.set('q', q.trim());
    const catMatch = pathname?.match(/^\/categories\/([^/?#]+)/);
    if (catMatch?.[1]) params.set('category', catMatch[1]);
    router.push(`/search?${params.toString()}`);
    setOpen(false);
  }

  return (
    <header className="liquid-header sticky top-0 z-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden" aria-hidden>
        <div className="liquid-blob liquid-blob-a" />
        <div className="liquid-blob liquid-blob-b" />
      </div>

      <div className="relative mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-2 font-display font-bold text-white light:text-slate-900">
          <Link
            href="/admin/login"
            title="Admin"
            aria-label="Admin"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.45)] transition hover:bg-brand-500 hover:shadow-[0_0_28px_rgba(37,99,235,0.55)]"
          >
            TP
          </Link>
          <Link href="/" className="text-sm font-bold tracking-tight sm:text-base">
            TechPick NG
          </Link>
        </div>

        <form onSubmit={onSearch} className="mx-auto hidden max-w-md flex-1 md:flex lg:max-w-xl">
          <div className="liquid-search relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 light:text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands…"
              className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder:text-surface-400 outline-none backdrop-blur-xl transition focus:border-brand-400/50 focus:bg-white/10 focus:ring-2 focus:ring-brand-500/20 light:border-slate-200/80 light:bg-white/70 light:text-slate-900 light:placeholder:text-slate-500 light:focus:bg-white"
            />
          </div>
        </form>

        <nav className="liquid-nav-pill hidden items-center gap-0.5 p-1 lg:flex" aria-label="Main">
          {nav.map((item) => {
            const active = isActive(pathname, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'liquid-nav-item liquid-nav-item-active relative z-10'
                    : 'liquid-nav-item relative z-10'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="liquid-icon-btn">
            <ThemeToggle />
          </div>

          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-surface-100 backdrop-blur-md transition hover:border-white/25 hover:bg-white/10 light:border-slate-200 light:bg-white/80 light:text-slate-700 light:hover:bg-white"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/10 light:border-slate-200 light:bg-white/80 light:text-slate-800 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="liquid-mobile-panel relative border-t border-white/10 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <form onSubmit={onSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 light:text-slate-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder:text-surface-400 outline-none backdrop-blur-xl focus:border-brand-400/50 light:border-slate-200 light:bg-white light:text-slate-900 light:placeholder:text-slate-500"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-1.5">
            {nav.map((item) => {
              const active = isActive(pathname, item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={
                    active
                      ? 'liquid-mobile-link liquid-mobile-link-active'
                      : 'liquid-mobile-link'
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="relative flex gap-2 overflow-x-auto border-t border-white/5 px-3 py-2.5 scrollbar-hide lg:hidden">
        {nav.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? 'liquid-chip liquid-chip-active shrink-0'
                  : 'liquid-chip shrink-0'
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

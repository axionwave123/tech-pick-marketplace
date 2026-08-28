'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

const nav = [
  { href: '/categories/smartphones', label: 'Categories' },
  { href: '/deals', label: 'Deals' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/articles', label: 'Articles' },
  { href: '/compare', label: 'Compare' },
];

export function Header() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-surface-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-brand-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
            TP
          </span>
          <span className="text-sm sm:text-base">TechPick NG</span>
        </Link>

        {/* Desktop / tablet search */}
        <form onSubmit={onSearch} className="mx-auto hidden max-w-xl flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands, categories…"
              className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </form>

        {/* Desktop nav links (mockup: Categories, Deals, Reviews, Articles, Compare) */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-200 text-surface-600 hover:bg-surface-50"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet slide-down menu with full nav */}
      {open && (
        <div className="border-t border-surface-200 bg-white px-4 py-4 lg:hidden">
          <form onSubmit={onSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:bg-white"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-surface-800 hover:bg-surface-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Optional: quick nav chips under header on small screens when menu closed */}
      <div className="flex gap-2 overflow-x-auto border-t border-surface-100 bg-white px-3 py-2 scrollbar-hide lg:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-medium text-surface-700"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

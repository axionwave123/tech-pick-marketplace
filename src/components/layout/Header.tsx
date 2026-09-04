'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-surface-950/95 backdrop-blur-md light:border-slate-200 light:bg-white/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-2 font-display font-bold text-white light:text-slate-900">
          {/* Blue TP badge → ONLY public entry to admin login / dashboard */}
          <Link
            href="/admin/login"
            title="Admin"
            aria-label="Admin"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-neon transition hover:bg-brand-500"
          >
            TP
          </Link>
          <Link href="/" className="text-sm font-bold tracking-tight sm:text-base">
            TechPick NG
          </Link>
        </div>

        <form onSubmit={onSearch} className="mx-auto hidden max-w-xl flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 light:text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands…"
              className="w-full rounded-xl border border-surface-700 bg-surface-900 py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder:text-surface-400 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 light:border-slate-200 light:bg-slate-50 light:text-slate-900 light:placeholder:text-slate-500"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-surface-100 hover:bg-white/5 hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-700 text-surface-100 hover:bg-white/5 light:border-slate-200 light:text-slate-700 light:hover:bg-slate-100"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-600 text-white light:border-slate-200 light:text-slate-800 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-surface-950 px-4 py-4 light:border-slate-200 light:bg-white lg:hidden">
          <form onSubmit={onSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 light:text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-xl border border-surface-600 bg-surface-900 py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder:text-surface-400 outline-none focus:border-brand-500 light:border-slate-200 light:bg-slate-50 light:text-slate-900 light:placeholder:text-slate-500"
              />
            </div>
          </form>
          {/* High-contrast mobile links — no Admin login here */}
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="mobile-nav-link rounded-lg px-3 py-3.5 text-base font-bold"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile nav chips under header */}
      <div className="flex gap-2 overflow-x-auto border-t border-white/5 bg-surface-950 px-3 py-2.5 scrollbar-hide light:border-slate-100 light:bg-white lg:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mobile-chip shrink-0 rounded-full border border-surface-500 bg-surface-800 px-3.5 py-1.5 text-xs font-bold light:border-slate-200 light:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

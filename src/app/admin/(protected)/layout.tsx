import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

/** Primary product actions — always visible in the top header */
const primaryNav = [
  { href: '/admin/products', label: 'Product list' },
  { href: '/admin/products/new', label: 'Add product' },
  { href: '/admin/offers', label: 'See prices' },
];

const sideLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Product list' },
  { href: '/admin/products/new', label: 'Add product' },
  { href: '/admin/offers', label: 'See prices' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/stores', label: 'Stores' },
  { href: '/admin/research', label: 'AI Research' },
  { href: '/admin/moderation', label: 'Moderation' },
  { href: '/admin/analytics', label: 'Analytics' },
];

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    if (auth.reason === 'unauthenticated') {
      redirect('/admin/login');
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950 text-white">
        <div className="text-center">
          <h1 className="text-xl font-bold">Access denied</h1>
          <p className="mt-2 text-surface-400">Your account is not an administrator.</p>
          <Link href="/" className="mt-4 inline-block text-brand-400 hover:underline">
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-950 text-surface-100">
      {/* Top header — Product list / Add product / See prices always visible */}
      <header className="sticky top-0 z-40 border-b border-surface-800 bg-surface-900">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-2 font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm">
              TP
            </span>
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <nav className="flex flex-1 items-center gap-1.5 overflow-x-auto scrollbar-hide sm:gap-2">
            {primaryNav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold sm:text-sm ${
                  l.href === '/admin/products/new'
                    ? 'bg-brand-600 text-white hover:bg-brand-500'
                    : 'bg-surface-800 text-surface-100 hover:bg-surface-700 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="shrink-0 text-xs font-medium text-surface-400 hover:text-white sm:text-sm"
          >
            ← Site
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-surface-800 bg-surface-900 p-4 md:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-surface-500">Menu</p>
          <nav className="flex flex-col gap-1">
            {sideLinks.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-8 block text-xs text-surface-500 hover:text-surface-300">
            ← Public site
          </Link>
        </aside>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

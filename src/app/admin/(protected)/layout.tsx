import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/stores', label: 'Stores' },
  { href: '/admin/offers', label: 'Offers' },
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
    <div className="flex min-h-screen bg-surface-950 text-surface-100">
      <aside className="hidden w-56 shrink-0 border-r border-surface-800 bg-surface-900 p-4 md:block">
        <div className="mb-8 flex items-center gap-2 font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm">TP</span>
          Admin
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-surface-300 hover:bg-surface-800 hover:text-white"
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
        <div className="border-b border-surface-800 px-4 py-3 md:hidden">
          <p className="text-sm font-semibold text-white">TechPick Admin</p>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

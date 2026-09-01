import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDashboard() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();

  const [products, articles, editorial, comments, stores, offers, drafts] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('editorial_reviews').select('id', { count: 'exact', head: true }),
    supabase.from('user_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('stores').select('id', { count: 'exact', head: true }),
    supabase.from('product_offers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
  ]);

  const stats = [
    { label: 'Products', value: products.count ?? 0, href: '/admin/products' },
    { label: 'Drafts / needs review', value: drafts.count ?? 0, href: '/admin/needs-update' },
    { label: 'Active offers / prices', value: offers.count ?? 0, href: '/admin/offers' },
    { label: 'Articles', value: articles.count ?? 0, href: '/admin/articles' },
    { label: 'Editorial reviews', value: editorial.count ?? 0, href: '/admin/reviews' },
    { label: 'Pending community', value: comments.count ?? 0, href: '/admin/moderation' },
    { label: 'Stores', value: stores.count ?? 0, href: '/admin/stores' },
  ];

  const quick = [
    {
      href: '/admin/research',
      title: 'AI Research',
      desc: 'Type a name → create draft for approval',
    },
    {
      href: '/admin/needs-update',
      title: 'Needs update',
      desc: 'Drafts, missing image/price, stale prices',
      primary: true,
    },
    {
      href: '/admin/products/new',
      title: 'Add product',
      desc: 'Manual: image + ₦ price + publish',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-surface-400">Welcome back, Admin</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {quick.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className={`rounded-xl border p-4 transition ${
              q.primary
                ? 'border-brand-500 bg-brand-600 text-white hover:bg-brand-500'
                : 'border-surface-700 bg-surface-900 hover:border-brand-500/50'
            }`}
          >
            <p className="text-base font-bold text-white">{q.title}</p>
            <p className={`mt-1 text-xs ${q.primary ? 'text-brand-100' : 'text-surface-400'}`}>{q.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-surface-800 bg-surface-900 p-5 transition hover:border-brand-500/40"
          >
            <p className="text-sm text-surface-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-surface-800 bg-surface-900 p-5">
        <h2 className="font-semibold text-white">How auto draft works</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-surface-400">
          <li>
            Open <strong className="text-surface-200">AI Research</strong>, type a product name, run research.
          </li>
          <li>A <strong className="text-surface-200">draft</strong> is saved (not public).</li>
          <li>
            Open <strong className="text-surface-200">Needs update</strong> → add image & price → Publish when
            ready.
          </li>
        </ol>
      </div>
    </div>
  );
}

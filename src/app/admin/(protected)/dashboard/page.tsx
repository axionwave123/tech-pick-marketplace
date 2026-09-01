import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDashboard() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();

  const [products, articles, editorial, comments, stores, offers] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('editorial_reviews').select('id', { count: 'exact', head: true }),
    supabase.from('user_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('stores').select('id', { count: 'exact', head: true }),
    supabase.from('product_offers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  const stats = [
    { label: 'Products', value: products.count ?? 0, href: '/admin/products' },
    { label: 'Active offers / prices', value: offers.count ?? 0, href: '/admin/offers' },
    { label: 'Articles', value: articles.count ?? 0, href: '/admin/articles' },
    { label: 'Editorial reviews', value: editorial.count ?? 0, href: '/admin/reviews' },
    { label: 'Pending community', value: comments.count ?? 0, href: '/admin/moderation' },
    { label: 'Stores', value: stores.count ?? 0, href: '/admin/stores' },
  ];

  const quick = [
    {
      href: '/admin/products',
      title: 'Product list',
      desc: 'View, open, and manage all products',
    },
    {
      href: '/admin/products/new',
      title: 'Add product',
      desc: 'Name, image upload, price, publish',
      primary: true,
    },
    {
      href: '/admin/offers',
      title: 'See prices',
      desc: 'All store offers and last-checked times',
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
            <p className={`text-base font-bold ${q.primary ? 'text-white' : 'text-white'}`}>{q.title}</p>
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
        <h2 className="font-semibold text-white">Quick tips</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-surface-400">
          <li>
            Use <strong className="text-surface-200">Add product</strong> to upload an image and set a ₦
            price.
          </li>
          <li>
            <strong className="text-surface-200">See prices</strong> lists every store offer and when it was
            last checked.
          </li>
          <li>Published products show on the public site; drafts stay admin-only.</li>
        </ul>
      </div>
    </div>
  );
}

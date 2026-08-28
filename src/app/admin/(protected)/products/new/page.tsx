import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NewProductPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Add / Edit Product</h1>
      <p className="mt-2 text-sm text-surface-400">
        Fields: name, brand, category, images, description, specifications, tags, SEO, slug, status. Connect server actions to Supabase + Storage.
      </p>
      <div className="mt-6 grid gap-4 rounded-xl border border-surface-800 bg-surface-900 p-6">
        <label className="block text-sm text-surface-300">
          Product name
          <input className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white" placeholder="Samsung Galaxy A26" />
        </label>
        <label className="block text-sm text-surface-300">
          Slug
          <input className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white" placeholder="samsung-galaxy-a26" />
        </label>
        <label className="block text-sm text-surface-300">
          Status
          <select className="mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-white">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="flex gap-3">
          <button type="button" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Save draft</button>
          <Link href="/admin/research" className="rounded-lg border border-surface-600 px-4 py-2 text-sm text-surface-200">AI Research</Link>
        </div>
      </div>
    </div>
  );
}

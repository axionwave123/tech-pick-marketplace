import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '../ProductForm';

export default async function NewProductPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const supabase = await createClient();
  const [{ data: brands }, { data: categories }, { data: stores }] = await Promise.all([
    supabase.from('brands').select('id, name').order('name'),
    supabase.from('categories').select('id, name').eq('is_active', true).order('sort_order'),
    supabase.from('stores').select('id, name').eq('status', 'active').order('name'),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-surface-400 hover:text-white">
          ← Products
        </Link>
      </div>
      <h1 className="mt-2 text-2xl font-bold text-white">Add product</h1>
      <p className="mt-2 text-sm text-surface-400">
        Fill the form, upload an image, then add one or more store prices (Jumia, Amazon, Temu…).
        Use <strong className="text-surface-200">+ Add store offer</strong> for each retailer so
        shoppers can compare prices.
      </p>
      <ProductForm
        brands={brands || []}
        categories={categories || []}
        stores={stores || []}
      />
    </div>
  );
}

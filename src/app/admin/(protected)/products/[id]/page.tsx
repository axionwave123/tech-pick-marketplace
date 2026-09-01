import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { ProductForm } from '../ProductForm';
import { DeleteProductButton } from '../DeleteProductButton';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) redirect('/admin/login');

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: brands }, { data: categories }, { data: stores }] =
    await Promise.all([
      supabase
        .from('products')
        .select(
          `id, name, slug, status, short_description, brand_id, category_id,
           product_images ( url, is_primary ),
           product_offers ( id, price, original_price, product_url, status, store_id )`
        )
        .eq('id', id)
        .maybeSingle(),
      supabase.from('brands').select('id, name').order('name'),
      supabase.from('categories').select('id, name').order('name'),
      supabase.from('stores').select('id, name').order('name'),
    ]);

  if (!product) notFound();

  const image =
    (product.product_images || []).find((i: any) => i.is_primary)?.url ||
    (product.product_images || [])[0]?.url ||
    '';
  const offer =
    (product.product_offers || []).find((o: any) => o.status === 'active') ||
    (product.product_offers || [])[0];

  const initial = {
    id: product.id,
    name: product.name || '',
    slug: product.slug || '',
    status: product.status || 'draft',
    short_description: product.short_description || '',
    brand_id: product.brand_id || '',
    category_id: product.category_id || '',
    image_url: image,
    store_id: offer?.store_id || '',
    price: offer?.price != null ? String(offer.price) : '',
    original_price: offer?.original_price != null ? String(offer.original_price) : '',
    product_url: offer?.product_url || '',
    offer_id: offer?.id || '',
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/products" className="text-sm text-brand-400 hover:underline">
            ← Product list
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">Edit product</h1>
          <p className="mt-1 text-sm text-surface-400">{product.name}</p>
        </div>
        <DeleteProductButton productId={product.id} productName={product.name} />
      </div>

      <ProductForm
        brands={brands || []}
        categories={categories || []}
        stores={stores || []}
        initial={initial}
      />
    </div>
  );
}

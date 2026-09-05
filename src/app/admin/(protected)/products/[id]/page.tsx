import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { ProductForm, type OfferRow } from '../ProductForm';
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
           product_images ( url, is_primary, sort_order ),
           product_offers ( id, price, original_price, product_url, status, store_id )`
        )
        .eq('id', id)
        .maybeSingle(),
      supabase.from('brands').select('id, name').order('name'),
      supabase.from('categories').select('id, name').order('name'),
      supabase.from('stores').select('id, name').order('name'),
    ]);

  if (!product) notFound();

  const sortedImgs = [...(product.product_images || [])].sort((a: any, b: any) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  const imageUrls = sortedImgs.map((i: any) => i.url).filter(Boolean);
  const image = imageUrls[0] || '';

  const activeOffers = (product.product_offers || []).filter(
    (o: any) => o.status === 'active' || !o.status
  );

  const offers: OfferRow[] =
    activeOffers.length > 0
      ? activeOffers.map((o: any, i: number) => ({
          key: o.id || `existing-${i}`,
          offer_id: o.id,
          store_id: o.store_id || '',
          price: o.price != null ? String(o.price) : '',
          original_price: o.original_price != null ? String(o.original_price) : '',
          product_url: o.product_url || '',
        }))
      : [
          {
            key: 'empty-0',
            store_id: '',
            price: '',
            original_price: '',
            product_url: '',
          },
        ];

  const initial = {
    id: product.id,
    name: product.name || '',
    slug: product.slug || '',
    status: product.status || 'draft',
    short_description: product.short_description || '',
    brand_id: product.brand_id || '',
    category_id: product.category_id || '',
    image_url: image,
    image_urls: imageUrls,
    review_video_url: (product as any).review_video_url || '',
    offers,
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

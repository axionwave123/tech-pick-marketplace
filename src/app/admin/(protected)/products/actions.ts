'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { slugify } from '@/lib/utils';

export type ProductFormState = {
  error?: string;
  success?: boolean;
};

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return { error: 'Not authorized. Sign in as admin first.' };
  }

  const name = String(formData.get('name') || '').trim();
  let slug = String(formData.get('slug') || '').trim();
  const status = String(formData.get('status') || 'draft');
  const short_description = String(formData.get('short_description') || '').trim() || null;
  const brand_id = String(formData.get('brand_id') || '') || null;
  const category_id = String(formData.get('category_id') || '') || null;
  const image_url = String(formData.get('image_url') || '').trim() || null;
  const store_id = String(formData.get('store_id') || '') || null;
  const priceRaw = String(formData.get('price') || '').trim();
  const originalRaw = String(formData.get('original_price') || '').trim();
  const product_url = String(formData.get('product_url') || '').trim() || null;

  if (!name) return { error: 'Product name is required.' };
  if (!slug) slug = slugify(name);
  if (!['draft', 'published', 'archived'].includes(status)) {
    return { error: 'Invalid status.' };
  }

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      status,
      short_description,
      brand_id: brand_id || null,
      category_id: category_id || null,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message.includes('duplicate') ? 'Slug already exists. Change the slug.' : error.message };
  }

  if (image_url) {
    await supabase.from('product_images').insert({
      product_id: product.id,
      url: image_url,
      alt_text: name,
      is_primary: true,
      sort_order: 0,
    });
  }

  const price = priceRaw ? Number(priceRaw) : NaN;
  if (store_id && !Number.isNaN(price) && price > 0) {
    const original_price = originalRaw ? Number(originalRaw) : null;
    const discount =
      original_price && original_price > price
        ? Math.round(((original_price - price) / original_price) * 100)
        : null;

    await supabase.from('product_offers').insert({
      product_id: product.id,
      store_id,
      price,
      original_price: original_price && !Number.isNaN(original_price) ? original_price : null,
      currency: 'NGN',
      discount_percent: discount,
      availability: 'in_stock',
      product_url: product_url || 'https://www.jumia.com.ng/',
      affiliate_url: null,
      last_checked_at: new Date().toISOString(),
      status: 'active',
    });
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/deals');
  redirect('/admin/products');
}

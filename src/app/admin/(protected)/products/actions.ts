'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { slugify } from '@/lib/utils';

export type ProductFormState = {
  error?: string;
  success?: string;
};

function jumiaSearchUrl(name: string) {
  return `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(name.trim())}`;
}

async function db() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  return createClient();
}

function revalidateProductPaths(slug?: string) {
  revalidatePath('/admin/products');
  revalidatePath('/admin/drafts');
  revalidatePath('/admin/needs-update');
  revalidatePath('/');
  revalidatePath('/deals');
  revalidatePath('/search');
  if (slug) revalidatePath(`/products/${slug}`);
}

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
  let product_url = String(formData.get('product_url') || '').trim() || null;

  if (!name) return { error: 'Product name is required.' };
  if (!slug) slug = slugify(name);
  else slug = slugify(slug);
  if (!['draft', 'published', 'archived'].includes(status)) {
    return { error: 'Invalid status.' };
  }

  if (!product_url) product_url = jumiaSearchUrl(name);

  const supabase = await db();

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
    return {
      error: error.message.includes('duplicate')
        ? 'Slug already exists. Change the slug.'
        : error.message,
    };
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
      product_url,
      affiliate_url: null,
      last_checked_at: new Date().toISOString(),
      status: 'active',
    });
  }

  revalidateProductPaths(slug);
  redirect('/admin/products');
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };

  const id = String(formData.get('id') || '').trim();
  if (!id) return { error: 'Missing product id.' };

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
  let product_url = String(formData.get('product_url') || '').trim() || null;
  const offer_id = String(formData.get('offer_id') || '').trim() || null;

  if (!name) return { error: 'Product name is required.' };
  if (!slug) slug = slugify(name);
  else slug = slugify(slug);
  if (!['draft', 'published', 'archived'].includes(status)) {
    return { error: 'Invalid status.' };
  }
  if (!product_url) product_url = jumiaSearchUrl(name);

  const supabase = await db();

  const { data: existing } = await supabase
    .from('products')
    .select('status, published_at')
    .eq('id', id)
    .maybeSingle();

  const published_at =
    status === 'published' ? existing?.published_at || new Date().toISOString() : null;

  const { error } = await supabase
    .from('products')
    .update({
      name,
      slug,
      status,
      short_description,
      brand_id: brand_id || null,
      category_id: category_id || null,
      published_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return {
      error: error.message.includes('duplicate')
        ? 'Slug already exists. Change the slug.'
        : error.message,
    };
  }

  if (image_url) {
    const { data: imgs } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', id)
      .eq('is_primary', true)
      .limit(1);

    if (imgs && imgs.length > 0) {
      await supabase
        .from('product_images')
        .update({ url: image_url, alt_text: name })
        .eq('id', imgs[0].id);
    } else {
      await supabase.from('product_images').insert({
        product_id: id,
        url: image_url,
        alt_text: name,
        is_primary: true,
        sort_order: 0,
      });
    }
  }

  const price = priceRaw ? Number(priceRaw) : NaN;
  if (store_id && !Number.isNaN(price) && price > 0) {
    const original_price = originalRaw ? Number(originalRaw) : null;
    const discount =
      original_price && original_price > price
        ? Math.round(((original_price - price) / original_price) * 100)
        : null;

    const offerPayload = {
      product_id: id,
      store_id,
      price,
      original_price: original_price && !Number.isNaN(original_price) ? original_price : null,
      currency: 'NGN',
      discount_percent: discount,
      availability: 'in_stock',
      product_url,
      affiliate_url: null,
      last_checked_at: new Date().toISOString(),
      status: 'active',
      updated_at: new Date().toISOString(),
    };

    if (offer_id) {
      await supabase.from('product_offers').update(offerPayload).eq('id', offer_id);
    } else {
      await supabase.from('product_offers').insert(offerPayload);
    }
  }

  revalidateProductPaths(slug);
  return { success: 'Product updated.' };
}

export async function deleteProduct(productId: string): Promise<ProductFormState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };
  if (!productId) return { error: 'Missing product id.' };

  const supabase = await db();

  const { data: product } = await supabase
    .from('products')
    .select('slug, status')
    .eq('id', productId)
    .maybeSingle();

  await supabase.from('product_offers').delete().eq('product_id', productId);
  await supabase.from('product_images').delete().eq('product_id', productId);
  await supabase.from('product_specifications').delete().eq('product_id', productId);
  await supabase.from('editorial_reviews').delete().eq('product_id', productId);

  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) return { error: error.message };

  revalidateProductPaths(product?.slug);
  // Stay on drafts list when deleting a draft
  if (product?.status === 'draft') {
    redirect('/admin/drafts');
  }
  redirect('/admin/products');
}

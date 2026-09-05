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

type OfferInput = {
  offer_id?: string | null;
  store_id: string;
  price: string;
  original_price?: string | null;
  product_url?: string | null;
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
  revalidatePath('/admin/offers');
  revalidatePath('/');
  revalidatePath('/deals');
  revalidatePath('/search');
  if (slug) revalidatePath(`/products/${slug}`);
}

function parseOffersJson(formData: FormData): OfferInput[] {
  const raw = String(formData.get('offers_json') || '').trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (o: any) => o && typeof o.store_id === 'string' && o.store_id && o.price
    ) as OfferInput[];
  } catch {
    return [];
  }
}

function buildOfferPayload(
  productId: string,
  o: OfferInput,
  productName: string
) {
  const price = Number(o.price);
  const original_price = o.original_price ? Number(o.original_price) : null;
  const discount =
    original_price && !Number.isNaN(original_price) && original_price > price
      ? Math.round(((original_price - price) / original_price) * 100)
      : null;
  let product_url = (o.product_url || '').trim() || null;
  if (!product_url) product_url = jumiaSearchUrl(productName);

  return {
    product_id: productId,
    store_id: o.store_id,
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
  const review_video_url = String(formData.get('review_video_url') || '').trim() || null;
  const offerInputs = parseOffersJson(formData);

  if (!name) return { error: 'Product name is required.' };
  if (!slug) slug = slugify(name);
  else slug = slugify(slug);
  if (!['draft', 'published', 'archived'].includes(status)) {
    return { error: 'Invalid status.' };
  }

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
      review_video_url,
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

  const seenStores = new Set<string>();
  for (const o of offerInputs) {
    const price = Number(o.price);
    if (!o.store_id || Number.isNaN(price) || price <= 0) continue;
    if (seenStores.has(o.store_id)) continue;
    seenStores.add(o.store_id);
    await supabase.from('product_offers').insert(buildOfferPayload(product.id, o, name));
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
  const review_video_url = String(formData.get('review_video_url') || '').trim() || null;
  const offerInputs = parseOffersJson(formData);

  if (!name) return { error: 'Product name is required.' };
  if (!slug) slug = slugify(name);
  else slug = slugify(slug);
  if (!['draft', 'published', 'archived'].includes(status)) {
    return { error: 'Invalid status.' };
  }

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
      review_video_url,
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

  const seenStores = new Set<string>();
  const keptOfferIds = new Set<string>();

  for (const o of offerInputs) {
    const price = Number(o.price);
    if (!o.store_id || Number.isNaN(price) || price <= 0) continue;
    if (seenStores.has(o.store_id)) continue;
    seenStores.add(o.store_id);

    const payload = buildOfferPayload(id, o, name);

    if (o.offer_id) {
      await supabase.from('product_offers').update(payload).eq('id', o.offer_id);
      keptOfferIds.add(o.offer_id);
    } else {
      const { data: existingOffer } = await supabase
        .from('product_offers')
        .select('id')
        .eq('product_id', id)
        .eq('store_id', o.store_id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingOffer?.id) {
        await supabase.from('product_offers').update(payload).eq('id', existingOffer.id);
        keptOfferIds.add(existingOffer.id);
      } else {
        const { data: inserted } = await supabase
          .from('product_offers')
          .insert(payload)
          .select('id')
          .single();
        if (inserted?.id) keptOfferIds.add(inserted.id);
      }
    }
  }

  if (keptOfferIds.size > 0 || offerInputs.length === 0) {
    const { data: allOffers } = await supabase
      .from('product_offers')
      .select('id')
      .eq('product_id', id)
      .eq('status', 'active');

    for (const row of allOffers || []) {
      if (!keptOfferIds.has(row.id)) {
        await supabase
          .from('product_offers')
          .update({ status: 'inactive', updated_at: new Date().toISOString() })
          .eq('id', row.id);
      }
    }
  }

  revalidateProductPaths(slug);
  return { success: 'Product updated with store offers.' };
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
  if (product?.status === 'draft') {
    redirect('/admin/drafts');
  }
  redirect('/admin/products');
}

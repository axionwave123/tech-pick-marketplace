'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { slugify } from '@/lib/utils';

export type StoreFormState = {
  error?: string;
  success?: string;
};

async function db() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  return createClient();
}

export async function createStore(
  _prev: StoreFormState,
  formData: FormData
): Promise<StoreFormState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };

  const name = String(formData.get('name') || '').trim();
  let slug = String(formData.get('slug') || '').trim();
  const website_url = String(formData.get('website_url') || '').trim() || null;
  const logo_url = String(formData.get('logo_url') || '').trim() || null;
  const country_code = String(formData.get('country_code') || 'NG').trim() || 'NG';
  const status = String(formData.get('status') || 'active');

  if (!name) return { error: 'Store name is required.' };
  if (!slug) slug = slugify(name);
  else slug = slugify(slug);
  if (!['active', 'inactive'].includes(status)) return { error: 'Invalid status.' };

  const supabase = await db();
  const { error } = await supabase.from('stores').insert({
    name,
    slug,
    website_url,
    logo_url,
    country_code,
    status,
  });

  if (error) {
    return {
      error: error.message.includes('duplicate')
        ? 'That slug already exists. Use a different name/slug.'
        : error.message,
    };
  }

  revalidatePath('/admin/stores');
  revalidatePath('/admin/offers');
  revalidatePath('/admin/products');
  return { success: `Store “${name}” added. You can now attach prices/discounts per product.` };
}

export async function updateStore(
  _prev: StoreFormState,
  formData: FormData
): Promise<StoreFormState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };

  const id = String(formData.get('id') || '').trim();
  if (!id) return { error: 'Missing store id.' };

  const name = String(formData.get('name') || '').trim();
  let slug = String(formData.get('slug') || '').trim();
  const website_url = String(formData.get('website_url') || '').trim() || null;
  const logo_url = String(formData.get('logo_url') || '').trim() || null;
  const country_code = String(formData.get('country_code') || 'NG').trim() || 'NG';
  const status = String(formData.get('status') || 'active');

  if (!name) return { error: 'Store name is required.' };
  if (!slug) slug = slugify(name);
  else slug = slugify(slug);
  if (!['active', 'inactive'].includes(status)) return { error: 'Invalid status.' };

  const supabase = await db();
  const { error } = await supabase
    .from('stores')
    .update({
      name,
      slug,
      website_url,
      logo_url,
      country_code,
      status,
    })
    .eq('id', id);

  if (error) {
    return {
      error: error.message.includes('duplicate')
        ? 'That slug already exists.'
        : error.message,
    };
  }

  revalidatePath('/admin/stores');
  revalidatePath('/admin/offers');
  return { success: `Store “${name}” updated.` };
}

export async function deleteStore(storeId: string): Promise<StoreFormState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };
  if (!storeId) return { error: 'Missing store id.' };

  const supabase = await db();

  const { count } = await supabase
    .from('product_offers')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', storeId);

  if (count && count > 0) {
    return {
      error: `This store has ${count} product price(s). Remove or reassign those offers first, or set status to inactive instead of deleting.`,
    };
  }

  const { error } = await supabase.from('stores').delete().eq('id', storeId);
  if (error) return { error: error.message };

  revalidatePath('/admin/stores');
  return { success: 'Store deleted.' };
}

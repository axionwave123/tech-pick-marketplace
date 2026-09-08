'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export type UpdateOfferPriceState = {
  error?: string;
  success?: string;
};

async function db() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  return createClient();
}

/**
 * Update one or more store offers' prices from the See prices admin page.
 * Body: offers = [{ id, price, original_price? }]
 */
export async function updateOfferPrices(
  _prev: UpdateOfferPriceState,
  formData: FormData
): Promise<UpdateOfferPriceState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Unauthorized' };

  const raw = String(formData.get('offers_json') || '').trim();
  if (!raw) return { error: 'No prices to save' };

  let items: { id: string; price: number; original_price?: number | null }[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { error: 'Invalid payload' };
    items = parsed
      .map((o: { id?: string; price?: unknown; original_price?: unknown }) => {
        const id = typeof o?.id === 'string' ? o.id : '';
        const price = Number(o?.price);
        const original_price =
          o?.original_price === '' || o?.original_price == null
            ? null
            : Number(o.original_price);
        return { id, price, original_price };
      })
      .filter((o) => o.id && !Number.isNaN(o.price) && o.price > 0);
  } catch {
    return { error: 'Invalid JSON' };
  }

  if (!items.length) return { error: 'No valid prices' };

  const supabase = await db();
  const now = new Date().toISOString();
  let updated = 0;

  for (const item of items) {
    const discount_percent =
      item.original_price != null && item.original_price > item.price
        ? Math.round(((item.original_price - item.price) / item.original_price) * 1000) / 10
        : null;

    const { error } = await supabase
      .from('product_offers')
      .update({
        price: item.price,
        original_price: item.original_price,
        discount_percent,
        last_checked_at: now,
        updated_at: now,
      })
      .eq('id', item.id);

    if (!error) updated += 1;
  }

  revalidatePath('/admin/offers');
  revalidatePath('/admin/products');
  revalidatePath('/admin/needs-update');
  revalidatePath('/admin/drafts');
  revalidatePath('/');
  revalidatePath('/deals');

  if (updated === 0) return { error: 'Nothing was updated' };
  return {
    success: `Saved ${updated} store price${updated === 1 ? '' : 's'}`,
  };
}

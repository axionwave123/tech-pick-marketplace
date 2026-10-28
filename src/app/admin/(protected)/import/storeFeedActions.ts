'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { parseAffiliateCsv, parseAffiliateXmlLoose } from '@/lib/import/affiliateCsv';
import { bestNameMatch } from '@/lib/import/fuzzyMatch';
import type { ImportSummary, ImportResultRow } from './actions';

const STORE_IDS: Record<string, string> = {
  amazon: 'd1000000-0000-4000-8000-000000000002',
  temu: 'd1000000-0000-4000-8000-000000000004',
  konga: 'd1000000-0000-4000-8000-000000000003',
};

async function db() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  return createClient();
}

export async function importStoreFeedAction(formData: FormData): Promise<ImportSummary> {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return { error: 'Not authorized. Sign in as admin first.' };
  }

  const storeKey = String(formData.get('store') || '').toLowerCase().trim();
  const storeId = STORE_IDS[storeKey];
  if (!storeId) {
    return { error: 'Choose a store: Amazon, Temu, or Konga.' };
  }

  const file = formData.get('feed_file');
  if (!file || !(file instanceof File)) {
    return { error: 'Please choose a CSV or XML feed file.' };
  }
  if (file.size > 12 * 1024 * 1024) {
    return { error: 'File is too large (max 12 MB).' };
  }

  const minScoreRaw = Number(formData.get('min_score') || 0.62);
  const minScore = Math.min(0.95, Math.max(0.45, Number.isFinite(minScoreRaw) ? minScoreRaw : 0.62));
  const maxRaw = Number(formData.get('max_items') || 300);
  const maxItems = Math.min(Math.max(1, Number.isFinite(maxRaw) ? maxRaw : 300), 300);

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { error: 'Could not read the uploaded file.' };
  }

  let rowsFeed;
  try {
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.xml') || text.trimStart().startsWith('<')) {
      rowsFeed = parseAffiliateXmlLoose(text);
    } else {
      rowsFeed = parseAffiliateCsv(text);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to parse feed.' };
  }

  if (!rowsFeed.length) {
    return { error: 'No usable rows found in the feed.' };
  }

  const limited = rowsFeed.slice(0, maxItems);
  const supabase = await db();

  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, slug');

  if (pErr) return { error: pErr.message };
  if (!products?.length) {
    return {
      error:
        'No products in the catalog yet. Run Phase 1 (Jumia XML) first so there is something to match.',
    };
  }

  const catalog = products.map((p) => ({ id: p.id, name: p.name, slug: p.slug }));

  const resultRows: ImportResultRow[] = [];
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of limited) {
    try {
      if (row.price == null) {
        skipped += 1;
        resultRows.push({ name: row.name, action: 'skipped', detail: 'Missing price' });
        continue;
      }

      const match = bestNameMatch(row.name, catalog, minScore);
      if (!match) {
        skipped += 1;
        resultRows.push({
          name: row.name,
          action: 'skipped',
          detail: `No product match (>=${Math.round(minScore * 100)}%)`,
        });
        continue;
      }

      const discount =
        row.originalPrice && row.originalPrice > row.price
          ? Math.round(((row.originalPrice - row.price) / row.originalPrice) * 100)
          : null;

      const product_url = row.productUrl || null;
      const payload = {
        product_id: match.item.id,
        store_id: storeId,
        price: row.price,
        original_price: row.originalPrice,
        currency: 'NGN',
        discount_percent: discount,
        availability: 'in_stock',
        product_url,
        affiliate_url: row.productUrl,
        last_checked_at: new Date().toISOString(),
        status: 'active',
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from('product_offers')
        .select('id')
        .eq('product_id', match.item.id)
        .eq('store_id', storeId)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from('product_offers')
          .update(payload)
          .eq('id', existing.id);
        if (error) {
          errors += 1;
          resultRows.push({ name: row.name, action: 'error', detail: error.message });
          continue;
        }
      } else {
        const { error } = await supabase.from('product_offers').insert(payload);
        if (error) {
          errors += 1;
          resultRows.push({ name: row.name, action: 'error', detail: error.message });
          continue;
        }
      }

      updated += 1;
      const pct = Math.round(match.score * 100);
      resultRows.push({
        name: row.name,
        action: 'updated',
        detail: `-> ${match.item.name} (${pct}%) · ${storeKey} NGN ${row.price.toLocaleString()}`,
      });
    } catch (e) {
      errors += 1;
      resultRows.push({
        name: row.name,
        action: 'error',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }

  revalidatePath('/admin/products');
  revalidatePath('/admin/offers');
  revalidatePath('/admin/import');
  revalidatePath('/');
  revalidatePath('/search');
  revalidatePath('/deals');

  return {
    totalParsed: rowsFeed.length,
    created: 0,
    updated,
    skipped,
    errors,
    rows: resultRows.slice(0, 100),
  };
}

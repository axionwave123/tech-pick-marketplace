'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { slugify } from '@/lib/utils';
import {
  parseJumiaXml,
  guessCategorySlug,
  guessBrandSlug,
  type ParsedJumiaProduct,
} from '@/lib/import/jumiaXml';

const JUMIA_STORE_ID = 'd1000000-0000-4000-8000-000000000001';
const MAX_ITEMS = 300;

export type ImportResultRow = {
  name: string;
  action: 'created' | 'updated' | 'skipped' | 'error';
  detail?: string;
};

export type ImportSummary = {
  error?: string;
  totalParsed?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  errors?: number;
  rows?: ImportResultRow[];
};

async function db() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  return createClient();
}

function uniqueSlug(base: string, used: Set<string>): string {
  let s = slugify(base) || 'product';
  if (!used.has(s)) {
    used.add(s);
    return s;
  }
  let i = 2;
  while (used.has(`${s}-${i}`)) i += 1;
  const out = `${s}-${i}`;
  used.add(out);
  return out;
}

async function savePrimaryImage(
  supabase: Awaited<ReturnType<typeof db>>,
  productId: string,
  url: string | null,
  alt: string
) {
  if (!url || !/^https?:\/\//i.test(url)) return;
  await supabase.from('product_images').delete().eq('product_id', productId);
  await supabase.from('product_images').insert({
    product_id: productId,
    url,
    alt_text: alt,
    is_primary: true,
    sort_order: 0,
  });
}

async function upsertJumiaOffer(
  supabase: Awaited<ReturnType<typeof db>>,
  productId: string,
  item: ParsedJumiaProduct
) {
  if (item.price == null || !Number.isFinite(item.price)) {
    return { ok: false as const, reason: 'No valid price in feed' };
  }

  const discount =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : null;

  const product_url =
    item.productUrl ||
    `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(item.name)}`;

  const payload = {
    product_id: productId,
    store_id: JUMIA_STORE_ID,
    price: item.price,
    original_price: item.originalPrice,
    currency: 'NGN',
    discount_percent: discount,
    availability: 'in_stock',
    product_url,
    affiliate_url: item.productUrl,
    last_checked_at: new Date().toISOString(),
    status: 'active',
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from('product_offers')
    .select('id')
    .eq('product_id', productId)
    .eq('store_id', JUMIA_STORE_ID)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from('product_offers')
      .update(payload)
      .eq('id', existing.id);
    if (error) return { ok: false as const, reason: error.message };
  } else {
    const { error } = await supabase.from('product_offers').insert(payload);
    if (error) return { ok: false as const, reason: error.message };
  }
  return { ok: true as const };
}

export async function importJumiaXmlAction(formData: FormData): Promise<ImportSummary> {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return { error: 'Not authorized. Sign in as admin first.' };
  }

  const file = formData.get('xml_file');
  if (!file || !(file instanceof File)) {
    return { error: 'Please choose a Jumia XML file to upload.' };
  }
  if (file.size > 12 * 1024 * 1024) {
    return { error: 'File is too large (max 12 MB). Split the feed or export a smaller set.' };
  }

  const statusChoice = String(formData.get('status') || 'draft');
  const status = statusChoice === 'published' ? 'published' : 'draft';
  const maxRaw = Number(formData.get('max_items') || MAX_ITEMS);
  const maxItems = Math.min(Math.max(1, Number.isFinite(maxRaw) ? maxRaw : MAX_ITEMS), MAX_ITEMS);

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { error: 'Could not read the uploaded file.' };
  }

  let items: ParsedJumiaProduct[];
  try {
    items = parseJumiaXml(text);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to parse XML.' };
  }

  if (!items.length) {
    return { error: 'XML parsed but no usable products were found.' };
  }

  const limited = items.slice(0, maxItems);
  const supabase = await db();

  const [{ data: categories }, { data: brands }, { data: existingProducts }] =
    await Promise.all([
      supabase.from('categories').select('id, slug'),
      supabase.from('brands').select('id, slug'),
      supabase.from('products').select('id, name, slug'),
    ]);

  const catBySlug = new Map((categories || []).map((c) => [c.slug, c.id]));
  const brandBySlug = new Map((brands || []).map((b) => [b.slug, b.id]));
  const bySlug = new Map((existingProducts || []).map((p) => [p.slug, p]));
  const byName = new Map(
    (existingProducts || []).map((p) => [p.name.trim().toLowerCase(), p])
  );
  const usedSlugs = new Set((existingProducts || []).map((p) => p.slug));

  const rows: ImportResultRow[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of limited) {
    try {
      if (item.price == null) {
        skipped += 1;
        rows.push({ name: item.name, action: 'skipped', detail: 'Missing price' });
        continue;
      }

      const catSlug = guessCategorySlug(item.category, item.name);
      const brandSlug = guessBrandSlug(item.brand, item.name);
      const category_id = catSlug ? catBySlug.get(catSlug) || null : null;
      const brand_id = brandSlug ? brandBySlug.get(brandSlug) || null : null;

      let product = byName.get(item.name.trim().toLowerCase()) || null;
      if (!product) {
        const trySlug = slugify(item.name);
        product = bySlug.get(trySlug) || null;
      }

      if (product) {
        const { error: upErr } = await supabase
          .from('products')
          .update({
            short_description: item.description?.slice(0, 280) || undefined,
            category_id: category_id || undefined,
            brand_id: brand_id || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (upErr) {
          errors += 1;
          rows.push({ name: item.name, action: 'error', detail: upErr.message });
          continue;
        }

        await savePrimaryImage(supabase, product.id, item.imageUrl, item.name);
        const offerRes = await upsertJumiaOffer(supabase, product.id, item);
        if (!offerRes.ok) {
          errors += 1;
          rows.push({ name: item.name, action: 'error', detail: offerRes.reason });
          continue;
        }
        updated += 1;
        rows.push({
          name: item.name,
          action: 'updated',
          detail: `Jumia NGN ${item.price.toLocaleString()}`,
        });
        continue;
      }

      const slug = uniqueSlug(item.name, usedSlugs);
      const { data: createdProduct, error: insErr } = await supabase
        .from('products')
        .insert({
          name: item.name,
          slug,
          status,
          short_description: item.description?.slice(0, 280) || null,
          category_id,
          brand_id,
          published_at: status === 'published' ? new Date().toISOString() : null,
        })
        .select('id, name, slug')
        .single();

      if (insErr || !createdProduct) {
        errors += 1;
        rows.push({
          name: item.name,
          action: 'error',
          detail: insErr?.message || 'Insert failed',
        });
        continue;
      }

      bySlug.set(createdProduct.slug, createdProduct);
      byName.set(createdProduct.name.trim().toLowerCase(), createdProduct);

      await savePrimaryImage(supabase, createdProduct.id, item.imageUrl, item.name);
      const offerRes = await upsertJumiaOffer(supabase, createdProduct.id, item);
      if (!offerRes.ok) {
        errors += 1;
        rows.push({
          name: item.name,
          action: 'error',
          detail: `Product created but offer failed: ${offerRes.reason}`,
        });
        continue;
      }

      created += 1;
      rows.push({
        name: item.name,
        action: 'created',
        detail: `Jumia NGN ${item.price.toLocaleString()}`,
      });
    } catch (e) {
      errors += 1;
      rows.push({
        name: item.name,
        action: 'error',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }

  revalidatePath('/admin/products');
  revalidatePath('/admin/drafts');
  revalidatePath('/admin/offers');
  revalidatePath('/admin/import');
  revalidatePath('/');
  revalidatePath('/search');
  revalidatePath('/deals');

  return {
    totalParsed: items.length,
    created,
    updated,
    skipped,
    errors,
    rows: rows.slice(0, 80),
  };
}

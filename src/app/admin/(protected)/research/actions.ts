'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { slugify } from '@/lib/utils';
import { researchProductFromWeb } from '@/lib/research/webResearch';

export type ResearchState = {
  error?: string;
  success?: string;
  productId?: string;
};

function guessCategorySlug(name: string): string | null {
  const n = name.toLowerCase();
  if (/phone|iphone|galaxy|pixel|redmi|tecno|infinix|samsung a|samsung s/.test(n)) return 'smartphones';
  if (/laptop|macbook|notebook|chromebook/.test(n)) return 'laptops';
  if (/tablet|ipad/.test(n)) return 'tablets';
  if (/headphone|earbud|earphone|speaker|audio|buds/.test(n)) return 'audio';
  if (/watch|band|wearable/.test(n)) return 'wearables';
  if (/ps5|xbox|nintendo|console|gaming/.test(n)) return 'gaming';
  if (/\btv\b|television|smart tv/.test(n)) return 'tvs';
  if (/power bank|powerbank|charger/.test(n)) return 'power-banks';
  return null;
}

function guessBrandName(name: string): string | null {
  const brands = [
    'Samsung',
    'Apple',
    'Xiaomi',
    'Tecno',
    'Infinix',
    'Google',
    'Sony',
    'HP',
    'Dell',
    'Lenovo',
    'Asus',
    'Acer',
    'Huawei',
    'Oppo',
    'Vivo',
    'Nokia',
    'Oraimo',
    'Anker',
    'Redmi',
  ];
  const lower = name.toLowerCase();
  for (const b of brands) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  return null;
}

/** Web research → draft product with image + Jumia price when found. Never auto-publishes. */
export async function runResearch(
  _prev: ResearchState,
  formData: FormData
): Promise<ResearchState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };

  const name = String(formData.get('name') || '').trim();
  const notes = String(formData.get('notes') || '').trim();
  if (!name) return { error: 'Enter a product name to research.' };
  if (name.length < 3) return { error: 'Name is too short.' };

  // Live web research (Jumia links, ₦ prices, images, specs snippets)
  let web;
  try {
    web = await researchProductFromWeb(name);
  } catch (e) {
    web = null;
    console.error('web research failed', e);
  }

  const supabase = await createClient();
  let slug = slugify(web?.displayName || name);

  const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle();
  if (existing) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const brandName = guessBrandName(web?.displayName || name);
  const catSlug = guessCategorySlug(web?.displayName || name);

  let brand_id: string | null = null;
  let category_id: string | null = null;

  if (brandName) {
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .ilike('name', brandName)
      .maybeSingle();
    brand_id = brand?.id ?? null;
  }

  if (catSlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', catSlug)
      .maybeSingle();
    category_id = cat?.id ?? null;
  }

  const researchBlock = [
    '— AI / web research draft (not published) —',
    `Queried: ${name}`,
    web ? web.rawNotes : 'Web research unavailable — filled template only.',
    notes ? `Admin notes: ${notes}` : null,
    '',
    'Review checklist:',
    '1. Confirm image matches this model',
    '2. Confirm ₦ price on Jumia',
    '3. Edit details if needed',
    '4. Publish when ready',
  ]
    .filter(Boolean)
    .join('\n');

  const productName = name; // keep admin's typed name for clarity

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: productName,
      slug,
      status: 'draft',
      brand_id,
      category_id,
      short_description:
        web?.shortDescription ||
        `Draft from AI Research for ${name}. Review before publishing.`,
      description: [web?.description, researchBlock].filter(Boolean).join('\n\n'),
      what_stands_out: web?.strengths?.[0] || 'Pending final review.',
      strengths: web?.strengths?.length ? web.strengths : ['Pending verification'],
      things_to_consider: web?.thingsToConsider || [
        'Confirm price on retailer sites',
        'Verify specs from official sources',
      ],
      seo_title: `${productName} — TechPick NG`,
      seo_description: `Compare prices and reviews for ${productName} in Nigeria.`,
      published_at: null,
    })
    .select('id, name, slug')
    .single();

  if (error) {
    return { error: error.message };
  }

  // Image from web research
  if (web?.imageUrl) {
    await supabase.from('product_images').insert({
      product_id: product.id,
      url: web.imageUrl,
      alt_text: productName,
      is_primary: true,
      sort_order: 0,
    });
  }

  // Jumia (or best) offer with real price when found
  const { data: jumia } = await supabase
    .from('stores')
    .select('id')
    .ilike('name', 'Jumia')
    .maybeSingle();

  const productUrl =
    web?.productUrl || `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(name)}`;

  if (jumia?.id && web?.price) {
    const original = web.originalPrice && web.originalPrice > web.price ? web.originalPrice : null;
    const discount =
      original && original > web.price
        ? Math.round(((original - web.price) / original) * 100)
        : null;

    await supabase.from('product_offers').insert({
      product_id: product.id,
      store_id: jumia.id,
      price: web.price,
      original_price: original,
      currency: 'NGN',
      discount_percent: discount,
      availability: 'in_stock',
      product_url: productUrl,
      affiliate_url: null,
      last_checked_at: new Date().toISOString(),
      status: 'active',
    });
  } else if (jumia?.id) {
    // Still attach View deal link even without a parsed price
    await supabase.from('product_offers').insert({
      product_id: product.id,
      store_id: jumia.id,
      price: 0,
      original_price: null,
      currency: 'NGN',
      discount_percent: null,
      availability: 'unknown',
      product_url: productUrl,
      affiliate_url: null,
      last_checked_at: new Date().toISOString(),
      status: 'active',
    });
  }

  revalidatePath('/admin/research');
  revalidatePath('/admin/products');
  revalidatePath('/admin/needs-update');
  revalidatePath('/admin/dashboard');

  const bits = [
    `Draft created: “${product.name}”`,
    web?.imageUrl ? 'image found' : 'no image (add manually)',
    web?.price ? `price ~₦${web.price.toLocaleString('en-NG')}` : 'price not parsed',
    web?.productUrl ? 'Jumia/link attached' : 'search link attached',
    'Not published until you approve',
  ];

  return {
    success: bits.join(' · '),
    productId: product.id,
  };
}

export async function publishDraft(productId: string): Promise<ResearchState> {
  const auth = await requireAdmin();
  if (!auth.authorized) return { error: 'Not authorized.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/admin/needs-update');
  revalidatePath('/');
  return { success: 'Product published.' };
}

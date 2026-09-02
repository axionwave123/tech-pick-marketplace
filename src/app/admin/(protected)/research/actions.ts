'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';
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
  if (/phone|iphone|galaxy|pixel|redmi|tecno|infinix|samsung a|samsung s|pop |hot |spark|note /.test(n))
    return 'smartphones';
  if (/laptop|macbook|notebook|chromebook|hp |dell |lenovo|asus/.test(n)) return 'laptops';
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

/** Prefer service role for reliable inserts; fall back to user session. */
async function dbClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  return createClient();
}

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

  let web;
  try {
    web = await researchProductFromWeb(name);
  } catch (e) {
    web = null;
    console.error('web research failed', e);
  }

  const supabase = await dbClient();
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
    web ? web.rawNotes : 'Web research unavailable — template only.',
    notes ? `Admin notes: ${notes}` : null,
    '',
    'Review checklist:',
    '1. Confirm image matches this model',
    '2. Open Jumia/Amazon links and set correct ₦ price',
    '3. Edit review notes if needed',
    '4. Publish when ready',
  ]
    .filter(Boolean)
    .join('\n');

  const productName = name;

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
        `Research draft for ${name}. Confirm image and prices before publishing.`,
      description: [web?.description, researchBlock].filter(Boolean).join('\n\n'),
      what_stands_out: web?.strengths?.[0] || 'Pending final review.',
      strengths: web?.strengths?.length ? web.strengths : ['Pending verification'],
      things_to_consider: web?.thingsToConsider || [
        'Confirm price on retailer sites',
        'Verify specs from official sources',
      ],
      best_for: web?.bestFor || null,
      not_ideal_for: web?.notIdealFor || null,
      seo_title: `${productName} — TechPick NG`,
      seo_description: `Compare prices and reviews for ${productName} in Nigeria (Jumia, Amazon, Temu).`,
      published_at: null,
    })
    .select('id, name, slug')
    .single();

  if (error) {
    return { error: error.message };
  }

  let imageSaved = false;
  let imageError = '';
  if (web?.imageUrl) {
    const { error: imgErr } = await supabase.from('product_images').insert({
      product_id: product.id,
      url: web.imageUrl,
      alt_text: productName,
      is_primary: true,
      sort_order: 0,
    });
    if (imgErr) {
      imageError = imgErr.message;
      console.error('image insert failed', imgErr);
    } else {
      imageSaved = true;
    }
  }

  const { data: stores } = await supabase.from('stores').select('id, slug, name');
  const storeBySlug = new Map((stores || []).map((s) => [s.slug, s]));

  const offerRows =
    web?.offers
      ?.map((o) => {
        const store = storeBySlug.get(o.storeSlug);
        if (!store) return null;
        const price = o.price && o.price > 0 ? o.price : 0;
        const original =
          o.originalPrice && o.originalPrice > price ? o.originalPrice : null;
        const discount =
          original && original > price
            ? Math.round(((original - price) / original) * 100)
            : null;
        return {
          product_id: product.id,
          store_id: store.id,
          price,
          original_price: original,
          currency: 'NGN',
          discount_percent: discount,
          availability: price > 0 ? 'in_stock' : 'unknown',
          product_url: o.productUrl,
          affiliate_url: null,
          last_checked_at: new Date().toISOString(),
          status: 'active',
        };
      })
      .filter(Boolean) || [];

  let offersSaved = 0;
  if (offerRows.length) {
    const { error: offErr, data: inserted } = await supabase
      .from('product_offers')
      .insert(offerRows as any[])
      .select('id');
    if (offErr) console.error('offers insert failed', offErr);
    else offersSaved = inserted?.length || offerRows.length;
  } else {
    const jumia = storeBySlug.get('jumia');
    if (jumia) {
      const { error: offErr } = await supabase.from('product_offers').insert({
        product_id: product.id,
        store_id: jumia.id,
        price: 0,
        currency: 'NGN',
        availability: 'unknown',
        product_url: `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(name)}`,
        last_checked_at: new Date().toISOString(),
        status: 'active',
      });
      if (!offErr) offersSaved = 1;
    }
  }

  if (web?.reviews?.length) {
    await supabase.from('editorial_reviews').insert({
      product_id: product.id,
      title: `Research notes: ${productName}`,
      rating: web.reviews[0]?.rating ?? 4,
      summary: web.reviews.map((r) => r.body).join('\n\n'),
      what_stands_out: web.strengths?.[0] || null,
      strengths: web.strengths || null,
      things_to_consider: web.thingsToConsider || null,
      best_for: web.bestFor || null,
      not_ideal_for: web.notIdealFor || null,
      verdict:
        'Draft from web research. Admin must verify image and live store prices before publishing.',
      sources: web.sources || [],
      status: 'draft',
      published_at: null,
      author_id: auth.user?.id || null,
    });
  }

  revalidatePath('/admin/research');
  revalidatePath('/admin/products');
  revalidatePath('/admin/needs-update');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/offers');

  const priced = (web?.offers || []).filter((o) => o.price && o.price > 0).length;
  const bits = [
    `Draft created: “${product.name}”`,
    imageSaved
      ? 'image saved'
      : web?.imageUrl
        ? `image found but not saved (${imageError || 'check RLS'})`
        : 'no image found — upload in Edit',
    offersSaved ? `${offersSaved} store link(s)` : 'no store offers saved',
    priced ? `${priced} with parsed ₦ price` : '₦ price not auto-filled (open Jumia & type it in Edit)',
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

  const supabase = await dbClient();
  const { error } = await supabase
    .from('products')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) return { error: error.message };

  await supabase
    .from('editorial_reviews')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('product_id', productId)
    .eq('status', 'draft');

  revalidatePath('/admin/products');
  revalidatePath('/admin/needs-update');
  revalidatePath('/');
  return { success: 'Product published.' };
}

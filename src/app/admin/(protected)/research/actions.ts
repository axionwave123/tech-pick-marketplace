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

async function dbClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return createServiceClient();
  return createClient();
}

function defaultOffers(name: string) {
  const q = encodeURIComponent(name);
  return [
    { storeSlug: 'jumia', productUrl: `https://www.jumia.com.ng/catalog/?q=${q}`, price: null as number | null },
    { storeSlug: 'amazon', productUrl: `https://www.amazon.com/s?k=${q}`, price: null as number | null },
    { storeSlug: 'temu', productUrl: `https://www.temu.com/search_result.html?search_key=${q}`, price: null as number | null },
    { storeSlug: 'konga', productUrl: `https://www.konga.com/search?search=${q}`, price: null as number | null },
  ];
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

  let web: Awaited<ReturnType<typeof researchProductFromWeb>> | null = null;
  try {
    web = await researchProductFromWeb(name);
  } catch (e) {
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
    web ? web.rawNotes : 'Web research failed — store links still attached.',
    notes ? `Admin notes: ${notes}` : null,
    '',
    'Review checklist:',
    '1. Confirm image matches this model (or upload a better one)',
    '2. Open Jumia link → copy live ₦ price into Edit product offers',
    '3. Edit description/review notes if needed',
    '4. Publish when ready',
  ]
    .filter(Boolean)
    .join('\n');

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      status: 'draft',
      brand_id,
      category_id,
      short_description:
        web?.shortDescription ||
        `${name} — research draft with store links. Confirm image and ₦ price before publishing.`,
      description: [web?.description, researchBlock].filter(Boolean).join('\n\n'),
      what_stands_out: web?.strengths?.[0] || 'Pending final review.',
      strengths: web?.strengths?.length ? web.strengths : ['Pending verification'],
      things_to_consider: web?.thingsToConsider || [
        'Confirm live price on Jumia',
        'Verify image matches model',
      ],
      best_for: web?.bestFor || null,
      not_ideal_for: web?.notIdealFor || null,
      seo_title: `${name} — TechPick NG`,
      seo_description: `Compare prices for ${name} in Nigeria (Jumia, Amazon, Temu, Konga).`,
      published_at: null,
    })
    .select('id, name, slug')
    .single();

  if (error) {
    return { error: error.message };
  }

  // ——— Images (primary + up to 2 extras) ———
  let imagesSaved = 0;
  const imageList = [
    web?.imageUrl,
    ...(web?.imageCandidates || []),
  ].filter((u, i, arr): u is string => Boolean(u) && arr.indexOf(u) === i);

  for (let i = 0; i < Math.min(imageList.length, 3); i++) {
    const { error: imgErr } = await supabase.from('product_images').insert({
      product_id: product.id,
      url: imageList[i],
      alt_text: `${name}${i === 0 ? '' : ` (${i + 1})`}`,
      is_primary: i === 0,
      sort_order: i,
    });
    if (!imgErr) imagesSaved += 1;
    else console.error('image insert failed', imgErr);
  }

  // ——— Always save 4 store offers ———
  const { data: stores } = await supabase.from('stores').select('id, slug, name');
  const storeBySlug = new Map((stores || []).map((s) => [s.slug, s]));

  const offerSource =
    web?.offers?.length ? web.offers : defaultOffers(name).map((o) => ({
      storeSlug: o.storeSlug as 'jumia' | 'amazon' | 'temu' | 'konga',
      storeName: o.storeSlug,
      productUrl: o.productUrl,
      price: o.price,
      originalPrice: null as number | null,
    }));

  const offerRows = offerSource
    .map((o) => {
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
    .filter(Boolean);

  let offersSaved = 0;
  let offerError = '';
  if (offerRows.length) {
    const { error: offErr, data: inserted } = await supabase
      .from('product_offers')
      .insert(offerRows as any[])
      .select('id');
    if (offErr) {
      offerError = offErr.message;
      console.error('offers insert failed', offErr);
    } else {
      offersSaved = inserted?.length || offerRows.length;
    }
  }

  // Editorial notes
  if (web?.reviews?.length) {
    await supabase.from('editorial_reviews').insert({
      product_id: product.id,
      title: `Research notes: ${name}`,
      rating: web.reviews[0]?.rating ?? 4,
      summary: web.reviews.map((r) => r.body).join('\n\n'),
      what_stands_out: web.strengths?.[0] || null,
      strengths: web.strengths || null,
      things_to_consider: web.thingsToConsider || null,
      best_for: web.bestFor || null,
      not_ideal_for: web.notIdealFor || null,
      verdict:
        'Draft from Wikipedia/Wikidata/Commons research. Verify image and type live ₦ prices before publishing.',
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
    imagesSaved ? `${imagesSaved} image(s)` : 'no image — upload in Edit',
    offersSaved
      ? `${offersSaved} store links (Jumia/Amazon/Temu/Konga)`
      : `store links failed${offerError ? `: ${offerError}` : ''}`,
    priced
      ? `${priced} with auto ₦ (still confirm on store)`
      : '₦ not auto-filled — open Jumia & type price in Edit',
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

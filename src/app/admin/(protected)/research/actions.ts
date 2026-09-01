'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { slugify } from '@/lib/utils';

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
  ];
  const lower = name.toLowerCase();
  for (const b of brands) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  return null;
}

/** Creates a draft product from a research query — never auto-publishes */
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

  const supabase = await createClient();
  let slug = slugify(name);

  // Ensure unique slug
  const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle();
  if (existing) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const brandName = guessBrandName(name);
  const catSlug = guessCategorySlug(name);

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
    '— Research draft (not published) —',
    `Queried: ${name}`,
    `Suggested brand: ${brandName || 'unknown — set manually'}`,
    `Suggested category: ${catSlug || 'unknown — set manually'}`,
    notes ? `Admin notes: ${notes}` : null,
    '',
    'Next steps for admin:',
    '1. Add product image',
    '2. Add store price (₦) under Add product / offers',
    '3. Fill strengths, specs, and short description',
    '4. Change status to Published when ready',
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
      short_description: `Draft from AI Research. Complete image, price, and details before publishing.`,
      description: researchBlock,
      what_stands_out: 'Pending research approval — replace with verified highlights.',
      strengths: ['Pending verification'],
      things_to_consider: ['Confirm price on retailer sites', 'Verify specs from official sources'],
      seo_title: `${name} — TechPick NG`,
      seo_description: `Compare prices and reviews for ${name} in Nigeria.`,
      published_at: null,
    })
    .select('id, name, slug')
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/research');
  revalidatePath('/admin/products');
  revalidatePath('/admin/needs-update');
  revalidatePath('/admin/dashboard');

  return {
    success: `Draft created: “${product.name}”. It will not show on the public site until you publish it.`,
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

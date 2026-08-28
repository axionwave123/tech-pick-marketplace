import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';

const productSelect = `
  *,
  brands (id, name, slug, logo_url),
  categories (id, name, slug),
  product_images (id, url, alt_text, is_primary, sort_order),
  product_offers (
    id, price, original_price, currency, discount_percent, availability,
    product_url, affiliate_url, last_checked_at, status, store_id,
    stores (id, name, slug, logo_url)
  )
`;

function isConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getPublishedProducts(limit = 12): Promise<Product[]> {
  if (!isConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select(productSelect)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error(error);
      return [];
    }
    return (data as Product[]) || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select(
        `${productSelect},
      product_specifications (
        id, value_text, value_number, value_boolean, value_list, spec_def_id,
        specification_definitions (id, key, label, unit, data_type, sort_order)
      ),
      editorial_reviews (*)`
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) {
      console.error(error);
      return null;
    }
    return data as Product | null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function searchProducts(query: string, limit = 24): Promise<Product[]> {
  if (!isConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select(productSelect)
      .eq('status', 'published')
      .ilike('name', `%${query}%`)
      .limit(limit);
    if (error) {
      console.error(error);
      return [];
    }
    return (data as Product[]) || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getProductsByCategorySlug(
  slug: string,
  limit = 48
): Promise<{ category: { name: string; slug: string } | null; products: Product[] }> {
  if (!isConfigured()) return { category: null, products: [] };
  try {
    const supabase = await createClient();
    const { data: category } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', slug)
      .maybeSingle();
    if (!category) return { category: null, products: [] };

    const { data, error } = await supabase
      .from('products')
      .select(productSelect)
      .eq('status', 'published')
      .eq('category_id', category.id)
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error(error);
      return { category, products: [] };
    }
    return { category, products: (data as Product[]) || [] };
  } catch (e) {
    console.error(e);
    return { category: null, products: [] };
  }
}

export async function getDeals(limit = 24): Promise<Product[]> {
  const products = await getPublishedProducts(limit * 2);
  return products
    .filter((p) =>
      p.product_offers?.some(
        (o) => o.status === 'active' && o.original_price && o.original_price > o.price
      )
    )
    .slice(0, limit);
}

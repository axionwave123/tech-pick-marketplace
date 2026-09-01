import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
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

export type CategoryOption = { id: string; name: string; slug: string };

export async function getCategories(): Promise<CategoryOption[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');
    if (error) {
      console.error(error);
      return [];
    }
    return (data as CategoryOption[]) || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getPublishedProducts(limit = 12): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
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

export async function getProductBySlug(rawSlug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    let slug = rawSlug;
    try {
      slug = decodeURIComponent(rawSlug);
    } catch {
      slug = rawSlug;
    }
    slug = slug.trim();
    const clean = slugify(slug);

    const supabase = await createClient();
    const detailSelect = `${productSelect},
      product_specifications (
        id, value_text, value_number, value_boolean, value_list, spec_def_id,
        specification_definitions (id, key, label, unit, data_type, sort_order)
      ),
      editorial_reviews (*)`;

    let { data, error } = await supabase
      .from('products')
      .select(detailSelect)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (!data && clean && clean !== slug) {
      const res = await supabase
        .from('products')
        .select(detailSelect)
        .eq('slug', clean)
        .eq('status', 'published')
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (!data && clean) {
      const res = await supabase
        .from('products')
        .select(detailSelect)
        .eq('status', 'published')
        .or(`slug.ilike.%${clean}%,name.ilike.%${slug.replace(/-/g, ' ')}%`)
        .limit(1)
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

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

export async function searchProducts(
  query: string,
  options?: { categorySlug?: string; limit?: number }
): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const limit = options?.limit ?? 48;
    const categorySlug = options?.categorySlug?.trim();

    let categoryId: string | null = null;
    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();
      categoryId = cat?.id ?? null;
      if (!categoryId) return [];
    }

    let req = supabase
      .from('products')
      .select(productSelect)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (categoryId) {
      req = req.eq('category_id', categoryId);
    }

    const q = query.trim();
    if (q) {
      req = req.ilike('name', `%${q}%`);
    }

    // If no query and no category, still return recent published
    if (!q && !categoryId) {
      req = req.limit(limit);
    }

    const { data, error } = await req;
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
  if (!isSupabaseConfigured()) return { category: null, products: [] };
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

export type ProductStatus = 'draft' | 'published' | 'archived';
export type OfferStatus = 'active' | 'inactive' | 'expired';
export type Availability = 'in_stock' | 'out_of_stock' | 'preorder' | 'unknown';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type EditorialStatus = 'draft' | 'published' | 'archived';
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'moderator';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  spec_def_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_list: string[] | null;
  specification_definitions?: SpecDefinition;
}

export interface SpecDefinition {
  id: string;
  key: string;
  label: string;
  unit: string | null;
  data_type: 'text' | 'number' | 'boolean' | 'list';
  is_comparable: boolean;
  sort_order: number;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  country_code: string | null;
  status: string;
}

export interface ProductOffer {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  original_price: number | null;
  currency: string;
  discount_percent: number | null;
  availability: Availability;
  product_url: string;
  affiliate_url: string | null;
  last_checked_at: string | null;
  status: OfferStatus;
  stores?: Store;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  status: ProductStatus;
  seo_title: string | null;
  seo_description: string | null;
  what_stands_out: string | null;
  strengths: string[] | null;
  things_to_consider: string[] | null;
  best_for: string[] | null;
  not_ideal_for: string[] | null;
  avg_rating: number;
  review_count: number;
  review_video_url?: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  brands?: Brand | null;
  categories?: Category | null;
  product_images?: ProductImage[];
  product_offers?: ProductOffer[];
  product_specifications?: ProductSpec[];
  editorial_reviews?: EditorialReview | null;
}

export interface EditorialReview {
  id: string;
  product_id: string;
  title: string | null;
  rating: number | null;
  summary: string | null;
  what_stands_out: string | null;
  strengths: string[] | null;
  things_to_consider: string[] | null;
  best_for: string[] | null;
  not_ideal_for: string[] | null;
  performance_notes: string | null;
  battery_notes: string | null;
  camera_notes: string | null;
  display_notes: string | null;
  verdict: string | null;
  sources: unknown;
  status: EditorialStatus;
  published_at: string | null;
}

export interface UserReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewStatus;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  article_type: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

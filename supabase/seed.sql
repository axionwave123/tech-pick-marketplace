-- Demo / seed data for TechPick NG
-- Clearly labeled as demo. Affiliate URLs are placeholders only.

-- Brands
INSERT INTO public.brands (id, name, slug) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Samsung', 'samsung'),
  ('a1000000-0000-4000-8000-000000000002', 'Apple', 'apple'),
  ('a1000000-0000-4000-8000-000000000003', 'Xiaomi', 'xiaomi'),
  ('a1000000-0000-4000-8000-000000000004', 'HP', 'hp'),
  ('a1000000-0000-4000-8000-000000000005', 'Anker', 'anker'),
  ('a1000000-0000-4000-8000-000000000006', 'TECNO', 'tecno'),
  ('a1000000-0000-4000-8000-000000000007', 'Infinix', 'infinix');

-- Categories
INSERT INTO public.categories (id, name, slug, icon, sort_order) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'Smartphones', 'smartphones', 'smartphone', 1),
  ('b1000000-0000-4000-8000-000000000002', 'Laptops', 'laptops', 'laptop', 2),
  ('b1000000-0000-4000-8000-000000000003', 'Tablets', 'tablets', 'tablet', 3),
  ('b1000000-0000-4000-8000-000000000004', 'Audio', 'audio', 'headphones', 4),
  ('b1000000-0000-4000-8000-000000000005', 'Wearables', 'wearables', 'watch', 5),
  ('b1000000-0000-4000-8000-000000000006', 'TVs', 'tvs', 'tv', 6),
  ('b1000000-0000-4000-8000-000000000007', 'Cameras', 'cameras', 'camera', 7),
  ('b1000000-0000-4000-8000-000000000008', 'Gaming', 'gaming', 'gamepad', 8),
  ('b1000000-0000-4000-8000-000000000009', 'Accessories', 'accessories', 'cable', 9),
  ('b1000000-0000-4000-8000-000000000010', 'Power Banks', 'power-banks', 'battery', 10);

-- Spec definitions (phones-focused demo)
INSERT INTO public.specification_definitions (id, key, label, unit, data_type, category_id, sort_order) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'display_size', 'Display', 'inches', 'text', 'b1000000-0000-4000-8000-000000000001', 1),
  ('c1000000-0000-4000-8000-000000000002', 'display_type', 'Display Type', NULL, 'text', 'b1000000-0000-4000-8000-000000000001', 2),
  ('c1000000-0000-4000-8000-000000000003', 'refresh_rate', 'Refresh Rate', 'Hz', 'number', 'b1000000-0000-4000-8000-000000000001', 3),
  ('c1000000-0000-4000-8000-000000000004', 'processor', 'Processor', NULL, 'text', 'b1000000-0000-4000-8000-000000000001', 4),
  ('c1000000-0000-4000-8000-000000000005', 'ram', 'RAM', 'GB', 'number', 'b1000000-0000-4000-8000-000000000001', 5),
  ('c1000000-0000-4000-8000-000000000006', 'storage', 'Storage', 'GB', 'number', 'b1000000-0000-4000-8000-000000000001', 6),
  ('c1000000-0000-4000-8000-000000000007', 'rear_camera', 'Rear Camera', NULL, 'text', 'b1000000-0000-4000-8000-000000000001', 7),
  ('c1000000-0000-4000-8000-000000000008', 'front_camera', 'Front Camera', NULL, 'text', 'b1000000-0000-4000-8000-000000000001', 8),
  ('c1000000-0000-4000-8000-000000000009', 'battery', 'Battery', 'mAh', 'number', 'b1000000-0000-4000-8000-000000000001', 9),
  ('c1000000-0000-4000-8000-000000000010', 'charging', 'Charging', NULL, 'text', 'b1000000-0000-4000-8000-000000000001', 10);

-- Stores (multi-store ready; no hard-coded single partner)
INSERT INTO public.stores (id, name, slug, website_url, country_code, status) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'Jumia', 'jumia', 'https://www.jumia.com.ng', 'NG', 'active'),
  ('d1000000-0000-4000-8000-000000000002', 'Amazon', 'amazon', 'https://www.amazon.com', 'US', 'active'),
  ('d1000000-0000-4000-8000-000000000003', 'Konga', 'konga', 'https://www.konga.com', 'NG', 'active');

INSERT INTO public.affiliate_programs (store_id, name, network, tracking_param_template, status, notes) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'Jumia Affiliate', 'Jumia', 'REPLACE_WITH_REAL_TRACKING', 'active', 'DEMO — replace with real affiliate config'),
  ('d1000000-0000-4000-8000-000000000002', 'Amazon Associates', 'Amazon', 'REPLACE_WITH_REAL_TRACKING', 'active', 'DEMO — replace with real affiliate config');

-- Demo products (illustrative only — do not treat as live verified specs/prices)
INSERT INTO public.products (id, name, slug, brand_id, category_id, short_description, status, what_stands_out, strengths, things_to_consider, avg_rating, review_count, published_at) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'Samsung Galaxy A26 (8GB RAM, 256GB)', 'samsung-galaxy-a26-8gb-256gb', 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001',
   'Mid-range smartphone with AMOLED display and solid battery life. Demo product for TechPick NG.',
   'published',
   'Balanced mid-range experience with bright display and long battery.',
   ARRAY['Bright AMOLED display', 'Long battery life', 'Competitive price for the category'],
   ARRAY['Camera performance in low light may vary', '5G availability depends on market'],
   4.4, 128, NOW()),
  ('e1000000-0000-4000-8000-000000000002', 'Apple iPhone 15 (128GB)', 'apple-iphone-15-128gb', 'a1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001',
   'Flagship iPhone with modern design and ecosystem strengths. Demo product.',
   'published',
   'Premium build, camera system, and long software support.',
   ARRAY['Excellent camera', 'Long software updates', 'Premium build quality'],
   ARRAY['Higher price', 'Storage not expandable'],
   4.7, 256, NOW()),
  ('e1000000-0000-4000-8000-000000000003', 'Redmi Note 13', 'redmi-note-13', 'a1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000001',
   'Value-focused smartphone. Demo product.',
   'published',
   'Strong value for everyday use.',
   ARRAY['Competitive pricing', 'Decent battery'],
   ARRAY['Build materials are mid-range'],
   4.2, 89, NOW()),
  ('e1000000-0000-4000-8000-000000000004', 'HP 250 G9 Laptop', 'hp-250-g9', 'a1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000002',
   'Business-oriented laptop for everyday productivity. Demo product.',
   'published',
   'Reliable for office and study workloads.',
   ARRAY['Solid keyboard', 'Good port selection'],
   ARRAY['Display is not high-end'],
   4.0, 42, NOW()),
  ('e1000000-0000-4000-8000-000000000005', 'Anker PowerCore 20K', 'anker-powercore-20k', 'a1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000010',
   'High-capacity portable power bank. Demo product.',
   'published',
   'High capacity and brand reliability.',
   ARRAY['High capacity', 'Trusted brand'],
   ARRAY['Bulkier than smaller banks'],
   4.5, 210, NOW());

-- Spec values for Galaxy A26 (demo)
INSERT INTO public.product_specifications (product_id, spec_def_id, value_text, value_number) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', '6.7" Super AMOLED', NULL),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'Super AMOLED', NULL),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', NULL, 120),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000004', 'Exynos 1280', NULL),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000005', NULL, 8),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000006', NULL, 256),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000007', '50MP + 5MP + 2MP', NULL),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000008', '13MP', NULL),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000009', NULL, 5000),
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000010', '25W Fast Charging', NULL);

-- Placeholder images (Unsplash — replace with real product imagery)
INSERT INTO public.product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 'Samsung Galaxy A26 demo', true, 0),
  ('e1000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', 'iPhone 15 demo', true, 0),
  ('e1000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1598327105666-5b89351aff38?w=800', 'Redmi Note 13 demo', true, 0),
  ('e1000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 'HP laptop demo', true, 0),
  ('e1000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1609091839311-b9b7f7d0e0a0?w=800', 'Power bank demo', true, 0);

-- Demo offers (prices illustrative; last_checked set; affiliate URLs are PLACEHOLDERS)
INSERT INTO public.product_offers (product_id, store_id, price, original_price, currency, discount_percent, availability, product_url, affiliate_url, last_checked_at, status) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 238000, 265000, 'NGN', 10, 'in_stock',
   'https://www.jumia.com.ng/', 'https://www.jumia.com.ng/?demo_affiliate=PLACEHOLDER', NOW() - INTERVAL '2 hours', 'active'),
  ('e1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 241900, NULL, 'NGN', NULL, 'in_stock',
   'https://www.amazon.com/', 'https://www.amazon.com/?demo_affiliate=PLACEHOLDER', NOW() - INTERVAL '5 hours', 'active'),
  ('e1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 245000, 260000, 'NGN', 6, 'in_stock',
   'https://www.konga.com/', NULL, NOW() - INTERVAL '1 day', 'active'),
  ('e1000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000001', 1020000, 1100000, 'NGN', 7, 'in_stock',
   'https://www.jumia.com.ng/', 'https://www.jumia.com.ng/?demo_affiliate=PLACEHOLDER', NOW() - INTERVAL '3 hours', 'active'),
  ('e1000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000001', 178000, 210000, 'NGN', 15, 'in_stock',
   'https://www.jumia.com.ng/', 'https://www.jumia.com.ng/?demo_affiliate=PLACEHOLDER', NOW() - INTERVAL '1 hour', 'active'),
  ('e1000000-0000-4000-8000-000000000005', 'd1000000-0000-4000-8000-000000000001', 45000, 56000, 'NGN', 20, 'in_stock',
   'https://www.jumia.com.ng/', 'https://www.jumia.com.ng/?demo_affiliate=PLACEHOLDER', NOW() - INTERVAL '4 hours', 'active');

-- Editorial review (demo — not claimed as physical lab test)
INSERT INTO public.editorial_reviews (product_id, title, rating, summary, what_stands_out, strengths, things_to_consider, verdict, status, published_at) VALUES
  ('e1000000-0000-4000-8000-000000000001',
   'Samsung Galaxy A26 Review',
   8.5,
   'A well-balanced mid-range option for everyday use in Nigeria, based on publicly available specifications and market positioning.',
   'Bright AMOLED, solid battery capacity, competitive pricing in the mid-range segment.',
   ARRAY['Display quality for the price', 'Battery capacity', 'Brand software support expectations'],
   ARRAY['Verify camera sample images from trusted reviewers', 'Confirm local warranty and network bands'],
   'A strong mid-range contender if the price and local support match your needs. Always cross-check current offers.',
   'published', NOW());

-- Sample article
INSERT INTO public.articles (id, title, slug, excerpt, content, article_type, status, published_at) VALUES
  ('f1000000-0000-4000-8000-000000000001',
   'Best Phones Under ₦250,000 in Nigeria (Demo Guide)',
   'best-phones-under-250000-nigeria',
   'A demo buying guide showing how TechPick NG structures recommendations. Replace with verified content.',
   '## Overview\n\nThis is **demo content** for TechPick NG. Real guides should cite sources, avoid invented specs, and update prices with last-checked timestamps.\n\n## How we approach recommendations\n\n1. Identify products with published specs\n2. Compare offers across partner stores\n3. Surface editorial analysis and community feedback\n4. Link out via affiliate URLs when available\n\nAlways verify current prices on the retailer site before purchase.',
   'buying_guide', 'published', NOW());

INSERT INTO public.article_products (article_id, product_id, sort_order) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 1),
  ('f1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003', 2);

-- NOTE: To make yourself admin after signing up via Supabase Auth:
-- INSERT INTO public.admin_roles (user_id, role)
-- SELECT id, 'super_admin' FROM public.profiles WHERE email = 'your@email.com';

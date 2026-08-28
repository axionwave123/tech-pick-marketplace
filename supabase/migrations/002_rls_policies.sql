-- Row Level Security policies
-- Public read for published content; write restricted to admins / owners.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specification_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin', 'editor', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin roles: only super_admin manages; admins can read own
CREATE POLICY "Admins can read admin_roles"
  ON public.admin_roles FOR SELECT USING (public.is_admin());
CREATE POLICY "Super admins manage admin_roles"
  ON public.admin_roles FOR ALL USING (public.is_super_admin());

-- Catalog: public read published / active; admin write
CREATE POLICY "Anyone can read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins manage brands" ON public.brands FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read active categories"
  ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read published products"
  ON public.products FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read specs defs" ON public.specification_definitions FOR SELECT USING (true);
CREATE POLICY "Admins manage specs defs" ON public.specification_definitions FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read product specs for published products"
  ON public.product_specifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'published' OR public.is_admin()))
  );
CREATE POLICY "Admins manage product specs" ON public.product_specifications FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read product images for published"
  ON public.product_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'published' OR public.is_admin()))
  );
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admins manage tags" ON public.tags FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can read product_tags" ON public.product_tags FOR SELECT USING (true);
CREATE POLICY "Admins manage product_tags" ON public.product_tags FOR ALL USING (public.is_admin());

-- Stores & offers
CREATE POLICY "Anyone can read active stores" ON public.stores FOR SELECT USING (status = 'active' OR public.is_admin());
CREATE POLICY "Admins manage stores" ON public.stores FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage affiliate_programs" ON public.affiliate_programs FOR ALL USING (public.is_admin());
CREATE POLICY "Admins read affiliate_programs" ON public.affiliate_programs FOR SELECT USING (public.is_admin());

CREATE POLICY "Anyone can read active offers"
  ON public.product_offers FOR SELECT USING (status = 'active' OR public.is_admin());
CREATE POLICY "Admins manage offers" ON public.product_offers FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read price history for active offers"
  ON public.price_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.product_offers o WHERE o.id = offer_id AND (o.status = 'active' OR public.is_admin()))
  );
CREATE POLICY "Admins manage price history" ON public.price_history FOR ALL USING (public.is_admin());

-- Editorial reviews: public read published only
CREATE POLICY "Anyone can read published editorial reviews"
  ON public.editorial_reviews FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins manage editorial reviews" ON public.editorial_reviews FOR ALL USING (public.is_admin());

-- Community: public read approved; users insert own; admins moderate
CREATE POLICY "Anyone can read approved user reviews"
  ON public.user_reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Authenticated users can create reviews"
  ON public.user_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending reviews"
  ON public.user_reviews FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins manage user reviews" ON public.user_reviews FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read approved comments"
  ON public.review_comments FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Authenticated users can comment"
  ON public.review_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage comments" ON public.review_comments FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage moderation" ON public.moderation_records FOR ALL USING (public.is_admin());

-- Articles
CREATE POLICY "Anyone can read published articles"
  ON public.articles FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can read article_products" ON public.article_products FOR SELECT USING (true);
CREATE POLICY "Admins manage article_products" ON public.article_products FOR ALL USING (public.is_admin());

-- Research: admin only
CREATE POLICY "Admins manage sources" ON public.sources FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage research_runs" ON public.research_runs FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage research_results" ON public.research_results FOR ALL USING (public.is_admin());

-- Analytics: insert open (or via service role); read admin
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read analytics" ON public.analytics_events FOR SELECT USING (public.is_admin());

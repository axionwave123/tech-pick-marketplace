-- Filter tags for public articles page (Category / Price / Need)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS filter_category TEXT,
  ADD COLUMN IF NOT EXISTS filter_price TEXT,
  ADD COLUMN IF NOT EXISTS filter_need TEXT;

COMMENT ON COLUMN public.articles.filter_category IS 'phone | laptop | audio | others';
COMMENT ON COLUMN public.articles.filter_price IS 'under100 | 100to200 | 200to300 | over300';
COMMENT ON COLUMN public.articles.filter_need IS 'gaming | content | office | students';

CREATE INDEX IF NOT EXISTS idx_articles_filter_category ON public.articles(filter_category);
CREATE INDEX IF NOT EXISTS idx_articles_filter_price ON public.articles(filter_price);
CREATE INDEX IF NOT EXISTS idx_articles_filter_need ON public.articles(filter_need);

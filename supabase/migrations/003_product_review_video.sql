-- Optional review video URL (YouTube / Vimeo) shown on product pages
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_video_url TEXT;

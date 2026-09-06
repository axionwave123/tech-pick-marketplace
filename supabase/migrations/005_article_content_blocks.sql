-- Structured article body: text paragraphs + product embeds (image + View deal)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.articles.content_blocks IS
  'Array of blocks: {type:text,text} | {type:product_embed,productId,productSlug,productName,productStatus,imageUrl,size,buttonPosition,buttonLabel}';

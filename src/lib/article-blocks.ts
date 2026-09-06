/** Structured article body blocks */

export type TextLevel = 'p' | 'h2' | 'h3';
export type TextSpacing = 'tight' | 'normal' | 'loose';

export type ArticleTextBlock = {
  id: string;
  type: 'text';
  text: string;
  /** paragraph | section heading | subheading */
  level?: TextLevel;
  /** vertical spacing around the block */
  spacing?: TextSpacing;
};

export type ButtonPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center'
  | 'top-right'
  | 'top-left';

export type ImageSize = 'sm' | 'md' | 'lg' | 'full';

export type ArticleProductBlock = {
  id: string;
  type: 'product_embed';
  productId: string;
  productSlug: string;
  productName: string;
  /** published | draft | missing */
  productStatus: 'published' | 'draft' | 'archived' | 'missing';
  imageUrl: string;
  size: ImageSize;
  buttonPosition: ButtonPosition;
  buttonLabel: string;
};

export type ArticleBlock = ArticleTextBlock | ArticleProductBlock;

export function newId() {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function parseContentBlocks(raw: unknown): ArticleBlock[] {
  if (!Array.isArray(raw)) return [];
  const out: ArticleBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id : newId();
    if (o.type === 'text' && typeof o.text === 'string') {
      const level = (['p', 'h2', 'h3'].includes(String(o.level))
        ? o.level
        : 'p') as TextLevel;
      const spacing = (['tight', 'normal', 'loose'].includes(String(o.spacing))
        ? o.spacing
        : 'normal') as TextSpacing;
      out.push({ id, type: 'text', text: o.text, level, spacing });
    } else if (o.type === 'product_embed') {
      out.push({
        id,
        type: 'product_embed',
        productId: String(o.productId || ''),
        productSlug: String(o.productSlug || ''),
        productName: String(o.productName || ''),
        productStatus:
          o.productStatus === 'published' ||
          o.productStatus === 'draft' ||
          o.productStatus === 'archived'
            ? o.productStatus
            : 'missing',
        imageUrl: String(o.imageUrl || ''),
        size: (['sm', 'md', 'lg', 'full'].includes(String(o.size))
          ? o.size
          : 'md') as ImageSize,
        buttonPosition: ([
          'bottom-left',
          'bottom-center',
          'bottom-right',
          'center',
          'top-right',
          'top-left',
        ].includes(String(o.buttonPosition))
          ? o.buttonPosition
          : 'bottom-center') as ButtonPosition,
        buttonLabel: String(o.buttonLabel || 'View deal'),
      });
    }
  }
  return out;
}

/** Plain text fallback from blocks (for search / legacy content column) */
export function blocksToPlainText(blocks: ArticleBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === 'text') return b.text;
      return `[Product: ${b.productName}]`;
    })
    .join('\n\n')
    .trim();
}

export function blocksFromPlainContent(content: string | null): ArticleBlock[] {
  if (!content?.trim()) return [{ id: newId(), type: 'text', text: '' }];
  return content
    .split(/\n\n+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text) => ({ id: newId(), type: 'text' as const, text }));
}

export const IMAGE_SIZE_CLASS: Record<ImageSize, string> = {
  sm: 'max-w-xs mx-auto',
  md: 'max-w-md mx-auto',
  lg: 'max-w-2xl mx-auto',
  full: 'w-full',
};

export const BUTTON_POSITION_CLASS: Record<ButtonPosition, string> = {
  'bottom-left': 'left-3 bottom-3',
  'bottom-center': 'left-1/2 -translate-x-1/2 bottom-3',
  'bottom-right': 'right-3 bottom-3',
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  'top-right': 'right-3 top-3',
  'top-left': 'left-3 top-3',
};

export const TEXT_LEVEL_CLASS: Record<TextLevel, string> = {
  p: 'text-[1.075rem] leading-[1.85] text-slate-800 sm:text-[1.125rem]',
  h2: 'font-display text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl',
  h3: 'font-display text-xl font-bold leading-snug text-slate-900 sm:text-2xl',
};

export const TEXT_SPACING_CLASS: Record<TextSpacing, string> = {
  tight: 'my-2',
  normal: 'my-5',
  loose: 'my-10',
};

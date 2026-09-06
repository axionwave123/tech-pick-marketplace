import Link from 'next/link';
import {
  type ArticleBlock,
  BUTTON_POSITION_CLASS,
  IMAGE_SIZE_CLASS,
  TEXT_LEVEL_CLASS,
  TEXT_SPACING_CLASS,
  parseContentBlocks,
  blocksFromPlainContent,
} from '@/lib/article-blocks';

export function ArticleBlocksRenderer({
  contentBlocks,
  fallbackContent,
}: {
  contentBlocks: unknown;
  fallbackContent?: string | null;
}) {
  let blocks = parseContentBlocks(contentBlocks);
  if (blocks.length === 0 && fallbackContent) {
    blocks = blocksFromPlainContent(fallbackContent);
  }

  if (blocks.length === 0) {
    return (
      <p className="text-base text-slate-500">No content yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      {blocks.map((b) => (
        <Block key={b.id} block={b} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  if (block.type === 'text') {
    if (!block.text.trim()) return null;
    const level = block.level || 'p';
    const spacing = block.spacing || 'normal';
    const levelClass = TEXT_LEVEL_CLASS[level];
    const spacingClass = TEXT_SPACING_CLASS[spacing];

    if (level === 'h2') {
      return (
        <h2 className={`${levelClass} ${spacingClass} whitespace-pre-wrap`}>
          {block.text.trim()}
        </h2>
      );
    }
    if (level === 'h3') {
      return (
        <h3 className={`${levelClass} ${spacingClass} whitespace-pre-wrap`}>
          {block.text.trim()}
        </h3>
      );
    }

    return (
      <div className={`${spacingClass} space-y-4 ${levelClass}`}>
        {block.text
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((para, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {para}
            </p>
          ))}
      </div>
    );
  }

  // product_embed
  const canLink = block.productStatus === 'published' && block.productSlug;
  const href = canLink ? `/products/${block.productSlug}` : null;

  return (
    <figure className={`${IMAGE_SIZE_CLASS[block.size]} my-8`}>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
        {block.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={block.imageUrl}
            alt={block.productName || ''}
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-sm text-slate-400">
            No image
          </div>
        )}
        {href ? (
          <Link
            href={href}
            className={`absolute ${BUTTON_POSITION_CLASS[block.buttonPosition]} z-10 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-brand-500 sm:text-sm`}
          >
            {block.buttonLabel || 'View deal'}
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        ) : (
          <span
            className={`absolute ${BUTTON_POSITION_CLASS[block.buttonPosition]} z-10 inline-flex cursor-not-allowed items-center gap-1.5 rounded-full bg-slate-400 px-4 py-2 text-xs font-bold text-white opacity-70`}
            title="Product not published"
          >
            {block.buttonLabel || 'View deal'}
          </span>
        )}
      </div>
      {block.productName && (
        <figcaption className="mt-2 text-center text-sm font-medium text-slate-600">
          {block.productName}
        </figcaption>
      )}
    </figure>
  );
}

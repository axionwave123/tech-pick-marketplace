/**
 * Embeds a product review video (YouTube, YouTube Shorts, or generic iframe URL).
 * Renders nothing if url is empty or cannot be parsed.
 */
export function toEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const url = raw.trim();
  if (!url) return null;

  // Already an embed URL
  if (/youtube\.com\/embed\//i.test(url) || /youtube-nocookie\.com\/embed\//i.test(url)) {
    return url;
  }

  // youtu.be/ID
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
  if (short?.[1]) {
    return `https://www.youtube.com/embed/${short[1]}`;
  }

  // youtube.com/watch?v=ID or /shorts/ID or /live/ID
  const watch = url.match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|live\/|v\/)|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/i
  );
  if (watch?.[1]) {
    return `https://www.youtube.com/embed/${watch[1]}`;
  }

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo?.[1]) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  // Allow direct https embed-style links as last resort
  if (/^https:\/\//i.test(url) && !/youtube\.com\/watch/i.test(url)) {
    return url;
  }

  return null;
}

export function ReviewVideo({
  url,
  title = 'Product review',
}: {
  url?: string | null;
  title?: string;
}) {
  const embed = toEmbedUrl(url);
  if (!embed) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-surface-600/80 bg-surface-900/80 shadow-lg ring-1 ring-white/5 light:border-slate-200 light:bg-white light:ring-slate-200/60">
      <div className="flex items-center gap-2 border-b border-surface-700/80 px-4 py-3 light:border-slate-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400 light:bg-red-50 light:text-red-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-bold text-white light:text-slate-900">Watch review</p>
          <p className="text-[11px] text-surface-400 light:text-slate-500">
            Video overview for this product
          </p>
        </div>
      </div>
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={embed}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}

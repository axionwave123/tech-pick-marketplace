/**
 * Store logo badge — larger, sharper, and more visible on dark/light backgrounds.
 * Uses logo_url from the stores table when available, otherwise a letter monogram.
 */
export function StoreLogo({
  name,
  logoUrl,
  size = 40,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
}) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  if (logoUrl) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg ring-2 ring-white/40 light:ring-slate-200"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-contain p-1.5"
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold text-white shadow-lg ring-2 ring-white/30"
      style={{ width: size, height: size, fontSize: Math.max(14, size * 0.44) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

/**
 * Store logo badge — uses logo_url from the stores table when available,
 * otherwise a letter monogram. Works for any store you add in Admin.
 */
export function StoreLogo({
  name,
  logoUrl,
  size = 36,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
}) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  if (logoUrl) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
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
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

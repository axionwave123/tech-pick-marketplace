/**
 * Lightweight professional horizontal bar chart — no extra dependencies.
 * Renders clean bars with labels, values, and subtle animation.
 */
export function BarChart({
  title,
  subtitle,
  items,
  color = 'brand',
  emptyMessage = 'No data yet',
}: {
  title: string;
  subtitle?: string;
  items: { label: string; value: number; href?: string }[];
  color?: 'brand' | 'emerald' | 'violet' | 'amber';
  emptyMessage?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  const barGradients: Record<string, string> = {
    brand: 'from-brand-500 to-brand-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  };

  const barBg = barGradients[color] || barGradients.brand;

  return (
    <div className="rounded-2xl border border-surface-700/80 bg-surface-900/80 p-5 shadow-lg ring-1 ring-white/5">
      <div className="mb-5">
        <h3 className="text-base font-bold tracking-tight text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-surface-400">{subtitle}</p>}
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-surface-500">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3.5">
          {items.map((item, idx) => {
            const pct = Math.round((item.value / max) * 100);
            const content = (
              <>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-surface-100">
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-surface-800 text-[10px] font-bold text-surface-400">
                      {idx + 1}
                    </span>
                    {item.label}
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-white">
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barBg} shadow-sm transition-all duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            );

            return (
              <li key={item.label}>
                {item.href ? (
                  <a href={item.href} className="block rounded-lg transition hover:opacity-90">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

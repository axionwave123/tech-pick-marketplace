import { cn } from '@/lib/utils';

export function Rating({
  value,
  max = 5,
  size = 'sm',
  showValue = true,
  className,
}: {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}) {
  const stars = Array.from({ length: max }, (_, i) => {
    const filled = value >= i + 1;
    const half = !filled && value >= i + 0.5;
    return (
      <span
        key={i}
        className={cn(
          filled || half ? 'text-amber-400' : 'text-surface-200',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-xl'
        )}
      >
        {half ? '★' : '★'}
      </span>
    );
  });

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <span className="flex">{stars}</span>
      {showValue && (
        <span className="text-sm font-medium text-surface-600 tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/** 0–10 scale used in editorial reviews */
export function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const tone =
    score >= 8.5 ? 'bg-emerald-500' : score >= 7 ? 'bg-brand-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="inline-flex flex-col items-center">
      <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-white font-bold text-lg', tone)}>
        {score.toFixed(1)}
      </div>
      {label && <span className="mt-1 text-xs text-surface-500">{label}</span>}
    </div>
  );
}

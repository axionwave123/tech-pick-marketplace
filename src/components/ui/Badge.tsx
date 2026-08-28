import { cn } from '@/lib/utils';

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'discount';
  className?: string;
}) {
  const styles = {
    default: 'bg-surface-100 text-surface-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-800',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-brand-50 text-brand-700',
    discount: 'bg-red-500 text-white',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

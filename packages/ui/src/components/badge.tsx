import { HTMLAttributes } from 'react';

type BadgeVariant = 'premium' | 'new' | 'verified' | 'featured' | 'default';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  premium:  'bg-[var(--brand-gold-600)] text-[var(--brand-plum-900)]',
  new:      'bg-[var(--brand-rose-600)] text-white',
  verified: 'bg-[var(--brand-navy-600)] text-[var(--brand-gold-100)]',
  featured: 'bg-[var(--brand-plum-50)] text-[var(--brand-plum-800)]',
  default:  'bg-[var(--ui-gray-100)] text-[var(--color-text-muted)]',
};

const dotColors: Partial<Record<BadgeVariant, string>> = {
  featured: 'bg-[var(--brand-gold-600)]',
};

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1',
        'rounded-full text-caption font-medium tracking-wide uppercase',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {dotColors[variant] && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

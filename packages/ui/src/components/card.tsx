import { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'elevated' | 'featured';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-[var(--color-surface)] border border-[var(--color-border)]',
  elevated: 'bg-[var(--bg-ivory-soft)] border border-[var(--color-border)]',
  featured: 'bg-[var(--brand-plum-50)] border border-[var(--brand-plum-200)]',
};

const variantPadding: Record<CardVariant, string> = {
  default: 'p-8',
  elevated: 'p-8',
  featured: 'p-10',
};

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.16)]',
        variantClasses[variant],
        variantPadding[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-semibold text-h3 text-[var(--color-text)] leading-snug ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-body text-[var(--color-text-muted)] ${className}`} {...props}>
      {children}
    </div>
  );
}

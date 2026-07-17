import { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'elevated' | 'featured';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default:  'bg-white border border-[var(--ui-gray-200)]',
  elevated: 'bg-[var(--bg-ivory-soft)] border-0',
  featured: 'bg-[var(--brand-gold-50)] border border-[var(--brand-gold-200)]',
};

const variantPadding: Record<CardVariant, string> = {
  default:  'p-8',
  elevated: 'p-8',
  featured: 'p-10',
};

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl overflow-hidden',
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
  return <div className={`mb-4 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-display font-semibold text-h3 text-[var(--color-text)] leading-snug ${className}`}
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

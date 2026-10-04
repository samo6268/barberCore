import { forwardRef, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] ' +
    'hover:-translate-y-1 hover:bg-[var(--color-primary-hover)] ' +
    'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
  secondary:
    'bg-transparent border border-[var(--brand-gold-600)] text-[var(--brand-gold-300)] ' +
    'hover:-translate-y-1 hover:bg-[rgba(216,183,106,0.12)] ' +
    'focus-visible:ring-2 focus-visible:ring-[var(--brand-gold-600)]',
  ghost:
    'bg-transparent text-[var(--color-text-muted)] ' +
    'hover:-translate-y-1 hover:bg-[var(--ui-gray-100)] ' +
    'focus-visible:ring-2 focus-visible:ring-[var(--ui-gray-400)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-button',
  md: 'px-6 py-3 text-button',
  lg: 'px-8 py-4 text-button',
  xl: 'px-10 py-5 text-button',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2',
          'rounded-xl font-semibold',
          'transition-all duration-[250ms] ease-out',
          'outline-none focus-visible:outline-none focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

import { ImgHTMLAttributes } from 'react';

type AvatarSize = 32 | 40 | 56 | 80 | 128;
type AvatarRing = 'default' | 'verified' | 'premium' | 'none';

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  size?: AvatarSize;
  ring?: AvatarRing;
  src?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  32:  'w-8 h-8 text-xs',
  40:  'w-10 h-10 text-sm',
  56:  'w-14 h-14 text-base',
  80:  'w-20 h-20 text-xl',
  128: 'w-32 h-32 text-3xl',
};

const ringMap: Record<AvatarRing, string> = {
  default:  'ring-1 ring-[var(--ui-gray-200)]',
  verified: 'ring-2 ring-[var(--brand-gold-600)]',
  premium:  'ring-2 ring-[var(--brand-rose-600)]',
  none:     '',
};

function initials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export function Avatar({ name, size = 40, ring = 'default', src, className = '', alt, ...props }: AvatarProps) {
  return (
    <div
      className={[
        'rounded-full overflow-hidden flex items-center justify-center flex-shrink-0',
        'ring-offset-2 ring-offset-[var(--color-background)]',
        sizeMap[size],
        ringMap[ring],
        className,
      ].join(' ')}
      style={{ backgroundColor: src ? undefined : 'var(--brand-rose-200)' }}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || ''}
          className="w-full h-full object-cover"
          {...props}
        />
      ) : (
        <span
          className="font-display font-semibold select-none"
          style={{ color: 'var(--brand-rose-800)' }}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}

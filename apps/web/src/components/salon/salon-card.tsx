import Link from 'next/link';
import { Star, MapPin, CheckCircle } from 'lucide-react';

interface SalonCardProps {
  salon: {
    id: string;
    slug: string;
    name: string;
    city?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    rating: number;
    reviewCount: number;
    isVerified?: boolean;
    genderType: string;
    services?: { price: number }[];
    advertisements?: { id: string }[];
  };
}

export function SalonCard({ salon }: SalonCardProps) {
  const isFeatured = (salon.advertisements?.length ?? 0) > 0;
  const minPrice = salon.services?.[0]?.price;

  return (
    <Link href={`/salons/${salon.slug}`} className="group block">
      <div
        className={[
          'rounded-2xl overflow-hidden transition-transform duration-300 ease-out',
          'group-hover:scale-[1.02]',
          isFeatured
            ? 'bg-[var(--brand-gold-50)] border border-[var(--brand-gold-200)]'
            : 'bg-white border border-[var(--ui-gray-200)]',
        ].join(' ')}
      >
        {/* Cover image — 3:4 portrait */}
        <div className="relative aspect-portrait overflow-hidden bg-[var(--ui-gray-100)]">
          {salon.coverImageUrl ? (
            <img
              src={salon.coverImageUrl}
              alt={salon.name}
              className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--brand-rose-200)' }}
            >
              <span className="font-display font-semibold text-display-md" style={{ color: 'var(--brand-rose-800)' }}>
                {salon.name.slice(0, 2)}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium uppercase tracking-wide"
                style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}>
                ویژه
              </span>
            )}
            {salon.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium"
                style={{ background: 'var(--brand-navy-600)', color: 'var(--brand-gold-100)' }}>
                <CheckCircle size={10} strokeWidth={2} />
                تأیید شده
              </span>
            )}
          </div>

          {/* Logo avatar */}
          {salon.logoUrl && (
            <div
              className="absolute bottom-0 right-4 translate-y-1/2 w-12 h-12 rounded-full overflow-hidden ring-2"
              style={{ background: 'var(--bg-ivory)', ringColor: 'var(--bg-ivory)' }}
            >
              <img src={salon.logoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className={`p-6 ${salon.logoUrl ? 'pt-8' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-h3 leading-snug" style={{ color: 'var(--color-text)' }}>
              {salon.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Star size={14} className="fill-[var(--brand-gold-600)] text-[var(--brand-gold-600)]" />
              <span className="text-body-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {salon.rating.toFixed(1)}
              </span>
              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                ({salon.reviewCount})
              </span>
            </div>
          </div>

          {salon.city && (
            <div className="flex items-center gap-1 mt-2 text-caption" style={{ color: 'var(--color-text-muted)' }}>
              <MapPin size={12} strokeWidth={1.5} />
              {salon.city}
            </div>
          )}

          {minPrice != null && (
            <div className="mt-3 text-body-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              از {minPrice.toLocaleString('fa-IR')} تومان
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

import Link from 'next/link';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SalonCardProps {
  salon: {
    id: string; slug: string; name: string; city?: string; logoUrl?: string;
    coverImageUrl?: string; rating: number; reviewCount: number;
    isVerified?: boolean; genderType: string;
    services?: { price: number }[];
    advertisements?: { id: string }[];
  };
}

export function SalonCard({ salon }: SalonCardProps) {
  const isFeatured = (salon.advertisements?.length || 0) > 0;
  const minPrice = salon.services?.[0]?.price;

  return (
    <Link href={`/salons/${salon.slug}`}>
      <div className={cn(
        'rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        isFeatured && 'ring-2'
      )}
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', ...(isFeatured ? { ringColor: 'var(--color-primary)' } : {}) }}>

        {/* Cover */}
        <div className="relative h-40 overflow-hidden" style={{ background: 'var(--color-background)' }}>
          {salon.coverImageUrl ? (
            <img src={salon.coverImageUrl} alt={salon.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">✂️</div>
          )}
          {isFeatured && (
            <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full text-white font-medium" style={{ background: 'var(--color-primary)' }}>
              ویژه
            </span>
          )}
          {salon.logoUrl && (
            <div className="absolute bottom-0 right-4 translate-y-1/2 w-12 h-12 rounded-full border-2 overflow-hidden" style={{ borderColor: 'var(--color-surface)', background: 'var(--color-background)' }}>
              <img src={salon.logoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="p-4 pt-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight" style={{ color: 'var(--color-text)' }}>
              {salon.name}
              {salon.isVerified && <CheckCircle className="inline-block w-4 h-4 mr-1 text-blue-500" />}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{salon.rating.toFixed(1)}</span>
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>({salon.reviewCount})</span>
            </div>
          </div>
          {salon.city && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
              <MapPin className="w-3 h-3" /> {salon.city}
            </div>
          )}
          {minPrice != null && (
            <div className="mt-2 text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
              از {minPrice.toLocaleString('fa-IR')} تومان
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

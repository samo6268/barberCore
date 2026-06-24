'use client';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, Phone, Clock, CheckCircle, Heart } from 'lucide-react';
import { useSalonBySlug } from '@/lib/api-hooks';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function SalonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: salon, isLoading } = useSalonBySlug(slug);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
      <div className="animate-spin w-8 h-8 border-4 rounded-full" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!salon) return (
    <div className="min-h-screen flex items-center justify-center text-center p-8" style={{ background: 'var(--color-background)' }}>
      <div><div className="text-5xl mb-4">😕</div><p>سالن یافت نشد</p></div>
    </div>
  );

  const gender = salon.genderType === 'MALE' ? 'male' : salon.genderType === 'FEMALE' ? 'female' : 'male';

  return (
    <div data-gender={gender} className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Cover */}
      <div className="relative h-64" style={{ background: 'var(--color-primary)' }}>
        {salon.coverImageUrl && <img src={salon.coverImageUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-4 right-6 flex items-end gap-4">
          {salon.logoUrl && <img src={salon.logoUrl} alt="" className="w-20 h-20 rounded-2xl border-4 object-cover" style={{ borderColor: 'var(--color-surface)' }} />}
          <div className="text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {salon.name} {salon.isVerified && <CheckCircle className="w-5 h-5 text-blue-400" />}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/80 mt-1">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{salon.rating.toFixed(1)} ({salon.reviewCount} نظر)</span>
              {salon.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{salon.city}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {salon.description && (
            <section className="rounded-2xl p-6 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>درباره سالن</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{salon.description}</p>
            </section>
          )}

          {/* Services */}
          {salon.services?.length > 0 && (
            <section className="rounded-2xl p-6 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>خدمات</h2>
              <div className="space-y-3">
                {salon.services.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{s.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.durationMinutes} دقیقه</p>
                    </div>
                    <div className="text-left">
                      {s.discountPrice ? (
                        <div>
                          <span className="text-xs line-through" style={{ color: 'var(--color-muted)' }}>{formatPrice(s.price)}</span>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{formatPrice(s.discountPrice)}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{formatPrice(s.price)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Staff */}
          {salon.staffProfiles?.length > 0 && (
            <section className="rounded-2xl p-6 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>تیم متخصصین</h2>
              <div className="flex flex-wrap gap-4">
                {salon.staffProfiles.map((staff: any) => (
                  <div key={staff.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="w-12 h-12 rounded-full overflow-hidden" style={{ background: 'var(--color-background)' }}>
                      {staff.avatarUrl ? <img src={staff.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">👤</div>}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{staff.displayName}</p>
                      {staff.specialties?.length > 0 && <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{staff.specialties.join('، ')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {salon.reviews?.length > 0 && (
            <section className="rounded-2xl p-6 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>نظرات مشتریان</h2>
              <div className="space-y-4">
                {salon.reviews.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-xl border" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{r.customer.firstName} {r.customer.lastName}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{r.comment}</p>}
                    {r.replyText && (
                      <div className="mt-2 p-2 rounded-lg text-sm" style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}>
                        <strong>پاسخ سالن:</strong> {r.replyText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar — Booking CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl p-6 border space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>رزرو آنلاین</h3>

            {salon.address && (
              <p className="text-sm flex items-start gap-2" style={{ color: 'var(--color-muted)' }}>
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {salon.address}
              </p>
            )}
            {salon.phone && (
              <p className="text-sm flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
                <Phone className="w-4 h-4" /> {salon.phone}
              </p>
            )}

            {/* Working hours */}
            {salon.workingHours?.length > 0 && (
              <div className="text-xs space-y-1">
                <p className="font-medium flex items-center gap-1" style={{ color: 'var(--color-text)' }}><Clock className="w-3.5 h-3.5" /> ساعات کاری</p>
                {salon.workingHours.filter((wh: any) => wh.isOpen).slice(0, 3).map((wh: any) => (
                  <div key={wh.id} className="flex justify-between" style={{ color: 'var(--color-muted)' }}>
                    <span>{translateDay(wh.dayOfWeek)}</span>
                    <span dir="ltr">{wh.openTime} – {wh.closeTime}</span>
                  </div>
                ))}
              </div>
            )}

            <Link href={`/salons/${slug}/book`}
              className="block w-full py-3 rounded-xl text-center text-white font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}>
              رزرو نوبت
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function translateDay(day: string) {
  const map: Record<string, string> = {
    SATURDAY: 'شنبه', SUNDAY: 'یکشنبه', MONDAY: 'دوشنبه',
    TUESDAY: 'سه‌شنبه', WEDNESDAY: 'چهارشنبه', THURSDAY: 'پنج‌شنبه', FRIDAY: 'جمعه',
  };
  return map[day] || day;
}

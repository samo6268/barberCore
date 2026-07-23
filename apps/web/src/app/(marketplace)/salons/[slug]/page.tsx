'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, MapPin, Phone, Star, UserRound } from 'lucide-react';
import { useSalonBySlug } from '@/lib/api-hooks';
import { SALON_IMAGES } from '@/lib/images';
import { formatPrice } from '@/lib/utils';

const DAY_LABELS: Record<string, string> = {
  SATURDAY: 'شنبه',
  SUNDAY: 'یکشنبه',
  MONDAY: 'دوشنبه',
  TUESDAY: 'سه‌شنبه',
  WEDNESDAY: 'چهارشنبه',
  THURSDAY: 'پنجشنبه',
  FRIDAY: 'جمعه',
};

export default function SalonDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: salon, isLoading, isError, refetch } = useSalonBySlug(slug);

  const gallery = useMemo(() => {
    if (!salon) return [SALON_IMAGES[0]];
    const images = [
      salon.coverImageUrl,
      ...(salon.media ?? [])
        .filter((item: any) => item.type === 'IMAGE')
        .map((item: any) => item.url),
    ].filter(Boolean) as string[];
    return [...new Set(images.length ? images : [SALON_IMAGES[0]])];
  }, [salon]);

  if (isLoading) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg-ivory)' }}>
        <div className="h-[55vh] animate-pulse bg-gray-200" />
        <div className="container-editorial py-12 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-28 rounded-2xl animate-pulse bg-white" />
            ))}
          </div>
          <div className="h-72 rounded-2xl animate-pulse bg-white" />
        </div>
      </main>
    );
  }

  if (isError || !salon) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 text-center"
        style={{ background: 'var(--bg-ivory)' }}
      >
        <div>
          <h1
            className="font-display text-2xl font-semibold mb-3"
            style={{ color: 'var(--brand-navy-600)' }}
          >
            سالن موردنظر یافت نشد
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--ui-gray-500)' }}>
            ممکن است سالن غیرفعال شده باشد یا دریافت اطلاعات با مشکل مواجه شده باشد.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 rounded-xl text-sm border"
              style={{ borderColor: 'var(--brand-plum-600)', color: 'var(--brand-plum-600)' }}
            >
              تلاش دوباره
            </button>
            <Link
              href="/salons"
              className="px-5 py-2.5 rounded-xl text-sm text-white"
              style={{ background: 'var(--brand-plum-600)' }}
            >
              مشاهده سالن‌ها
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const salonHours = (salon.workingHours ?? []).filter((item: any) => !item.staffId);

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-ivory)' }}>
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gallery[0]}
          alt={salon.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-8 sm:bottom-12 right-4 sm:right-12 left-4 z-10 text-white">
          <div className="flex items-center gap-2 mb-4">
            {salon.isVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-[var(--brand-plum-700)]">
                <CheckCircle className="w-3.5 h-3.5" />
                تأییدشده پرنگارین
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/45">
              {salon.genderType === 'FEMALE'
                ? 'سالن زنانه'
                : salon.genderType === 'MALE'
                  ? 'سالن مردانه'
                  : 'سالن خانوادگی'}
            </span>
          </div>
          <h1 className="font-display font-semibold text-4xl lg:text-6xl mb-4">{salon.name}</h1>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base">
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-[var(--brand-gold-600)] text-[var(--brand-gold-600)]" />
              {salon.rating.toLocaleString('fa-IR')} ({salon.reviewCount.toLocaleString('fa-IR')}{' '}
              نظر)
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {salon.city}
            </span>
          </div>
        </div>
      </section>

      <section className="container-editorial py-12 lg:py-16 grid lg:grid-cols-3 gap-10 lg:gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <p className="eyebrow mb-4">درباره سالن</p>
            <p
              className="text-body-lg leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {salon.description || `${salon.name} یکی از سالن‌های فعال در پرنگارین است.`}
            </p>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 mb-6">
              <p className="eyebrow">خدمات قابل رزرو</p>
              <span className="text-xs" style={{ color: 'var(--ui-gray-500)' }}>
                {salon.services.length.toLocaleString('fa-IR')} خدمت
              </span>
            </div>
            {salon.services.length ? (
              <div className="space-y-3">
                {salon.services.map((service: any) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-4 p-5 rounded-xl border"
                    style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}
                  >
                    <div>
                      <h2 className="font-medium text-body" style={{ color: 'var(--color-text)' }}>
                        {service.name}
                      </h2>
                      <p
                        className="text-caption mt-1 flex items-center gap-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <Clock className="w-3 h-3" />
                        {service.durationMinutes.toLocaleString('fa-IR')} دقیقه
                        {service.category?.name ? ` · ${service.category.name}` : ''}
                      </p>
                    </div>
                    <div className="text-left shrink-0">
                      {service.discountPrice && (
                        <p className="text-xs line-through" style={{ color: 'var(--ui-gray-400)' }}>
                          {formatPrice(service.price)}
                        </p>
                      )}
                      <p
                        className="font-semibold text-body"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {formatPrice(service.discountPrice ?? service.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-sm py-8 text-center rounded-xl bg-white"
                style={{ color: 'var(--ui-gray-500)' }}
              >
                در حال حاضر خدمت قابل رزروی ثبت نشده است.
              </p>
            )}
          </section>

          {salon.staffProfiles?.length > 0 && (
            <section>
              <p className="eyebrow mb-6">متخصصان سالن</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {salon.staffProfiles.map((member: any) => (
                  <article key={member.id} className="text-center">
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden mb-4 flex items-center justify-center"
                      style={{
                        outline: '2px solid var(--brand-gold-600)',
                        outlineOffset: '3px',
                        background: 'white',
                      }}
                    >
                      {member.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatarUrl}
                          alt={member.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserRound className="w-10 h-10" style={{ color: 'var(--ui-gray-400)' }} />
                      )}
                    </div>
                    <h3 className="font-medium text-body" style={{ color: 'var(--color-text)' }}>
                      {member.displayName}
                    </h3>
                    <p
                      className="text-caption mt-1 line-clamp-2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {member.specialties?.length
                        ? member.specialties.join('، ')
                        : member.bio || 'متخصص سالن'}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {gallery.length > 1 && (
            <section>
              <p className="eyebrow mb-6">گالری سالن</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.slice(1).map((image) => (
                  <div key={image} className="relative aspect-square rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`گالری ${salon.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <div
            className="sticky top-24 rounded-2xl border p-6 sm:p-8"
            style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}
          >
            <p className="eyebrow mb-3">رزرو آنلاین</p>
            <h2
              className="font-display font-semibold text-h2 mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              نوبت خود را انتخاب کنید
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--ui-gray-500)' }}>
              خدمت، متخصص و زمان مناسب را در مرحله بعد انتخاب می‌کنید.
            </p>

            {salon.services.length ? (
              <Link
                href={`/salons/${slug}/book`}
                className="block w-full py-4 text-center rounded-xl font-medium transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-primary-foreground)',
                }}
              >
                مشاهده زمان‌های آزاد
              </Link>
            ) : (
              <button
                disabled
                className="block w-full py-4 text-center rounded-xl font-medium opacity-50"
                style={{ background: 'var(--ui-gray-200)', color: 'var(--ui-gray-500)' }}
              >
                رزرو آنلاین غیرفعال است
              </button>
            )}

            <div
              className="mt-8 space-y-4 text-body-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {salon.address && (
                <div className="flex items-start gap-3">
                  <MapPin
                    className="w-5 h-5 mt-0.5 shrink-0"
                    style={{ color: 'var(--color-primary)' }}
                  />
                  {salon.address}
                </div>
              )}
              {salon.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                  <a href={`tel:${salon.phone}`} dir="ltr">
                    {salon.phone}
                  </a>
                </div>
              )}
              {salonHours.length > 0 && (
                <div className="flex items-start gap-3">
                  <Clock
                    className="w-5 h-5 mt-0.5 shrink-0"
                    style={{ color: 'var(--color-primary)' }}
                  />
                  <div className="space-y-1">
                    {salonHours.map((hour: any) => (
                      <p key={hour.id ?? hour.dayOfWeek}>
                        {DAY_LABELS[hour.dayOfWeek] ?? hour.dayOfWeek}:{' '}
                        {hour.isOpen ? `${hour.openTime} تا ${hour.closeTime}` : 'تعطیل'}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

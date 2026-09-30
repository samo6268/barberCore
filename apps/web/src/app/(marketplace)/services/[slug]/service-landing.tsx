'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  Check,
  ChevronLeft,
  MapPin,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { useSearchSalons } from '@/lib/api-hooks';
import type { ServiceCategory } from '@/lib/service-catalog';
import { AvailabilityPill } from '@/components/marketplace/marketplace-ui';
import { trackEvent } from '@/lib/analytics';

type SalonSummary = {
  id: string;
  slug: string;
  name: string;
  city?: string | null;
  rating: number;
  reviewCount?: number;
  coverImageUrl?: string | null;
  isVerified?: boolean;
  minPrice?: number | null;
};

export function ServiceLanding({ service }: { service: ServiceCategory }) {
  const salonQuery = new URLSearchParams({ service: service.query });
  if (service.gender) salonQuery.set('gender', service.gender);
  const salonsHref = `/salons?${salonQuery.toString()}`;

  const { data, isLoading } = useSearchSalons({
    page: '1',
    limit: '3',
    sort: 'rating',
    service: service.query,
    ...(service.gender ? { gender: service.gender } : {}),
  });
  const salons = ((data?.data ?? []) as SalonSummary[]).map((salon) => ({
    ...salon,
    rating: Number(salon.rating),
    minPrice: salon.minPrice == null ? null : Number(salon.minPrice),
  }));

  return (
    <main data-typography="marketplace" className="min-h-screen bg-[#fbfaf7] pt-20">
      <section className="border-b border-[#e3dcd5]">
        <div className="container-editorial py-5">
          <nav
            className="flex items-center gap-2 type-caption text-[#817a7c]"
            aria-label="مسیر صفحه"
          >
            <Link href="/" className="transition hover:text-[#805146]">
              صفحه اصلی
            </Link>
            <ChevronLeft size={13} />
            <span className="text-[#3a3336]">{service.name}</span>
          </nav>
        </div>

        <div className="container-editorial grid items-stretch pb-10 lg:grid-cols-[0.88fr_1.12fr] lg:pb-16">
          <div className="flex flex-col justify-center bg-[#30393d] px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16">
            <p className="mb-4 flex items-center gap-3 type-label text-[#d9bd88]">
              <span className="h-px w-8 bg-[#d9bd88]" aria-hidden="true" />
              {service.eyebrow}
            </p>
            <h1 className="max-w-[620px] type-display-lg text-white">{service.heroTitle}</h1>
            <p className="mt-5 max-w-xl type-body-lg text-white/70">{service.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={salonsHref}
                onClick={() => trackEvent('service_selected', { service: service.slug, source: 'service_hero' })}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#d6b276] px-6 type-button text-[#292523] transition hover:bg-[#e2c58f]"
              >
                دیدن سالن‌ها و زمان‌های خالی <ArrowLeft size={17} />
              </Link>
              <a
                href="#popular-services"
                className="inline-flex min-h-12 items-center justify-center border border-white/25 px-6 type-button text-white transition hover:border-white/50"
              >
                خدمات محبوب
              </a>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden bg-[#ded6cf] lg:min-h-[560px]">
            <Image
              src={service.image}
              alt={service.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 56vw"
              className="object-cover transition duration-700 hover:scale-[1.015]"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-5 right-5 border border-white/45 bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur-sm">
              <span className="block type-caption text-[#817a7c]">رزرو آنلاین در پرنگارین</span>
              <strong className="mt-0.5 block type-label text-[#2e282a]">
                قیمت و زمان خالی، قبل از انتخاب
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e3dcd5] bg-white">
        <div className="container-editorial grid grid-cols-1 divide-y divide-[#e9e3dd] sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-x-reverse">
          {[
            { icon: SearchCheck, title: 'مقایسه آگاهانه', text: 'نمونه‌کار، امتیاز و قیمت' },
            { icon: ShieldCheck, title: 'انتخاب مطمئن', text: 'اطلاعات شفاف سالن و متخصص' },
            { icon: CalendarCheck, title: 'رزرو ساده', text: 'انتخاب روز و ساعت بدون تماس' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 px-4 py-6 sm:justify-center">
              <Icon size={22} strokeWidth={1.6} className="shrink-0 text-[#8a5b4e]" />
              <span>
                <strong className="block type-label text-[#302a2c]">{title}</strong>
                <span className="mt-0.5 block type-caption text-[#817a7c]">{text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="popular-services" className="scroll-mt-28 py-16 lg:py-24">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="mb-3 type-label text-[#85594e]">انتخاب دقیق‌تر</p>
            <h2 className="type-h1 text-[#221d1f]">در این دسته چه چیزی می‌خواهی؟</h2>
            <p className="mt-3 max-w-md type-body text-[#756f71]">
              یکی از خدمات محبوب را انتخاب کن یا همه سالن‌های ارائه‌دهنده این دسته را ببین.
            </p>
          </div>
          <div className="flex flex-wrap content-start gap-3">
            {service.popular.map((item) => (
              <Link
                key={item}
                href={`${salonsHref}&q=${encodeURIComponent(item)}`}
                onClick={() => trackEvent('service_selected', { service: service.slug, query: item, source: 'service_popular' })}
                className="group inline-flex min-h-12 items-center gap-3 border border-[#d9d0c8] bg-white px-5 type-button text-[#3f383a] transition hover:border-[#9b6a5d] hover:text-[#805146]"
              >
                <Sparkles size={15} className="text-[#b28a4b]" />
                {item}
                <ArrowLeft size={14} className="transition group-hover:-translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e1dad3] bg-[#f1eee9] py-16 lg:py-24">
        <div className="container-editorial">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 type-label text-[#85594e]">پیشنهاد برای شروع</p>
              <h2 className="type-h1 text-[#221d1f]">سالن‌های برتر {service.name}</h2>
              <p className="mt-2 type-body text-[#756f71]">براساس امتیاز کاربران و خدمات فعال</p>
            </div>
            <Link
              href={salonsHref}
              className="inline-flex w-fit items-center gap-2 border-b border-[#bca69d] pb-1 type-button text-[#765047]"
            >
              مشاهده همه سالن‌ها <ArrowLeft size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-[390px] animate-pulse bg-white" />
              ))}
            </div>
          ) : salons.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {salons.map((salon) => (
                <Link
                  key={salon.id}
                  href={`/salons/${salon.slug}`}
                  onClick={() => trackEvent('salon_card_opened', { salonId: salon.id, source: `service_${service.slug}` })}
                  className="group border border-[#ddd6cf] bg-white transition hover:border-[#bca69d]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#d8cbc3]">
                    {salon.coverImageUrl ? (
                      <img
                        src={salon.coverImageUrl}
                        alt={`نمای سالن ${salon.name}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#6f5048]">
                        <span className="type-h1">{salon.name.slice(0, 2)}</span>
                      </div>
                    )}
                    {salon.isVerified && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 bg-white px-2.5 py-1.5 type-caption text-[#4d4648] shadow-sm">
                        <BadgeCheck size={14} className="text-[#7b554b]" /> تأیید شده
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span>
                        <strong className="block type-h3 text-[#292326]">{salon.name}</strong>
                        <span className="mt-1 flex items-center gap-1.5 type-caption text-[#7f787a]">
                          <MapPin size={14} /> {salon.city || 'نشانی در صفحه سالن'}
                        </span>
                      </span>
                      {salon.rating > 0 && (
                        <span className="flex shrink-0 items-center gap-1 type-label text-[#5d5140]">
                          <Star size={14} className="fill-[#b38a45] text-[#b38a45]" />
                          {salon.rating.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}
                        </span>
                      )}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[#ebe5df] pt-4">
                      <span className="flex flex-col items-start gap-2 type-caption text-[#777073]">
                        <AvailabilityPill />
                        {salon.minPrice != null
                          ? `شروع از ${salon.minPrice.toLocaleString('fa-IR')} تومان`
                          : 'مشاهده خدمات و زمان‌ها'}
                      </span>
                      <ArrowLeft
                        size={17}
                        className="text-[#805146] transition group-hover:-translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center border border-dashed border-[#cfc4bb] bg-white px-6 text-center">
              <Sparkles size={24} className="mb-4 text-[#a37758]" />
              <h3 className="type-h4 text-[#2e282a]">سالن مناسب را در فهرست کامل پیدا کن</h3>
              <p className="mt-2 type-body-sm text-[#817a7c]">شهر و زمان دلخواهت را مشخص کن.</p>
              <Link
                href={salonsHref}
                className="mt-5 inline-flex items-center gap-2 type-button text-[#765047]"
              >
                جست‌وجوی سالن‌ها <ArrowLeft size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-editorial">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 type-label text-[#85594e]">قبل از رزرو</p>
            <h2 className="type-h1 text-[#221d1f]">برای انتخاب بهتر به این نکات توجه کن</h2>
          </div>
          <div className="grid border-y border-[#ded7d0] md:grid-cols-3 md:divide-x md:divide-x-reverse md:divide-[#ded7d0]">
            {service.guide.map((item, index) => (
              <article
                key={item.title}
                className="border-b border-[#ded7d0] px-5 py-7 last:border-b-0 md:border-b-0 md:px-7"
              >
                <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#ece3dd] type-label text-[#805146]">
                  {(index + 1).toLocaleString('fa-IR')}
                </span>
                <h3 className="type-h4 text-[#2c2628]">{item.title}</h3>
                <p className="mt-2 type-body-sm text-[#777073]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#30393d] py-12 text-white lg:py-16">
        <div className="container-editorial flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 type-label text-[#d9bd88]">
              <Check size={16} /> آماده انتخابی؟
            </p>
            <h2 className="mt-2 type-h2 text-white">بهترین گزینه {service.name} را پیدا کن.</h2>
            <p className="mt-2 type-body-sm text-white/60">
              قیمت، زمان خالی و امتیازها را یک‌جا مقایسه کن.
            </p>
          </div>
          <Link
            href={salonsHref}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-[#d6b276] px-7 type-button text-[#292523] transition hover:bg-[#e2c58f]"
          >
            شروع جست‌وجو <ArrowLeft size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}

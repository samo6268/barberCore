'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Brush, CalendarDays, Flower2, HairDryer, Hand, MapPin, Scissors, Search, ShieldCheck, Sparkles, Star, Store } from '@barbercore/ui/icons';
import { useSearchSalons } from '@/lib/api-hooks';
import { SERVICE_CATEGORIES } from '@/lib/service-catalog';
import { trackEvent } from '@/lib/analytics';
import { ProvinceCitySelect } from '@/components/shared/province-city-select';
import { getIranCityCoordinates } from '@/lib/iran-locations';
import styles from './home.module.css';
import {
  AvailabilityPill,
  CommunityProof,
  MobileBookingBar,
  PersonalisedHint,
} from '@/components/marketplace/marketplace-ui';

type GenderFilter = 'FEMALE' | 'MALE' | 'UNISEX';

type FeaturedSalon = {
  id: string;
  slug: string;
  name: string;
  city?: string | null;
  rating: number;
  reviewCount?: number;
  genderType?: GenderFilter;
  coverImageUrl?: string | null;
  isVerified?: boolean;
  minPrice?: number | null;
};

// Keep homepage art direction in one locally bundled, warm salon-photo family.
const HERO_IMAGE = '/images/photography/parnegarin/womens-salon.webp';

const SERVICES = SERVICE_CATEGORIES;

const HOME_SERVICE_TILES = [
  { slug: 'makeup', name: 'آرایش بانوان', href: '/salons?gender=FEMALE', image: '/images/photography/parnegarin/womens-salon.webp', imageAlt: 'آرایش و استایل بانوان', icon: HairDryer },
  { slug: 'barber', name: 'آرایش آقایان', href: '/services/barber', image: '/images/photography/parnegarin/mens-barber.webp', imageAlt: 'آرایش و پیرایش آقایان', icon: Scissors },
  { slug: 'hair-color', name: 'مو و رنگ', href: '/services/hair-color', image: '/images/photography/parnegarin/hair-color.webp', imageAlt: 'رنگ و مراقبت تخصصی مو', icon: Brush },
  { slug: 'nails', name: 'پوست و ناخن', href: '/services/skincare', image: '/images/photography/parnegarin/nails.webp', imageAlt: 'مراقبت پوست و خدمات ناخن', icon: Hand },
  { slug: 'spa', name: 'ماساژ و اسپا', href: '/salons?service=ماساژ', image: '/images/photography/parnegarin/spa-facial.webp', imageAlt: 'فضای خدمات اسپا و مراقبت', icon: Flower2 },
] as const;

export default function HomePage() {
  useEffect(() => {
    trackEvent('marketplace_viewed', { surface: 'homepage' });
  }, []);

  return (
    <main data-typography="marketplace" className={`${styles.page} overflow-hidden pb-16 md:pb-0`} data-home-layout="fullbleed-v4">
      <Hero />
      <ServiceDiscovery />
      <HomeProofStrip />
      <PersonalisedSection />
      <FeaturedSalons />
      <CampaignSection />
      <BookingSteps />
      <SalonOwnerCallout />
      <MobileBookingBar />
    </main>
  );
}

function Hero() {
  const router = useRouter();
  const [service, setService] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<GenderFilter>('UNISEX');
  const [availability, setAvailability] = useState('any');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (service.trim()) params.set('service', service.trim());
    if (province.trim()) params.set('province', province.trim());
    if (city.trim()) params.set('city', city.trim());
    if (gender !== 'UNISEX') params.set('gender', gender);
    if (availability !== 'any') params.set('availability', availability);
    trackEvent('hero_search_submitted', {
      service: service.trim() || null,
      province: province.trim() || null,
      city: city.trim() || null,
      gender,
      availability,
    });
    if (typeof window !== 'undefined' && city.trim()) {
      window.localStorage.setItem('parnegarin:city', city.trim());
    }
    const query = params.toString();
    router.push(query ? `/salons?${query}` : '/salons');
  };

  const mapCoordinates = getIranCityCoordinates(city || 'تهران', province || 'تهران');
  const mapParams = new URLSearchParams({
    ...(province ? { province } : { province: 'تهران' }),
    city: city || 'تهران',
    ...(mapCoordinates ? { lat: String(mapCoordinates[0]), lng: String(mapCoordinates[1]), radiusKm: '3' } : {}),
    ...(service.trim() ? { service: service.trim() } : {}),
    ...(gender !== 'UNISEX' ? { gender } : {}),
  });

  return (
    <section className={styles.hero} aria-label="انتخاب و رزرو خدمات">
      <div className={styles.heroScene} data-testid="home-hero-scene">
        <Image src={HERO_IMAGE} alt="متخصص در حال سشوار و استایل موی مشتری در سالن" fill priority sizes="100vw" className={styles.heroPhoto} />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>زیبایی، مراقبت و آرامش؛<span>برای همه</span></h1>
          <p className={styles.heroDescription}>از آرایشگاه و باربرشاپ تا اسپا و مراقبت‌های تخصصی؛ تجربه‌ای مطمئن، نزدیک و قابل رزرو.</p>
          <div className={styles.heroActions}>
            <Link href="#services" className={styles.primaryAction}>پیدا کردن خدمت <ArrowLeft size={18} /></Link>
            <Link href="/salons" className={styles.secondaryAction}>مشاهده سالن‌ها <Store size={18} /></Link>
            <label className={styles.searchTime}>زمان ترجیحی
              <select value={availability} onChange={(event) => setAvailability(event.target.value)} className={styles.timeSelect}>
                <option value="any">هر زمان</option><option value="today">امروز</option><option value="tomorrow">فردا</option><option value="week">این هفته</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <form onSubmit={submit} className={styles.searchPanel} aria-label="جست‌وجوی سالن">
        <div className={styles.searchFields}>
          <label className={styles.searchField}>
            <span className={styles.fieldLabel}><Search size={18} /> چه خدمتی؟</span>
            <input value={service} onChange={(event) => setService(event.target.value)} list="home-services" className={styles.serviceInput} placeholder="مثلاً کوتاهی، مو، ماساژ یا فیشال" />
            <datalist id="home-services">{SERVICES.map((item) => <option key={item.query} value={item.query} />)}</datalist>
          </label>
          <fieldset className={styles.genderField}>
            <legend className={styles.fieldLabel}>برای چه کسی؟</legend>
            <div className={styles.genderOptions}>
              {([['UNISEX', 'همه'], ['FEMALE', 'بانوان'], ['MALE', 'آقایان']] as [GenderFilter, string][]).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setGender(value)} aria-pressed={gender === value}>{label}</button>
              ))}
            </div>
          </fieldset>
          <ProvinceCitySelect compact inline includeAll province={province} city={city} onProvinceChange={setProvince} onCityChange={setCity} />
          <Link href={`/salons?${mapParams}`} className={styles.mapAction}><MapPin size={27} /> انتخاب محدوده روی نقشه</Link>
          <button type="submit" className={styles.submitSearch}><Search size={22} /> جست‌وجو</button>
        </div>
      </form>
    </section>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="type-h1 text-[var(--color-text)]">{title}</h2>
        {description && <p className="mt-2 max-w-xl type-body text-[var(--color-text-muted)]">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex w-fit items-center gap-2 border-b border-[var(--brand-plum-300)] pb-1 type-button text-[var(--brand-plum-500)] transition hover:border-[var(--brand-plum-500)]"
        >
          {action.label}
          <ArrowLeft size={16} />
        </Link>
      )}
    </div>
  );
}

function ServiceDiscovery() {
  return (
    <section id="services" className={styles.services}>
        <div className={styles.servicesHeading}>
          <p className={styles.servicesEyebrow}>دسته‌بندی خدمات</p>
          <h2 className={styles.servicesTitle}>هر آنچه برای زیبایی، مراقبت و حال بهتر نیاز داری</h2>
        </div>
        <div className={styles.serviceGrid}>
          {HOME_SERVICE_TILES.map(({ slug, href, name, image, imageAlt, icon: ServiceIcon }) => (
            <Link key={name} href={href} onClick={() => trackEvent('service_selected', { service: slug, source: 'homepage_grid' })} className={styles.serviceCard}>
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  className={styles.servicePhoto}
                />
                <span className={styles.serviceOverlay} />
                <span className={styles.serviceCaption}><ServiceIcon size={28} /><strong>{name}</strong><span className={styles.serviceArrow}><ArrowLeft size={15} /></span></span>
            </Link>
          ))}
        </div>
    </section>
  );
}

function HomeProofStrip() {
  const items = [
    { label: 'انتخاب نزدیک‌تر', detail: 'جست‌وجو بر اساس شهر و محدوده', icon: MapPin },
    { label: 'انتخاب آگاهانه', detail: 'مقایسه خدمات و قیمت‌ها', icon: Store },
    { label: 'زمان مناسب شما', detail: 'مشاهده نوبت‌های آزاد', icon: CalendarDays },
    { label: 'رزرو قابل پیگیری', detail: 'دسترسی به سوابق نوبت‌ها', icon: ShieldCheck },
  ];

  return (
    <section aria-label="امکانات رزرو در پرنگارین" className={styles.proof}>
        {items.map(({ label, detail, icon: Icon }) => (
          <div key={label} className={styles.proofItem}>
            <Icon size={28} />
            <span><strong>{label}</strong><small>{detail}</small></span>
          </div>
        ))}
    </section>
  );
}

function PersonalisedSection() {
  const [city, setCity] = useState('');
  const [recentService, setRecentService] = useState('');

  useEffect(() => {
    const savedCity = window.localStorage.getItem('parnegarin:city');
    if (savedCity) setCity(savedCity);
    try {
      const events = JSON.parse(window.localStorage.getItem('parnegarin:funnel-events') || '[]');
      const lastService = [...events].reverse().find((item: any) => item?.name === 'service_selected')?.properties?.service;
      if (typeof lastService === 'string') setRecentService(lastService);
    } catch {
      // A broken local queue must never affect the homepage.
    }
  }, []);

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-raised)] py-8 lg:py-10">
      <div className="container-editorial grid gap-5 lg:grid-cols-[1fr_1.35fr] lg:items-center">
        <PersonalisedHint city={city || undefined} />
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
          <div>
            <p className="type-label text-[var(--color-text)]">برای شروع سریع‌تر</p>
            <p className="mt-1 type-caption text-[var(--color-text-muted)]">
              {recentService
                ? `پیشنهادهای مرتبط با ${recentService} و انتخاب‌های اخیرت را ببین.`
                : 'سالن‌های محبوب و نزدیک را بر اساس انتخاب‌های اخیرت ببین.'}
            </p>
          </div>
          <Link href={`/salons${city || recentService ? `?${new URLSearchParams({ ...(city ? { city } : {}), ...(recentService ? { service: recentService } : {}) }).toString()}` : ''}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--brand-plum-50)] px-4 type-button text-[var(--brand-plum-500)]">
            پیشنهادهای من <ArrowLeft size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CampaignSection() {
  const campaigns = [
    { title: 'برای یک تغییر تازه', text: 'کوتاهی و استایل مو', href: '/services/haircut', image: '/images/photography/parnegarin/womens-salon.webp' },
    { title: 'آماده یک قرار مهمی؟', text: 'میکاپ و خدمات پوست', href: '/services/makeup', image: '/images/photography/parnegarin/spa-facial.webp' },
    { title: 'استایل دقیق آقایان', text: 'اصلاح و گریم', href: '/services/barber', image: '/images/photography/parnegarin/mens-barber.webp' },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="container-editorial">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 type-label text-[var(--brand-plum-500)]">انتخاب‌های این هفته</p>
            <h2 className="type-h1 text-[var(--color-text)]">برای حال خوب بعدی‌ات</h2>
          </div>
          <CommunityProof />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.href} href={campaign.href} className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-[#30393d]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={campaign.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-105 group-hover:opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d2527] via-[#1d2527]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="type-caption text-[#ead3a6]">{campaign.text}</p>
                <h3 className="mt-1 type-h3 text-white">{campaign.title}</h3>
                <span className="mt-3 inline-flex items-center gap-2 type-caption text-white/75">دیدن گزینه‌ها <ArrowLeft size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSalons() {
  const { data, isLoading, isError } = useSearchSalons({ page: '1', limit: '3', sort: 'rating' });
  const salons = ((data?.data ?? []) as FeaturedSalon[]).map((salon) => ({
    ...salon,
    rating: Number(salon.rating),
    minPrice: salon.minPrice == null ? null : Number(salon.minPrice),
  }));

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-raised)] py-16 lg:py-24">
      <div className="container-editorial">
        <SectionHeading
          title="سالن‌های پیشنهادی برای شروع"
          description="اطلاعات هر سالن را ببین، قیمت‌ها را مقایسه کن و زمان مناسب را انتخاب کن."
          action={{ href: '/salons', label: 'همه سالن‌ها' }}
        />

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-[400px] animate-pulse rounded-2xl bg-[var(--color-surface)]" />
            ))}
          </div>
        ) : isError ? (
          <MarketplaceNotice
            title="فعلاً نتوانستیم فهرست سالن‌ها را بگیریم"
            text="کمی بعد دوباره امتحان کن یا وارد صفحه همه سالن‌ها شو."
          />
        ) : salons.length === 0 ? (
          <MarketplaceNotice
            title="هنوز سالنی برای نمایش نداریم"
            text="با اضافه‌شدن اولین سالن‌ها، پیشنهادها همین‌جا نمایش داده می‌شوند."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {salons.map((salon) => (
              <Link
                href={`/salons/${salon.slug}`}
                onClick={() => trackEvent('salon_card_opened', { salonId: salon.id, source: 'homepage_featured' })}
                key={salon.id}
                className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--brand-plum-400)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-raised)]">
                  {salon.coverImageUrl ? (
                    <img
                      src={salon.coverImageUrl}
                      alt={`نمای سالن ${salon.name}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--brand-plum-50)] text-[var(--brand-plum-500)]">
                      <span className="type-h1">{salon.name.slice(0, 2)}</span>
                    </div>
                  )}
                  {salon.isVerified && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 bg-white px-2.5 py-1.5 text-caption text-[#4d4648] shadow-sm">
                      <BadgeCheck size={14} className="text-[#7b554b]" /> تأیید شده
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="type-h3 text-[var(--color-text)]">{salon.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 type-caption text-[var(--color-text-muted)]">
                        <MapPin size={14} />
                        {salon.city || 'نشانی در صفحه سالن'}
                      </p>
                    </div>
                    {(salon.reviewCount ?? 0) > 0 && salon.rating > 0 ? (
                      <span className="flex shrink-0 items-center gap-1 type-label text-[#5d5140]">
                        <Star size={14} className="text-[#b38a45]" weight="fill" />
                        {salon.rating.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}
                        <span className="text-caption font-normal text-[var(--color-text-subtle)]">
                          ({(salon.reviewCount ?? 0).toLocaleString('fa-IR')})
                        </span>
                      </span>
                    ) : (
                      <span className="shrink-0 text-caption text-[var(--color-text-muted)]">تازه اضافه شده</span>
                    )}
                  </div>

                  <div className="mt-5 flex min-h-7 items-center justify-between border-t border-[var(--color-border)] pt-4">
                    <span className="flex flex-col items-start gap-2 type-caption text-[var(--color-text-muted)]">
                      <AvailabilityPill />
                      {salon.minPrice != null ? (
                        <span>
                          شروع قیمت از{' '}
                          <strong className="text-label text-[#332c2f]">
                            {salon.minPrice.toLocaleString('fa-IR')} تومان
                          </strong>
                        </span>
                      ) : (
                        <span>خدمات و زمان‌های خالی</span>
                      )}
                    </span>
                    <ArrowLeft
                      size={17}
                      className="shrink-0 text-[var(--brand-plum-500)] transition group-hover:-translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MarketplaceNotice({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center border border-dashed border-[#cfc4bb] bg-white px-6 text-center">
      <Store size={23} className="mb-4 text-[#805146]" />
      <h3 className="type-h4 text-[var(--color-text)]">{title}</h3>
      <p className="mt-2 type-body-sm text-[var(--color-text-muted)]">{text}</p>
      <Link
        href="/salons"
        className="mt-5 inline-flex items-center gap-2 type-button text-[var(--brand-plum-500)]"
      >
        رفتن به فهرست سالن‌ها <ArrowLeft size={15} />
      </Link>
    </div>
  );
}

function BookingSteps() {
  const steps = [
    { icon: Search, number: '۱', title: 'جست‌وجو کن', text: 'خدمت و شهر را مشخص کن.' },
    { icon: Star, number: '۲', title: 'مقایسه کن', text: 'قیمت، متخصص و نظرها را ببین.' },
    { icon: CalendarDays, number: '۳', title: 'وقت بگیر', text: 'روز و ساعت مناسب را انتخاب کن.' },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 bg-[#30383a] py-16 text-white lg:py-20">
      <div className="container-editorial grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="mb-3 flex items-center gap-3 type-label text-[#d9bd88]">
            <span className="h-px w-8 bg-[#d9bd88]" aria-hidden="true" />
            راهنمای رزرو
          </p>
          <h2 className="type-h1 text-white">سه قدم تا نوبت بعدی</h2>
          <p className="mt-3 max-w-md type-body text-white/60">
            بدون پیدا کردن شماره و هماهنگی چندباره، رزروت را ثبت و بعداً پیگیری کن.
          </p>
        </div>

        <ol className="border-t border-white/20">
          {steps.map(({ icon: Icon, number, title, text }) => (
            <li
              key={number}
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-white/20 py-5"
            >
              <span className="type-caption text-[#d9bd88]">{number}</span>
              <span>
                <strong className="block type-h4 text-white">{title}</strong>
                <span className="mt-0.5 block type-body-sm text-white/55">{text}</span>
              </span>
              <Icon size={20} className="text-white/55" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SalonOwnerCallout() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-background)] py-14 lg:py-16">
      <div className="container-editorial flex flex-col justify-between gap-6 border-r-2 border-[var(--brand-plum-500)] pr-5 sm:flex-row sm:items-center sm:pr-7">
        <div>
          <p className="type-label text-[var(--brand-plum-500)]">برای سالن‌ها و متخصصان</p>
          <h2 className="mt-1 type-h2 text-[var(--color-text)]">
            سالن خودت را معرفی کن و رزروها را یک‌جا مدیریت کن.
          </h2>
          <p className="mt-2 type-body-sm text-[var(--color-text-muted)]">
            پروفایل سالن، خدمات، تقویم نوبت‌ها و کارکنان در یک پنل.
          </p>
        </div>
        <Link
          href="/salon-owner/login?returnTo=/dashboard/salons/new"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 type-button text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          ثبت سالن <ArrowLeft size={16} />
        </Link>
      </div>
    </section>
  );
}

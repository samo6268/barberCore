'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Search, Star, Store } from 'lucide-react';
import { useSearchSalons } from '@/lib/api-hooks';

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

type ServiceItem = {
  name: string;
  hint: string;
  query: string;
  image: string;
  imageAlt: string;
  className: string;
};

const CITIES = ['تهران', 'کرج', 'مشهد', 'اصفهان', 'شیراز', 'تبریز'];

// Source pages and licence are documented in docs/design/homepage-photography.md.
const HERO_IMAGE =
  'https://images.pexels.com/photos/3736396/pexels-photo-3736396.jpeg?auto=compress&cs=tinysrgb&w=1600';

const SERVICES: ServiceItem[] = [
  {
    name: 'کوتاهی و استایل',
    hint: 'کوپ، براشینگ و استایل مو',
    query: 'کوتاهی',
    image:
      'https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg?auto=compress&cs=tinysrgb&w=900',
    imageAlt: 'کوتاهی مو در سالن زیبایی',
    className: 'md:col-span-4',
  },
  {
    name: 'رنگ و احیای مو',
    hint: 'رنگ، لایت، کراتین و احیا',
    query: 'رنگ مو',
    image:
      'https://images.pexels.com/photos/3993323/pexels-photo-3993323.jpeg?auto=compress&cs=tinysrgb&w=900',
    imageAlt: 'رنگ‌کردن مو توسط متخصص',
    className: 'md:col-span-4',
  },
  {
    name: 'ناخن',
    hint: 'کاشت، ترمیم، ژلیش و پدیکور',
    query: 'ناخن',
    image:
      'https://images.pexels.com/photos/7819722/pexels-photo-7819722.jpeg?auto=compress&cs=tinysrgb&w=900',
    imageAlt: 'مانیکور حرفه‌ای در سالن ناخن',
    className: 'md:col-span-4',
  },
  {
    name: 'میکاپ',
    hint: 'میکاپ روز، مراسم و عروس',
    query: 'میکاپ',
    image:
      'https://images.pexels.com/photos/6953627/pexels-photo-6953627.jpeg?auto=compress&cs=tinysrgb&w=900',
    imageAlt: 'اجرای میکاپ در سالن زیبایی',
    className: 'md:col-span-3',
  },
  {
    name: 'پوست و فیشال',
    hint: 'پاکسازی و مراقبت تخصصی پوست',
    query: 'پوست',
    image:
      'https://images.pexels.com/photos/7446675/pexels-photo-7446675.jpeg?auto=compress&cs=tinysrgb&w=1000',
    imageAlt: 'فیشال و مراقبت پوست در فضای اسپا',
    className: 'md:col-span-6',
  },
  {
    name: 'اصلاح آقایان',
    hint: 'مو، ریش و گریم حرفه‌ای',
    query: 'اصلاح',
    image:
      'https://images.pexels.com/photos/17553848/pexels-photo-17553848.jpeg?auto=compress&cs=tinysrgb&w=900',
    imageAlt: 'اصلاح حرفه‌ای آقایان در آرایشگاه',
    className: 'md:col-span-3',
  },
];

const QUICK_SEARCHES = [
  { label: 'رنگ و لایت', query: 'رنگ مو' },
  { label: 'کاشت ناخن', query: 'ناخن' },
  { label: 'فیشال', query: 'پوست' },
  { label: 'اصلاح آقایان', query: 'اصلاح', gender: 'MALE' as GenderFilter },
];

export default function HomePage() {
  return (
    <main data-typography="marketplace" className="overflow-hidden bg-[#fbfaf7]">
      <Hero />
      <ServiceDiscovery />
      <FeaturedSalons />
      <BookingSteps />
      <SalonOwnerCallout />
    </main>
  );
}

function Hero() {
  const router = useRouter();
  const [service, setService] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<GenderFilter>('UNISEX');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (service.trim()) params.set('service', service.trim());
    if (city.trim()) params.set('city', city.trim());
    if (gender !== 'UNISEX') params.set('gender', gender);
    const query = params.toString();
    router.push(query ? `/salons?${query}` : '/salons');
  };

  return (
    <section className="border-b border-[#e5dfd8] pt-20">
      <div className="container-editorial grid min-h-[660px] items-center gap-10 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-16">
        <div className="order-2 lg:order-1">
          <div className="mb-6 flex items-center gap-3 text-label text-[#85594e]">
            <span className="h-px w-9 bg-[#a97062]" aria-hidden="true" />
            رزرو آنلاین خدمات زیبایی
          </div>
          <h1 className="max-w-[620px] type-display-lg text-[#221d1f]">
            سالن مناسب را پیدا کن،
            <span className="block">وقتت را آنلاین بگیر.</span>
          </h1>
          <p className="mt-5 max-w-xl type-body-lg text-[#6f686a]">
            خدمت و شهرت را انتخاب کن؛ قیمت‌ها، نظرها و زمان‌های خالی را یک‌جا ببین.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 border border-[#dcd4cd] bg-white p-3 shadow-[0_12px_35px_rgba(43,32,35,0.07)]"
          >
            <fieldset className="mb-3 flex border-b border-[#ece6e0]" aria-label="نوع سالن">
              {(
                [
                  ['UNISEX', 'همه'],
                  ['FEMALE', 'بانوان'],
                  ['MALE', 'آقایان'],
                ] as [GenderFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGender(value)}
                  aria-pressed={gender === value}
                  className={`relative min-h-11 px-5 text-body-sm transition ${
                    gender === value
                      ? 'text-[#7c4f44] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#8f594d]'
                      : 'text-[#7d7678] hover:text-[#312a2d]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </fieldset>

            <div className="grid sm:grid-cols-[1.15fr_0.85fr_auto]">
              <label className="flex min-w-0 items-center gap-3 px-3 py-3 sm:border-l sm:border-[#e8e1db]">
                <Search size={19} className="shrink-0 text-[#8f594d]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-caption text-[#8d8587]">خدمت</span>
                  <input
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                    list="home-services"
                    className="mt-0.5 w-full bg-transparent text-label text-[#2d2729] outline-none placeholder:font-normal placeholder:text-[#958e90]"
                    placeholder="مثلاً رنگ مو"
                  />
                  <datalist id="home-services">
                    {SERVICES.map((item) => (
                      <option key={item.query} value={item.query} />
                    ))}
                  </datalist>
                </span>
              </label>

              <label className="flex min-w-0 items-center gap-3 border-t border-[#e8e1db] px-3 py-3 sm:border-0">
                <MapPin size={19} className="shrink-0 text-[#8f594d]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-caption text-[#8d8587]">شهر</span>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    list="home-cities"
                    className="mt-0.5 w-full bg-transparent text-label text-[#2d2729] outline-none placeholder:font-normal placeholder:text-[#958e90]"
                    placeholder="مثلاً تهران"
                  />
                  <datalist id="home-cities">
                    {CITIES.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </span>
              </label>

              <button
                type="submit"
                className="mt-2 flex min-h-14 items-center justify-center gap-2 bg-[#805146] px-6 text-white transition hover:bg-[#684138] sm:mt-0 sm:min-w-28"
              >
                جست‌وجو <ArrowLeft size={17} />
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-caption text-[#8e8789]">جست‌وجوی سریع:</span>
            {QUICK_SEARCHES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setService(item.query);
                  if (item.gender) setGender(item.gender);
                }}
                className="border-b border-[#c9b3aa] pb-0.5 text-caption text-[#655d60] transition hover:border-[#805146] hover:text-[#805146]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative aspect-[5/4] overflow-hidden bg-[#e8e1da] lg:aspect-[4/4.55]">
            <Image
              src={HERO_IMAGE}
              alt="نمای داخلی یک سالن زیبایی حرفه‌ای"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-3 border-x border-b border-[#ded7d0] bg-white">
            {['مقایسه خدمات', 'دیدن زمان خالی', 'رزرو بدون تماس'].map((item, index) => (
              <div
                key={item}
                className={`px-2 py-3 text-center text-caption text-[#5f585a] ${
                  index < 2 ? 'border-l border-[#e8e2dc]' : ''
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
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
        <h2 className="type-h1 text-[#221d1f]">{title}</h2>
        {description && <p className="mt-2 max-w-xl type-body text-[#756f71]">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex w-fit items-center gap-2 border-b border-[#c9b3aa] pb-1 type-button text-[#765047] transition hover:border-[#765047]"
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
    <section id="services" className="scroll-mt-24 py-16 lg:py-24">
      <div className="container-editorial">
        <SectionHeading
          title="دنبال چه خدمتی هستی؟"
          description="خدمت را انتخاب کن تا سالن‌ها، متخصصان و قیمت‌های مرتبط را ببینی."
        />
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-12 md:gap-x-5 md:gap-y-9">
          {SERVICES.map(({ name, hint, query, image, imageAlt, className }) => (
            <Link
              key={name}
              href={`/salons?service=${encodeURIComponent(query)}`}
              className={`group ${className}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e1da]">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 768px) 50vw, 34vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.025]"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2 border-t border-[#ded7d0] pt-3">
                <span className="min-w-0">
                  <strong className="block type-h4 text-[#2b2527]">{name}</strong>
                  <span className="mt-0.5 hidden type-caption text-[#817a7c] sm:block">{hint}</span>
                </span>
                <ArrowLeft
                  size={17}
                  className="mt-1 shrink-0 text-[#805146] transition group-hover:-translate-x-1"
                />
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
    <section className="border-y border-[#e1dad3] bg-[#f1eee9] py-16 lg:py-24">
      <div className="container-editorial">
        <SectionHeading
          title="سالن‌های پیشنهادی برای شروع"
          description="اطلاعات هر سالن را ببین، قیمت‌ها را مقایسه کن و زمان مناسب را انتخاب کن."
          action={{ href: '/salons', label: 'همه سالن‌ها' }}
        />

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-[400px] animate-pulse bg-white" />
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
                key={salon.id}
                className="group border border-[#ddd6cf] bg-white transition hover:border-[#bca69d]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#ded6cf]">
                  {salon.coverImageUrl ? (
                    <img
                      src={salon.coverImageUrl}
                      alt={`نمای سالن ${salon.name}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#d8cbc3] text-[#6f5048]">
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
                      <h3 className="type-h3 text-[#292326]">{salon.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 type-caption text-[#7f787a]">
                        <MapPin size={14} />
                        {salon.city || 'نشانی در صفحه سالن'}
                      </p>
                    </div>
                    {(salon.reviewCount ?? 0) > 0 && salon.rating > 0 ? (
                      <span className="flex shrink-0 items-center gap-1 type-label text-[#5d5140]">
                        <Star size={14} className="fill-[#b38a45] text-[#b38a45]" />
                        {salon.rating.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}
                        <span className="text-caption font-normal text-[#91898b]">
                          ({(salon.reviewCount ?? 0).toLocaleString('fa-IR')})
                        </span>
                      </span>
                    ) : (
                      <span className="shrink-0 text-caption text-[#8d8587]">تازه اضافه شده</span>
                    )}
                  </div>

                  <div className="mt-5 flex min-h-7 items-center justify-between border-t border-[#ebe5df] pt-4">
                    {salon.minPrice != null ? (
                      <span className="type-caption text-[#777073]">
                        شروع قیمت از{' '}
                        <strong className="text-label text-[#332c2f]">
                          {salon.minPrice.toLocaleString('fa-IR')} تومان
                        </strong>
                      </span>
                    ) : (
                      <span className="type-caption text-[#8d8587]">خدمات و زمان‌های خالی</span>
                    )}
                    <ArrowLeft
                      size={17}
                      className="shrink-0 text-[#805146] transition group-hover:-translate-x-1"
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
      <h3 className="type-h4 text-[#2e282a]">{title}</h3>
      <p className="mt-2 type-body-sm text-[#817a7c]">{text}</p>
      <Link
        href="/salons"
        className="mt-5 inline-flex items-center gap-2 type-button text-[#765047]"
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
              <Icon size={20} className="text-white/55" strokeWidth={1.6} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SalonOwnerCallout() {
  return (
    <section className="border-b border-[#e1dad3] bg-[#fbfaf7] py-14 lg:py-16">
      <div className="container-editorial flex flex-col justify-between gap-6 border-r-2 border-[#9a6658] pr-5 sm:flex-row sm:items-center sm:pr-7">
        <div>
          <p className="type-label text-[#86584d]">برای سالن‌ها و متخصصان</p>
          <h2 className="mt-1 type-h2 text-[#282225]">
            سالن خودت را معرفی کن و رزروها را یک‌جا مدیریت کن.
          </h2>
          <p className="mt-2 type-body-sm text-[#777073]">
            پروفایل سالن، خدمات، تقویم نوبت‌ها و کارکنان در یک پنل.
          </p>
        </div>
        <Link
          href="/salon-owner/login?returnTo=/dashboard/salons/new"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-[#805146] px-6 type-button text-white transition hover:bg-[#684138]"
        >
          ثبت سالن <ArrowLeft size={16} />
        </Link>
      </div>
    </section>
  );
}

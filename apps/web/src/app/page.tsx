'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck2,
  Check,
  Clock3,
  Crown,
  Hand,
  Leaf,
  MapPin,
  Palette,
  Search,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UserRound,
} from 'lucide-react';
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
};

type ServiceItem = {
  name: string;
  hint: string;
  query: string;
  icon: LucideIcon;
  tone: string;
  iconTone: string;
};

const CITIES = ['تهران', 'کرج', 'مشهد', 'اصفهان', 'شیراز', 'تبریز'];

const SERVICES: ServiceItem[] = [
  {
    name: 'کوتاهی و استایل',
    hint: 'کوپ، براشینگ و استایل مو',
    query: 'کوتاهی',
    icon: Scissors,
    tone: 'bg-[#f6e9e4]',
    iconTone: 'bg-[#9a6355] text-white',
  },
  {
    name: 'رنگ و احیای مو',
    hint: 'رنگ، لایت، کراتین و احیا',
    query: 'رنگ مو',
    icon: Palette,
    tone: 'bg-[#eee8f0]',
    iconTone: 'bg-[#745b78] text-white',
  },
  {
    name: 'ناخن',
    hint: 'کاشت، ترمیم، ژلیش و پدیکور',
    query: 'ناخن',
    icon: Hand,
    tone: 'bg-[#f8eee5]',
    iconTone: 'bg-[#b07862] text-white',
  },
  {
    name: 'میکاپ و عروس',
    hint: 'میکاپ، شینیون و خدمات عروس',
    query: 'میکاپ',
    icon: Crown,
    tone: 'bg-[#f5eddb]',
    iconTone: 'bg-[#9a783f] text-white',
  },
  {
    name: 'پوست و فیشال',
    hint: 'پاکسازی و مراقبت تخصصی پوست',
    query: 'پوست',
    icon: Leaf,
    tone: 'bg-[#e9f1e9]',
    iconTone: 'bg-[#627b63] text-white',
  },
  {
    name: 'اصلاح آقایان',
    hint: 'مو، ریش و گریم حرفه‌ای',
    query: 'اصلاح',
    icon: UserRound,
    tone: 'bg-[#e9edef]',
    iconTone: 'bg-[#44555d] text-white',
  },
];

const DISCOVERY_CARDS = [
  {
    title: 'انتخاب‌های محبوب بانوان',
    description: 'از رنگ و ناخن تا میکاپ؛ سالن مناسب سلیقه‌ات را پیدا کن.',
    href: '/salons?gender=FEMALE',
    image: '/images/home/salon-women.webp',
    tag: 'سالن‌های بانوان',
  },
  {
    title: 'استایل حرفه‌ای آقایان',
    description: 'آرایشگرهای منتخب را مقایسه کن و زمان خالی‌شان را ببین.',
    href: '/salons?gender=MALE',
    image: '/images/home/salon-men.webp',
    tag: 'پیرایش آقایان',
  },
  {
    title: 'زمانی برای رسیدگی به خودت',
    description: 'فضاهای آرام و متخصصان مراقبت پوست را یک‌جا کشف کن.',
    href: '/salons?service=پوست',
    image: '/images/home/salon-skin.webp',
    tag: 'پوست و مراقبت',
  },
];

export default function HomePage() {
  return (
    <main data-typography="marketplace" className="overflow-hidden bg-[#fffdf9]">
      <Hero />
      <TrustRail />
      <ServiceDiscovery />
      <FeaturedSalons />
      <DiscoverySection />
      <BookingSteps />
      <SalonOwnerCallout />
      <FinalCallout />
    </main>
  );
}

function Hero() {
  const router = useRouter();
  const [service, setService] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<GenderFilter>('FEMALE');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (service.trim()) params.set('service', service.trim());
    if (city.trim()) params.set('city', city.trim());
    if (gender !== 'UNISEX') params.set('gender', gender);
    router.push(`/salons?${params.toString()}`);
  };

  return (
    <section className="relative pt-20">
      <div className="absolute inset-x-0 top-20 h-[36rem] bg-[radial-gradient(circle_at_12%_15%,rgba(196,154,60,0.12),transparent_33%),radial-gradient(circle_at_88%_35%,rgba(154,99,85,0.12),transparent_35%)]" />
      <div className="container-editorial relative grid min-h-[690px] items-center gap-12 py-14 lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:py-20">
        <div className="relative z-10 max-w-[650px]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadbd2] bg-white/80 px-3.5 py-2 text-caption font-medium text-[#805448] shadow-sm backdrop-blur">
            <Sparkles size={14} /> رزرو آنلاین سالن‌ها و متخصصان منتخب
          </div>
          <h1 className="type-display-lg text-[#211a1e]">
            سالن و متخصصی را پیدا کن که
            <span className="mt-1 block text-[#9a6355]">واقعاً به سلیقه‌ات می‌آید.</span>
          </h1>
          <p className="mt-5 max-w-xl type-body-lg text-[#6f666a]">
            خدمات، نمونه‌کار، امتیاز و زمان‌های خالی را مقایسه کن و بدون تماس تلفنی نوبت بگیر.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 rounded-[1.5rem] border border-[#e9e0d9] bg-white p-2.5 shadow-[0_22px_60px_rgba(64,42,47,0.11)]"
          >
            <fieldset
              className="mb-2 flex gap-1 rounded-xl bg-[#f6f2ee] p-1"
              aria-label="نوع خدمات"
            >
              {(
                [
                  ['FEMALE', 'بانوان'],
                  ['MALE', 'آقایان'],
                  ['UNISEX', 'همه'],
                ] as [GenderFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGender(value)}
                  aria-pressed={gender === value}
                  className={`min-h-10 flex-1 rounded-lg px-3 transition ${gender === value ? 'bg-white text-[#7e5145] shadow-sm' : 'text-[#7d7476] hover:text-[#3a3034]'}`}
                >
                  {label}
                </button>
              ))}
            </fieldset>
            <div className="grid gap-1 sm:grid-cols-[1.2fr_0.85fr_auto]">
              <label className="flex min-w-0 items-center gap-3 rounded-xl px-3.5 py-3 sm:border-l sm:border-[#eee7e2]">
                <Search size={20} className="shrink-0 text-[#9a6355]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-caption text-[#92888c]">چه خدمتی می‌خواهی؟</span>
                  <input
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                    list="home-services"
                    className="mt-0.5 w-full bg-transparent font-medium text-[#282024] outline-none placeholder:font-normal placeholder:text-[#8b8385]"
                    placeholder="مثلاً رنگ مو یا کوتاهی"
                  />
                  <datalist id="home-services">
                    {SERVICES.map((item) => (
                      <option key={item.query} value={item.query} />
                    ))}
                  </datalist>
                </span>
              </label>
              <label className="flex min-w-0 items-center gap-3 rounded-xl border-t border-[#eee7e2] px-3.5 py-3 sm:border-0">
                <MapPin size={20} className="shrink-0 text-[#9a6355]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-caption text-[#92888c]">در کدام شهر؟</span>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    list="home-cities"
                    className="mt-0.5 w-full bg-transparent font-medium text-[#282024] outline-none"
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
                className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#8f594d] px-6 text-white transition hover:-translate-y-0.5 hover:bg-[#75463c] sm:min-w-32"
              >
                پیدا کن <ArrowLeft size={17} />
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="ml-1 text-caption text-[#8d8387]">پرطرفدار:</span>
            {[
              { label: 'رنگ و لایت', query: 'رنگ مو' },
              { label: 'کاشت ناخن', query: 'ناخن' },
              { label: 'فیشال', query: 'پوست' },
              { label: 'اصلاح آقایان', query: 'اصلاح', gender: 'MALE' as GenderFilter },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setService(item.query);
                  if (item.gender) setGender(item.gender);
                }}
                className="rounded-full border border-[#e7ddd7] bg-white px-3 py-1.5 text-caption text-[#665d60] transition hover:border-[#cfaea2] hover:text-[#8f594d]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[590px] lg:mx-0">
          <div className="absolute -inset-5 rounded-[2.6rem] border border-[#e9ded4]" />
          <div className="relative aspect-[4/4.6] overflow-hidden rounded-[2rem] bg-[#e9dfd5] shadow-[0_30px_90px_rgba(60,39,43,0.18)] sm:aspect-[5/4.2] lg:aspect-[4/4.7]">
            <Image
              src="/images/home/hero-salon-v3.webp"
              alt="تجربه حرفه‌ای خدمات زیبایی در سالن منتخب پرنگارین"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-[58%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#20191a]/30 via-transparent to-white/5" />
          </div>
          <div className="absolute -right-3 top-8 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-[0_12px_35px_rgba(48,35,38,0.14)] backdrop-blur sm:-right-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f1e9] text-[#58725b]">
              <BadgeCheck size={20} />
            </span>
            <span>
              <strong className="block text-label text-[#2a2326]">انتخاب شفاف</strong>
              <span className="text-caption text-[#7e7578]">پروفایل و امتیاز کاربران</span>
            </span>
          </div>
          <div className="absolute -bottom-5 left-3 flex items-center gap-3 rounded-2xl border border-white/60 bg-[#2d383c]/95 px-4 py-3 text-white shadow-[0_14px_40px_rgba(34,43,46,0.24)] backdrop-blur sm:-left-7 sm:px-5">
            <CalendarCheck2 size={21} className="text-[#e7c98d]" />
            <span>
              <strong className="block text-label text-white">نوبت آنلاین</strong>
              <span className="text-caption text-white/60">بدون تماس و هماهنگی طولانی</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustRail() {
  const items = [
    { icon: BadgeCheck, title: 'سالن‌های تأییدشده', text: 'اطلاعات روشن و قابل مقایسه' },
    { icon: Star, title: 'نظر کاربران واقعی', text: 'انتخاب بر پایه تجربه دیگران' },
    { icon: CalendarCheck2, title: 'رزرو بدون تماس', text: 'انتخاب خدمت، متخصص و ساعت' },
    { icon: ShieldCheck, title: 'همراهی تا روز نوبت', text: 'مشاهده و مدیریت رزروها' },
  ];
  return (
    <section className="border-y border-[#eee7e1] bg-white">
      <div className="container-editorial grid grid-cols-2 gap-px bg-[#eee7e1] lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex min-h-28 items-center gap-3 bg-white px-3 py-5 sm:px-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5ece7] text-[#8f594d]">
              <Icon size={19} strokeWidth={1.7} />
            </span>
            <span>
              <strong className="block text-label text-[#2b2427]">{title}</strong>
              <span className="mt-0.5 block text-caption text-[#847b7e]">{text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 type-label text-[#9a6355]">{eyebrow}</p>
        <h2 className="type-h1 text-[#211a1e]">{title}</h2>
        {description && <p className="mt-3 max-w-xl type-body text-[#756c70]">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex w-fit items-center gap-2 type-button text-[#805146] transition hover:gap-3"
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
          eyebrow="سریع‌تر به انتخابت برس"
          title="دنبال چه خدمتی هستی؟"
          description="از میان خدمات پرطرفدار شروع کن و سالن‌ها و متخصصان مرتبط را ببین."
        />
        <div className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {SERVICES.map(({ name, hint, query, icon: Icon, tone, iconTone }) => (
            <Link
              key={name}
              href={`/salons?service=${encodeURIComponent(query)}`}
              className={`group flex min-w-[270px] snap-start items-center gap-4 rounded-[1.3rem] p-4 transition hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(58,40,44,0.09)] sm:min-w-0 ${tone}`}
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${iconTone}`}
              >
                <Icon size={24} strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block type-h4 text-[#292125]">{name}</strong>
                <span className="mt-0.5 block type-caption text-[#796f72]">{hint}</span>
              </span>
              <ArrowLeft
                size={17}
                className="shrink-0 text-[#8e8587] transition group-hover:-translate-x-1"
              />
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
  }));
  return (
    <section className="bg-[#f5f1ec] py-16 lg:py-24">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="پیشنهادهای پرنگارین"
          title="سالن‌هایی برای یک انتخاب مطمئن"
          description="پروفایل، خدمات، متخصصان و تجربه کاربران را ببین و انتخاب آگاهانه‌تری داشته باش."
          action={{ href: '/salons', label: 'دیدن همه سالن‌ها' }}
        />
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-[430px] animate-pulse rounded-[1.6rem] bg-white" />
            ))}
          </div>
        ) : isError ? (
          <MarketplaceNotice
            title="ارتباط با سالن‌ها برقرار نشد"
            text="چند لحظه دیگر دوباره امتحان کن یا همه سالن‌ها را ببین."
          />
        ) : salons.length === 0 ? (
          <MarketplaceNotice
            title="سالن‌های منتخب به‌زودی اینجا دیده می‌شوند"
            text="ما در حال بررسی و اضافه‌کردن سالن‌های باکیفیت هستیم."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {salons.map((salon, index) => {
              const fallbackImage =
                salon.genderType === 'MALE'
                  ? '/images/home/salon-men.webp'
                  : index === 2
                    ? '/images/home/salon-skin.webp'
                    : '/images/home/salon-women.webp';
              return (
                <Link
                  href={`/salons/${salon.slug}`}
                  key={salon.id}
                  className="group overflow-hidden rounded-[1.6rem] border border-[#e9e1da] bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(49,33,38,0.12)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={salon.coverImageUrl || fallbackImage}
                      alt={salon.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 type-caption font-medium text-[#3b3034] backdrop-blur">
                      <BadgeCheck size={14} className="text-[#8f594d]" /> قابل رزرو آنلاین
                    </span>
                    <span className="absolute bottom-4 right-4 rounded-full bg-[#272124]/85 px-3 py-1.5 type-caption text-white backdrop-blur">
                      {salon.genderType === 'MALE'
                        ? 'ویژه آقایان'
                        : salon.genderType === 'UNISEX'
                          ? 'بانوان و آقایان'
                          : 'ویژه بانوان'}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="type-h3 text-[#251e22]">{salon.name}</h3>
                        <p className="mt-1 flex items-center gap-1.5 type-caption text-[#81777a]">
                          <MapPin size={14} />
                          {salon.city || 'مشاهده موقعیت در پروفایل'}
                        </p>
                      </div>
                      {salon.rating > 0 ? (
                        <span className="flex items-center gap-1 rounded-lg bg-[#fff6df] px-2.5 py-1.5 type-label text-[#6f5623]">
                          <Star size={14} className="fill-[#c89f52] text-[#c89f52]" />
                          {salon.rating.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}
                        </span>
                      ) : (
                        <span className="rounded-lg bg-[#f1eeeb] px-2.5 py-1.5 type-caption text-[#756d70]">
                          جدید
                        </span>
                      )}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[#eee8e3] pt-4">
                      <span className="type-caption text-[#8b8184]">خدمات و زمان‌های خالی</span>
                      <span className="inline-flex items-center gap-1.5 type-button text-[#805146]">
                        مشاهده و رزرو <ArrowLeft size={15} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function MarketplaceNotice({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-[#d9ccc3] bg-white px-6 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5ece7] text-[#8f594d]">
        <Store size={22} />
      </span>
      <h3 className="type-h4 text-[#2e272a]">{title}</h3>
      <p className="mt-2 type-body-sm text-[#81777a]">{text}</p>
      <Link
        href="/salons"
        className="mt-5 inline-flex items-center gap-2 type-button text-[#805146]"
      >
        مشاهده بازار سالن‌ها <ArrowLeft size={15} />
      </Link>
    </div>
  );
}

function DiscoverySection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="برای هر سلیقه و هر سبک"
          title="انتخابی که با تو شروع می‌شود"
          description="مسیر مناسب خودت را انتخاب کن؛ پرنگارین گزینه‌های مرتبط را برایت مرتب می‌کند."
        />
        <div className="grid gap-4 lg:grid-cols-[1.16fr_0.92fr_0.92fr]">
          {DISCOVERY_CARDS.map((card, index) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group relative overflow-hidden rounded-[1.7rem] ${index === 0 ? 'min-h-[500px]' : 'min-h-[370px] lg:min-h-[500px]'}`}
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#191416]/90 via-[#21191b]/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                <span className="mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 type-caption text-white backdrop-blur">
                  {card.tag}
                </span>
                <h3 className="type-h2 text-white">{card.title}</h3>
                <p className="mt-2 max-w-sm type-body-sm text-white/70">{card.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 type-button text-[#f0d8a8]">
                  دیدن پیشنهادها{' '}
                  <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingSteps() {
  const steps = [
    { icon: Search, title: 'پیدا کن', text: 'خدمت و شهر را مشخص کن تا گزینه‌های مرتبط را ببینی.' },
    {
      icon: Star,
      title: 'مقایسه کن',
      text: 'سالن، متخصص، نمونه‌کار، امتیاز و قیمت را کنار هم ببین.',
    },
    {
      icon: Clock3,
      title: 'وقت بگیر',
      text: 'روز و ساعت مناسب را انتخاب کن و رزروت را آنلاین ثبت کن.',
    },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-[#293438] py-16 text-white lg:py-24">
      <div className="container-editorial">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.4fr] lg:items-start">
          <div>
            <p className="mb-3 type-label text-[#e5c68a]">ساده، روشن و بدون تماس</p>
            <h2 className="type-h1 text-white">از تصمیم تا رزرو، فقط در چند دقیقه</h2>
            <p className="mt-4 max-w-md type-body text-white/60">
              وقتت را صرف پیدا کردن شماره و هماهنگی چندباره نکن؛ مسیر رزرو یک‌جا و قابل پیگیری است.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-5 sm:p-6"
              >
                <div className="mb-9 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#efd39e]">
                    <Icon size={21} strokeWidth={1.7} />
                  </span>
                  <span className="type-caption text-white/30">۰{index + 1}</span>
                </div>
                <h3 className="type-h3 text-white">{title}</h3>
                <p className="mt-2 type-body-sm text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SalonOwnerCallout() {
  const benefits = ['صفحه اختصاصی سالن', 'رزرو و تقویم یکپارچه', 'مدیریت کارکنان و خدمات'];
  return (
    <section className="py-16 lg:py-20">
      <div className="container-editorial">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-[#e7ddd5] bg-[#f2ebe5] px-6 py-9 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full border border-[#cdaea1]/30" />
          <div className="relative max-w-xl">
            <p className="mb-2 type-label text-[#946052]">صاحب سالن یا متخصص هستی؟</p>
            <h2 className="type-h2 text-[#282124]">مشتری‌های بیشتری تو را پیدا کنند</h2>
            <p className="mt-3 type-body-sm text-[#756b6e]">
              حضور حرفه‌ای خودت را در پرنگارین بساز و رزروهای روزانه را منظم‌تر مدیریت کن.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="inline-flex items-center gap-1.5 type-caption text-[#61575a]"
                >
                  <Check size={14} className="text-[#8f594d]" />
                  {benefit}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/salon-owner/login?returnTo=/dashboard/salons/new"
            className="relative mt-7 inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2d383c] px-6 type-button text-white transition hover:-translate-y-0.5 hover:bg-[#20292c] lg:mt-0"
          >
            ثبت سالن در پرنگارین <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCallout() {
  return (
    <section className="pb-20">
      <div className="container-editorial">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#8f594d] px-6 py-14 text-center sm:px-12 lg:py-20">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full border border-[#efd39e]/20" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <Sparkles className="mx-auto mb-4 text-[#efd39e]" size={25} />
            <h2 className="type-h1 text-white">نوبت بعدی‌ات را همین حالا پیدا کن</h2>
            <p className="mt-4 type-body text-white/70">
              سالن‌ها و متخصصان را مقایسه کن و زمانی را انتخاب کن که با برنامه تو هماهنگ است.
            </p>
            <Link
              href="/salons"
              className="mt-7 inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-[#f4dba9] px-7 type-button text-[#3c2b27] transition hover:-translate-y-0.5 hover:bg-[#f7e5c0]"
            >
              مشاهده سالن‌ها <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

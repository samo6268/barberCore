'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Heart,
  MapPin,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UserRound,
} from 'lucide-react';
import { useFeaturedSalons } from '@/lib/api-hooks';
import { SALON_IMAGES } from '@/lib/images';

type FeaturedSalon = {
  id: string;
  slug: string;
  name: string;
  city: string;
  rating: number;
  genderType?: 'FEMALE' | 'MALE' | 'UNISEX';
  coverImageUrl?: string | null;
};

const SERVICES = [
  { name: 'کوتاهی و استایل مو', query: 'کوتاهی', icon: '✂' },
  { name: 'رنگ و لایت', query: 'رنگ مو', icon: '◐' },
  { name: 'میکاپ', query: 'میکاپ', icon: '✦' },
  { name: 'ناخن', query: 'ناخن', icon: '⌁' },
  { name: 'پوست و زیبایی', query: 'پوست', icon: '○' },
  { name: 'اصلاح و گریم', query: 'اصلاح', icon: '◇' },
];

const FALLBACK_SALONS: FeaturedSalon[] = [
  {
    id: 'luxe-beauty',
    slug: 'luxe-beauty',
    name: 'لوکس بیوتی',
    city: 'تهران',
    rating: 4.9,
    genderType: 'FEMALE',
    coverImageUrl: SALON_IMAGES[0],
  },
  {
    id: 'barber-classics',
    slug: 'barber-classics',
    name: 'باربر کلاسیک',
    city: 'تهران',
    rating: 4.8,
    genderType: 'MALE',
    coverImageUrl: SALON_IMAGES[1],
  },
  {
    id: 'rose-salon',
    slug: 'rose-salon',
    name: 'رز سالن',
    city: 'اصفهان',
    rating: 4.7,
    genderType: 'FEMALE',
    coverImageUrl: SALON_IMAGES[2],
  },
  {
    id: 'vogue-studio',
    slug: 'vogue-studio',
    name: 'ووگ استودیو',
    city: 'مشهد',
    rating: 4.9,
    genderType: 'UNISEX',
    coverImageUrl: SALON_IMAGES[4],
  },
];

const TREND_CARDS = [
  {
    title: 'رنگ‌های گرم و طبیعی',
    subtitle: 'ترند این فصل',
    image: SALON_IMAGES[5],
    href: '/salons?service=رنگ مو',
    tone: '#6b3f50',
  },
  {
    title: 'استایل تازه برای آقایان',
    subtitle: 'انتخاب حرفه‌ای',
    image: SALON_IMAGES[1],
    href: '/salons?gender=MALE',
    tone: '#253342',
  },
  {
    title: 'مراقبت، فراتر از زیبایی',
    subtitle: 'وقت رسیدگی به خودت',
    image: SALON_IMAGES[6],
    href: '/salons?service=پوست',
    tone: '#765f50',
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#fffdf9]">
      <Hero />
      <TrustBar />
      <ServiceDiscovery />
      <FeaturedSalons />
      <TrendSection />
      <ValueSection />
      <EcosystemSection />
      <FinalCallout />
    </main>
  );
}

function Hero() {
  const router = useRouter();
  const [service, setService] = useState('');
  const [city, setCity] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (service.trim()) params.set('service', service.trim());
    if (city.trim()) params.set('city', city.trim());
    router.push(`/salons${params.size ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative min-h-[760px] pt-20 lg:min-h-[820px]">
      <Image
        src="/images/hero/parnegarin-home-v2.webp"
        alt="تجربه خدمات زیبایی و آرایشگری در پرنگارین"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[42%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-[#211c19]/95 via-[#352b26]/70 to-[#1b1715]/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1816]/55 via-transparent to-[#1c1816]/10" />

      <div className="container-editorial relative z-10 flex min-h-[680px] items-center py-16 lg:min-h-[740px]">
        <div className="w-full max-w-[710px] text-white">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs backdrop-blur-md">
            <Sparkles size={14} className="text-[#e9c98a]" />
            ساده‌ترین راه برای پیدا کردن یک تجربه خوب
          </div>

          <h1 className="mb-6 max-w-[680px] font-display text-[3rem] font-semibold leading-[1.22] text-white sm:text-[4rem] lg:text-[5.25rem]">
            زیبایی را
            <span className="block text-[#ead3a6]">با اطمینان انتخاب کن.</span>
          </h1>

          <p className="mb-9 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
            سالن‌ها و متخصصان برتر را مقایسه کن، زمان‌های خالی را ببین و نوبتت را همان لحظه رزرو کن.
          </p>

          <form
            onSubmit={submit}
            className="grid gap-2 rounded-[1.4rem] bg-white p-2.5 shadow-[0_24px_80px_rgba(10,5,10,0.28)] sm:grid-cols-[1fr_0.8fr_auto]"
          >
            <label className="flex min-w-0 items-center gap-3 rounded-xl px-4 py-3.5 sm:border-l sm:border-[#ece6df]">
              <Search size={20} className="shrink-0 text-[#8a756d]" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-[#9a8c96]">چه خدمتی؟</span>
                <input
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  className="mt-0.5 w-full bg-transparent text-sm font-medium text-[#29231f] outline-none placeholder:text-[#756b66]"
                  placeholder="مثلاً کوتاهی یا رنگ مو"
                />
              </span>
            </label>

            <label className="flex min-w-0 items-center gap-3 rounded-xl border-t border-[#ece6df] px-4 py-3.5 sm:border-0">
              <MapPin size={20} className="shrink-0 text-[#8a756d]" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-[#9a8c96]">کجا؟</span>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-0.5 w-full bg-transparent text-sm font-medium text-[#29231f] outline-none placeholder:text-[#756b66]"
                  placeholder="شهر یا محله"
                />
              </span>
            </label>

            <button
              type="submit"
              className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#8b5e50] px-7 text-sm font-semibold text-white transition hover:bg-[#6f473c]"
            >
              جست‌وجو
              <ArrowLeft size={17} />
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-white/70">
            <span className="text-white/45">جست‌وجوی محبوب:</span>
            {[
              ['کوتاهی مو', 'کوتاهی'],
              ['رنگ و لایت', 'رنگ مو'],
              ['میکاپ', 'میکاپ'],
              ['اصلاح آقایان', 'اصلاح'],
            ].map(([label, query]) => (
              <Link
                key={label}
                href={`/salons?service=${encodeURIComponent(query)}`}
                className="border-b border-white/25 pb-0.5 transition hover:border-[#ead3a6] hover:text-[#ead3a6]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: BadgeCheck, title: 'متخصصان تأییدشده', text: 'انتخاب با اطلاعات شفاف' },
    { icon: CalendarDays, title: 'رزرو آنلاین و فوری', text: 'بدون تماس و انتظار' },
    { icon: ShieldCheck, title: 'انتخاب مطمئن', text: 'امتیاز و تجربه کاربران' },
  ];

  return (
    <section className="border-b border-[#ebe5df] bg-white">
      <div className="container-editorial grid divide-y divide-[#ebe5df] md:grid-cols-3 md:divide-x md:divide-x-reverse md:divide-y-0">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-4 px-3 py-7 md:justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3e9e2] text-[#8b5e50]">
              <Icon size={21} strokeWidth={1.7} />
            </span>
            <span>
              <strong className="block text-sm text-[#1f1920]">{title}</strong>
              <span className="mt-1 block text-xs text-[#81767d]">{text}</span>
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
    <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-[#a16e5d]">{eyebrow}</p>
        <h2 className="font-display text-3xl font-semibold leading-tight text-[#1e171d] sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 max-w-xl text-sm leading-7 text-[#7a7076]">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#7b5145] transition hover:gap-3"
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
    <section className="py-20 lg:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="از چه خدمتی شروع کنیم؟"
          title="هر چیزی که برای خودت می‌خواهی"
          description="خدمت دلخواهت را انتخاب کن و بهترین گزینه‌های نزدیک به خودت را ببین."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICES.map((service, index) => (
            <Link
              key={service.name}
              href={`/salons?service=${encodeURIComponent(service.query)}`}
              className="group flex min-h-44 flex-col justify-between rounded-[1.25rem] border border-[#e9e3dd] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d8bfcf] hover:shadow-[0_16px_40px_rgba(54,35,48,0.08)]"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${
                  index % 2 ? 'bg-[#f3eee7] text-[#756052]' : 'bg-[#f3e9e2] text-[#8b5e50]'
                }`}
              >
                {service.icon}
              </span>
              <span className="mt-8 flex items-end justify-between gap-2">
                <strong className="text-sm leading-6 text-[#2b2329]">{service.name}</strong>
                <ArrowLeft
                  size={15}
                  className="shrink-0 text-[#a69c96] transition group-hover:-translate-x-1 group-hover:text-[#8b5e50]"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSalons() {
  const { data, isLoading } = useFeaturedSalons();
  const salons = useMemo(() => {
    const live = ((data ?? []) as FeaturedSalon[]).map((salon) => ({
      ...salon,
      rating: Number(salon.rating),
    }));
    const keys = new Set(live.map((salon) => salon.slug));
    return [...live, ...FALLBACK_SALONS.filter((salon) => !keys.has(salon.slug))].slice(0, 4);
  }, [data]);

  return (
    <section className="bg-[#f5f1eb] py-20 lg:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="منتخب پرنگارین"
          title="سالن‌هایی که ارزش امتحان دارند"
          description="گزینه‌های محبوب را با امتیاز، موقعیت و فضای کاری‌شان مقایسه کن."
          action={{ href: '/salons', label: 'مشاهده همه سالن‌ها' }}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(isLoading ? FALLBACK_SALONS : salons).map((salon, index) => (
            <Link
              href={`/salons/${salon.slug}`}
              key={salon.id}
              className="group overflow-hidden rounded-[1.4rem] bg-white shadow-[0_1px_0_rgba(30,20,27,0.05)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={salon.coverImageUrl || SALON_IMAGES[index % SALON_IMAGES.length]}
                  alt={salon.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#392e35] backdrop-blur">
                  <CheckCircle2 size={13} className="text-[#8b5e50]" />
                  تأییدشده
                </span>
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#8b5e50] backdrop-blur transition hover:bg-white"
                >
                  <Heart size={17} />
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#211a20]">{salon.name}</h3>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-[#847980]">
                      <MapPin size={13} />
                      {salon.city}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-lg bg-[#fff7e7] px-2 py-1 text-xs font-bold text-[#6c5528]">
                    <Star size={13} className="fill-[#c8a66a] text-[#c8a66a]" />
                    {salon.rating.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#eee9e4] pt-4">
                  <span className="text-xs text-[#8b8086]">
                    {salon.genderType === 'MALE' ? 'ویژه آقایان' : salon.genderType === 'UNISEX' ? 'بانوان و آقایان' : 'ویژه بانوان'}
                  </span>
                  <span className="text-xs font-semibold text-[#7b5145]">مشاهده و رزرو</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="الان چه چیزی محبوب است؟"
          title="برای انتخاب بعدی الهام بگیر"
          description="ترندهای روز را ببین و متخصص مناسب همان سبک را پیدا کن."
        />

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          {TREND_CARDS.map((card, index) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group relative overflow-hidden rounded-[1.6rem] ${index === 0 ? 'min-h-[500px]' : 'min-h-[360px] lg:min-h-[500px]'}`}
              style={{ background: card.tone }}
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover opacity-75 transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <p className="mb-2 text-xs text-white/65">{card.subtitle}</p>
                <div className="flex items-end justify-between gap-4">
                  <h3 className="font-display text-2xl font-semibold text-white lg:text-3xl">{card.title}</h3>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#342b27] transition group-hover:-translate-x-1">
                    <ArrowLeft size={18} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueSection() {
  const values = [
    { icon: Search, title: 'پیدا کن', text: 'با فیلتر خدمت، موقعیت و نوع سالن، انتخاب‌ها را دقیق‌تر کن.' },
    { icon: UserRound, title: 'مقایسه کن', text: 'پروفایل، نمونه‌کار، متخصصان و امتیاز هر سالن را یک‌جا ببین.' },
    { icon: Clock3, title: 'رزرو کن', text: 'زمان خالی را انتخاب کن و بدون تماس تلفنی نوبت قطعی بگیر.' },
  ];

  return (
    <section className="bg-[#30393d] py-20 text-white lg:py-28">
      <div className="container-editorial">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.4fr] lg:items-start">
          <div>
            <p className="mb-4 text-xs font-semibold text-[#c8a66a]">رزرو، آن‌طور که باید باشد</p>
            <h2 className="font-display text-4xl font-semibold leading-[1.35] text-white sm:text-5xl">
              انتخاب خوب،
              <br />
              از اطلاعات خوب شروع می‌شود.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-8 text-white/60">
              پرنگارین فاصله میان پیدا کردن سالن مناسب و گرفتن نوبت را کوتاه می‌کند.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-6">
                <div className="mb-10 flex items-center justify-between">
                  <Icon size={23} className="text-[#ead3a6]" strokeWidth={1.6} />
                  <span className="text-xs text-white/30">۰{index + 1}</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EcosystemSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-editorial">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#f1e7e0] p-8 sm:p-11">
            <div className="relative z-10 max-w-md">
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#8b5e50]">
                <GraduationCap size={23} />
              </span>
              <p className="mb-3 text-xs font-semibold text-[#a16e5d]">آکادمی پرنگارین</p>
              <h2 className="font-display text-3xl font-semibold leading-snug text-[#2d2622]">
                مهارت بعدی‌ات را از حرفه‌ای‌ها یاد بگیر
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#756a64]">
                دوره‌های تخصصی آرایش و زیبایی را ببین و مسیر حرفه‌ای خودت را توسعه بده.
              </p>
              <Link href="/academy" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#7b5145]">
                ورود به آکادمی <ArrowLeft size={16} />
              </Link>
            </div>
            <Palette className="absolute -bottom-10 -left-8 h-56 w-56 text-white/45" strokeWidth={0.7} />
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#e9ecee] p-8 sm:p-11">
            <div className="relative z-10 max-w-md">
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#253342]">
                <Store size={23} />
              </span>
              <p className="mb-3 text-xs font-semibold text-[#607181]">برای صاحبان سالن</p>
              <h2 className="font-display text-3xl font-semibold leading-snug text-[#1d2832]">
                سالن خودت را هوشمندتر مدیریت کن
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#65727d]">
                رزرو، خدمات، کارکنان و ارتباط با مشتریان را از یک پنل یکپارچه مدیریت کن.
              </p>
              <Link href="/salons/new" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#253342]">
                ثبت سالن در پرنگارین <ArrowLeft size={16} />
              </Link>
            </div>
            <Store className="absolute -bottom-11 -left-8 h-56 w-56 text-white/45" strokeWidth={0.7} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCallout() {
  return (
    <section className="pb-20">
      <div className="container-editorial">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#795145] px-7 py-16 text-center sm:px-12 lg:py-20">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full border border-[#c8a66a]/20" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <Sparkles className="mx-auto mb-5 text-[#e3c98f]" size={27} />
            <h2 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              نوبت بعدی‌ات همین نزدیکی است
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/65">
              چند دقیقه برای خودت وقت بگذار؛ پرنگارین بقیه مسیر را ساده می‌کند.
            </p>
            <Link
              href="/salons"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#ead3a6] px-8 py-4 text-sm font-bold text-[#3d2b25] transition hover:-translate-y-0.5"
            >
              پیدا کردن سالن
              <ArrowLeft size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

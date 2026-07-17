'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { HERO_IMAGE, CATEGORY_IMAGES, SALON_IMAGES, INSTRUCTOR_AVATARS } from '@/lib/images';
import { ArrowLeft, ArrowRight, Star, MapPin, Play } from 'lucide-react';
import { ScissorsIcon, CombIcon, BrushIcon, HairDryerIcon, RazorIcon } from '@ui/icons/custom';

/* ── Scroll reveal hook ──────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Mock data ───────────────────────────────────────────── */
const STATS = [
  { value: '۲٬۵۰۰+', label: 'آرایشگاه فعال' },
  { value: '۸۰٬۰۰۰+', label: 'رزرو موفق' },
  { value: '۵۰+', label: 'شهر در ایران' },
];

const CATEGORIES = [
  { id: 1, name: 'مو', desc: 'کوتاهی، رنگ، کراتین', icon: <ScissorsIcon size={32} />, image: CATEGORY_IMAGES.hair, large: true },
  { id: 2, name: 'رنگ', desc: 'هایلایت، بالیاژ، اومبره', icon: <CombIcon size={32} />, image: CATEGORY_IMAGES.color },
  { id: 3, name: 'ناخن', desc: 'مانیکور، پدیکور، ژل', icon: <BrushIcon size={32} />, image: CATEGORY_IMAGES.nails },
  { id: 4, name: 'آرایش', desc: 'میکاپ، خط چشم', icon: <HairDryerIcon size={32} />, image: CATEGORY_IMAGES.makeup, large: true },
  { id: 5, name: 'صورت', desc: 'ابرو، بند، پاکسازی', icon: <RazorIcon size={32} />, image: CATEGORY_IMAGES.face },
  { id: 6, name: 'عروس', desc: 'آرایش و شینیون عروس', icon: <BrushIcon size={32} />, image: CATEGORY_IMAGES.bridal },
  { id: 7, name: 'تخصصی', desc: 'کراتین، بوتاکس مو', icon: <HairDryerIcon size={32} />, image: CATEGORY_IMAGES.specialty, large: true },
];

const FEATURED_SALONS = [
  { id: '1', slug: 'luxe-beauty', name: 'لوکس بیوتی', city: 'تهران', rating: 4.9, reviewCount: 312, image: SALON_IMAGES[0], premium: true },
  { id: '2', slug: 'barber-classics', name: 'باربر کلاسیک', city: 'تهران', rating: 4.8, reviewCount: 224, image: SALON_IMAGES[1], premium: false },
  { id: '3', slug: 'rose-salon', name: 'رز سالن', city: 'اصفهان', rating: 4.7, reviewCount: 178, image: SALON_IMAGES[2], premium: true },
  { id: '4', slug: 'golden-hair', name: 'گلدن هیر', city: 'مشهد', rating: 4.8, reviewCount: 145, image: SALON_IMAGES[3], premium: false },
  { id: '5', slug: 'vogue-studio', name: 'ووگ استودیو', city: 'تهران', rating: 4.9, reviewCount: 289, image: SALON_IMAGES[4], premium: true },
];

const INSTRUCTORS = [
  { id: '1', name: 'نازنین احمدی', specialty: 'رنگ و هایلایت', courses: 12, image: INSTRUCTOR_AVATARS[0] },
  { id: '2', name: 'سارا کریمی', specialty: 'آرایش و میکاپ', courses: 8, image: INSTRUCTOR_AVATARS[1] },
  { id: '3', name: 'مریم رضایی', specialty: 'ناخن و اکریلیک', courses: 15, image: INSTRUCTOR_AVATARS[2] },
];

/* ══════════════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <main style={{ background: 'var(--bg-ivory)' }} className="overflow-x-hidden">

      {/* ① EDITORIAL HERO */}
      <HeroSection />

      {/* ② SOCIAL PROOF STRIP */}
      <StatsStrip />

      {/* ③ SERVICE CATEGORY SHOWCASE */}
      <CategorySection />

      {/* ④ FEATURED SALONS CAROUSEL */}
      <FeaturedSalons />

      {/* ⑤ EDITORIAL QUOTE */}
      <EditorialQuote />

      {/* ⑥ ACADEMY PREVIEW */}
      <AcademyPreview />

      {/* ⑦ HOW IT WORKS */}
      <HowItWorks />

      {/* ⑧ FINAL CTA */}
      <FinalCTA />


    </main>
  );
}

/* ── ① Hero ─────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center"
      style={{ background: 'var(--bg-ivory)' }}
    >
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 bg-plum-pattern opacity-40 pointer-events-none" />

      <div className="container-editorial w-full relative z-10">
        <div className="grid lg:grid-cols-[55%_45%] min-h-screen items-center gap-0">

          {/* Left — headline */}
          <div className="py-32 lg:py-0 flex flex-col justify-center">
            <p className="eyebrow mb-6">MOMENT 01</p>

            <h1
              className="font-display font-semibold text-display-xl lg:text-display-2xl leading-none mb-8"
              style={{ color: 'var(--color-text)', letterSpacing: '-0.04em' }}
            >
              زیبایی،
              <br />
              <span style={{ color: 'var(--color-primary)' }}>حالا یک</span>
              <br />
              تجربه است.
            </h1>

            <p className="text-body-lg mb-12 max-w-md" style={{ color: 'var(--color-text-muted)' }}>
              بهترین سالن‌های زیبایی ایران را کشف کنید. نوبت آنلاین بگیرید. تجربه‌ای فراموش‌نشدنی داشته باشید.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/salons"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-md font-medium text-lg transition-all duration-[250ms] ease-out hover:-translate-y-1"
                style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              >
                رزرو نوبت
                <ArrowLeft size={18} strokeWidth={1.5} />
              </Link>
              <Link
                href="/salons"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-md font-medium text-lg border-2 transition-all duration-[250ms] ease-out hover:-translate-y-1"
                style={{ borderColor: 'var(--brand-gold-600)', color: 'var(--color-primary)' }}
              >
                مشاهده آرایشگاه‌ها
              </Link>
            </div>
          </div>

          {/* Right — hero photo */}
          <div className="hidden lg:block relative h-screen overflow-hidden">
            <Image
              src={HERO_IMAGE}
              alt="سالن زیبایی"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Subtle color grade overlay — warm plum tint */}
            <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-tr from-[#2D1530] to-transparent" />
            {/* Bottom caption */}
            <div className="absolute bottom-10 left-10">
              <p className="text-caption uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.5)' }}>BARBERCORE EDITORIAL</p>
            </div>
            {/* Overlap left edge for editorial feel */}
            <div className="absolute inset-y-0 right-full w-16" style={{ background: 'var(--bg-ivory)' }} />
            {/* Subtle gradient on left edge */}
            <div className="absolute inset-y-0 left-0 w-32 pointer-events-none bg-gradient-to-r from-[#F9F5F0] to-transparent" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-16" style={{ background: 'var(--color-text)' }} />
        <span className="text-caption uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>اسکرول</span>
      </div>
    </section>
  );
}

/* ── ② Stats Strip ───────────────────────────────────────── */
function StatsStrip() {
  const ref = useReveal();
  return (
    <section className="py-16 border-y" style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory-soft)' }}>
      <div className="container-editorial">
        <div ref={ref} className="reveal grid grid-cols-3 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <p
                className="font-display font-semibold text-display-lg mb-2 relative inline-block gold-underline animate"
                style={{ color: 'var(--color-primary)' }}
              >
                {s.value}
              </p>
              <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── ③ Category Showcase ─────────────────────────────────── */
function CategorySection() {
  const ref = useReveal();
  const featured = CATEGORIES.filter(c => c.large);
  const small = CATEGORIES.filter(c => !c.large);

  return (
    <section className="section-editorial">
      <div className="container-editorial">
        <div ref={ref} className="reveal mb-16 text-center">
          <p className="eyebrow mb-4">خدمات</p>
          <h2 className="font-display font-semibold text-display-lg" style={{ color: 'var(--color-text)' }}>
            هر خدمتی که نیاز داری
          </h2>
        </div>

        {/* Row 1: large + small + small */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <CategoryCard cat={featured[0]} tall />
          <CategoryCard cat={small[0]} />
          <CategoryCard cat={small[1]} />
        </div>

        {/* Row 2: small + small + large */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CategoryCard cat={small[2]} />
          <CategoryCard cat={small[3]} />
          <CategoryCard cat={featured[1]} tall />
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ cat, tall }: { cat: typeof CATEGORIES[0]; tall?: boolean }) {
  return (
    <Link href={`/salons?category=${cat.name}`} className="group block">
      <div className={`relative overflow-hidden rounded-2xl ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}>
        <Image
          src={cat.image}
          alt={cat.name}
          fill
          className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-display font-semibold text-display-md text-white leading-tight">{cat.name}</h3>
              <p className="text-body-sm text-white/70 mt-1">{cat.desc}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"
              style={{ background: 'var(--brand-gold-600)' }}
            >
              <ArrowLeft size={16} style={{ color: 'var(--brand-plum-900)' }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── ④ Featured Salons Carousel ──────────────────────────── */
function FeaturedSalons() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ref = useReveal();

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <section className="section-editorial" style={{ background: 'var(--bg-ivory-soft)' }}>
      <div className="container-editorial">
        <div ref={ref} className="reveal flex items-end justify-between mb-12">
          <div>
            <p className="eyebrow mb-3">آرایشگاه‌های برتر</p>
            <h2 className="font-display font-semibold text-display-lg" style={{ color: 'var(--color-text)' }}>
              انتخاب‌های ویژه
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:-translate-y-0.5"
              style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--color-text)' }}
              aria-label="قبلی"
            >
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:-translate-y-0.5"
              style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--color-text)' }}
              aria-label="بعدی"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory"
        >
          {FEATURED_SALONS.map(salon => (
            <Link
              key={salon.id}
              href={`/salons/${salon.slug}`}
              className="group flex-none w-[300px] snap-start"
            >
              <div className="rounded-2xl overflow-hidden bg-white border border-[var(--ui-gray-200)] transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={salon.image}
                    alt={salon.name}
                    fill
                    className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
                  />
                  {salon.premium && (
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-caption font-medium uppercase tracking-wide"
                        style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}>
                        Premium
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display font-semibold text-display-md" style={{ color: 'var(--color-text)' }}>
                    {salon.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-caption" style={{ color: 'var(--color-text-muted)' }}>
                      <MapPin size={12} strokeWidth={1.5} /> {salon.city}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-[var(--brand-gold-600)] text-[var(--brand-gold-600)]" />
                      <span className="text-body-sm font-medium" style={{ color: 'var(--color-text)' }}>{salon.rating}</span>
                      <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>({salon.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/salons"
            className="inline-flex items-center gap-2 text-body-sm font-medium border-b-2 pb-0.5 transition-colors"
            style={{ borderColor: 'var(--brand-gold-600)', color: 'var(--color-primary)' }}>
            مشاهده همه آرایشگاه‌ها <ArrowLeft size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── ⑤ Editorial Quote ───────────────────────────────────── */
function EditorialQuote() {
  const ref = useReveal();
  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'var(--brand-plum-600)' }}>
      {/* Faint geometric */}
      <div className="absolute inset-0 bg-plum-pattern opacity-10 pointer-events-none" />

      <div className="container-editorial relative z-10 text-center max-w-content mx-auto">
        <div ref={ref} className="reveal">
          <div
            className="font-display leading-none mb-4 select-none"
            style={{ fontSize: '8rem', color: 'var(--brand-gold-600)', lineHeight: 0.8 }}
          >
            "
          </div>
          <blockquote
            className="font-display font-medium text-display-xl italic"
            style={{ color: 'var(--brand-gold-100)', letterSpacing: '-0.03em' }}
          >
            زیبایی، یک خدمت نیست.
            <br />
            یک تجربه است.
          </blockquote>
        </div>
      </div>
    </section>
  );
}

/* ── ⑥ Academy Preview ───────────────────────────────────── */
function AcademyPreview() {
  const ref = useReveal();
  return (
    <section className="section-editorial">
      <div className="container-editorial">
        <div ref={ref} className="reveal mb-16 text-center">
          <p className="eyebrow mb-3">Academy</p>
          <h2 className="font-display font-semibold text-display-lg" style={{ color: 'var(--color-text)' }}>
            از حرفه‌ای‌ها بیاموز
          </h2>
          <p className="text-body-lg mt-4 max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            دوره‌های آموزشی با بهترین اساتید ایران
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {INSTRUCTORS.map(inst => (
            <Link key={inst.id} href="/academy" className="group block">
              <div className="rounded-2xl overflow-hidden border border-[var(--ui-gray-200)] bg-white transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={inst.image}
                    alt={inst.name}
                    fill
                    className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-6">
                    <h3 className="font-display font-semibold text-h2 text-white">{inst.name}</h3>
                    <p className="text-body-sm text-white/70 mt-1">{inst.specialty}</p>
                    <p className="text-caption text-white/50 mt-2">{inst.courses} دوره</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-md font-medium text-lg transition-all duration-[250ms] hover:-translate-y-1"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            <Play size={18} strokeWidth={1.5} />
            ورود به آکادمی
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── ⑦ How It Works ─────────────────────────────────────── */
function HowItWorks() {
  const ref = useReveal();
  const steps = [
    { num: '۰۱', title: 'کشف', desc: 'بهترین سالن‌های شهرت را با فیلتر دقیق پیدا کن' },
    { num: '۰۲', title: 'رزرو', desc: 'با چند کلیک نوبت بگیر — بدون تلفن، بدون انتظار' },
    { num: '۰۳', title: 'تجربه', desc: 'از خدمات حرفه‌ای لذت ببر و نظرت را به اشتراک بگذار' },
  ];

  return (
    <section className="section-editorial" style={{ background: 'var(--bg-ivory-soft)' }}>
      <div className="container-editorial">
        <div ref={ref} className="reveal mb-20 text-center">
          <p className="eyebrow mb-3">چطور کار می‌کند</p>
          <h2 className="font-display font-semibold text-display-lg" style={{ color: 'var(--color-text)' }}>
            سه قدم تا تجربه
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <p
                className="font-display font-semibold text-display-2xl mb-6 leading-none"
                style={{ color: 'var(--brand-plum-100)' }}
              >
                {step.num}
              </p>
              <h3 className="font-display font-semibold text-display-md mb-4" style={{ color: 'var(--color-text)' }}>
                {step.title}
              </h3>
              <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── ⑧ Final CTA ─────────────────────────────────────────── */
function FinalCTA() {
  const ref = useReveal();
  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'var(--brand-rose-600)' }}>
      <div className="container-editorial text-center relative z-10">
        <div ref={ref} className="reveal">
          <h2
            className="font-display font-semibold text-display-xl text-white mb-10"
            style={{ letterSpacing: '-0.03em' }}
          >
            آماده‌ای؟
            <br />
            نوبتت را رزرو کن.
          </h2>
          <Link
            href="/salons"
            className="inline-flex items-center gap-2 px-12 py-5 rounded-md font-medium text-lg transition-all duration-[250ms] hover:-translate-y-1"
            style={{ background: 'var(--brand-plum-600)', color: 'var(--bg-ivory)' }}
          >
            شروع کن
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}


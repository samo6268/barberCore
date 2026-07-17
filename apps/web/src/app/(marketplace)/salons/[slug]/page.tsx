import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Phone, Clock } from 'lucide-react';
import { SALON_IMAGES, INSTRUCTOR_AVATARS } from '@/lib/images';

const MOCK_SALONS: Record<string, any> = {
  'luxe-beauty': {
    name: 'لوکس بیوتی', city: 'تهران', rating: 4.9, reviewCount: 312, premium: true,
    gallery: [SALON_IMAGES[0], SALON_IMAGES[1], SALON_IMAGES[2], SALON_IMAGES[3]],
    services: [
      { name: 'کوتاهی مو', duration: 60, price: 800000 },
      { name: 'رنگ مو', duration: 120, price: 2500000 },
      { name: 'هایلایت کامل', duration: 180, price: 4000000 },
      { name: 'کراتینه', duration: 240, price: 6000000 },
    ],
    staff: [
      { name: 'سارا کریمی', role: 'متخصص رنگ', avatar: INSTRUCTOR_AVATARS[0] },
      { name: 'مریم رضایی', role: 'متخصص کوتاهی', avatar: INSTRUCTOR_AVATARS[1] },
      { name: 'لیلا احمدی', role: 'متخصص آرایش', avatar: INSTRUCTOR_AVATARS[2] },
    ],
    description: 'سالن لوکس بیوتی با بیش از ۱۰ سال تجربه در ارائه خدمات زیبایی حرفه‌ای، فضایی آرام و لوکس برای شما فراهم کرده است.',
    address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
    phone: '۰۲۱-۸۸۷۷۶۶۵۵',
    hours: 'شنبه تا چهارشنبه ۹ تا ۲۱',
  },
  'barber-classics': {
    name: 'باربر کلاسیک', city: 'تهران', rating: 4.8, reviewCount: 224, premium: false,
    gallery: [SALON_IMAGES[1], SALON_IMAGES[5], SALON_IMAGES[6], SALON_IMAGES[7]],
    services: [
      { name: 'کوتاهی مردانه', duration: 45, price: 500000 },
      { name: 'اصلاح ریش', duration: 30, price: 300000 },
      { name: 'شیو کلاسیک', duration: 45, price: 600000 },
    ],
    staff: [
      { name: 'علی محمدی', role: 'باربر ارشد', avatar: INSTRUCTOR_AVATARS[3] },
      { name: 'رضا احمدی', role: 'باربر', avatar: INSTRUCTOR_AVATARS[4] },
    ],
    description: 'باربرشاپ کلاسیک با حال‌وهوای سنتی و خدمات حرفه‌ای مردانه',
    address: 'تهران، سعادت‌آباد، خیابان علامه',
    phone: '۰۲۱-۲۲۳۳۴۴۵۵',
    hours: 'هر روز ۱۰ تا ۲۲',
  },
  'rose-salon': {
    name: 'رز سالن', city: 'اصفهان', rating: 4.7, reviewCount: 178, premium: true,
    gallery: [SALON_IMAGES[2], SALON_IMAGES[8], SALON_IMAGES[9], SALON_IMAGES[0]],
    services: [
      { name: 'مانیکور', duration: 60, price: 400000 },
      { name: 'پدیکور', duration: 90, price: 600000 },
      { name: 'ژل ناخن', duration: 120, price: 800000 },
    ],
    staff: [{ name: 'نازنین احمدی', role: 'متخصص ناخن', avatar: INSTRUCTOR_AVATARS[5] }],
    description: 'سالن تخصصی ناخن و زیبایی در قلب اصفهان',
    address: 'اصفهان، چهارباغ بالا',
    phone: '۰۳۱-۳۶۶۵۵۴۴۳',
    hours: 'شنبه تا پنجشنبه ۹ تا ۲۰',
  },
  'golden-hair': {
    name: 'گلدن هیر', city: 'مشهد', rating: 4.8, reviewCount: 145, premium: false,
    gallery: [SALON_IMAGES[3], SALON_IMAGES[4], SALON_IMAGES[5], SALON_IMAGES[6]],
    services: [
      { name: 'کوتاهی مو', duration: 60, price: 700000 },
      { name: 'رنگ مو', duration: 120, price: 2200000 },
    ],
    staff: [{ name: 'فاطمه رضایی', role: 'استایلیست ارشد', avatar: INSTRUCTOR_AVATARS[0] }],
    description: 'سالن گلدن هیر، تجربه‌ای متفاوت در مشهد',
    address: 'مشهد، بلوار وکیل‌آباد',
    phone: '۰۵۱-۳۸۸۷۷۶۶۵',
    hours: 'هر روز ۱۰ تا ۲۱',
  },
  'vogue-studio': {
    name: 'ووگ استودیو', city: 'تهران', rating: 4.9, reviewCount: 289, premium: true,
    gallery: [SALON_IMAGES[4], SALON_IMAGES[7], SALON_IMAGES[8], SALON_IMAGES[9]],
    services: [
      { name: 'پکیج عروس', duration: 240, price: 8000000 },
      { name: 'میکاپ مجلسی', duration: 90, price: 1500000 },
      { name: 'شینیون', duration: 120, price: 1200000 },
    ],
    staff: [
      { name: 'پریا کاظمی', role: 'میکاپ آرتیست', avatar: INSTRUCTOR_AVATARS[1] },
      { name: 'یاسمن مرادی', role: 'متخصص شینیون', avatar: INSTRUCTOR_AVATARS[2] },
    ],
    description: 'ووگ استودیو، تخصصی‌ترین مرکز آرایش عروس و مجلسی',
    address: 'تهران، فرشته، خیابان فیاضی',
    phone: '۰۲۱-۲۲۶۶۵۵۴۴',
    hours: 'شنبه تا پنجشنبه ۱۰ تا ۲۲',
  },
};

export default function SalonDetailPage({ params }: { params: { slug: string } }) {
  const salon = MOCK_SALONS[params.slug];
  if (!salon) notFound();

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-ivory)' }}>
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <Image src={salon.gallery[0]} alt={salon.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-12 right-12 z-10" style={{ color: 'var(--bg-ivory)' }}>
          {salon.premium && (
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}>
              PREMIUM
            </span>
          )}
          <h1 className="font-display font-semibold text-4xl lg:text-6xl mb-4">{salon.name}</h1>
          <div className="flex items-center gap-6 text-lg">
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-[var(--brand-gold-600)] text-[var(--brand-gold-600)]" />
              {salon.rating} ({salon.reviewCount} نظر)
            </span>
            <span className="flex items-center gap-2"><MapPin className="w-5 h-5" />{salon.city}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-editorial py-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* About */}
          <div>
            <p className="eyebrow mb-4">درباره سالن</p>
            <p className="text-body-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {salon.description}
            </p>
          </div>

          {/* Services */}
          <div>
            <p className="eyebrow mb-6">خدمات</p>
            <div className="space-y-3">
              {salon.services.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-xl border"
                  style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
                  <div>
                    <h3 className="font-medium text-body" style={{ color: 'var(--color-text)' }}>{s.name}</h3>
                    <p className="text-caption mt-1 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                      <Clock className="w-3 h-3" />{s.duration} دقیقه
                    </p>
                  </div>
                  <p className="font-semibold text-body" style={{ color: 'var(--color-primary)' }}>
                    {s.price.toLocaleString('fa-IR')} تومان
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Staff */}
          <div>
            <p className="eyebrow mb-6">تیم ما</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {salon.staff.map((m: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden mb-4"
                    style={{ outline: '2px solid var(--brand-gold-600)', outlineOffset: '3px' }}>
                    <Image src={m.avatar} alt={m.name} fill className="object-cover" />
                  </div>
                  <h4 className="font-medium text-body" style={{ color: 'var(--color-text)' }}>{m.name}</h4>
                  <p className="text-caption mt-1" style={{ color: 'var(--color-text-muted)' }}>{m.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <p className="eyebrow mb-6">گالری</p>
            <div className="grid grid-cols-3 gap-3">
              {salon.gallery.slice(1).map((img: string, i: number) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image src={img} alt={`gallery ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          <div className="sticky top-24 rounded-2xl border p-8"
            style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
            <p className="eyebrow mb-4">رزرو آنلاین</p>
            <h3 className="font-display font-semibold text-h2 mb-6" style={{ color: 'var(--color-text)' }}>
              نوبت بگیر
            </h3>
            <Link
              href={`/salons/${params.slug}/book`}
              className="block w-full py-4 text-center rounded-md font-medium transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            >
              مشاهده زمان‌های آزاد
            </Link>
            <div className="mt-8 space-y-4 text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                {salon.address}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span dir="ltr">{salon.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                {salon.hours}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

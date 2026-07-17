'use client';

import Link from 'next/link';
import { Scissors, User, GraduationCap, ShieldCheck, ArrowLeft } from 'lucide-react';
import { ScissorsIcon } from '@ui/icons/custom';
import { HERO_IMAGES, SALON_IMAGES } from '@/lib/images';

const ROLES = [
  {
    id: 'customer',
    icon: User,
    title: 'مشتری هستم',
    desc: 'رزرو نوبت، مشاهده سالن‌ها، نظر و امتیاز',
    href: '/login',
    color: 'var(--brand-plum-600)',
    bg: 'var(--brand-plum-50)',
    border: 'var(--brand-plum-200)',
  },
  {
    id: 'salon-owner',
    icon: Scissors,
    title: 'سالن‌دار هستم',
    desc: 'مدیریت سالن، رزروها، کارمندان و خدمات',
    href: '/salon-owner/login',
    color: 'var(--brand-navy-600)',
    bg: 'var(--brand-navy-50)',
    border: 'var(--brand-navy-200)',
  },
  {
    id: 'instructor',
    icon: GraduationCap,
    title: 'مدرس هستم',
    desc: 'ایجاد دوره، مدیریت دانش‌جویان، درآمد آموزشی',
    href: '/instructor/login',
    color: 'var(--brand-rose-600)',
    bg: 'var(--brand-rose-50)',
    border: 'var(--brand-rose-200)',
  },
  {
    id: 'admin',
    icon: ShieldCheck,
    title: 'مدیر سامانه',
    desc: 'پنل ادمین — مدیریت کامل پلتفرم',
    href: 'http://localhost:3001/login',
    color: 'var(--brand-gold-600)',
    bg: 'var(--brand-gold-100)',
    border: 'var(--brand-gold-300)',
  },
];

export default function RoleSelectorPage() {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-ivory)' }}>

      {/* Left — editorial strip */}
      <div className="hidden lg:block w-[40%] relative overflow-hidden"
        style={{ background: 'var(--brand-plum-900)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGES[2]}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, var(--brand-plum-900) 0%, rgba(75,36,74,0.7) 100%)' }} />
        <div className="relative z-10 flex flex-col h-full p-14 justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ScissorsIcon size={20} style={{ color: 'var(--brand-gold-400)' }} />
            <span className="font-display font-semibold text-xl" style={{ color: 'var(--brand-gold-400)' }}>پرنگارین</span>
          </Link>
          <div>
            <p className="text-caption uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--brand-gold-400)' }}>
              WELCOME BACK
            </p>
            <h2 className="font-display font-semibold leading-tight mb-4"
              style={{ fontSize: '2.5rem', color: 'white', letterSpacing: '-0.03em' }}>
              شما کدام نقش
              <br />
              دارید؟
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              پرنگارین برای مشتریان، سالن‌داران، مدرسان و مدیران یک ورود اختصاصی دارد.
            </p>
          </div>
          <p className="text-caption" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © ۱۴۰۳ پرنگارین
          </p>
        </div>
      </div>

      {/* Right — role cards */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <ScissorsIcon size={18} style={{ color: 'var(--brand-plum-600)' }} />
          <span className="font-display font-semibold text-lg" style={{ color: 'var(--brand-plum-600)' }}>پرنگارین</span>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">ورود به سامانه</p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
              نقش خود را انتخاب کنید
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--ui-gray-500)' }}>
              بر اساس نقشتان وارد بخش مناسب می‌شوید
            </p>
          </div>

          <div className="space-y-3">
            {ROLES.map(role => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.id}
                  href={role.href}
                  className="group flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: 'white',
                    borderColor: 'var(--ui-gray-200)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = role.color;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--ui-gray-200)';
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ background: role.bg }}>
                    <Icon size={22} style={{ color: role.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
                      {role.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ui-gray-500)' }}>{role.desc}</p>
                  </div>
                  <ArrowLeft size={16} style={{ color: 'var(--ui-gray-300)' }}
                    className="group-hover:text-[var(--brand-plum-600)] transition-colors" />
                </Link>
              );
            })}
          </div>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--ui-gray-400)' }}>
            <Link href="/" style={{ color: 'var(--brand-plum-600)' }}>← بازگشت به صفحه اصلی</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

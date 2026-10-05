'use client';
import { useRouter } from 'next/navigation';
import { useMySalons, useMe } from '@/lib/api-hooks';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Settings,
  Calendar,
  Users,
  Scissors,
  Star,
  Zap,
  TrendingUp,
} from '@barbercore/ui/icons';
import { useEffect } from 'react';
import { SALON_IMAGES } from '@/lib/images';

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  FREE: { label: 'رایگان', color: 'var(--ui-gray-500)', bg: 'var(--ui-gray-100)' },
  STARTER: { label: 'استارتر', color: 'var(--brand-navy-400)', bg: 'var(--brand-navy-50)' },
  PROFESSIONAL: { label: 'حرفه‌ای', color: 'var(--brand-plum-600)', bg: 'var(--brand-plum-50)' },
  ENTERPRISE: { label: 'اینترپرایز', color: 'var(--brand-gold-600)', bg: 'var(--brand-gold-100)' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'فعال', color: '#27AE60' },
  PENDING_REVIEW: { label: 'در انتظار تأیید', color: '#E67E22' },
  SUSPENDED: { label: 'معلق', color: '#C0392B' },
  CLOSED: { label: 'بسته', color: 'var(--ui-gray-400)' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useMe();
  const { data: salons, isLoading, isError, refetch } = useMySalons();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    } else if (!userLoading && user && user.role !== 'SALON_OWNER' && user.role !== 'SUPER_ADMIN') {
      router.push('/');
    }
  }, [router, user, userLoading]);

  if (isLoading || userLoading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-ivory)' }}
      >
        <Loader2
          size={32}
          className="animate-spin motion-reduce:animate-none"
          style={{ color: 'var(--brand-plum-600)' }}
        />
      </div>
    );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-ivory)' }}>
      {/* Top nav */}
      <header
        className="h-14 border-b px-6 flex items-center justify-between sticky top-0 z-30"
        style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-bold" style={{ color: 'var(--brand-plum-600)' }}>
            پرنگارین
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--brand-plum-50)', color: 'var(--brand-plum-600)' }}
          >
            داشبورد
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/academy" className="text-sm" style={{ color: 'var(--ui-gray-400)' }}>
            آکادمی
          </Link>
          <Link href="/" className="text-sm" style={{ color: 'var(--ui-gray-400)' }}>
            بازگشت به سایت
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--brand-navy-600)' }}>
              سلام، {user?.firstName || 'کاربر'} عزیز
            </h1>
            <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>
              سالن‌های خود را مدیریت کنید
            </p>
          </div>
          <Link
            href="/dashboard/salons/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--brand-plum-600)', color: 'white' }}
          >
            <Plus size={16} /> سالن جدید
          </Link>
        </div>

        {/* Salon cards */}
        {isError ? (
          <div
            className="rounded-2xl border bg-white p-10 text-center"
            style={{ borderColor: 'var(--ui-gray-200)' }}
          >
            <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>
              دریافت اطلاعات سالن‌ها انجام نشد
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
              style={{ background: '#241b18' }}
            >
              تلاش دوباره
            </button>
          </div>
        ) : salons?.length ? (
          <div className="grid md:grid-cols-2 gap-6">
            {salons.map((salon: any) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl border bg-white p-10 text-center"
            style={{ borderColor: 'var(--ui-gray-200)' }}
          >
            <Scissors className="mx-auto mb-4" size={34} style={{ color: 'var(--ui-gray-400)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--brand-navy-600)' }}>
              هنوز سالنی ثبت نکرده‌اید
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ui-gray-500)' }}>
              اولین سالن خود را ثبت کنید تا مدیریت خدمات و رزروها را شروع کنید.
            </p>
            <Link
              href="/dashboard/salons/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: '#241b18' }}
            >
              <Plus size={15} /> ثبت سالن
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: '/profile', icon: Users, label: 'پروفایل من' },
            { href: '/profile/bookings', icon: Calendar, label: 'رزروهای من' },
            { href: '/academy', icon: Star, label: 'آکادمی' },
            { href: '/salons', icon: TrendingUp, label: 'مارکت‌پلیس' },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{
                background: 'white',
                borderColor: 'var(--ui-gray-200)',
                color: 'var(--brand-navy-600)',
              }}
            >
              <Icon size={20}  style={{ color: 'var(--brand-plum-600)' }} />
              {label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

function SalonCard({ salon }: { salon: any }) {
  const st = STATUS_CONFIG[salon.status] ?? STATUS_CONFIG.PENDING_REVIEW;
  const plan = salon.plan ?? salon.subscription?.tier ?? 'FREE';
  const pl = PLAN_CONFIG[plan] ?? PLAN_CONFIG.FREE;
  const fallbackIndex = salon.id.charCodeAt(salon.id.length - 1) % SALON_IMAGES.length;
  const cover = salon.coverImageUrl || SALON_IMAGES[fallbackIndex];

  return (
    <div
      className="rounded-2xl border overflow-hidden group"
      style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}
    >
      <Link href={`/dashboard/salons/${salon.id}`} className="relative block h-44 overflow-hidden">
        <img
          src={cover}
          alt={`فضای ${salon.name}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(21,27,45,.92)] via-[rgba(21,27,45,.25)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/30 bg-white/90 text-xl shadow-lg">
            {salon.logoUrl ? (
              <img src={salon.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Scissors size={21} className="text-[var(--brand-plum-600)]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold">{salon.name}</h2>
            <p className="mt-1 text-xs text-white/70">{salon.city || 'نشانی تکمیل نشده'}</p>
          </div>
          <ArrowLeft
            size={18}
            className="mb-1 shrink-0 transition-transform group-hover:-translate-x-1"
          />
        </div>
      </Link>

      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ color: st.color, background: `${st.color}18` }}
          >
            {st.label}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ color: pl.color, background: pl.bg }}
          >
            {pl.label}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {
              label: 'رزروها',
              value: salon._count?.bookings ?? 0,
              icon: Calendar,
              color: 'var(--brand-navy-400)',
            },
            {
              label: 'نظرات',
              value: salon._count?.reviews ?? 0,
              icon: Star,
              color: 'var(--brand-gold-600)',
            },
            {
              label: 'امتیاز',
              value: salon.rating != null ? Number(salon.rating).toFixed(1) : '—',
              icon: TrendingUp,
              color: 'var(--brand-plum-600)',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="text-center py-3 rounded-xl"
              style={{ background: 'var(--bg-ivory)' }}
            >
              <Icon size={16} className="mx-auto mb-1" style={{ color }} />
              <div className="font-bold text-sm" style={{ color: 'var(--brand-navy-600)' }}>
                {value}
              </div>
              <div className="text-xs" style={{ color: 'var(--ui-gray-400)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/salons/${salon.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-plum-600)] py-2.5 text-sm font-semibold text-white"
          >
            ورود به مدیریت سالن <ArrowLeft size={15} />
          </Link>
          <Link
            href={`/dashboard/salons/${salon.id}/settings`}
            aria-label="تنظیمات سالن"
            className="flex h-10 w-11 items-center justify-center rounded-xl border border-[var(--ui-gray-200)] text-[var(--brand-navy-600)] hover:border-[var(--brand-plum-400)]"
          >
            <Settings size={16} />
          </Link>
        </div>

        {/* Upgrade nudge for FREE plan */}
        {plan === 'FREE' && (
          <Link
            href="/dashboard/subscription"
            className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium w-full justify-center"
            style={{
              background: 'linear-gradient(90deg, var(--brand-plum-50), var(--brand-gold-100))',
              color: 'var(--brand-plum-600)',
            }}
          >
            <Zap size={13} style={{ color: 'var(--brand-gold-600)' }} />
            ارتقا به استارتر — کمیسیون ۲۰٪ (الان ۳۰٪)
          </Link>
        )}
      </div>
    </div>
  );
}

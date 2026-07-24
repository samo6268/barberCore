'use client';
import { useRouter } from 'next/navigation';
import { useMySalons, useMe } from '@/lib/api-hooks';
import Link from 'next/link';
import { Plus, Settings, Calendar, Users, Scissors, Star, Zap, TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import { useEffect } from 'react';

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  FREE:         { label: 'رایگان',      color: 'var(--ui-gray-500)',    bg: 'var(--ui-gray-100)'       },
  STARTER:      { label: 'استارتر',     color: 'var(--brand-navy-400)', bg: 'var(--brand-navy-50)'     },
  PROFESSIONAL: { label: 'حرفه‌ای',    color: 'var(--brand-plum-600)', bg: 'var(--brand-plum-50)'     },
  ENTERPRISE:   { label: 'اینترپرایز', color: 'var(--brand-gold-600)', bg: 'var(--brand-gold-100)'    },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE:         { label: 'فعال',            color: '#27AE60' },
  PENDING_REVIEW: { label: 'در انتظار تأیید', color: '#E67E22' },
  SUSPENDED:      { label: 'معلق',            color: '#C0392B' },
  CLOSED:         { label: 'بسته',            color: 'var(--ui-gray-400)' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useMe();
  const { data: salons, isLoading, isError, refetch } = useMySalons();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    } else if (
      !userLoading &&
      user &&
      user.role !== 'SALON_OWNER' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      router.push('/');
    }
  }, [router, user, userLoading]);

  if (isLoading || userLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-ivory)' }}>
      <div className="w-8 h-8 border-4 rounded-full animate-spin"
        style={{ borderColor: 'var(--brand-plum-600)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-ivory)' }}>

      {/* Top nav */}
      <header className="h-14 border-b px-6 flex items-center justify-between sticky top-0 z-30"
        style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold" style={{ color: 'var(--brand-plum-600)', fontFamily: 'var(--font-display)' }}>پرنگارین</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--brand-plum-50)', color: 'var(--brand-plum-600)' }}>داشبورد</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/academy" className="text-sm" style={{ color: 'var(--ui-gray-400)' }}>آکادمی</Link>
          <Link href="/" className="text-sm" style={{ color: 'var(--ui-gray-400)' }}>بازگشت به سایت</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Greeting */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
              سلام، {user?.firstName || 'کاربر'} عزیز
            </h1>
            <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>سالن‌های خود را مدیریت کنید</p>
          </div>
          <Link href="/dashboard/salons/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--brand-plum-600)', color: 'white' }}>
            <Plus size={16} /> سالن جدید
          </Link>
        </div>

        {/* Salon cards */}
        {isError ? (
          <div className="rounded-2xl border bg-white p-10 text-center" style={{ borderColor: 'var(--ui-gray-200)' }}>
            <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>دریافت اطلاعات سالن‌ها انجام نشد</p>
            <button onClick={() => refetch()} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-medium text-white" style={{ background: 'var(--brand-navy-600)' }}>
              تلاش دوباره
            </button>
          </div>
        ) : salons?.length ? (
          <div className="grid md:grid-cols-2 gap-6">
            {salons.map((salon: any) => <SalonCard key={salon.id} salon={salon} />)}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-10 text-center" style={{ borderColor: 'var(--ui-gray-200)' }}>
            <Scissors className="mx-auto mb-4" size={34} style={{ color: 'var(--ui-gray-400)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--brand-navy-600)' }}>هنوز سالنی ثبت نکرده‌اید</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ui-gray-500)' }}>اولین سالن خود را ثبت کنید تا مدیریت خدمات و رزروها را شروع کنید.</p>
            <Link href="/dashboard/salons/new" className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: 'var(--brand-navy-600)' }}>
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
            <Link key={href} href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{ background: 'white', borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)' }}>
              <Icon size={20} strokeWidth={1.5} style={{ color: 'var(--brand-plum-600)' }} />
              {label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

function SalonCard({ salon }: { salon: any }) {
  const st  = STATUS_CONFIG[salon.status] ?? STATUS_CONFIG.PENDING_REVIEW;
  const plan = salon.plan ?? salon.subscription?.tier ?? 'FREE';
  const pl  = PLAN_CONFIG[plan] ?? PLAN_CONFIG.FREE;

  return (
    <div className="rounded-2xl border overflow-hidden group"
      style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>

      {/* Cover strip */}
      <div className="h-2 w-full" style={{ background: 'var(--brand-plum-600)' }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'var(--brand-plum-50)' }}>
            {salon.logoUrl
              ? <img src={salon.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
              : '✂️'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base truncate" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
              {salon.name}
            </h2>
            <p className="text-xs" style={{ color: 'var(--ui-gray-400)' }}>{salon.city || 'بدون آدرس'}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: st.color, background: `${st.color}18` }}>{st.label}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: pl.color, background: pl.bg }}>{pl.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'رزروها', value: salon._count?.bookings ?? 0, icon: Calendar, color: 'var(--brand-navy-400)' },
            { label: 'نظرات',  value: salon._count?.reviews ?? 0,  icon: Star,     color: 'var(--brand-gold-600)' },
            { label: 'امتیاز', value: salon.rating != null ? Number(salon.rating).toFixed(1) : '—', icon: TrendingUp, color: 'var(--brand-plum-600)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center py-3 rounded-xl"
              style={{ background: 'var(--bg-ivory)' }}>
              <Icon size={16} className="mx-auto mb-1" style={{ color }} strokeWidth={1.5} />
              <div className="font-bold text-sm" style={{ color: 'var(--brand-navy-600)' }}>{value}</div>
              <div className="text-xs" style={{ color: 'var(--ui-gray-400)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Nav links */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: `/dashboard/salons/${salon.id}/bookings`, icon: Calendar,  label: 'رزروها'   },
            { href: `/dashboard/salons/${salon.id}/services`, icon: Scissors,  label: 'خدمات'    },
            { href: `/dashboard/salons/${salon.id}/staff`,    icon: Users,     label: 'کارمندان' },
            { href: `/dashboard/salons/${salon.id}/settlements`, icon: Wallet, label: 'تسویه‌ها' },
            { href: `/dashboard/salons/${salon.id}/reports`, icon: BarChart3, label: 'گزارش‌ها' },
            { href: `/dashboard/salons/${salon.id}/settings`, icon: Settings,  label: 'تنظیمات'  },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all hover:border-[var(--brand-plum-600)] hover:text-[var(--brand-plum-600)]"
              style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)' }}>
              <Icon size={15} strokeWidth={1.5} /> {label}
            </Link>
          ))}
        </div>

        {/* Upgrade nudge for FREE plan */}
        {plan === 'FREE' && (
          <Link href="/dashboard/subscription"
            className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium w-full justify-center"
            style={{ background: 'linear-gradient(90deg, var(--brand-plum-50), var(--brand-gold-100))', color: 'var(--brand-plum-600)' }}>
            <Zap size={13} style={{ color: 'var(--brand-gold-600)' }} />
            ارتقا به استارتر — کمیسیون ۲۰٪ (الان ۳۰٪)
          </Link>
        )}
      </div>
    </div>
  );
}

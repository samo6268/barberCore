'use client';
import { useRouter } from 'next/navigation';
import { useMySalons, useMe } from '@/lib/api-hooks';
import Link from 'next/link';
import { Plus, Settings, Calendar, Users, Scissors, BarChart3, Star } from 'lucide-react';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useMe();
  const { data: salons, isLoading } = useMySalons();

  useEffect(() => {
    if (!userLoading && !user) router.push('/login');
  }, [user, userLoading]);

  if (isLoading || userLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
      <div className="animate-spin w-8 h-8 border-4 rounded-full" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>🪒 پرنگارین — داشبورد</h1>
        <Link href="/" className="text-sm" style={{ color: 'var(--color-muted)' }}>بازگشت به سایت</Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>سلام، {user?.firstName}! 👋</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>سالن‌های شما را مدیریت کنید</p>
          </div>
          <Link href="/dashboard/salons/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}>
            <Plus className="w-4 h-4" /> سالن جدید
          </Link>
        </div>

        {salons?.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>هنوز سالنی ثبت نکرده‌اید</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>سالن خود را ثبت کنید و آنلاین رزرو بگیرید</p>
            <Link href="/dashboard/salons/new"
              className="inline-block px-8 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}>
              ثبت اولین سالن ←
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {salons.map((salon: any) => (
              <SalonDashboardCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SalonDashboardCard({ salon }: { salon: any }) {
  const statusMap: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'فعال', color: '#16a34a' },
    PENDING_REVIEW: { label: 'در انتظار تأیید', color: '#d97706' },
    SUSPENDED: { label: 'معلق', color: '#dc2626' },
    CLOSED: { label: 'بسته', color: '#6b7280' },
  };
  const st = statusMap[salon.status] || statusMap.PENDING_REVIEW;

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden" style={{ background: 'var(--color-background)' }}>
            {salon.logoUrl ? <img src={salon.logoUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">✂️</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate" style={{ color: 'var(--color-text)' }}>{salon.name}</h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{salon.city || 'آدرس ثبت نشده'}</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: st.color, background: `${st.color}20` }}>{st.label}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'رزروها', value: salon._count?.bookings || 0, icon: '📅' },
            { label: 'نظرات', value: salon._count?.reviews || 0, icon: '⭐' },
            { label: 'امتیاز', value: salon.rating?.toFixed(1) || '—', icon: '🏆' },
          ].map(stat => (
            <div key={stat.label} className="text-center p-2 rounded-xl" style={{ background: 'var(--color-background)' }}>
              <div className="text-lg">{stat.icon}</div>
              <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { href: `/dashboard/salons/${salon.id}/bookings`, icon: <Calendar className="w-4 h-4" />, label: 'رزروها' },
            { href: `/dashboard/salons/${salon.id}/services`, icon: <Scissors className="w-4 h-4" />, label: 'خدمات' },
            { href: `/dashboard/salons/${salon.id}/staff`, icon: <Users className="w-4 h-4" />, label: 'کارمندان' },
            { href: `/dashboard/salons/${salon.id}/settings`, icon: <Settings className="w-4 h-4" />, label: 'تنظیمات' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

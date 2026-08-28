'use client';

import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  Scissors,
  Settings,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { useMySalons } from '@/lib/api-hooks';

const TABS = [
  { key: 'overview', label: 'نمای کلی', icon: LayoutDashboard, href: '' },
  { key: 'bookings', label: 'رزروها', icon: Calendar, href: 'bookings' },
  { key: 'services', label: 'خدمات', icon: Scissors, href: 'services' },
  { key: 'staff', label: 'کارمندان', icon: Users, href: 'staff' },
  { key: 'settlements', label: 'تسویه کارکنان', icon: Wallet, href: 'settlements' },
  { key: 'reports', label: 'گزارش‌ها', icon: BarChart3, href: 'reports' },
  { key: 'settings', label: 'تنظیمات', icon: Settings, href: 'settings' },
];

const PLAN_CONFIG: Record<string, { label: string; color: string; next?: string }> = {
  FREE: { label: 'رایگان', color: 'var(--ui-gray-400)', next: 'STARTER' },
  STARTER: { label: 'استارتر', color: 'var(--brand-navy-400)', next: 'PROFESSIONAL' },
  PROFESSIONAL: { label: 'حرفه‌ای', color: 'var(--brand-plum-600)', next: 'ENTERPRISE' },
  ENTERPRISE: { label: 'اینترپرایز', color: 'var(--brand-gold-600)' },
};

interface DashboardLayoutProps {
  salonId: string;
  children: React.ReactNode;
  activeTab: string;
  salonName?: string;
  plan?: string;
}

export function DashboardLayout({
  salonId,
  children,
  activeTab,
  salonName,
  plan,
}: DashboardLayoutProps) {
  const { data: salons = [] } = useMySalons();
  const salon = salons.find((item: any) => item.id === salonId);
  const resolvedName = salonName ?? salon?.name ?? 'مدیریت سالن';
  const resolvedPlan = plan ?? salon?.plan ?? salon?.subscription?.tier ?? 'FREE';
  const planCfg = PLAN_CONFIG[resolvedPlan] ?? PLAN_CONFIG.FREE;
  const hrefFor = (href: string) => `/dashboard/salons/${salonId}${href ? `/${href}` : ''}`;

  return (
    <div data-typography="management" className="flex min-h-screen flex-col bg-[var(--bg-ivory)]">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--ui-gray-200)] bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-1 text-xs text-[var(--ui-gray-400)] sm:text-sm"
          >
            <ChevronRight size={16} /> داشبورد
          </Link>
          <span className="text-[var(--ui-gray-200)]">/</span>
          <span className="truncate text-xs font-semibold text-[var(--brand-navy-600)] sm:text-sm">
            {resolvedName}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className="rounded-full px-2.5 py-1 text-caption font-semibold sm:text-xs"
            style={{ background: `${planCfg.color}18`, color: planCfg.color }}
          >
            {planCfg.label}
          </span>
          <Link href="/" className="hidden text-xs text-[var(--ui-gray-400)] sm:block">
            بازگشت به سایت
          </Link>
        </div>
      </header>

      <div className="border-b border-[var(--ui-gray-200)] bg-white lg:hidden">
        <nav className="flex gap-1 overflow-x-auto px-3 py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={hrefFor(tab.href)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium ${isActive ? 'bg-[var(--brand-plum-50)] text-[var(--brand-plum-600)]' : 'text-[var(--brand-navy-500)]'}`}
              >
                <Icon size={15} /> {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-l border-[var(--ui-gray-200)] bg-white lg:flex">
          <nav className="flex-1 space-y-1 px-3 py-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={hrefFor(tab.href)}
                  className="flex items-center gap-3 rounded-xl border-r-[3px] px-3 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: isActive ? 'var(--brand-plum-50, #F5EBF4)' : 'transparent',
                    color: isActive ? 'var(--brand-plum-600)' : 'var(--brand-navy-600)',
                    borderRightColor: isActive ? 'var(--brand-plum-600)' : 'transparent',
                  }}
                >
                  <Icon size={17} strokeWidth={isActive ? 2 : 1.5} /> {tab.label}
                </Link>
              );
            })}
          </nav>

          {planCfg.next && (
            <div className="m-3 rounded-2xl bg-gradient-to-br from-[var(--brand-plum-50)] to-[var(--brand-gold-100)] p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Zap size={14} className="text-[var(--brand-gold-600)]" />
                <span className="text-xs font-semibold text-[var(--brand-plum-600)]">
                  ارتقا به {PLAN_CONFIG[planCfg.next]?.label}
                </span>
              </div>
              <p className="mb-3 text-xs text-[var(--brand-navy-400)]">
                امکانات بیشتر برای رشد سالن
              </p>
              <Link
                href="/dashboard/subscription"
                className="block rounded-xl bg-[var(--brand-plum-600)] py-2 text-center text-xs font-semibold text-white"
              >
                مشاهده پلن‌ها
              </Link>
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

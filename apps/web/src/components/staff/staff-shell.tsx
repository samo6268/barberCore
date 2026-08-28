'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  Clock3,
  LayoutDashboard,
  LogOut,
  WalletCards,
} from 'lucide-react';
import { useStaffMemberships } from '@/lib/api-hooks';

type Membership = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  status: string;
  salon: {
    id: string;
    name: string;
    logoUrl?: string | null;
    address?: string | null;
    genderType: string;
  };
};

type StaffPortalContextValue = {
  salonId: string;
  membership: Membership;
  memberships: Membership[];
  setSalonId: (salonId: string) => void;
};

const StaffPortalContext = createContext<StaffPortalContextValue | null>(null);

export function useStaffPortal() {
  const context = useContext(StaffPortalContext);
  if (!context) throw new Error('useStaffPortal must be used inside StaffShell');
  return context;
}

const NAV_ITEMS = [
  { href: '/staff', exact: true, label: 'امروز', icon: LayoutDashboard },
  { href: '/staff/calendar', label: 'تقویم', icon: CalendarDays },
  { href: '/staff/schedule', label: 'برنامه کاری', icon: Clock3 },
  { href: '/staff/settlements', label: 'تسویه‌ها', icon: WalletCards },
  { href: '/staff/notifications', label: 'اعلان‌ها', icon: Bell },
  { href: '/staff/profile', label: 'پروفایل', icon: CircleUserRound },
];

export function StaffShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: memberships = [], isLoading, isError } = useStaffMemberships();
  const [salonId, setSalonIdState] = useState('');

  useEffect(() => {
    if (!memberships.length) return;
    const saved = localStorage.getItem('staff_salon_id');
    const selected = memberships.find((item: Membership) => item.salon.id === saved);
    setSalonIdState(selected?.salon.id ?? memberships[0].salon.id);
  }, [memberships]);

  const setSalonId = (nextSalonId: string) => {
    if (!memberships.some((item: Membership) => item.salon.id === nextSalonId)) return;
    localStorage.setItem('staff_salon_id', nextSalonId);
    setSalonIdState(nextSalonId);
  };

  const membership = useMemo(
    () => memberships.find((item: Membership) => item.salon.id === salonId),
    [memberships, salonId],
  );

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('staff_salon_id');
    router.replace('/staff/login');
  };

  if (isLoading || (memberships.length > 0 && !membership)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-ivory)]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--brand-plum-200)] border-t-[var(--brand-plum-600)]" />
          <p className="mt-4 text-sm text-[var(--ui-gray-500)]">در حال آماده‌سازی برنامه کاری...</p>
        </div>
      </div>
    );
  }

  if (isError || !membership) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-ivory)] p-5">
        <div className="w-full max-w-md rounded-3xl border border-[var(--ui-gray-200)] bg-white p-8 text-center shadow-sm">
          <CircleUserRound className="mx-auto text-[var(--brand-plum-600)]" size={44} />
          <h1 className="mt-4 text-xl font-bold">دسترسی کارکنان یافت نشد</h1>
          <p className="mt-2 text-sm leading-7 text-[var(--ui-gray-500)]">
            شماره شما هنوز به‌عنوان عضو فعال هیچ سالنی ثبت نشده است. از مدیر سالن بخواهید همین شماره
            را به تیم اضافه کند.
          </p>
          <button
            onClick={logout}
            className="mt-6 w-full rounded-xl bg-[var(--brand-plum-600)] py-3 text-sm font-semibold text-white"
          >
            بازگشت به صفحه ورود
          </button>
        </div>
      </div>
    );
  }

  const value = { salonId, membership, memberships, setSalonId };

  return (
    <StaffPortalContext.Provider value={value}>
      <div data-typography="staff" className="min-h-screen bg-[var(--bg-ivory)] pb-20 lg:pb-0">
        <header className="sticky top-0 z-40 border-b border-[var(--ui-gray-200)] bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 lg:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--brand-plum-50)]">
                {membership.salon.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={membership.salon.logoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-[var(--brand-plum-600)]">پ</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--brand-navy-600)]">
                  {membership.salon.name}
                </p>
                <p className="truncate text-xs text-[var(--ui-gray-500)]">
                  {membership.displayName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {memberships.length > 1 && (
                <label className="relative hidden sm:block">
                  <select
                    value={salonId}
                    onChange={(event) => setSalonId(event.target.value)}
                    className="appearance-none rounded-xl border border-[var(--ui-gray-200)] bg-white py-2 pe-8 ps-3 text-xs text-[var(--brand-navy-600)]"
                    aria-label="انتخاب سالن"
                  >
                    {memberships.map((item: Membership) => (
                      <option key={item.id} value={item.salon.id}>
                        {item.salon.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-2 top-2.5" size={14} />
                </label>
              )}
              <button
                onClick={logout}
                className="rounded-xl border border-[var(--ui-gray-200)] p-2.5 text-[var(--ui-gray-500)]"
                aria-label="خروج"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1500px]">
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-l border-[var(--ui-gray-200)] bg-white p-4 lg:flex lg:flex-col">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                    style={{
                      color: active ? 'var(--brand-plum-600)' : 'var(--brand-navy-400)',
                      background: active ? 'var(--brand-plum-50)' : 'transparent',
                    }}
                  >
                    <Icon size={18} strokeWidth={active ? 2.3 : 1.7} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto rounded-2xl bg-[var(--brand-navy-600)] p-4 text-white">
              <p className="text-xs font-semibold text-[var(--brand-gold-300)]">
                پنل عملیات روزانه
              </p>
              <p className="mt-2 text-xs leading-6 text-white/60">
                فقط برنامه، مشتریان و اطلاعات مالی خودتان نمایش داده می‌شود.
              </p>
            </div>
          </aside>

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t border-[var(--ui-gray-200)] bg-white px-1 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-0 flex-col items-center gap-1 py-1 text-caption"
                style={{ color: active ? 'var(--brand-plum-600)' : 'var(--ui-gray-400)' }}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 1.7} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </StaffPortalContext.Provider>
  );
}

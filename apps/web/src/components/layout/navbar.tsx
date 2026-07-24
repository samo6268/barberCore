'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, Heart, Calendar, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { ScissorsIcon } from '@ui/icons/custom/scissors';
import { useMe, useLogout } from '@/lib/api-hooks';

export function Navbar() {
  const { data: user } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-[#fffdf9]/90 backdrop-blur-xl"
      >
        <div className="container-editorial h-20 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-semibold text-h3"
            style={{ color: '#795145' }}
          >
            <ScissorsIcon size={22} />
            پرنگارین
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center gap-8 text-body-sm font-medium"
            style={{ color: 'var(--color-text)' }}>
            <Link href="/salons" className="transition-colors hover:text-[#8b5e50]">آرایشگاه‌ها</Link>
            <Link href="/academy" className="transition-colors hover:text-[#8b5e50]">آکادمی</Link>
            <Link href="/salon-owner/login?returnTo=/dashboard/salons/new" className="transition-colors hover:text-[#8b5e50]">ثبت سالن</Link>
          </nav>

          {/* Right CTA — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/salons"
              className="p-2 rounded-lg transition-colors hover:bg-[var(--ui-gray-100)]"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="جستجو"
            >
              <Search size={20} strokeWidth={1.5} />
            </Link>

            {user ? (
              <>
                <Link href="/profile/bookings"
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--ui-gray-100)]"
                  style={{ color: 'var(--color-text-muted)' }} aria-label="رزروها">
                  <Calendar size={20} strokeWidth={1.5} />
                </Link>
                {(user.role === 'SALON_OWNER' || user.role === 'SUPER_ADMIN') && (
                  <Link href="/dashboard"
                    className="p-2 rounded-lg transition-colors hover:bg-[var(--ui-gray-100)]"
                    style={{ color: 'var(--color-text-muted)' }} aria-label="داشبورد">
                    <LayoutDashboard size={20} strokeWidth={1.5} />
                  </Link>
                )}
                <Link href="/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-body-sm font-medium border border-[var(--ui-gray-200)] hover:bg-[var(--ui-gray-100)] transition-colors"
                  style={{ color: 'var(--color-text)' }}>
                  <User size={16} strokeWidth={1.5} />
                  {user.firstName}
                </Link>
                <button
                  onClick={() => { logout.mutate(); router.push('/'); }}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--ui-gray-100)]"
                  style={{ color: 'var(--color-text-muted)' }}>
                  <LogOut size={20} strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <>
                <Link href="/role-selector"
                  className="px-5 py-2.5 text-body-sm font-medium rounded-md transition-all duration-250 hover:-translate-y-0.5"
                  style={{ color: 'var(--color-text)' }}>
                  ورود
                </Link>
                <Link href="/salons"
                  className="rounded-md bg-[#8b5e50] px-5 py-2.5 text-body-sm font-medium text-white transition-all duration-250 hover:-translate-y-0.5 hover:bg-[#6f473c]">
                  رزرو نوبت
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--color-text)' }}
            onClick={() => setMobileOpen(true)}
            aria-label="منو"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col px-8 py-10"
          style={{ background: '#30393d', color: 'var(--bg-ivory)' }}
        >
          <div className="flex justify-between items-center mb-12">
            <span className="font-display font-semibold text-h3" style={{ color: 'var(--bg-ivory)' }}>
              پرنگارین
            </span>
            <button onClick={() => setMobileOpen(false)} aria-label="بستن منو">
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            {[
              { href: '/salons',   label: 'آرایشگاه‌ها' },
              { href: '/academy',  label: 'آکادمی' },
              { href: '/salon-owner/login?returnTo=/dashboard/salons/new', label: 'ثبت سالن' },
              { href: '/role-selector', label: 'ورود / ثبت‌نام' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-display font-medium text-display-md border-b pb-4"
                style={{ color: 'var(--bg-ivory)', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-8 py-4 rounded-md font-medium text-body transition-all"
              style={{ background: '#ead3a6', color: '#302520' }}
            >
              رزرو نوبت
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

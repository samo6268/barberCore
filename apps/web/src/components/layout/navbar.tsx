'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, Calendar, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useMe, useLogout } from '@/lib/api-hooks';

export function Navbar() {
  const { data: user } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(29,23,21,0.9)] backdrop-blur-xl">
        <div className="container-editorial h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold text-h3"
            style={{ color: 'var(--brand-plum-500)' }}
            aria-label="پرنگارین — صفحه اصلی"
          >
            <Image
              src="/images/brand/parnegarin-ecosystem-loop.webp"
              alt=""
              width={38}
              height={38}
              priority
              className="h-[38px] w-[38px] object-contain"
            />
            پرنگارین
          </Link>

          {/* Center nav — desktop */}
          <nav
            className="hidden items-center gap-8 text-body-sm font-medium md:flex"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Link href="/salons" className="transition-colors hover:text-[var(--brand-plum-500)]">
              سالن‌ها
            </Link>
            <Link href="/#services" className="transition-colors hover:text-[var(--brand-plum-500)]">
              خدمات
            </Link>
            <Link href="/#how-it-works" className="transition-colors hover:text-[var(--brand-plum-500)]">
              راهنمای رزرو
            </Link>
            <Link
              href="/salon-owner/login?returnTo=/dashboard/salons/new"
              className="transition-colors hover:text-[var(--brand-plum-500)]"
            >
              ثبت سالن
            </Link>
          </nav>

          {/* Right CTA — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/salons"
              className="rounded-xl p-2 transition-colors hover:bg-[var(--ui-gray-100)]"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="جستجو"
            >
              <Search size={20} strokeWidth={1.5} />
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile/bookings"
                  className="rounded-xl p-2 transition-colors hover:bg-[var(--ui-gray-100)]"
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-label="رزروها"
                >
                  <Calendar size={20} strokeWidth={1.5} />
                </Link>
                {(user.role === 'SALON_OWNER' || user.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/dashboard"
                    className="rounded-xl p-2 transition-colors hover:bg-[var(--ui-gray-100)]"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-label="داشبورد"
                  >
                    <LayoutDashboard size={20} strokeWidth={1.5} />
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2 text-body-sm font-medium transition-colors hover:bg-[var(--ui-gray-100)]"
                  style={{ color: 'var(--color-text)' }}
                >
                  <User size={16} strokeWidth={1.5} />
                  {user.firstName}
                </Link>
                <button
                  onClick={() => {
                    logout.mutate();
                    router.push('/');
                  }}
                  className="rounded-xl p-2 transition-colors hover:bg-[var(--ui-gray-100)]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <LogOut size={20} strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/role-selector"
                  className="rounded-xl px-5 py-2.5 text-body-sm font-medium transition-colors hover:text-[var(--brand-plum-500)]"
                  style={{ color: 'var(--color-text)' }}
                >
                  ورود
                </Link>
                <Link
                  href="/salons"
                  className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-body-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                >
                  رزرو نوبت
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            className="p-2 md:hidden"
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
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 font-semibold text-h3"
              style={{ color: 'var(--bg-ivory)' }}
            >
              <Image
                src="/images/brand/parnegarin-ecosystem-loop.webp"
                alt=""
                width={38}
                height={38}
                className="h-[38px] w-[38px] object-contain"
              />
              پرنگارین
            </Link>
            <button onClick={() => setMobileOpen(false)} aria-label="بستن منو">
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            {[
              { href: '/salons', label: 'سالن‌ها' },
              { href: '/#services', label: 'خدمات' },
              { href: '/#how-it-works', label: 'راهنمای رزرو' },
              { href: '/salon-owner/login?returnTo=/dashboard/salons/new', label: 'ثبت سالن' },
              { href: '/role-selector', label: 'ورود / ثبت‌نام' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="type-h2 border-b pb-4 font-medium"
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
              className="block w-full px-8 py-4 text-center font-medium text-body transition-colors"
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

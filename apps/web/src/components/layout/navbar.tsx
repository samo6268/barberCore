'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LogOut, Menu, X } from '@barbercore/ui/icons';
import { useMe, useLogout } from '@/lib/api-hooks';

export function Navbar() {
  const { data: user } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 32);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(29,23,21,0.9)] backdrop-blur-xl" style={isHome && !scrolled ? { background: 'linear-gradient(180deg, rgba(20,15,12,.65), rgba(20,15,12,.12))', borderColor: 'transparent', backdropFilter: 'none' } : undefined}>
        <div className={`${isHome ? '' : 'container-editorial'} flex h-20 items-center justify-between gap-5`} style={isHome ? { width: '100%', paddingInline: 'clamp(20px, 4.2vw, 96px)' } : undefined}>
          {/* Logo */}
          <Link
            href="/"
            className="font-semibold text-h3 text-[#d9794d]"
            aria-label="پرنگارین — صفحه اصلی"
            style={isHome ? { fontSize: 'clamp(24px, 2.1vw, 34px)', lineHeight: 1.4 } : undefined}
          >
            پرنگارین
          </Link>

          {/* Center nav — desktop */}
          <nav
            className="hidden items-center gap-6 text-body-sm font-medium lg:flex"
            style={{ color: isHome ? '#efdfd3' : 'var(--color-text-muted)' }}
          >
            <Link href="/" className="transition-colors hover:text-[#d9794d]">
              صفحه اصلی
            </Link>
            <Link href="/salons" className="transition-colors hover:text-[#d9794d]">
              سالن‌ها
            </Link>
            <Link href="/#services" className="transition-colors hover:text-[#d9794d]">
              خدمات
            </Link>
            <Link href="/blog" className="transition-colors hover:text-[#d9794d]">
              مجله زیبایی و سلامت
            </Link>
            <Link
              href="/academy"
              className="transition-colors hover:text-[#d9794d]"
            >
              برای متخصصان
            </Link>
          </nav>

          {/* Right CTA — desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile/bookings" className="text-body-sm text-[#fff0e4]">نوبت‌های من</Link>
                {(user.role === 'SALON_OWNER' || user.role === 'SUPER_ADMIN') && <Link href="/dashboard" className="text-body-sm text-[#fff0e4]">مدیریت سالن</Link>}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full border border-[#d9a57f]/40 px-5 py-2.5 text-body-sm font-medium transition-colors hover:bg-[#3a2721]"
                  style={{ color: 'var(--color-text)' }}
                >
                  <User size={16} />
                  {user.firstName}
                </Link>
                <button
                  onClick={() => {
                    logout.mutate();
                    router.push('/');
                  }}
                  className="rounded-xl p-2 transition-colors hover:bg-[var(--ui-gray-100)]"
                  aria-label="خروج از حساب"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/role-selector"
                  className="flex items-center gap-2 rounded-full border border-[#d9a57f]/45 px-5 py-2.5 text-body-sm font-medium text-[#fff7ef] transition-colors hover:bg-[#3a2721]"
                >
                  <User size={16} /> ورود / ثبت‌نام
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            className="p-2 lg:hidden"
            style={{ color: 'var(--color-text)' }}
            onClick={() => setMobileOpen(true)}
            aria-label="منو"
          >
            <Menu size={24} />
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
            <Link href="/" onClick={() => setMobileOpen(false)} className="font-semibold text-h3 text-[#d9794d]">پرنگارین</Link>
            <button onClick={() => setMobileOpen(false)} aria-label="بستن منو">
              <X size={28} />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            {[
              { href: '/', label: 'صفحه اصلی' },
              { href: '/salons', label: 'سالن‌ها' },
              { href: '/#services', label: 'خدمات' },
              { href: '/blog', label: 'مجله زیبایی و سلامت' },
              { href: '/academy', label: 'برای متخصصان' },
              ...(user ? [
                { href: '/profile', label: 'حساب کاربری' },
                { href: '/profile/bookings', label: 'نوبت‌های من' },
                ...(user.role === 'SALON_OWNER' || user.role === 'SUPER_ADMIN' ? [{ href: '/dashboard', label: 'مدیریت سالن' }] : []),
              ] : [{ href: '/role-selector', label: 'ورود / ثبت‌نام' }]),
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

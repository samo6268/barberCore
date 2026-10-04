'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Menu, X } from 'lucide-react';
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
        <div className="container-editorial flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-semibold text-h3 text-[#d9794d]"
            aria-label="پرنگارین — صفحه اصلی"
          >
            پرنگارین
          </Link>

          {/* Center nav — desktop */}
          <nav
            className="hidden items-center gap-8 text-body-sm font-medium md:flex"
            style={{ color: 'var(--color-text-muted)' }}
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
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full border border-[#d9a57f]/40 px-5 py-2.5 text-body-sm font-medium transition-colors hover:bg-[#3a2721]"
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
                  className="flex items-center gap-2 rounded-full border border-[#d9a57f]/45 px-5 py-2.5 text-body-sm font-medium text-[#fff7ef] transition-colors hover:bg-[#3a2721]"
                >
                  <User size={16} strokeWidth={1.5} /> ورود / ثبت‌نام
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
            <Link href="/" onClick={() => setMobileOpen(false)} className="font-semibold text-h3 text-[#d9794d]">پرنگارین</Link>
            <button onClick={() => setMobileOpen(false)} aria-label="بستن منو">
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            {[
              { href: '/', label: 'صفحه اصلی' },
              { href: '/salons', label: 'سالن‌ها' },
              { href: '/#services', label: 'خدمات' },
              { href: '/blog', label: 'مجله زیبایی و سلامت' },
              { href: '/academy', label: 'برای متخصصان' },
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

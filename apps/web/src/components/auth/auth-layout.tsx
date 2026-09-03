'use client';

import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  eyebrow?: string;
  children: React.ReactNode;
}

export function AuthLayout({
  heroImage,
  heroTitle,
  heroSubtitle,
  eyebrow = 'BARBERCORE',
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-ivory)' }}>
      {/* Left — editorial hero panel */}
      <div
        className="hidden lg:flex flex-col w-[45%] relative overflow-hidden"
        style={{ background: 'var(--brand-plum-900)' }}
      >
        {/* Background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, var(--brand-plum-900) 30%, rgba(75,36,74,0.4) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-auto">
            <Image
              src="/images/brand/parnegarin-ecosystem-loop.webp"
              alt=""
              width={38}
              height={38}
              className="h-[38px] w-[38px] object-contain"
            />
            <span className="font-semibold text-xl" style={{ color: 'var(--brand-gold-400)' }}>
              پرنگارین
            </span>
          </Link>

          {/* Headline */}
          <div className="mb-14">
            <p
              className="text-caption uppercase tracking-[0.3em] mb-4"
              style={{ color: 'var(--brand-gold-400)' }}
            >
              {eyebrow}
            </p>
            <h2
              className="font-semibold leading-tight mb-4"
              style={{ fontSize: 'var(--type-display-lg-size)', color: 'white' }}
            >
              {heroTitle}
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {heroSubtitle}
            </p>
          </div>

          {/* Decorative divider */}
          <div className="w-12 h-px mb-4" style={{ background: 'var(--brand-gold-600)' }} />
          <p className="text-caption" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © ۱۴۰۳ پرنگارین — تمام حقوق محفوظ
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <Image
            src="/images/brand/parnegarin-ecosystem-loop.webp"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="font-semibold text-lg" style={{ color: 'var(--brand-plum-600)' }}>
            پرنگارین
          </span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

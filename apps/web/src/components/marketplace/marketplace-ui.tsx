'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarClock, Check, Gift, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function TrustStrip() {
  const items = [
    { icon: ShieldCheck, title: 'سالن‌های قابل‌اعتماد', text: 'اطلاعات و خدمات شفاف' },
    { icon: CalendarClock, title: 'زمان خالی واقعی', text: 'قبل از رزرو ببین' },
    { icon: Check, title: 'رزرو بدون تماس', text: 'ساده و قابل پیگیری' },
  ];

  return (
    <section aria-label="مزیت‌های پرنگارین" className="border-b border-[#e8e1db] bg-white">
      <div className="container-editorial grid gap-0 sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-[#eee8e2]">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 border-b border-[#eee8e2] px-1 py-4 last:border-b-0 sm:justify-center sm:border-b-0 sm:py-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4ece7] text-[#805146]">
              <Icon size={17} strokeWidth={1.8} />
            </span>
            <span>
              <strong className="block type-label text-[#332c2f]">{title}</strong>
              <span className="mt-0.5 block type-caption text-[#817a7c]">{text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MobileBookingBar({ label = 'پیدا کردن نوبت', href = '/salons' }: { label?: string; href?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ded6cf] bg-white/95 p-3 shadow-[0_-10px_30px_rgba(44,34,37,0.12)] backdrop-blur md:hidden">
      <Link
        href={href}
        onClick={() => trackEvent('hero_search_submitted', { source: 'mobile_sticky_cta' })}
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#805146] px-5 type-button text-white"
      >
        <Sparkles size={16} /> {label} <ArrowLeft size={16} />
      </Link>
    </div>
  );
}

export function AvailabilityPill({ label = 'مشاهده زمان‌های خالی' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7f0] px-2.5 py-1 type-caption text-[#267044]">
      <CalendarClock size={13} /> {label}
    </span>
  );
}

export function PersonalisedHint({ city }: { city?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#eadfd6] bg-[#fffaf5] p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2e5dc] text-[#805146]">
        <MapPin size={17} />
      </span>
      <div>
        <p className="type-label text-[#332c2f]">پیشنهاد نزدیک به تو</p>
        <p className="mt-1 type-caption text-[#817a7c]">
          {city ? `سالن‌های منتخب ${city} را بر اساس امتیاز و زمان خالی ببین.` : 'شهر را انتخاب کن تا پیشنهادهای نزدیک‌تر را ببینی.'}
        </p>
      </div>
    </div>
  );
}

export function ReferralCard() {
  const code = 'PARNEGARIN';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      trackEvent('referral_copied');
    } catch {
      // Clipboard is optional; the UI remains usable without it.
    }
  };

  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-[#eadfd6] bg-[#30393d] p-6 text-white sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ead3a6] text-[#4b352c]">
          <Gift size={21} />
        </span>
        <div>
          <p className="type-label text-[#ead3a6]">باشگاه پرنگارین</p>
          <h2 className="mt-1 type-h3 text-white">دوستت را دعوت کن، امتیاز بگیر</h2>
          <p className="mt-2 type-body-sm text-white/65">کد دعوتت را برای دوستت بفرست؛ مزایای باشگاه به‌زودی فعال می‌شود.</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3">
        <span className="flex-1 font-mono text-label tracking-[0.18em] text-[#f5e6c9]" dir="ltr">{code}</span>
        <button type="button" onClick={copy} className="rounded-lg bg-[#ead3a6] px-3 py-2 type-caption text-[#3d2b25]">کپی کد</button>
      </div>
    </section>
  );
}

export function CommunityProof() {
  return (
    <div className="flex items-center gap-3 type-caption text-[#817a7c]">
      <span className="flex -space-x-2 space-x-reverse">
        {[1, 2, 3].map((item) => (
          <span key={item} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#e3c9bc] text-[10px] text-[#6e4d43]">
            <Users size={12} />
          </span>
        ))}
      </span>
      <span>انتخابی که با تجربه واقعی مشتری‌ها کامل‌تر می‌شود</span>
    </div>
  );
}

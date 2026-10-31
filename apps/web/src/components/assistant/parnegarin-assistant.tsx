'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { type AssistantManifest } from '@adaptive-assistant/core';
import { AssistantProvider, MimoAssistant } from '@adaptive-assistant/react';
import { useAuthStore } from '@/store/auth.store';
import { createParnegarinAssistantTransport } from './assistant-transport';

const manifest: AssistantManifest = {
  assistantId: 'parnegarin',
  businessId: 'parnegarin',
  name: 'همراه پرنگارین',
  characterName: 'میمو',
  description: 'صفحه‌ای را که در آن هستید می‌شناسم و قدم‌به‌قدم همراهتان هستم.',
  locale: 'fa-IR',
  direction: 'rtl',
  greeting: 'سلام، من میمو هستم 👋',
  inputPlaceholder: 'از میمو بپرسید…',
  disclosure:
    'پاسخ با هوش مصنوعی تولید می‌شود؛ پیام و داده لازم به ارائه‌دهنده مدل ارسال می‌شود. رزرو و پرداخت خودکار فعال نیست.',
  vocabulary: { provider: 'سالن یا مرکز خدمات', operator: 'متخصص', order: 'نوبت' },
  suggestions: [
    {
      id: 'home-find',
      label: 'پیداکردن خدمت مناسب',
      prompt: 'برای انتخاب خدمت مناسب راهنمایی‌ام کن',
      icon: '✦',
      routes: ['/'],
    },
    {
      id: 'home-area',
      label: 'جست‌وجو در شهر و محدوده من',
      prompt: 'چطور سالن‌های محدوده خودم را پیدا کنم؟',
      icon: '⌖',
      routes: ['/'],
    },
    {
      id: 'salons-available',
      label: 'نمایش وقت‌های نزدیک',
      prompt: 'سالن‌هایی را پیشنهاد بده که زودتر وقت خالی دارند',
      icon: '◷',
      routes: ['/salons'],
    },
    {
      id: 'salons-compare',
      label: 'مقایسه گزینه‌ها',
      prompt: 'برای مقایسه سالن‌ها از نظر امتیاز، قیمت و فاصله کمکم کن',
      icon: '⇄',
      routes: ['/salons'],
    },
    {
      id: 'booking-review',
      label: 'مرور انتخاب‌های رزرو',
      prompt: 'انتخاب‌های این رزرو را برایم خلاصه کن',
      icon: '✓',
      routes: ['/salons/'],
    },
    {
      id: 'profile-bookings',
      label: 'وضعیت نوبت‌های من',
      prompt: 'وضعیت نوبت‌های من را توضیح بده',
      icon: '◷',
      routes: ['/profile'],
    },
    {
      id: 'owner-today',
      label: 'خلاصه وضعیت امروز',
      prompt: 'وضعیت امروز سالن را برایم خلاصه کن',
      icon: '▦',
      routes: ['/dashboard'],
      roles: ['SALON_OWNER'],
    },
    {
      id: 'owner-empty-slots',
      label: 'بازه‌های خالی قابل فروش',
      prompt: 'بازه‌های خالی برنامه را بررسی کن',
      icon: '◫',
      routes: ['/dashboard'],
      roles: ['SALON_OWNER'],
    },
    {
      id: 'staff-next',
      label: 'نوبت بعدی من',
      prompt: 'نوبت بعدی من را توضیح بده',
      icon: '→',
      routes: ['/staff'],
      roles: ['STAFF'],
    },
    {
      id: 'staff-day',
      label: 'برنامه امروز',
      prompt: 'برنامه امروز من را خلاصه کن',
      icon: '▤',
      routes: ['/staff'],
      roles: ['STAFF'],
    },
    {
      id: 'page-help',
      label: 'راهنمای این صفحه',
      prompt: 'در این صفحه چه کارهایی می‌توانم انجام بدهم؟',
      icon: '?',
    },
  ],
};

export function ParnegarinAssistant() {
  const pathname = usePathname() || '/';
  const user = useAuthStore((state) => state.user);
  const transport = useMemo(createParnegarinAssistantTransport, []);
  const context = useMemo(
    () => ({
      route: pathname,
      section: sectionFor(pathname),
      entityType: pathname.includes('/salons/') ? 'salon' : undefined,
      entityId: pathname.match(/\/salons\/([^/]+)/)?.[1],
    }),
    [pathname],
  );
  const identity = useMemo(
    () =>
      user
        ? {
            id: user.id,
            displayName: [user.firstName, user.lastName].filter(Boolean).join(' '),
            role: user.role,
            locale: 'fa-IR',
          }
        : undefined,
    [user],
  );

  return (
    <AssistantProvider
      key={`${user?.id || 'guest'}:${user?.role || 'guest'}`}
      manifest={manifest}
      transport={transport}
      context={context}
      identity={identity}
      theme="inherit"
    >
      <MimoAssistant position="start" />
    </AssistantProvider>
  );
}

function sectionFor(pathname: string) {
  if (pathname.startsWith('/dashboard')) return 'salon-management';
  if (pathname.startsWith('/staff')) return 'staff-operations';
  if (pathname.startsWith('/academy')) return 'academy';
  if (pathname.startsWith('/profile')) return 'customer-profile';
  return 'marketplace';
}

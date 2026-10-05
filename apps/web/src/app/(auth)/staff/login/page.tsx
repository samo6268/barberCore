'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LockKeyhole, Phone, UserRoundCheck } from '@barbercore/ui/icons';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/auth-layout';
import { useSendOtp, useVerifyOtp } from '@/lib/api-hooks';
import { api } from '@/lib/api';
import { HERO_IMAGES } from '@/lib/images';

export default function StaffLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const handleSend = async () => {
    const normalized = phone.replace(/\s/g, '');
    if (!/^09\d{9}$/.test(normalized)) return toast.error('شماره موبایل معتبر وارد کنید');
    try {
      await sendOtp.mutateAsync(normalized);
      setPhone(normalized);
      setStep('code');
      toast.success('کد ورود ارسال شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'ارسال کد ورود انجام نشد');
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) return toast.error('کد ۶ رقمی را کامل وارد کنید');
    try {
      await verifyOtp.mutateAsync({ phone, code });
      const memberships = await api
        .get('/staff-portal/memberships')
        .then((response) => response.data.data);
      if (!memberships.length) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return toast.error('این شماره هنوز توسط هیچ سالنی به‌عنوان کارمند فعال ثبت نشده است');
      }
      localStorage.setItem('staff_salon_id', memberships[0].salon.id);
      toast.success(`خوش آمدید ${memberships[0].displayName}`);
      router.replace('/staff');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'کد واردشده معتبر نیست');
    }
  };

  return (
    <AuthLayout
      heroImage={HERO_IMAGES[1]}
      eyebrow="STAFF WORKSPACE"
      heroTitle={'روز کاری،\nشفاف و منظم'}
      heroSubtitle="نوبت‌ها، برنامه کاری و تسویه‌های خود را در یک فضای اختصاصی مدیریت کنید."
    >
      <div className="mb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-gold-100)] text-[var(--brand-gold-900)]">
          <UserRoundCheck size={22} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--brand-navy-600)]">ورود کارکنان سالن</h1>
        <p className="mt-1 text-sm text-[var(--ui-gray-500)]">
          با همان شماره‌ای وارد شوید که مدیر سالن ثبت کرده است.
        </p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--brand-navy-600)]">
              شماره موبایل
            </span>
            <div className="flex items-center gap-3 rounded-xl border-2 border-[var(--ui-gray-200)] bg-white px-4 py-3 focus-within:border-[var(--brand-plum-600)]">
              <Phone size={17} className="text-[var(--ui-gray-400)]" />
              <input
                type="tel"
                dir="ltr"
                inputMode="numeric"
                autoComplete="tel"
                autoFocus
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSend()}
                placeholder="09123456789"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </label>
          <button
            onClick={handleSend}
            disabled={sendOtp.isPending}
            className="w-full rounded-xl bg-[var(--brand-plum-600)] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sendOtp.isPending ? 'در حال ارسال...' : 'دریافت کد ورود'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-[var(--bg-ivory)] px-4 py-3 text-center text-sm text-[var(--ui-gray-500)]">
            کد ارسال‌شده به{' '}
            <span dir="ltr" className="font-semibold text-[var(--brand-navy-600)]">
              {phone}
            </span>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--brand-navy-600)]">
              کد تأیید
            </span>
            <div className="flex items-center gap-3 rounded-xl border-2 border-[var(--ui-gray-200)] bg-white px-4 py-3 focus-within:border-[var(--brand-plum-600)]">
              <LockKeyhole size={17} className="text-[var(--ui-gray-400)]" />
              <input
                type="text"
                dir="ltr"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                onKeyDown={(event) => event.key === 'Enter' && handleVerify()}
                className="min-w-0 flex-1 bg-transparent text-center text-xl tracking-[.35em] outline-none"
              />
            </div>
          </label>
          <button
            onClick={handleVerify}
            disabled={verifyOtp.isPending}
            className="w-full rounded-xl bg-[var(--brand-plum-600)] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {verifyOtp.isPending ? 'در حال بررسی...' : 'ورود به برنامه کاری'}
          </button>
          <button
            onClick={() => {
              setStep('phone');
              setCode('');
            }}
            className="flex w-full items-center justify-center gap-1 py-2 text-sm text-[var(--ui-gray-500)]"
          >
            <ArrowRight size={15} /> تغییر شماره
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--ui-gray-400)]">
        مدیر سالن هستید؟{' '}
        <Link href="/salon-owner/login" className="text-[var(--brand-plum-600)]">
          ورود مدیر سالن
        </Link>
      </p>
    </AuthLayout>
  );
}

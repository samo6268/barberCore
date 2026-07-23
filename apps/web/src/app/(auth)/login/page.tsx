'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSendOtp, useVerifyOtp } from '@/lib/api-hooks';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { HERO_IMAGES } from '@/lib/images';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [returnTo, setReturnTo] = useState('/');

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  useEffect(() => {
    const requestedPath = new URLSearchParams(window.location.search).get('returnTo');
    if (requestedPath?.startsWith('/') && !requestedPath.startsWith('//')) {
      setReturnTo(requestedPath);
    }
  }, []);

  const handleSend = async () => {
    if (!phone || phone.length < 10) return toast.error('شماره موبایل را وارد کنید');
    try {
      await sendOtp.mutateAsync(phone);
      toast.success('کد تأیید ارسال شد');
      setStep('code');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'ارسال کد تأیید انجام نشد');
    }
  };

  const handleVerify = async () => {
    if (!code) return toast.error('کد را وارد کنید');
    try {
      await verifyOtp.mutateAsync({ phone, code });
      toast.success('خوش آمدید!');
      router.replace(returnTo);
    } catch {
      toast.error('کد نادرست است');
    }
  };

  const demoLogin = async () => {
    try {
      await verifyOtp.mutateAsync({ phone: '09100000001', code: '123456', demo: true });
      toast.success('ورود نمونه موفق');
      router.replace(returnTo);
    } catch {
      toast.error('خطا');
    }
  };

  return (
    <AuthLayout
      heroImage={HERO_IMAGES[0]}
      eyebrow="CUSTOMER LOGIN"
      heroTitle="تجربه‌ای که
شایسته‌اش هستید"
      heroSubtitle="رزرو آنلاین بهترین سالن‌های ایران — در چند ثانیه، بدون تماس تلفنی."
    >
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}
        >
          ورود مشتری
        </h1>
        <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>
          با شماره موبایل وارد شوید
        </p>
        <p className="text-xs mt-2">
          <Link href="/role-selector" style={{ color: 'var(--brand-plum-600)' }}>
            نقش دیگری دارید؟
          </Link>
        </p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--brand-navy-600)' }}
            >
              شماره موبایل
            </label>
            <div
              className="flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-colors focus-within:border-[var(--brand-plum-600)]"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'white' }}
            >
              <Phone size={16} style={{ color: 'var(--ui-gray-400)' }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="09123456789"
                className="flex-1 outline-none bg-transparent text-sm"
                style={{ color: 'var(--brand-navy-600)' }}
                dir="ltr"
                autoFocus
              />
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={sendOtp.isPending}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'var(--brand-plum-600)' }}
          >
            {sendOtp.isPending ? 'در حال ارسال...' : 'دریافت کد تأیید'}
          </button>

          <div className="relative flex items-center gap-3 my-2">
            <div className="flex-1 h-px" style={{ background: 'var(--ui-gray-200)' }} />
            <span className="text-xs" style={{ color: 'var(--ui-gray-400)' }}>
              یا
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--ui-gray-200)' }} />
          </div>

          <button
            onClick={demoLogin}
            disabled={verifyOtp.isPending}
            className="w-full py-3 rounded-xl text-sm font-medium border-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              borderColor: 'var(--ui-gray-200)',
              color: 'var(--brand-navy-600)',
              background: 'white',
            }}
          >
            ورود نمونه (بدون API)
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p
            className="text-sm text-center py-3 rounded-xl"
            style={{ color: 'var(--ui-gray-500)', background: 'var(--bg-ivory)' }}
          >
            کد ۶ رقمی برای{' '}
            <span className="font-medium" dir="ltr" style={{ color: 'var(--brand-navy-600)' }}>
              {phone}
            </span>{' '}
            ارسال شد
          </p>

          <div>
            <div
              className="flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-colors focus-within:border-[var(--brand-plum-600)]"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'white' }}
            >
              <Lock size={16} style={{ color: 'var(--ui-gray-400)' }} />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="● ● ● ● ● ●"
                maxLength={6}
                className="flex-1 outline-none bg-transparent text-center text-2xl tracking-[0.5em]"
                style={{ color: 'var(--brand-navy-600)' }}
                dir="ltr"
                autoFocus
              />
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={verifyOtp.isPending}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'var(--brand-plum-600)' }}
          >
            {verifyOtp.isPending ? 'در حال بررسی...' : 'ورود'}
          </button>

          <button
            onClick={() => setStep('phone')}
            className="w-full text-sm text-center py-2 flex items-center justify-center gap-1"
            style={{ color: 'var(--ui-gray-400)' }}
          >
            <ArrowLeft size={14} /> تغییر شماره
          </button>
        </div>
      )}

      <p className="text-center text-xs mt-8" style={{ color: 'var(--ui-gray-400)' }}>
        ورود نشانه‌ی قبول{' '}
        <Link href="/terms" style={{ color: 'var(--brand-plum-600)' }}>
          قوانین پرنگارین
        </Link>{' '}
        است
      </p>
    </AuthLayout>
  );
}

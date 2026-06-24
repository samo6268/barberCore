'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Phone, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useSendOtp, useVerifyOtp } from '@/lib/api-hooks';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const handleSend = async () => {
    if (!phone) return toast.error('شماره موبایل را وارد کنید');
    try {
      await sendOtp.mutateAsync(phone);
      toast.success('کد تأیید ارسال شد');
      setStep('code');
    } catch { toast.error('ارسال کد با خطا مواجه شد'); }
  };

  const handleVerify = async () => {
    if (!code) return toast.error('کد را وارد کنید');
    try {
      await verifyOtp.mutateAsync({ phone, code });
      toast.success('ورود موفق');
      router.push('/');
    } catch { toast.error('کد نادرست است'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
              <Scissors className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>پرنگارین</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>ورود یا ثبت‌نام</p>
        </div>

        <div className="rounded-2xl p-6 border space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {step === 'phone' ? (
            <>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>شماره موبایل</label>
              <div className="flex items-center gap-2 border rounded-xl px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
                <Phone className="w-4 h-4" style={{ color: 'var(--color-muted)' }} />
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="+989123456789"
                  className="flex-1 outline-none bg-transparent text-sm"
                  style={{ color: 'var(--color-text)' }}
                  dir="ltr"
                />
              </div>
              <button onClick={handleSend} disabled={sendOtp.isPending}
                className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--color-primary)' }}>
                {sendOtp.isPending ? 'در حال ارسال...' : 'دریافت کد تأیید'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>
                کد ۶ رقمی برای <span className="font-medium" dir="ltr">{phone}</span> ارسال شد
              </p>
              <div className="flex items-center gap-2 border rounded-xl px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
                <Lock className="w-4 h-4" style={{ color: 'var(--color-muted)' }} />
                <input
                  type="text" value={code} onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  placeholder="۱۲۳۴۵۶"
                  maxLength={6}
                  className="flex-1 outline-none bg-transparent text-center text-xl tracking-widest"
                  style={{ color: 'var(--color-text)' }}
                  dir="ltr"
                />
              </div>
              <button onClick={handleVerify} disabled={verifyOtp.isPending}
                className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--color-primary)' }}>
                {verifyOtp.isPending ? 'در حال بررسی...' : 'ورود'}
              </button>
              <button onClick={() => setStep('phone')} className="w-full text-sm text-center" style={{ color: 'var(--color-muted)' }}>
                تغییر شماره
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-muted)' }}>
          در محیط توسعه: کد همیشه <strong>123456</strong> است
        </p>
      </div>
    </div>
  );
}

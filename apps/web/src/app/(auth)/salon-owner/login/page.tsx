'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SALON_IMAGES } from '@/lib/images';
import { useLoginWithEmail } from '@/lib/api-hooks';

export default function SalonOwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [returnTo, setReturnTo] = useState('/dashboard');
  const login = useLoginWithEmail();

  useEffect(() => {
    const requestedPath = new URLSearchParams(window.location.search).get('returnTo');
    if (requestedPath?.startsWith('/') && !requestedPath.startsWith('//')) {
      setReturnTo(requestedPath);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('ایمیل و رمز عبور را وارد کنید');
    try {
      await login.mutateAsync({ email, password });
      toast.success('خوش آمدید، سالن‌دار عزیز!');
      router.replace(returnTo);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'ایمیل یا رمز عبور اشتباه است');
    }
  };

  const demoLogin = async () => {
    try {
      await login.mutateAsync({
        email: 'owner@parnegarin.ir',
        password: 'Owner@1234',
      });
      toast.success('ورود آزمایشی با موفقیت انجام شد');
      router.replace(returnTo);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'ابتدا داده‌های آزمایشی را Seed کنید');
    }
  };

  return (
    <AuthLayout
      heroImage={SALON_IMAGES[0]}
      eyebrow="SALON OWNER LOGIN"
      heroTitle="سالن خود را
رشد دهید"
      heroSubtitle="داشبورد کامل مدیریت سالن — رزروها، کارمندان، آمار درآمد و بوست تبلیغاتی."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
          ورود سالن‌دار
        </h1>
        <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>
          با ایمیل و رمز عبور خود وارد شوید
        </p>
        <p className="text-xs mt-2">
          <Link href="/role-selector" style={{ color: 'var(--brand-plum-600)' }}>نقش دیگری دارید؟</Link>
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-navy-600)' }}>
            ایمیل
          </label>
          <div className="flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-colors focus-within:border-[var(--brand-navy-600)]"
            style={{ borderColor: 'var(--ui-gray-200)', background: 'white' }}>
            <Mail size={16} style={{ color: 'var(--ui-gray-400)' }} />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="salon@example.com"
              className="flex-1 outline-none bg-transparent text-sm"
              style={{ color: 'var(--brand-navy-600)' }}
              dir="ltr"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-navy-600)' }}>
            رمز عبور
          </label>
          <div className="flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-colors focus-within:border-[var(--brand-navy-600)]"
            style={{ borderColor: 'var(--ui-gray-200)', background: 'white' }}>
            <Lock size={16} style={{ color: 'var(--ui-gray-400)' }} />
            <input
              type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex-1 outline-none bg-transparent text-sm"
              style={{ color: 'var(--brand-navy-600)' }}
              dir="ltr"
            />
            <button type="button" onClick={() => setShowPw(p => !p)}>
              {showPw
                ? <EyeOff size={16} style={{ color: 'var(--ui-gray-400)' }} />
                : <Eye size={16} style={{ color: 'var(--ui-gray-400)' }} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={login.isPending}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 mt-2"
          style={{ background: 'var(--brand-navy-600)' }}>
          {login.isPending ? 'در حال ورود...' : 'ورود به داشبورد'}
        </button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--ui-gray-200)' }} />
          <span className="text-xs" style={{ color: 'var(--ui-gray-400)' }}>یا</span>
          <div className="flex-1 h-px" style={{ background: 'var(--ui-gray-200)' }} />
        </div>

        <button type="button" onClick={demoLogin} disabled={login.isPending}
          className="w-full py-3 rounded-xl text-sm font-medium border-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)', background: 'white' }}>
          ورود آزمایشی با API
        </button>
      </form>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--ui-gray-400)' }}>
        سالن ندارید؟{' '}
        <Link href="/dashboard/salons/new" style={{ color: 'var(--brand-navy-600)' }}>همین الان ثبت کنید</Link>
      </p>
    </AuthLayout>
  );
}

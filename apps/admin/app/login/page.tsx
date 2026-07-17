'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFa, setTwoFa] = useState('');
  const [step, setStep] = useState<'creds' | '2fa'>('creds');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    // In production: verify credentials, then show 2FA
    setStep('2fa');
  };

  const handle2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    router.push('/dashboard');
  };

  const demoLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--brand-navy-900)' }}>

      {/* Background grid pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.5) 40px,rgba(255,255,255,.5) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.5) 40px,rgba(255,255,255,.5) 41px)',
        }} />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--brand-gold-600)' }}>
            <ShieldCheck size={28} style={{ color: 'var(--brand-navy-900)' }} />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
            پرنگارین ادمین
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--brand-navy-300)' }}>
            پنل مدیریت سامانه
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{ background: 'var(--brand-navy-800)', border: '1px solid var(--brand-navy-700)' }}>

          {step === 'creds' ? (
            <>
              <h2 className="text-base font-semibold text-white mb-6">ورود مدیر سامانه</h2>
              <form onSubmit={handleCreds} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--brand-navy-300)' }}>
                    ایمیل
                  </label>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: 'var(--brand-navy-700)', border: '1px solid var(--brand-navy-600)' }}>
                    <Mail size={15} style={{ color: 'var(--brand-navy-400)' }} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="admin@barbercore.ir"
                      className="flex-1 outline-none bg-transparent text-sm text-white placeholder:text-[var(--brand-navy-500)]"
                      dir="ltr" autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--brand-navy-300)' }}>
                    رمز عبور
                  </label>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: 'var(--brand-navy-700)', border: '1px solid var(--brand-navy-600)' }}>
                    <Lock size={15} style={{ color: 'var(--brand-navy-400)' }} />
                    <input
                      type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 outline-none bg-transparent text-sm text-white placeholder:text-[var(--brand-navy-500)]"
                      dir="ltr"
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)}>
                      {showPw
                        ? <EyeOff size={14} style={{ color: 'var(--brand-navy-400)' }} />
                        : <Eye size={14} style={{ color: 'var(--brand-navy-400)' }} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-navy-900)' }}>
                  {loading ? 'بررسی...' : 'ادامه'}
                </button>
              </form>

              <div className="relative flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: 'var(--brand-navy-700)' }} />
                <span className="text-xs" style={{ color: 'var(--brand-navy-500)' }}>یا</span>
                <div className="flex-1 h-px" style={{ background: 'var(--brand-navy-700)' }} />
              </div>

              <button onClick={demoLogin} disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-medium border transition-all hover:opacity-90 disabled:opacity-50"
                style={{ borderColor: 'var(--brand-navy-600)', color: 'var(--brand-navy-300)' }}>
                ورود نمونه (dev mode)
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl"
                style={{ background: 'rgba(216,183,106,0.1)', border: '1px solid rgba(216,183,106,0.2)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--brand-gold-600)' }} />
                <p className="text-xs" style={{ color: 'var(--brand-gold-400)' }}>
                  تأیید دو مرحله‌ای فعال است
                </p>
              </div>

              <h2 className="text-base font-semibold text-white mb-2">کد احراز هویت</h2>
              <p className="text-xs mb-6" style={{ color: 'var(--brand-navy-300)' }}>
                کد ۶ رقمی از اپلیکیشن Authenticator خود را وارد کنید
              </p>

              <form onSubmit={handle2Fa} className="space-y-4">
                <input
                  type="text" value={twoFa} onChange={e => setTwoFa(e.target.value)}
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  className="w-full rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none text-white"
                  style={{ background: 'var(--brand-navy-700)', border: '1px solid var(--brand-navy-600)' }}
                  dir="ltr" autoFocus
                />
                <p className="text-xs text-center" style={{ color: 'var(--brand-navy-400)' }}>
                  کد دمو همیشه <strong className="text-white">123456</strong> است
                </p>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-navy-900)' }}>
                  {loading ? 'بررسی...' : 'ورود نهایی'}
                </button>
                <button type="button" onClick={() => setStep('creds')}
                  className="w-full text-xs text-center"
                  style={{ color: 'var(--brand-navy-400)' }}>
                  بازگشت
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--brand-navy-600)' }}>
          دسترسی محدود — فقط مدیران مجاز
        </p>
      </div>
    </div>
  );
}

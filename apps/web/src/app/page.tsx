import Link from 'next/link';
import { Scissors, Star, Shield, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 font-bold text-xl" style={{ color: 'var(--color-primary)' }}>
          <Scissors className="w-6 h-6" /> پرنگارین
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:opacity-80" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>ورود</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: 'var(--color-primary)' }}>پنل سالن‌داران</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold leading-tight" style={{ color: 'var(--color-text)' }}>
            رزرو آنلاین<br />
            <span style={{ color: 'var(--color-primary)' }}>آرایشگاه و سالن زیبایی</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
            بهترین سالن‌های ایران را پیدا کن، نوبت بگیر و بدون تلفن‌زدن وقتت رو مدیریت کن
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/male" className="px-8 py-4 rounded-xl text-white font-semibold text-lg transition-opacity hover:opacity-90" style={{ background: '#1e3a5f' }}>
              🪒 آرایشگاه مردانه
            </Link>
            <Link href="/female" className="px-8 py-4 rounded-xl text-white font-semibold text-lg transition-opacity hover:opacity-90" style={{ background: '#7c2d52' }}>
              💅 سالن زنانه
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Clock className="w-8 h-8" />, title: 'رزرو آنلاین ۲۴/۷', desc: 'هر ساعتی از شبانه‌روز نوبت بگیر، بدون تلفن‌زدن' },
            { icon: <Star className="w-8 h-8" />, title: 'نظرات واقعی', desc: 'نظرات کاربران واقعی را ببین و بهترین انتخاب را بکن' },
            { icon: <Shield className="w-8 h-8" />, title: 'سالن‌های تأییدشده', desc: 'تمام سالن‌ها تأییدشده و دارای مجوز هستند' },
          ].map((f, i) => (
            <div key={i} className="text-center p-6 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex justify-center mb-4" style={{ color: 'var(--color-primary)' }}>{f.icon}</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For salon owners */}
      <section className="py-16 px-6" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>صاحب سالن هستی؟</h2>
          <p style={{ color: 'var(--color-muted)' }}>با پرنگارین سالنت رو دیجیتال کن، رزروها رو آنلاین مدیریت کن و درآمدت رو بیشتر کن</p>
          <Link href="/dashboard/salons/new" className="inline-block px-8 py-4 rounded-xl text-white font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--color-primary)' }}>
            سالنم رو ثبت کن ← رایگان شروع کن
          </Link>
        </div>
      </section>
    </div>
  );
}

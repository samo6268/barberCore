import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const NEXT_STEPS = [
  'تیم پرنگارین اطلاعات سالن شما را بررسی می‌کند.',
  'ظرف ۲۴ ساعت با شما تماس گرفته می‌شود.',
  'پس از تأیید، پنل مدیریت سالن‌دار در اختیار شما قرار می‌گیرد.',
  'می‌توانید خدمات، کارکنان، و ساعت کاری را تنظیم کنید.',
  'سالن شما برای مشتریان قابل رزرو می‌شود.',
]

export default function SalonSuccessPage() {
  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <CheckCircle size={80} style={{ color: '#059669' }} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="text-display-md" style={{ color: 'var(--color-text)' }}>
          ثبت سالن شما با موفقیت انجام شد
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-muted)', marginTop: '1rem', lineHeight: 1.9 }}>
          تیم ما ظرف ۲۴ ساعت با شما تماس می‌گیرد و اطلاعات کامل‌تری ارائه خواهد داد.
        </p>

        {/* Next Steps */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '1.25rem',
            padding: '2rem',
            marginTop: '2rem',
            border: '1px solid var(--ui-gray-200)',
            textAlign: 'right',
          }}
        >
          <h2 className="text-h3" style={{ marginBottom: '1.25rem', textAlign: 'center' }}>مراحل بعدی</h2>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingRight: '0', listStyle: 'none', margin: 0 }}>
            {NEXT_STEPS.map((step, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                }}
              >
                <span
                  style={{
                    minWidth: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-plum-600)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    marginTop: '1px',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-body-sm" style={{ color: 'var(--color-text)', lineHeight: 1.7 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            href="/salon-owner/login"
            style={{
              display: 'block',
              backgroundColor: 'var(--brand-plum-600)',
              color: '#fff',
              padding: '0.9375rem',
              borderRadius: '0.875rem',
              fontWeight: 700,
              fontSize: '1.0625rem',
              textDecoration: 'none',
            }}
          >
            ورود به پنل سالن‌دار
          </Link>
          <Link
            href="/"
            style={{
              display: 'block',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              padding: '0.875rem',
              borderRadius: '0.875rem',
              fontWeight: 600,
              fontSize: '0.9375rem',
              textDecoration: 'none',
              border: '1.5px solid var(--ui-gray-200)',
            }}
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </main>
  )
}

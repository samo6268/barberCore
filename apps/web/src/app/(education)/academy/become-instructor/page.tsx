'use client'

import { useState } from 'react'
import { CheckCircle, DollarSign, Users, BookOpen, Star } from 'lucide-react'

const BENEFITS = [
  { icon: <DollarSign size={28} />, title: '۷۰٪ از فروش هر دوره', desc: 'بیشترین سهم درآمد در صنعت. شما دوره را می‌سازید، ما بازاریابی می‌کنیم.' },
  { icon: <Users size={28} />, title: 'دسترسی به هزاران دانشجو', desc: 'به شبکه‌ای از متخصصان زیبایی سراسر ایران وصل شوید.' },
  { icon: <BookOpen size={28} />, title: 'ابزارهای تدریس پیشرفته', desc: 'پنل مدرس حرفه‌ای با آمار فروش، تعامل دانشجو، و امکان آپلود ویدیو.' },
  { icon: <Star size={28} />, title: 'برند شخصی', desc: 'پروفایل مدرس اختصاصی برای معرفی خودتان به جامعه هزاران نفری پرنگارین.' },
]

export default function BecomeInstructorPage() {
  const [form, setForm] = useState({ name: '', email: '', specialty: '', experience: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--brand-plum-600) 0%, var(--brand-navy-600) 100%)',
          padding: '6rem 0',
          textAlign: 'center',
        }}
      >
        <div className="container-editorial">
          <span className="eyebrow" style={{ color: 'var(--brand-gold-600)' }}>فرصت شغلی</span>
          <h1 className="text-display-lg" style={{ color: '#fff', marginTop: '0.75rem' }}>
            مدرس پرنگارین شوید
          </h1>
          <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1.25rem', maxWidth: '560px', margin: '1.25rem auto 0' }}>
            دانش خود را به اشتراک بگذارید و درآمد پایدار ایجاد کنید. به جمع بهترین مدرسان صنعت زیبایی ایران بپیوندید.
          </p>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--brand-gold-600)',
              color: '#fff',
              padding: '1.25rem 3rem',
              borderRadius: '1rem',
              fontWeight: 800,
              fontSize: '1.5rem',
              marginTop: '2rem',
              letterSpacing: '0.02em',
            }}
          >
            ۷۰٪ از فروش هر دوره
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-editorial">
        <div className="container-editorial">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow">چرا پرنگارین؟</span>
            <h2 className="text-h2" style={{ marginTop: '0.75rem' }}>مزایای تدریس در پرنگارین</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  border: '1px solid var(--ui-gray-200)',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: 'var(--brand-plum-600)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  {benefit.icon}
                </div>
                <h3 className="text-body" style={{ fontWeight: 700 }}>{benefit.title}</h3>
                <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', lineHeight: 1.8 }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-editorial" style={{ backgroundColor: 'var(--bg-ivory-soft)' }}>
        <div className="container-editorial">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow">فرآیند</span>
            <h2 className="text-h2" style={{ marginTop: '0.75rem' }}>چطور شروع کنم؟</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            {[
              { step: '۱', title: 'درخواست دهید', desc: 'فرم زیر را پر کنید. تیم ما ظرف ۴۸ ساعت با شما تماس می‌گیرد.' },
              { step: '۲', title: 'آموزش ببینید', desc: 'راهنمای کامل تولید محتوا و استفاده از پنل مدرس را دریافت کنید.' },
              { step: '۳', title: 'دوره منتشر کنید', desc: 'دوره‌تان منتشر می‌شود و کمیسیون ماهانه دریافت می‌کنید.' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-plum-600)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    margin: '0 auto 1rem',
                  }}
                >
                  {item.step}
                </div>
                <h3 className="text-h3">{item.title}</h3>
                <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="section-editorial">
        <div className="container-editorial" style={{ maxWidth: '640px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="eyebrow">ثبت‌نام</span>
            <h2 className="text-h2" style={{ marginTop: '0.75rem' }}>فرم درخواست مدرس</h2>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '1.5rem', padding: '2.5rem', border: '1px solid var(--ui-gray-200)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={56} style={{ color: '#059669', margin: '0 auto 1rem', display: 'block' }} />
                <h3 className="text-h3" style={{ color: '#059669' }}>درخواست شما ثبت شد!</h3>
                <p className="text-body" style={{ color: 'var(--color-text-muted)', marginTop: '0.75rem', lineHeight: 1.9 }}>
                  تیم ما ظرف ۴۸ ساعت کاری با شما تماس خواهد گرفت.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { id: 'name', label: 'نام و نام خانوادگی', type: 'text', placeholder: 'مثال: محمد رضایی' },
                  { id: 'email', label: 'ایمیل', type: 'email', placeholder: 'example@email.com' },
                  { id: 'specialty', label: 'تخصص اصلی', type: 'text', placeholder: 'مثال: رنگ و هایلایت، میکاپ عروس' },
                  { id: 'experience', label: 'سال‌های تجربه', type: 'number', placeholder: 'مثال: ۵' },
                ].map((field) => (
                  <div key={field.id}>
                    <label className="text-body-sm" style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      required
                      value={(form as any)[field.id]}
                      onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        border: '1.5px solid var(--ui-gray-200)',
                        backgroundColor: 'var(--bg-ivory-soft)',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-body-sm" style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    توضیح درباره خودتان
                  </label>
                  <textarea
                    rows={4}
                    placeholder="کمی درباره تجربه، دوره‌هایی که می‌خواهید بسازید، و اهدافتان بنویسید..."
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      border: '1.5px solid var(--ui-gray-200)',
                      backgroundColor: 'var(--bg-ivory-soft)',
                      fontSize: '0.9375rem',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--brand-plum-600)',
                    color: '#fff',
                    padding: '0.9375rem',
                    borderRadius: '0.875rem',
                    fontWeight: 700,
                    fontSize: '1.0625rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ارسال درخواست
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

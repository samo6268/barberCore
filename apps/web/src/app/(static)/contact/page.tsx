'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'چطور می‌توانم آرایشگاه خود را ثبت کنم؟', a: 'از طریق صفحه «ثبت سالن» اطلاعات خود را وارد کنید. تیم ما ظرف ۲۴ ساعت با شما تماس می‌گیرد.' },
  { q: 'آیا استفاده از پرنگارین برای مشتریان رایگان است؟', a: 'بله، رزرو و استفاده از پلتفرم برای مشتریان کاملاً رایگان است.' },
  { q: 'در صورت لغو رزرو چه اتفاقی می‌افتد؟', a: 'شما می‌توانید تا ۲ ساعت قبل از وقت رزرو شده آن را لغو کنید. در غیر این صورت طبق سیاست هر سالن عمل می‌شود.' },
  { q: 'چطور می‌توانم مشکل پرداخت را گزارش دهم؟', a: 'از طریق همین فرم تماس یا ایمیل support@parnegareen.ir با ما در ارتباط باشید.' },
  { q: 'آیا اپلیکیشن موبایل دارید؟', a: 'بله، اپلیکیشن پرنگارین برای iOS و Android در دسترس است.' },
  { q: 'چطور می‌توانم نظر خود را ثبت کنم؟', a: 'پس از تکمیل هر نوبت، لینک ثبت نظر برای شما ارسال می‌شود.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--brand-plum-600)', padding: '5rem 0' }}>
        <div className="container-editorial" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--brand-gold-600)' }}>ارتباط با ما</span>
          <h1 className="text-display-md" style={{ color: '#fff', marginTop: '0.75rem' }}>تماس با ما</h1>
          <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.75)', marginTop: '1rem' }}>
            هر سوالی داری، اینجاییم تا جواب بدیم.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="section-editorial">
        <div className="container-editorial">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '4rem', alignItems: 'start' }}>
            {/* Form */}
            <div style={{ backgroundColor: '#fff', borderRadius: '1.5rem', padding: '2.5rem', border: '1px solid var(--ui-gray-200)' }}>
              <h2 className="text-h2" style={{ marginBottom: '2rem' }}>پیام بفرستید</h2>

              {submitted ? (
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '1rem',
                    padding: '2rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                  <p className="text-body" style={{ color: '#166534', fontWeight: 600 }}>پیام شما ارسال شد</p>
                  <p className="text-body-sm" style={{ color: '#166534', marginTop: '0.5rem' }}>
                    تیم پشتیبانی ما ظرف ۲۴ ساعت پاسخ خواهد داد.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    { id: 'name', label: 'نام و نام خانوادگی', type: 'text', placeholder: 'مثال: علی رضایی' },
                    { id: 'email', label: 'ایمیل', type: 'email', placeholder: 'example@email.com' },
                    { id: 'subject', label: 'موضوع', type: 'text', placeholder: 'موضوع پیام شما' },
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
                      پیام
                    </label>
                    <textarea
                      rows={5}
                      placeholder="پیام خود را بنویسید..."
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
                      padding: '0.875rem',
                      borderRadius: '0.75rem',
                      fontWeight: 700,
                      fontSize: '1rem',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ارسال پیام
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { icon: <Mail size={22} />, title: 'ایمیل', value: 'support@parnegareen.ir' },
                { icon: <Phone size={22} />, title: 'تلفن', value: '۰۲۱-۱۲۳۴-۵۶۷۸' },
                { icon: <MapPin size={22} />, title: 'آدرس', value: 'تهران، خیابان ولیعصر، برج پرنگارین، طبقه ۵' },
              ].map((info) => (
                <div
                  key={info.title}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid var(--ui-gray-200)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ color: 'var(--brand-plum-600)', marginTop: '2px' }}>{info.icon}</div>
                  <div>
                    <div className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{info.title}</div>
                    <div className="text-body" style={{ fontWeight: 600, marginTop: '0.25rem' }}>{info.value}</div>
                  </div>
                </div>
              ))}
              <div
                style={{
                  backgroundColor: 'var(--brand-plum-600)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  color: '#fff',
                }}
              >
                <div className="text-body" style={{ fontWeight: 700 }}>ساعات پاسخگویی</div>
                <div className="text-body-sm" style={{ marginTop: '0.5rem', opacity: 0.85 }}>شنبه تا پنج‌شنبه: ۸ صبح تا ۸ شب</div>
                <div className="text-body-sm" style={{ marginTop: '0.25rem', opacity: 0.85 }}>جمعه: ۱۰ صبح تا ۴ عصر</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-editorial" style={{ backgroundColor: 'var(--bg-ivory-soft)' }}>
        <div className="container-editorial" style={{ maxWidth: '760px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="eyebrow">سوالات متداول</span>
            <h2 className="text-h2" style={{ marginTop: '0.75rem' }}>پرسش‌های رایج</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '1rem',
                  border: '1px solid var(--ui-gray-200)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.125rem 1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  <span className="text-body" style={{ fontWeight: 600 }}>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: 'var(--color-text-muted)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                      marginRight: '0.5rem',
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: '0 1.5rem 1.25rem',
                      color: 'var(--color-text-muted)',
                    }}
                    className="text-body"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

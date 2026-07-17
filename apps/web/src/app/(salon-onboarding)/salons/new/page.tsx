'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const STEPS = ['اطلاعات سالن', 'اطلاعات مالک', 'ساعت کاری', 'انتخاب پلن']

const DAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']

const PLANS = [
  {
    id: 'free',
    name: 'رایگان',
    price: '۰',
    period: 'همیشه',
    features: ['۱ صندلی', 'رزرو آنلاین پایه', 'پروفایل سالن'],
    color: 'var(--ui-gray-200)',
    textColor: 'var(--color-text)',
  },
  {
    id: 'starter',
    name: 'استارتر',
    price: '۱۹۹,۰۰۰',
    period: 'ماهانه',
    features: ['تا ۳ صندلی', 'رزرو آنلاین پیشرفته', 'گزارش‌های پایه', 'پشتیبانی ایمیل'],
    color: 'var(--brand-navy-600)',
    textColor: '#fff',
  },
  {
    id: 'pro',
    name: 'حرفه‌ای',
    price: '۳۹۹,۰۰۰',
    period: 'ماهانه',
    features: ['تا ۱۰ صندلی', 'همه ویژگی‌های استارتر', 'SMS یادآوری', 'گزارش‌های پیشرفته', 'اپ اختصاصی'],
    color: 'var(--brand-plum-600)',
    textColor: '#fff',
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'سازمانی',
    price: '۷۹۹,۰۰۰',
    period: 'ماهانه',
    features: ['صندلی نامحدود', 'همه ویژگی‌های حرفه‌ای', 'مدیریت چند شعبه', 'مدیر اختصاصی', 'API اختصاصی'],
    color: 'var(--brand-gold-600)',
    textColor: '#fff',
  },
]

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  border: '1.5px solid var(--ui-gray-200)',
  backgroundColor: 'var(--bg-ivory-soft)',
  fontSize: '0.9375rem',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  marginBottom: '0.4rem',
}

export default function NewSalonPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  // Step 1
  const [salonName, setSalonName] = useState('')
  const [salonType, setSalonType] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  // Step 2
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Step 3
  const [workDays, setWorkDays] = useState<string[]>([])
  const [openTime, setOpenTime] = useState('09:00')
  const [closeTime, setCloseTime] = useState('21:00')

  // Step 4
  const [plan, setPlan] = useState('pro')

  function validate(): boolean {
    const errs: string[] = []
    if (step === 0) {
      if (!salonName) errs.push('نام سالن الزامی است')
      if (!salonType) errs.push('نوع سالن الزامی است')
      if (!city) errs.push('شهر الزامی است')
      if (!address) errs.push('آدرس الزامی است')
    }
    if (step === 1) {
      if (!ownerName) errs.push('نام مالک الزامی است')
      if (!phone) errs.push('شماره تلفن الزامی است')
      if (!email) errs.push('ایمیل الزامی است')
    }
    if (step === 2) {
      if (workDays.length === 0) errs.push('حداقل یک روز کاری انتخاب کنید')
    }
    setErrors(errs)
    return errs.length === 0
  }

  function handleNext() {
    if (validate()) {
      if (step < STEPS.length - 1) setStep(step + 1)
      else router.push('/salons/new/success')
    }
  }

  function toggleDay(day: string) {
    setWorkDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])
  }

  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container-editorial" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="eyebrow">ثبت سالن</span>
          <h1 className="text-h1" style={{ marginTop: '0.5rem' }}>سالن جدید ثبت کنید</h1>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: i < step ? '#059669' : i === step ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)',
                    color: i <= step ? '#fff' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    marginBottom: '0.375rem',
                  }}
                >
                  {i < step ? <CheckCircle size={18} /> : i + 1}
                </div>
                <span className="text-caption" style={{ color: i === step ? 'var(--brand-plum-600)' : 'var(--color-text-muted)', fontWeight: i === step ? 700 : 400, textAlign: 'center', fontSize: '0.75rem' }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
          <div style={{ height: '4px', backgroundColor: 'var(--ui-gray-200)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: 'var(--brand-plum-600)',
                borderRadius: '2px',
                width: `${((step) / (STEPS.length - 1)) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Form card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '1.5rem', padding: '2.5rem', border: '1px solid var(--ui-gray-200)' }}>
          <h2 className="text-h2" style={{ marginBottom: '2rem' }}>{STEPS[step]}</h2>

          {/* Step 1: Salon Info */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>نام سالن</label>
                <input style={inputStyle} value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="مثال: سالن زیبایی ستاره" />
              </div>
              <div>
                <label style={labelStyle}>نوع سالن</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['مردانه', 'زنانه', 'مختلط'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSalonType(type)}
                      type="button"
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        border: salonType === type ? '2px solid var(--brand-plum-600)' : '1.5px solid var(--ui-gray-200)',
                        backgroundColor: salonType === type ? 'rgba(126,34,206,0.06)' : 'transparent',
                        color: salonType === type ? 'var(--brand-plum-600)' : 'var(--color-text)',
                        fontWeight: salonType === type ? 700 : 500,
                        cursor: 'pointer',
                        fontSize: '0.9375rem',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>شهر</label>
                <input style={inputStyle} value={city} onChange={(e) => setCity(e.target.value)} placeholder="مثال: تهران" />
              </div>
              <div>
                <label style={labelStyle}>آدرس کامل</label>
                <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="خیابان، کوچه، پلاک..." />
              </div>
            </div>
          )}

          {/* Step 2: Owner Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>نام و نام خانوادگی مالک</label>
                <input style={inputStyle} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="مثال: محمد رضایی" />
              </div>
              <div>
                <label style={labelStyle}>شماره تلفن</label>
                <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
              </div>
              <div>
                <label style={labelStyle}>ایمیل</label>
                <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="salon@example.com" />
              </div>
            </div>
          )}

          {/* Step 3: Working Hours */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>روزهای کاری</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      style={{
                        padding: '0.625rem 0.5rem',
                        borderRadius: '0.625rem',
                        border: workDays.includes(day) ? '2px solid var(--brand-plum-600)' : '1.5px solid var(--ui-gray-200)',
                        backgroundColor: workDays.includes(day) ? 'rgba(126,34,206,0.07)' : 'transparent',
                        color: workDays.includes(day) ? 'var(--brand-plum-600)' : 'var(--color-text)',
                        fontWeight: workDays.includes(day) ? 700 : 400,
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>ساعت شروع</label>
                  <input type="time" style={inputStyle} value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>ساعت پایان</label>
                  <input type="time" style={inputStyle} value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Plan */}
          {step === 3 && (
            <div>
              <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                پلن مناسب خود را انتخاب کنید. می‌توانید در هر زمان ارتقاء دهید.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {PLANS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    style={{
                      borderRadius: '1.25rem',
                      padding: '1.5rem',
                      border: plan === p.id ? `2px solid ${p.color}` : '1.5px solid var(--ui-gray-200)',
                      backgroundColor: plan === p.id ? p.color : '#fff',
                      color: plan === p.id ? p.textColor : 'var(--color-text)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {p.recommended && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '1rem',
                          backgroundColor: 'var(--brand-gold-600)',
                          color: '#fff',
                          padding: '0.2rem 0.75rem',
                          borderRadius: '2rem',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                        }}
                      >
                        پیشنهادی
                      </span>
                    )}
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{p.name}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>
                      {p.price} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>تومان / {p.period}</span>
                    </div>
                    <ul style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', paddingRight: '1rem' }}>
                      {p.features.map((f) => (
                        <li key={f} style={{ fontSize: '0.8125rem', opacity: plan === p.id ? 0.9 : 0.7 }}>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ marginTop: '1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.75rem', padding: '1rem' }}>
              {errors.map((err) => (
                <p key={err} className="text-body-sm" style={{ color: '#dc2626' }}>{err}</p>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button
              onClick={() => { setErrors([]); setStep(Math.max(0, step - 1)) }}
              disabled={step === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1.5px solid var(--ui-gray-200)',
                backgroundColor: 'transparent',
                color: step === 0 ? 'var(--color-text-muted)' : 'var(--color-text)',
                cursor: step === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9375rem',
                opacity: step === 0 ? 0.5 : 1,
              }}
            >
              <ChevronRight size={18} />
              قبلی
            </button>
            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.75rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                backgroundColor: 'var(--brand-plum-600)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9375rem',
              }}
            >
              {step === STEPS.length - 1 ? 'ثبت سالن' : 'بعدی'}
              {step < STEPS.length - 1 && <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

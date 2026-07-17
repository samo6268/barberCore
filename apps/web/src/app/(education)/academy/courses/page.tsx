'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Star, Users, Clock, BookOpen } from 'lucide-react'

const COURSES = [
  { id: '1', title: 'کوتاهی حرفه‌ای مو', instructor: 'استاد محمدی', category: 'مو', level: 'مبتدی', duration: '۱۲ ساعت', students: 340, price: 480000, rating: 4.8, image: '/images/salons/01.svg' },
  { id: '2', title: 'رنگ و هایلایت مدرن', instructor: 'استاد رضایی', category: 'رنگ', level: 'متوسط', duration: '۱۸ ساعت', students: 220, price: 750000, rating: 4.9, image: '/images/salons/02.svg' },
  { id: '3', title: 'میکاپ عروس و مجلسی', instructor: 'استاد کریمی', category: 'میکاپ', level: 'پیشرفته', duration: '۲۴ ساعت', students: 180, price: 920000, rating: 4.7, image: '/images/salons/03.svg' },
  { id: '4', title: 'ناخن ژل و اکریلیک', instructor: 'استاد احمدی', category: 'ناخن', level: 'مبتدی', duration: '۱۰ ساعت', students: 410, price: 390000, rating: 4.6, image: '/images/salons/04.svg' },
  { id: '5', title: 'کراتین و صافی مو', instructor: 'استاد حسینی', category: 'مو', level: 'متوسط', duration: '۱۵ ساعت', students: 155, price: 620000, rating: 4.8, image: '/images/salons/05.svg' },
  { id: '6', title: 'بالیاژ و سامبره', instructor: 'استاد محمودی', category: 'رنگ', level: 'پیشرفته', duration: '۲۰ ساعت', students: 98, price: 850000, rating: 4.9, image: '/images/salons/06.svg' },
  { id: '7', title: 'آرایش روزانه و ساده', instructor: 'استاد نوری', category: 'میکاپ', level: 'مبتدی', duration: '۸ ساعت', students: 520, price: 280000, rating: 4.5, image: '/images/salons/07.svg' },
  { id: '8', title: 'ناخن آرت و طراحی', instructor: 'استاد زارعی', category: 'ناخن', level: 'متوسط', duration: '۱۴ ساعت', students: 230, price: 560000, rating: 4.7, image: '/images/salons/08.svg' },
  { id: '9', title: 'مدیریت سالن و خدمات مشتری', instructor: 'استاد اکبری', category: 'مو', level: 'پیشرفته', duration: '۱۶ ساعت', students: 75, price: 700000, rating: 4.6, image: '/images/salons/09.svg' },
  { id: '10', title: 'اکستنشن مو و موی مصنوعی', instructor: 'استاد شاهی', category: 'مو', level: 'متوسط', duration: '۲۲ ساعت', students: 140, price: 890000, rating: 4.8, image: '/images/salons/10.svg' },
  { id: '11', title: 'میکاپ فانتزی و تئاتر', instructor: 'استاد فرهادی', category: 'میکاپ', level: 'پیشرفته', duration: '۳۰ ساعت', students: 55, price: 1200000, rating: 5.0, image: '/images/salons/01.svg' },
  { id: '12', title: 'مانیکور کلاسیک و SPA', instructor: 'استاد موسوی', category: 'ناخن', level: 'مبتدی', duration: '۶ ساعت', students: 380, price: 220000, rating: 4.4, image: '/images/salons/02.svg' },
]

const CATEGORIES = ['همه', 'مو', 'رنگ', 'میکاپ', 'ناخن']
const LEVELS = ['همه', 'مبتدی', 'متوسط', 'پیشرفته']
const LEVEL_COLORS: Record<string, string> = {
  مبتدی: '#059669',
  متوسط: 'var(--brand-gold-600)',
  پیشرفته: 'var(--brand-plum-600)',
}

function renderStars(rating: number) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          style={{ color: s <= Math.round(rating) ? 'var(--brand-gold-600)' : 'var(--ui-gray-200)', fill: s <= Math.round(rating) ? 'var(--brand-gold-600)' : 'var(--ui-gray-200)' }}
        />
      ))}
    </div>
  )
}

export default function CoursesPage() {
  const [category, setCategory] = useState('همه')
  const [level, setLevel] = useState('همه')
  const [priceMax, setPriceMax] = useState(1500000)

  const filtered = COURSES.filter(
    (c) =>
      (category === 'همه' || c.category === category) &&
      (level === 'همه' || c.level === level) &&
      c.price <= priceMax,
  )

  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--brand-navy-600)', padding: '4rem 0' }}>
        <div className="container-editorial" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--brand-gold-600)' }}>آکادمی پرنگارین</span>
          <h1 className="text-display-md" style={{ color: '#fff', marginTop: '0.75rem' }}>دوره‌های آموزشی</h1>
          <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.75)', marginTop: '1rem' }}>
            با اساتید برتر صنعت زیبایی ایران آموزش ببینید
          </p>
        </div>
      </section>

      {/* Filters */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--ui-gray-200)', padding: '1.25rem 0' }}>
        <div className="container-editorial" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="text-body-sm" style={{ color: 'var(--color-text-muted)', alignSelf: 'center', fontWeight: 600 }}>دسته:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '0.375rem 1rem',
                  borderRadius: '2rem',
                  border: category === cat ? 'none' : '1.5px solid var(--ui-gray-200)',
                  backgroundColor: category === cat ? 'var(--brand-navy-600)' : 'transparent',
                  color: category === cat ? '#fff' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level filter */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="text-body-sm" style={{ color: 'var(--color-text-muted)', alignSelf: 'center', fontWeight: 600 }}>سطح:</span>
            {LEVELS.map((lv) => (
              <button
                key={lv}
                onClick={() => setLevel(lv)}
                style={{
                  padding: '0.375rem 1rem',
                  borderRadius: '2rem',
                  border: level === lv ? 'none' : '1.5px solid var(--ui-gray-200)',
                  backgroundColor: level === lv ? 'var(--brand-plum-600)' : 'transparent',
                  color: level === lv ? '#fff' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {lv}
              </button>
            ))}
          </div>

          {/* Price filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="text-body-sm" style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>حداکثر قیمت:</span>
            <input
              type="range"
              min={200000}
              max={1500000}
              step={50000}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              style={{ width: '120px' }}
            />
            <span className="text-body-sm" style={{ color: 'var(--brand-plum-600)', fontWeight: 700 }}>
              {(priceMax / 10000).toFixed(0)} هزار تومان
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="section-editorial">
        <div className="container-editorial">
          <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            {filtered.length} دوره یافت شد
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {filtered.map((course) => (
              <Link key={course.id} href={`/academy/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '1.25rem',
                    overflow: 'hidden',
                    border: '1px solid var(--ui-gray-200)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', height: '160px' }}>
                    <Image src={course.image} alt={course.title} fill style={{ objectFit: 'cover' }} />
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        backgroundColor: LEVEL_COLORS[course.level] || 'var(--brand-plum-600)',
                        color: '#fff',
                        padding: '0.2rem 0.625rem',
                        borderRadius: '2rem',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                      }}
                    >
                      {course.level}
                    </span>
                  </div>
                  <div style={{ padding: '1.125rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="text-caption" style={{ color: 'var(--brand-plum-600)', fontWeight: 700 }}>{course.category}</div>
                    <div className="text-body" style={{ fontWeight: 700, marginTop: '0.25rem', lineHeight: 1.5 }}>{course.title}</div>
                    <div className="text-caption" style={{ color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>{course.instructor}</div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{course.duration}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={12} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{course.students}</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
                      {renderStars(course.rating)}
                      <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{course.rating}</span>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--ui-gray-100)' }}>
                      <span className="text-body" style={{ fontWeight: 700, color: 'var(--brand-plum-600)' }}>
                        {course.price.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p className="text-body">دوره‌ای با این فیلترها یافت نشد.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

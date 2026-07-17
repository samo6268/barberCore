'use client'

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { Star, Users, Clock, ChevronDown, Play } from 'lucide-react'

const MOCK_COURSES: Record<string, {
  title: string
  instructor: string
  instructorBio: string
  category: string
  level: string
  price: number
  rating: number
  students: number
  duration: string
  image: string
  about: string
  chapters: { title: string; lessons: { name: string; duration: string }[] }[]
  reviews: { name: string; rating: number; text: string }[]
}> = {
  '1': {
    title: 'کوتاهی حرفه‌ای مو',
    instructor: 'استاد محمدی',
    instructorBio: 'با ۱۵ سال تجربه در صنعت آرایش ایران و سابقه تدریس در مدرسه‌های معتبر زیبایی.',
    category: 'مو',
    level: 'مبتدی',
    price: 480000,
    rating: 4.8,
    students: 340,
    duration: '۱۲ ساعت',
    image: '/images/salons/01.svg',
    about: 'این دوره جامع تمام تکنیک‌های پایه کوتاهی مو را از صفر تا صد آموزش می‌دهد. مناسب برای کسانی که می‌خواهند آرایشگری را جدی دنبال کنند یا دانش پایه خود را تقویت نمایند.',
    chapters: [
      {
        title: 'فصل ۱: آشنایی با ابزار',
        lessons: [
          { name: 'معرفی قیچی و ماشین', duration: '۲۰ دقیقه' },
          { name: 'نگهداری و تیز کردن ابزار', duration: '۱۵ دقیقه' },
          { name: 'ایمنی در کار با ابزار', duration: '۱۰ دقیقه' },
        ],
      },
      {
        title: 'فصل ۲: انواع کوتاهی',
        lessons: [
          { name: 'کوتاهی لایه‌لایه (Layered)', duration: '۴۵ دقیقه' },
          { name: 'باب کلاسیک', duration: '۳۰ دقیقه' },
          { name: 'پیکسی کات', duration: '۴۰ دقیقه' },
        ],
      },
      {
        title: 'فصل ۳: فید و فید بالا',
        lessons: [
          { name: 'اصول فید', duration: '۵۰ دقیقه' },
          { name: 'فید بالا (High Fade)', duration: '۴۵ دقیقه' },
          { name: 'تیپ‌فید', duration: '۳۵ دقیقه' },
        ],
      },
    ],
    reviews: [
      { name: 'نیلوفر ر.', rating: 5, text: 'دوره فوق‌العاده‌ای بود. استاد با حوصله و دقت آموزش داد.' },
      { name: 'محمد ع.', rating: 5, text: 'بهترین سرمایه‌گذاری که کردم. الان مشتریان ثابت دارم.' },
      { name: 'سمیرا ب.', rating: 4, text: 'محتوا کامل بود، فقط کاش مثال‌های بیشتری داشت.' },
    ],
  },
  '2': {
    title: 'رنگ و هایلایت مدرن',
    instructor: 'استاد رضایی',
    instructorBio: 'متخصص رنگ مو با مدرک بین‌المللی از فرانسه و ۱۰ سال تجربه.',
    category: 'رنگ',
    level: 'متوسط',
    price: 750000,
    rating: 4.9,
    students: 220,
    duration: '۱۸ ساعت',
    image: '/images/salons/02.svg',
    about: 'این دوره تمام تکنیک‌های مدرن رنگ و هایلایت مو را از بالیاژ تا فویل آموزش می‌دهد. مناسب برای آرایشگرانی که می‌خواهند تخصص خود را در حوزه رنگ ارتقاء دهند.',
    chapters: [
      {
        title: 'فصل ۱: اصول رنگ‌شناسی',
        lessons: [
          { name: 'چرخه رنگ و دما', duration: '۳۵ دقیقه' },
          { name: 'انواع اکسیدان', duration: '۲۵ دقیقه' },
          { name: 'رنگ روی رنگ', duration: '۳۰ دقیقه' },
        ],
      },
      {
        title: 'فصل ۲: هایلایت و لولایت',
        lessons: [
          { name: 'هایلایت با فویل', duration: '۶۰ دقیقه' },
          { name: 'بالیاژ', duration: '۵۵ دقیقه' },
          { name: 'سامبره و امبره', duration: '۵۰ دقیقه' },
        ],
      },
    ],
    reviews: [
      { name: 'فاطمه م.', rating: 5, text: 'استاد رضایی بهترین معلمی است که تا حالا داشتم.' },
      { name: 'آرش ت.', rating: 5, text: 'تکنیک بالیاژ را کامل یاد گرفتم. درآمدم دوبرابر شد.' },
    ],
  },
  '3': {
    title: 'میکاپ عروس و مجلسی',
    instructor: 'استاد کریمی',
    instructorBio: 'آرتیست میکاپ با بیش از ۸ سال تجربه در آرایش عروس و تدریس در آکادمی‌های معتبر.',
    category: 'میکاپ',
    level: 'پیشرفته',
    price: 920000,
    rating: 4.7,
    students: 180,
    duration: '۲۴ ساعت',
    image: '/images/salons/03.svg',
    about: 'یاد بگیرید چطور آرایش عروس بی‌نقص ایجاد کنید. این دوره شامل تکنیک‌های پیشرفته آرایش چشم، پوست، و مو می‌شود.',
    chapters: [
      {
        title: 'فصل ۱: آماده‌سازی پوست',
        lessons: [
          { name: 'اسکین کر قبل از میکاپ', duration: '۴۰ دقیقه' },
          { name: 'پرایمر و بیس', duration: '۳۵ دقیقه' },
        ],
      },
      {
        title: 'فصل ۲: میکاپ عروس سنتی',
        lessons: [
          { name: 'کانتورینگ و هایلایتینگ', duration: '۷۰ دقیقه' },
          { name: 'آرایش چشم کلاسیک', duration: '۶۵ دقیقه' },
        ],
      },
    ],
    reviews: [
      { name: 'زهرا ف.', rating: 5, text: 'دوره عالی. الان آرایش عروس انجام می‌دهم.' },
      { name: 'مینا ح.', rating: 4, text: 'محتوا عمیق بود. نیاز به تمرین زیادی دارد.' },
    ],
  },
  '4': {
    title: 'ناخن ژل و اکریلیک',
    instructor: 'استاد احمدی',
    instructorBio: 'متخصص ناخن با ۶ سال تجربه و اخذ مدرک از آکادمی‌های اروپایی.',
    category: 'ناخن',
    level: 'مبتدی',
    price: 390000,
    rating: 4.6,
    students: 410,
    duration: '۱۰ ساعت',
    image: '/images/salons/04.svg',
    about: 'از صفر با ناخن ژل و اکریلیک آشنا شوید. این دوره برای مبتدیان طراحی شده و تمام مهارت‌های پایه را پوشش می‌دهد.',
    chapters: [
      {
        title: 'فصل ۱: مقدمه',
        lessons: [
          { name: 'تفاوت ژل و اکریلیک', duration: '۲۰ دقیقه' },
          { name: 'ابزارها و لوازم', duration: '۱۵ دقیقه' },
        ],
      },
    ],
    reviews: [
      { name: 'شیرین ک.', rating: 5, text: 'استاد احمدی خیلی صبور بودند.' },
    ],
  },
  '5': {
    title: 'کراتین و صافی مو',
    instructor: 'استاد حسینی',
    instructorBio: 'متخصص درمان و احیاء مو با ۱۲ سال تجربه در کلینیک‌های مو.',
    category: 'مو',
    level: 'متوسط',
    price: 620000,
    rating: 4.8,
    students: 155,
    duration: '۱۵ ساعت',
    image: '/images/salons/05.svg',
    about: 'تکنیک‌های کراتین تراپی و صافی مو را به صورت حرفه‌ای بیاموزید. شامل تمام برندهای معتبر موجود در بازار ایران.',
    chapters: [
      {
        title: 'فصل ۱: شیمی مو',
        lessons: [
          { name: 'ساختار مو و پروتئین', duration: '۴۰ دقیقه' },
          { name: 'چطور کراتین کار می‌کند', duration: '۳۰ دقیقه' },
        ],
      },
    ],
    reviews: [
      { name: 'پریسا د.', rating: 5, text: 'بهترین دوره کراتین که پیدا کردم.' },
    ],
  },
  '6': {
    title: 'بالیاژ و سامبره',
    instructor: 'استاد محمودی',
    instructorBio: 'آرتیست رنگ با تخصص در تکنیک‌های فرانسوی و اسکاندیناوی.',
    category: 'رنگ',
    level: 'پیشرفته',
    price: 850000,
    rating: 4.9,
    students: 98,
    duration: '۲۰ ساعت',
    image: '/images/salons/06.svg',
    about: 'عمیق‌ترین آموزش بالیاژ و سامبره در ایران. برای آرایشگران حرفه‌ای که می‌خواهند متمایز باشند.',
    chapters: [
      {
        title: 'فصل ۱: فلسفه بالیاژ',
        lessons: [
          { name: 'تاریخچه و فلسفه', duration: '۲۵ دقیقه' },
          { name: 'انتخاب رنگ مناسب', duration: '۴۵ دقیقه' },
        ],
      },
    ],
    reviews: [
      { name: 'ستاره ج.', rating: 5, text: 'سطح دوره واقعاً پیشرفته است. توصیه می‌کنم.' },
    ],
  },
}

const TABS = ['درباره دوره', 'سرفصل‌ها', 'مدرس', 'نظرات']

function renderStars(rating: number) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          style={{ color: s <= Math.round(rating) ? 'var(--brand-gold-600)' : 'var(--ui-gray-200)', fill: s <= Math.round(rating) ? 'var(--brand-gold-600)' : 'var(--ui-gray-200)' }}
        />
      ))}
    </div>
  )
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const course = MOCK_COURSES[params.id]
  if (!course) notFound()

  const [tab, setTab] = useState(TABS[0])
  const [openChapter, setOpenChapter] = useState<number | null>(0)

  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--brand-navy-600)', padding: '0' }}>
        <div className="container-editorial" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '3rem', alignItems: 'center', padding: '3rem 1.5rem' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--brand-gold-600)',
                color: '#fff',
                padding: '0.25rem 0.875rem',
                borderRadius: '2rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              {course.category} · {course.level}
            </span>
            <h1 className="text-display-md" style={{ color: '#fff' }}>{course.title}</h1>
            <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.75)', marginTop: '1rem', lineHeight: 1.9 }}>
              {course.about}
            </p>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
              {[
                { icon: <Clock size={16} />, label: course.duration },
                { icon: <Users size={16} />, label: `${course.students} دانشجو` },
                { icon: <Star size={16} />, label: String(course.rating) },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.8)' }}>
                  {item.icon}
                  <span className="text-body-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Course card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ position: 'relative', height: '220px' }}>
              <Image src={course.image} alt={course.title} fill style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={24} style={{ color: 'var(--brand-plum-600)', fill: 'var(--brand-plum-600)' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="text-display-md" style={{ color: 'var(--brand-plum-600)', fontWeight: 700 }}>
                {course.price.toLocaleString('fa-IR')} تومان
              </div>
              <button
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '1rem',
                  backgroundColor: 'var(--brand-plum-600)',
                  color: '#fff',
                  padding: '0.875rem',
                  borderRadius: '0.875rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ثبت‌نام در دوره
              </button>
              <p className="text-caption" style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                ۳۰ روز ضمانت بازگشت وجه
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--ui-gray-200)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container-editorial" style={{ display: 'flex', gap: '0' }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: tab === t ? 'var(--brand-plum-600)' : 'var(--color-text-muted)',
                fontWeight: tab === t ? 700 : 500,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                borderBottom: tab === t ? '2px solid var(--brand-plum-600)' : '2px solid transparent',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <section className="section-editorial">
        <div className="container-editorial" style={{ maxWidth: '800px' }}>
          {tab === 'درباره دوره' && (
            <div>
              <h2 className="text-h2" style={{ marginBottom: '1.25rem' }}>درباره این دوره</h2>
              <p className="text-body-lg" style={{ color: 'var(--color-text-muted)', lineHeight: 2 }}>{course.about}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                {[
                  { label: 'مدت دوره', value: course.duration },
                  { label: 'سطح', value: course.level },
                  { label: 'دانشجو', value: String(course.students) },
                ].map((stat) => (
                  <div key={stat.label} style={{ backgroundColor: 'var(--bg-ivory-soft)', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
                    <div className="text-h3" style={{ color: 'var(--brand-plum-600)' }}>{stat.value}</div>
                    <div className="text-caption" style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'سرفصل‌ها' && (
            <div>
              <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>سرفصل‌های دوره</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {course.chapters.map((chapter, ci) => (
                  <div key={ci} style={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--ui-gray-200)', overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpenChapter(openChapter === ci ? null : ci)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 1.25rem',
                        background: 'var(--bg-ivory-soft)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <span className="text-body" style={{ fontWeight: 700 }}>{chapter.title}</span>
                      <ChevronDown size={18} style={{ transform: openChapter === ci ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }} />
                    </button>
                    {openChapter === ci && (
                      <div style={{ padding: '0.5rem 0' }}>
                        {chapter.lessons.map((lesson, li) => (
                          <div
                            key={li}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1.25rem',
                              borderTop: '1px solid var(--ui-gray-100)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Play size={14} style={{ color: 'var(--color-text-muted)' }} />
                              <span className="text-body-sm">{lesson.name}</span>
                            </div>
                            <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'مدرس' && (
            <div>
              <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>مدرس دوره</h2>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <Image src="/images/instructors/01.svg" alt={course.instructor} fill style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <h3 className="text-h3">{course.instructor}</h3>
                  <p className="text-body" style={{ color: 'var(--color-text-muted)', marginTop: '0.75rem', lineHeight: 2 }}>{course.instructorBio}</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'نظرات' && (
            <div>
              <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>نظرات دانشجویان</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {course.reviews.map((rev, i) => (
                  <div key={i} style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--ui-gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                      <span className="text-body" style={{ fontWeight: 700 }}>{rev.name}</span>
                      {renderStars(rev.rating)}
                    </div>
                    <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

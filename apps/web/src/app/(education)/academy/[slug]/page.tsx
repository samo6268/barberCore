import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Star, Users, BookOpen, Award } from 'lucide-react'

const MOCK_INSTRUCTORS: Record<string, {
  name: string
  specialty: string
  bio: string
  image: string
  experience: number
  students: number
  courses: number
  rating: number
  courseList: { id: string; title: string; image: string; price: number; rating: number }[]
  testimonials: { name: string; text: string; rating: number }[]
}> = {
  'sara-mohammadi': {
    name: 'سارا محمدی',
    specialty: 'کوتاهی و استایلینگ مو',
    bio: 'سارا محمدی با بیش از ۱۵ سال تجربه در صنعت آرایش ایران، یکی از شناخته‌شده‌ترین مدرسان کوتاهی حرفه‌ای است. او دارای مدرک بین‌المللی از آکادمی وی‌دال ساسون لندن است و با بیش از ۱۰۰۰ دانشجو تجربه تدریس دارد.',
    image: '/images/instructors/01.svg',
    experience: 15,
    students: 1200,
    courses: 5,
    rating: 4.9,
    courseList: [
      { id: '1', title: 'کوتاهی حرفه‌ای مو', image: '/images/salons/01.svg', price: 480000, rating: 4.8 },
    ],
    testimonials: [
      { name: 'نیلوفر ر.', text: 'استاد محمدی بهترین معلمی بودند که تا حالا داشتم. صبور، حرفه‌ای، و بسیار مسلط به موضوع.', rating: 5 },
      { name: 'مهدی ک.', text: 'بعد از گذراندن دوره ایشان کاملاً آماده کار شدم. الان مشتریان زیادی دارم.', rating: 5 },
      { name: 'شیدا م.', text: 'محتوای دوره بسیار کامل و عملی بود. توصیه می‌کنم.', rating: 5 },
    ],
  },
  'ali-rezaei': {
    name: 'علی رضایی',
    specialty: 'رنگ و هایلایت مدرن',
    bio: 'علی رضایی متخصص رنگ مو با مدرک بین‌المللی از فرانسه است. او ۱۰ سال در سالن‌های معتبر تهران و اروپا کار کرده و تکنیک‌های بالیاژ و سامبره را به ایران آورده است.',
    image: '/images/instructors/02.svg',
    experience: 10,
    students: 850,
    courses: 3,
    rating: 4.9,
    courseList: [
      { id: '2', title: 'رنگ و هایلایت مدرن', image: '/images/salons/02.svg', price: 750000, rating: 4.9 },
      { id: '6', title: 'بالیاژ و سامبره', image: '/images/salons/06.svg', price: 850000, rating: 4.9 },
    ],
    testimonials: [
      { name: 'فاطمه م.', text: 'استاد رضایی دید هنری خاصی دارند و این را به دانشجوها منتقل می‌کنند.', rating: 5 },
      { name: 'آرش ت.', text: 'درآمدم بعد از دوره دوبرابر شد. ممنون.', rating: 5 },
    ],
  },
  'maryam-karimi': {
    name: 'مریم کریمی',
    specialty: 'میکاپ و آرایش صورت',
    bio: 'مریم کریمی آرتیست میکاپ با ۸ سال تجربه در حوزه آرایش عروس و صحنه است. او برنده جایزه بهترین آرتیست میکاپ ایران در سال ۱۴۰۰ شده و با برندهای بین‌المللی همکاری دارد.',
    image: '/images/instructors/03.svg',
    experience: 8,
    students: 620,
    courses: 4,
    rating: 4.8,
    courseList: [
      { id: '3', title: 'میکاپ عروس و مجلسی', image: '/images/salons/03.svg', price: 920000, rating: 4.7 },
    ],
    testimonials: [
      { name: 'زهرا ف.', text: 'دوره خانم کریمی زندگی حرفه‌ای‌ام را تغییر داد.', rating: 5 },
      { name: 'لیلا ح.', text: 'اطلاعات بسیار تخصصی و کاربردی.', rating: 5 },
    ],
  },
  'nima-hosseini': {
    name: 'نیما حسینی',
    specialty: 'ریش و آرایش مردانه',
    bio: 'نیما حسینی از پیشگامان آرایش مردانه مدرن در ایران است. او مجموعه‌ای از باربرشاپ‌های موفق در تهران دارد و تجربه آموزش بیش از ۵۰۰ نفر را در کارنامه خود ثبت کرده است.',
    image: '/images/instructors/04.svg',
    experience: 12,
    students: 520,
    courses: 3,
    rating: 4.7,
    courseList: [
      { id: '1', title: 'کوتاهی حرفه‌ای مو', image: '/images/salons/01.svg', price: 480000, rating: 4.8 },
    ],
    testimonials: [
      { name: 'امیر ر.', text: 'استاد حسینی هم مدرس خوبی هستند و هم کارآفرین موفق.', rating: 5 },
      { name: 'کیان م.', text: 'همه نکات مربوط به آرایش مردانه را یاد گرفتم.', rating: 4 },
    ],
  },
  'leila-ahmadi': {
    name: 'لیلا احمدی',
    specialty: 'ناخن و هنر ناخن',
    bio: 'لیلا احمدی متخصص ناخن با تخصص در طراحی و هنر ناخن است. او مدرک بین‌المللی CIDESCO دارد و در نمایشگاه‌های زیبایی کشورهای اروپایی شرکت کرده است.',
    image: '/images/instructors/05.svg',
    experience: 7,
    students: 780,
    courses: 4,
    rating: 4.8,
    courseList: [
      { id: '4', title: 'ناخن ژل و اکریلیک', image: '/images/salons/04.svg', price: 390000, rating: 4.6 },
      { id: '8', title: 'ناخن آرت و طراحی', image: '/images/salons/08.svg', price: 560000, rating: 4.7 },
    ],
    testimonials: [
      { name: 'شیرین ک.', text: 'دوره‌های خانم احمدی بهترین در حوزه ناخن هستند.', rating: 5 },
    ],
  },
  'reza-mahmoud': {
    name: 'رضا محمودی',
    specialty: 'کراتین و احیاء مو',
    bio: 'رضا محمودی متخصص در درمان و احیاء موهای آسیب‌دیده است. او در ایران پیشگام استفاده از پروتکل‌های بین‌المللی کراتین درمانی شده و با بیش از ۱۵۰۰ مشتری مستقیم کار کرده است.',
    image: '/images/instructors/06.svg',
    experience: 11,
    students: 430,
    courses: 2,
    rating: 4.8,
    courseList: [
      { id: '5', title: 'کراتین و صافی مو', image: '/images/salons/05.svg', price: 620000, rating: 4.8 },
    ],
    testimonials: [
      { name: 'پریسا د.', text: 'استاد محمودی درباره کراتین همه چیز می‌دانند.', rating: 5 },
    ],
  },
}

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

export default function InstructorPage({ params }: { params: { slug: string } }) {
  const instructor = MOCK_INSTRUCTORS[params.slug]
  if (!instructor) notFound()

  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--brand-plum-600)', padding: '4rem 0' }}>
        <div className="container-editorial">
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '3rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.3)' }}>
              <Image src={instructor.image} alt={instructor.name} fill style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <span className="eyebrow" style={{ color: 'var(--brand-gold-600)' }}>{instructor.specialty}</span>
              <h1 className="text-display-md" style={{ color: '#fff', marginTop: '0.5rem' }}>{instructor.name}</h1>
              <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem', lineHeight: 1.9, maxWidth: '600px' }}>
                {instructor.bio}
              </p>
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', marginTop: '1rem' }}>
                {renderStars(instructor.rating)}
                <span className="text-body-sm" style={{ color: 'rgba(255,255,255,0.75)', marginRight: '0.25rem' }}>{instructor.rating} امتیاز</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ backgroundColor: '#fff', padding: '2rem 0', borderBottom: '1px solid var(--ui-gray-200)' }}>
        <div className="container-editorial">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '600px' }}>
            {[
              { icon: <Award size={22} />, value: `${instructor.experience} سال`, label: 'سابقه' },
              { icon: <Users size={22} />, value: instructor.students.toLocaleString('fa-IR'), label: 'دانشجو' },
              { icon: <BookOpen size={22} />, value: instructor.courses, label: 'دوره' },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ color: 'var(--brand-plum-600)' }}>{stat.icon}</div>
                <div>
                  <div className="text-h3" style={{ color: 'var(--brand-plum-600)' }}>{stat.value}</div>
                  <div className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="section-editorial">
        <div className="container-editorial">
          <h2 className="text-h2" style={{ marginBottom: '2rem' }}>دوره‌های این مدرس</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {instructor.courseList.map((course) => (
              <Link key={course.id} href={`/academy/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ backgroundColor: '#fff', borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid var(--ui-gray-200)' }}>
                  <div style={{ position: 'relative', height: '180px' }}>
                    <Image src={course.image} alt={course.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div className="text-body" style={{ fontWeight: 700 }}>{course.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.875rem' }}>
                      <span className="text-body" style={{ color: 'var(--brand-plum-600)', fontWeight: 700 }}>
                        {course.price.toLocaleString('fa-IR')} تومان
                      </span>
                      {renderStars(course.rating)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-editorial" style={{ backgroundColor: 'var(--bg-ivory-soft)' }}>
        <div className="container-editorial">
          <h2 className="text-h2" style={{ marginBottom: '2rem' }}>نظر دانشجویان</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {instructor.testimonials.map((t, i) => (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--ui-gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="text-body" style={{ fontWeight: 700 }}>{t.name}</span>
                  {renderStars(t.rating)}
                </div>
                <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

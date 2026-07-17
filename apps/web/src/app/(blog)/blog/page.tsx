import Image from 'next/image'
import Link from 'next/link'
import { Clock, User } from 'lucide-react'

const ARTICLES = [
  {
    slug: 'best-haircut-styles-2024',
    title: 'بهترین مدل موهای مردانه در ۱۴۰۳',
    excerpt: 'امسال چه مدل‌هایی ترند هستند؟ از فید تا تیپ‌فید، کامل‌ترین راهنمای مدل مو مردانه ۱۴۰۳ را بخوانید.',
    category: 'ترند',
    author: 'سارا محمدی',
    date: '۱۵ دی ۱۴۰۳',
    image: '/images/salons/01.svg',
    readTime: '۵ دقیقه',
  },
  {
    slug: 'how-to-choose-right-salon',
    title: 'چطور بهترین آرایشگاه را انتخاب کنیم؟',
    excerpt: 'راهنمای جامع برای انتخاب آرایشگاهی که متناسب با سلیقه و نیازهای شماست. نکاتی که باید بدانید.',
    category: 'راهنما',
    author: 'علی رضایی',
    date: '۱۰ دی ۱۴۰۳',
    image: '/images/salons/02.svg',
    readTime: '۷ دقیقه',
  },
  {
    slug: 'hair-care-winter-tips',
    title: 'مراقبت از مو در فصل زمستان',
    excerpt: 'سرما و رطوبت کم هوا می‌تواند به موها آسیب بزند. با این نکات ساده موهایی سالم و براق داشته باشید.',
    category: 'نکات',
    author: 'مریم کریمی',
    date: '۵ دی ۱۴۰۳',
    image: '/images/salons/03.svg',
    readTime: '۴ دقیقه',
  },
  {
    slug: 'beard-grooming-guide',
    title: 'راهنمای کامل آراستن ریش',
    excerpt: 'از کوتاه کردن تا فرم دادن، همه چیز درباره مراقبت از ریش را در این مقاله بخوانید.',
    category: 'راهنما',
    author: 'نیما حسینی',
    date: '۲۸ آذر ۱۴۰۳',
    image: '/images/salons/04.svg',
    readTime: '۶ دقیقه',
  },
  {
    slug: 'nail-art-inspiration-2024',
    title: '۲۰ ایده الهام‌بخش برای ناخن ۱۴۰۳',
    excerpt: 'جدیدترین طرح‌های ناخن که امسال دیده می‌شوند. از مینیمال تا هنری، برای هر سلیقه‌ای.',
    category: 'الهام',
    author: 'سارا احمدی',
    date: '۲۰ آذر ۱۴۰۳',
    image: '/images/salons/05.svg',
    readTime: '۳ دقیقه',
  },
  {
    slug: 'makeup-natural-look',
    title: 'آموزش میکاپ ساده و طبیعی',
    excerpt: 'ظاهری زیبا و طبیعی با کمترین محصول. گام به گام یاد بگیرید چطور میکاپ بی‌نقص داشته باشید.',
    category: 'نکات',
    author: 'لیلا حسن‌پور',
    date: '۱۵ آذر ۱۴۰۳',
    image: '/images/salons/06.svg',
    readTime: '۸ دقیقه',
  },
]

const CATEGORIES = ['همه', 'راهنما', 'ترند', 'نکات', 'الهام']

const CATEGORY_COLORS: Record<string, string> = {
  راهنما: 'var(--brand-plum-600)',
  ترند: 'var(--brand-gold-600)',
  نکات: 'var(--brand-navy-600)',
  الهام: '#059669',
}

export default function BlogPage() {
  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--brand-plum-600)', padding: '5rem 0' }}>
        <div className="container-editorial" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--brand-gold-600)' }}>محتوای تخصصی</span>
          <h1 className="text-display-lg" style={{ color: '#fff', marginTop: '0.75rem' }}>مجله پرنگارین</h1>
          <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.75)', marginTop: '1rem' }}>
            آخرین ترندها، راهنماها و نکات زیبایی از متخصصان برتر
          </p>
        </div>
      </section>

      {/* Categories */}
      <div style={{ borderBottom: '1px solid var(--ui-gray-200)', backgroundColor: '#fff' }}>
        <div className="container-editorial" style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', overflowX: 'auto' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '2rem',
                border: cat === 'همه' ? 'none' : '1.5px solid var(--ui-gray-200)',
                backgroundColor: cat === 'همه' ? 'var(--brand-plum-600)' : 'transparent',
                color: cat === 'همه' ? '#fff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <section className="section-editorial">
        <div className="container-editorial">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
            }}
          >
            {ARTICLES.map((article) => (
              <article
                key={article.slug}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  border: '1px solid var(--ui-gray-200)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <Image src={article.image} alt={article.title} fill style={{ objectFit: 'cover' }} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: CATEGORY_COLORS[article.category] || 'var(--brand-plum-600)',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '2rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {article.category}
                  </span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h2 className="text-h3" style={{ fontSize: '1.0625rem', lineHeight: 1.6 }}>
                    {article.title}
                  </h2>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '0.625rem', lineHeight: 1.8 }}>
                    {article.excerpt}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '1.25rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--ui-gray-100)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{article.author}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{article.readTime}</span>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${article.slug}`}
                    style={{
                      display: 'block',
                      marginTop: '1rem',
                      textAlign: 'center',
                      padding: '0.625rem',
                      borderRadius: '0.625rem',
                      backgroundColor: 'var(--bg-ivory-soft)',
                      color: 'var(--brand-plum-600)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      border: '1px solid var(--ui-gray-200)',
                    }}
                  >
                    ادامه مطلب ←
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  border: page === 1 ? 'none' : '1.5px solid var(--ui-gray-200)',
                  backgroundColor: page === 1 ? 'var(--brand-plum-600)' : 'transparent',
                  color: page === 1 ? '#fff' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

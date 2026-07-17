import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, User, Calendar, ArrowRight } from 'lucide-react'

const MOCK_ARTICLES: Record<string, {
  title: string
  author: string
  date: string
  category: string
  image: string
  content: string[]
  related: string[]
}> = {
  'best-haircut-styles-2024': {
    title: 'بهترین مدل موهای مردانه در ۱۴۰۳',
    author: 'سارا محمدی',
    date: '۱۵ دی ۱۴۰۳',
    category: 'ترند',
    image: '/images/salons/01.svg',
    content: [
      'سال ۱۴۰۳ سال ظهور مدل‌های کلاسیک با تفسیر مدرن است. فید (Fade) همچنان یکی از محبوب‌ترین مدل‌هاست اما این بار با جزئیات دقیق‌تر و خطوط تمیزتر. تیپ‌فید که موها را از خط ظریفی در پایین شروع می‌کند و به آرامی بلندتر می‌شود، انتخاب اول جوانان شهری است.',
      'مدل تکستور (Texture) که موها را با حرکت طبیعی نشان می‌دهد امسال بسیار محبوب شده است. این مدل برای کسانی که موهای نسبتاً ضخیم یا فر دارند ایده‌آل است. با استفاده از پمادهای سبک می‌توان این مدل را تثبیت کرد بدون اینکه حالت سخت به موها بدهد.',
      'مدل کلاسیک پارت ساید (Side Part) نیز بازگشته است؛ این بار نه به شکل خشک و رسمی دهه‌های قبل، بلکه با طراوتی که آن را برای استفاده روزمره و مجالس رسمی یکسان مناسب می‌کند. برای داشتن این مدل، موهای پهلو را کوتاه‌تر نگه دارید و روی فرق باریکی ایجاد کنید.',
    ],
    related: ['how-to-choose-right-salon', 'beard-grooming-guide'],
  },
  'how-to-choose-right-salon': {
    title: 'چطور بهترین آرایشگاه را انتخاب کنیم؟',
    author: 'علی رضایی',
    date: '۱۰ دی ۱۴۰۳',
    category: 'راهنما',
    image: '/images/salons/02.svg',
    content: [
      'انتخاب یک آرایشگاه خوب فراتر از نزدیکی آن به خانه یا ارزانی قیمت است. اول از همه به نظرات دیگران توجه کنید. یک آرایشگاه با ۴.۵ ستاره و ۱۰۰ نظر واقعی خیلی قابل‌اعتمادتر از جایی با کمتر از ۱۰ نظر است.',
      'نمونه کارهای آرایشگر را بررسی کنید. اکثر آرایشگاه‌های حرفه‌ای در شبکه‌های اجتماعی نمونه کار دارند. ببینید که آیا سبک آن‌ها با آنچه در ذهن دارید مطابقت دارد یا نه. صحبت کردن با آرایشگر قبل از شروع کار هم بسیار مهم است.',
      'به تمیزی و بهداشت محیط توجه ویژه داشته باشید. ابزارهای استریل، محیط تمیز، و رعایت پروتکل‌های بهداشتی نشانه‌ی یک سالن حرفه‌ای است. اگر در اولین نگاه به جایی اعتماد نکردید، به احساس خود گوش بدهید.',
    ],
    related: ['best-haircut-styles-2024', 'hair-care-winter-tips'],
  },
  'hair-care-winter-tips': {
    title: 'مراقبت از مو در فصل زمستان',
    author: 'مریم کریمی',
    date: '۵ دی ۱۴۰۳',
    category: 'نکات',
    image: '/images/salons/03.svg',
    content: [
      'زمستان با سرما، رطوبت کم، و استفاده مداوم از بخاری و کولر، دشمن اصلی سلامت موهاست. یکی از مهم‌ترین کارهایی که می‌توانید انجام دهید استفاده از شامپو و نرم‌کننده مخصوص موهای خشک است. این محصولات رطوبت بیشتری به موها می‌رسانند.',
      'ماسک مو یکی از بهترین روش‌های مراقبت در زمستان است. حداقل یک بار در هفته از ماسک‌های مغذی استفاده کنید. روغن‌های طبیعی مثل روغن آرگان، روغن نارگیل، و روغن زیتون برای موهای آسیب‌دیده بسیار مفیدند.',
      'از استفاده مکرر از ابزارهای گرمادهنده مثل سشوار، اتو مو، و فر مو در زمستان بپرهیزید. اگر ناچار به استفاده هستید، حتماً از اسپری محافظ حرارتی قبل از استفاده روی موها بزنید. همچنین در فضای باز از کلاه استفاده کنید تا موها از سرما و رطوبت محافظت شوند.',
    ],
    related: ['best-haircut-styles-2024', 'makeup-natural-look'],
  },
  'beard-grooming-guide': {
    title: 'راهنمای کامل آراستن ریش',
    author: 'نیما حسینی',
    date: '۲۸ آذر ۱۴۰۳',
    category: 'راهنما',
    image: '/images/salons/04.svg',
    content: [
      'ریش خوب نگه داشته شده یکی از بهترین ویژگی‌های ظاهری یک مرد است. اما بدون مراقبت، ریش می‌تواند ظاهر نامرتب و ژولیده ایجاد کند. اولین قدم تعیین شکل صورت شماست. ریش‌های مختلف با فرم‌های مختلف صورت می‌آیند.',
      'برای کوتاه کردن ریش به ماشین ریش با شانه‌های مختلف نیاز دارید. شروع کنید از طولانی‌ترین شانه و به تدریج کوتاه‌تر کنید تا به طول دلخواه برسید. برای خطوط دقیق کنار ریش از تیغ یا ریش‌تراش دستی استفاده کنید.',
      'مراقبت از ریش به اندازه مراقبت از مو اهمیت دارد. روغن ریش، بالزام ریش، و شانه مخصوص ریش ابزارهای ضروری هستند. روزانه ریش را شانه بزنید و هفته‌ای یک بار با شامپو ریش بشویید. با این مراقبت‌های ساده ریش شما همیشه نرم و براق خواهد بود.',
    ],
    related: ['best-haircut-styles-2024', 'how-to-choose-right-salon'],
  },
  'nail-art-inspiration-2024': {
    title: '۲۰ ایده الهام‌بخش برای ناخن ۱۴۰۳',
    author: 'سارا احمدی',
    date: '۲۰ آذر ۱۴۰۳',
    category: 'الهام',
    image: '/images/salons/05.svg',
    content: [
      'هنر ناخن در سال ۱۴۰۳ به سطح جدیدی از خلاقیت رسیده است. از طرح‌های هندسی ساده تا نقاشی‌های مینیاتوری پیچیده، هر زنی می‌تواند سبک مخصوص خود را پیدا کند. یکی از ترندهای اصلی امسال، ناخن‌های مینیمال با رنگ‌های خاکی و طبیعی است.',
      'فرنچ ماندارین (Mandarin French) که به جای خط سفید رنگ‌های پاستلی استفاده می‌کند، بسیار محبوب شده است. رنگ‌های هلویی، لیلایی، و آبی کمرنگ برای این استایل فوق‌العاده‌اند. این ظاهر هم ظریف است و هم مدرن.',
      'برای کسانی که جرئت تجربه دارند، ناخن‌های سه‌بعدی با تزئینات گل، جواهر، و اشکال هندسی برجسته انتخابی جذاب است. البته این نوع ناخن به متخصص ماهر نیاز دارد. با استفاده از پرنگارین می‌توانید بهترین ناخن‌کار شهر خود را پیدا کنید.',
    ],
    related: ['makeup-natural-look', 'hair-care-winter-tips'],
  },
  'makeup-natural-look': {
    title: 'آموزش میکاپ ساده و طبیعی',
    author: 'لیلا حسن‌پور',
    date: '۱۵ آذر ۱۴۰۳',
    category: 'نکات',
    image: '/images/salons/06.svg',
    content: [
      'میکاپ طبیعی که به آن No-Makeup Makeup هم می‌گویند، هنر پنهان کردن کاستی‌ها بدون اینکه آرایش کرده به نظر برسید. نکته کلیدی در این میکاپ انتخاب بیس مناسب است. از پرایمر برای صافی پوست استفاده کنید، سپس فونداسیون سبک با پوشش متوسط.',
      'برای چشم‌ها کافی است رنگ‌های نزدیک به پوست را انتخاب کنید. سایه‌های کرمی، بژ، و قهوه‌ای روشن به چشم‌ها عمق می‌دهند بدون اینکه آرایش کرده به نظر برسند. ریمل حجم‌دهنده به جای ریمل غلیظ انتخاب بهتری است.',
      'لب‌ها را با رنگ‌های نزدیک به رنگ طبیعی لب کامل کنید. رژلب‌های MLBB (My Lips But Better) که رنگ لب طبیعی را کمی تقویت می‌کنند، برای این استایل ایده‌آل هستند. با ست کردن در نهایت با اسپری فیکساتور، آرایشتان تا آخر روز ماندگار خواهد بود.',
    ],
    related: ['nail-art-inspiration-2024', 'hair-care-winter-tips'],
  },
}

const ALL_ARTICLES = [
  { slug: 'best-haircut-styles-2024', title: 'بهترین مدل موهای مردانه در ۱۴۰۳', image: '/images/salons/01.svg', category: 'ترند' },
  { slug: 'how-to-choose-right-salon', title: 'چطور بهترین آرایشگاه را انتخاب کنیم؟', image: '/images/salons/02.svg', category: 'راهنما' },
  { slug: 'hair-care-winter-tips', title: 'مراقبت از مو در فصل زمستان', image: '/images/salons/03.svg', category: 'نکات' },
  { slug: 'beard-grooming-guide', title: 'راهنمای کامل آراستن ریش', image: '/images/salons/04.svg', category: 'راهنما' },
  { slug: 'nail-art-inspiration-2024', title: '۲۰ ایده الهام‌بخش برای ناخن ۱۴۰۳', image: '/images/salons/05.svg', category: 'الهام' },
  { slug: 'makeup-natural-look', title: 'آموزش میکاپ ساده و طبیعی', image: '/images/salons/06.svg', category: 'نکات' },
]

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = MOCK_ARTICLES[params.slug]
  if (!article) notFound()

  const related = ALL_ARTICLES.filter((a) => article.related.includes(a.slug))

  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh' }}>
      {/* Hero image */}
      <div style={{ position: 'relative', height: '60vh', overflow: 'hidden' }}>
        <Image src={article.image} alt={article.title} fill style={{ objectFit: 'cover' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
          }}
        />
        <div
          className="container-editorial"
          style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', width: '100%' }}
        >
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
            {article.category}
          </span>
          <h1 className="text-display-md" style={{ color: '#fff' }}>{article.title}</h1>
        </div>
      </div>

      {/* Meta */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--ui-gray-200)' }}>
        <div
          className="container-editorial"
          style={{ display: 'flex', gap: '2rem', padding: '1.25rem 1.5rem', flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{article.author}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{article.date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>۵ دقیقه مطالعه</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="section-editorial">
        <div className="container-editorial" style={{ maxWidth: '760px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {article.content.map((para, i) => (
              <p key={i} className="text-body-lg" style={{ color: 'var(--color-text)', lineHeight: 2.1 }}>
                {para}
              </p>
            ))}
          </div>

          <div
            style={{
              marginTop: '3rem',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-ivory-soft)',
              borderRadius: '1rem',
              borderRight: '4px solid var(--brand-plum-600)',
            }}
          >
            <p className="text-body" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', lineHeight: 2 }}>
              این مقاله توسط تیم تحریریه پرنگارین نوشته شده است. برای رزرو خدمات زیبایی به‌صورت آنلاین به سایت مراجعه کنید.
            </p>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="section-editorial" style={{ backgroundColor: 'var(--bg-ivory-soft)' }}>
        <div className="container-editorial">
          <h2 className="text-h2" style={{ marginBottom: '2rem' }}>مطالب مرتبط</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '700px' }}>
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    border: '1px solid var(--ui-gray-200)',
                  }}
                >
                  <div style={{ position: 'relative', height: '140px' }}>
                    <Image src={rel.image} alt={rel.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <span className="text-caption" style={{ color: 'var(--brand-plum-600)', fontWeight: 700 }}>{rel.category}</span>
                    <div className="text-body-sm" style={{ fontWeight: 600, marginTop: '0.25rem', lineHeight: 1.6 }}>{rel.title}</div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--brand-plum-600)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        marginTop: '0.5rem',
                      }}
                    >
                      بیشتر بخوانید <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

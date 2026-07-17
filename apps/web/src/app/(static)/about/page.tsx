import Image from 'next/image'
import { Shield, Star, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <main dir="rtl" style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{ backgroundColor: 'var(--brand-plum-600)', color: 'var(--color-primary-foreground)' }}
        className="section-editorial"
      >
        <div className="container-editorial">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--brand-gold-600)' }}>داستان ما</span>
              <h1 className="text-display-lg" style={{ color: '#fff', marginTop: '1rem' }}>درباره پرنگارین</h1>
              <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1.5rem', lineHeight: 2 }}>
                پرنگارین پلتفرمی است که آرایشگاه‌های ایران را به مشتریان خود متصل می‌کند؛ جایی که کیفیت، سادگی و اعتماد در کنار هم معنا پیدا می‌کنند.
              </p>
            </div>
            <div style={{ position: 'relative', height: '380px', borderRadius: '1.5rem', overflow: 'hidden' }}>
              <Image src="/images/hero/02.svg" alt="درباره پرنگارین" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-editorial">
        <div className="container-editorial">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            <div>
              <span className="eyebrow">چگونه شروع شد</span>
              <h2 className="text-h2" style={{ marginTop: '0.75rem' }}>از ایده تا واقعیت</h2>
              <p className="text-body" style={{ color: 'var(--color-text-muted)', marginTop: '1.5rem', lineHeight: 2 }}>
                پرنگارین در سال ۱۴۰۱ با یک ایده ساده آغاز شد: چرا پیدا کردن یک آرایشگر ماهر باید این‌قدر سخت باشد؟ گروهی از علاقه‌مندان به فناوری و صنعت زیبایی دور هم جمع شدند تا این مشکل را حل کنند.
              </p>
              <p className="text-body" style={{ color: 'var(--color-text-muted)', marginTop: '1rem', lineHeight: 2 }}>
                ما باور داریم که هر نفر لایق بهترین تجربه آرایشی است؛ نه تنها در شهرهای بزرگ، بلکه در هر گوشه‌ای از ایران. به همین دلیل پلتفرمی ساختیم که آرایشگران متخصص را با مشتریان جدی مرتبط می‌کند.
              </p>
              <p className="text-body" style={{ color: 'var(--color-text-muted)', marginTop: '1rem', lineHeight: 2 }}>
                امروز پرنگارین با بیش از ۵۰۰ سالن در سراسر کشور و ده‌ها هزار مشتری راضی، یکی از بزرگ‌ترین پلتفرم‌های رزرو آنلاین صنعت زیبایی ایران است.
              </p>
            </div>
            <div style={{ backgroundColor: 'var(--bg-ivory-soft)', borderRadius: '1.5rem', padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {[
                  { num: '۵۰۰+', label: 'سالن فعال' },
                  { num: '۵۰هزار+', label: 'مشتری راضی' },
                  { num: '۱۲۰+', label: 'شهر تحت پوشش' },
                  { num: '۴.۸', label: 'میانگین امتیاز' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      textAlign: 'center',
                      border: '1px solid var(--ui-gray-200)',
                    }}
                  >
                    <div className="text-display-md" style={{ color: 'var(--brand-plum-600)', fontWeight: 700 }}>{stat.num}</div>
                    <div className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-editorial" style={{ backgroundColor: 'var(--bg-ivory-soft)' }}>
        <div className="container-editorial">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow">ارزش‌های ما</span>
            <h2 className="text-h2" style={{ marginTop: '0.75rem' }}>آنچه به آن اعتقاد داریم</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              {
                icon: <Shield size={32} />,
                title: 'کیفیت',
                desc: 'تنها سالن‌هایی که استانداردهای کیفی ما را برآورده می‌کنند در پلتفرم حضور دارند. ما هر آرایشگاه را پیش از پذیرش ارزیابی می‌کنیم.',
              },
              {
                icon: <Star size={32} />,
                title: 'اعتماد',
                desc: 'نظرات واقعی، قیمت‌های شفاف، و پشتیبانی ۲۴ ساعته. مشتریان باید بدانند که می‌توانند به پرنگارین اتکا کنند.',
              },
              {
                icon: <Zap size={32} />,
                title: 'نوآوری',
                desc: 'از رزرو آنلاین تا آموزش دیجیتال، ما دائماً در حال بهبود تجربه کاربری و ابزارهای مدیریت سالن‌ها هستیم.',
              },
            ].map((val) => (
              <div
                key={val.title}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  border: '1px solid var(--ui-gray-200)',
                }}
              >
                <div style={{ color: 'var(--brand-plum-600)', marginBottom: '1rem' }}>{val.icon}</div>
                <h3 className="text-h3">{val.title}</h3>
                <p className="text-body" style={{ color: 'var(--color-text-muted)', marginTop: '0.75rem', lineHeight: 2 }}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-editorial">
        <div className="container-editorial">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow">تیم ما</span>
            <h2 className="text-h2" style={{ marginTop: '0.75rem' }}>افرادی که پرنگارین را می‌سازند</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {[
              { img: '/images/instructors/01.svg', name: 'سارا احمدی', role: 'مدیرعامل' },
              { img: '/images/instructors/02.svg', name: 'علی رضایی', role: 'مدیر فناوری' },
              { img: '/images/instructors/03.svg', name: 'مریم کریمی', role: 'مدیر بازاریابی' },
              { img: '/images/instructors/04.svg', name: 'نیما حسینی', role: 'مدیر محصول' },
            ].map((member) => (
              <div
                key={member.name}
                style={{
                  backgroundColor: 'var(--bg-ivory-soft)',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  border: '1px solid var(--ui-gray-200)',
                }}
              >
                <div style={{ position: 'relative', height: '220px' }}>
                  <Image src={member.img} alt={member.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div className="text-body" style={{ fontWeight: 600 }}>{member.name}</div>
                  <div className="text-caption" style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-editorial" style={{ backgroundColor: 'var(--brand-navy-600)' }}>
        <div className="container-editorial" style={{ textAlign: 'center' }}>
          <h2 className="text-display-md" style={{ color: '#fff' }}>آماده‌ای شروع کنی؟</h2>
          <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.75)', marginTop: '1rem', marginBottom: '2rem' }}>
            بهترین سالن‌های اطرافت را کشف کن و همین الان رزرو کن.
          </p>
          <a
            href="/salons"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--brand-gold-600)',
              color: '#fff',
              padding: '0.875rem 2.5rem',
              borderRadius: '0.75rem',
              fontWeight: 700,
              fontSize: '1.0625rem',
              textDecoration: 'none',
            }}
          >
            مشاهده سالن‌ها
          </a>
        </div>
      </section>
    </main>
  )
}

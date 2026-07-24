'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, Star, Users, Clock, Award, ChevronLeft, BookOpen } from 'lucide-react';
import { INSTRUCTOR_AVATARS, COURSE_COVERS } from '@/lib/images';

const INSTRUCTORS = [
  {
    id: 'i1', name: 'سارا کریمی', title: 'متخصص رنگ و کراتین', avatar: INSTRUCTOR_AVATARS[0],
    courses: 4, students: 1240, rating: 4.9,
  },
  {
    id: 'i2', name: 'مریم رضایی', title: 'آموزشگر آرایش عروس', avatar: INSTRUCTOR_AVATARS[1],
    courses: 6, students: 2100, rating: 4.8,
  },
  {
    id: 'i3', name: 'نازنین احمدی', title: 'متخصص ناخن و طراحی', avatar: INSTRUCTOR_AVATARS[2],
    courses: 3, students: 890, rating: 4.7,
  },
];

const COURSES = [
  {
    id: 'c1', title: 'رنگ‌آمیزی حرفه‌ای مو', instructor: 'سارا کریمی',
    price: 1_200_000, level: 'پیشرفته', duration: '۱۸ ساعت', students: 342,
    rating: 4.9, tag: 'پرفروش', cover: COURSE_COVERS[0],
  },
  {
    id: 'c2', title: 'آرایش عروس مدرن', instructor: 'مریم رضایی',
    price: 980_000, level: 'متوسط', duration: '۱۲ ساعت', students: 218,
    rating: 4.8, tag: 'جدید', cover: COURSE_COVERS[1],
  },
  {
    id: 'c3', title: 'طراحی ناخن ۳D', instructor: 'نازنین احمدی',
    price: 750_000, level: 'مبتدی', duration: '۸ ساعت', students: 156,
    rating: 4.7, tag: '', cover: COURSE_COVERS[2],
  },
  {
    id: 'c4', title: 'کراتین و صافی بدون دود', instructor: 'سارا کریمی',
    price: 1_500_000, level: 'پیشرفته', duration: '۲۴ ساعت', students: 89,
    rating: 5.0, tag: 'پرامتیاز', cover: COURSE_COVERS[3],
  },
  {
    id: 'c5', title: 'مراقبت از پوست (فیشیال)', instructor: 'مریم رضایی',
    price: 680_000, level: 'مبتدی', duration: '۶ ساعت', students: 204,
    rating: 4.6, tag: '', cover: COURSE_COVERS[4],
  },
  {
    id: 'c6', title: 'برش و پیرایش مردانه کلاسیک', instructor: 'احمد موسوی',
    price: 890_000, level: 'متوسط', duration: '۱۰ ساعت', students: 117,
    rating: 4.8, tag: 'جدید', cover: COURSE_COVERS[5],
  },
];

const LEVEL_COLORS: Record<string, string> = {
  'مبتدی': 'rgba(39,174,96,0.12)', 'متوسط': 'rgba(230,126,34,0.12)', 'پیشرفته': 'rgba(75,36,74,0.12)',
};
const LEVEL_TEXT: Record<string, string> = {
  'مبتدی': '#27AE60', 'متوسط': '#E67E22', 'پیشرفته': 'var(--brand-plum-600)',
};

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function InstructorCard({ inst }: { inst: typeof INSTRUCTORS[0] }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal flex gap-4 rounded-2xl border p-5"
      style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
      <img src={inst.avatar} alt={inst.name}
        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
        style={{ border: '2px solid var(--brand-gold-400)' }} />
      <div>
        <h3 className="font-semibold text-base mb-0.5" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>{inst.name}</h3>
        <p className="text-xs mb-2" style={{ color: 'var(--ui-gray-500)' }}>{inst.title}</p>
        <div className="flex gap-3 text-xs" style={{ color: 'var(--ui-gray-500)' }}>
          <span className="flex items-center gap-1"><Star size={11} fill="var(--brand-gold-600)" style={{ color: 'var(--brand-gold-600)' }} />{inst.rating}</span>
          <span className="flex items-center gap-1"><Users size={11} />{inst.students.toLocaleString('fa-IR')} دانشجو</span>
          <span className="flex items-center gap-1"><BookOpen size={11} />{inst.courses} دوره</span>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: typeof COURSES[0] }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal group rounded-2xl border overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
        <img src={course.cover} alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {course.tag && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}>
            {course.tag}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(75,36,74,0.5)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'white' }}>
            <Play size={22} fill="var(--brand-plum-600)" style={{ color: 'var(--brand-plum-600)', marginRight: '-2px' }} />
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: LEVEL_COLORS[course.level], color: LEVEL_TEXT[course.level] }}>
            {course.level}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--ui-gray-500)' }}>
            <Clock size={12} />{course.duration}
          </span>
        </div>
        <h3 className="text-base font-semibold mb-1 leading-snug" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
          {course.title}
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--ui-gray-500)' }}>{course.instructor}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={13} fill="var(--brand-gold-600)" style={{ color: 'var(--brand-gold-600)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--brand-navy-600)' }}>{course.rating}</span>
            <span className="text-xs" style={{ color: 'var(--ui-gray-500)' }}>({course.students.toLocaleString('fa-IR')})</span>
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--brand-plum-600)' }}>
            {course.price.toLocaleString('fa-IR')} تومان
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AcademyPage() {
  const [activeFilter, setActiveFilter] = useState('همه');
  const heroRef = useReveal();
  const filters = ['همه', 'مبتدی', 'متوسط', 'پیشرفته'];

  const filtered = activeFilter === 'همه' ? COURSES : COURSES.filter(c => c.level === activeFilter);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-ivory)' }}>

      {/* Hero */}
      <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: 'var(--brand-plum-600)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, var(--brand-gold-600) 0%, transparent 60%)' }} />
        <div ref={heroRef} className="reveal container-editorial relative">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4" style={{ color: 'var(--brand-gold-400)' }}>آکادمی پرنگارین</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6"
              style={{ color: 'var(--bg-ivory)', fontFamily: 'var(--font-display)' }}>
              یاد بگیر،<br />
              <span style={{ color: 'var(--brand-gold-400)' }}>حرفه‌ای</span> شو
            </h1>
            <p className="text-lg mb-10 leading-relaxed max-w-xl" style={{ color: 'rgba(250,247,242,0.75)' }}>
              دوره‌های تخصصی آرایشگری از بهترین استادان ایران. آنلاین، در هر ساعتی از شبانه‌روز.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}>
                <BookOpen size={18} /> مشاهده دوره‌ها
              </a>
              <Link href="/academy/become-instructor"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border"
                style={{ borderColor: 'rgba(250,247,242,0.3)', color: 'var(--bg-ivory)' }}>
                ثبت‌نام به عنوان مدرس
              </Link>
            </div>

            <div className="flex gap-8 mt-14">
              {[['۱۸+', 'دوره تخصصی'], ['۶٬۵۰۰+', 'دانشجو'], ['۱۲', 'مدرس برتر']].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold" style={{ color: 'var(--brand-gold-400)', fontFamily: 'var(--font-display)' }}>{v}</p>
                  <p className="text-sm" style={{ color: 'rgba(250,247,242,0.6)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="section-editorial">
        <div className="container-editorial">
          <p className="eyebrow mb-2">مدرسان</p>
          <h2 className="text-3xl font-bold mb-10" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
            یاد بگیر از بهترین‌ها
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {INSTRUCTORS.map(inst => <InstructorCard key={inst.id} inst={inst} />)}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="section-editorial" style={{ background: 'white' }}>
        <div className="container-editorial">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="eyebrow mb-2">دوره‌ها</p>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
                شروع یادگیری
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  style={{
                    background: activeFilter === f ? 'var(--brand-plum-600)' : 'transparent',
                    borderColor: activeFilter === f ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)',
                    color: activeFilter === f ? 'white' : 'var(--brand-navy-600)',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-editorial" style={{ background: 'var(--brand-rose-600, #C0392B)' }}>
        <div className="container-editorial text-center">
          <Award size={40} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.7)' }} strokeWidth={1} />
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'white', fontFamily: 'var(--font-display)' }}>
            خودت مدرس شو
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
            مهارتت را با هزاران نفر در سراسر ایران به اشتراک بگذار. ۷۰٪ درآمد دوره‌هایت مستقیم به حسابت می‌رسد.
          </p>
          <Link href="/academy/become-instructor"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--brand-plum-600)', color: 'white' }}>
            درخواست مدرس شدن <ChevronLeft size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

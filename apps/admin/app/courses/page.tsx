'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Search, CheckCircle, XCircle, GraduationCap, Clock, Users, Star } from 'lucide-react';

const MOCK_COURSES = [
  { id: 'c1', title: 'رنگ و هایلایت حرفه‌ای', instructor: 'نازنین احمدی', category: 'رنگ', duration: 8, lessons: 24, students: 0, price: 890000, rating: 0, status: 'PENDING_REVIEW', createdAt: '۱۴۰۳/۱۰/۱۵' },
  { id: 'c2', title: 'میکاپ عروس ایرانی',      instructor: 'سارا کریمی',   category: 'میکاپ', duration: 6, lessons: 18, students: 234, price: 650000, rating: 4.8, status: 'PUBLISHED',     createdAt: '۱۴۰۳/۰۸/۲۰' },
  { id: 'c3', title: 'کراتین و بوتاکس مو',     instructor: 'مریم رضایی',  category: 'مو',    duration: 4, lessons: 12, students: 89,  price: 450000, rating: 4.6, status: 'PUBLISHED',     createdAt: '۱۴۰۳/۰۷/۱۰' },
  { id: 'c4', title: 'ناخن اکریلیک پیشرفته',   instructor: 'زهرا موسوی',  category: 'ناخن',  duration: 5, lessons: 15, students: 0,  price: 550000, rating: 0,   status: 'PENDING_REVIEW', createdAt: '۱۴۰۳/۱۰/۱۸' },
  { id: 'c5', title: 'کوتاهی مدرن مردانه',     instructor: 'علی رستمی',   category: 'مو',    duration: 3, lessons: 10, students: 0,  price: 380000, rating: 0,   status: 'PENDING_REVIEW', createdAt: '۱۴۰۳/۱۰/۱۹' },
  { id: 'c6', title: 'اپیلاسیون و موم‌کاری',   instructor: 'فاطمه نوری',  category: 'پوست',  duration: 4, lessons: 12, students: 156, price: 420000, rating: 4.5, status: 'PUBLISHED',     createdAt: '۱۴۰۳/۰۶/۰۵' },
  { id: 'c7', title: 'هنر وصل موی طبیعی',     instructor: 'لیلا صادقی',  category: 'مو',    duration: 10, lessons: 30, students: 0, price: 1200000, rating: 0,  status: 'REJECTED',      createdAt: '۱۴۰۳/۰۹/۲۵' },
];

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  PENDING_REVIEW: { label: 'در انتظار بررسی', bg: 'rgba(216,183,106,0.15)', color: 'var(--brand-gold-600)' },
  PUBLISHED:      { label: 'منتشر شده',       bg: 'rgba(39,174,96,0.12)',   color: '#27AE60' },
  REJECTED:       { label: 'رد شده',          bg: 'rgba(192,57,43,0.12)',   color: '#C0392B' },
  DRAFT:          { label: 'پیش‌نویس',        bg: 'rgba(74,85,98,0.12)',    color: 'var(--brand-navy-400)' },
};

const TABS = [
  { key: 'ALL', label: 'همه' },
  { key: 'PENDING_REVIEW', label: 'در انتظار' },
  { key: 'PUBLISHED', label: 'منتشر شده' },
  { key: 'REJECTED', label: 'رد شده' },
];

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('ALL');
  const [courses, setCourses] = useState(MOCK_COURSES);

  const pendingCount = courses.filter(c => c.status === 'PENDING_REVIEW').length;

  const filtered = courses.filter(c => {
    const matchSearch = c.title.includes(search) || c.instructor.includes(search);
    const matchTab = tab === 'ALL' || c.status === tab;
    return matchSearch && matchTab;
  });

  const updateStatus = (id: string, status: string) =>
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status } : c));

  const card = { background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: 12 };

  return (
    <AdminShell title="مدیریت دوره‌ها">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'کل دوره‌ها',     value: courses.length },
          { label: 'منتشر شده',      value: courses.filter(c => c.status === 'PUBLISHED').length },
          { label: 'در انتظار',      value: pendingCount },
          { label: 'کل دانشجویان',  value: courses.reduce((a, c) => a + c.students, 0) },
        ].map(stat => (
          <div key={stat.label} style={{ ...card, padding: '16px 20px' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--admin-muted)' }}>{stat.label}</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={card}>
        {/* Tabs + search */}
        <div className="flex items-center gap-0 border-b" style={{ borderColor: 'var(--admin-border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-3.5 text-sm font-medium border-b-2 transition-colors relative"
              style={{
                borderColor: tab === t.key ? 'var(--admin-accent)' : 'transparent',
                color: tab === t.key ? 'var(--admin-accent)' : 'var(--admin-muted)',
              }}>
              {t.label}
              {t.key === 'PENDING_REVIEW' && pendingCount > 0 && (
                <span className="mr-1.5 px-1.5 py-0.5 rounded-full text-xs"
                  style={{ background: 'rgba(216,183,106,0.2)', color: 'var(--brand-gold-600)' }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
          <div className="mr-auto px-4">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجو..."
                className="pr-9 pl-3 py-1.5 text-sm rounded-lg outline-none w-52"
                style={{ background: 'var(--bg-ivory)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
              />
            </div>
          </div>
        </div>

        {/* Course cards grid */}
        <div className="p-4 grid grid-cols-1 gap-3">
          {filtered.length === 0 && (
            <div className="py-16 text-center" style={{ color: 'var(--admin-muted)' }}>
              <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
              <p>دوره‌ای یافت نشد</p>
            </div>
          )}
          {filtered.map(course => {
            const st = STATUS_MAP[course.status];
            return (
              <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl border transition-colors hover:bg-[var(--bg-ivory)]"
                style={{ borderColor: 'var(--admin-border)' }}>
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(31,41,51,0.06)' }}>
                  <GraduationCap size={22} style={{ color: 'var(--brand-navy-600)' }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate" style={{ color: 'var(--admin-text)' }}>{course.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--admin-muted)' }}>مدرس: {course.instructor} · دسته: {course.category}</p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--admin-muted)' }}>
                    <span className="flex items-center gap-1"><Clock size={12} /> {course.duration} ساعت</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {course.lessons} جلسه</span>
                    {course.rating > 0 && <span className="flex items-center gap-1"><Star size={12} /> {course.rating}</span>}
                    {course.students > 0 && <span>{course.students} دانشجو</span>}
                    <span className="mr-auto font-semibold" style={{ color: 'var(--admin-text)' }}>
                      {course.price.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {course.status === 'PENDING_REVIEW' && (
                    <>
                      <button onClick={() => updateStatus(course.id, 'PUBLISHED')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(39,174,96,0.12)', color: '#27AE60' }}>
                        <CheckCircle size={13} /> تأیید
                      </button>
                      <button onClick={() => updateStatus(course.id, 'REJECTED')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(192,57,43,0.1)', color: '#C0392B' }}>
                        <XCircle size={13} /> رد
                      </button>
                    </>
                  )}
                  {course.status === 'PUBLISHED' && (
                    <button onClick={() => updateStatus(course.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(192,57,43,0.1)', color: '#C0392B' }}>
                      حذف از انتشار
                    </button>
                  )}
                  {(course.status === 'REJECTED' || course.status === 'DRAFT') && (
                    <button onClick={() => updateStatus(course.id, 'PUBLISHED')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(39,174,96,0.12)', color: '#27AE60' }}>
                      انتشار
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}

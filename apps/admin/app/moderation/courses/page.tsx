'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { CheckCircle, XCircle, Eye, GraduationCap, Star, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_COURSES = [
  {
    id: 'c1', title: 'رنگ‌آمیزی حرفه‌ای مو', instructor: 'سارا کریمی',
    level: 'پیشرفته', duration: '۱۸ ساعت', price: 1_200_000,
    status: 'PENDING_REVIEW', submittedAt: '۱۴۰۳/۱۰/۱۱', lessons: 24, rating: null,
  },
  {
    id: 'c2', title: 'آرایش عروس مدرن', instructor: 'مریم رضایی',
    level: 'متوسط', duration: '۱۲ ساعت', price: 980_000,
    status: 'PENDING_REVIEW', submittedAt: '۱۴۰۳/۱۰/۱۰', lessons: 16, rating: null,
  },
  {
    id: 'c3', title: 'کراتین بدون دود', instructor: 'سارا کریمی',
    level: 'پیشرفته', duration: '۲۴ ساعت', price: 1_500_000,
    status: 'PUBLISHED', submittedAt: '۱۴۰۳/۱۰/۰۵', lessons: 30, rating: 4.9,
  },
  {
    id: 'c4', title: 'ناخن ژل پایه', instructor: 'نازنین احمدی',
    level: 'مبتدی', duration: '۸ ساعت', price: 650_000,
    status: 'REJECTED', submittedAt: '۱۴۰۳/۱۰/۰۳', lessons: 10, rating: null,
  },
];

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  PENDING_REVIEW: { label: 'در انتظار بررسی', bg: 'rgba(216,183,106,0.15)', color: 'var(--brand-gold-600)' },
  PUBLISHED:      { label: 'منتشر شده',        bg: 'rgba(39,174,96,0.1)',    color: '#27AE60' },
  REJECTED:       { label: 'رد شده',            bg: 'rgba(192,57,43,0.1)',   color: '#C0392B' },
};

export default function CoursesModerationPage() {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [filter, setFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'>('ALL');

  const updateStatus = (id: string, status: string) => {
    setCourses(cs => cs.map(c => c.id === id ? { ...c, status } : c));
    toast.success(status === 'PUBLISHED' ? 'دوره تأیید و منتشر شد' : 'دوره رد شد');
  };

  const filtered = filter === 'ALL' ? courses : courses.filter(c => c.status === filter);
  const pendingCount = courses.filter(c => c.status === 'PENDING_REVIEW').length;

  return (
    <AdminShell title="بررسی دوره‌ها">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {([['ALL', 'همه'], ['PENDING_REVIEW', `در انتظار (${pendingCount})`], ['PUBLISHED', 'منتشر شده'], ['REJECTED', 'رد شده']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
            style={{
              background: filter === val ? 'var(--brand-navy-600)' : 'white',
              color: filter === val ? 'white' : 'var(--brand-navy-600)',
              borderColor: filter === val ? 'var(--brand-navy-600)' : 'var(--admin-border)',
            }}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(course => {
          const st = STATUS_MAP[course.status];
          return (
            <div key={course.id} className="rounded-2xl p-5"
              style={{ background: 'white', border: '1px solid var(--admin-border)' }}>
              <div className="flex items-start justify-between gap-4">

                {/* Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--brand-plum-50)' }}>
                    <GraduationCap size={20} style={{ color: 'var(--brand-plum-600)' }} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-base" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
                        {course.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--admin-muted)' }}>
                      مدرس: {course.instructor}
                    </p>
                    <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'var(--admin-muted)' }}>
                      <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {course.lessons} درس</span>
                      {course.rating && (
                        <span className="flex items-center gap-1"><Star size={11} style={{ color: 'var(--brand-gold-600)' }} /> {course.rating}</span>
                      )}
                      <span style={{ color: 'var(--brand-navy-600)', fontWeight: 600 }}>
                        {course.price.toLocaleString('fa-IR')} تومان
                      </span>
                      <span>ارسال: {course.submittedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all hover:-translate-y-0.5"
                    style={{ borderColor: 'var(--admin-border)', color: 'var(--brand-navy-600)' }}>
                    <Eye size={13} /> مشاهده
                  </button>
                  {course.status === 'PENDING_REVIEW' && (
                    <>
                      <button
                        onClick={() => updateStatus(course.id, 'PUBLISHED')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:-translate-y-0.5"
                        style={{ background: 'rgba(39,174,96,0.1)', color: '#27AE60' }}>
                        <CheckCircle size={13} /> تأیید
                      </button>
                      <button
                        onClick={() => updateStatus(course.id, 'REJECTED')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:-translate-y-0.5"
                        style={{ background: 'rgba(192,57,43,0.08)', color: '#C0392B' }}>
                        <XCircle size={13} /> رد
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ background: 'white', border: '1px solid var(--admin-border)' }}>
            <GraduationCap size={40} className="mx-auto mb-3" style={{ color: 'var(--admin-border)' }} />
            <p style={{ color: 'var(--admin-muted)' }}>دوره‌ای در این وضعیت وجود ندارد</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

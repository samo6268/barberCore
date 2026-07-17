'use client';

import { useState } from 'react';
import { User, Calendar, Award, Edit2, Camera, Star, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const MOCK_PROFILE = {
  firstName: 'سارا', lastName: 'محمدی',
  phone: '09121234567', email: 'sara@example.com',
  city: 'تهران', birthday: '۱۳۷۵/۰۴/۱۵',
  avatarInitial: 'س',
};

const MOCK_BOOKINGS = [
  { id: 'b1', salon: 'لوکس بیوتی', service: 'رنگ مو', date: '۱۴۰۳/۱۰/۱۲', time: '۱۴:۰۰', price: 850_000, status: 'COMPLETED' },
  { id: 'b2', salon: 'رز سالن',    service: 'کراتین',  date: '۱۴۰۳/۰۹/۲۵', time: '۱۰:۳۰', price: 1_200_000, status: 'COMPLETED' },
  { id: 'b3', salon: 'لوکس بیوتی', service: 'مانیکور', date: '۱۴۰۳/۱۰/۲۰', time: '۱۶:۰۰', price: 320_000, status: 'CONFIRMED' },
];

const MOCK_CERTS = [
  { id: 'cert1', course: 'رنگ‌آمیزی حرفه‌ای مو', issuedAt: '۱۴۰۳/۰۸/۱۵', instructor: 'سارا کریمی' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: 'تأیید شده', color: '#27AE60' },
  COMPLETED: { label: 'انجام شده', color: 'var(--brand-navy-400)' },
  CANCELLED: { label: 'لغو شده',  color: '#C0392B' },
  PENDING:   { label: 'در انتظار', color: '#E67E22' },
};

type Tab = 'profile' | 'bookings' | 'certificates';

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(MOCK_PROFILE);

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--bg-ivory)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header card */}
        <div className="rounded-2xl border overflow-hidden mb-6"
          style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
          {/* Cover */}
          <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, var(--brand-plum-600), var(--brand-rose-600, #C0392B))' }}>
            <button className="absolute top-3 left-3 p-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <Camera size={16} />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ring-4 ring-white"
                  style={{ background: 'var(--brand-rose-200, #EAC5D1)', color: 'var(--brand-plum-600)' }}>
                  {MOCK_PROFILE.avatarInitial}
                </div>
                <button className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}>
                  <Camera size={11} />
                </button>
              </div>
              <button onClick={() => setEditMode(e => !e)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border"
                style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)' }}>
                <Edit2 size={14} /> {editMode ? 'انصراف' : 'ویرایش'}
              </button>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
              {MOCK_PROFILE.firstName} {MOCK_PROFILE.lastName}
            </h1>
            <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>{MOCK_PROFILE.city}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--ui-gray-100)' }}>
          {([['profile', 'پروفایل', <User size={16} />], ['bookings', 'رزروها', <Calendar size={16} />], ['certificates', 'گواهینامه‌ها', <Award size={16} />]] as [Tab, string, React.ReactNode][]).map(([t, l, icon]) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t ? 'white' : 'transparent',
                color: tab === t ? 'var(--brand-navy-600)' : 'var(--ui-gray-500)',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
              {icon}{l}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'profile' && (
          <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
            {[
              { label: 'نام', key: 'firstName' }, { label: 'نام خانوادگی', key: 'lastName' },
              { label: 'شماره موبایل', key: 'phone' }, { label: 'ایمیل', key: 'email' },
              { label: 'شهر', key: 'city' }, { label: 'تاریخ تولد', key: 'birthday' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ui-gray-500)' }}>{label}</label>
                {editMode ? (
                  <input value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border-b-2 pb-2 bg-transparent outline-none text-sm"
                    style={{ borderColor: 'var(--brand-plum-600)', color: 'var(--brand-navy-600)' }} />
                ) : (
                  <p className="text-sm" style={{ color: 'var(--brand-navy-600)' }}>{(form as any)[key]}</p>
                )}
              </div>
            ))}
            {editMode && (
              <button className="w-full py-3 rounded-xl font-semibold text-sm mt-4"
                style={{ background: 'var(--brand-plum-600)', color: 'white' }}
                onClick={() => setEditMode(false)}>
                ذخیره تغییرات
              </button>
            )}
          </div>
        )}

        {tab === 'bookings' && (
          <div className="space-y-4">
            {MOCK_BOOKINGS.map(b => {
              const st = STATUS_CONFIG[b.status];
              return (
                <div key={b.id} className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>{b.salon}</h3>
                      <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>{b.service}</p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: `${st.color}18`, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3" style={{ color: 'var(--ui-gray-500)' }}>
                      <span className="flex items-center gap-1"><Calendar size={13} />{b.date}</span>
                      <span className="flex items-center gap-1"><Clock size={13} />{b.time}</span>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--brand-plum-600)' }}>
                      {b.price.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                  {b.status === 'COMPLETED' && (
                    <div className="mt-3 pt-3 border-t flex justify-end" style={{ borderColor: 'var(--ui-gray-100)' }}>
                      <Link href={`/reviews/new?booking=${b.id}`}
                        className="flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: 'var(--brand-gold-600)' }}>
                        <Star size={13} fill="var(--brand-gold-600)" /> ثبت نظر
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'certificates' && (
          <div className="space-y-4">
            {MOCK_CERTS.map(cert => (
              <div key={cert.id} className="rounded-2xl border p-6 flex items-center gap-4"
                style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(216,183,106,0.12)' }}>
                  <Award size={28} strokeWidth={1.5} style={{ color: 'var(--brand-gold-600)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>{cert.course}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ui-gray-500)' }}>مدرس: {cert.instructor}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ui-gray-500)' }}>صدور: {cert.issuedAt}</p>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(216,183,106,0.12)', color: 'var(--brand-gold-600)' }}>
                  دانلود
                </button>
              </div>
            ))}
            {MOCK_CERTS.length === 0 && (
              <div className="text-center py-16" style={{ color: 'var(--ui-gray-400)' }}>
                <Award size={48} strokeWidth={1} className="mx-auto mb-3" />
                <p>هنوز گواهینامه‌ای ندارید</p>
                <Link href="/academy" className="text-sm mt-2 inline-block" style={{ color: 'var(--brand-plum-600)' }}>
                  مشاهده دوره‌های آموزشی
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

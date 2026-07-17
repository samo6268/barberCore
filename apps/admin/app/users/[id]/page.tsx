'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import {
  ArrowRight, Phone, Mail, Calendar, Shield, Activity,
  CreditCard, MessageSquare, Copy, Ban, UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const MOCK_USER = {
  id: 'u1',
  firstName: 'سارا',
  lastName: 'کریمی',
  phone: '09121234567',
  email: 'sara@example.com',
  role: 'SALON_OWNER',
  plan: 'PROFESSIONAL',
  status: 'ACTIVE',
  createdAt: '۱۴۰۳/۰۳/۱۲',
  lastActive: '۲ ساعت پیش',
  ltv: 12_800_000,
  bookingCount: 84,
  salonCount: 2,
};

const TIMELINE = [
  { date: '۱۴۰۳/۱۰/۱۲', event: 'ارتقا به پلن PROFESSIONAL', type: 'upgrade' },
  { date: '۱۴۰۳/۱۰/۱۰', event: 'ثبت سالن جدید: رز سالن', type: 'salon' },
  { date: '۱۴۰۳/۰۹/۲۸', event: 'پرداخت کمیسیون ۳٬۴۵۰٬۰۰۰ تومان', type: 'payment' },
  { date: '۱۴۰۳/۰۹/۱۵', event: 'اولین ورود به سیستم', type: 'login' },
  { date: '۱۴۰۳/۰۳/۱۲', event: 'ثبت‌نام در پرنگارین', type: 'signup' },
];

const BOOKINGS = [
  { id: 'B001', salon: 'لوکس بیوتی', service: 'رنگ مو', date: '۱۴۰۳/۱۰/۱۲', amount: 850_000, status: 'COMPLETED' },
  { id: 'B002', salon: 'رز سالن',    service: 'کراتین',  date: '۱۴۰۳/۱۰/۰۵', amount: 1_200_000, status: 'COMPLETED' },
  { id: 'B003', salon: 'لوکس بیوتی', service: 'کوتاهی',  date: '۱۴۰۳/۰۹/۲۸', amount: 250_000, status: 'CANCELLED' },
];

const NOTES = [
  { id: 'n1', author: 'محمد (ادمین)', text: 'مشتری VIP — درخواست اینتگریشن خاص دارد', date: '۱۴۰۳/۱۰/۱۰' },
];

const TABS = ['تایم‌لاین', 'رزروها', 'پرداخت‌ها', 'یادداشت‌ها'];

const ROLE_MAP: Record<string, string> = {
  SALON_OWNER: 'سالن‌دار',
  CUSTOMER: 'مشتری',
  INSTRUCTOR: 'مدرس',
  SUPER_ADMIN: 'ادمین',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'var(--admin-muted)',
  STARTER: 'var(--brand-navy-600)',
  PROFESSIONAL: 'var(--brand-plum-600)',
  ENTERPRISE: 'var(--brand-gold-600)',
};

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(NOTES);

  const user = MOCK_USER;

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(n => [{ id: Date.now().toString(), author: 'شما (ادمین)', text: newNote, date: 'همین الان' }, ...n]);
    setNewNote('');
    toast.success('یادداشت ذخیره شد');
  };

  return (
    <AdminShell title={`${user.firstName} ${user.lastName}`}>
      {/* Back */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--admin-muted)' }}>
        <Link href="/users" className="flex items-center gap-1" style={{ color: 'var(--brand-gold-600)' }}>
          <ArrowRight size={14} /> لیست کاربران
        </Link>
        <span>/</span>
        <span>{user.firstName} {user.lastName}</span>
      </div>

      {/* Header card */}
      <div className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{ background: 'white', border: '1px solid var(--admin-border)' }}>

        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ background: 'var(--brand-plum-600)' }}>
          {user.firstName[0]}{user.lastName[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
              {user.firstName} {user.lastName}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(39,174,96,0.1)', color: '#27AE60' }}>
              {user.status === 'ACTIVE' ? 'فعال' : 'معلق'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--brand-plum-50)', color: PLAN_COLORS[user.plan] }}>
              {user.plan}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'var(--admin-muted)' }}>
            <span className="flex items-center gap-1"><Phone size={11} /> {user.phone}</span>
            {user.email && <span className="flex items-center gap-1"><Mail size={11} /> {user.email}</span>}
            <span className="flex items-center gap-1"><Shield size={11} /> {ROLE_MAP[user.role]}</span>
            <span className="flex items-center gap-1"><Calendar size={11} /> عضو از {user.createdAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => { navigator.clipboard.writeText(user.phone); toast.success('کپی شد'); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all hover:-translate-y-0.5"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--brand-navy-600)' }}>
            <Copy size={13} /> کپی شماره
          </button>
          <button
            onClick={() => toast.info('Impersonate — در پروداکشن فعال می‌شود')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all hover:-translate-y-0.5"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--brand-navy-600)' }}>
            <UserCheck size={13} /> Impersonate
          </button>
          <button
            onClick={() => toast.warning('کاربر معلق شد (دمو)')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all hover:-translate-y-0.5"
            style={{ borderColor: '#C0392B22', color: '#C0392B' }}>
            <Ban size={13} /> معلق کردن
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'ارزش کل (LTV)', value: `${(user.ltv / 1_000_000).toFixed(1)} M`, icon: CreditCard },
          { label: 'رزروها', value: user.bookingCount.toString(), icon: Calendar },
          { label: 'سالن‌ها', value: user.salonCount.toString(), icon: Activity },
          { label: 'آخرین فعالیت', value: user.lastActive, icon: Activity },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: 'white', border: '1px solid var(--admin-border)' }}>
            <Icon size={16} className="mb-2" style={{ color: 'var(--brand-gold-600)' }} strokeWidth={1.5} />
            <p className="text-lg font-bold" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--admin-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--admin-border)' }}>
        <div className="flex border-b" style={{ borderColor: 'var(--admin-border)' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className="px-5 py-3 text-sm font-medium transition-colors"
              style={{
                color: tab === i ? 'var(--brand-navy-600)' : 'var(--admin-muted)',
                borderBottom: tab === i ? '2px solid var(--brand-navy-600)' : '2px solid transparent',
                marginBottom: '-1px',
              }}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Timeline */}
          {tab === 0 && (
            <div className="space-y-4">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: 'var(--brand-gold-600)' }} />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--brand-navy-600)' }}>{item.event}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--admin-muted)' }}>{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bookings */}
          {tab === 1 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--admin-border)' }}>
                    {['شناسه', 'سالن', 'خدمت', 'تاریخ', 'مبلغ', 'وضعیت'].map(h => (
                      <th key={h} className="text-right py-2 px-3 text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                  {BOOKINGS.map(b => (
                    <tr key={b.id}>
                      <td className="py-3 px-3 font-mono text-xs" style={{ color: 'var(--admin-muted)' }}>{b.id}</td>
                      <td className="py-3 px-3" style={{ color: 'var(--brand-navy-600)' }}>{b.salon}</td>
                      <td className="py-3 px-3" style={{ color: 'var(--brand-navy-600)' }}>{b.service}</td>
                      <td className="py-3 px-3 text-xs" style={{ color: 'var(--admin-muted)' }}>{b.date}</td>
                      <td className="py-3 px-3" style={{ color: 'var(--brand-navy-600)' }}>
                        {b.amount.toLocaleString('fa-IR')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: b.status === 'COMPLETED' ? 'rgba(39,174,96,0.1)' : 'rgba(192,57,43,0.1)',
                            color: b.status === 'COMPLETED' ? '#27AE60' : '#C0392B',
                          }}>
                          {b.status === 'COMPLETED' ? 'انجام شده' : 'لغو شده'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payments */}
          {tab === 2 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--admin-muted)' }}>
              تاریخچه پرداخت‌ها — پس از اتصال به API نمایش داده می‌شود
            </p>
          )}

          {/* Notes */}
          {tab === 3 && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <textarea
                  value={newNote} onChange={e => setNewNote(e.target.value)}
                  placeholder="یادداشت جدید..."
                  rows={2}
                  className="flex-1 rounded-xl px-4 py-3 text-sm resize-none outline-none"
                  style={{ border: '1px solid var(--admin-border)', color: 'var(--brand-navy-600)' }}
                />
                <button onClick={addNote}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white flex-shrink-0 self-end"
                  style={{ background: 'var(--brand-navy-600)' }}>
                  <MessageSquare size={15} />
                </button>
              </div>
              {notes.map(n => (
                <div key={n.id} className="rounded-xl p-4" style={{ background: 'var(--admin-content-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--brand-navy-600)' }}>{n.author}</span>
                    <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>{n.date}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--brand-navy-600)' }}>{n.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

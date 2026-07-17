'use client';

import { AdminShell } from '@/components/layout/admin-shell';
import { TrendingUp, Users, Store, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const METRICS = [
  { label: 'GMV ماه جاری',     value: '۴۸۳٬۰۰۰٬۰۰۰ تومان', delta: '+۱۲٪',  up: true,  icon: <TrendingUp size={20} strokeWidth={1.5} /> },
  { label: 'رزروهای امروز',    value: '۱٬۲۴۷',              delta: '+۸٪',   up: true,  icon: <Calendar size={20} strokeWidth={1.5} /> },
  { label: 'کاربران فعال',     value: '۳۸٬۴۲۱',             delta: '+۵٪',   up: true,  icon: <Users size={20} strokeWidth={1.5} /> },
  { label: 'سالن‌های منتظر',   value: '۱۴',                 delta: '-۳',    up: false, icon: <Store size={20} strokeWidth={1.5} /> },
];

const RECENT_SALONS = [
  { name: 'لوکس بیوتی',   owner: 'سارا کریمی',  city: 'تهران',   status: 'PENDING',  date: '۱۴۰۳/۱۰/۱۲' },
  { name: 'رز سالن',      owner: 'مریم رضایی',  city: 'اصفهان',  status: 'PENDING',  date: '۱۴۰۳/۱۰/۱۱' },
  { name: 'باربر کلاسیک', owner: 'علی محمدی',   city: 'تهران',   status: 'APPROVED', date: '۱۴۰۳/۱۰/۱۰' },
  { name: 'گلدن کاتس',   owner: 'امیر رستمی',  city: 'شیراز',   status: 'APPROVED', date: '۱۴۰۳/۱۰/۰۹' },
  { name: 'ووگ استودیو', owner: 'نازنین احمدی', city: 'تهران',   status: 'REJECTED', date: '۱۴۰۳/۱۰/۰۸' },
];

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:  { label: 'در انتظار', bg: 'rgba(216,183,106,0.15)', color: 'var(--brand-gold-600)' },
  APPROVED: { label: 'تأیید شده', bg: 'rgba(31,41,51,0.08)',    color: 'var(--brand-navy-600)' },
  REJECTED: { label: 'رد شده',    bg: 'rgba(192,57,43,0.1)',    color: '#C0392B' },
};

export default function DashboardPage() {
  return (
    <AdminShell title="داشبورد">

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {METRICS.map((m, i) => (
          <div key={i} className="rounded-xl p-6 border" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--bg-ivory)', color: 'var(--admin-primary)' }}>
                {m.icon}
              </div>
              <span
                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  background: m.up ? 'rgba(39,174,96,0.1)' : 'rgba(192,57,43,0.1)',
                  color: m.up ? '#27AE60' : '#C0392B',
                }}
              >
                {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {m.delta}
              </span>
            </div>
            <p className="font-bold text-xl mb-1" style={{ color: 'var(--admin-text)', fontFamily: 'var(--font-display)' }}>
              {m.value}
            </p>
            <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Revenue chart placeholder */}
        <div className="lg:col-span-2 rounded-xl border p-6" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-base" style={{ color: 'var(--admin-text)' }}>درآمد ۳۰ روز اخیر</h2>
            <select className="text-sm px-3 py-1.5 rounded-lg border outline-none"
              style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)', background: 'var(--bg-ivory)' }}>
              <option>۳۰ روز</option>
              <option>۷ روز</option>
              <option>۹۰ روز</option>
            </select>
          </div>
          {/* Simple SVG bar chart */}
          <div className="h-48 flex items-end gap-2 pb-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 50, 72, 63, 91, 78, 55, 82, 68, 74, 89, 60, 95, 71, 83, 58, 76, 92, 65].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm transition-opacity hover:opacity-80 cursor-pointer"
                style={{ height: `${h}%`, background: i % 7 === 6 ? 'var(--brand-gold-600)' : 'var(--brand-navy-600)', opacity: 0.7 + i % 3 * 0.1 }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--admin-muted)' }}>
            <span>۱ دی</span><span>۱۵ دی</span><span>۳۰ دی</span>
          </div>
        </div>

        {/* Plan distribution */}
        <div className="rounded-xl border p-6" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <h2 className="font-semibold text-base mb-6" style={{ color: 'var(--admin-text)' }}>توزیع پلن‌ها</h2>
          {[
            { plan: 'Enterprise', count: 12,   pct: 8,   color: 'var(--brand-gold-600)' },
            { plan: 'Professional', count: 87, pct: 56,  color: 'var(--brand-navy-600)' },
            { plan: 'Starter',    count: 34,   pct: 22,  color: 'var(--brand-plum-600)' },
            { plan: 'Free',       count: 21,   pct: 14,  color: 'var(--ui-gray-400)' },
          ].map(row => (
            <div key={row.plan} className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span style={{ color: 'var(--admin-text)' }}>{row.plan}</span>
                <span style={{ color: 'var(--admin-muted)' }}>{row.count} سالن</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'var(--ui-gray-100)' }}>
                <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent salon applications */}
      <div className="mt-6 rounded-xl border" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--admin-border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--admin-text)' }}>آخرین درخواست‌های سالن</h2>
          <a href="/moderation/salons" className="text-sm" style={{ color: 'var(--admin-accent)' }}>مشاهده همه ←</a>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--admin-border)' }}>
              {['نام سالن', 'مالک', 'شهر', 'وضعیت', 'تاریخ'].map(h => (
                <th key={h} className="text-right px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_SALONS.map((s, i) => {
              const st = STATUS_LABELS[s.status];
              return (
                <tr key={i} className="border-b last:border-0 hover:bg-[var(--ui-gray-100)] transition-colors" style={{ borderColor: 'var(--admin-border)' }}>
                  <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{s.name}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--admin-muted)' }}>{s.owner}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--admin-muted)' }}>{s.city}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--admin-muted)' }}>{s.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </AdminShell>
  );
}

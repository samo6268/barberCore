'use client';

import { AdminShell } from '@/components/layout/admin-shell';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const MONTHLY_GMV = [
  { month: 'مهر',   gmv: 320, commission: 48, featured: 22 },
  { month: 'آبان',  gmv: 380, commission: 57, featured: 28 },
  { month: 'آذر',   gmv: 290, commission: 43, featured: 18 },
  { month: 'دی',    gmv: 483, commission: 72, featured: 35 },
  { month: 'بهمن',  gmv: 410, commission: 61, featured: 30 },
  { month: 'اسفند', gmv: 520, commission: 78, featured: 42 },
];

const PLAN_REVENUE = [
  { name: 'Enterprise', value: 45, fill: 'var(--brand-gold-600)' },
  { name: 'Professional', value: 38, fill: 'var(--brand-navy-600)' },
  { name: 'Starter', value: 12, fill: 'var(--brand-plum-600)' },
  { name: 'Free', value: 5, fill: 'var(--ui-gray-400)' },
];

const CATEGORY_BREAKDOWN = [
  { cat: 'رنگ',    amount: 185 },
  { cat: 'کوتاهی', amount: 142 },
  { cat: 'ناخن',   amount: 98  },
  { cat: 'پوست',   amount: 76  },
  { cat: 'مانیکور', amount: 54  },
  { cat: 'سایر',   amount: 38  },
];

const RECENT_PAYOUTS = [
  { salon: 'لوکس بیوتی',    amount: '۱۲٬۵۰۰٬۰۰۰', status: 'PAID',    date: '۱۴۰۳/۱۰/۰۵' },
  { salon: 'رز سالن',       amount: '۸٬۲۰۰٬۰۰۰',  status: 'PENDING', date: '۱۴۰۳/۱۰/۱۲' },
  { salon: 'باربر کلاسیک',  amount: '۶٬۷۵۰٬۰۰۰',  status: 'PAID',    date: '۱۴۰۳/۱۰/۰۴' },
  { salon: 'گلدن کاتس',    amount: '۴٬۱۰۰٬۰۰۰',  status: 'PENDING', date: '۱۴۰۳/۱۰/۱۱' },
  { salon: 'ووگ استودیو',  amount: '۹٬۳۰۰٬۰۰۰',  status: 'PAID',    date: '۱۴۰۳/۱۰/۰۳' },
];

const tooltipStyle = {
  contentStyle: { background: '#1B2838', border: 'none', borderRadius: 8, color: '#E8DCC8', fontSize: 12 },
  labelStyle: { color: '#C4B49A' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

export default function FinancialPage() {
  return (
    <AdminShell title="داشبورد مالی">

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'GMV کل',          value: '۲٬۴۰۳M',  unit: 'تومان', delta: '+۱۴٪', up: true },
          { label: 'کمیسیون دریافتی', value: '۳۵۹M',   unit: 'تومان', delta: '+۱۱٪', up: true },
          { label: 'درآمد فیچرد',     value: '۱۷۵M',   unit: 'تومان', delta: '+۲۸٪', up: true },
          { label: 'پرداخت‌های معوق', value: '۱۲٬۳۰۰M', unit: 'تومان', delta: '-۳',   up: false },
        ].map((m, i) => (
          <div key={i} className="rounded-xl border p-5" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
            <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--admin-text)', fontFamily: 'var(--font-display)' }}>{m.value}</p>
            <p className="text-xs mb-2" style={{ color: 'var(--admin-muted)' }}>{m.unit}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--admin-text)' }}>{m.label}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: m.up ? 'rgba(39,174,96,0.1)' : 'rgba(192,57,43,0.1)', color: m.up ? '#27AE60' : '#C0392B' }}>
                {m.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">

        {/* GMV Area chart */}
        <div className="lg:col-span-2 rounded-xl border p-6" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--admin-text)' }}>GMV و کمیسیون (میلیون تومان)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_GMV}>
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--brand-navy-600)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--brand-navy-600)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--brand-gold-600)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--brand-gold-600)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#7C8F9E', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7C8F9E', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="gmv"        name="GMV"       stroke="var(--brand-navy-600)" fill="url(#gmvGrad)"  strokeWidth={2} />
              <Area type="monotone" dataKey="commission" name="کمیسیون"  stroke="var(--brand-gold-600)" fill="url(#commGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan revenue pie */}
        <div className="rounded-xl border p-6" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--admin-text)' }}>درآمد بر اساس پلن (٪)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PLAN_REVENUE} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} strokeWidth={0}>
                {PLAN_REVENUE.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {PLAN_REVENUE.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
                  <span style={{ color: 'var(--admin-text)' }}>{p.name}</span>
                </div>
                <span style={{ color: 'var(--admin-muted)' }}>{p.value}٪</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Category bar chart */}
        <div className="rounded-xl border p-6" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--admin-text)' }}>GMV بر اساس دسته‌بندی (میلیون تومان)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CATEGORY_BREAKDOWN} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#7C8F9E', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="cat" tick={{ fill: '#C4B49A', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="amount" name="مبلغ" fill="var(--brand-plum-600)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent payouts table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>آخرین پرداخت‌ها به سالن‌ها</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--admin-border)' }}>
                {['سالن', 'مبلغ (تومان)', 'وضعیت', 'تاریخ'].map(h => (
                  <th key={h} className="text-right px-5 py-3 text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_PAYOUTS.map((p, i) => (
                <tr key={i} className="border-b last:border-0" style={{ borderColor: 'var(--admin-border)' }}>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{p.salon}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: 'var(--admin-text)' }}>{p.amount}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={p.status === 'PAID'
                        ? { background: 'rgba(39,174,96,0.1)', color: '#27AE60' }
                        : { background: 'rgba(216,183,106,0.15)', color: 'var(--brand-gold-600)' }}>
                      {p.status === 'PAID' ? 'پرداخت شده' : 'در انتظار'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

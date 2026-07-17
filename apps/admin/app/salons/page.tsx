'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Search, CheckCircle, XCircle, MoreHorizontal, Eye, MapPin } from 'lucide-react';

const MOCK_SALONS = [
  { id: 's1', name: 'لوکس بیوتی', owner: 'سارا کریمی',   city: 'تهران',   district: 'نیاوران',     status: 'APPROVED', plan: 'PROFESSIONAL', rating: 4.9, bookings: 312, createdAt: '۱۴۰۳/۰۸/۱۲', gender: 'FEMALE' },
  { id: 's2', name: 'باربر کلاسیک', owner: 'علی محمدی',  city: 'تهران',   district: 'سعادت‌آباد', status: 'APPROVED', plan: 'STARTER',       rating: 4.8, bookings: 224, createdAt: '۱۴۰۳/۰۸/۰۵', gender: 'MALE' },
  { id: 's3', name: 'رز سالن',      owner: 'مریم رضایی', city: 'اصفهان',  district: 'چهارباغ',     status: 'PENDING',  plan: 'FREE',          rating: 4.7, bookings: 178, createdAt: '۱۴۰۳/۰۹/۰۱', gender: 'FEMALE' },
  { id: 's4', name: 'ووگ استودیو', owner: 'نازنین احمدی',city: 'تهران',   district: 'الهیه',       status: 'PENDING',  plan: 'ENTERPRISE',    rating: 4.9, bookings: 289, createdAt: '۱۴۰۳/۰۹/۱۵', gender: 'FEMALE' },
  { id: 's5', name: 'گلدن کاتس',   owner: 'امیر رستمی',  city: 'شیراز',   district: 'زند',         status: 'APPROVED', plan: 'PROFESSIONAL',  rating: 4.6, bookings: 145, createdAt: '۱۴۰۳/۰۷/۲۰', gender: 'MALE' },
  { id: 's6', name: 'مدرن کاتس',   owner: 'رضا حسینی',   city: 'مشهد',    district: 'احمدآباد',    status: 'SUSPENDED',plan: 'STARTER',       rating: 4.3, bookings: 89,  createdAt: '۱۴۰۳/۰۶/۱۰', gender: 'MALE' },
  { id: 's7', name: 'الگانس بیوتی', owner: 'زهرا موسوی', city: 'تبریز',   district: 'ولیعصر',      status: 'APPROVED', plan: 'PROFESSIONAL',  rating: 4.8, bookings: 201, createdAt: '۱۴۰۳/۰۵/۳۰', gender: 'FEMALE' },
  { id: 's8', name: 'آرت هیر',      owner: 'کامران صادقی',city: 'کرج',     district: 'گوهردشت',     status: 'REJECTED', plan: 'FREE',          rating: 0,   bookings: 0,   createdAt: '۱۴۰۳/۱۰/۰۲', gender: 'MALE' },
];

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  APPROVED:  { label: 'تأیید شده', bg: 'rgba(39,174,96,0.12)',  color: '#27AE60' },
  PENDING:   { label: 'در انتظار', bg: 'rgba(216,183,106,0.15)',color: 'var(--brand-gold-600)' },
  SUSPENDED: { label: 'معلق',      bg: 'rgba(192,57,43,0.12)',  color: '#C0392B' },
  REJECTED:  { label: 'رد شده',   bg: 'rgba(192,57,43,0.12)',  color: '#C0392B' },
};

const PLAN_MAP: Record<string, { label: string; color: string }> = {
  FREE:         { label: 'رایگان',     color: 'var(--ui-gray-400)' },
  STARTER:      { label: 'استارتر',    color: 'var(--brand-navy-400)' },
  PROFESSIONAL: { label: 'حرفه‌ای',   color: 'var(--brand-plum-600)' },
  ENTERPRISE:   { label: 'سازمانی',   color: 'var(--brand-gold-600)' },
};

export default function SalonsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [salons, setSalons] = useState(MOCK_SALONS);

  const filtered = salons.filter(s => {
    const matchSearch = s.name.includes(search) || s.owner.includes(search) || s.city.includes(search);
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: string) =>
    setSalons(prev => prev.map(s => s.id === id ? { ...s, status } : s));

  const card = { background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: 12 };

  return (
    <AdminShell title="مدیریت سالن‌ها">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'کل سالن‌ها',    value: salons.length },
          { label: 'تأیید شده',    value: salons.filter(s => s.status === 'APPROVED').length },
          { label: 'در انتظار',    value: salons.filter(s => s.status === 'PENDING').length },
          { label: 'معلق / رد شده', value: salons.filter(s => s.status === 'SUSPENDED' || s.status === 'REJECTED').length },
        ].map(stat => (
          <div key={stat.label} style={{ ...card, padding: '16px 20px' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--admin-muted)' }}>{stat.label}</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={card}>
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در سالن‌ها..."
              className="w-full pr-9 pl-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: 'var(--bg-ivory)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg outline-none"
            style={{ background: 'var(--bg-ivory)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="PENDING">در انتظار</option>
            <option value="APPROVED">تأیید شده</option>
            <option value="SUSPENDED">معلق</option>
            <option value="REJECTED">رد شده</option>
          </select>
          <span className="text-sm mr-auto" style={{ color: 'var(--admin-muted)' }}>{filtered.length} سالن</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                {['سالن', 'مالک', 'شهر', 'وضعیت', 'پلن', 'رزروها', 'ثبت شده', 'عملیات'].map(h => (
                  <th key={h} className="px-4 py-3 text-right font-medium" style={{ color: 'var(--admin-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(salon => {
                const st = STATUS_MAP[salon.status];
                const pl = PLAN_MAP[salon.plan];
                return (
                  <tr key={salon.id} className="border-b transition-colors hover:bg-[var(--bg-ivory)]"
                    style={{ borderColor: 'var(--admin-border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: salon.gender === 'FEMALE' ? 'rgba(75,36,74,0.12)' : 'rgba(31,41,51,0.1)', color: salon.gender === 'FEMALE' ? 'var(--brand-plum-600)' : 'var(--brand-navy-600)' }}>
                          {salon.name.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--admin-text)' }}>{salon.name}</p>
                          <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>{salon.gender === 'FEMALE' ? 'زنانه' : 'مردانه'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--admin-text)' }}>{salon.owner}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--admin-muted)' }}>
                        <MapPin size={12} /> {salon.city}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium" style={{ color: pl.color }}>{pl.label}</span>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--admin-text)' }}>{salon.bookings}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>{salon.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {salon.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateStatus(salon.id, 'APPROVED')}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              style={{ background: 'rgba(39,174,96,0.12)', color: '#27AE60' }}>
                              <CheckCircle size={12} /> تأیید
                            </button>
                            <button onClick={() => updateStatus(salon.id, 'REJECTED')}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              style={{ background: 'rgba(192,57,43,0.1)', color: '#C0392B' }}>
                              <XCircle size={12} /> رد
                            </button>
                          </>
                        )}
                        {salon.status === 'APPROVED' && (
                          <button onClick={() => updateStatus(salon.id, 'SUSPENDED')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(192,57,43,0.1)', color: '#C0392B' }}>
                            معلق کردن
                          </button>
                        )}
                        {(salon.status === 'SUSPENDED' || salon.status === 'REJECTED') && (
                          <button onClick={() => updateStatus(salon.id, 'APPROVED')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(39,174,96,0.12)', color: '#27AE60' }}>
                            فعال‌سازی
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg" style={{ color: 'var(--admin-muted)' }}>
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Search, TrendingUp, TrendingDown, Minus, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_CUSTOMERS = Array.from({ length: 18 }, (_, i) => ({
  id: `c${i + 1}`,
  firstName: ['مریم', 'سارا', 'نازنین', 'فاطمه', 'زهره', 'شیوا', 'لیلا', 'آرزو', 'کیمیا'][i % 9],
  lastName:  ['حسینی', 'کریمی', 'محمدی', 'رضایی', 'موسوی', 'تهرانی', 'احمدی', 'رستمی', 'شیرازی'][i % 9],
  phone:     `091${String(10000000 + i * 2345678).slice(0, 8)}`,
  city:      ['تهران', 'اصفهان', 'مشهد', 'شیراز', 'کرج'][i % 5],
  ltv:       Math.round((500_000 + i * 320_000) / 1000) * 1000,
  bookings:  8 + i * 3,
  lastVisit: `${i + 2} روز پیش`,
  churnRisk: i % 7 === 0 ? 'HIGH' : i % 5 === 0 ? 'MEDIUM' : 'LOW',
  segment:   ['VIP', 'LOYAL', 'OCCASIONAL', 'NEW'][i % 4],
  birthday:  `۱۳${70 + (i % 25)}/${String(i % 12 + 1).padStart(2, '0')}/۱۵`,
}));

const CHURN_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  HIGH:   { label: 'ریزش بالا',  bg: 'rgba(192,57,43,0.1)',  color: '#C0392B', icon: <TrendingDown size={12} /> },
  MEDIUM: { label: 'ریزش متوسط', bg: 'rgba(230,126,34,0.1)', color: '#E67E22', icon: <Minus size={12} /> },
  LOW:    { label: 'کم',         bg: 'rgba(39,174,96,0.1)',  color: '#27AE60', icon: <TrendingUp size={12} /> },
};

const SEGMENT_CONFIG: Record<string, { label: string; color: string }> = {
  VIP:        { label: 'VIP',       color: 'var(--brand-gold-600)' },
  LOYAL:      { label: 'وفادار',    color: 'var(--brand-plum-600)' },
  OCCASIONAL: { label: 'گاه‌گاهی',  color: 'var(--brand-navy-400)' },
  NEW:        { label: 'جدید',      color: '#27AE60' },
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [churnFilter, setChurnFilter] = useState('');
  const [segFilter, setSegFilter] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = MOCK_CUSTOMERS.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(q);
    const matchChurn = !churnFilter || c.churnRisk === churnFilter;
    const matchSeg   = !segFilter   || c.segment   === segFilter;
    return matchSearch && matchChurn && matchSeg;
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const highRisk  = MOCK_CUSTOMERS.filter(c => c.churnRisk === 'HIGH').length;
  const vipCount  = MOCK_CUSTOMERS.filter(c => c.segment   === 'VIP').length;
  const totalLTV  = MOCK_CUSTOMERS.reduce((a, c) => a + c.ltv, 0);
  const avgLTV    = Math.round(totalLTV / MOCK_CUSTOMERS.length / 1000) * 1000;

  return (
    <AdminShell title="مدیریت مشتریان">

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'کل مشتریان',    value: MOCK_CUSTOMERS.length, sub: '+۱۲٪ این ماه' },
          { label: 'مشتریان VIP',   value: vipCount,               sub: 'بیش از ۳ میلیون LTV' },
          { label: 'ریسک ریزش بالا', value: highRisk,              sub: 'نیاز به پیگیری', warn: true },
          { label: 'میانگین LTV',   value: `${(avgLTV/1000).toFixed(0)}K`, sub: 'تومان' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border p-5" style={{ background: 'var(--admin-card-bg)', borderColor: s.warn ? '#C0392B40' : 'var(--admin-border)' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: s.warn ? '#C0392B' : 'var(--admin-text)', fontFamily: 'var(--font-display)' }}>{s.value}</p>
            <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--admin-text)' }}>{s.label}</p>
            <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border"
          style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <Search size={16} strokeWidth={1.5} style={{ color: 'var(--admin-muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="نام یا شماره..."
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--admin-text)' }} />
        </div>
        {[
          { value: churnFilter, set: (v: string) => { setChurnFilter(v); setPage(1); },
            options: [['', 'همه ریسک‌ها'], ['HIGH', 'ریزش بالا'], ['MEDIUM', 'متوسط'], ['LOW', 'کم']] },
          { value: segFilter, set: (v: string) => { setSegFilter(v); setPage(1); },
            options: [['', 'همه بخش‌ها'], ['VIP', 'VIP'], ['LOYAL', 'وفادار'], ['OCCASIONAL', 'گاه‌گاهی'], ['NEW', 'جدید']] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => f.set(e.target.value)}
            className="px-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
            {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--bg-ivory)' }}>
              {['مشتری', 'شهر', 'بخش', 'LTV (تومان)', 'رزروها', 'آخرین بازدید', 'ریسک ریزش', ''].map(h => (
                <th key={h} className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide"
                  style={{ color: 'var(--admin-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(c => {
              const churn = CHURN_CONFIG[c.churnRisk];
              const seg   = SEGMENT_CONFIG[c.segment];
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-[var(--ui-gray-100)] transition-colors"
                  style={{ borderColor: 'var(--admin-border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: 'var(--brand-rose-200, #EAC5D1)', color: 'var(--brand-rose-800, #8F5E70)' }}>
                        {c.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{c.firstName} {c.lastName}</p>
                        <p className="text-xs" dir="ltr" style={{ color: 'var(--admin-muted)' }}>{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--admin-muted)' }}>{c.city}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold" style={{ color: seg.color }}>{seg.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                    {c.ltv.toLocaleString('fa-IR')}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--admin-text)' }}>{c.bookings}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--admin-muted)' }}>{c.lastVisit}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: churn.bg, color: churn.color }}>
                      {churn.icon}{churn.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded-md transition-colors hover:bg-[var(--ui-gray-100)]"
                      style={{ color: 'var(--admin-muted)' }}>
                      <MoreHorizontal size={16} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
            {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} از {filtered.length} مشتری
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-40"
              style={{ borderColor: 'var(--admin-border)' }}><ChevronRight size={16} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm"
                style={{
                  borderColor: p===page ? 'var(--admin-primary)' : 'var(--admin-border)',
                  background:  p===page ? 'var(--admin-primary)' : 'transparent',
                  color:       p===page ? 'var(--admin-primary-fg)' : 'var(--admin-text)',
                }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-40"
              style={{ borderColor: 'var(--admin-border)' }}><ChevronLeft size={16} /></button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

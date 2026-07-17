'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Search, Filter, Download, UserX, Send, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_USERS = Array.from({ length: 20 }, (_, i) => ({
  id: `u${i + 1}`,
  firstName: ['علی', 'سارا', 'محمد', 'مریم', 'رضا', 'نازنین', 'امیر', 'فاطمه'][i % 8],
  lastName:  ['محمدی', 'کریمی', 'رضایی', 'احمدی', 'رستمی', 'موسوی', 'حسینی', 'تهرانی'][i % 8],
  email:     `user${i + 1}@example.com`,
  phone:     `091${String(10000000 + i * 1234567).slice(0, 8)}`,
  role:      ['CUSTOMER', 'CUSTOMER', 'SALON_OWNER', 'CUSTOMER', 'CUSTOMER', 'SUPER_ADMIN'][i % 6],
  plan:      ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'FREE', 'STARTER'][i % 6],
  status:    i % 10 === 0 ? 'SUSPENDED' : 'ACTIVE',
  city:      ['تهران', 'اصفهان', 'مشهد', 'شیراز'][i % 4],
  createdAt: `۱۴۰۳/${String(i % 12 + 1).padStart(2, '0')}/۱۵`,
  lastSeen:  `${i + 1} روز پیش`,
}));

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'مشتری', SALON_OWNER: 'سالن‌دار', SUPER_ADMIN: 'سوپرادمین',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'var(--ui-gray-400)', STARTER: 'var(--brand-navy-400)',
  PROFESSIONAL: 'var(--brand-plum-600)', ENTERPRISE: 'var(--brand-gold-600)',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const PER_PAGE = 10;
  const filtered = MOCK_USERS.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${u.firstName} ${u.lastName} ${u.email} ${u.phone}`.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(u => u.id)));
  };

  return (
    <AdminShell title="مدیریت کاربران">

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border"
          style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <Search size={16} strokeWidth={1.5} style={{ color: 'var(--admin-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="نام، ایمیل یا شماره..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--admin-text)' }}
          />
        </div>

        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-lg border text-sm outline-none"
          style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          <option value="">همه نقش‌ها</option>
          <option value="CUSTOMER">مشتری</option>
          <option value="SALON_OWNER">سالن‌دار</option>
          <option value="SUPER_ADMIN">سوپرادمین</option>
        </select>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border"
            style={{ background: 'rgba(216,183,106,0.1)', borderColor: 'var(--brand-gold-600)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--brand-gold-600)' }}>{selected.size} انتخاب شده</span>
            <button className="flex items-center gap-1 text-sm px-3 py-1 rounded-md transition-colors hover:bg-white/10"
              style={{ color: 'var(--admin-text)' }}>
              <Send size={14} /> ارسال SMS
            </button>
            <button className="flex items-center gap-1 text-sm px-3 py-1 rounded-md transition-colors hover:bg-white/10"
              style={{ color: '#C0392B' }}>
              <UserX size={14} /> تعلیق
            </button>
          </div>
        )}

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors"
          style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>
          <Download size={16} strokeWidth={1.5} /> خروجی CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--bg-ivory)' }}>
              <th className="px-4 py-3 text-right w-10">
                <input type="checkbox" checked={selected.size === paged.length && paged.length > 0}
                  onChange={toggleAll} className="rounded" />
              </th>
              {['کاربر', 'تماس', 'نقش', 'پلن', 'شهر', 'وضعیت', 'عضویت', ''].map(h => (
                <th key={h} className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide"
                  style={{ color: 'var(--admin-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-[var(--ui-gray-100)] transition-colors"
                style={{ borderColor: 'var(--admin-border)' }}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: 'var(--brand-rose-200, #EAC5D1)', color: 'var(--brand-rose-800, #8F5E70)' }}>
                      {u.firstName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{u.firstName} {u.lastName}</p>
                      <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--admin-muted)' }}>
                  <span dir="ltr">{u.phone}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: 'var(--ui-gray-100)', color: 'var(--admin-text)' }}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium" style={{ color: PLAN_COLORS[u.plan] }}>{u.plan}</span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--admin-muted)' }}>{u.city}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium`}
                    style={u.status === 'ACTIVE'
                      ? { background: 'rgba(39,174,96,0.1)', color: '#27AE60' }
                      : { background: 'rgba(192,57,43,0.1)', color: '#C0392B' }}>
                    {u.status === 'ACTIVE' ? 'فعال' : 'تعلیق'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>{u.createdAt}</td>
                <td className="px-4 py-3">
                  <button className="p-1 rounded-md transition-colors hover:bg-[var(--ui-gray-100)]"
                    style={{ color: 'var(--admin-muted)' }}>
                    <MoreHorizontal size={16} strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
            نمایش {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} از {filtered.length} کاربر
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-40 transition-colors hover:bg-[var(--ui-gray-100)]"
              style={{ borderColor: 'var(--admin-border)' }}>
              <ChevronRight size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm transition-colors"
                style={{
                  borderColor: p === page ? 'var(--admin-primary)' : 'var(--admin-border)',
                  background: p === page ? 'var(--admin-primary)' : 'transparent',
                  color: p === page ? 'var(--admin-primary-fg)' : 'var(--admin-text)',
                }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border disabled:opacity-40 transition-colors hover:bg-[var(--ui-gray-100)]"
              style={{ borderColor: 'var(--admin-border)' }}>
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

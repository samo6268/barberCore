'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Check, X, Eye, MapPin, User, ChevronDown } from 'lucide-react';

const PENDING_SALONS = [
  { id: 's1', name: 'لوکس بیوتی', owner: 'سارا کریمی', ownerPhone: '09121234567', city: 'تهران', category: 'زنانه', submittedAt: '۱۴۰۳/۱۰/۱۲', score: 92 },
  { id: 's2', name: 'رز سالن',    owner: 'مریم رضایی',  ownerPhone: '09131234567', city: 'اصفهان', category: 'زنانه', submittedAt: '۱۴۰۳/۱۰/۱۱', score: 78 },
  { id: 's3', name: 'باربر کلاسیک', owner: 'علی محمدی', ownerPhone: '09141234567', city: 'تهران', category: 'مردانه', submittedAt: '۱۴۰۳/۱۰/۱۰', score: 85 },
  { id: 's4', name: 'گلدن کاتس', owner: 'امیر رستمی',  ownerPhone: '09151234567', city: 'شیراز', category: 'مردانه', submittedAt: '۱۴۰۳/۱۰/۰۹', score: 63 },
  { id: 's5', name: 'ووگ استودیو', owner: 'نازنین احمدی', ownerPhone: '09161234567', city: 'تهران', category: 'زنانه', submittedAt: '۱۴۰۳/۱۰/۰۸', score: 55 },
];

type SalonStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export default function SalonModerationPage() {
  const [statuses, setStatuses] = useState<Record<string, SalonStatus>>(
    Object.fromEntries(PENDING_SALONS.map(s => [s.id, 'PENDING']))
  );
  const [filter, setFilter] = useState<SalonStatus | ''>('PENDING');

  const update = (id: string, status: SalonStatus) => setStatuses(prev => ({ ...prev, [id]: status }));

  const filtered = PENDING_SALONS.filter(s => !filter || statuses[s.id] === filter);
  const pending  = PENDING_SALONS.filter(s => statuses[s.id] === 'PENDING').length;

  return (
    <AdminShell title="تأیید سالن‌ها">

      {/* Status tabs */}
      <div className="flex gap-2 mb-6">
        {([['', 'همه'], ['PENDING', `در انتظار (${pending})`], ['APPROVED', 'تأیید شده'], ['REJECTED', 'رد شده']] as [SalonStatus | '', string][]).map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
            style={{
              background: filter === v ? 'var(--admin-primary)' : 'var(--admin-card-bg)',
              borderColor: filter === v ? 'var(--admin-primary)' : 'var(--admin-border)',
              color: filter === v ? 'var(--admin-primary-fg)' : 'var(--admin-text)',
            }}>
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(salon => {
          const status = statuses[salon.id];
          return (
            <div key={salon.id} className="rounded-xl border p-6 flex flex-col md:flex-row md:items-center gap-4"
              style={{
                background: 'var(--admin-card-bg)',
                borderColor: status === 'APPROVED' ? '#27AE6040' : status === 'REJECTED' ? '#C0392B40' : 'var(--admin-border)',
              }}>
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>{salon.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--ui-gray-100)', color: 'var(--admin-muted)' }}>{salon.category}</span>
                  <span className="text-xs font-bold ml-auto" style={{ color: salon.score >= 80 ? '#27AE60' : salon.score >= 60 ? '#E67E22' : '#C0392B' }}>
                    امتیاز: {salon.score}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--admin-muted)' }}>
                  <span className="flex items-center gap-1"><User size={14} />{salon.owner} · {salon.ownerPhone}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} />{salon.city}</span>
                  <span>ارسال: {salon.submittedAt}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {status === 'PENDING' ? (
                  <>
                    <button onClick={() => update(salon.id, 'APPROVED')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ background: 'rgba(39,174,96,0.1)', color: '#27AE60', border: '1px solid #27AE6040' }}>
                      <Check size={16} /> تأیید
                    </button>
                    <button onClick={() => update(salon.id, 'REJECTED')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ background: 'rgba(192,57,43,0.1)', color: '#C0392B', border: '1px solid #C0392B40' }}>
                      <X size={16} /> رد
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors"
                      style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>
                      <Eye size={16} /> جزئیات
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={status === 'APPROVED'
                        ? { background: 'rgba(39,174,96,0.1)', color: '#27AE60' }
                        : { background: 'rgba(192,57,43,0.1)', color: '#C0392B' }}>
                      {status === 'APPROVED' ? '✓ تأیید شده' : '✗ رد شده'}
                    </span>
                    <button onClick={() => update(salon.id, 'PENDING')}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                      style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>
                      بازبینی
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}

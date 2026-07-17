'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Check, X, Eye, Megaphone } from 'lucide-react';

const PENDING_ADS = [
  { id: 'a1', title: 'تخفیف ۳۰٪ رنگ مو',    salon: 'لوکس بیوتی',    zone: 'HOMEPAGE_HERO',  budget: '۱۵٬۰۰۰٬۰۰۰', submittedAt: '۱۴۰۳/۱۰/۱۲' },
  { id: 'a2', title: 'بسته طلایی اصلاح',     salon: 'باربر کلاسیک',  zone: 'HOMEPAGE_GRID',  budget: '۸٬۰۰۰٬۰۰۰',  submittedAt: '۱۴۰۳/۱۰/۱۱' },
  { id: 'a3', title: 'کراتین ویژه پاییز',    salon: 'رز سالن',       zone: 'SEARCH_TOP',     budget: '۵٬۰۰۰٬۰۰۰',  submittedAt: '۱۴۰۳/۱۰/۱۰' },
  { id: 'a4', title: 'پیرایش و ماسک مو',    salon: 'ووگ استودیو',   zone: 'CATEGORY_BANNER', budget: '۳٬۰۰۰٬۰۰۰',  submittedAt: '۱۴۰۳/۱۰/۰۹' },
];

const ZONE_LABELS: Record<string, string> = {
  HOMEPAGE_HERO:   'هیرو اصلی',
  HOMEPAGE_GRID:   'گرید اصلی',
  SEARCH_TOP:      'بالای جستجو',
  CATEGORY_BANNER: 'بنر دسته‌بندی',
};

type AdStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdModerationPage() {
  const [statuses, setStatuses] = useState<Record<string, AdStatus>>(
    Object.fromEntries(PENDING_ADS.map(a => [a.id, 'PENDING']))
  );
  const update = (id: string, status: AdStatus) => setStatuses(prev => ({ ...prev, [id]: status }));

  return (
    <AdminShell title="بررسی آگهی‌ها">
      <div className="space-y-4">
        {PENDING_ADS.map(ad => {
          const status = statuses[ad.id];
          return (
            <div key={ad.id} className="rounded-xl border p-6 flex flex-col md:flex-row md:items-center gap-4"
              style={{
                background: 'var(--admin-card-bg)',
                borderColor: status === 'APPROVED' ? '#27AE6040' : status === 'REJECTED' ? '#C0392B40' : 'var(--admin-border)',
              }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(216,183,106,0.1)', color: 'var(--brand-gold-600)' }}>
                <Megaphone size={20} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>{ad.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(216,183,106,0.1)', color: 'var(--brand-gold-600)' }}>
                    {ZONE_LABELS[ad.zone]}
                  </span>
                </div>
                <div className="flex gap-4 text-xs" style={{ color: 'var(--admin-muted)' }}>
                  <span>سالن: {ad.salon}</span>
                  <span>بودجه: {ad.budget} تومان</span>
                  <span>ارسال: {ad.submittedAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status === 'PENDING' ? (
                  <>
                    <button onClick={() => update(ad.id, 'APPROVED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ background: 'rgba(39,174,96,0.1)', color: '#27AE60', border: '1px solid #27AE6040' }}>
                      <Check size={14} /> تأیید
                    </button>
                    <button onClick={() => update(ad.id, 'REJECTED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ background: 'rgba(192,57,43,0.1)', color: '#C0392B', border: '1px solid #C0392B40' }}>
                      <X size={14} /> رد
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border"
                      style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>
                      <Eye size={14} /> پیش‌نمایش
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={status === 'APPROVED'
                        ? { background: 'rgba(39,174,96,0.1)', color: '#27AE60' }
                        : { background: 'rgba(192,57,43,0.1)', color: '#C0392B' }}>
                      {status === 'APPROVED' ? '✓ تأیید' : '✗ رد'}
                    </span>
                    <button onClick={() => update(ad.id, 'PENDING')} className="text-xs px-3 py-1.5 rounded-lg border"
                      style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>بازبینی</button>
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

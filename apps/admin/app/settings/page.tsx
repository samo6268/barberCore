'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';

export default function SettingsPage() {
  const [commissions, setCommissions] = useState({
    FREE: 30, STARTER: 20, PROFESSIONAL: 15, ENTERPRISE: 10,
  });
  const [featuredPrices, setFeaturedPrices] = useState({
    HOMEPAGE_HERO: 15_000_000, HOMEPAGE_GRID: 8_000_000, SEARCH_TOP: 5_000_000, CATEGORY_BANNER: 3_000_000,
  });

  return (
    <AdminShell title="تنظیمات">
      <div className="max-w-2xl space-y-6">

        {/* Commission rates */}
        <div className="rounded-xl border p-6" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--admin-text)' }}>نرخ کمیسیون بوست بر اساس پلن</h2>
          <div className="space-y-4">
            {(Object.entries(commissions) as [keyof typeof commissions, number][]).map(([plan, pct]) => (
              <div key={plan} className="flex items-center gap-4">
                <span className="w-28 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{plan}</span>
                <div className="flex-1 flex items-center gap-3">
                  <input type="range" min={5} max={40} value={pct}
                    onChange={e => setCommissions(c => ({ ...c, [plan]: +e.target.value }))}
                    className="flex-1 accent-[var(--brand-gold-600)]" />
                  <span className="w-12 text-sm font-mono text-center" style={{ color: 'var(--brand-gold-600)' }}>{pct}٪</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured slot prices */}
        <div className="rounded-xl border p-6" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--admin-text)' }}>قیمت اسلات‌های فیچرد (تومان/ماه)</h2>
          <div className="space-y-4">
            {(Object.entries(featuredPrices) as [keyof typeof featuredPrices, number][]).map(([zone, price]) => (
              <div key={zone} className="flex items-center gap-4">
                <span className="w-36 text-xs font-medium" style={{ color: 'var(--admin-text)' }}>{zone.replace('_', ' ')}</span>
                <input type="number" value={price} step={500_000}
                  onChange={e => setFeaturedPrices(p => ({ ...p, [zone]: +e.target.value }))}
                  className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: 'var(--bg-ivory)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--admin-primary)', color: 'var(--admin-primary-fg)' }}>
            ذخیره تنظیمات
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

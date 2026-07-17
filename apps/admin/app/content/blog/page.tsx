'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Plus, Edit2, Eye, Trash2, Tag } from 'lucide-react';

const POSTS = [
  { id: 'b1', title: '۱۰ ترند مو در پاییز ۱۴۰۳', author: 'سارا کریمی', category: 'ترندها', status: 'PUBLISHED', views: 1240, date: '۱۴۰۳/۱۰/۰۸' },
  { id: 'b2', title: 'مراقبت از موهای رنگ شده', author: 'مریم رضایی', category: 'مراقبت', status: 'PUBLISHED', views: 890,  date: '۱۴۰۳/۱۰/۰۵' },
  { id: 'b3', title: 'انتخاب بهترین سالن زیبایی', author: 'نازنین احمدی', category: 'راهنما', status: 'DRAFT', views: 0, date: '۱۴۰۳/۱۰/۱۲' },
  { id: 'b4', title: 'کراتین یا صافی موی شیمیایی؟', author: 'سارا کریمی', category: 'مقایسه', status: 'PUBLISHED', views: 2100, date: '۱۴۰۳/۰۹/۲۵' },
  { id: 'b5', title: 'اصلاح صورت تخصصی برای آقایان', author: 'علی محمدی', category: 'آقایان', status: 'DRAFT', views: 0, date: '۱۴۰۳/۱۰/۱۱' },
];

export default function BlogPage() {
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const filtered = POSTS.filter(p => filter === 'ALL' || p.status === filter);

  return (
    <AdminShell title="مدیریت وبلاگ">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{
                background: filter === f ? 'var(--admin-primary)' : 'var(--admin-card-bg)',
                borderColor: filter === f ? 'var(--admin-primary)' : 'var(--admin-border)',
                color: filter === f ? 'var(--admin-primary-fg)' : 'var(--admin-text)',
              }}>
              {f === 'ALL' ? 'همه' : f === 'PUBLISHED' ? 'منتشر' : 'پیش‌نویس'}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: 'var(--admin-primary)', color: 'var(--admin-primary-fg)' }}>
          <Plus size={16} /> مقاله جدید
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="rounded-xl border p-5 flex items-center gap-4"
            style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--admin-text)' }}>{p.title}</h3>
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(216,183,106,0.1)', color: 'var(--brand-gold-600)' }}>
                  <Tag size={10} />{p.category}
                </span>
              </div>
              <div className="flex gap-4 text-xs" style={{ color: 'var(--admin-muted)' }}>
                <span>نویسنده: {p.author}</span>
                <span>{p.date}</span>
                {p.views > 0 && <span>{p.views.toLocaleString('fa-IR')} بازدید</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs px-2 py-1 rounded-full font-medium"
                style={p.status === 'PUBLISHED'
                  ? { background: 'rgba(39,174,96,0.1)', color: '#27AE60' }
                  : { background: 'rgba(216,183,106,0.15)', color: 'var(--brand-gold-600)' }}>
                {p.status === 'PUBLISHED' ? 'منتشر' : 'پیش‌نویس'}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-md" style={{ color: 'var(--admin-muted)' }}><Edit2 size={15} strokeWidth={1.5} /></button>
                <button className="p-1.5 rounded-md" style={{ color: 'var(--admin-muted)' }}><Eye size={15} strokeWidth={1.5} /></button>
                <button className="p-1.5 rounded-md" style={{ color: '#C0392B' }}><Trash2 size={15} strokeWidth={1.5} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

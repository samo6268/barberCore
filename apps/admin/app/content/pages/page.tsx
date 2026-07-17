'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Plus, FileText, Edit2, Eye, Trash2, Globe } from 'lucide-react';

const PAGES = [
  { id: 'p1', title: 'درباره ما',       slug: 'about',      status: 'PUBLISHED', updatedAt: '۱۴۰۳/۱۰/۱۰', blocks: 5 },
  { id: 'p2', title: 'تماس با ما',      slug: 'contact',    status: 'PUBLISHED', updatedAt: '۱۴۰۳/۱۰/۰۸', blocks: 3 },
  { id: 'p3', title: 'قوانین و مقررات', slug: 'terms',      status: 'PUBLISHED', updatedAt: '۱۴۰۳/۰۹/۲۰', blocks: 8 },
  { id: 'p4', title: 'حریم خصوصی',     slug: 'privacy',    status: 'DRAFT',     updatedAt: '۱۴۰۳/۱۰/۱۲', blocks: 6 },
  { id: 'p5', title: 'آکادمی',          slug: 'academy',    status: 'PUBLISHED', updatedAt: '۱۴۰۳/۱۰/۰۱', blocks: 4 },
  { id: 'p6', title: 'همکاری با ما',    slug: 'partner',    status: 'DRAFT',     updatedAt: '۱۴۰۳/۱۰/۱۱', blocks: 2 },
];

const BLOCK_TYPES = ['hero', 'text', 'image', 'cta', 'faq', 'team', 'stats'];

export default function PagesPage() {
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [pages, setPages] = useState(PAGES);

  const openEdit = (p: typeof PAGES[0]) => {
    setEditing(p.id);
    setEditTitle(p.title);
    setEditContent(`محتوای ${p.title} اینجا نمایش می‌یابد.`);
  };

  return (
    <AdminShell title="مدیریت صفحات">

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>{pages.length} صفحه</p>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: 'var(--admin-primary)', color: 'var(--admin-primary-fg)' }}>
          <Plus size={16} /> صفحه جدید
        </button>
      </div>

      {editing ? (
        /* Simple Block Editor */
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent outline-none flex-1"
              style={{ color: 'var(--admin-text)' }} />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}
                onClick={() => setEditing(null)}>انصراف</button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--admin-primary)', color: 'var(--admin-primary-fg)' }}>
                ذخیره
              </button>
            </div>
          </div>

          {/* Block type picker */}
          <div className="px-6 py-3 border-b flex gap-2 overflow-x-auto" style={{ borderColor: 'var(--admin-border)' }}>
            <span className="text-xs font-medium self-center" style={{ color: 'var(--admin-muted)' }}>افزودن بلاک:</span>
            {BLOCK_TYPES.map(b => (
              <button key={b} className="px-3 py-1.5 rounded-lg text-xs border whitespace-nowrap"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)', background: 'var(--bg-ivory)' }}>
                + {b}
              </button>
            ))}
          </div>

          {/* Content area (placeholder for TipTap) */}
          <div className="p-6">
            <div className="rounded-lg border min-h-[300px] p-4"
              style={{ borderColor: 'var(--admin-border)', background: 'var(--bg-ivory)' }}>
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                className="w-full bg-transparent outline-none resize-none min-h-[280px] text-sm leading-relaxed"
                style={{ color: 'var(--admin-text)' }}
                placeholder="محتوا را اینجا وارد کنید..." />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--admin-muted)' }}>
              ویرایشگر TipTap بلاک در نسخه بعدی جایگزین این ناحیه می‌شود.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--bg-ivory)' }}>
                {['عنوان', 'اسلاگ', 'بلاک‌ها', 'وضعیت', 'آخرین ویرایش', ''].map(h => (
                  <th key={h} className="text-right px-6 py-3 text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-[var(--ui-gray-100)] transition-colors"
                  style={{ borderColor: 'var(--admin-border)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--bg-ivory)', color: 'var(--admin-muted)' }}>
                        <FileText size={16} strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{p.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono px-2 py-1 rounded" dir="ltr"
                      style={{ background: 'var(--ui-gray-100)', color: 'var(--admin-muted)' }}>/{p.slug}</span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--admin-muted)' }}>{p.blocks} بلاک</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={p.status === 'PUBLISHED'
                        ? { background: 'rgba(39,174,96,0.1)', color: '#27AE60' }
                        : { background: 'rgba(216,183,106,0.15)', color: 'var(--brand-gold-600)' }}>
                      {p.status === 'PUBLISHED' ? 'منتشر شده' : 'پیش‌نویس'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs" style={{ color: 'var(--admin-muted)' }}>{p.updatedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-md transition-colors hover:bg-[var(--ui-gray-100)]"
                        style={{ color: 'var(--admin-muted)' }}><Edit2 size={15} strokeWidth={1.5} /></button>
                      <button className="p-1.5 rounded-md transition-colors hover:bg-[var(--ui-gray-100)]"
                        style={{ color: 'var(--admin-muted)' }}><Eye size={15} strokeWidth={1.5} /></button>
                      <button className="p-1.5 rounded-md transition-colors hover:bg-[rgba(192,57,43,0.08)]"
                        style={{ color: '#C0392B' }}><Trash2 size={15} strokeWidth={1.5} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

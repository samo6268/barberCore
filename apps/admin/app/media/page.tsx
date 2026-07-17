'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Upload, Image as ImageIcon, File, Trash2, Copy } from 'lucide-react';

const MOCK_MEDIA = Array.from({ length: 12 }, (_, i) => ({
  id: `m${i}`,
  name: `image-${String(i + 1).padStart(3, '0')}.webp`,
  type: i % 5 === 0 ? 'pdf' : 'image',
  size: `${(Math.random() * 800 + 100).toFixed(0)} KB`,
  url: `https://picsum.photos/seed/${i + 20}/400/300`,
  uploadedAt: `۱۴۰۳/۱۰/${String(i + 1).padStart(2, '0')}`,
}));

export default function MediaPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  return (
    <AdminShell title="کتابخانه رسانه">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button onClick={() => setView('grid')} className="px-3 py-1.5 rounded-lg text-sm border"
            style={{ background: view === 'grid' ? 'var(--admin-primary)' : 'var(--admin-card-bg)',
              borderColor: view === 'grid' ? 'var(--admin-primary)' : 'var(--admin-border)',
              color: view === 'grid' ? 'var(--admin-primary-fg)' : 'var(--admin-text)' }}>شبکه</button>
          <button onClick={() => setView('list')} className="px-3 py-1.5 rounded-lg text-sm border"
            style={{ background: view === 'list' ? 'var(--admin-primary)' : 'var(--admin-card-bg)',
              borderColor: view === 'list' ? 'var(--admin-primary)' : 'var(--admin-border)',
              color: view === 'list' ? 'var(--admin-primary-fg)' : 'var(--admin-text)' }}>لیست</button>
          {selected.size > 0 && (
            <button className="px-3 py-1.5 rounded-lg text-sm border flex items-center gap-1"
              style={{ borderColor: '#C0392B40', color: '#C0392B', background: 'rgba(192,57,43,0.05)' }}>
              <Trash2 size={14} /> حذف ({selected.size})
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
          style={{ background: 'var(--admin-primary)', color: 'var(--admin-primary-fg)' }}>
          <Upload size={16} /> آپلود
          <input type="file" multiple className="hidden" accept="image/*,application/pdf" />
        </label>
      </div>

      {/* Drop zone */}
      <div className="border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors"
        style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-card-bg)' }}>
        <Upload size={32} strokeWidth={1} className="mx-auto mb-3" style={{ color: 'var(--admin-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>فایل‌ها را اینجا رها کنید یا کلیک کنید</p>
        <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)', opacity: 0.6 }}>JPG، PNG، WebP، PDF — حداکثر ۱۰MB</p>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MOCK_MEDIA.map(m => (
            <div key={m.id} onClick={() => toggle(m.id)}
              className="rounded-xl border overflow-hidden cursor-pointer group relative"
              style={{ borderColor: selected.has(m.id) ? 'var(--admin-primary)' : 'var(--admin-border)',
                background: 'var(--admin-card-bg)', outline: selected.has(m.id) ? '2px solid var(--admin-primary)' : 'none' }}>
              {m.type === 'image' ? (
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center" style={{ background: 'var(--bg-ivory)' }}>
                  <File size={32} strokeWidth={1} style={{ color: 'var(--admin-muted)' }} />
                </div>
              )}
              <div className="p-2">
                <p className="text-xs truncate" style={{ color: 'var(--admin-muted)' }}>{m.name}</p>
                <p className="text-xs" style={{ color: 'var(--admin-muted)', opacity: 0.6 }}>{m.size}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); }}
                className="absolute top-1 left-1 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                <Copy size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--bg-ivory)' }}>
                {['', 'نام فایل', 'نوع', 'حجم', 'تاریخ', ''].map(h => (
                  <th key={h} className="text-right px-5 py-3 text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_MEDIA.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-[var(--ui-gray-100)] transition-colors"
                  style={{ borderColor: 'var(--admin-border)' }}>
                  <td className="px-5 py-3">
                    <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggle(m.id)} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {m.type === 'image' ? (
                        <img src={m.url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: 'var(--bg-ivory)' }}>
                          <File size={16} style={{ color: 'var(--admin-muted)' }} />
                        </div>
                      )}
                      <span className="text-sm font-mono" style={{ color: 'var(--admin-text)' }}>{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>{m.type === 'image' ? 'تصویر' : 'PDF'}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>{m.size}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>{m.uploadedAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-md" style={{ color: 'var(--admin-muted)' }}><Copy size={14} /></button>
                      <button className="p-1.5 rounded-md" style={{ color: '#C0392B' }}><Trash2 size={14} /></button>
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

'use client';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SalonSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: salon } = useQuery({ queryKey: ['salon-detail', id], queryFn: () => api.get(`/salons/${id}`).then(r => r.data.data) });
  const [form, setForm] = useState({ name: '', city: '', address: '', phone: '', description: '', instagramHandle: '' });

  useEffect(() => { if (salon) setForm({ name: salon.name||'', city: salon.city||'', address: salon.address||'', phone: salon.phone||'', description: salon.description||'', instagramHandle: salon.instagramHandle||'' }); }, [salon]);

  const handleSave = async () => {
    try {
      await api.patch(`/salons/${id}`, form);
      toast.success('تنظیمات ذخیره شد');
    } catch { toast.error('خطا در ذخیره'); }
  };

  const DAYS = [
    { key: 'SATURDAY', label: 'شنبه' }, { key: 'SUNDAY', label: 'یکشنبه' },
    { key: 'MONDAY', label: 'دوشنبه' }, { key: 'TUESDAY', label: 'سه‌شنبه' },
    { key: 'WEDNESDAY', label: 'چهارشنبه' }, { key: 'THURSDAY', label: 'پنج‌شنبه' },
    { key: 'FRIDAY', label: 'جمعه' },
  ];

  return (
    <DashboardLayout salonId={id} activeTab="settings">
      <div className="max-w-xl space-y-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--brand-navy-600)' }}>تنظیمات سالن</h2>

        <div className="rounded-2xl p-6 border space-y-4" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--brand-navy-600)' }}>اطلاعات اصلی</h3>
          {[
            { key: 'name', label: 'نام سالن' }, { key: 'phone', label: 'تلفن' },
            { key: 'city', label: 'شهر' }, { key: 'address', label: 'آدرس' },
            { key: 'instagramHandle', label: 'اینستاگرام', dir: 'ltr' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--brand-navy-600)' }}>{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} dir={f.dir}
                className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--brand-navy-600)' }}>توضیحات</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={3}
              className="w-full px-4 py-2 rounded-xl border text-sm outline-none resize-none"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
          </div>
          <button onClick={handleSave} className="w-full py-3 rounded-xl text-white font-medium" style={{ background: 'var(--brand-plum-600)' }}>
            ذخیره تغییرات
          </button>
        </div>

        {/* Working Hours */}
        <div className="rounded-2xl p-6 border" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--brand-navy-600)' }}>ساعات کاری</h3>
          <div className="space-y-2">
            {salon?.workingHours?.map((wh: any) => (
              <div key={wh.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--ui-gray-200)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--brand-navy-600)' }}>{DAYS.find(d => d.key === wh.dayOfWeek)?.label}</span>
                {wh.isOpen ? (
                  <span className="text-sm" dir="ltr" style={{ color: 'var(--ui-gray-500)' }}>{wh.openTime} – {wh.closeTime}</span>
                ) : (
                  <span className="text-sm" style={{ color: '#dc2626' }}>تعطیل</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

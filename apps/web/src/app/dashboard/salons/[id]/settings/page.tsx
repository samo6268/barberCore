'use client';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { ProvinceCitySelect } from '@/components/shared/province-city-select';
import { getIranCityCoordinates } from '@/lib/iran-locations';

const MapAreaPicker = dynamic(
  () => import('@/components/marketplace/map-area-picker').then((module) => module.MapAreaPicker),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse rounded-2xl bg-[#eee8e2]" /> },
);

export default function SalonSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: salon } = useQuery({ queryKey: ['salon-detail', id], queryFn: () => api.get(`/salons/${id}`).then(r => r.data.data) });
  const [form, setForm] = useState({
    name: '', city: '', province: '', address: '', phone: '', description: '', instagramHandle: '',
    latitude: null as number | null, longitude: null as number | null,
  });
  const [locationCenter, setLocationCenter] = useState<[number, number]>([35.7219, 51.3347]);

  useEffect(() => {
    if (!salon) return;
    const city = salon.city || '';
    const province = salon.province || '';
    const storedCenter = salon.latitude != null && salon.longitude != null
      ? [Number(salon.latitude), Number(salon.longitude)] as [number, number]
      : getIranCityCoordinates(city, province);
    setForm({
      name: salon.name || '', city, province, address: salon.address || '', phone: salon.phone || '',
      description: salon.description || '', instagramHandle: salon.instagramHandle || '',
      latitude: salon.latitude == null ? storedCenter?.[0] ?? null : Number(salon.latitude),
      longitude: salon.longitude == null ? storedCenter?.[1] ?? null : Number(salon.longitude),
    });
    if (storedCenter) setLocationCenter(storedCenter);
  }, [salon]);

  const handleSave = async () => {
    if (!form.province || !form.city) {
      toast.error('استان و شهر سالن را انتخاب کنید');
      return;
    }
    if (form.latitude == null || form.longitude == null) {
      toast.error('موقعیت تقریبی سالن را روی نقشه مشخص کنید');
      return;
    }
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
            { key: 'address', label: 'آدرس' }, { key: 'instagramHandle', label: 'اینستاگرام', dir: 'ltr' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--brand-navy-600)' }}>{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} dir={f.dir}
                className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
            </div>
          ))}
          <ProvinceCitySelect
            province={form.province}
            city={form.city}
            onProvinceChange={(value) => setForm((current) => ({ ...current, province: value, city: '', latitude: null, longitude: null }))}
            onCityChange={(value) => {
              const coordinates = value ? getIranCityCoordinates(value, form.province) : undefined;
              setForm((current) => ({
                ...current,
                city: value,
                latitude: coordinates?.[0] ?? null,
                longitude: coordinates?.[1] ?? null,
              }));
              if (coordinates) setLocationCenter(coordinates);
            }}
          />
          {form.city && (
            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--brand-navy-600)' }}>موقعیت تقریبی سالن</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--ui-gray-500)' }}>
                  نقطه‌ای نزدیک سالن را انتخاب کنید؛ برای نمایش سالن‌های اطراف استفاده می‌شود.
                </p>
              </div>
              <MapAreaPicker
                city={form.city}
                center={locationCenter}
                radiusKm={1}
                onChange={(center) => {
                  setLocationCenter(center);
                  setForm((current) => ({ ...current, latitude: center[0], longitude: center[1] }));
                }}
              />
            </div>
          )}
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

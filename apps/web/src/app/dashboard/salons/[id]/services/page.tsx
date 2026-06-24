'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useSalonServices, useCreateService, useServiceCategories } from '@/lib/api-hooks';
import { formatPrice } from '@/lib/utils';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function ServicesPage() {
  const { id } = useParams<{ id: string }>();
  const { data: services, isLoading } = useSalonServices(id);
  const { data: categories } = useServiceCategories();
  const createService = useCreateService(id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', categoryId: '', durationMinutes: 30, price: 0, discountPrice: '', isOnlineBookable: true });

  const handleCreate = async () => {
    if (!form.name || !form.price) return toast.error('نام و قیمت الزامی است');
    try {
      await createService.mutateAsync({ ...form, price: Number(form.price), discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined });
      toast.success('خدمت اضافه شد');
      setShowForm(false);
      setForm({ name: '', categoryId: '', durationMinutes: 30, price: 0, discountPrice: '', isOnlineBookable: true });
    } catch { toast.error('خطا در افزودن خدمت'); }
  };

  return (
    <DashboardLayout salonId={id} activeTab="services">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>خدمات سالن</h2>
          <button onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}>
            <Plus className="w-4 h-4" /> افزودن خدمت
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl p-5 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>خدمت جدید</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="نام خدمت *" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                className="px-4 py-2 rounded-xl border text-sm outline-none col-span-2"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }} />
              <select value={form.categoryId} onChange={e => setForm(p => ({...p, categoryId: e.target.value}))}
                className="px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}>
                <option value="">دسته‌بندی</option>
                {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" placeholder="مدت زمان (دقیقه) *" value={form.durationMinutes} onChange={e => setForm(p => ({...p, durationMinutes: +e.target.value}))}
                className="px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }} />
              <input type="number" placeholder="قیمت (ریال) *" value={form.price || ''} onChange={e => setForm(p => ({...p, price: +e.target.value}))}
                className="px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }} />
              <input type="number" placeholder="قیمت تخفیف‌خورده (اختیاری)" value={form.discountPrice} onChange={e => setForm(p => ({...p, discountPrice: e.target.value}))}
                className="px-4 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreate} disabled={createService.isPending}
                className="px-6 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ background: 'var(--color-primary)' }}>
                {createService.isPending ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl border text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>انصراف</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--color-surface)' }} />)}</div>
        ) : services?.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="text-5xl mb-3">✂️</div>
            <p style={{ color: 'var(--color-muted)' }}>هنوز خدمتی تعریف نکرده‌اید</p>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            {services?.map((s: any, i: number) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4 border-b last:border-0" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{s.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.durationMinutes} دقیقه · {s.category?.name || 'بدون دسته‌بندی'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    {s.discountPrice ? (
                      <div>
                        <span className="text-xs line-through" style={{ color: 'var(--color-muted)' }}>{formatPrice(s.price)}</span>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{formatPrice(s.discountPrice)}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{formatPrice(s.price)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

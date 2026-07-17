'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useSalonStaff, useCreateStaff } from '@/lib/api-hooks';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function StaffPage() {
  const { id } = useParams<{ id: string }>();
  const { data: staff, isLoading } = useSalonStaff(id);
  const createStaff = useCreateStaff(id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '', specialties: '' });

  const handleCreate = async () => {
    if (!form.displayName) return toast.error('نام متخصص الزامی است');
    try {
      await createStaff.mutateAsync({ ...form, specialties: form.specialties.split('،').map(s => s.trim()).filter(Boolean) });
      toast.success('متخصص اضافه شد');
      setShowForm(false);
      setForm({ displayName: '', bio: '', specialties: '' });
    } catch { toast.error('خطا در افزودن متخصص'); }
  };

  return (
    <DashboardLayout salonId={id} activeTab="staff">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--brand-navy-600)' }}>تیم متخصصین</h2>
          <button onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: 'var(--brand-plum-600)' }}>
            <Plus className="w-4 h-4" /> افزودن متخصص
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl p-5 border space-y-3" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
            <input placeholder="نام متخصص *" value={form.displayName} onChange={e => setForm(p => ({...p, displayName: e.target.value}))}
              className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
            <input placeholder="تخصص‌ها (با ، جدا کنید)" value={form.specialties} onChange={e => setForm(p => ({...p, specialties: e.target.value}))}
              className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
            <textarea placeholder="بیوگرافی (اختیاری)" value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={2}
              className="w-full px-4 py-2 rounded-xl border text-sm outline-none resize-none"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={createStaff.isPending}
                className="px-6 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: 'var(--brand-plum-600)' }}>
                {createStaff.isPending ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl border text-sm" style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--ui-gray-500)' }}>انصراف</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'white' }} />)}</div>
        ) : !staff?.length ? (
          <div className="text-center py-16 rounded-2xl border" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
            <div className="text-5xl mb-3">👤</div>
            <p style={{ color: 'var(--ui-gray-500)' }}>هنوز متخصصی اضافه نکرده‌اید</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staff.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-ivory)' }}>
                  {s.avatarUrl ? <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--brand-navy-600)' }}>{s.displayName}</p>
                  {s.specialties?.length > 0 && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--ui-gray-500)' }}>{s.specialties.join('، ')}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--ui-gray-500)' }}>{s.services?.length || 0} خدمت</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

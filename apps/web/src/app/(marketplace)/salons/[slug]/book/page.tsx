'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, Clock, ChevronLeft } from 'lucide-react';
import { useSalonBySlug, useAvailability, useCreateBooking } from '@/lib/api-hooks';
import { formatPrice, toJalali } from '@/lib/utils';

export default function BookPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: salon } = useSalonBySlug(slug);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const { data: slots } = useAvailability({
    salonId: salon?.id || '',
    date: selectedDate,
    serviceId: selectedServices[0] || '',
    staffId: selectedStaff || undefined,
  });

  const createBooking = useCreateBooking();

  const toggleService = (id: string) =>
    setSelectedServices(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const totalPrice = salon?.services
    ?.filter((s: any) => selectedServices.includes(s.id))
    .reduce((sum: number, s: any) => sum + (s.discountPrice ?? s.price), 0) || 0;

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  const handleBook = async () => {
    if (!selectedServices.length) return toast.error('حداقل یک خدمت انتخاب کنید');
    if (!selectedDate) return toast.error('تاریخ را انتخاب کنید');
    if (!selectedTime) return toast.error('ساعت را انتخاب کنید');
    if (!localStorage.getItem('access_token')) { toast.error('لطفاً ابتدا وارد شوید'); return router.push('/login'); }

    try {
      const booking = await createBooking.mutateAsync({
        salonId: salon.id, serviceIds: selectedServices,
        staffId: selectedStaff || undefined, date: selectedDate, time: selectedTime,
      });
      toast.success('رزرو با موفقیت ثبت شد! 🎉');
      router.push('/profile/bookings');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در ثبت رزرو');
    }
  };

  if (!salon) return null;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg" style={{ background: 'var(--color-surface)' }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-xl" style={{ color: 'var(--color-text)' }}>رزرو نوبت</h1>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{salon.name}</p>
          </div>
        </div>

        {/* Step 1: Services */}
        <section className="rounded-2xl p-6 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>۱. انتخاب خدمت</h2>
          <div className="space-y-2">
            {salon.services?.map((s: any) => (
              <label key={s.id} className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors"
                style={{ borderColor: selectedServices.includes(s.id) ? 'var(--color-primary)' : 'var(--color-border)', background: selectedServices.includes(s.id) ? 'var(--color-background)' : 'transparent' }}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selectedServices.includes(s.id)} onChange={() => toggleService(s.id)} className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.durationMinutes} دقیقه</p>
                  </div>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {formatPrice(s.discountPrice ?? s.price)}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Step 2: Staff */}
        {salon.staffProfiles?.length > 0 && (
          <section className="rounded-2xl p-6 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>۲. انتخاب متخصص (اختیاری)</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedStaff('')}
                className="px-4 py-2 rounded-xl text-sm border transition-colors"
                style={{ borderColor: !selectedStaff ? 'var(--color-primary)' : 'var(--color-border)', color: !selectedStaff ? 'var(--color-primary)' : 'var(--color-muted)' }}>
                هر متخصصی
              </button>
              {salon.staffProfiles.map((s: any) => (
                <button key={s.id} onClick={() => setSelectedStaff(s.id)}
                  className="px-4 py-2 rounded-xl text-sm border transition-colors"
                  style={{ borderColor: selectedStaff === s.id ? 'var(--color-primary)' : 'var(--color-border)', color: selectedStaff === s.id ? 'var(--color-primary)' : 'var(--color-text)' }}>
                  {s.displayName}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 3: Date */}
        {selectedServices.length > 0 && (
          <section className="rounded-2xl p-6 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Calendar className="w-4 h-4" /> ۳. انتخاب تاریخ
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map(d => (
                <button key={d} onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                  className="flex-none text-center px-4 py-3 rounded-xl border text-sm transition-colors"
                  style={{ borderColor: selectedDate === d ? 'var(--color-primary)' : 'var(--color-border)', background: selectedDate === d ? 'var(--color-primary)' : 'transparent', color: selectedDate === d ? 'white' : 'var(--color-text)' }}>
                  {toJalali(d)}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 4: Time */}
        {selectedDate && slots && (
          <section className="rounded-2xl p-6 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Clock className="w-4 h-4" /> ۴. انتخاب ساعت
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {(slots as any[]).map((slot: any) => (
                <button key={slot.time} onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className="py-2 rounded-xl text-sm border transition-colors"
                  style={{
                    borderColor: selectedTime === slot.time ? 'var(--color-primary)' : 'var(--color-border)',
                    background: selectedTime === slot.time ? 'var(--color-primary)' : slot.available ? 'transparent' : 'var(--color-background)',
                    color: selectedTime === slot.time ? 'white' : slot.available ? 'var(--color-text)' : 'var(--color-border)',
                    cursor: slot.available ? 'pointer' : 'not-allowed',
                  }}
                  dir="ltr">
                  {slot.time}
                </button>
              ))}
              {(slots as any[]).length === 0 && <p className="col-span-4 text-center py-4 text-sm" style={{ color: 'var(--color-muted)' }}>در این تاریخ ظرفیت خالی وجود ندارد</p>}
            </div>
          </section>
        )}

        {/* Summary + Confirm */}
        {selectedTime && (
          <section className="rounded-2xl p-6 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>خلاصه رزرو</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span style={{ color: 'var(--color-muted)' }}>سالن</span><span style={{ color: 'var(--color-text)' }}>{salon.name}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--color-muted)' }}>تاریخ</span><span style={{ color: 'var(--color-text)' }}>{toJalali(selectedDate)} ساعت {selectedTime}</span></div>
              <div className="flex justify-between font-semibold text-base"><span style={{ color: 'var(--color-text)' }}>مبلغ کل</span><span style={{ color: 'var(--color-primary)' }}>{formatPrice(totalPrice)}</span></div>
            </div>
            <button onClick={handleBook} disabled={createBooking.isPending}
              className="w-full py-4 rounded-xl text-white font-bold text-lg transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}>
              {createBooking.isPending ? 'در حال ثبت...' : 'تأیید و ثبت رزرو 🎉'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, Check, ChevronLeft, Clock, UserRound } from 'lucide-react';
import { useAvailability, useCreateBooking, useSalonBySlug } from '@/lib/api-hooks';
import { formatPrice, toJalali } from '@/lib/utils';

type TimeSlot = {
  time: string;
  available: boolean;
  staffId?: string;
};

type BookingDraft = {
  serviceIds: string[];
  staffId: string;
  date: string;
  time: string;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: salon, isLoading: isSalonLoading, isError: isSalonError } = useSalonBySlug(slug);
  const createBooking = useCreateBooking();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [hasAccessToken, setHasAccessToken] = useState(false);

  const draftKey = `booking-draft:${slug}`;

  useEffect(() => {
    setHasAccessToken(Boolean(localStorage.getItem('access_token')));
    try {
      const savedDraft = sessionStorage.getItem(draftKey);
      if (!savedDraft) return;
      const draft = JSON.parse(savedDraft) as BookingDraft;
      setSelectedServices(Array.isArray(draft.serviceIds) ? draft.serviceIds : []);
      setSelectedStaff(draft.staffId || '');
      setSelectedDate(draft.date || '');
      setSelectedTime(draft.time || '');
    } catch {
      sessionStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  const eligibleStaff = useMemo(() => {
    const staff = salon?.staffProfiles ?? [];
    if (!selectedServices.length) return staff;
    return staff.filter((member: any) => {
      const offeredServices = new Set(
        (member.services ?? []).map((item: { serviceId: string }) => item.serviceId),
      );
      return selectedServices.every((serviceId) => offeredServices.has(serviceId));
    });
  }, [salon?.staffProfiles, selectedServices]);

  useEffect(() => {
    if (selectedStaff && !eligibleStaff.some((member: any) => member.id === selectedStaff)) {
      setSelectedStaff('');
      setSelectedTime('');
    }
  }, [eligibleStaff, selectedStaff]);

  const {
    data: slots = [],
    isLoading: isAvailabilityLoading,
    isError: isAvailabilityError,
  } = useAvailability({
    salonId: salon?.id || '',
    date: selectedDate,
    serviceIds: selectedServices,
    staffId: selectedStaff || undefined,
  });

  const selectedServiceDetails = useMemo(
    () => (salon?.services ?? []).filter((service: any) => selectedServices.includes(service.id)),
    [salon?.services, selectedServices],
  );
  const totalPrice = selectedServiceDetails.reduce(
    (sum: number, service: any) => sum + (service.discountPrice ?? service.price),
    0,
  );
  const totalDuration = selectedServiceDetails.reduce(
    (sum: number, service: any) => sum + service.durationMinutes,
    0,
  );
  const selectedSlot = (slots as TimeSlot[]).find((slot) => slot.time === selectedTime);
  const resolvedStaffId = selectedStaff || selectedSlot?.staffId;
  const resolvedStaff = (salon?.staffProfiles ?? []).find(
    (member: any) => member.id === resolvedStaffId,
  );
  const canContinueStaffSelection = !salon?.staffProfiles?.length || eligibleStaff.length > 0;

  const dates = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index + 1);
        return toDateKey(date);
      }),
    [],
  );

  const toggleService = (id: string) => {
    setSelectedServices((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setSelectedTime('');
  };

  const continueToLogin = () => {
    sessionStorage.setItem(
      draftKey,
      JSON.stringify({
        serviceIds: selectedServices,
        staffId: selectedStaff,
        date: selectedDate,
        time: selectedTime,
      } satisfies BookingDraft),
    );
    const returnTo = `/salons/${slug}/book`;
    router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const handleBook = async () => {
    if (!selectedServices.length) return toast.error('حداقل یک خدمت انتخاب کنید');
    if (!selectedDate) return toast.error('تاریخ را انتخاب کنید');
    if (!selectedTime || !selectedSlot?.available) return toast.error('یک ساعت آزاد انتخاب کنید');
    if (!localStorage.getItem('access_token')) {
      toast.info('برای تکمیل رزرو وارد حساب خود شوید');
      continueToLogin();
      return;
    }

    try {
      await createBooking.mutateAsync({
        salonId: salon.id,
        serviceIds: selectedServices,
        staffId: resolvedStaffId,
        date: selectedDate,
        time: selectedTime,
        preview: {
          salonName: salon.name,
          totalPrice,
          services: selectedServiceDetails.map((service: any) => ({
            id: service.id,
            name: service.name,
            price: service.discountPrice ?? service.price,
          })),
        },
      });
      sessionStorage.removeItem(draftKey);
      toast.success('رزرو با موفقیت ثبت شد');
      router.push('/profile/bookings');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : message || 'ثبت رزرو انجام نشد');
    }
  };

  if (isSalonLoading) {
    return (
      <div className="min-h-screen py-24 px-4" style={{ background: 'var(--color-background)' }}>
        <div className="max-w-2xl mx-auto space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl animate-pulse"
              style={{ background: 'var(--color-surface)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isSalonError || !salon) {
    return (
      <div
        className="min-h-screen py-24 px-4 text-center"
        style={{ background: 'var(--color-background)' }}
      >
        <h1 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
          اطلاعات سالن دریافت نشد
        </h1>
        <button
          onClick={() => router.push('/salons')}
          className="px-5 py-2.5 rounded-xl text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          بازگشت به سالن‌ها
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="بازگشت"
            className="p-2 rounded-lg"
            style={{ background: 'var(--color-surface)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-xl" style={{ color: 'var(--color-text)' }}>
              رزرو نوبت
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {salon.name}
            </p>
          </div>
        </div>

        <section
          className="rounded-2xl p-5 sm:p-6 border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2 className="font-semibold mb-4">۱. انتخاب خدمت</h2>
          <div className="space-y-2">
            {salon.services?.map((service: any) => {
              const selected = selectedServices.includes(service.id);
              return (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-right transition-colors"
                  style={{
                    borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                    background: selected ? 'var(--color-background)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-md border flex items-center justify-center"
                      style={{
                        borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                        background: selected ? 'var(--color-primary)' : 'transparent',
                      }}
                    >
                      {selected && <Check className="w-3.5 h-3.5 text-white" />}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{service.name}</span>
                      <span
                        className="block text-xs mt-0.5"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {service.durationMinutes} دقیقه
                      </span>
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(service.discountPrice ?? service.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {selectedServices.length > 0 && salon.staffProfiles?.length > 0 && (
          <section
            className="rounded-2xl p-5 sm:p-6 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <UserRound className="w-4 h-4" /> ۲. انتخاب متخصص
            </h2>
            {eligibleStaff.length ? (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedStaff('');
                    setSelectedTime('');
                  }}
                  className="px-4 py-2 rounded-xl text-sm border transition-colors"
                  style={{
                    borderColor: !selectedStaff ? 'var(--color-primary)' : 'var(--color-border)',
                    color: !selectedStaff ? 'var(--color-primary)' : 'var(--color-muted)',
                  }}
                >
                  اولین متخصص آزاد
                </button>
                {eligibleStaff.map((member: any) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedStaff(member.id);
                      setSelectedTime('');
                    }}
                    className="px-4 py-2 rounded-xl text-sm border transition-colors"
                    style={{
                      borderColor:
                        selectedStaff === member.id
                          ? 'var(--color-primary)'
                          : 'var(--color-border)',
                      color:
                        selectedStaff === member.id ? 'var(--color-primary)' : 'var(--color-text)',
                    }}
                  >
                    {member.displayName}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                متخصصی که همه خدمات انتخاب‌شده را ارائه کند وجود ندارد؛ ترکیب خدمات را تغییر دهید.
              </p>
            )}
          </section>
        )}

        {selectedServices.length > 0 && canContinueStaffSelection && (
          <section
            className="rounded-2xl p-5 sm:p-6 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> ۳. انتخاب تاریخ
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime('');
                  }}
                  className="flex-none text-center px-4 py-3 rounded-xl border text-sm transition-colors"
                  style={{
                    borderColor:
                      selectedDate === date ? 'var(--color-primary)' : 'var(--color-border)',
                    background: selectedDate === date ? 'var(--color-primary)' : 'transparent',
                    color: selectedDate === date ? 'white' : 'var(--color-text)',
                  }}
                >
                  {toJalali(date)}
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedDate && (
          <section
            className="rounded-2xl p-5 sm:p-6 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> ۴. انتخاب ساعت
            </h2>
            {isAvailabilityLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }, (_, index) => (
                  <div
                    key={index}
                    className="h-10 rounded-xl animate-pulse"
                    style={{ background: 'var(--color-background)' }}
                  />
                ))}
              </div>
            ) : isAvailabilityError ? (
              <p className="text-sm text-center py-4 text-red-600">
                دریافت زمان‌های آزاد ممکن نشد. دوباره تلاش کنید.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(slots as TimeSlot[]).map((slot) => (
                  <button
                    key={`${slot.time}-${slot.staffId ?? 'salon'}`}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className="py-2 rounded-xl text-sm border transition-colors"
                    style={{
                      borderColor:
                        selectedTime === slot.time ? 'var(--color-primary)' : 'var(--color-border)',
                      background:
                        selectedTime === slot.time
                          ? 'var(--color-primary)'
                          : slot.available
                            ? 'transparent'
                            : 'var(--color-background)',
                      color:
                        selectedTime === slot.time
                          ? 'white'
                          : slot.available
                            ? 'var(--color-text)'
                            : 'var(--color-border)',
                      cursor: slot.available ? 'pointer' : 'not-allowed',
                    }}
                    dir="ltr"
                  >
                    {slot.time}
                  </button>
                ))}
                {(slots as TimeSlot[]).length === 0 && (
                  <p
                    className="col-span-full text-center py-4 text-sm"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    در این تاریخ ظرفیت خالی وجود ندارد
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {selectedTime && selectedSlot?.available && (
          <section
            className="rounded-2xl p-5 sm:p-6 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="font-semibold mb-4">خلاصه رزرو</h2>
            <div className="space-y-2 text-sm mb-5">
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--color-muted)' }}>سالن</span>
                <span>{salon.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--color-muted)' }}>خدمات</span>
                <span className="text-left">
                  {selectedServiceDetails.map((service: any) => service.name).join('، ')}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--color-muted)' }}>متخصص</span>
                <span>{resolvedStaff?.displayName ?? 'تخصیص خودکار سالن'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--color-muted)' }}>زمان</span>
                <span>
                  {toJalali(selectedDate)}، ساعت {selectedTime}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--color-muted)' }}>مدت تقریبی</span>
                <span>{totalDuration} دقیقه</span>
              </div>
              <div
                className="flex justify-between font-semibold text-base pt-2 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span>مبلغ کل</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <button
              onClick={handleBook}
              disabled={createBooking.isPending}
              className="w-full py-4 rounded-xl text-white font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {createBooking.isPending
                ? 'در حال ثبت رزرو...'
                : hasAccessToken
                  ? 'تأیید و ثبت رزرو'
                  : 'ورود و تکمیل رزرو'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useStaffBookings, useUpdateStaffBookingStatus } from '@/lib/api-hooks';
import { iranDateInput, toJalali } from '@/lib/utils';
import { useStaffPortal } from '@/components/staff/staff-shell';
import {
  BookingCard,
  EmptyState,
  StaffPageHeader,
  StaffPageLoading,
  STATUS_LABELS,
} from '@/components/staff/staff-ui';

export default function StaffCalendarPage() {
  const { salonId } = useStaffPortal();
  const today = iranDateInput();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [status, setStatus] = useState('');
  const {
    data: bookings = [],
    isLoading,
    isError,
  } = useStaffBookings(salonId, { from, to, status: status || undefined });
  const updateStatus = useUpdateStaffBookingStatus(salonId);

  const grouped = useMemo(() => {
    return bookings.reduce((map: Record<string, any[]>, booking: any) => {
      const key = iranDateInput(booking.startsAt);
      map[key] = [...(map[key] ?? []), booking];
      return map;
    }, {});
  }, [bookings]);

  const handleStatus = async (bookingId: string, nextStatus: string) => {
    if (nextStatus === 'NO_SHOW' && !window.confirm('عدم مراجعه مشتری ثبت شود؟')) return;
    try {
      await updateStatus.mutateAsync({ bookingId, status: nextStatus });
      toast.success('وضعیت نوبت به‌روزرسانی شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'تغییر وضعیت انجام نشد');
    }
  };

  return (
    <div>
      <StaffPageHeader
        title="تقویم نوبت‌ها"
        description="نمای روزانه یا بازه‌ای از نوبت‌هایی که به شما تخصیص یافته است."
      />
      <div className="mb-6 grid gap-3 rounded-2xl border border-[var(--ui-gray-200)] bg-white p-4 sm:grid-cols-3">
        <DateField label="از تاریخ" value={from} onChange={setFrom} />
        <DateField label="تا تاریخ" value={to} onChange={setTo} />
        <label>
          <span className="mb-1.5 flex items-center gap-1 text-xs text-[var(--ui-gray-500)]">
            <Filter size={13} /> وضعیت
          </span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-[var(--ui-gray-200)] px-3 py-2.5 text-sm"
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <StaffPageLoading />
      ) : isError ? (
        <EmptyState
          title="تقویم دریافت نشد"
          description="بازه تاریخ را بررسی و دوباره تلاش کنید."
        />
      ) : !bookings.length ? (
        <EmptyState
          title="نوبتی در این بازه نیست"
          description="می‌توانید تاریخ یا فیلتر وضعیت را تغییر دهید."
        />
      ) : (
        <div className="space-y-7">
          {Object.entries(grouped).map(([date, rows]) => (
            <section key={date}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold text-[var(--brand-navy-600)]">{toJalali(date)}</h2>
                <span className="rounded-full bg-[var(--brand-plum-50)] px-2 py-0.5 text-[10px] text-[var(--brand-plum-600)]">
                  {(rows as any[]).length.toLocaleString('fa-IR')} نوبت
                </span>
              </div>
              <div className="space-y-3">
                {(rows as any[]).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onStatus={handleStatus}
                    pending={updateStatus.isPending}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-xs text-[var(--ui-gray-500)]">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[var(--ui-gray-200)] px-3 py-2 text-sm"
      />
    </label>
  );
}

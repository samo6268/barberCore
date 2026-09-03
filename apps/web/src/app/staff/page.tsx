'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Coins, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useStaffDashboard, useUpdateStaffBookingStatus } from '@/lib/api-hooks';
import { getApiErrorMessage } from '@/lib/api';
import { formatPrice, iranDateInput, toJalali } from '@/lib/utils';
import { useStaffPortal } from '@/components/staff/staff-shell';
import { PersianDatePicker } from '@/components/shared/persian-date-picker';
import {
  BookingCard,
  EmptyState,
  StaffPageHeader,
  StaffPageLoading,
} from '@/components/staff/staff-ui';

export default function StaffTodayPage() {
  const { salonId, membership } = useStaffPortal();
  const [date, setDate] = useState(iranDateInput());
  const { data, isLoading, isError, refetch } = useStaffDashboard(salonId, date);
  const updateStatus = useUpdateStaffBookingStatus(salonId);

  const handleStatus = async (bookingId: string, status: string) => {
    if (status === 'NO_SHOW' && !window.confirm('عدم مراجعه مشتری ثبت شود؟')) return;
    try {
      await updateStatus.mutateAsync({ bookingId, status });
      toast.success('وضعیت نوبت به‌روزرسانی شد');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'تغییر وضعیت انجام نشد'));
    }
  };

  return (
    <div>
      <StaffPageHeader
        title={`سلام ${membership.displayName.split(' ')[0]}`}
        description={`${toJalali(date)}؛ برنامه روزانه شما در ${membership.salon.name}`}
        action={
          <PersianDatePicker
            value={date}
            onChange={setDate}
            ariaLabel="تاریخ برنامه روزانه"
            className="w-full sm:w-64"
          />
        }
      />

      {isLoading ? (
        <StaffPageLoading />
      ) : isError ? (
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
          <p className="text-sm text-red-600">دریافت برنامه روزانه انجام نشد.</p>
          <button
            onClick={() => refetch()}
            className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-[var(--brand-navy-600)] px-4 py-2 text-xs text-white"
          >
            <RefreshCw size={14} /> تلاش دوباره
          </button>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Metric
              icon={CalendarDays}
              label="کل نوبت‌ها"
              value={data.summary.total.toLocaleString('fa-IR')}
              hint={`${data.summary.pending.toLocaleString('fa-IR')} در انتظار`}
            />
            <Metric
              icon={CheckCircle2}
              label="تکمیل‌شده"
              value={data.summary.completed.toLocaleString('fa-IR')}
              hint={`${data.summary.inProgress.toLocaleString('fa-IR')} در حال انجام`}
            />
            <Metric
              icon={Clock3}
              label="زمان رزروشده"
              value={`${Math.round(data.summary.minutesBooked / 60).toLocaleString('fa-IR')} ساعت`}
              hint="بدون لغو و عدم مراجعه"
            />
            <Metric
              icon={Coins}
              label="پورسانت برآوردی"
              value={formatPrice(data.summary.estimatedCommission)}
              hint="مبلغ قطعی در تسویه"
            />
          </section>

          {data.currentBookingId && (
            <div className="mt-6 rounded-2xl bg-[var(--brand-plum-600)] px-5 py-3 text-sm font-medium text-white">
              یک خدمت در حال انجام دارید. پس از پایان، وضعیت آن را تکمیل کنید.
            </div>
          )}

          <section className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[var(--brand-navy-600)]">نوبت‌های روز</h2>
                <p className="mt-1 text-xs text-[var(--ui-gray-500)]">
                  اطلاعات مشتری فقط برای نوبت‌های منتسب به شما نمایش داده می‌شود.
                </p>
              </div>
              <Link
                href="/staff/calendar"
                className="text-xs font-semibold text-[var(--brand-plum-600)]"
              >
                مشاهده تقویم
              </Link>
            </div>
            {!data.bookings.length ? (
              <EmptyState
                title="امروز نوبتی ندارید"
                description="در صورت ثبت یا تغییر نوبت، برنامه این صفحه خودکار به‌روزرسانی می‌شود."
              />
            ) : (
              <div className="space-y-3">
                {data.bookings.map((booking: any) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    emphasized={
                      booking.id === data.currentBookingId || booking.id === data.nextBookingId
                    }
                    onStatus={handleStatus}
                    pending={updateStatus.isPending}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-7 grid gap-4 md:grid-cols-2">
            <Link
              href="/staff/notifications"
              className="rounded-2xl border border-[var(--ui-gray-200)] bg-white p-5"
            >
              <p className="text-xs text-[var(--ui-gray-500)]">اعلان‌های خوانده‌نشده</p>
              <p className="mt-2 text-xl font-bold text-[var(--brand-navy-600)]">
                {data.summary.unreadNotifications.toLocaleString('fa-IR')}
              </p>
            </Link>
            <Link
              href="/staff/settlements"
              className="rounded-2xl border border-[var(--ui-gray-200)] bg-white p-5"
            >
              <p className="text-xs text-[var(--ui-gray-500)]">آخرین وضعیت تسویه</p>
              <p className="mt-2 text-sm font-bold text-[var(--brand-navy-600)]">
                {data.latestSettlement
                  ? `${settlementLabel(data.latestSettlement.status)} — ${formatPrice(data.latestSettlement.netPayable)}`
                  : 'هنوز تسویه‌ای ثبت نشده است'}
              </p>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--ui-gray-200)] bg-white p-4 sm:p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-plum-50)] text-[var(--brand-plum-600)]">
        <Icon size={18} />
      </div>
      <p className="mt-4 text-xs text-[var(--ui-gray-500)]">{label}</p>
      <p className="mt-1 text-metric font-bold text-[var(--brand-navy-600)]">{value}</p>
      <p className="mt-1 text-caption text-[var(--ui-gray-400)] sm:text-xs">{hint}</p>
    </div>
  );
}

function settlementLabel(status: string) {
  return (
    (
      {
        DRAFT: 'پیش‌نویس',
        APPROVED: 'تأییدشده',
        PAID: 'پرداخت‌شده',
        CANCELLED: 'لغوشده',
      } as Record<string, string>
    )[status] ?? status
  );
}

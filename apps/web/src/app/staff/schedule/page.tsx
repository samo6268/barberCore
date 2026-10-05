'use client';

import { useEffect, useState } from 'react';
import { CalendarOff, Plus, Save, Trash2 } from '@barbercore/ui/icons';
import { toast } from 'sonner';
import {
  useCreateStaffTimeOff,
  useDeleteStaffTimeOff,
  useStaffSchedule,
  useUpdateStaffSchedule,
} from '@/lib/api-hooks';
import { getApiErrorMessage } from '@/lib/api';
import { formatTime, toJalali } from '@/lib/utils';
import { useStaffPortal } from '@/components/staff/staff-shell';
import { PersianDateTimePicker } from '@/components/shared/persian-date-picker';
import { EmptyState, StaffPageHeader, StaffPageLoading } from '@/components/staff/staff-ui';

const DAYS = [
  { key: 'SATURDAY', label: 'شنبه' },
  { key: 'SUNDAY', label: 'یکشنبه' },
  { key: 'MONDAY', label: 'دوشنبه' },
  { key: 'TUESDAY', label: 'سه‌شنبه' },
  { key: 'WEDNESDAY', label: 'چهارشنبه' },
  { key: 'THURSDAY', label: 'پنجشنبه' },
  { key: 'FRIDAY', label: 'جمعه' },
];

type WorkingDay = {
  dayOfWeek: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart: string;
  breakEnd: string;
};

export default function StaffSchedulePage() {
  const { salonId } = useStaffPortal();
  const { data, isLoading } = useStaffSchedule(salonId);
  const updateSchedule = useUpdateStaffSchedule(salonId);
  const createTimeOff = useCreateStaffTimeOff(salonId);
  const deleteTimeOff = useDeleteStaffTimeOff(salonId);
  const [days, setDays] = useState<WorkingDay[]>([]);
  const [showTimeOff, setShowTimeOff] = useState(false);
  const [timeOff, setTimeOff] = useState({ startsAt: '', endsAt: '', reason: '' });

  useEffect(() => {
    if (!data) return;
    setDays(
      DAYS.map((day) => {
        const existing = data.hours.find((row: any) => row.dayOfWeek === day.key);
        return {
          dayOfWeek: day.key,
          isOpen: existing?.isOpen ?? false,
          openTime: existing?.openTime ?? '09:00',
          closeTime: existing?.closeTime ?? '18:00',
          breakStart: existing?.breakStart ?? '',
          breakEnd: existing?.breakEnd ?? '',
        };
      }),
    );
  }, [data]);

  const updateDay = (index: number, patch: Partial<WorkingDay>) => {
    setDays((current) =>
      current.map((day, dayIndex) => (dayIndex === index ? { ...day, ...patch } : day)),
    );
  };

  const saveSchedule = async () => {
    try {
      await updateSchedule.mutateAsync(
        days.map((day) => ({
          ...day,
          breakStart: day.breakStart || undefined,
          breakEnd: day.breakEnd || undefined,
        })),
      );
      toast.success('برنامه هفتگی ذخیره شد');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'ذخیره برنامه انجام نشد'));
    }
  };

  const addTimeOff = async () => {
    if (!timeOff.startsAt || !timeOff.endsAt)
      return toast.error('شروع و پایان زمان مسدود را وارد کنید');
    try {
      await createTimeOff.mutateAsync({
        startsAt: new Date(timeOff.startsAt).toISOString(),
        endsAt: new Date(timeOff.endsAt).toISOString(),
        reason: timeOff.reason.trim() || undefined,
      });
      setTimeOff({ startsAt: '', endsAt: '', reason: '' });
      setShowTimeOff(false);
      toast.success('زمان مسدود ثبت شد');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'ثبت زمان مسدود انجام نشد'));
    }
  };

  const removeTimeOff = async (id: string) => {
    if (!window.confirm('این زمان مسدود حذف شود؟')) return;
    try {
      await deleteTimeOff.mutateAsync(id);
      toast.success('زمان مسدود حذف شد');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'حذف زمان مسدود انجام نشد'));
    }
  };

  return (
    <div>
      <StaffPageHeader
        title="برنامه کاری"
        description="شیفت‌های هفتگی، زمان استراحت و زمان‌های شخصی خود را مدیریت کنید."
        action={
          <button
            onClick={saveSchedule}
            disabled={updateSchedule.isPending || !days.length}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-plum-600)] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Save size={15} /> ذخیره برنامه
          </button>
        }
      />

      {data?.usesSalonDefaults && (
        <div className="mb-5 rounded-2xl border border-[var(--brand-gold-200)] bg-[var(--brand-gold-50)] px-4 py-3 text-xs leading-6 text-[var(--brand-gold-900)]">
          برنامه فعلی از ساعات عمومی سالن گرفته شده است. با ذخیره، برنامه شخصی شما جایگزین آن
          می‌شود.
        </div>
      )}

      {isLoading ? (
        <StaffPageLoading />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-[var(--ui-gray-200)] bg-white">
          <div className="hidden grid-cols-[130px_90px_1fr_1fr_1fr] gap-3 border-b border-[var(--ui-gray-100)] bg-[var(--bg-ivory)] px-5 py-3 text-xs text-[var(--ui-gray-500)] md:grid">
            <span>روز</span>
            <span>فعال</span>
            <span>شروع و پایان</span>
            <span>شروع استراحت</span>
            <span>پایان استراحت</span>
          </div>
          <div className="divide-y divide-[var(--ui-gray-100)]">
            {days.map((day, index) => (
              <div
                key={day.dayOfWeek}
                className="grid gap-3 px-4 py-4 md:grid-cols-[130px_90px_1fr_1fr_1fr] md:items-center md:px-5"
              >
                <span className="text-sm font-semibold text-[var(--brand-navy-600)]">
                  {DAYS[index].label}
                </span>
                <label className="flex items-center gap-2 text-xs text-[var(--ui-gray-500)]">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(event) => updateDay(index, { isOpen: event.target.checked })}
                    className="h-4 w-4 accent-[var(--brand-plum-600)]"
                  />
                  {day.isOpen ? 'کاری' : 'تعطیل'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <TimeInput
                    value={day.openTime}
                    disabled={!day.isOpen}
                    onChange={(value) => updateDay(index, { openTime: value })}
                    ariaLabel={`شروع ${DAYS[index].label}`}
                  />
                  <TimeInput
                    value={day.closeTime}
                    disabled={!day.isOpen}
                    onChange={(value) => updateDay(index, { closeTime: value })}
                    ariaLabel={`پایان ${DAYS[index].label}`}
                  />
                </div>
                <TimeInput
                  value={day.breakStart}
                  disabled={!day.isOpen}
                  onChange={(value) => updateDay(index, { breakStart: value })}
                  ariaLabel={`شروع استراحت ${DAYS[index].label}`}
                />
                <TimeInput
                  value={day.breakEnd}
                  disabled={!day.isOpen}
                  onChange={(value) => updateDay(index, { breakEnd: value })}
                  ariaLabel={`پایان استراحت ${DAYS[index].label}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[var(--brand-navy-600)]">مرخصی و زمان‌های مسدود</h2>
            <p className="mt-1 text-xs text-[var(--ui-gray-500)]">
              این بازه‌ها از زمان‌های قابل رزرو شما حذف می‌شوند.
            </p>
          </div>
          <button
            onClick={() => setShowTimeOff((value) => !value)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--ui-gray-200)] bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-navy-500)]"
          >
            <Plus size={14} /> ثبت زمان
          </button>
        </div>

        {showTimeOff && (
          <div className="mb-4 grid gap-3 rounded-2xl border border-[var(--ui-gray-200)] bg-white p-4 md:grid-cols-3">
            <DateTimeField
              label="شروع"
              value={timeOff.startsAt}
              onChange={(value) => setTimeOff((current) => ({ ...current, startsAt: value }))}
            />
            <DateTimeField
              label="پایان"
              value={timeOff.endsAt}
              onChange={(value) => setTimeOff((current) => ({ ...current, endsAt: value }))}
            />
            <label>
              <span className="mb-1.5 block text-xs text-[var(--ui-gray-500)]">دلیل</span>
              <input
                value={timeOff.reason}
                onChange={(event) =>
                  setTimeOff((current) => ({ ...current, reason: event.target.value }))
                }
                placeholder="مرخصی، کار شخصی، جلسه..."
                className="w-full rounded-xl border border-[var(--ui-gray-200)] px-3 py-2.5 text-sm"
              />
            </label>
            <div className="flex gap-2 md:col-span-3">
              <button
                onClick={addTimeOff}
                disabled={createTimeOff.isPending}
                className="rounded-xl bg-[var(--brand-plum-600)] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                ثبت
              </button>
              <button
                onClick={() => setShowTimeOff(false)}
                className="rounded-xl border border-[var(--ui-gray-200)] px-5 py-2.5 text-xs"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        {!data?.timeOff?.length ? (
          <EmptyState
            icon={CalendarOff}
            title="زمان مسدودی ثبت نشده"
            description="برای مرخصی، استراحت خارج از برنامه یا کار شخصی یک بازه ثبت کنید."
          />
        ) : (
          <div className="space-y-3">
            {data.timeOff.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--ui-gray-200)] bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-navy-600)]">
                    {item.reason || 'زمان شخصی'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ui-gray-500)]">
                    {toJalali(item.startsAt)}، {formatTime(item.startsAt)} تا{' '}
                    {toJalali(item.endsAt)}، {formatTime(item.endsAt)}
                  </p>
                </div>
                <button
                  onClick={() => removeTimeOff(item.id)}
                  disabled={deleteTimeOff.isPending}
                  className="rounded-xl border border-red-100 p-2 text-red-600 disabled:opacity-50"
                  aria-label="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TimeInput({
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  ariaLabel: string;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
      className="min-w-0 rounded-xl border border-[var(--ui-gray-200)] px-2 py-2 text-sm disabled:bg-[var(--ui-gray-50)] disabled:opacity-50"
    />
  );
}

const DateTimeField = PersianDateTimePicker;

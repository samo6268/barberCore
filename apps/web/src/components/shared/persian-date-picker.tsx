'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from '@daypicker/persian';
import type { ChevronProps, Matcher } from '@daypicker/react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  X,
} from '@barbercore/ui/icons';
import { cn } from '@/lib/utils';

type PersianDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
};

const toDate = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day, 12);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatPersianDate = (value: string) => {
  const date = toDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

function CalendarChevron({ orientation = 'left', size = 18, className }: ChevronProps) {
  const icons = {
    left: ChevronLeft,
    right: ChevronRight,
    up: ChevronUp,
    down: ChevronDown,
  };
  const Icon = icons[orientation];
  return <Icon size={size} className={className} />;
}

export function PersianDatePicker({
  value,
  onChange,
  label,
  placeholder = 'انتخاب تاریخ',
  min,
  max,
  disabled = false,
  clearable = false,
  className,
  buttonClassName,
  ariaLabel,
}: PersianDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = toDate(value);
  const minDate = toDate(min);
  const maxDate = toDate(max);
  const minTime = minDate?.getTime();
  const maxTime = maxDate?.getTime();

  const disabledDays = useMemo(() => {
    const matchers: Matcher[] = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers;
  }, [maxTime, minTime]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayDisabled = (minDate ? today < minDate : false) || (maxDate ? today > maxDate : false);

  return (
    <div ref={containerRef} className={cn('relative min-w-0', className)}>
      {label && (
        <span className="mb-1.5 block type-caption text-[var(--ui-gray-500)]">{label}</span>
      )}
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel || label || placeholder}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex min-h-11 w-full items-center gap-2.5 rounded-xl border border-[var(--ui-gray-200)] bg-white px-3 text-right type-body-sm text-[var(--brand-navy-600)] outline-none transition',
          'hover:border-[var(--brand-plum-200)] focus-visible:border-[var(--brand-plum-600)] focus-visible:ring-4 focus-visible:ring-[var(--brand-plum-50)] disabled:cursor-not-allowed disabled:bg-[var(--ui-gray-50)] disabled:opacity-60',
          open && 'border-[var(--brand-plum-600)] ring-4 ring-[var(--brand-plum-50)]',
          buttonClassName,
        )}
      >
        <CalendarDays size={17} className="shrink-0 text-[var(--brand-plum-600)]" />
        <span className={cn('min-w-0 flex-1 truncate', !value && 'text-[var(--ui-gray-400)]')}>
          {value ? formatPersianDate(value) : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={cn(
            'shrink-0 text-[var(--ui-gray-400)] transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[79] bg-[#1f1b1d]/25 backdrop-blur-[1px] sm:hidden"
            onClick={() => setOpen(false)}
            aria-label="بستن تقویم"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label || 'انتخاب تاریخ'}
            className="fixed inset-x-4 top-1/2 z-[80] mx-auto w-[calc(100%-2rem)] max-w-[360px] -translate-y-1/2 rounded-2xl border border-[var(--ui-gray-200)] bg-white p-4 shadow-[0_24px_70px_rgba(35,28,31,0.22)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px] sm:translate-y-0"
          >
            <div className="mb-2 flex items-center justify-between border-b border-[var(--ui-gray-100)] pb-3 sm:hidden">
              <span className="type-label text-[var(--brand-navy-600)]">
                {label || 'انتخاب تاریخ'}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-[var(--ui-gray-500)] hover:bg-[var(--ui-gray-50)]"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>

            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={selected || minDate || undefined}
              onSelect={(date) => {
                if (!date) return;
                onChange(toDateInput(date));
                setOpen(false);
              }}
              disabled={disabledDays}
              startMonth={minDate}
              endMonth={maxDate}
              captionLayout="dropdown"
              navLayout="around"
              fixedWeeks
              showOutsideDays
              animate
              components={{ Chevron: CalendarChevron }}
              className="parnegarin-calendar"
            />

            <div className="mt-3 flex items-center justify-between border-t border-[var(--ui-gray-100)] pt-3">
              <button
                type="button"
                disabled={todayDisabled}
                onClick={() => {
                  onChange(toDateInput(today));
                  setOpen(false);
                }}
                className="type-button text-[var(--brand-plum-600)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                امروز
              </button>
              {clearable && value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                  className="inline-flex items-center gap-1 type-caption text-[var(--ui-gray-500)] hover:text-red-600"
                >
                  <X size={14} /> پاک‌کردن
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type PersianDateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  min?: string;
  disabled?: boolean;
};

export function PersianDateTimePicker({
  value,
  onChange,
  label,
  min,
  disabled,
}: PersianDateTimePickerProps) {
  const [date = '', time = '09:00'] = value.split('T');
  const minDate = min?.split('T')[0];

  return (
    <div>
      {label && (
        <span className="mb-1.5 block type-caption text-[var(--ui-gray-500)]">{label}</span>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_104px] gap-2">
        <PersianDatePicker
          value={date}
          onChange={(nextDate) => onChange(`${nextDate}T${time || '09:00'}`)}
          min={minDate}
          disabled={disabled}
          ariaLabel={label ? `تاریخ ${label}` : 'انتخاب تاریخ'}
        />
        <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--ui-gray-200)] bg-white px-3 transition focus-within:border-[var(--brand-plum-600)] focus-within:ring-4 focus-within:ring-[var(--brand-plum-50)]">
          <Clock3 size={16} className="shrink-0 text-[var(--brand-plum-600)]" />
          <input
            type="time"
            value={time}
            disabled={disabled}
            aria-label={label ? `ساعت ${label}` : 'انتخاب ساعت'}
            onChange={(event) =>
              onChange(`${date || toDateInput(new Date())}T${event.target.value}`)
            }
            className="min-w-0 flex-1 bg-transparent type-body-sm text-[var(--brand-navy-600)] outline-none disabled:opacity-60"
          />
        </label>
      </div>
    </div>
  );
}

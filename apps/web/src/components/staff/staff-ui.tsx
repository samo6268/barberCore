'use client';

import { CalendarClock, Check, CirclePlay, Phone, UserX } from '@barbercore/ui/icons';
import { formatPrice, formatTime } from '@/lib/utils';

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'در انتظار تأیید',
  CONFIRMED: 'تأییدشده',
  IN_PROGRESS: 'در حال انجام',
  COMPLETED: 'تکمیل‌شده',
  CANCELLED: 'لغوشده',
  NO_SHOW: 'عدم مراجعه',
  WAITLISTED: 'فهرست انتظار',
};

export const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  PENDING: { color: '#b45309', bg: '#fffbeb' },
  CONFIRMED: { color: '#047857', bg: '#ecfdf5' },
  IN_PROGRESS: { color: '#6d28d9', bg: '#f5f3ff' },
  COMPLETED: { color: '#1d4ed8', bg: '#eff6ff' },
  CANCELLED: { color: '#b91c1c', bg: '#fef2f2' },
  NO_SHOW: { color: '#4b5563', bg: '#f3f4f6' },
  WAITLISTED: { color: '#9a3412', bg: '#fff7ed' },
};

export function StatusBadge({ status }: { status: string }) {
  const palette = STATUS_COLORS[status] ?? STATUS_COLORS.NO_SHOW;
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-caption font-semibold"
      style={{ color: palette.color, background: palette.bg }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function StaffPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--brand-navy-600)] sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-[var(--ui-gray-500)]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function BookingCard({
  booking,
  emphasized = false,
  onStatus,
  pending = false,
}: {
  booking: any;
  emphasized?: boolean;
  onStatus: (bookingId: string, status: string) => void;
  pending?: boolean;
}) {
  const noShowAvailable = new Date(booking.startsAt).getTime() <= Date.now();
  const services = booking.items
    ?.map((item: any) => item.service?.name)
    .filter(Boolean)
    .join('، ');
  return (
    <article
      className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: emphasized ? 'var(--brand-plum-300)' : 'var(--ui-gray-200)' }}
    >
      {emphasized && <div className="h-1 bg-[var(--brand-plum-600)]" />}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 shrink-0 rounded-xl bg-[var(--bg-ivory)] px-2 py-3 text-center">
            <p dir="ltr" className="text-base font-bold text-[var(--brand-plum-600)]">
              {formatTime(booking.startsAt)}
            </p>
            <p dir="ltr" className="mt-0.5 text-caption text-[var(--ui-gray-500)]">
              تا {formatTime(booking.endsAt)}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="truncate text-sm font-bold text-[var(--brand-navy-600)] sm:text-base">
                {booking.customer?.firstName} {booking.customer?.lastName}
              </h2>
              <StatusBadge status={booking.status} />
            </div>
            <p className="mt-1 text-sm text-[var(--ui-gray-600)]">{services || 'خدمت ثبت‌نشده'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ui-gray-500)]">
              <span>{formatPrice(booking.totalPrice)}</span>
              <span>
                {booking.items
                  ?.reduce((sum: number, item: any) => sum + (item.duration || 0), 0)
                  .toLocaleString('fa-IR')}{' '}
                دقیقه
              </span>
              {booking.customer?.phone && (
                <a
                  dir="ltr"
                  href={`tel:${booking.customer.phone}`}
                  className="flex items-center gap-1 text-[var(--brand-plum-600)]"
                >
                  <Phone size={12} /> {booking.customer.phone}
                </a>
              )}
            </div>
            {booking.notes && (
              <p className="mt-3 rounded-xl bg-[var(--brand-gold-50)] px-3 py-2 text-xs leading-6 text-[var(--brand-navy-500)]">
                یادداشت مشتری: {booking.notes}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--ui-gray-100)] pt-4">
          {booking.status === 'PENDING' && (
            <ActionButton
              icon={Check}
              label="تأیید نوبت"
              onClick={() => onStatus(booking.id, 'CONFIRMED')}
              disabled={pending}
              primary
            />
          )}
          {booking.status === 'CONFIRMED' && (
            <>
              <ActionButton
                icon={CirclePlay}
                label="شروع خدمت"
                onClick={() => onStatus(booking.id, 'IN_PROGRESS')}
                disabled={pending}
                primary
              />
              <ActionButton
                icon={UserX}
                label={noShowAvailable ? 'عدم مراجعه' : 'عدم مراجعه (پس از موعد)'}
                onClick={() => onStatus(booking.id, 'NO_SHOW')}
                disabled={pending || !noShowAvailable}
                title={noShowAvailable ? undefined : 'این عملیات پس از رسیدن زمان نوبت فعال می‌شود'}
              />
            </>
          )}
          {booking.status === 'IN_PROGRESS' && (
            <ActionButton
              icon={Check}
              label="تکمیل خدمت"
              onClick={() => onStatus(booking.id, 'COMPLETED')}
              disabled={pending}
              primary
            />
          )}
          {!['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status) && (
            <span className="flex items-center gap-1 text-xs text-[var(--ui-gray-400)]">
              <CalendarClock size={14} /> عملیات این نوبت پایان یافته است
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  primary = false,
  title,
}: {
  icon: typeof Check;
  label: string;
  onClick: () => void;
  disabled: boolean;
  primary?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold disabled:opacity-50"
      style={{
        color: primary ? 'white' : 'var(--brand-navy-500)',
        background: primary ? 'var(--brand-plum-600)' : 'white',
        borderColor: primary ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)',
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

export function StaffPageLoading() {
  return (
    <div className="space-y-4">
      <div className="h-20 animate-pulse rounded-2xl bg-white" />
      <div className="h-40 animate-pulse rounded-2xl bg-white" />
      <div className="h-40 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

export function EmptyState({
  icon: Icon = CalendarClock,
  title,
  description,
}: {
  icon?: typeof CalendarClock;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--ui-gray-300)] bg-white px-5 py-14 text-center">
      <Icon className="mx-auto text-[var(--brand-plum-300)]" size={40} />
      <h2 className="mt-4 font-bold text-[var(--brand-navy-600)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[var(--ui-gray-500)]">
        {description}
      </p>
    </div>
  );
}

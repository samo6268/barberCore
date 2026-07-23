'use client';
import { useCancelBooking, useMyBookings } from '@/lib/api-hooks';
import { toJalali, formatPrice } from '@/lib/utils';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  CONFIRMED: { label: 'تأیید شده', color: '#16a34a', icon: <CheckCircle className="w-4 h-4" /> },
  PENDING: { label: 'در انتظار', color: '#d97706', icon: <Clock className="w-4 h-4" /> },
  COMPLETED: { label: 'انجام شده', color: '#2563eb', icon: <CheckCircle className="w-4 h-4" /> },
  CANCELLED: { label: 'لغو شده', color: '#dc2626', icon: <XCircle className="w-4 h-4" /> },
  IN_PROGRESS: { label: 'در حال انجام', color: '#7c3aed', icon: <Clock className="w-4 h-4" /> },
  NO_SHOW: { label: 'حضور نیافت', color: '#9ca3af', icon: <XCircle className="w-4 h-4" /> },
};

export default function BookingsPage() {
  const { data, isLoading, isError, refetch } = useMyBookings();
  const cancelBooking = useCancelBooking();
  const bookings = data?.data ?? [];

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('از لغو این رزرو مطمئن هستید؟')) return;
    try {
      await cancelBooking.mutateAsync({ id: bookingId, reason: 'لغو توسط مشتری' });
      toast.success('رزرو لغو شد');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : message || 'لغو رزرو انجام نشد');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold mb-6 flex items-center gap-2"
          style={{ color: 'var(--color-text)' }}
        >
          <Calendar className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> رزروهای من
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl animate-pulse"
                  style={{ background: 'var(--color-surface)' }}
                />
              ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <XCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
            <p className="mb-4" style={{ color: 'var(--color-text)' }}>
              دریافت رزروها انجام نشد
            </p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 rounded-xl text-sm text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              تلاش دوباره
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>
              هنوز رزروی ثبت نکرده‌اید
            </p>
            <Link
              href="/salons"
              className="inline-block mt-4 px-6 py-3 rounded-xl text-white font-medium"
              style={{ background: 'var(--color-primary)' }}
            >
              جستجوی سالن
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any) => {
              const s = STATUS_LABELS[b.status] || STATUS_LABELS.PENDING;
              const canCancel =
                ['PENDING', 'CONFIRMED'].includes(b.status) &&
                new Date(b.startsAt).getTime() > Date.now();
              return (
                <div
                  key={b.id}
                  className="rounded-2xl p-5 border"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {b.salon?.logoUrl ? (
                        <img
                          src={b.salon.logoUrl}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                          style={{ background: 'var(--color-background)' }}
                        >
                          ✂️
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                          {b.salon?.name}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          {toJalali(b.startsAt)} —{' '}
                          {new Date(b.startsAt).toLocaleTimeString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                      style={{ color: s.color, background: `${s.color}18` }}
                    >
                      {s.icon} {s.label}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.items?.map((item: any) => (
                      <span
                        key={item.id}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: 'var(--color-background)',
                          color: 'var(--color-muted)',
                        }}
                      >
                        {item.service?.name}
                      </span>
                    ))}
                  </div>

                  {b.staff?.displayName && (
                    <p className="text-xs mt-3" style={{ color: 'var(--color-muted)' }}>
                      متخصص: {b.staff.displayName}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {formatPrice(b.totalPrice)}
                    </span>
                    <div className="flex items-center gap-2">
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancelBooking.isPending}
                          className="text-xs px-3 py-1.5 rounded-lg border font-medium disabled:opacity-50"
                          style={{ borderColor: '#dc2626', color: '#dc2626' }}
                        >
                          لغو رزرو
                        </button>
                      )}
                      {b.status === 'COMPLETED' && (
                        <Link
                          href={`/reviews/new?bookingId=${b.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                          style={{
                            borderColor: 'var(--color-primary)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          ثبت نظر
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

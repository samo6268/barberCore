'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSalonBookings, useUpdateBookingStatus } from '@/lib/api-hooks';
import { toJalali, formatPrice, formatTime } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { toast } from 'sonner';

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
};

export default function SalonBookingsPage() {
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: bookings, isLoading, isError, refetch } = useSalonBookings(id, date);
  const updateStatus = useUpdateBookingStatus(id, date);

  const STATUS_COLORS: Record<string, string> = {
    CONFIRMED: '#16a34a', PENDING: '#d97706', COMPLETED: '#2563eb',
    CANCELLED: '#dc2626', IN_PROGRESS: '#7c3aed',
    NO_SHOW: '#6b7280',
  };
  const STATUS_LABELS: Record<string, string> = {
    CONFIRMED: 'تأیید شده', PENDING: 'در انتظار', COMPLETED: 'انجام شده',
    CANCELLED: 'لغو شده', IN_PROGRESS: 'در حال انجام',
    NO_SHOW: 'حضور نیافت',
  };

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ bookingId, status });
      toast.success('وضعیت رزرو به‌روزرسانی شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'تغییر وضعیت انجام نشد');
    }
  };

  return (
    <DashboardLayout salonId={id} activeTab="bookings">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--brand-navy-600)' }}>رزروها</h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--ui-gray-500)' }} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'white', color: 'var(--brand-navy-600)' }} />
          </div>
        </div>

        <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>
          {toJalali(date)} — {bookings?.length || 0} رزرو
        </p>

        {isLoading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'white' }} />)}</div>
        ) : isError ? (
          <div className="text-center py-16 rounded-2xl border" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
            <p style={{ color: 'var(--ui-gray-500)' }}>دریافت رزروها انجام نشد</p>
            <button onClick={() => refetch()} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-medium text-white" style={{ background: 'var(--brand-navy-600)' }}>
              تلاش دوباره
            </button>
          </div>
        ) : !bookings?.length ? (
          <div className="text-center py-16 rounded-2xl border" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
            <div className="text-5xl mb-3">📭</div>
            <p style={{ color: 'var(--ui-gray-500)' }}>در این روز رزروی وجود ندارد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: any) => {
              const color = STATUS_COLORS[b.status] || '#6b7280';
              return (
                <div key={b.id} className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
                  <div className="w-14 text-center">
                    <p className="font-bold text-sm" dir="ltr" style={{ color: 'var(--brand-plum-600)' }}>
                      {formatTime(b.startsAt)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--ui-gray-500)' }}>
                      {formatTime(b.endsAt)}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: 'var(--brand-navy-600)' }}>
                      {b.customer?.firstName} {b.customer?.lastName}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--ui-gray-500)' }}>
                      {b.items?.map((i: any) => i.service?.name).join('، ')}
                    </p>
                    {b.staff && <p className="text-xs" style={{ color: 'var(--ui-gray-500)' }}>👤 {b.staff.displayName}</p>}
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color, background: `${color}18` }}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                    <p className="text-sm font-semibold mt-1" style={{ color: 'var(--brand-plum-600)' }}>{formatPrice(b.totalPrice)}</p>
                    {!!NEXT_STATUSES[b.status]?.length && (
                      <select
                        value=""
                        onChange={(event) => {
                          if (event.target.value) handleStatusChange(b.id, event.target.value);
                        }}
                        disabled={updateStatus.isPending}
                        className="mt-2 max-w-36 rounded-lg border px-2 py-1 text-xs outline-none disabled:opacity-50"
                        style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)' }}
                      >
                        <option value="">تغییر وضعیت</option>
                        {NEXT_STATUSES[b.status].map((status) => (
                          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

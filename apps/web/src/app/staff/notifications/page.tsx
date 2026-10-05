'use client';

import { Bell, CheckCheck } from '@barbercore/ui/icons';
import {
  useReadAllStaffNotifications,
  useReadStaffNotification,
  useStaffNotifications,
} from '@/lib/api-hooks';
import { toJalali, formatTime } from '@/lib/utils';
import { useStaffPortal } from '@/components/staff/staff-shell';
import { EmptyState, StaffPageHeader, StaffPageLoading } from '@/components/staff/staff-ui';

export default function StaffNotificationsPage() {
  const { salonId } = useStaffPortal();
  const { data: notifications = [], isLoading } = useStaffNotifications(salonId);
  const readOne = useReadStaffNotification(salonId);
  const readAll = useReadAllStaffNotifications(salonId);
  const unread = notifications.filter((item: any) => !item.readAt).length;

  return (
    <div>
      <StaffPageHeader
        title="اعلان‌ها"
        description={`${unread.toLocaleString('fa-IR')} اعلان خوانده‌نشده درباره برنامه کاری شما`}
        action={
          unread > 0 ? (
            <button
              onClick={() => readAll.mutate()}
              disabled={readAll.isPending}
              className="flex items-center gap-2 rounded-xl border border-[var(--ui-gray-200)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--brand-navy-500)] disabled:opacity-50"
            >
              <CheckCheck size={15} /> خواندن همه
            </button>
          ) : undefined
        }
      />
      {isLoading ? (
        <StaffPageLoading />
      ) : !notifications.length ? (
        <EmptyState
          icon={Bell}
          title="اعلانی ندارید"
          description="رزرو جدید، تغییر یا لغو نوبت و پیام‌های سالن در این بخش نمایش داده می‌شود."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((item: any) => (
            <button
              key={item.id}
              onClick={() => !item.readAt && readOne.mutate(item.id)}
              className="flex w-full items-start gap-4 rounded-2xl border bg-white p-4 text-right sm:p-5"
              style={{
                borderColor: item.readAt ? 'var(--ui-gray-200)' : 'var(--brand-plum-200)',
                boxShadow: item.readAt ? 'none' : '0 4px 20px rgba(75,36,74,.06)',
              }}
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-plum-50)] text-[var(--brand-plum-600)]">
                <Bell size={18} />
                {!item.readAt && (
                  <span className="absolute -left-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--brand-rose-600)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--brand-navy-600)]">
                  {item.title || 'اعلان پرنگارین'}
                </p>
                <p className="mt-1 text-sm leading-7 text-[var(--ui-gray-600)]">{item.body}</p>
                <p className="mt-2 text-caption text-[var(--ui-gray-400)]">
                  {toJalali(item.createdAt)}، {formatTime(item.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

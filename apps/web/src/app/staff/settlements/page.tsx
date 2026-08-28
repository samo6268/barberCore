'use client';

import { useState } from 'react';
import { ChevronLeft, FileCheck2, X } from 'lucide-react';
import { useStaffSettlement, useStaffSettlements } from '@/lib/api-hooks';
import { formatPrice, toJalali } from '@/lib/utils';
import { useStaffPortal } from '@/components/staff/staff-shell';
import { EmptyState, StaffPageHeader, StaffPageLoading } from '@/components/staff/staff-ui';

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'پیش‌نویس', color: '#b45309', bg: '#fffbeb' },
  APPROVED: { label: 'تأییدشده', color: '#1d4ed8', bg: '#eff6ff' },
  PAID: { label: 'پرداخت‌شده', color: '#047857', bg: '#ecfdf5' },
  CANCELLED: { label: 'لغوشده', color: '#b91c1c', bg: '#fef2f2' },
};

export default function StaffSettlementsPage() {
  const { salonId } = useStaffPortal();
  const [selectedId, setSelectedId] = useState('');
  const { data: settlements = [], isLoading } = useStaffSettlements(salonId);
  const { data: details, isLoading: detailsLoading } = useStaffSettlement(salonId, selectedId);

  const paidTotal = settlements
    .filter((item: any) => item.status === 'PAID')
    .reduce((sum: number, item: any) => sum + item.netPayable, 0);
  const pendingTotal = settlements
    .filter((item: any) => ['DRAFT', 'APPROVED'].includes(item.status))
    .reduce((sum: number, item: any) => sum + item.netPayable, 0);

  return (
    <div>
      <StaffPageHeader
        title="تسویه‌های من"
        description="صورتحساب‌ها و سوابق پرداخت شما به‌صورت شفاف و فقط‌خواندنی."
      />
      {isLoading ? (
        <StaffPageLoading />
      ) : (
        <>
          <section className="mb-6 grid gap-3 sm:grid-cols-3">
            <Summary label="مجموع پرداخت‌شده" value={formatPrice(paidTotal)} />
            <Summary label="در انتظار پرداخت" value={formatPrice(pendingTotal)} />
            <Summary label="تعداد صورتحساب" value={settlements.length.toLocaleString('fa-IR')} />
          </section>
          {!settlements.length ? (
            <EmptyState
              icon={FileCheck2}
              title="هنوز تسویه‌ای ثبت نشده"
              description="پس از تکمیل خدمات و ایجاد صورتحساب توسط مدیر سالن، جزئیات آن اینجا نمایش داده می‌شود."
            />
          ) : (
            <div className="space-y-3">
              {settlements.map((item: any) => {
                const palette = STATUS[item.status] ?? STATUS.DRAFT;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-[var(--ui-gray-200)] bg-white p-4 text-right transition-shadow hover:shadow-md sm:p-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-plum-50)] text-[var(--brand-plum-600)]">
                      <FileCheck2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[var(--brand-navy-600)]">
                          {toJalali(item.periodStart)} تا {toJalali(item.periodEnd)}
                        </p>
                        <span
                          className="rounded-full px-2 py-0.5 text-caption font-semibold"
                          style={{ color: palette.color, background: palette.bg }}
                        >
                          {palette.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--ui-gray-500)]">
                        {item._count.items.toLocaleString('fa-IR')} خدمت ·{' '}
                        {item.paymentReference
                          ? `پیگیری ${item.paymentReference}`
                          : 'بدون شماره پیگیری'}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[var(--brand-plum-600)]">
                        {formatPrice(item.netPayable)}
                      </p>
                      <ChevronLeft className="mt-1 mr-auto text-[var(--ui-gray-400)]" size={15} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {selectedId && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => event.target === event.currentTarget && setSelectedId('')}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[var(--brand-navy-600)]">جزئیات صورتحساب</h2>
                <p className="mt-1 text-xs text-[var(--ui-gray-500)]">
                  مبالغ این صفحه قابل ویرایش نیستند.
                </p>
              </div>
              <button
                onClick={() => setSelectedId('')}
                className="rounded-xl border border-[var(--ui-gray-200)] p-2"
              >
                <X size={17} />
              </button>
            </div>
            {detailsLoading || !details ? (
              <StaffPageLoading />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Summary
                    label="پورسانت خدمات"
                    value={formatPrice(details.serviceCommission)}
                    compact
                  />
                  <Summary
                    label="حقوق پایه"
                    value={formatPrice(details.baseSalaryAmount)}
                    compact
                  />
                  <Summary label="پاداش" value={formatPrice(details.bonusAmount)} compact />
                  <Summary label="کسورات" value={formatPrice(details.deductionAmount)} compact />
                  <Summary label="خالص پرداختی" value={formatPrice(details.netPayable)} compact />
                  <Summary
                    label="وضعیت"
                    value={STATUS[details.status]?.label ?? details.status}
                    compact
                  />
                </div>
                <h3 className="mb-3 mt-7 text-sm font-bold text-[var(--brand-navy-600)]">
                  خدمات محاسبه‌شده
                </h3>
                <div className="divide-y divide-[var(--ui-gray-100)] rounded-2xl border border-[var(--ui-gray-200)]">
                  {details.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-4 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[var(--brand-navy-600)]">
                          {item.serviceName}
                        </p>
                        <p className="mt-1 text-[var(--ui-gray-500)]">
                          {toJalali(item.completedAt)}
                        </p>
                      </div>
                      <div className="text-left">
                        <p>{formatPrice(item.grossAmount)} فروش</p>
                        <p className="mt-1 font-semibold text-[var(--brand-plum-600)]">
                          {formatPrice(item.commissionAmount)} سهم شما
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--ui-gray-200)] bg-white ${compact ? 'p-3' : 'p-5'}`}
    >
      <p className="text-xs text-[var(--ui-gray-500)]">{label}</p>
      <p
        className={`${compact ? 'mt-1 text-sm' : 'mt-2 text-lg'} font-bold text-[var(--brand-navy-600)]`}
      >
        {value}
      </p>
    </div>
  );
}

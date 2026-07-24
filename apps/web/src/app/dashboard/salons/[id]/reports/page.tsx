'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { BarChart3, Download, Loader2, Printer, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useFinancialReport } from '@/lib/api-hooks';
import { formatPrice, iranDateInput } from '@/lib/utils';

const BOOKING_LABELS: Record<string, string> = {
  PENDING: 'در انتظار',
  CONFIRMED: 'تأییدشده',
  IN_PROGRESS: 'در حال انجام',
  COMPLETED: 'تکمیل‌شده',
  CANCELLED: 'لغوشده',
  NO_SHOW: 'عدم مراجعه',
  WAITLISTED: 'لیست انتظار',
};

export default function ReportsPage() {
  const { id } = useParams<{ id: string }>();
  const [period, setPeriod] = useState({
    from: iranDateInput(new Date(Date.now() - 29 * 86_400_000)),
    to: iranDateInput(),
  });
  const { data: report, isLoading, isFetching, isError, refetch } = useFinancialReport(id, period);

  const exportExcel = () => {
    if (!report) return;
    const rows: Array<Array<string | number>> = [
      ['گزارش مالی پرنگارین'],
      ['از تاریخ', period.from, 'تا تاریخ', period.to],
      [],
      ['عملکرد کارکنان'],
      ['نام متخصص', 'رزرو تکمیل‌شده', 'تعداد خدمات', 'فروش خدمات (ریال)', 'پورسانت خدمات (ریال)', 'سهم حقوق ثابت (ریال)', 'قابل پرداخت (ریال)', 'سهم سالن (ریال)'],
      ...report.staffPerformance.map((row: any) => [
        row.displayName,
        row.completedBookings,
        row.serviceCount,
        row.grossRevenue,
        row.serviceCommission,
        row.baseSalaryAmount,
        row.staffPayable,
        row.salonShare,
      ]),
      [],
      ['عملکرد خدمات'],
      ['خدمت', 'تعداد', 'فروش (ریال)'],
      ...report.servicePerformance.map((row: any) => [
        row.serviceName,
        row.count,
        row.grossRevenue,
      ]),
    ];
    const escape = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;
    const csv = `\uFEFF${rows.map((row) => row.map(escape).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `parnegarin-report-${period.from}-${period.to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout salonId={id} activeTab="reports">
      <div className="space-y-7 print:p-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--brand-navy-600)' }}>گزارش‌های مدیریتی</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--ui-gray-500)' }}>تصویر مالی و عملیاتی سالن بر اساس داده‌های واقعی رزرو و تسویه</p>
          </div>
          <div className="flex flex-wrap items-end gap-2 print:hidden">
            <DateField label="از" value={period.from} onChange={(value) => setPeriod((current) => ({ ...current, from: value }))} />
            <DateField label="تا" value={period.to} onChange={(value) => setPeriod((current) => ({ ...current, to: value }))} />
            <button onClick={() => refetch()} className="rounded-xl border bg-white p-2.5" aria-label="بروزرسانی"><RefreshCw size={17} className={isFetching ? 'animate-spin' : ''} /></button>
            <button onClick={exportExcel} disabled={!report} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm disabled:opacity-50"><Download size={16} /> Excel / CSV</button>
            <button onClick={() => window.print()} disabled={!report} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white disabled:opacity-50" style={{ background: 'var(--brand-navy-600)' }}><Printer size={16} /> چاپ / PDF</button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin" /></div>
        ) : isError ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <p className="text-sm text-red-600">دریافت گزارش ناموفق بود.</p>
            <button onClick={() => refetch()} className="mt-3 text-sm underline">تلاش دوباره</button>
          </div>
        ) : report ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Kpi title="فروش خدمات" value={formatPrice(report.summary.grossRevenue)} />
              <Kpi title="رزرو تکمیل‌شده" value={report.summary.completedBookings.toLocaleString('fa-IR')} />
              <Kpi title="سهم برآوردی کارکنان" value={formatPrice(report.summary.estimatedStaffPayable)} />
              <Kpi title="سهم برآوردی سالن" value={formatPrice(report.summary.estimatedSalonShare)} accent />
              <Kpi title="تسویه پرداخت‌شده" value={formatPrice(report.summary.paidSettlements)} />
            </div>

            <ReportSection title="عملکرد کارکنان">
              <table className="w-full min-w-[850px] text-right text-sm">
                <thead className="bg-[var(--bg-ivory)]">
                  <tr>
                    {['متخصص', 'رزرو', 'خدمات', 'فروش', 'پورسانت', 'حقوق ثابت', 'قابل پرداخت', 'سهم سالن'].map((label) => <th key={label} className="p-3">{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {report.staffPerformance.map((row: any) => (
                    <tr key={row.staffId} className="border-t" style={{ borderColor: 'var(--ui-gray-100)' }}>
                      <td className="p-3 font-semibold">{row.displayName}</td>
                      <td className="p-3">{row.completedBookings.toLocaleString('fa-IR')}</td>
                      <td className="p-3">{row.serviceCount.toLocaleString('fa-IR')}</td>
                      <td className="p-3">{formatPrice(row.grossRevenue)}</td>
                      <td className="p-3">{formatPrice(row.serviceCommission)}</td>
                      <td className="p-3">{formatPrice(row.baseSalaryAmount)}</td>
                      <td className="p-3 font-bold" style={{ color: 'var(--brand-plum-600)' }}>{formatPrice(row.staffPayable)}</td>
                      <td className="p-3">{formatPrice(row.salonShare)}</td>
                    </tr>
                  ))}
                  {!report.staffPerformance.length && <tr><td colSpan={8} className="p-8 text-center text-gray-500">داده‌ای در این بازه وجود ندارد.</td></tr>}
                </tbody>
              </table>
            </ReportSection>

            <div className="grid gap-6 lg:grid-cols-2">
              <ReportSection title="خدمات پرفروش">
                <div className="divide-y">
                  {report.servicePerformance.map((row: any, index: number) => (
                    <div key={row.serviceId} className="flex items-center gap-3 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'var(--brand-plum-50)', color: 'var(--brand-plum-600)' }}>{(index + 1).toLocaleString('fa-IR')}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{row.serviceName}</p>
                        <p className="text-xs text-gray-500">{row.count.toLocaleString('fa-IR')} خدمت</p>
                      </div>
                      <strong className="text-sm">{formatPrice(row.grossRevenue)}</strong>
                    </div>
                  ))}
                  {!report.servicePerformance.length && <p className="py-8 text-center text-sm text-gray-500">داده‌ای وجود ندارد.</p>}
                </div>
              </ReportSection>

              <ReportSection title="وضعیت رزروها">
                <div className="grid grid-cols-2 gap-3">
                  {report.bookingStatuses.map((row: any) => (
                    <div key={row.status} className="rounded-xl p-3" style={{ background: 'var(--bg-ivory)' }}>
                      <p className="text-xs text-gray-500">{BOOKING_LABELS[row.status] || row.status}</p>
                      <p className="mt-1 text-lg font-bold">{row.count.toLocaleString('fa-IR')}</p>
                    </div>
                  ))}
                  {!report.bookingStatuses.length && <p className="col-span-2 py-8 text-center text-sm text-gray-500">رزروی در این بازه وجود ندارد.</p>}
                </div>
              </ReportSection>
            </div>

            <ReportSection title="وضعیت تسویه‌ها">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {report.settlementStatuses.map((row: any) => (
                  <div key={row.status} className="rounded-xl border p-4" style={{ borderColor: 'var(--ui-gray-200)' }}>
                    <p className="text-xs text-gray-500">{settlementLabel(row.status)}</p>
                    <p className="mt-1 font-bold">{row.count.toLocaleString('fa-IR')} صورتحساب</p>
                    <p className="mt-2 text-sm" style={{ color: 'var(--brand-plum-600)' }}>{formatPrice(row.amount)}</p>
                  </div>
                ))}
                {!report.settlementStatuses.length && <p className="py-6 text-sm text-gray-500">هنوز تسویه‌ای در این بازه ثبت نشده است.</p>}
              </div>
            </ReportSection>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-xs text-gray-500">{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border bg-white px-3 py-2 text-sm" />
    </label>
  );
}

function Kpi({ title, value, accent = false }: { title: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: accent ? 'var(--brand-plum-600)' : 'white', borderColor: 'var(--ui-gray-200)', color: accent ? 'white' : 'var(--brand-navy-600)' }}>
      <p className="text-xs opacity-70">{title}</p>
      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-auto rounded-2xl border bg-white" style={{ borderColor: 'var(--ui-gray-200)' }}>
      <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: 'var(--ui-gray-100)' }}>
        <BarChart3 size={16} style={{ color: 'var(--brand-plum-600)' }} />
        <h2 className="text-sm font-semibold" style={{ color: 'var(--brand-navy-600)' }}>{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function settlementLabel(status: string) {
  return { DRAFT: 'پیش‌نویس', APPROVED: 'تأییدشده', PAID: 'پرداخت‌شده', CANCELLED: 'لغوشده' }[status] || status;
}

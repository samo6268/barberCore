'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, CreditCard, FileText, Loader2, Plus, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import {
  useCreateSettlement,
  useSalonStaffManagement,
  useSettlementPreview,
  useSettlements,
  useUpdateSettlementStatus,
} from '@/lib/api-hooks';
import { formatPrice, iranDateInput, toJalali } from '@/lib/utils';

const STATUS: Record<string, { label: string; color: string; background: string }> = {
  DRAFT: { label: 'پیش‌نویس', color: '#9A6700', background: '#FFF8C5' },
  APPROVED: { label: 'تأییدشده', color: '#0969DA', background: '#DDF4FF' },
  PAID: { label: 'پرداخت‌شده', color: '#1A7F37', background: '#DAFBE1' },
  CANCELLED: { label: 'لغوشده', color: '#CF222E', background: '#FFEBE9' },
};

export default function SettlementsPage() {
  const { id } = useParams<{ id: string }>();
  const defaultTo = iranDateInput();
  const defaultFrom = iranDateInput(new Date(Date.now() - 29 * 86_400_000));
  const { data: staff = [], isLoading: staffLoading } = useSalonStaffManagement(id);
  const [filters, setFilters] = useState({ staffId: '', status: '' });
  const { data: settlements = [], isLoading, isError, refetch } = useSettlements(
    id,
    Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
  );
  const [form, setForm] = useState({
    staffId: '',
    from: defaultFrom,
    to: defaultTo,
    bonusAmount: '',
    bonusDescription: '',
    deductionAmount: '',
    deductionDescription: '',
    notes: '',
  });
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [paying, setPaying] = useState<any>(null);
  const [payment, setPayment] = useState({ paymentMethod: 'کارت به کارت', paymentReference: '' });

  const previewParams = useMemo(
    () => ({ staffId: form.staffId, from: form.from, to: form.to }),
    [form.staffId, form.from, form.to],
  );
  const {
    data: preview,
    isFetching: previewLoading,
    isError: previewError,
  } = useSettlementPreview(id, previewParams, previewEnabled);
  const createSettlement = useCreateSettlement(id);
  const updateStatus = useUpdateSettlementStatus(id);

  const finalPayable = preview
    ? preview.totals.netPayable +
      Number(form.bonusAmount || 0) -
      Number(form.deductionAmount || 0)
    : 0;

  const create = async () => {
    try {
      await createSettlement.mutateAsync({
        ...form,
        bonusAmount: Number(form.bonusAmount || 0),
        deductionAmount: Number(form.deductionAmount || 0),
      });
      toast.success('صورتحساب تسویه ایجاد شد');
      setPreviewEnabled(false);
      setForm((current) => ({
        ...current,
        bonusAmount: '',
        bonusDescription: '',
        deductionAmount: '',
        deductionDescription: '',
        notes: '',
      }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'ایجاد تسویه ناموفق بود');
    }
  };

  const changeStatus = async (settlementId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ settlementId, status });
      toast.success(status === 'APPROVED' ? 'تسویه تأیید شد' : 'تسویه لغو شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'تغییر وضعیت ناموفق بود');
    }
  };

  const markPaid = async () => {
    if (!payment.paymentReference.trim()) return toast.error('شماره پیگیری پرداخت را وارد کنید');
    try {
      await updateStatus.mutateAsync({
        settlementId: paying.id,
        status: 'PAID',
        ...payment,
      });
      toast.success('پرداخت تسویه ثبت شد');
      setPaying(null);
      setPayment({ paymentMethod: 'کارت به کارت', paymentReference: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'ثبت پرداخت ناموفق بود');
    }
  };

  return (
    <DashboardLayout salonId={id} activeTab="settlements">
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--brand-navy-600)' }}>تسویه کارکنان</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--ui-gray-500)' }}>
            صورتحساب بر اساس رزروهای تکمیل‌شده و قرارداد مالی هر متخصص محاسبه می‌شود.
          </p>
        </div>

        <section className="rounded-2xl border bg-white p-5" style={{ borderColor: 'var(--ui-gray-200)' }}>
          <div className="mb-5 flex items-center gap-2">
            <Plus size={18} style={{ color: 'var(--brand-plum-600)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--brand-navy-600)' }}>صورتحساب جدید</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="متخصص">
              <select
                value={form.staffId}
                disabled={staffLoading}
                onChange={(event) => {
                  setForm((current) => ({ ...current, staffId: event.target.value }));
                  setPreviewEnabled(false);
                }}
                className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm"
              >
                <option value="">انتخاب متخصص</option>
                {staff.map((member: any) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
              </select>
            </Field>
            <Field label="از تاریخ">
              <input type="date" value={form.from} onChange={(event) => { setForm((current) => ({ ...current, from: event.target.value })); setPreviewEnabled(false); }} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
            </Field>
            <Field label="تا تاریخ">
              <input type="date" value={form.to} onChange={(event) => { setForm((current) => ({ ...current, to: event.target.value })); setPreviewEnabled(false); }} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
            </Field>
          </div>
          <button
            onClick={() => {
              if (!form.staffId) return toast.error('متخصص را انتخاب کنید');
              setPreviewEnabled(true);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: 'var(--brand-plum-600)' }}
          >
            {previewLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            محاسبه پیش‌نمایش
          </button>

          {previewError && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">محاسبه صورتحساب انجام نشد. بازه زمانی و قرارداد متخصص را بررسی کنید.</p>
          )}

          {preview && previewEnabled && (
            <div className="mt-6 border-t pt-6" style={{ borderColor: 'var(--ui-gray-100)' }}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="فروش خدمات" value={formatPrice(preview.totals.grossRevenue)} />
                <Metric label="پورسانت خدمات" value={formatPrice(preview.totals.serviceCommission)} />
                <Metric label="سهم حقوق ثابت" value={formatPrice(preview.totals.baseSalaryAmount)} />
                <Metric label="قابل پرداخت اولیه" value={formatPrice(preview.totals.netPayable)} accent />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="پاداش (ریال)">
                  <input type="number" min="0" value={form.bonusAmount} onChange={(event) => setForm((current) => ({ ...current, bonusAmount: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
                </Field>
                <Field label="شرح پاداش">
                  <input value={form.bonusDescription} onChange={(event) => setForm((current) => ({ ...current, bonusDescription: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
                </Field>
                <Field label="کسورات (ریال)">
                  <input type="number" min="0" value={form.deductionAmount} onChange={(event) => setForm((current) => ({ ...current, deductionAmount: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
                </Field>
                <Field label="شرح کسورات">
                  <input value={form.deductionDescription} onChange={(event) => setForm((current) => ({ ...current, deductionDescription: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
                </Field>
              </div>
              <Field label="یادداشت مدیر">
                <textarea rows={2} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
              </Field>

              <div className="mt-5 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--ui-gray-200)' }}>
                <table className="w-full text-right text-sm">
                  <thead style={{ background: 'var(--bg-ivory)' }}>
                    <tr>
                      <th className="p-3">تاریخ</th>
                      <th className="p-3">خدمت</th>
                      <th className="p-3">مبلغ خدمت</th>
                      <th className="p-3">سهم متخصص</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.items.map((item: any) => (
                      <tr key={item.bookingItemId} className="border-t" style={{ borderColor: 'var(--ui-gray-100)' }}>
                        <td className="p-3">{toJalali(item.completedAt)}</td>
                        <td className="p-3">{item.serviceName}</td>
                        <td className="p-3">{formatPrice(item.grossAmount)}</td>
                        <td className="p-3 font-semibold">{formatPrice(item.commissionAmount)}</td>
                      </tr>
                    ))}
                    {!preview.items.length && (
                      <tr><td colSpan={4} className="p-5 text-center text-sm text-gray-500">خدمت تکمیل‌شده‌ی تسویه‌نشده‌ای وجود ندارد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: 'var(--brand-plum-50)' }}>
                <div>
                  <span className="text-xs" style={{ color: 'var(--ui-gray-500)' }}>مبلغ نهایی قابل پرداخت</span>
                  <p className="text-lg font-bold" style={{ color: 'var(--brand-plum-600)' }}>{formatPrice(finalPayable)}</p>
                </div>
                <button onClick={create} disabled={createSettlement.isPending || finalPayable < 0} className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'var(--brand-plum-600)' }}>
                  {createSettlement.isPending ? 'در حال ثبت...' : 'ایجاد صورتحساب'}
                </button>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold" style={{ color: 'var(--brand-navy-600)' }}>تاریخچه تسویه‌ها</h2>
            <div className="flex gap-2">
              <select value={filters.staffId} onChange={(event) => setFilters((current) => ({ ...current, staffId: event.target.value }))} className="rounded-lg border bg-white px-3 py-2 text-xs">
                <option value="">همه کارکنان</option>
                {staff.map((member: any) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
              </select>
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-lg border bg-white px-3 py-2 text-xs">
                <option value="">همه وضعیت‌ها</option>
                {Object.entries(STATUS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>
          ) : isError ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <p className="text-sm text-red-600">دریافت تسویه‌ها ناموفق بود.</p>
              <button onClick={() => refetch()} className="mt-3 text-sm underline">تلاش دوباره</button>
            </div>
          ) : !settlements.length ? (
            <div className="rounded-2xl border bg-white p-12 text-center" style={{ borderColor: 'var(--ui-gray-200)' }}>
              <FileText className="mx-auto mb-3" style={{ color: 'var(--ui-gray-300)' }} />
              <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>هنوز صورتحسابی ثبت نشده است.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {settlements.map((settlement: any) => {
                const status = STATUS[settlement.status] || STATUS.DRAFT;
                return (
                  <article key={settlement.id} className="rounded-2xl border bg-white p-5" style={{ borderColor: 'var(--ui-gray-200)' }}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold" style={{ color: 'var(--brand-navy-600)' }}>{settlement.staff.displayName}</h3>
                          <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ color: status.color, background: status.background }}>{status.label}</span>
                        </div>
                        <p className="mt-2 text-xs" style={{ color: 'var(--ui-gray-500)' }}>
                          دوره {toJalali(settlement.periodStart)} تا {toJalali(settlement.periodEnd)} · {settlement._count.items} خدمت
                        </p>
                      </div>
                      <div className="min-w-40">
                        <span className="text-xs" style={{ color: 'var(--ui-gray-400)' }}>خالص قابل پرداخت</span>
                        <p className="font-bold" style={{ color: 'var(--brand-plum-600)' }}>{formatPrice(settlement.netPayable)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settlement.status === 'DRAFT' && (
                          <>
                            <button onClick={() => changeStatus(settlement.id, 'APPROVED')} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"><CheckCircle2 size={14} /> تأیید</button>
                            <button onClick={() => changeStatus(settlement.id, 'CANCELLED')} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"><XCircle size={14} /> لغو</button>
                          </>
                        )}
                        {settlement.status === 'APPROVED' && (
                          <button onClick={() => setPaying(settlement)} className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700"><CreditCard size={14} /> ثبت پرداخت</button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {paying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="font-bold" style={{ color: 'var(--brand-navy-600)' }}>ثبت پرداخت {paying.staff.displayName}</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--ui-gray-500)' }}>{formatPrice(paying.netPayable)}</p>
            <div className="mt-5 space-y-4">
              <Field label="روش پرداخت">
                <select value={payment.paymentMethod} onChange={(event) => setPayment((current) => ({ ...current, paymentMethod: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm">
                  <option>کارت به کارت</option>
                  <option>انتقال بانکی</option>
                  <option>نقدی</option>
                  <option>سایر</option>
                </select>
              </Field>
              <Field label="شماره پیگیری">
                <input value={payment.paymentReference} onChange={(event) => setPayment((current) => ({ ...current, paymentReference: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
              </Field>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={markPaid} disabled={updateStatus.isPending} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: '#1A7F37' }}>ثبت پرداخت</button>
              <button onClick={() => setPaying(null)} className="rounded-xl border px-5 py-2.5 text-sm">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--ui-gray-500)' }}>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-4" style={{ background: accent ? 'var(--brand-plum-50)' : 'var(--bg-ivory)' }}>
      <p className="text-xs" style={{ color: 'var(--ui-gray-500)' }}>{label}</p>
      <p className="mt-1 font-bold" style={{ color: accent ? 'var(--brand-plum-600)' : 'var(--brand-navy-600)' }}>{value}</p>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Settings2, X } from 'lucide-react';
import {
  useSalonStaffManagement,
  useCreateStaff,
  useSalonServices,
  useUpdateStaffCompensation,
} from '@/lib/api-hooks';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function StaffPage() {
  const { id } = useParams<{ id: string }>();
  const { data: staff, isLoading } = useSalonStaffManagement(id);
  const { data: services = [] } = useSalonServices(id);
  const createStaff = useCreateStaff(id);
  const updateCompensation = useUpdateStaffCompensation(id);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    bio: '',
    specialties: '',
    serviceIds: [] as string[],
    compensationType: 'PERCENTAGE',
    commissionRate: '30',
    fixedServiceAmount: '0',
    monthlySalary: '0',
  });
  const [contract, setContract] = useState({
    compensationType: 'PERCENTAGE',
    commissionRate: '0',
    fixedServiceAmount: '0',
    monthlySalary: '0',
    serviceRules: [] as Array<{
      serviceId: string;
      serviceName: string;
      commissionRate: string;
      fixedAmount: string;
    }>,
  });

  const handleCreate = async () => {
    if (!form.displayName || !form.phone) {
      return toast.error('نام و شماره موبایل متخصص الزامی است');
    }
    if (!form.serviceIds.length) return toast.error('حداقل یک خدمت را انتخاب کنید');
    try {
      await createStaff.mutateAsync({
        ...form,
        commissionRate: Number(form.commissionRate || 0),
        fixedServiceAmount: Number(form.fixedServiceAmount || 0),
        monthlySalary: Number(form.monthlySalary || 0),
        specialties: form.specialties.split('،').map(s => s.trim()).filter(Boolean),
      });
      toast.success('متخصص اضافه شد');
      setShowForm(false);
      setForm({
        displayName: '',
        phone: '',
        bio: '',
        specialties: '',
        serviceIds: [],
        compensationType: 'PERCENTAGE',
        commissionRate: '30',
        fixedServiceAmount: '0',
        monthlySalary: '0',
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'خطا در افزودن متخصص');
    }
  };

  const openContract = (member: any) => {
    setEditingStaff(member);
    setContract({
      compensationType: member.compensationType || 'PERCENTAGE',
      commissionRate: String(member.commissionRate || 0),
      fixedServiceAmount: String(member.fixedServiceAmount || 0),
      monthlySalary: String(member.monthlySalary || 0),
      serviceRules: (member.services || []).map((item: any) => ({
        serviceId: item.service.id,
        serviceName: item.service.name,
        commissionRate: item.commissionRate == null ? '' : String(item.commissionRate),
        fixedAmount: item.fixedAmount == null ? '' : String(item.fixedAmount),
      })),
    });
  };

  const saveContract = async () => {
    try {
      await updateCompensation.mutateAsync({
        staffId: editingStaff.id,
        compensationType: contract.compensationType,
        commissionRate: Number(contract.commissionRate || 0),
        fixedServiceAmount: Number(contract.fixedServiceAmount || 0),
        monthlySalary: Number(contract.monthlySalary || 0),
        serviceRules: contract.serviceRules.map((rule) => ({
          serviceId: rule.serviceId,
          commissionRate: rule.commissionRate === '' ? undefined : Number(rule.commissionRate),
          fixedAmount: rule.fixedAmount === '' ? undefined : Number(rule.fixedAmount),
        })),
      });
      toast.success('قرارداد مالی متخصص ذخیره شد');
      setEditingStaff(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'ذخیره قرارداد مالی ناموفق بود');
    }
  };

  return (
    <DashboardLayout salonId={id} activeTab="staff">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--brand-navy-600)' }}>تیم متخصصین</h2>
          <button onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: 'var(--brand-plum-600)' }}>
            <Plus className="w-4 h-4" /> افزودن متخصص
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl p-5 border space-y-3" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
            <input placeholder="نام متخصص *" value={form.displayName} onChange={e => setForm(p => ({...p, displayName: e.target.value}))}
              className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
            <input placeholder="شماره موبایل متخصص *" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
              dir="ltr"
              className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
            <input placeholder="تخصص‌ها (با ، جدا کنید)" value={form.specialties} onChange={e => setForm(p => ({...p, specialties: e.target.value}))}
              className="w-full px-4 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
            <textarea placeholder="بیوگرافی (اختیاری)" value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={2}
              className="w-full px-4 py-2 rounded-xl border text-sm outline-none resize-none"
              style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)', color: 'var(--brand-navy-600)' }} />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={form.compensationType}
                onChange={(event) => setForm((current) => ({ ...current, compensationType: event.target.value }))}
                className="rounded-xl border px-4 py-2 text-sm"
                style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)' }}
              >
                <option value="PERCENTAGE">درصد از خدمات</option>
                <option value="FIXED_PER_SERVICE">مبلغ ثابت هر خدمت</option>
                <option value="SALARY">حقوق ثابت</option>
                <option value="SALARY_PLUS_PERCENTAGE">حقوق ثابت + پورسانت</option>
              </select>
              {(form.compensationType === 'PERCENTAGE' || form.compensationType === 'SALARY_PLUS_PERCENTAGE') && (
                <input type="number" min="0" max="100" placeholder="درصد پورسانت" value={form.commissionRate}
                  onChange={(event) => setForm((current) => ({ ...current, commissionRate: event.target.value }))}
                  className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)' }} />
              )}
              {form.compensationType === 'FIXED_PER_SERVICE' && (
                <input type="number" min="0" placeholder="مبلغ هر خدمت (ریال)" value={form.fixedServiceAmount}
                  onChange={(event) => setForm((current) => ({ ...current, fixedServiceAmount: event.target.value }))}
                  className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)' }} />
              )}
              {(form.compensationType === 'SALARY' || form.compensationType === 'SALARY_PLUS_PERCENTAGE') && (
                <input type="number" min="0" placeholder="حقوق ماهانه (ریال)" value={form.monthlySalary}
                  onChange={(event) => setForm((current) => ({ ...current, monthlySalary: event.target.value }))}
                  className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: 'var(--ui-gray-200)', background: 'var(--bg-ivory)' }} />
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium" style={{ color: 'var(--brand-navy-600)' }}>
                خدمات قابل ارائه *
              </p>
              <div className="flex flex-wrap gap-2">
                {services.map((service: any) => {
                  const selected = form.serviceIds.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setForm((current) => ({
                        ...current,
                        serviceIds: selected
                          ? current.serviceIds.filter((item) => item !== service.id)
                          : [...current.serviceIds, service.id],
                      }))}
                      className="rounded-full border px-3 py-1.5 text-xs"
                      style={{
                        borderColor: selected ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)',
                        background: selected ? 'var(--brand-plum-50)' : 'white',
                        color: selected ? 'var(--brand-plum-600)' : 'var(--ui-gray-500)',
                      }}
                    >
                      {service.name}
                    </button>
                  );
                })}
              </div>
              {!services.length && (
                <p className="text-xs" style={{ color: '#dc2626' }}>
                  ابتدا حداقل یک خدمت برای سالن تعریف کنید.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={createStaff.isPending}
                className="px-6 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50" style={{ background: 'var(--brand-plum-600)' }}>
                {createStaff.isPending ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl border text-sm" style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--ui-gray-500)' }}>انصراف</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'white' }} />)}</div>
        ) : !staff?.length ? (
          <div className="text-center py-16 rounded-2xl border" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
            <div className="text-5xl mb-3">👤</div>
            <p style={{ color: 'var(--ui-gray-500)' }}>هنوز متخصصی اضافه نکرده‌اید</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staff.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-ivory)' }}>
                  {s.avatarUrl ? <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--brand-navy-600)' }}>{s.displayName}</p>
                  {s.specialties?.length > 0 && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--ui-gray-500)' }}>{s.specialties.join('، ')}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--ui-gray-500)' }}>{s.services?.length || 0} خدمت</p>
                  <p className="mt-1 text-xs font-medium" style={{ color: 'var(--brand-plum-600)' }}>
                    {compensationLabel(s)}
                  </p>
                </div>
                <button
                  onClick={() => openContract(s)}
                  className="rounded-lg border p-2"
                  style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)' }}
                  aria-label="تنظیم قرارداد مالی"
                >
                  <Settings2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold" style={{ color: 'var(--brand-navy-600)' }}>قرارداد مالی {editingStaff.displayName}</h3>
                <p className="mt-1 text-xs" style={{ color: 'var(--ui-gray-500)' }}>نرخ عمومی و استثناهای هر خدمت را تعیین کنید.</p>
              </div>
              <button onClick={() => setEditingStaff(null)}><X size={20} /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="مدل همکاری">
                <select value={contract.compensationType} onChange={(event) => setContract((current) => ({ ...current, compensationType: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm">
                  <option value="PERCENTAGE">درصد از خدمات</option>
                  <option value="FIXED_PER_SERVICE">مبلغ ثابت هر خدمت</option>
                  <option value="SALARY">حقوق ثابت</option>
                  <option value="SALARY_PLUS_PERCENTAGE">حقوق ثابت + پورسانت</option>
                </select>
              </Field>
              {(contract.compensationType === 'PERCENTAGE' || contract.compensationType === 'SALARY_PLUS_PERCENTAGE') && (
                <Field label="درصد پورسانت عمومی">
                  <input type="number" min="0" max="100" value={contract.commissionRate} onChange={(event) => setContract((current) => ({ ...current, commissionRate: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
                </Field>
              )}
              {contract.compensationType === 'FIXED_PER_SERVICE' && (
                <Field label="مبلغ عمومی هر خدمت (ریال)">
                  <input type="number" min="0" value={contract.fixedServiceAmount} onChange={(event) => setContract((current) => ({ ...current, fixedServiceAmount: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
                </Field>
              )}
              {(contract.compensationType === 'SALARY' || contract.compensationType === 'SALARY_PLUS_PERCENTAGE') && (
                <Field label="حقوق ماهانه (ریال)">
                  <input type="number" min="0" value={contract.monthlySalary} onChange={(event) => setContract((current) => ({ ...current, monthlySalary: event.target.value }))} className="w-full rounded-xl border px-3 py-2.5 text-sm" />
                </Field>
              )}
            </div>

            {(contract.compensationType === 'PERCENTAGE' || contract.compensationType === 'SALARY_PLUS_PERCENTAGE' || contract.compensationType === 'FIXED_PER_SERVICE') && (
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--brand-navy-600)' }}>نرخ اختصاصی خدمات (اختیاری)</h4>
                <div className="space-y-2">
                  {contract.serviceRules.map((rule, index) => (
                    <div key={rule.serviceId} className="grid grid-cols-3 items-center gap-3 rounded-xl bg-[var(--bg-ivory)] p-3">
                      <span className="text-sm">{rule.serviceName}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="درصد اختصاصی"
                        disabled={contract.compensationType === 'FIXED_PER_SERVICE'}
                        value={rule.commissionRate}
                        onChange={(event) => setContract((current) => ({
                          ...current,
                          serviceRules: current.serviceRules.map((item, itemIndex) => itemIndex === index ? { ...item, commissionRate: event.target.value } : item),
                        }))}
                        className="rounded-lg border px-2 py-2 text-xs disabled:opacity-40"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="مبلغ ثابت"
                        disabled={contract.compensationType !== 'FIXED_PER_SERVICE'}
                        value={rule.fixedAmount}
                        onChange={(event) => setContract((current) => ({
                          ...current,
                          serviceRules: current.serviceRules.map((item, itemIndex) => itemIndex === index ? { ...item, fixedAmount: event.target.value } : item),
                        }))}
                        className="rounded-lg border px-2 py-2 text-xs disabled:opacity-40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button onClick={saveContract} disabled={updateCompensation.isPending} className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'var(--brand-plum-600)' }}>
                {updateCompensation.isPending ? 'در حال ذخیره...' : 'ذخیره قرارداد'}
              </button>
              <button onClick={() => setEditingStaff(null)} className="rounded-xl border px-6 py-2.5 text-sm" style={{ borderColor: 'var(--ui-gray-200)' }}>انصراف</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--ui-gray-500)' }}>{label}</span>
      {children}
    </label>
  );
}

function compensationLabel(staff: any) {
  switch (staff.compensationType) {
    case 'FIXED_PER_SERVICE':
      return `${Number(staff.fixedServiceAmount || 0).toLocaleString('fa-IR')} ریال / خدمت`;
    case 'SALARY':
      return `حقوق ${Number(staff.monthlySalary || 0).toLocaleString('fa-IR')} ریال`;
    case 'SALARY_PLUS_PERCENTAGE':
      return `حقوق + ${staff.commissionRate || 0}٪ پورسانت`;
    default:
      return `${staff.commissionRate || 0}٪ پورسانت`;
  }
}

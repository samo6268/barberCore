'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, BriefcaseBusiness, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useStaffProfile, useUpdateStaffProfile } from '@/lib/api-hooks';
import { getApiErrorMessage } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useStaffPortal } from '@/components/staff/staff-shell';
import { StaffPageHeader, StaffPageLoading } from '@/components/staff/staff-ui';

export default function StaffProfilePage() {
  const { salonId } = useStaffPortal();
  const { data: profile, isLoading } = useStaffProfile(salonId);
  const updateProfile = useUpdateStaffProfile(salonId);
  const [form, setForm] = useState({ displayName: '', bio: '', specialties: '' });

  useEffect(() => {
    if (!profile) return;
    setForm({
      displayName: profile.displayName ?? '',
      bio: profile.bio ?? '',
      specialties: profile.specialties?.join('، ') ?? '',
    });
  }, [profile]);

  const save = async () => {
    if (form.displayName.trim().length < 2) return toast.error('نام نمایشی را وارد کنید');
    try {
      await updateProfile.mutateAsync({
        displayName: form.displayName.trim(),
        bio: form.bio.trim(),
        specialties: form.specialties
          .split(/[،,]/)
          .map((item) => item.trim())
          .filter(Boolean),
      });
      toast.success('پروفایل حرفه‌ای ذخیره شد');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'ذخیره پروفایل انجام نشد'));
    }
  };

  return (
    <div>
      <StaffPageHeader
        title="پروفایل حرفه‌ای"
        description="اطلاعاتی که مدیر سالن و در بخش‌های مرتبط مشتری مشاهده می‌کند."
        action={
          <button
            onClick={save}
            disabled={updateProfile.isPending || isLoading}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-plum-600)] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Save size={15} /> ذخیره تغییرات
          </button>
        }
      />
      {isLoading || !profile ? (
        <StaffPageLoading />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-[var(--ui-gray-200)] bg-white p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[var(--brand-plum-50)]">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[var(--brand-plum-600)]">
                    {profile.displayName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold text-[var(--brand-navy-600)]">{profile.displayName}</p>
                <p className="mt-1 text-xs text-[var(--ui-gray-500)]">{profile.salon.name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="نام نمایشی">
                <input
                  value={form.displayName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, displayName: event.target.value }))
                  }
                  maxLength={100}
                  className="w-full rounded-xl border border-[var(--ui-gray-200)] bg-[var(--bg-ivory)] px-4 py-3 text-sm"
                />
              </Field>
              <Field label="تخصص‌ها">
                <input
                  value={form.specialties}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, specialties: event.target.value }))
                  }
                  placeholder="کوتاهی مو، رنگ، فیشیال"
                  className="w-full rounded-xl border border-[var(--ui-gray-200)] bg-[var(--bg-ivory)] px-4 py-3 text-sm"
                />
                <p className="mt-1 text-[10px] text-[var(--ui-gray-400)]">
                  موارد را با ویرگول جدا کنید.
                </p>
              </Field>
              <Field label="درباره من">
                <textarea
                  value={form.bio}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, bio: event.target.value }))
                  }
                  maxLength={1000}
                  rows={5}
                  placeholder="تجربه، سبک کاری و مهارت‌های حرفه‌ای خود را معرفی کنید."
                  className="w-full resize-none rounded-xl border border-[var(--ui-gray-200)] bg-[var(--bg-ivory)] px-4 py-3 text-sm leading-7"
                />
              </Field>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-[var(--ui-gray-200)] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <BriefcaseBusiness size={18} className="text-[var(--brand-plum-600)]" />
                <h2 className="text-sm font-bold text-[var(--brand-navy-600)]">خدمات قابل ارائه</h2>
              </div>
              <div className="space-y-2">
                {profile.services.map((item: any) => (
                  <div
                    key={item.service.id}
                    className="flex items-center justify-between rounded-xl bg-[var(--bg-ivory)] px-3 py-3 text-xs"
                  >
                    <span className="font-semibold text-[var(--brand-navy-600)]">
                      {item.service.name}
                    </span>
                    <span className="text-[var(--ui-gray-500)]">
                      {item.service.durationMinutes.toLocaleString('fa-IR')} دقیقه
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-[var(--ui-gray-400)]">
                <ShieldCheck className="mt-0.5 shrink-0" size={13} /> انتساب خدمات توسط مدیر سالن
                انجام می‌شود.
              </p>
            </section>

            <section className="rounded-2xl border border-[var(--ui-gray-200)] bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <BadgeCheck size={18} className="text-[var(--brand-gold-700)]" />
                <h2 className="text-sm font-bold text-[var(--brand-navy-600)]">مدل همکاری</h2>
              </div>
              <p className="text-sm font-bold text-[var(--brand-plum-600)]">
                {compensationLabel(profile)}
              </p>
              <p className="mt-2 text-xs leading-6 text-[var(--ui-gray-500)]">
                تغییر قرارداد مالی فقط توسط مدیر سالن انجام می‌شود و نتیجه آن در تسویه‌های شما قابل
                مشاهده است.
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-medium text-[var(--ui-gray-500)]">{label}</span>
      {children}
    </label>
  );
}

function compensationLabel(profile: any) {
  switch (profile.compensationType) {
    case 'FIXED_PER_SERVICE':
      return `${formatPrice(profile.fixedServiceAmount)} برای هر خدمت`;
    case 'SALARY':
      return `حقوق ثابت ماهانه ${formatPrice(profile.monthlySalary)}`;
    case 'SALARY_PLUS_PERCENTAGE':
      return `حقوق ثابت ${formatPrice(profile.monthlySalary)} + ${profile.commissionRate.toLocaleString('fa-IR')}٪ پورسانت`;
    default:
      return `${profile.commissionRate.toLocaleString('fa-IR')}٪ پورسانت خدمات`;
  }
}

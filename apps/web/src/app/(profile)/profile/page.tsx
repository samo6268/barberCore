'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Edit2, Mail, Phone, Save, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMe, useUpdateProfile } from '@/lib/api-hooks';

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'مشتری',
  SALON_OWNER: 'مالک سالن',
  STAFF: 'متخصص',
  SUPER_ADMIN: 'مدیر سیستم',
};

export default function ProfilePage() {
  const { data: user, isLoading, isError, refetch } = useMe();
  const updateProfile = useUpdateProfile();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
    });
  }, [user]);

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return toast.error('نام و نام خانوادگی را وارد کنید');
    }
    try {
      await updateProfile.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
      });
      setEditMode(false);
      toast.success('پروفایل با موفقیت به‌روزرسانی شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'ذخیره تغییرات انجام نشد');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#fffdf9] px-4 py-28"><div className="mx-auto h-80 max-w-2xl animate-pulse rounded-3xl bg-white" /></div>;
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-[#fffdf9] px-4 py-28 text-center">
        <h1 className="text-xl font-semibold text-[#2d2927]">دریافت پروفایل انجام نشد</h1>
        <div className="mt-5 flex justify-center gap-3">
          <button onClick={() => refetch()} className="rounded-xl border border-[#ded7d1] bg-white px-5 py-2.5 text-sm">تلاش دوباره</button>
          <Link href="/login?returnTo=/profile" className="rounded-xl bg-[#30393d] px-5 py-2.5 text-sm text-white">ورود</Link>
        </div>
      </div>
    );
  }

  const initial = (user.firstName || user.lastName || 'پ').trim().charAt(0);

  return (
    <main className="min-h-screen bg-[#fffdf9] px-4 pb-20 pt-28">
      <div className="mx-auto max-w-2xl">
        <section className="overflow-hidden rounded-3xl border border-[#e7e0da] bg-white">
          <div className="h-28 bg-gradient-to-l from-[#30393d] to-[#536066]" />
          <div className="px-6 pb-7 sm:px-8">
            <div className="-mt-10 flex items-end justify-between gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#ead3a6] text-3xl font-bold text-[#3d2b25]">{initial}</div>
              <button onClick={() => setEditMode((current) => !current)} className="flex items-center gap-2 rounded-xl border border-[#ded7d1] px-4 py-2 text-sm font-medium text-[#30393d]">
                {editMode ? <X size={15} /> : <Edit2 size={15} />}
                {editMode ? 'انصراف' : 'ویرایش پروفایل'}
              </button>
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold text-[#292421]">{user.firstName} {user.lastName}</h1>
            <p className="mt-1 text-sm text-[#817872]">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-[#e7e0da] bg-white p-6 sm:p-8">
          <div className="mb-7 flex items-center justify-between">
            <div><p className="text-xs font-semibold text-[#a16e5d]">اطلاعات حساب</p><h2 className="mt-2 text-lg font-semibold text-[#292421]">مشخصات فردی</h2></div>
            <User size={22} className="text-[#8b5e50]" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="نام" value={form.firstName} editable={editMode} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} />
            <Field label="نام خانوادگی" value={form.lastName} editable={editMode} onChange={(value) => setForm((current) => ({ ...current, lastName: value }))} />
            <Field label="ایمیل" value={form.email} editable={editMode} icon={<Mail size={15} />} dir="ltr" onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
            <Field label="شماره موبایل" value={user.phone ?? 'ثبت نشده'} editable={false} icon={<Phone size={15} />} dir="ltr" onChange={() => undefined} />
          </div>
          {editMode && (
            <button onClick={save} disabled={updateProfile.isPending} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5e50] py-3 text-sm font-semibold text-white disabled:opacity-50">
              <Save size={16} /> {updateProfile.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          )}
        </section>

        <Link href="/profile/bookings" className="mt-5 flex items-center justify-between rounded-3xl border border-[#e7e0da] bg-white p-6 transition hover:border-[#cdbdb2]">
          <span><strong className="block text-sm text-[#292421]">رزروهای من</strong><span className="mt-1 block text-xs text-[#817872]">مشاهده، پیگیری یا لغو نوبت‌ها</span></span>
          <Calendar size={22} className="text-[#8b5e50]" />
        </Link>
      </div>
    </main>
  );
}

function Field({ label, value, editable, onChange, icon, dir }: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-medium text-[#817872]">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-[#e7e0da] bg-[#faf7f3] px-4 py-3">
        {icon && <span className="text-[#9a8e87]">{icon}</span>}
        <input value={value} readOnly={!editable} onChange={(event) => onChange(event.target.value)} dir={dir} className="w-full bg-transparent text-sm text-[#292421] outline-none read-only:cursor-default" />
      </span>
    </label>
  );
}

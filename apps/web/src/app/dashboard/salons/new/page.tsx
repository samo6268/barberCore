'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateSalon, useMe } from '@/lib/api-hooks';
import { useEffect } from 'react';

const STEPS = ['اطلاعات اصلی', 'آدرس و موقعیت', 'تأیید و ارسال'];

export default function NewSalonPage() {
  const router = useRouter();
  const { data: user } = useMe();
  const createSalon = useCreateSalon();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', description: '', genderType: 'UNISEX' as 'MALE' | 'FEMALE' | 'UNISEX',
    phone: '', city: '', province: '', address: '', instagramHandle: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name) return toast.error('نام سالن را وارد کنید');
    try {
      const salon = await createSalon.mutateAsync(form);
      toast.success('سالن با موفقیت ثبت شد! 🎉');
      router.push(`/dashboard/salons/${salon.id}/services`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در ثبت سالن');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>ثبت سالن جدید</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>اطلاعات سالن خود را وارد کنید</p>

        {/* Steps */}
        <div className="flex mb-8 gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`h-1 rounded-full mb-2 transition-colors`} style={{ background: i <= step ? 'var(--color-primary)' : 'var(--color-border)' }} />
              <span className="text-xs" style={{ color: i <= step ? 'var(--color-primary)' : 'var(--color-muted)' }}>{s}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 border space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {step === 0 && (
            <>
              <Field label="نام سالن *" value={form.name} onChange={v => set('name', v)} placeholder="مثال: آرایشگاه برادران احمدی" />
              <Field label="توضیحات" value={form.description} onChange={v => set('description', v)} placeholder="درباره سالن خود بنویسید..." multiline />
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>نوع سالن</label>
                <div className="flex gap-2">
                  {[{ v: 'MALE', l: '🪒 مردانه' }, { v: 'FEMALE', l: '💅 زنانه' }, { v: 'UNISEX', l: '✂️ عمومی' }].map(opt => (
                    <button key={opt.v} onClick={() => set('genderType', opt.v)}
                      className="flex-1 py-2 rounded-xl border text-sm transition-colors"
                      style={{ borderColor: form.genderType === opt.v ? 'var(--color-primary)' : 'var(--color-border)', color: form.genderType === opt.v ? 'var(--color-primary)' : 'var(--color-text)', background: form.genderType === opt.v ? 'var(--color-background)' : 'transparent' }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="شماره تلفن سالن" value={form.phone} onChange={v => set('phone', v)} placeholder="021-XXXXXXXX" dir="ltr" />
              <Field label="اینستاگرام" value={form.instagramHandle} onChange={v => set('instagramHandle', v)} placeholder="@salonname" dir="ltr" />
            </>
          )}

          {step === 1 && (
            <>
              <Field label="شهر" value={form.city} onChange={v => set('city', v)} placeholder="مثال: تهران" />
              <Field label="استان" value={form.province} onChange={v => set('province', v)} placeholder="مثال: تهران" />
              <Field label="آدرس کامل" value={form.address} onChange={v => set('address', v)} placeholder="خیابان، کوچه، پلاک..." multiline />
            </>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>بررسی اطلاعات</h3>
              {[['نام', form.name], ['نوع', form.genderType], ['شهر', form.city], ['آدرس', form.address]].map(([k, v]) => v && (
                <div key={k} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--color-text)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>قبلی</button>}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="flex-1 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90" style={{ background: 'var(--color-primary)' }}>
                بعدی ←
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={createSalon.isPending} className="flex-1 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: 'var(--color-primary)' }}>
                {createSalon.isPending ? 'در حال ثبت...' : '✅ ثبت سالن'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline, dir }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full px-4 py-3 rounded-xl border outline-none text-sm resize-none"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} dir={dir}
          className="w-full px-4 py-3 rounded-xl border outline-none text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }} />
      )}
    </div>
  );
}

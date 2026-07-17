'use client';

import { useState } from 'react';
import { Button } from '@ui/components/button';
import { Card, CardTitle, CardBody } from '@ui/components/card';
import { Input } from '@ui/components/input';
import { Badge } from '@ui/components/badge';
import { Avatar } from '@ui/components/avatar';
import { Modal } from '@ui/components/modal';
import { ScissorsIcon, CombIcon, RazorIcon, BrushIcon, HairDryerIcon } from '@ui/icons/custom';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-20">
      <p className="eyebrow mb-3">DESIGN SYSTEM</p>
      <h2 className="font-display text-h2 font-semibold mb-10" style={{ color: 'var(--color-text)' }}>
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="container-editorial py-20">
        <p className="eyebrow mb-4">BARBERCORE</p>
        <h1 className="font-display font-semibold text-display-xl mb-2" style={{ color: 'var(--color-text)' }}>
          Design System
        </h1>
        <p className="text-body-lg mb-16" style={{ color: 'var(--color-text-muted)' }}>
          Editorial Luxury — warm, premium, photography-first
        </p>

        {/* Color Palette */}
        <Section title="رنگ‌بندی">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Plum 600', bg: 'var(--brand-plum-600)', text: '#fff' },
              { label: 'Gold 600', bg: 'var(--brand-gold-600)', text: 'var(--brand-plum-900)' },
              { label: 'Rose 600', bg: 'var(--brand-rose-600)', text: '#fff' },
              { label: 'Navy 600', bg: 'var(--brand-navy-600)', text: 'var(--bg-ivory)' },
              { label: 'Ivory', bg: 'var(--bg-ivory)', text: 'var(--color-text)', border: 'var(--ui-gray-200)' },
              { label: 'Ivory Soft', bg: 'var(--bg-ivory-soft)', text: 'var(--color-text)', border: 'var(--ui-gray-200)' },
              { label: 'UI Gray 200', bg: 'var(--ui-gray-200)', text: 'var(--color-text)' },
              { label: 'Navy 900', bg: 'var(--brand-navy-900)', text: 'var(--bg-ivory)' },
            ].map((c) => (
              <div key={c.label} className="rounded-xl overflow-hidden border" style={{ borderColor: c.border || 'transparent' }}>
                <div className="h-16" style={{ background: c.bg }} />
                <div className="p-3 bg-white">
                  <p className="text-caption font-medium" style={{ color: 'var(--color-text)' }}>{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="تایپوگرافی">
          <div className="space-y-6" style={{ color: 'var(--color-text)' }}>
            <div>
              <p className="text-caption mb-1" style={{ color: 'var(--color-text-muted)' }}>display-2xl / 4.5rem</p>
              <p className="font-display font-semibold text-display-2xl leading-none">زیبایی، حالا یک تجربه است</p>
            </div>
            <div>
              <p className="text-caption mb-1" style={{ color: 'var(--color-text-muted)' }}>display-xl / 3.5rem</p>
              <p className="font-display font-semibold text-display-xl">Editorial Luxury</p>
            </div>
            <div>
              <p className="text-caption mb-1" style={{ color: 'var(--color-text-muted)' }}>display-lg / 2.5rem</p>
              <p className="font-display font-semibold text-display-lg">آرایشگاه‌های برتر</p>
            </div>
            <div>
              <p className="text-caption mb-1" style={{ color: 'var(--color-text-muted)' }}>display-md / 2rem</p>
              <p className="font-display font-medium text-display-md">خدمات تخصصی مو</p>
            </div>
            <div>
              <p className="text-caption mb-1" style={{ color: 'var(--color-text-muted)' }}>h2 / 1.5rem</p>
              <p className="font-display font-semibold text-h2">رزرو آنلاین</p>
            </div>
            <div>
              <p className="text-caption mb-1" style={{ color: 'var(--color-text-muted)' }}>body-lg / 1.125rem</p>
              <p className="text-body-lg" style={{ color: 'var(--color-text-muted)' }}>
                بهترین سالن‌های زیبایی ایران را کشف کنید و نوبت خود را به‌سادگی رزرو کنید.
              </p>
            </div>
            <div>
              <p className="text-caption mb-1" style={{ color: 'var(--color-text-muted)' }}>caption / uppercase</p>
              <p className="eyebrow">CHAPTER 01 — SERVICES</p>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="دکمه‌ها">
          <div className="space-y-8">
            <div>
              <p className="text-caption mb-4" style={{ color: 'var(--color-text-muted)' }}>Sizes</p>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">دکمه کوچک</Button>
                <Button size="md">دکمه متوسط</Button>
                <Button size="lg">دکمه بزرگ</Button>
                <Button size="xl">رزرو نوبت</Button>
              </div>
            </div>
            <div>
              <p className="text-caption mb-4" style={{ color: 'var(--color-text-muted)' }}>Variants</p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button loading>در حال بارگذاری...</Button>
                <Button disabled>غیرفعال</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Cards */}
        <Section title="کارت‌ها">
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="default">
              <CardTitle>کارت پیش‌فرض</CardTitle>
              <CardBody className="mt-3">
                سطح سفید با حاشیه خاکستری. مناسب برای محتوای معمولی.
              </CardBody>
            </Card>
            <Card variant="elevated">
              <CardTitle>کارت Elevated</CardTitle>
              <CardBody className="mt-3">
                پس‌زمینه ivory-soft بدون حاشیه. برای محتوای ثانویه.
              </CardBody>
            </Card>
            <Card variant="featured">
              <CardTitle>کارت Featured</CardTitle>
              <CardBody className="mt-3">
                پس‌زمینه طلایی با حاشیه gold. برای محتوای ویژه.
              </CardBody>
            </Card>
          </div>
        </Section>

        {/* Badges */}
        <Section title="بج‌ها">
          <div className="flex flex-wrap gap-3">
            <Badge variant="premium">Premium</Badge>
            <Badge variant="new">جدید</Badge>
            <Badge variant="verified">تأیید شده</Badge>
            <Badge variant="featured">ویژه</Badge>
            <Badge variant="default">پیش‌فرض</Badge>
          </div>
        </Section>

        {/* Avatars */}
        <Section title="آواتار">
          <div className="flex flex-wrap items-end gap-6">
            {([32, 40, 56, 80, 128] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Avatar name="علی محمدی" size={s} ring="default" />
                <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{s}px</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <Avatar name="سالن ویژه" size={56} ring="premium" />
              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>premium</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar name="استاد حرفه‌ای" size={56} ring="verified" />
              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>verified</span>
            </div>
          </div>
        </Section>

        {/* Input */}
        <Section title="فیلدهای ورودی">
          <div className="grid md:grid-cols-2 gap-12 max-w-xl">
            <Input
              label="نام"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <Input label="شماره موبایل" type="tel" />
            <Input label="ایمیل" type="email" error="آدرس ایمیل معتبر نیست" />
            <Input label="شهر" hint="مثال: تهران، اصفهان" />
          </div>
        </Section>

        {/* Icons */}
        <Section title="آیکون‌های اختصاصی">
          <div className="flex items-center gap-8">
            {[
              { Icon: ScissorsIcon, label: 'Scissors' },
              { Icon: CombIcon, label: 'Comb' },
              { Icon: RazorIcon, label: 'Razor' },
              { Icon: BrushIcon, label: 'Brush' },
              { Icon: HairDryerIcon, label: 'Hair Dryer' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <Icon size={32} style={{ color: 'var(--color-primary)' }} />
                <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Modal */}
        <Section title="مودال">
          <Button onClick={() => setModalOpen(true)}>باز کردن مودال</Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="رزرو نوبت">
            <div className="space-y-6">
              <Input label="نام خدمت" />
              <Input label="تاریخ" type="date" />
              <div className="flex gap-3 pt-2">
                <Button className="flex-1">تأیید رزرو</Button>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>انصراف</Button>
              </div>
            </div>
          </Modal>
        </Section>

        {/* Theme toggle */}
        <Section title="تم‌ها">
          <div className="flex gap-4">
            <button
              className="px-6 py-3 rounded-md text-body-sm font-medium border-2 transition-all"
              style={{ borderColor: 'var(--brand-plum-600)', color: 'var(--brand-plum-600)' }}
              onClick={() => document.documentElement.setAttribute('data-theme', 'female')}
            >
              Female Theme (Plum)
            </button>
            <button
              className="px-6 py-3 rounded-md text-body-sm font-medium border-2 transition-all"
              style={{ borderColor: 'var(--brand-navy-600)', color: 'var(--brand-navy-600)' }}
              onClick={() => document.documentElement.setAttribute('data-theme', 'male')}
            >
              Male Theme (Navy)
            </button>
          </div>
        </Section>
      </div>
    </main>
  );
}

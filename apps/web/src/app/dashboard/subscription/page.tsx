'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Star, Crown, ChevronRight, Loader2 } from 'lucide-react';
import { useMySalons, useSalonSubscription } from '@/lib/api-hooks';
import { toJalali } from '@/lib/utils';

const PLANS = [
  {
    id: 'FREE',
    name: 'رایگان',
    price: 0,
    commission: 30,
    color: 'var(--ui-gray-400)',
    bg: 'var(--ui-gray-100)',
    icon: <ChevronRight size={20} />,
    features: ['۱ سالن', 'تا ۳ کارمند', 'تا ۵ خدمت', 'پشتیبانی ایمیلی'],
    missing:  ['بوست تبلیغاتی', 'آمار پیشرفته', 'اسلات فیچرد'],
  },
  {
    id: 'STARTER',
    name: 'استارتر',
    price: 490_000,
    commission: 20,
    color: 'var(--brand-navy-600)',
    bg: 'var(--brand-navy-50)',
    icon: <Zap size={20} />,
    features: ['۳ سالن', 'تا ۱۰ کارمند', 'تا ۲۰ خدمت', 'بوست تبلیغاتی', 'آمار پایه', 'پشتیبانی چت'],
    missing:  ['اسلات فیچرد', 'API دسترسی'],
  },
  {
    id: 'PROFESSIONAL',
    name: 'حرفه‌ای',
    price: 990_000,
    commission: 15,
    color: 'var(--brand-plum-600)',
    bg: 'var(--brand-plum-50)',
    icon: <Star size={20} />,
    badge: 'پرفروش',
    features: ['۱۰ سالن', 'کارمند نامحدود', 'خدمات نامحدود', 'بوست + فیچرد', 'آمار کامل', 'پشتیبانی اولویت‌دار', 'API دسترسی'],
    missing:  [],
  },
  {
    id: 'ENTERPRISE',
    name: 'اینترپرایز',
    price: 2_490_000,
    commission: 10,
    color: 'var(--brand-gold-600)',
    bg: 'var(--brand-gold-100)',
    icon: <Crown size={20} />,
    features: ['سالن نامحدود', 'کارمند نامحدود', 'همه امکانات Pro', 'مدیر اکانت اختصاصی', 'SLA 99.9٪', 'White-label', 'اینتگریشن سفارشی'],
    missing:  [],
  },
];

export default function SubscriptionPage() {
  const { data: salons, isLoading: salonsLoading, isError: salonsError } = useMySalons();
  const [salonId, setSalonId] = useState('');
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    isError: subscriptionError,
  } = useSalonSubscription(salonId);

  useEffect(() => {
    if (!salonId && salons?.length) setSalonId(salons[0].id);
  }, [salonId, salons]);

  const currentPlan = subscription?.plan;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-ivory)' }}>

      {/* Header */}
      <div className="border-b py-4 px-6 flex items-center gap-3 sticky top-0 z-20"
        style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
        <Link href="/dashboard" className="text-sm" style={{ color: 'var(--ui-gray-400)' }}>
          داشبورد
        </Link>
        <span style={{ color: 'var(--ui-gray-200)' }}>/</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--brand-navy-600)' }}>پلن‌ها و اشتراک</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">اشتراک‌ها</p>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
            پلن مناسب خود را انتخاب کنید
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--ui-gray-500)' }}>
            هرچه پلن بالاتر، کمیسیون کمتر. در پلن Enterprise فقط ۱۰٪ کمیسیون می‌دهید.
          </p>
        </div>

        {salonsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" style={{ color: 'var(--brand-plum-600)' }} />
          </div>
        ) : salonsError ? (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
            دریافت سالن‌های شما ناموفق بود. لطفاً دوباره وارد حساب شوید.
          </div>
        ) : !salons?.length ? (
          <div className="mb-8 rounded-xl border p-6 text-center" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
            <p className="mb-4 text-sm" style={{ color: 'var(--ui-gray-500)' }}>برای فعال‌سازی اشتراک، ابتدا سالن خود را ثبت کنید.</p>
            <Link href="/dashboard/salons/new" className="inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: 'var(--brand-plum-600)' }}>
              ثبت سالن
            </Link>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border bg-white p-5" style={{ borderColor: 'var(--ui-gray-200)' }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="text-sm font-semibold" style={{ color: 'var(--brand-navy-600)' }}>
                سالن
                <select
                  className="mr-3 rounded-lg border bg-white px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--ui-gray-200)' }}
                  value={salonId}
                  onChange={(event) => setSalonId(event.target.value)}
                >
                  {salons.map((salon: any) => <option key={salon.id} value={salon.id}>{salon.name}</option>)}
                </select>
              </label>
              {subscriptionLoading ? (
                <Loader2 size={20} className="animate-spin" style={{ color: 'var(--brand-plum-600)' }} />
              ) : subscriptionError ? (
                <span className="text-sm text-red-600">دریافت وضعیت اشتراک ناموفق بود.</span>
              ) : subscription ? (
                <div className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>
                  پلن فعال: <strong style={{ color: 'var(--brand-navy-600)' }}>{PLANS.find((plan) => plan.id === subscription.plan)?.name || subscription.plan}</strong>
                  {subscription.expiresAt && <span> — اعتبار تا {toJalali(subscription.expiresAt)}</span>}
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map(plan => {
            const isCurrent = plan.id === currentPlan;
            const isPopular = plan.id === 'PROFESSIONAL';
            return (
              <div key={plan.id}
                className="rounded-2xl border flex flex-col overflow-hidden"
                style={{
                  background: 'white',
                  borderColor: isPopular ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)',
                  boxShadow: isPopular ? '0 0 0 2px var(--brand-plum-600)' : 'none',
                }}>

                {/* Plan badge */}
                {plan.badge && (
                  <div className="text-center py-1.5 text-xs font-bold"
                    style={{ background: 'var(--brand-plum-600)', color: 'white' }}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: plan.bg, color: plan.color }}>
                      {plan.icon}
                    </div>
                    <div>
                      <h2 className="font-bold text-base" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
                        {plan.name}
                      </h2>
                      <p className="text-xs font-semibold" style={{ color: plan.color }}>
                        کمیسیون {plan.commission}٪
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <p className="text-2xl font-bold" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>رایگان</p>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
                          {plan.price.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-sm mr-1" style={{ color: 'var(--ui-gray-400)' }}>تومان/ماه</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm"
                        style={{ color: 'var(--brand-navy-600)' }}>
                        <Check size={14} style={{ color: '#27AE60', flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                    {plan.missing.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm line-through"
                        style={{ color: 'var(--ui-gray-300)' }}>
                        <div className="w-3.5 h-3.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="text-center py-2.5 rounded-xl text-sm font-medium"
                      style={{ background: 'var(--ui-gray-100)', color: 'var(--ui-gray-500)' }}>
                      پلن فعلی شما
                    </div>
                  ) : (
                    <button disabled className="w-full cursor-not-allowed py-2.5 rounded-xl text-sm font-semibold opacity-60"
                      style={{
                        background: isPopular ? 'var(--brand-plum-600)' : plan.bg,
                        color: isPopular ? 'white' : plan.color,
                        border: `1px solid ${plan.color}40`,
                      }}>
                      فعال‌سازی پس از اتصال درگاه
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Commission comparison table */}
        <div className="mt-12 rounded-2xl border overflow-hidden"
          style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--ui-gray-100)' }}>
            <h2 className="font-bold text-base" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
              مقایسه کمیسیون بوست
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--ui-gray-400)' }}>
              فرض: درآمد ماهانه ۵۰ میلیون تومان از رزروهای بوست‌شده
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--ui-gray-100)' }}>
            {PLANS.map(plan => {
              const gross = 50_000_000;
              const commission = gross * (plan.commission / 100);
              const net = gross - commission;
              return (
                <div key={plan.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="w-24 text-sm font-semibold" style={{ color: plan.color }}>{plan.name}</span>
                  <span className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>کمیسیون: {commission.toLocaleString('fa-IR')} تومان</span>
                  <span className="mr-auto text-sm font-bold" style={{ color: 'var(--brand-navy-600)' }}>
                    خالص شما: {net.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

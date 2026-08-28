'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Clock3,
  Eye,
  MapPin,
  RefreshCw,
  Scissors,
  Settings,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useSalonOverview } from '@/lib/api-hooks';
import { SALON_IMAGES } from '@/lib/images';
import { formatPrice, formatTime, iranDateInput, toJalali } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'در انتظار',
  CONFIRMED: 'تأییدشده',
  IN_PROGRESS: 'در حال انجام',
  COMPLETED: 'تکمیل‌شده',
  CANCELLED: 'لغوشده',
  NO_SHOW: 'عدم مراجعه',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
  IN_PROGRESS: 'bg-violet-50 text-violet-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-red-50 text-red-700',
  NO_SHOW: 'bg-slate-100 text-slate-600',
};

export default function SalonOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const date = iranDateInput();
  const { data, isLoading, isError, refetch } = useSalonOverview(id, date);

  if (isLoading) {
    return (
      <DashboardLayout salonId={id} activeTab="overview">
        <div className="space-y-5">
          <div className="h-72 animate-pulse rounded-3xl bg-white" />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout salonId={id} activeTab="overview">
        <div className="rounded-3xl border border-[var(--ui-gray-200)] bg-white px-5 py-20 text-center">
          <p className="text-sm text-[var(--ui-gray-500)]">اطلاعات مدیریتی سالن دریافت نشد.</p>
          <button
            onClick={() => refetch()}
            className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-[var(--brand-navy-600)] px-5 py-2.5 text-sm text-white"
          >
            <RefreshCw size={15} /> تلاش دوباره
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { salon } = data;
  const cover = salon.coverImageUrl || SALON_IMAGES[0];
  const plan = salon.plan ?? salon.subscription?.tier ?? 'FREE';

  return (
    <DashboardLayout salonId={id} activeTab="overview" salonName={salon.name} plan={plan}>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="relative min-h-[280px] overflow-hidden rounded-3xl bg-[var(--brand-navy-600)] shadow-lg shadow-slate-900/10">
          <img
            src={cover}
            alt={`فضای ${salon.name}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[rgba(21,27,45,.96)] via-[rgba(40,28,48,.72)] to-[rgba(20,25,40,.25)]" />
          <div className="relative flex min-h-[280px] flex-col justify-between p-6 text-white sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white/90 text-2xl shadow-xl sm:h-20 sm:w-20">
                  {salon.logoUrl ? (
                    <img src={salon.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    '✂️'
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold sm:text-3xl">{salon.name}</h1>
                    {salon.isVerified && (
                      <BadgeCheck size={21} className="text-[var(--brand-gold-400)]" />
                    )}
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-white/75">
                    <MapPin size={14} />{' '}
                    {[salon.city, salon.address].filter(Boolean).join('، ') ||
                      'نشانی سالن تکمیل نشده است'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/salons/${salon.slug}`}
                  className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-medium backdrop-blur-sm hover:bg-white/20"
                >
                  <Eye size={15} /> مشاهده صفحه عمومی
                </Link>
                <Link
                  href={`/dashboard/salons/${id}/settings`}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[var(--brand-navy-600)]"
                >
                  <Settings size={15} /> ویرایش سالن
                </Link>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/65">امروز، {toJalali(data.date)}</p>
              <p className="mt-1 max-w-2xl text-sm leading-7 text-white/90">
                {salon.description ||
                  'مرکز عملیات امروز سالن؛ رزروها، تیم و عملکرد کسب‌وکار در یک نگاه.'}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric
            icon={CalendarDays}
            label="نوبت‌های امروز"
            value={data.today.total.toLocaleString('fa-IR')}
            hint={`${(data.today.statusCounts.IN_PROGRESS ?? 0).toLocaleString('fa-IR')} در حال انجام`}
          />
          <Metric
            icon={Wallet}
            label="فروش تکمیل‌شده امروز"
            value={formatPrice(data.today.revenue)}
            hint={`${(data.today.statusCounts.COMPLETED ?? 0).toLocaleString('fa-IR')} خدمت تکمیل‌شده`}
          />
          <Metric
            icon={Users}
            label="تیم فعال"
            value={salon._count.staffProfiles.toLocaleString('fa-IR')}
            hint={`${salon._count.services.toLocaleString('fa-IR')} خدمت فعال`}
          />
          <Metric
            icon={TrendingUp}
            label="فروش ماه جاری"
            value={formatPrice(data.month.revenue)}
            hint={`${data.month.completed.toLocaleString('fa-IR')} رزرو تکمیل‌شده`}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-[var(--ui-gray-200)] bg-white p-5 sm:p-6">
            <SectionTitle
              icon={Clock3}
              title="برنامه امروز"
              description="ترتیب اجرای خدمات و وضعیت جاری سالن"
              href={`/dashboard/salons/${id}/bookings`}
            />
            {!data.today.bookings.length ? (
              <EmptyText text="برای امروز هنوز نوبتی ثبت نشده است." />
            ) : (
              <div className="mt-5 space-y-2">
                {data.today.bookings.slice(0, 7).map((booking: any) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--ui-gray-200)] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[var(--brand-navy-600)]">آمادگی سالن</h2>
                  <p className="mt-1 text-xs text-[var(--ui-gray-500)]">
                    تکمیل اطلاعات برای جذب مشتری بیشتر
                  </p>
                </div>
                <span className="text-lg font-bold text-[var(--brand-plum-600)]">
                  ٪{data.setup.percent.toLocaleString('fa-IR')}
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--ui-gray-100)]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[var(--brand-plum-600)] to-[var(--brand-gold-500)]"
                  style={{ width: `${data.setup.percent}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-6 text-[var(--ui-gray-500)]">
                {data.setup.completed.toLocaleString('fa-IR')} از{' '}
                {data.setup.total.toLocaleString('fa-IR')} بخش اصلی آماده است.
              </p>
              <Link
                href={`/dashboard/salons/${id}/settings`}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-plum-600)]"
              >
                تکمیل اطلاعات <ArrowLeft size={13} />
              </Link>
            </div>

            <div className="rounded-3xl border border-[var(--ui-gray-200)] bg-white p-5 sm:p-6">
              <SectionTitle
                icon={CalendarDays}
                title="نوبت‌های پیش‌رو"
                description="پنج نوبت فعال بعدی"
              />
              {!data.upcoming.length ? (
                <EmptyText text="نوبت فعال آینده‌ای وجود ندارد." />
              ) : (
                <div className="mt-4 divide-y divide-[var(--ui-gray-100)]">
                  {data.upcoming.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--brand-navy-600)]">
                          {booking.customer.firstName} {booking.customer.lastName}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-[var(--ui-gray-500)]">
                          {booking.staff?.displayName || 'بدون متخصص'} ·{' '}
                          {booking.items.map((item: any) => item.service.name).join('، ')}
                        </p>
                      </div>
                      <div className="shrink-0 text-left text-xs text-[var(--brand-plum-600)]">
                        <b dir="ltr">{formatTime(booking.startsAt)}</b>
                        <br />
                        <span className="text-[10px] text-[var(--ui-gray-400)]">
                          {toJalali(booking.startsAt, 'MM/DD')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-bold text-[var(--brand-navy-600)]">دسترسی سریع مدیریت</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {[
              { href: 'bookings', icon: CalendarDays, label: 'رزروها' },
              { href: 'services', icon: Scissors, label: 'خدمات' },
              { href: 'staff', icon: Users, label: 'کارکنان' },
              { href: 'settlements', icon: Wallet, label: 'تسویه‌ها' },
              { href: 'reports', icon: BarChart3, label: 'گزارش‌ها' },
              { href: 'settings', icon: Settings, label: 'تنظیمات' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={`/dashboard/salons/${id}/${href}`}
                className="group flex items-center gap-3 rounded-2xl border border-[var(--ui-gray-200)] bg-white p-4 text-sm font-semibold text-[var(--brand-navy-600)] transition hover:-translate-y-0.5 hover:border-[var(--brand-plum-300)] hover:shadow-sm"
              >
                <span className="rounded-xl bg-[var(--brand-plum-50)] p-2.5 text-[var(--brand-plum-600)]">
                  <Icon size={18} />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[var(--ui-gray-200)] bg-white p-5 sm:p-6">
            <SectionTitle
              icon={Users}
              title="تیم امروز"
              description="متخصصان فعال و تعداد نوبت‌های امروز"
              href={`/dashboard/salons/${id}/staff`}
            />
            {!data.staff.length ? (
              <EmptyText text="هنوز متخصص فعالی اضافه نشده است." />
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {data.staff.slice(0, 6).map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-2xl bg-[var(--bg-ivory)] p-3"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--brand-plum-100)] font-bold text-[var(--brand-plum-600)]">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        member.displayName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--brand-navy-600)]">
                        {member.displayName}
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--ui-gray-500)]">
                        {member._count.bookings.toLocaleString('fa-IR')} نوبت امروز
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[var(--ui-gray-200)] bg-white p-5 sm:p-6">
            <SectionTitle
              icon={Star}
              title="بازخوردهای تازه"
              description={`${salon.rating.toLocaleString('fa-IR')} از ۵ · ${salon._count.reviews.toLocaleString('fa-IR')} نظر`}
            />
            {!data.reviews.length ? (
              <EmptyText text="هنوز نظری برای سالن ثبت نشده است." />
            ) : (
              <div className="mt-5 space-y-3">
                {data.reviews.map((review: any) => (
                  <div key={review.id} className="rounded-2xl bg-[var(--bg-ivory)] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[var(--brand-navy-600)]">
                        {review.customer.firstName} {review.customer.lastName}
                      </p>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star size={12} fill="currentColor" />{' '}
                        {review.rating.toLocaleString('fa-IR')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 line-clamp-2 text-xs leading-6 text-[var(--ui-gray-500)]">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--ui-gray-200)] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-[var(--ui-gray-500)]">{label}</span>
        <span className="rounded-xl bg-[var(--brand-plum-50)] p-2 text-[var(--brand-plum-600)]">
          <Icon size={17} />
        </span>
      </div>
      <p className="truncate text-lg font-bold text-[var(--brand-navy-600)] sm:text-xl">{value}</p>
      <p className="mt-1 text-[10px] text-[var(--ui-gray-400)] sm:text-xs">{hint}</p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof Clock3;
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-[var(--brand-plum-50)] p-2 text-[var(--brand-plum-600)]">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="font-bold text-[var(--brand-navy-600)]">{title}</h2>
          <p className="mt-1 text-[11px] text-[var(--ui-gray-500)]">{description}</p>
        </div>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-xs font-semibold text-[var(--brand-plum-600)]">
          مشاهده همه
        </Link>
      )}
    </div>
  );
}

function BookingRow({ booking }: { booking: any }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-transparent p-3 transition hover:border-[var(--ui-gray-200)] hover:bg-[var(--bg-ivory)]">
      <div className="w-14 shrink-0 text-center">
        <p dir="ltr" className="text-sm font-bold text-[var(--brand-plum-600)]">
          {formatTime(booking.startsAt)}
        </p>
        <p dir="ltr" className="mt-1 text-[10px] text-[var(--ui-gray-400)]">
          {formatTime(booking.endsAt)}
        </p>
      </div>
      <div className="min-w-0 flex-1 border-r border-[var(--ui-gray-100)] pr-3">
        <p className="truncate text-sm font-semibold text-[var(--brand-navy-600)]">
          {booking.customer.firstName} {booking.customer.lastName}
        </p>
        <p className="mt-1 truncate text-[11px] text-[var(--ui-gray-500)]">
          {booking.items.map((item: any) => item.service.name).join('، ')} ·{' '}
          {booking.staff?.displayName || 'بدون متخصص'}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLES[booking.status] ?? STATUS_STYLES.NO_SHOW}`}
      >
        {STATUS_LABELS[booking.status] ?? booking.status}
      </span>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-[var(--ui-gray-200)] px-4 py-10 text-center text-xs text-[var(--ui-gray-500)]">
      {text}
    </div>
  );
}

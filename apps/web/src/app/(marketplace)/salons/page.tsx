'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, MapPin, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { useSearchSalons } from '@/lib/api-hooks';
import { SALON_IMAGES } from '@/lib/images';
import { formatPrice } from '@/lib/utils';

type SalonSummary = {
  id: string;
  slug: string;
  name: string;
  city: string;
  address?: string | null;
  rating: number;
  reviewCount: number;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  genderType: 'FEMALE' | 'MALE' | 'UNISEX';
  isVerified: boolean;
  featured: boolean;
  minPrice: number | null;
  services: Array<{
    id: string;
    name: string;
    price: number;
    discountPrice?: number | null;
  }>;
};

const CITIES = ['همه شهرها', 'تهران', 'سمنان', 'اصفهان', 'مشهد', 'شیراز', 'تبریز', 'کرج'];
const SERVICES = [
  'همه خدمات',
  'کوتاهی',
  'رنگ مو',
  'کراتین',
  'میکاپ',
  'ناخن',
  'پوست',
  'اصلاح',
  'عروس',
];
const SORT_OPTIONS = [
  { value: 'rating', label: 'بهترین امتیاز' },
  { value: 'reviews', label: 'بیشترین نظر' },
];

export default function SalonsPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('همه شهرها');
  const [gender, setGender] = useState<'ALL' | 'FEMALE' | 'MALE'>('ALL');
  const [service, setService] = useState('همه خدمات');
  const [sort, setSort] = useState<'rating' | 'reviews'>('rating');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get('q');
    const initialCity = params.get('city');
    const initialService = params.get('service');
    const initialGender = params.get('gender');

    if (initialSearch) setSearch(initialSearch);
    if (initialCity) {
      if (CITIES.includes(initialCity)) setCity(initialCity);
      else if (!initialSearch) setSearch(initialCity);
    }
    if (initialService && SERVICES.includes(initialService)) setService(initialService);
    if (initialGender === 'FEMALE' || initialGender === 'MALE') setGender(initialGender);
  }, []);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      page: String(page),
      limit: '9',
      sort,
    };
    if (deferredSearch.trim()) params.q = deferredSearch.trim();
    if (city !== 'همه شهرها') params.city = city;
    if (gender !== 'ALL') params.gender = gender;
    if (service !== 'همه خدمات') params.service = service;
    return params;
  }, [city, deferredSearch, gender, page, service, sort]);

  const { data, isLoading, isFetching, isError, refetch } = useSearchSalons(queryParams);
  const salons = (data?.data ?? []) as SalonSummary[];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const activeFilterCount = [
    city !== 'همه شهرها',
    gender !== 'ALL',
    service !== 'همه خدمات',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch('');
    setCity('همه شهرها');
    setGender('ALL');
    setService('همه خدمات');
    setSort('rating');
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg-ivory)' }}>
      <div
        className="py-10 border-b"
        style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}
      >
        <div className="container-editorial">
          <p className="eyebrow mb-3">مارکت‌پلیس پرنگارین</p>
          <h1
            className="font-display font-semibold mb-6"
            style={{
              fontSize: '2.5rem',
              color: 'var(--brand-navy-600)',
              letterSpacing: '-0.03em',
            }}
          >
            انتخاب و رزرو آرایشگاه
          </h1>

          <div className="flex gap-3 flex-col sm:flex-row">
            <div
              className="flex-1 flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-colors focus-within:border-[var(--brand-plum-600)]"
              style={{ background: 'var(--bg-ivory)', borderColor: 'var(--ui-gray-200)' }}
            >
              <Search size={18} style={{ color: 'var(--ui-gray-400)' }} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="نام سالن، شهر یا محله را جستجو کنید"
                className="flex-1 outline-none bg-transparent text-sm"
                style={{ color: 'var(--brand-navy-600)' }}
              />
              {isFetching && !isLoading && (
                <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" />
              )}
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  aria-label="پاک‌کردن جستجو"
                >
                  <X size={15} style={{ color: 'var(--ui-gray-400)' }} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((current) => !current)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all"
              style={{
                borderColor: activeFilterCount > 0 ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)',
                color: activeFilterCount > 0 ? 'var(--brand-plum-600)' : 'var(--brand-navy-600)',
                background: activeFilterCount > 0 ? 'var(--brand-plum-50)' : 'white',
              }}
            >
              <SlidersHorizontal size={16} />
              فیلترها
              {activeFilterCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                  style={{ background: 'var(--brand-plum-600)' }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div
              className="mt-4 p-5 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              style={{ background: 'var(--bg-ivory)', borderColor: 'var(--ui-gray-200)' }}
            >
              <FilterSelect
                label="شهر"
                value={city}
                options={CITIES}
                onChange={(value) => {
                  setCity(value);
                  setPage(1);
                }}
              />

              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: 'var(--ui-gray-500)' }}
                >
                  نوع سالن
                </label>
                <div className="flex gap-2">
                  {[
                    ['ALL', 'همه'],
                    ['FEMALE', 'زنانه'],
                    ['MALE', 'مردانه'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => {
                        setGender(value as typeof gender);
                        setPage(1);
                      }}
                      className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: gender === value ? 'var(--brand-plum-600)' : 'white',
                        color: gender === value ? 'white' : 'var(--brand-navy-600)',
                        border: `1px solid ${
                          gender === value ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)'
                        }`,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <FilterSelect
                label="خدمت"
                value={service}
                options={SERVICES}
                onChange={(value) => {
                  setService(value);
                  setPage(1);
                }}
              />
              <FilterSelect
                label="مرتب‌سازی"
                value={sort}
                options={SORT_OPTIONS.map((option) => option.value)}
                labels={Object.fromEntries(
                  SORT_OPTIONS.map((option) => [option.value, option.label]),
                )}
                onChange={(value) => {
                  setSort(value as typeof sort);
                  setPage(1);
                }}
              />

              {(activeFilterCount > 0 || search) && (
                <button
                  onClick={resetFilters}
                  className="col-span-full flex items-center gap-1.5 text-xs font-medium w-fit"
                  style={{ color: 'var(--brand-plum-600)' }}
                >
                  <X size={13} /> حذف همه فیلترها
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container-editorial py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>
            <span className="font-bold" style={{ color: 'var(--brand-navy-600)' }}>
              {(meta?.total ?? 0).toLocaleString('fa-IR')}
            </span>{' '}
            آرایشگاه یافت شد
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="aspect-[4/5] rounded-2xl animate-pulse"
                style={{ background: 'white' }}
              />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-24">
            <p className="font-display text-xl mb-3" style={{ color: 'var(--brand-navy-600)' }}>
              دریافت اطلاعات سالن‌ها انجام نشد
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--brand-plum-600)' }}
            >
              تلاش دوباره
            </button>
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-24">
            <Search className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--ui-gray-400)' }} />
            <p className="font-display text-xl mb-2" style={{ color: 'var(--brand-navy-600)' }}>
              نتیجه‌ای یافت نشد
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--ui-gray-500)' }}>
              عبارت جستجو یا فیلترها را تغییر دهید
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--brand-plum-600)' }}
            >
              حذف فیلترها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon, index) => (
              <SalonCard
                key={salon.id}
                salon={salon}
                fallbackImage={SALON_IMAGES[index % SALON_IMAGES.length]}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || isFetching}
              className="px-4 py-2 rounded-xl text-sm border transition-all disabled:opacity-40"
              style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)' }}
            >
              قبلی
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                disabled={isFetching}
                className="w-9 h-9 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: page === number ? 'var(--brand-plum-600)' : 'white',
                  color: page === number ? 'white' : 'var(--brand-navy-600)',
                  border: `1px solid ${
                    page === number ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)'
                  }`,
                }}
              >
                {number.toLocaleString('fa-IR')}
              </button>
            ))}
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages || isFetching}
              className="px-4 py-2 rounded-xl text-sm border transition-all disabled:opacity-40"
              style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)' }}
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: 'var(--ui-gray-500)' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
        style={{
          border: '1px solid var(--ui-gray-200)',
          color: 'var(--brand-navy-600)',
          background: 'white',
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </div>
  );
}

function SalonCard({ salon, fallbackImage }: { salon: SalonSummary; fallbackImage: string }) {
  const image = salon.coverImageUrl || salon.logoUrl || fallbackImage;
  const genderLabel =
    salon.genderType === 'FEMALE' ? 'زنانه' : salon.genderType === 'MALE' ? 'مردانه' : 'خانوادگی';

  return (
    <Link href={`/salons/${salon.slug}`} className="group block">
      <article
        className="rounded-2xl overflow-hidden border transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1"
        style={{
          background: 'white',
          borderColor: salon.featured ? 'var(--brand-gold-300)' : 'var(--ui-gray-200)',
        }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={salon.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute top-3 right-3 flex gap-2">
            {salon.featured && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}
              >
                ویژه
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
              {genderLabel}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55">
            <Star size={11} className="fill-[var(--brand-gold-400)] text-[var(--brand-gold-400)]" />
            <span className="text-xs font-semibold text-white">
              {salon.rating.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-white/70">
              ({salon.reviewCount.toLocaleString('fa-IR')})
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h2
                  className="font-bold text-base truncate"
                  style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}
                >
                  {salon.name}
                </h2>
                {salon.isVerified && (
                  <CheckCircle
                    size={14}
                    style={{ color: 'var(--brand-plum-600)', flexShrink: 0 }}
                  />
                )}
              </div>
              <div
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--ui-gray-500)' }}
              >
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">
                  {salon.city}
                  {salon.address ? `، ${salon.address}` : ''}
                </span>
              </div>
            </div>
            <div className="text-left shrink-0">
              <p className="text-xs" style={{ color: 'var(--ui-gray-400)' }}>
                شروع قیمت
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--brand-plum-600)' }}>
                {salon.minPrice === null ? 'استعلام' : formatPrice(salon.minPrice)}
              </p>
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap min-h-6">
            {salon.services.map((service) => (
              <span
                key={service.id}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--bg-ivory)',
                  color: 'var(--ui-gray-500)',
                  border: '1px solid var(--ui-gray-200)',
                }}
              >
                {service.name}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}

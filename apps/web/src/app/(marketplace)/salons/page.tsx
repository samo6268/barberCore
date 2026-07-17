'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Filter, X, SlidersHorizontal, CheckCircle } from 'lucide-react';
import { SALON_IMAGES } from '@/lib/images';

/* ── Mock data ──────────────────────────────────────────────── */
const MOCK_SALONS = [
  { id: '1', slug: 'luxe-beauty', name: 'لوکس بیوتی', city: 'تهران', district: 'نیاوران', rating: 4.9, reviewCount: 312, image: SALON_IMAGES[0], gender: 'FEMALE', minPrice: 350_000, verified: true, featured: true, services: ['رنگ مو', 'کراتین', 'کوتاهی'] },
  { id: '2', slug: 'barber-classics', name: 'باربر کلاسیک', city: 'تهران', district: 'سعادت‌آباد', rating: 4.8, reviewCount: 224, image: SALON_IMAGES[1], gender: 'MALE', minPrice: 180_000, verified: true, featured: false, services: ['اصلاح', 'کوتاهی', 'وکس'] },
  { id: '3', slug: 'rose-salon', name: 'رز سالن', city: 'اصفهان', district: 'چهارباغ', rating: 4.7, reviewCount: 178, image: SALON_IMAGES[2], gender: 'FEMALE', minPrice: 280_000, verified: true, featured: true, services: ['میکاپ', 'آرایش عروس', 'ناخن'] },
  { id: '4', slug: 'golden-hair', name: 'گلدن هیر', city: 'مشهد', district: 'احمدآباد', rating: 4.8, reviewCount: 145, image: SALON_IMAGES[3], gender: 'FEMALE', minPrice: 220_000, verified: false, featured: false, services: ['رنگ مو', 'بالیاژ', 'هایلایت'] },
  { id: '5', slug: 'vogue-studio', name: 'ووگ استودیو', city: 'تهران', district: 'الهیه', rating: 4.9, reviewCount: 289, image: SALON_IMAGES[4], gender: 'FEMALE', minPrice: 450_000, verified: true, featured: true, services: ['شینیون', 'عروس', 'میکاپ'] },
  { id: '6', slug: 'noir-barber', name: 'نوار باربر', city: 'تهران', district: 'جردن', rating: 4.6, reviewCount: 98, image: SALON_IMAGES[5], gender: 'MALE', minPrice: 150_000, verified: true, featured: false, services: ['اصلاح', 'فید', 'تاتو ابرو'] },
  { id: '7', slug: 'aria-beauty', name: 'آریا بیوتی', city: 'شیراز', district: 'زند', rating: 4.5, reviewCount: 112, image: SALON_IMAGES[6], gender: 'FEMALE', minPrice: 200_000, verified: true, featured: false, services: ['ناخن', 'مانیکور', 'پدیکور'] },
  { id: '8', slug: 'elysian-cut', name: 'الیزان کات', city: 'تهران', district: 'تجریش', rating: 4.7, reviewCount: 201, image: SALON_IMAGES[7], gender: 'MALE', minPrice: 200_000, verified: true, featured: false, services: ['کوتاهی', 'اصلاح', 'رنگ'] },
  { id: '9', slug: 'persia-glam', name: 'پرشیا گلم', city: 'تبریز', district: 'ولیعصر', rating: 4.6, reviewCount: 87, image: SALON_IMAGES[8], gender: 'FEMALE', minPrice: 180_000, verified: false, featured: false, services: ['میکاپ', 'رنگ مو', 'کوتاهی'] },
  { id: '10', slug: 'zenith-barber', name: 'زنیت باربر', city: 'تهران', district: 'پونک', rating: 4.5, reviewCount: 63, image: SALON_IMAGES[9], gender: 'MALE', minPrice: 130_000, verified: true, featured: false, services: ['اصلاح', 'کوتاهی'] },
  { id: '11', slug: 'magnolia-spa', name: 'ماگنولیا اسپا', city: 'کرج', district: 'مهرشهر', rating: 4.8, reviewCount: 156, image: SALON_IMAGES[0], gender: 'FEMALE', minPrice: 300_000, verified: true, featured: true, services: ['فیشیال', 'لیزر', 'ناخن'] },
  { id: '12', slug: 'dapper-gents', name: 'دپر جنتس', city: 'تهران', district: 'شریعتی', rating: 4.7, reviewCount: 134, image: SALON_IMAGES[1], gender: 'MALE', minPrice: 160_000, verified: true, featured: false, services: ['اصلاح', 'ریش', 'مراقبت پوست'] },
];

const CITIES = ['همه شهرها', 'تهران', 'اصفهان', 'مشهد', 'شیراز', 'تبریز', 'کرج'];
const SERVICES = ['همه', 'رنگ مو', 'کراتین', 'میکاپ', 'ناخن', 'اصلاح', 'عروس'];
const SORT_OPTIONS = [
  { value: 'rating', label: 'بهترین امتیاز' },
  { value: 'reviews', label: 'بیشترین نظر' },
  { value: 'price_asc', label: 'کمترین قیمت' },
  { value: 'price_desc', label: 'بیشترین قیمت' },
];

const PAGE_SIZE = 9;

export default function SalonsPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('همه شهرها');
  const [gender, setGender] = useState<'ALL' | 'FEMALE' | 'MALE'>('ALL');
  const [service, setService] = useState('همه');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...MOCK_SALONS];
    if (search) list = list.filter(s => s.name.includes(search) || s.city.includes(search) || s.district.includes(search));
    if (city !== 'همه شهرها') list = list.filter(s => s.city === city);
    if (gender !== 'ALL') list = list.filter(s => s.gender === gender);
    if (service !== 'همه') list = list.filter(s => s.services.includes(service));
    list.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'reviews') return b.reviewCount - a.reviewCount;
      if (sort === 'price_asc') return a.minPrice - b.minPrice;
      if (sort === 'price_desc') return b.minPrice - a.minPrice;
      return 0;
    });
    return list;
  }, [search, city, gender, service, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = [city !== 'همه شهرها', gender !== 'ALL', service !== 'همه'].filter(Boolean).length;

  const resetFilters = () => { setCity('همه شهرها'); setGender('ALL'); setService('همه'); setPage(1); };

  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg-ivory)' }}>

      {/* Search header */}
      <div className="py-10 border-b" style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
        <div className="container-editorial">
          <p className="eyebrow mb-3">مارکت‌پلیس</p>
          <h1 className="font-display font-semibold mb-6" style={{ fontSize: '2.5rem', color: 'var(--brand-navy-600)', letterSpacing: '-0.03em' }}>
            آرایشگاه‌ها
          </h1>

          {/* Search bar */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-colors focus-within:border-[var(--brand-plum-600)]"
              style={{ background: 'var(--bg-ivory)', borderColor: 'var(--ui-gray-200)' }}>
              <Search size={18} style={{ color: 'var(--ui-gray-400)' }} />
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="جستجو بر اساس نام، شهر، محله..."
                className="flex-1 outline-none bg-transparent text-sm"
                style={{ color: 'var(--brand-navy-600)' }}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={15} style={{ color: 'var(--ui-gray-400)' }} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all"
              style={{
                borderColor: activeFilterCount > 0 ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)',
                color: activeFilterCount > 0 ? 'var(--brand-plum-600)' : 'var(--brand-navy-600)',
                background: activeFilterCount > 0 ? 'var(--brand-plum-50)' : 'white',
              }}>
              <SlidersHorizontal size={16} />
              فیلترها
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                  style={{ background: 'var(--brand-plum-600)' }}>{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 p-5 rounded-2xl border grid grid-cols-2 md:grid-cols-4 gap-4"
              style={{ background: 'var(--bg-ivory)', borderColor: 'var(--ui-gray-200)' }}>

              {/* City */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--ui-gray-500)' }}>شهر</label>
                <select value={city} onChange={e => { setCity(e.target.value); setPage(1); }}
                  className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                  style={{ border: '1px solid var(--ui-gray-200)', color: 'var(--brand-navy-600)', background: 'white' }}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--ui-gray-500)' }}>نوع سالن</label>
                <div className="flex gap-2">
                  {[['ALL', 'همه'], ['FEMALE', 'زنانه'], ['MALE', 'مردانه']].map(([val, lbl]) => (
                    <button key={val} onClick={() => { setGender(val as any); setPage(1); }}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: gender === val ? 'var(--brand-plum-600)' : 'white',
                        color: gender === val ? 'white' : 'var(--brand-navy-600)',
                        border: `1px solid ${gender === val ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)'}`,
                      }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--ui-gray-500)' }}>خدمت</label>
                <select value={service} onChange={e => { setService(e.target.value); setPage(1); }}
                  className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                  style={{ border: '1px solid var(--ui-gray-200)', color: 'var(--brand-navy-600)', background: 'white' }}>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--ui-gray-500)' }}>مرتب‌سازی</label>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                  style={{ border: '1px solid var(--ui-gray-200)', color: 'var(--brand-navy-600)', background: 'white' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {activeFilterCount > 0 && (
                <div className="col-span-full">
                  <button onClick={resetFilters}
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: 'var(--brand-plum-600)' }}>
                    <X size={13} /> حذف همه فیلترها
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container-editorial py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: 'var(--ui-gray-500)' }}>
            <span className="font-bold" style={{ color: 'var(--brand-navy-600)' }}>{filtered.length}</span> آرایشگاه یافت شد
          </p>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="text-sm rounded-xl px-3 py-2 outline-none md:hidden"
            style={{ border: '1px solid var(--ui-gray-200)', color: 'var(--brand-navy-600)', background: 'white' }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {paged.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-display text-xl mb-2" style={{ color: 'var(--brand-navy-600)' }}>نتیجه‌ای یافت نشد</p>
            <p className="text-sm mb-6" style={{ color: 'var(--ui-gray-500)' }}>فیلترها را تغییر دهید</p>
            <button onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--brand-plum-600)' }}>
              حذف فیلترها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paged.map(salon => <SalonCard key={salon.id} salon={salon} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl text-sm border transition-all disabled:opacity-40"
              style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)' }}>
              قبلی
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: page === n ? 'var(--brand-plum-600)' : 'white',
                  color: page === n ? 'white' : 'var(--brand-navy-600)',
                  border: `1px solid ${page === n ? 'var(--brand-plum-600)' : 'var(--ui-gray-200)'}`,
                }}>
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-sm border transition-all disabled:opacity-40"
              style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--brand-navy-600)' }}>
              بعدی
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Salon Card ─────────────────────────────────────────────── */
function SalonCard({ salon }: { salon: typeof MOCK_SALONS[0] }) {
  return (
    <Link href={`/salons/${salon.slug}`} className="group block">
      <div className="rounded-2xl overflow-hidden border transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1"
        style={{ background: 'white', borderColor: salon.featured ? 'var(--brand-gold-300)' : 'var(--ui-gray-200)' }}>

        {/* Cover */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={salon.image} alt={salon.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex gap-2">
            {salon.featured && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase"
                style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}>
                ویژه
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background: salon.gender === 'FEMALE' ? 'rgba(160,82,107,0.85)' : 'rgba(31,41,51,0.85)',
                color: 'white',
              }}>
              {salon.gender === 'FEMALE' ? 'زنانه' : 'مردانه'}
            </span>
          </div>

          {/* Rating overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <Star size={11} className="fill-[var(--brand-gold-400)] text-[var(--brand-gold-400)]" />
            <span className="text-xs font-semibold text-white">{salon.rating}</span>
            <span className="text-xs text-white/60">({salon.reviewCount})</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-bold text-base" style={{ color: 'var(--brand-navy-600)', fontFamily: 'var(--font-display)' }}>
                  {salon.name}
                </h3>
                {salon.verified && (
                  <CheckCircle size={14} style={{ color: 'var(--brand-plum-600)', flexShrink: 0 }} />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--ui-gray-500)' }}>
                <MapPin size={11} />
                {salon.city}، {salon.district}
              </div>
            </div>
            <div className="text-left flex-shrink-0">
              <p className="text-xs" style={{ color: 'var(--ui-gray-400)' }}>از</p>
              <p className="text-sm font-bold" style={{ color: 'var(--brand-plum-600)' }}>
                {(salon.minPrice / 1000).toLocaleString('fa-IR')}K
              </p>
            </div>
          </div>

          {/* Services */}
          <div className="flex gap-1.5 flex-wrap">
            {salon.services.slice(0, 3).map(s => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-ivory)', color: 'var(--ui-gray-500)', border: '1px solid var(--ui-gray-200)' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

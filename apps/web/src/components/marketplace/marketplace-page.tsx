'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { useSearchSalons } from '@/lib/api-hooks';
import { SalonCard } from '@/components/salon/salon-card';
import { Navbar } from '@/components/layout/navbar';
import { MOCK_SALONS_MALE, MOCK_SALONS_FEMALE } from '@/lib/mock-data';

const CITIES = ['تهران', 'اصفهان', 'مشهد', 'شیراز', 'تبریز', 'کرج', 'اهواز'];
const CATEGORIES = ['مو', 'رنگ', 'ناخن', 'آرایش', 'صورت', 'عروس', 'تخصصی'];

export function MarketplacePage({ gender }: { gender: 'male' | 'female' }) {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState({ q: '', city: '', gender: gender === 'male' ? 'MALE' : 'FEMALE' });

  const { data, isLoading } = useSearchSalons(search as Record<string, string>);
  const mockSalons = gender === 'male' ? MOCK_SALONS_MALE : MOCK_SALONS_FEMALE;

  const salons = useMemo(() => {
    if (data?.data?.length) return data.data;
    let list = mockSalons;
    if (search.city) list = list.filter(s => s.city === search.city);
    if (search.q) list = list.filter(s => s.name.includes(search.q) || s.description.includes(search.q));
    return list;
  }, [data, mockSalons, search]);

  const doSearch = () => setSearch({ q, city, gender: gender === 'male' ? 'MALE' : 'FEMALE' });

  return (
    <div data-theme={gender === 'female' ? 'female' : 'male'} className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Navbar />

      {/* Hero search bar */}
      <section
        className="pt-32 pb-16 relative overflow-hidden"
        style={{ background: gender === 'female' ? 'var(--bg-ivory-soft)' : 'var(--brand-navy-900)' }}
      >
        <div className="container-editorial text-center">
          <p className="eyebrow mb-4" style={{ color: gender === 'female' ? 'var(--color-accent)' : 'var(--brand-gold-600)' }}>
            {gender === 'female' ? 'سالن‌های زنانه' : 'آرایشگاه‌های مردانه'}
          </p>
          <h1
            className="font-display font-semibold text-display-lg mb-10"
            style={{ color: gender === 'female' ? 'var(--color-text)' : 'var(--bg-ivory)' }}
          >
            {gender === 'female' ? 'زیباترین سالن‌های ایران' : 'بهترین باربرشاپ‌های ایران'}
          </h1>

          {/* Search row */}
          <div className="max-w-2xl mx-auto flex gap-3">
            <div className="flex-1 flex items-center gap-3 px-5 py-4 rounded-md border-2 bg-white"
              style={{ borderColor: 'var(--ui-gray-200)' }}>
              <Search size={18} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                placeholder="نام سالن یا خدمت..."
                className="flex-1 bg-transparent text-body outline-none"
                style={{ color: 'var(--color-text)' }}
              />
            </div>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="px-4 py-4 rounded-md border-2 bg-white text-body outline-none"
              style={{ borderColor: 'var(--ui-gray-200)', color: 'var(--color-text)' }}
            >
              <option value="">همه شهرها</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={doSearch}
              className="px-8 py-4 rounded-md font-medium text-body transition-all duration-[250ms] hover:-translate-y-0.5"
              style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            >
              جستجو
            </button>
          </div>
        </div>
      </section>

      {/* Category filter chips */}
      <div className="border-b sticky top-20 z-40" style={{ background: 'var(--color-background)', borderColor: 'var(--ui-gray-200)' }}>
        <div className="container-editorial py-4 flex gap-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
              className="flex-none px-5 py-2 rounded-full text-body-sm font-medium transition-all duration-200"
              style={activeCategory === cat
                ? { background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }
                : { background: 'var(--ui-gray-100)', color: 'var(--color-text-muted)' }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="container-editorial py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>
            {isLoading ? 'در حال جستجو...' : `${salons.length} سالن یافت شد`}
          </p>
          {(search.q || search.city) && (
            <button
              onClick={() => { setQ(''); setCity(''); setSearch({ q: '', city: '', gender: search.gender }); }}
              className="flex items-center gap-1 text-body-sm transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              <X size={14} /> پاک کردن فیلترها
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-portrait bg-[var(--ui-gray-100)]" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-[var(--ui-gray-100)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--ui-gray-100)] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-display-md mb-4" style={{ color: 'var(--ui-gray-200)' }}>😕</p>
            <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>سالنی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {salons.map((salon: any) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

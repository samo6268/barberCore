'use client';
import { useState } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { useSearchSalons } from '@/lib/api-hooks';
import { SalonCard } from '@/components/salon/salon-card';
import { Navbar } from '@/components/layout/navbar';

const CITIES = ['تهران', 'اصفهان', 'مشهد', 'شیراز', 'تبریز', 'کرج', 'اهواز'];

export function MarketplacePage({ gender }: { gender: 'male' | 'female' }) {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState({ q: '', city: '', gender: gender === 'male' ? 'MALE' : 'FEMALE' });

  const { data, isLoading } = useSearchSalons(search as Record<string, string>);
  const salons = data?.data || [];

  const doSearch = () => setSearch({ q, city, gender: gender === 'male' ? 'MALE' : 'FEMALE' });

  return (
    <div data-gender={gender} className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Navbar gender={gender} />

      {/* Hero Banner */}
      <section className="py-10 px-6 text-center" style={{ background: 'var(--color-primary)' }}>
        <h1 className="text-3xl font-bold text-white mb-2">
          {gender === 'male' ? '🪒 آرایشگاه‌های مردانه' : '💅 سالن‌های زیبایی زنانه'}
        </h1>
        <p className="text-white/80 mb-6">بهترین‌ها را پیدا کن و آنلاین رزرو کن</p>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 rounded-xl" style={{ background: 'white' }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--color-muted)' }} />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="اسم سالن یا خدمت..."
              className="flex-1 py-3 outline-none text-sm bg-transparent"
              style={{ color: 'var(--color-text)' }}
            />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)}
            className="px-3 py-3 rounded-xl text-sm border-0 outline-none"
            style={{ background: 'white', color: 'var(--color-text)' }}>
            <option value="">همه شهرها</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={doSearch}
            className="px-6 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}>
            جستجو
          </button>
        </div>
      </section>

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            {isLoading ? 'در حال جستجو...' : `${data?.meta?.total || 0} سالن یافت شد`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl h-56 animate-pulse" style={{ background: 'var(--color-surface)' }} />
            ))}
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg" style={{ color: 'var(--color-muted)' }}>سالنی با این مشخصات پیدا نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {salons.map((salon: any) => <SalonCard key={salon.id} salon={salon} />)}
          </div>
        )}
      </main>
    </div>
  );
}

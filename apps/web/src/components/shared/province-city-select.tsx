'use client';

import { ChevronDown, MapPin } from 'lucide-react';
import { IRAN_CITIES_BY_PROVINCE, IRAN_PROVINCES } from '@/lib/iran-locations';

type ProvinceCitySelectProps = {
  province: string;
  city: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  includeAll?: boolean;
  allLabel?: string;
  allCityLabel?: string;
  className?: string;
  compact?: boolean;
  inline?: boolean;
};

export function ProvinceCitySelect({
  province,
  city,
  onProvinceChange,
  onCityChange,
  includeAll = false,
  allLabel = 'همه استان‌ها',
  allCityLabel = 'همه شهرها',
  className = '',
  compact = false,
  inline = false,
}: ProvinceCitySelectProps) {
  const cities = province ? IRAN_CITIES_BY_PROVINCE[province] ?? [] : [];

  const selectClass = compact
    ? 'h-11 w-full appearance-none rounded-lg border border-[#e3cfc1]/20 bg-[#2a1e1a] px-3 pl-8 text-[14px] font-semibold text-[#fff7ef] outline-none transition hover:border-[#d9a57f]/70 focus:border-[#d9a57f] focus:ring-2 focus:ring-[#d9a57f]/10'
    : 'w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 pl-9 text-sm text-[var(--color-text)] outline-none transition focus:border-[#d9a57f]';

  return (
    <div className={`${compact && !inline ? 'rounded-2xl border border-[#e3cfc1]/20 bg-[#362620] p-2.5' : ''} ${className}`}>
      {compact && !inline && (
        <div className="mb-2 flex items-center gap-2 px-1 text-[11px] text-[#cdb5a7]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4a3027] text-[#d9a57f]">
            <MapPin size={13} />
          </span>
          <span className="font-semibold">محدوده جست‌وجو</span>
          <span className="text-[#ad978d]">استان و شهر</span>
        </div>
      )}
      <div className={`grid gap-3 ${inline ? 'grid-cols-2' : 'sm:grid-cols-2'}`}>
      <label className="block">
        <span className={`mb-2 flex items-center gap-1.5 font-medium text-[#f1dfd0] ${inline ? 'text-[13px]' : compact ? 'text-[11px]' : 'text-xs'}`}>
          استان
        </span>
        <div className="relative">
          <select
            aria-label="استان"
            value={province}
            onChange={(event) => {
              onProvinceChange(event.target.value);
              onCityChange('');
            }}
            className={selectClass}
            style={inline ? { height: 48, borderColor: '#524238', background: '#2c241e', fontWeight: 400 } : undefined}
          >
            <option value="">{includeAll ? allLabel : 'انتخاب استان'}</option>
            {IRAN_PROVINCES.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#d9a57f]" />
        </div>
      </label>

      <label className="block">
        <span className={`mb-2 flex items-center gap-1.5 font-medium text-[#f1dfd0] ${inline ? 'text-[13px]' : compact ? 'text-[11px]' : 'text-xs'}`}>
          شهر
        </span>
        <div className="relative">
          <select
            aria-label="شهر"
            value={city === allCityLabel ? '' : city}
            onChange={(event) => onCityChange(event.target.value)}
            disabled={!province}
            className={`${selectClass} disabled:cursor-not-allowed disabled:text-[#b7a89b]`}
            style={inline ? { height: 48, borderColor: '#524238', background: '#2c241e', fontWeight: 400 } : undefined}
          >
            <option value="">
              {province ? (includeAll ? allCityLabel : 'انتخاب شهر') : inline ? 'ابتدا استان' : 'ابتدا استان را انتخاب کنید'}
            </option>
            {cities.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#d9a57f]" />
        </div>
      </label>
      </div>
    </div>
  );
}

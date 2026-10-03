'use client';

import { MapPin } from 'lucide-react';
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
}: ProvinceCitySelectProps) {
  const cities = province ? IRAN_CITIES_BY_PROVINCE[province] ?? [] : [];

  const selectClass = compact
    ? 'w-full rounded-xl border border-[#e8e1db] bg-white px-3 py-2.5 text-sm text-[#342d30] outline-none transition focus:border-[#8b5e50]'
    : 'w-full rounded-xl border border-[#dfd5cc] bg-white px-4 py-3 text-sm text-[#342d30] outline-none transition focus:border-[#8b5e50]';

  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      <label className="block">
        <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#746b6d]">
          <MapPin size={14} /> استان
        </span>
        <select
          value={province}
          onChange={(event) => {
            onProvinceChange(event.target.value);
            onCityChange('');
          }}
          className={selectClass}
        >
          <option value="">{includeAll ? allLabel : 'انتخاب استان'}</option>
          {IRAN_PROVINCES.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#746b6d]">
          شهر
        </span>
        <select
          value={city === allCityLabel ? '' : city}
          onChange={(event) => onCityChange(event.target.value)}
          disabled={!province}
          className={`${selectClass} disabled:cursor-not-allowed disabled:bg-[#f5f2ef] disabled:text-[#aaa1a1]`}
        >
          <option value="">
            {province ? (includeAll ? allCityLabel : 'انتخاب شهر') : 'ابتدا استان را انتخاب کنید'}
          </option>
          {cities.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

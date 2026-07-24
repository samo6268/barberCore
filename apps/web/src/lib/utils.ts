import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as jalaali from 'jalaali-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a Date/string as Jalali (Farsi) date */
export function toJalali(date: Date | string, format = 'YYYY/MM/DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(d);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const { jy, jm, jd } = jalaali.toJalaali(value('year'), value('month'), value('day'));
  const pad = (n: number) => String(n).padStart(2, '0');
  return format
    .replace('YYYY', String(jy))
    .replace('MM', pad(jm))
    .replace('DD', pad(jd));
}

/** Format price in Toman (IRR/10) with Persian numeral display */
export function formatPrice(amountInRials: number): string {
  const toman = Math.round(amountInRials / 10);
  return new Intl.NumberFormat('fa-IR').format(toman) + ' تومان';
}

/** Format time as HH:mm in Farsi */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tehran',
  });
}

export function iranDateInput(date: Date | string = new Date()): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

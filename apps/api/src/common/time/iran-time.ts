const IRAN_UTC_OFFSET_MINUTES = 210;

export function parseIranDateTime(date: string, time: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('INVALID_DATE_TIME');
  }

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const localAsUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));

  if (
    localAsUtc.getUTCFullYear() !== year ||
    localAsUtc.getUTCMonth() !== month - 1 ||
    localAsUtc.getUTCDate() !== day ||
    localAsUtc.getUTCHours() !== hour ||
    localAsUtc.getUTCMinutes() !== minute
  ) {
    throw new Error('INVALID_DATE_TIME');
  }

  return new Date(localAsUtc.getTime() - IRAN_UTC_OFFSET_MINUTES * 60_000);
}

export function getIranDayBounds(date: string): { start: Date; end: Date } {
  const start = parseIranDateTime(date, '00:00');
  const end = new Date(start.getTime() + 24 * 60 * 60_000);
  return { start, end };
}

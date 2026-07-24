import { getIranDayBounds, parseIranDateTime } from './iran-time';

describe('Iran time helpers', () => {
  it('converts Iran local time to UTC', () => {
    expect(parseIranDateTime('2030-01-10', '10:00')).toEqual(
      new Date('2030-01-10T06:30:00.000Z'),
    );
  });

  it('returns the UTC bounds of an Iran calendar day', () => {
    expect(getIranDayBounds('2030-01-10')).toEqual({
      start: new Date('2030-01-09T20:30:00.000Z'),
      end: new Date('2030-01-10T20:30:00.000Z'),
    });
  });

  it('rejects impossible date/time values', () => {
    expect(() => parseIranDateTime('2030-02-31', '10:00')).toThrow();
    expect(() => parseIranDateTime('2030-01-10', '25:00')).toThrow();
  });
});

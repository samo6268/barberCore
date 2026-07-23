import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  const prisma = {
    service: { findFirst: jest.fn() }, workingHour: { findFirst: jest.fn() },
    booking: { findMany: jest.fn() }, salonHoliday: { findFirst: jest.fn() },
  };
  const service = new AvailabilityService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2030-01-01T00:00:00.000Z'));
    prisma.service.findFirst.mockResolvedValue({ id: 'service-1', durationMinutes: 60 });
    prisma.workingHour.findFirst.mockResolvedValue({ openTime: '09:00', closeTime: '12:00', breakStart: null, breakEnd: null });
    prisma.booking.findMany.mockResolvedValue([]);
    prisma.salonHoliday.findFirst.mockResolvedValue(null);
  });
  afterEach(() => jest.useRealTimers());

  it('returns no slots for invalid dates or a service outside the salon', async () => {
    await expect(service.getAvailableSlots('salon-1', '2030-02-31', 'service-1')).resolves.toEqual([]);
    prisma.service.findFirst.mockResolvedValueOnce(null);
    await expect(service.getAvailableSlots('salon-1', '2030-01-10', 'service-1')).resolves.toEqual([]);
  });

  it('uses salon-level hours when no staff member is selected', async () => {
    await service.getAvailableSlots('salon-1', '2030-01-10', 'service-1');
    expect(prisma.workingHour.findFirst).toHaveBeenCalledWith({ where: expect.objectContaining({ salonId: 'salon-1', staffId: null }) });
  });

  it('removes every slot that overlaps a break', async () => {
    prisma.workingHour.findFirst.mockResolvedValueOnce({ openTime: '09:00', closeTime: '12:00', breakStart: '10:00', breakEnd: '10:30' });
    const slots = await service.getAvailableSlots('salon-1', '2030-01-10', 'service-1');
    expect(slots.map((slot) => slot.time)).toEqual(['09:00', '10:30', '11:00']);
  });

  it('marks overlapping bookings unavailable and respects holidays', async () => {
    prisma.booking.findMany.mockResolvedValueOnce([{ startsAt: new Date('2030-01-10T09:30:00.000Z'), endsAt: new Date('2030-01-10T10:30:00.000Z') }]);
    const slots = await service.getAvailableSlots('salon-1', '2030-01-10', 'service-1');
    expect(slots.find((slot) => slot.time === '09:00')?.available).toBe(false);
    expect(slots.find((slot) => slot.time === '10:30')?.available).toBe(true);
    prisma.salonHoliday.findFirst.mockResolvedValueOnce({ id: 'holiday-1' });
    await expect(service.getAvailableSlots('salon-1', '2030-01-10', 'service-1')).resolves.toEqual([]);
  });
});

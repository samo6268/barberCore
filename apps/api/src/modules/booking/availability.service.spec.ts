import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  const prisma = {
    service: { findMany: jest.fn() },
    staffProfile: { findMany: jest.fn() },
    workingHour: { findFirst: jest.fn() },
    booking: { findMany: jest.fn() },
    salonHoliday: { findFirst: jest.fn() },
    timeOff: { findMany: jest.fn() },
  };
  const service = new AvailabilityService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2030-01-01T00:00:00.000Z'));
    prisma.service.findMany.mockResolvedValue([{ id: 'service-1', durationMinutes: 60 }]);
    prisma.staffProfile.findMany.mockResolvedValue([]);
    prisma.workingHour.findFirst.mockResolvedValue({
      isOpen: true,
      openTime: '09:00',
      closeTime: '12:00',
      breakStart: null,
      breakEnd: null,
    });
    prisma.booking.findMany.mockResolvedValue([]);
    prisma.salonHoliday.findFirst.mockResolvedValue(null);
    prisma.timeOff.findMany.mockResolvedValue([]);
  });

  afterEach(() => jest.useRealTimers());

  it('returns no slots for invalid dates, duplicate services, or unknown services', async () => {
    await expect(
      service.getAvailableSlots('salon-1', '2030-02-31', ['service-1']),
    ).resolves.toEqual([]);
    await expect(
      service.getAvailableSlots('salon-1', '2030-01-10', ['service-1', 'service-1']),
    ).resolves.toEqual([]);
    prisma.service.findMany.mockResolvedValueOnce([]);
    await expect(service.getAvailableSlots('salon-1', '2030-01-10', ['unknown'])).resolves.toEqual(
      [],
    );
  });

  it('uses the combined duration of all selected services', async () => {
    prisma.service.findMany.mockResolvedValueOnce([
      { id: 'service-1', durationMinutes: 60 },
      { id: 'service-2', durationMinutes: 30 },
    ]);

    const slots = await service.getAvailableSlots('salon-1', '2030-01-10', [
      'service-1',
      'service-2',
    ]);

    expect(slots.map((slot) => slot.time)).toEqual(['09:00', '09:30', '10:00', '10:30']);
  });

  it('uses salon-level hours when the salon has no qualified staff', async () => {
    await service.getAvailableSlots('salon-1', '2030-01-10', ['service-1']);
    expect(prisma.workingHour.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({ salonId: 'salon-1', staffId: null }),
    });
  });

  it('rejects a selected staff member who does not offer every service', async () => {
    prisma.staffProfile.findMany.mockResolvedValueOnce([
      { id: 'staff-1', services: [{ serviceId: 'service-1' }] },
    ]);
    prisma.service.findMany.mockResolvedValueOnce([
      { id: 'service-1', durationMinutes: 30 },
      { id: 'service-2', durationMinutes: 30 },
    ]);

    await expect(
      service.getAvailableSlots('salon-1', '2030-01-10', ['service-1', 'service-2'], 'staff-1'),
    ).resolves.toEqual([]);
  });

  it('does not fall back to salon hours when a selected staff member is explicitly closed', async () => {
    prisma.staffProfile.findMany.mockResolvedValueOnce([
      { id: 'staff-1', services: [{ serviceId: 'service-1' }] },
    ]);
    prisma.workingHour.findFirst.mockResolvedValueOnce({
      isOpen: false,
      openTime: '09:00',
      closeTime: '12:00',
      breakStart: null,
      breakEnd: null,
    });

    await expect(
      service.getAvailableSlots('salon-1', '2030-01-10', ['service-1'], 'staff-1'),
    ).resolves.toEqual([]);
    expect(prisma.workingHour.findFirst).toHaveBeenCalledTimes(1);
  });

  it('removes every slot that overlaps a break', async () => {
    prisma.workingHour.findFirst.mockResolvedValueOnce({
      isOpen: true,
      openTime: '09:00',
      closeTime: '12:00',
      breakStart: '10:00',
      breakEnd: '10:30',
    });

    const slots = await service.getAvailableSlots('salon-1', '2030-01-10', ['service-1']);
    expect(slots.map((slot) => slot.time)).toEqual(['09:00', '10:30', '11:00']);
  });

  it('marks booking and time-off overlaps unavailable and respects holidays', async () => {
    prisma.staffProfile.findMany.mockResolvedValue([
      { id: 'staff-1', services: [{ serviceId: 'service-1' }] },
    ]);
    prisma.booking.findMany.mockResolvedValueOnce([
      {
        startsAt: new Date('2030-01-10T06:00:00.000Z'),
        endsAt: new Date('2030-01-10T07:00:00.000Z'),
      },
    ]);
    prisma.timeOff.findMany.mockResolvedValueOnce([
      {
        startsAt: new Date('2030-01-10T08:00:00.000Z'),
        endsAt: new Date('2030-01-10T08:30:00.000Z'),
      },
    ]);

    const slots = await service.getAvailableSlots('salon-1', '2030-01-10', ['service-1']);
    expect(slots.find((slot) => slot.time === '09:00')?.available).toBe(false);
    expect(slots.find((slot) => slot.time === '10:30')?.available).toBe(true);
    expect(slots.find((slot) => slot.time === '11:00')?.available).toBe(false);
    expect(slots.find((slot) => slot.time === '10:30')?.staffId).toBe('staff-1');

    prisma.salonHoliday.findFirst.mockResolvedValueOnce({ id: 'holiday-1' });
    await expect(
      service.getAvailableSlots('salon-1', '2030-01-10', ['service-1']),
    ).resolves.toEqual([]);
  });
});

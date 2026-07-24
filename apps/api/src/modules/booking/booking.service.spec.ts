import { BadRequestException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { BookingService, CreateBookingDto } from './booking.service';

describe('BookingService', () => {
  const prisma = {
    service: { findMany: jest.fn() },
    staffProfile: { findFirst: jest.fn() },
    salon: { findUnique: jest.fn() },
    booking: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const availability = { getAvailableSlots: jest.fn() };
  const service = new BookingService(prisma as never, availability as never);
  const dto: CreateBookingDto = {
    salonId: 'salon-1',
    serviceIds: ['service-1', 'service-2'],
    date: '2030-01-10',
    time: '10:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.service.findMany.mockResolvedValue([
      { id: 'service-1', durationMinutes: 30, price: 500_000, discountPrice: null },
      { id: 'service-2', durationMinutes: 45, price: 800_000, discountPrice: 700_000 },
    ]);
    availability.getAvailableSlots.mockResolvedValue([{ time: '10:00', available: true }]);
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'booking-1', ...data }),
    );
  });

  it('creates a booking with server-calculated duration and price', async () => {
    const booking = await service.create('customer-1', dto);
    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerId: 'customer-1',
          totalPrice: 1_200_000,
          endsAt: new Date('2030-01-10T07:45:00.000Z'),
          status: BookingStatus.CONFIRMED,
        }),
      }),
    );
    expect(booking.id).toBe('booking-1');
  });

  it('rejects duplicate or unknown services', async () => {
    await expect(
      service.create('customer-1', { ...dto, serviceIds: ['service-1', 'service-1'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    prisma.service.findMany.mockResolvedValueOnce([]);
    await expect(
      service.create('customer-1', { ...dto, serviceIds: ['unknown'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create('customer-1', {
        ...dto,
        serviceIds: undefined,
      } as unknown as CreateBookingDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects malformed or past booking times', async () => {
    await expect(
      service.create('customer-1', { ...dto, date: '2030-02-31' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create('customer-1', { ...dto, date: '2020-01-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a conflicting booking', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({ id: 'existing' });
    await expect(service.create('customer-1', dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('rejects a time that is no longer available', async () => {
    availability.getAvailableSlots.mockResolvedValueOnce([{ time: '10:00', available: false }]);
    await expect(service.create('customer-1', dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('assigns the qualified staff returned for an automatic slot', async () => {
    availability.getAvailableSlots.mockResolvedValueOnce([
      { time: '10:00', available: true, staffId: 'staff-1' },
    ]);
    prisma.staffProfile.findFirst.mockResolvedValueOnce({
      services: [{ serviceId: 'service-1' }, { serviceId: 'service-2' }],
    });

    await service.create('customer-1', dto);

    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ staffId: 'staff-1' }),
      }),
    );
  });

  it('allows the salon owner to complete a confirmed booking', async () => {
    prisma.booking.findUnique.mockResolvedValueOnce({
      id: 'booking-1',
      salonId: 'salon-1',
      status: BookingStatus.CONFIRMED,
    });
    prisma.salon.findUnique.mockResolvedValueOnce({ ownerId: 'owner-1' });
    prisma.booking.update.mockResolvedValueOnce({
      id: 'booking-1',
      status: BookingStatus.COMPLETED,
    });

    await service.updateStatus('booking-1', 'owner-1', BookingStatus.COMPLETED);

    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 'booking-1' },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: expect.any(Date),
      },
    });
  });

  it('rejects an invalid booking status transition', async () => {
    prisma.booking.findUnique.mockResolvedValueOnce({
      id: 'booking-1',
      salonId: 'salon-1',
      status: BookingStatus.COMPLETED,
    });
    prisma.salon.findUnique.mockResolvedValueOnce({ ownerId: 'owner-1' });

    await expect(
      service.updateStatus('booking-1', 'owner-1', BookingStatus.CONFIRMED),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });
});

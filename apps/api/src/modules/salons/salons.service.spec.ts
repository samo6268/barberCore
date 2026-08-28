import { ForbiddenException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { SalonsService } from './salons.service';

function createPrismaMock() {
  return {
    salon: { findUnique: jest.fn() },
    booking: { findMany: jest.fn() },
    staffProfile: { findMany: jest.fn() },
    review: { findMany: jest.fn() },
  };
}

describe('SalonsService overview', () => {
  it('مالک سالن یک نمای خلاصه‌شده از عملیات واقعی دریافت می‌کند', async () => {
    const prisma = createPrismaMock();
    prisma.salon.findUnique
      .mockResolvedValueOnce({ id: 'salon-1', ownerId: 'owner-1' })
      .mockResolvedValueOnce({
        id: 'salon-1',
        name: 'سالن نمونه',
        description: 'توضیحات',
        address: 'تهران',
        phone: '02100000000',
        coverImageUrl: '/cover.jpg',
        logoUrl: null,
        workingHours: [{ dayOfWeek: 'SATURDAY' }],
        _count: { services: 3, staffProfiles: 2, bookings: 10, reviews: 4 },
      });
    prisma.booking.findMany
      .mockResolvedValueOnce([
        { id: 'today-1', status: BookingStatus.COMPLETED, totalPrice: 2_000_000 },
        { id: 'today-2', status: BookingStatus.CONFIRMED, totalPrice: 1_000_000 },
      ])
      .mockResolvedValueOnce([{ totalPrice: 2_000_000 }, { totalPrice: 3_000_000 }])
      .mockResolvedValueOnce([]);
    prisma.staffProfile.findMany.mockResolvedValue([]);
    prisma.review.findMany.mockResolvedValue([]);
    const service = new SalonsService(prisma as any);

    const result = await service.overview('salon-1', 'owner-1', '2030-01-10');

    expect(result.today).toEqual(expect.objectContaining({ total: 2, revenue: 2_000_000 }));
    expect(result.today.statusCounts.CONFIRMED).toBe(1);
    expect(result.month).toEqual({ completed: 2, revenue: 5_000_000 });
    expect(result.setup.percent).toBe(100);
  });

  it('نمای مدیریتی سالن متعلق به کاربر دیگر را نمایش نمی‌دهد', async () => {
    const prisma = createPrismaMock();
    prisma.salon.findUnique.mockResolvedValue({ id: 'salon-1', ownerId: 'another-owner' });
    const service = new SalonsService(prisma as any);

    await expect(service.overview('salon-1', 'owner-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.booking.findMany).not.toHaveBeenCalled();
  });
});

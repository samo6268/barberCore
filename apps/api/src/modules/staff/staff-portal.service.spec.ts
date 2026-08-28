import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BookingStatus, StaffCompensationType } from '@prisma/client';
import { StaffPortalService } from './staff-portal.service';

const membership = {
  id: 'staff-1',
  userId: 'user-1',
  salonId: 'salon-1',
  displayName: 'سارا کریمی',
  bio: null,
  avatarUrl: null,
  status: 'ACTIVE',
  specialties: ['رنگ مو'],
  compensationType: StaffCompensationType.PERCENTAGE,
  commissionRate: 30,
  fixedServiceAmount: 0,
  monthlySalary: 0,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: 'user-1', firstName: 'سارا', lastName: 'کریمی', phone: '09120000000', email: null },
  salon: { id: 'salon-1', name: 'سالن نمونه', logoUrl: null, address: null, genderType: 'FEMALE' },
  services: [
    {
      staffId: 'staff-1',
      serviceId: 'service-1',
      commissionRate: null,
      fixedAmount: null,
      service: { id: 'service-1', name: 'رنگ مو', durationMinutes: 60, price: 1_000_000 },
    },
  ],
};

function createPrismaMock() {
  const tx = {
    workingHour: { deleteMany: jest.fn(), createMany: jest.fn() },
  };
  return {
    staffProfile: {
      findFirst: jest.fn().mockResolvedValue(membership),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    booking: { findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    notification: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    staffSettlement: { findFirst: jest.fn(), findMany: jest.fn() },
    timeOff: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    workingHour: { findMany: jest.fn() },
    $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    tx,
  };
}

describe('StaffPortalService', () => {
  it('فقط عضویت‌های فعال کاربر جاری را درخواست می‌کند', async () => {
    const prisma = createPrismaMock();
    prisma.staffProfile.findMany.mockResolvedValue([]);
    const service = new StaffPortalService(prisma as any);

    await service.memberships('user-1');

    expect(prisma.staffProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1', status: { not: 'INACTIVE' } }),
      }),
    );
  });

  it('دسترسی کاربری را که عضو سالن نیست رد می‌کند', async () => {
    const prisma = createPrismaMock();
    prisma.staffProfile.findFirst.mockResolvedValue(null);
    const service = new StaffPortalService(prisma as any);

    await expect(service.profile('outsider', 'salon-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('اجازه تغییر نوبت همکار دیگر را نمی‌دهد', async () => {
    const prisma = createPrismaMock();
    prisma.booking.findFirst.mockResolvedValue(null);
    const service = new StaffPortalService(prisma as any);

    await expect(
      service.updateBookingStatus('user-1', 'coworker-booking', {
        salonId: 'salon-1',
        status: BookingStatus.IN_PROGRESS,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('عبور مستقیم از تأییدشده به تکمیل‌شده را برای کارمند رد می‌کند', async () => {
    const prisma = createPrismaMock();
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: BookingStatus.CONFIRMED,
      customerId: 'customer-1',
      salonId: 'salon-1',
      startsAt: new Date(Date.now() - 60_000),
      salon: { name: 'سالن نمونه' },
    });
    const service = new StaffPortalService(prisma as any);

    await expect(
      service.updateBookingStatus('user-1', 'booking-1', {
        salonId: 'salon-1',
        status: BookingStatus.COMPLETED,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('ثبت عدم مراجعه پیش از زمان نوبت را رد می‌کند', async () => {
    const prisma = createPrismaMock();
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: BookingStatus.CONFIRMED,
      customerId: 'customer-1',
      salonId: 'salon-1',
      startsAt: new Date(Date.now() + 60_000),
      salon: { name: 'سالن نمونه' },
    });
    const service = new StaffPortalService(prisma as any);

    await expect(
      service.updateBookingStatus('user-1', 'booking-1', {
        salonId: 'salon-1',
        status: BookingStatus.NO_SHOW,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('تغییر وضعیت معتبر را همراه اعلان مشتری ثبت می‌کند', async () => {
    const prisma = createPrismaMock();
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: BookingStatus.CONFIRMED,
      customerId: 'customer-1',
      salonId: 'salon-1',
      startsAt: new Date(Date.now() - 60_000),
      salon: { name: 'سالن نمونه' },
    });
    prisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      status: BookingStatus.IN_PROGRESS,
    });
    const service = new StaffPortalService(prisma as any);

    await service.updateBookingStatus('user-1', 'booking-1', {
      salonId: 'salon-1',
      status: BookingStatus.IN_PROGRESS,
    });

    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: BookingStatus.IN_PROGRESS }),
      }),
    );
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'customer-1', bookingId: 'booking-1' }),
      }),
    );
  });

  it('اختلال اعلان، تغییر وضعیت اصلی نوبت را برنمی‌گرداند', async () => {
    const prisma = createPrismaMock();
    prisma.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      status: BookingStatus.CONFIRMED,
      customerId: 'customer-1',
      salonId: 'salon-1',
      startsAt: new Date(Date.now() - 60_000),
      salon: { name: 'سالن نمونه' },
    });
    prisma.booking.update.mockResolvedValue({ id: 'booking-1', status: BookingStatus.IN_PROGRESS });
    prisma.notification.create.mockRejectedValue(new Error('temporary notification outage'));
    const service = new StaffPortalService(prisma as any);

    await expect(
      service.updateBookingStatus('user-1', 'booking-1', {
        salonId: 'salon-1',
        status: BookingStatus.IN_PROGRESS,
      }),
    ).resolves.toEqual(expect.objectContaining({ status: BookingStatus.IN_PROGRESS }));
  });

  it('مرخصی هم‌زمان با نوبت فعال را ثبت نمی‌کند', async () => {
    const prisma = createPrismaMock();
    prisma.timeOff.findFirst.mockResolvedValue(null);
    prisma.booking.findFirst.mockResolvedValue({ id: 'booking-1' });
    const service = new StaffPortalService(prisma as any);

    await expect(
      service.createTimeOff('user-1', {
        salonId: 'salon-1',
        startsAt: new Date(Date.now() + 86_400_000).toISOString(),
        endsAt: new Date(Date.now() + 90_000_000).toISOString(),
        reason: 'مرخصی',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('تسویه‌ها را فقط با شناسه پروفایل شخصی واکشی می‌کند', async () => {
    const prisma = createPrismaMock();
    prisma.staffSettlement.findMany.mockResolvedValue([]);
    const service = new StaffPortalService(prisma as any);

    await service.settlements('user-1', 'salon-1');

    expect(prisma.staffSettlement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { salonId: 'salon-1', staffId: 'staff-1' } }),
    );
  });
});

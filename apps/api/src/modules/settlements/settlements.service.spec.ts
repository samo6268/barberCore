import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { StaffCompensationType } from '@prisma/client';
import {
  calculateServiceCompensation,
  SettlementsService,
} from './settlements.service';

describe('SettlementsService', () => {
  const prisma = {
    salon: { findUnique: jest.fn() },
    staffProfile: { findFirst: jest.fn() },
    bookingItem: { findMany: jest.fn() },
    staffSettlement: { findFirst: jest.fn() },
  } as any;
  const service = new SettlementsService(prisma);
  const owner = { sub: 'owner-1', role: 'SALON_OWNER' };

  beforeEach(() => jest.clearAllMocks());

  it('uses the service-specific percentage when calculating commission', () => {
    expect(
      calculateServiceCompensation(
        1_000_000,
        {
          compensationType: StaffCompensationType.PERCENTAGE,
          commissionRate: 25,
          fixedServiceAmount: 0,
          monthlySalary: 0,
        },
        { commissionRate: 40, fixedAmount: null },
      ),
    ).toEqual({
      commissionAmount: 400_000,
      appliedRate: 40,
      appliedFixedAmount: null,
    });
  });

  it('calculates a fixed amount for each completed service', () => {
    expect(
      calculateServiceCompensation(1_000_000, {
        compensationType: StaffCompensationType.FIXED_PER_SERVICE,
        commissionRate: 0,
        fixedServiceAmount: 180_000,
        monthlySalary: 0,
      }),
    ).toEqual({
      commissionAmount: 180_000,
      appliedRate: null,
      appliedFixedAmount: 180_000,
    });
  });

  it('builds a traceable preview from only unsettled completed services', async () => {
    prisma.salon.findUnique.mockResolvedValue({ ownerId: owner.sub });
    prisma.staffProfile.findFirst.mockResolvedValue({
      id: 'staff-1',
      displayName: 'سارا کریمی',
      compensationType: StaffCompensationType.SALARY_PLUS_PERCENTAGE,
      commissionRate: 25,
      fixedServiceAmount: 0,
      monthlySalary: 30_000_000,
      services: [
        { serviceId: 'service-1', commissionRate: 30, fixedAmount: null },
        { serviceId: 'service-2', commissionRate: null, fixedAmount: null },
      ],
    });
    prisma.bookingItem.findMany.mockResolvedValue([
      {
        id: 'item-1',
        price: 800_000,
        serviceId: 'service-1',
        booking: { id: 'booking-1', completedAt: new Date('2026-07-05T08:00:00Z') },
        service: { id: 'service-1', name: 'کوتاهی مو' },
      },
      {
        id: 'item-2',
        price: 2_200_000,
        serviceId: 'service-2',
        booking: { id: 'booking-2', completedAt: new Date('2026-07-07T08:00:00Z') },
        service: { id: 'service-2', name: 'رنگ مو' },
      },
    ]);

    const result = await service.preview('salon-1', owner, {
      staffId: 'staff-1',
      from: '2026-07-01',
      to: '2026-07-30',
    });

    expect(result.items).toHaveLength(2);
    expect(result.totals).toEqual({
      grossRevenue: 3_000_000,
      serviceCommission: 790_000,
      baseSalaryAmount: 30_000_000,
      netPayable: 30_790_000,
    });
    expect(prisma.bookingItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ settlementItem: null }),
      }),
    );
  });

  it('rejects a user who does not own the salon', async () => {
    prisma.salon.findUnique.mockResolvedValue({ ownerId: 'another-owner' });
    await expect(
      service.preview('salon-1', owner, {
        staffId: 'staff-1',
        from: '2026-07-01',
        to: '2026-07-30',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('requires a payment reference before marking a settlement paid', async () => {
    prisma.salon.findUnique.mockResolvedValue({ ownerId: owner.sub });
    prisma.staffSettlement.findFirst.mockResolvedValue({
      id: 'settlement-1',
      status: 'APPROVED',
    });
    await expect(
      service.updateStatus('salon-1', 'settlement-1', owner, {
        status: 'PAID',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents overlapping active settlement periods for a staff member', async () => {
    const preview = jest.spyOn(service, 'preview').mockResolvedValueOnce({
      staff: {
        id: 'staff-1',
        displayName: 'سارا کریمی',
        compensationType: StaffCompensationType.SALARY,
        commissionRate: 0,
        fixedServiceAmount: 0,
        monthlySalary: 30_000_000,
      },
      period: { from: '2026-07-01', to: '2026-07-30', days: 30 },
      items: [],
      totals: {
        grossRevenue: 0,
        serviceCommission: 0,
        baseSalaryAmount: 30_000_000,
        netPayable: 30_000_000,
      },
    });
    prisma.staffSettlement.findFirst.mockResolvedValue({ id: 'existing-settlement' });

    await expect(
      service.create('salon-1', owner, {
        staffId: 'staff-1',
        from: '2026-07-01',
        to: '2026-07-30',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(preview).toHaveBeenCalled();
  });
});

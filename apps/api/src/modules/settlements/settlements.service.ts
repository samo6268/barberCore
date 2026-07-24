import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  SettlementStatus,
  StaffCompensationType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { getIranDayBounds } from '../../common/time/iran-time';
import {
  CreateSettlementDto,
  PreviewSettlementDto,
  SettlementListDto,
  SettlementPeriodDto,
  UpdateSettlementStatusDto,
} from './settlement.dto';

type CompensationRule = {
  compensationType: StaffCompensationType;
  commissionRate: number;
  fixedServiceAmount: number;
  monthlySalary: number;
};

export function calculateServiceCompensation(
  grossAmount: number,
  rule: CompensationRule,
  serviceRule?: { commissionRate: number | null; fixedAmount: number | null },
) {
  const rate = serviceRule?.commissionRate ?? rule.commissionRate;
  const fixedAmount = serviceRule?.fixedAmount ?? rule.fixedServiceAmount;
  switch (rule.compensationType) {
    case StaffCompensationType.PERCENTAGE:
    case StaffCompensationType.SALARY_PLUS_PERCENTAGE:
      return {
        commissionAmount: Math.round(grossAmount * (rate / 100)),
        appliedRate: rate,
        appliedFixedAmount: null,
      };
    case StaffCompensationType.FIXED_PER_SERVICE:
      return {
        commissionAmount: Math.round(fixedAmount),
        appliedRate: null,
        appliedFixedAmount: fixedAmount,
      };
    case StaffCompensationType.SALARY:
      return { commissionAmount: 0, appliedRate: null, appliedFixedAmount: null };
  }
}

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async preview(salonId: string, user: JwtPayload, dto: PreviewSettlementDto) {
    await this.assertAccess(salonId, user);
    const { start, end, days } = this.parsePeriod(dto.from, dto.to);
    const staff = await this.prisma.staffProfile.findFirst({
      where: { id: dto.staffId, salonId, status: { not: 'INACTIVE' } },
      include: { services: true },
    });
    if (!staff) throw new NotFoundException('متخصص یافت نشد');

    const bookingItems = await this.prisma.bookingItem.findMany({
      where: {
        booking: {
          salonId,
          staffId: staff.id,
          status: 'COMPLETED',
          completedAt: { gte: start, lt: end },
        },
        settlementItem: null,
      },
      include: {
        booking: { select: { id: true, completedAt: true } },
        service: { select: { id: true, name: true } },
      },
      orderBy: { booking: { completedAt: 'asc' } },
    });

    const serviceRules = new Map(staff.services.map((rule) => [rule.serviceId, rule]));
    const items = bookingItems.map((item) => {
      const calculation = calculateServiceCompensation(
        item.price,
        staff,
        serviceRules.get(item.serviceId),
      );
      return {
        bookingId: item.booking.id,
        bookingItemId: item.id,
        serviceId: item.service.id,
        serviceName: item.service.name,
        completedAt: item.booking.completedAt!,
        grossAmount: item.price,
        compensationType: staff.compensationType,
        ...calculation,
      };
    });

    const grossRevenue = items.reduce((sum, item) => sum + item.grossAmount, 0);
    const serviceCommission = items.reduce((sum, item) => sum + item.commissionAmount, 0);
    const hasSalary =
      staff.compensationType === StaffCompensationType.SALARY ||
      staff.compensationType === StaffCompensationType.SALARY_PLUS_PERCENTAGE;
    const baseSalaryAmount = hasSalary
      ? Math.round(staff.monthlySalary * Math.min(days / 30, 1))
      : 0;

    return {
      staff: {
        id: staff.id,
        displayName: staff.displayName,
        compensationType: staff.compensationType,
        commissionRate: staff.commissionRate,
        fixedServiceAmount: staff.fixedServiceAmount,
        monthlySalary: staff.monthlySalary,
      },
      period: { from: dto.from, to: dto.to, days },
      items,
      totals: {
        grossRevenue,
        serviceCommission,
        baseSalaryAmount,
        netPayable: serviceCommission + baseSalaryAmount,
      },
    };
  }

  async create(salonId: string, user: JwtPayload, dto: CreateSettlementDto) {
    const preview = await this.preview(salonId, user, dto);
    if (!preview.items.length && !preview.totals.baseSalaryAmount) {
      throw new BadRequestException('در این دوره آیتم قابل تسویه‌ای وجود ندارد');
    }

    const { start, end } = this.parsePeriod(dto.from, dto.to);
    const overlappingSettlement = await this.prisma.staffSettlement.findFirst({
      where: {
        salonId,
        staffId: dto.staffId,
        status: { not: SettlementStatus.CANCELLED },
        periodStart: { lt: end },
        periodEnd: { gte: start },
      },
      select: { id: true },
    });
    if (overlappingSettlement) {
      throw new ConflictException(
        'برای این متخصص در بخشی از بازه انتخاب‌شده صورتحساب فعال وجود دارد',
      );
    }

    const bonusAmount = dto.bonusAmount ?? 0;
    const deductionAmount = dto.deductionAmount ?? 0;
    const netPayable =
      preview.totals.serviceCommission +
      preview.totals.baseSalaryAmount +
      bonusAmount -
      deductionAmount;
    if (netPayable < 0) throw new BadRequestException('مبلغ خالص تسویه نمی‌تواند منفی باشد');

    try {
      return await this.prisma.staffSettlement.create({
        data: {
          salonId,
          staffId: dto.staffId,
          periodStart: start,
          periodEnd: new Date(end.getTime() - 1),
          grossRevenue: preview.totals.grossRevenue,
          serviceCommission: preview.totals.serviceCommission,
          baseSalaryAmount: preview.totals.baseSalaryAmount,
          bonusAmount,
          deductionAmount,
          netPayable,
          notes: dto.notes,
          createdBy: user.sub,
          items: {
            create: preview.items.map((item) => ({
              bookingId: item.bookingId,
              bookingItemId: item.bookingItemId,
              serviceId: item.serviceId,
              serviceName: item.serviceName,
              completedAt: item.completedAt,
              grossAmount: item.grossAmount,
              commissionAmount: item.commissionAmount,
              compensationType: item.compensationType,
              appliedRate: item.appliedRate,
              appliedFixedAmount: item.appliedFixedAmount,
            })),
          },
          adjustments: {
            create: [
              ...(bonusAmount
                ? [{
                    type: 'BONUS' as const,
                    amount: bonusAmount,
                    description: dto.bonusDescription || 'پاداش دوره',
                  }]
                : []),
              ...(deductionAmount
                ? [{
                    type: 'DEDUCTION' as const,
                    amount: deductionAmount,
                    description: dto.deductionDescription || 'کسورات دوره',
                  }]
                : []),
            ],
          },
          events: {
            create: {
              toStatus: SettlementStatus.DRAFT,
              actorId: user.sub,
              note: 'ایجاد صورتحساب تسویه',
            },
          },
        },
        include: this.detailsInclude,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('یک یا چند خدمت قبلاً در صورتحساب دیگری تسویه شده‌اند');
      }
      throw error;
    }
  }

  async list(salonId: string, user: JwtPayload, query: SettlementListDto) {
    await this.assertAccess(salonId, user);
    return this.prisma.staffSettlement.findMany({
      where: {
        salonId,
        staffId: query.staffId,
        status: query.status,
      },
      include: {
        staff: { select: { id: true, displayName: true, avatarUrl: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(salonId: string, settlementId: string, user: JwtPayload) {
    await this.assertAccess(salonId, user);
    const settlement = await this.prisma.staffSettlement.findFirst({
      where: { id: settlementId, salonId },
      include: this.detailsInclude,
    });
    if (!settlement) throw new NotFoundException('صورتحساب تسویه یافت نشد');
    return settlement;
  }

  async updateStatus(
    salonId: string,
    settlementId: string,
    user: JwtPayload,
    dto: UpdateSettlementStatusDto,
  ) {
    await this.assertAccess(salonId, user);
    const settlement = await this.prisma.staffSettlement.findFirst({
      where: { id: settlementId, salonId },
    });
    if (!settlement) throw new NotFoundException('صورتحساب تسویه یافت نشد');

    const allowed: Partial<Record<SettlementStatus, SettlementStatus[]>> = {
      DRAFT: [SettlementStatus.APPROVED, SettlementStatus.CANCELLED],
      APPROVED: [SettlementStatus.PAID, SettlementStatus.CANCELLED],
    };
    if (!allowed[settlement.status]?.includes(dto.status)) {
      throw new BadRequestException('تغییر وضعیت تسویه مجاز نیست');
    }
    if (dto.status === SettlementStatus.PAID && !dto.paymentReference?.trim()) {
      throw new BadRequestException('شماره پیگیری پرداخت الزامی است');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.status === SettlementStatus.CANCELLED) {
        await tx.staffSettlementItem.deleteMany({ where: { settlementId } });
      }
      await tx.settlementEvent.create({
        data: {
          settlementId,
          fromStatus: settlement.status,
          toStatus: dto.status,
          actorId: user.sub,
          note: dto.note,
        },
      });
      return tx.staffSettlement.update({
        where: { id: settlementId },
        data: {
          status: dto.status,
          paymentMethod: dto.paymentMethod,
          paymentReference: dto.paymentReference,
          ...(dto.status === SettlementStatus.APPROVED ? { approvedAt: new Date() } : {}),
          ...(dto.status === SettlementStatus.PAID ? { paidAt: new Date() } : {}),
          ...(dto.status === SettlementStatus.CANCELLED ? { cancelledAt: new Date() } : {}),
        },
        include: this.detailsInclude,
      });
    });
  }

  async financialReport(salonId: string, user: JwtPayload, query: SettlementPeriodDto) {
    await this.assertAccess(salonId, user);
    const { start, end, days } = this.parsePeriod(query.from, query.to);
    const [staff, items, bookingStatuses, settlementStatuses, paidSettlements] =
      await Promise.all([
        this.prisma.staffProfile.findMany({
          where: { salonId, status: { not: 'INACTIVE' } },
          include: { services: true },
          orderBy: { displayName: 'asc' },
        }),
        this.prisma.bookingItem.findMany({
          where: {
            booking: {
              salonId,
              status: 'COMPLETED',
              completedAt: { gte: start, lt: end },
              staffId: { not: null },
            },
          },
          include: {
            booking: { select: { id: true, staffId: true, completedAt: true } },
            service: { select: { id: true, name: true } },
          },
        }),
        this.prisma.booking.groupBy({
          by: ['status'],
          where: { salonId, startsAt: { gte: start, lt: end } },
          _count: { _all: true },
        }),
        this.prisma.staffSettlement.groupBy({
          by: ['status'],
          where: { salonId, periodStart: { lt: end }, periodEnd: { gte: start } },
          _count: { _all: true },
          _sum: { netPayable: true },
        }),
        this.prisma.staffSettlement.aggregate({
          where: {
            salonId,
            status: 'PAID',
            paidAt: { gte: start, lt: end },
          },
          _sum: { netPayable: true },
        }),
      ]);

    const staffById = new Map(staff.map((profile) => [profile.id, profile]));
    const staffRows = new Map<string, {
      staffId: string;
      displayName: string;
      completedBookings: Set<string>;
      serviceCount: number;
      grossRevenue: number;
      serviceCommission: number;
      baseSalaryAmount: number;
    }>();
    const serviceRows = new Map<string, {
      serviceId: string;
      serviceName: string;
      count: number;
      grossRevenue: number;
    }>();

    for (const profile of staff) {
      const hasSalary =
        profile.compensationType === StaffCompensationType.SALARY ||
        profile.compensationType === StaffCompensationType.SALARY_PLUS_PERCENTAGE;
      staffRows.set(profile.id, {
        staffId: profile.id,
        displayName: profile.displayName,
        completedBookings: new Set(),
        serviceCount: 0,
        grossRevenue: 0,
        serviceCommission: 0,
        baseSalaryAmount: hasSalary
          ? Math.round(profile.monthlySalary * Math.min(days / 30, 1))
          : 0,
      });
    }

    for (const item of items) {
      const staffId = item.booking.staffId!;
      const profile = staffById.get(staffId);
      const row = staffRows.get(staffId);
      if (!profile || !row) continue;
      const serviceRule = profile.services.find((rule) => rule.serviceId === item.serviceId);
      const calculation = calculateServiceCompensation(item.price, profile, serviceRule);
      row.completedBookings.add(item.booking.id);
      row.serviceCount += 1;
      row.grossRevenue += item.price;
      row.serviceCommission += calculation.commissionAmount;

      const serviceRow = serviceRows.get(item.serviceId) ?? {
        serviceId: item.service.id,
        serviceName: item.service.name,
        count: 0,
        grossRevenue: 0,
      };
      serviceRow.count += 1;
      serviceRow.grossRevenue += item.price;
      serviceRows.set(item.serviceId, serviceRow);
    }

    const staffPerformance = [...staffRows.values()].map((row) => ({
      ...row,
      completedBookings: row.completedBookings.size,
      staffPayable: row.serviceCommission + row.baseSalaryAmount,
      salonShare: row.grossRevenue - row.serviceCommission,
    }));
    const grossRevenue = staffPerformance.reduce((sum, row) => sum + row.grossRevenue, 0);
    const estimatedStaffPayable = staffPerformance.reduce(
      (sum, row) => sum + row.staffPayable,
      0,
    );

    return {
      period: { from: query.from, to: query.to },
      summary: {
        grossRevenue,
        completedBookings: new Set(items.map((item) => item.booking.id)).size,
        estimatedStaffPayable,
        estimatedSalonShare: grossRevenue - estimatedStaffPayable,
        paidSettlements: paidSettlements._sum.netPayable ?? 0,
      },
      staffPerformance,
      servicePerformance: [...serviceRows.values()].sort(
        (a, b) => b.grossRevenue - a.grossRevenue,
      ),
      bookingStatuses: bookingStatuses.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      settlementStatuses: settlementStatuses.map((row) => ({
        status: row.status,
        count: row._count._all,
        amount: row._sum.netPayable ?? 0,
      })),
    };
  }

  private parsePeriod(from: string, to: string) {
    try {
      const start = getIranDayBounds(from).start;
      const end = getIranDayBounds(to).end;
      if (start >= end) throw new Error('invalid range');
      const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
      if (days > 366) throw new BadRequestException('بازه گزارش نمی‌تواند بیشتر از یک سال باشد');
      return { start, end, days };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('بازه زمانی معتبر نیست');
    }
  }

  private async assertAccess(salonId: string, user: JwtPayload) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { ownerId: true },
    });
    if (!salon) throw new NotFoundException('سالن یافت نشد');
    if (salon.ownerId !== user.sub && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('دسترسی غیرمجاز');
    }
  }

  private readonly detailsInclude = {
    staff: { select: { id: true, displayName: true, avatarUrl: true } },
    items: { orderBy: { completedAt: 'asc' as const } },
    adjustments: { orderBy: { createdAt: 'asc' as const } },
    events: { orderBy: { createdAt: 'asc' as const } },
  };
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, StaffCompensationType } from '@prisma/client';
import { getIranDayBounds } from '../../common/time/iran-time';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStaffTimeOffDto,
  StaffBookingQueryDto,
  StaffBookingStatusDto,
  UpdateStaffProfileDto,
  UpdateStaffScheduleDto,
} from './staff-portal.dto';

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
];

const STAFF_STATUS_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED],
  [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.NO_SHOW],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
};

@Injectable()
export class StaffPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async memberships(userId: string) {
    return this.prisma.staffProfile.findMany({
      where: { userId, status: { not: 'INACTIVE' }, salon: { deletedAt: null } },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        status: true,
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            address: true,
            genderType: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async dashboard(userId: string, salonId: string, requestedDate?: string) {
    const staff = await this.requireMembership(userId, salonId);
    const date = requestedDate ?? this.todayInIran();
    const { start, end } = this.parseDay(date);

    const [bookings, unreadNotifications, latestSettlement, nextTimeOff] = await Promise.all([
      this.prisma.booking.findMany({
        where: { staffId: staff.id, salonId, startsAt: { gte: start, lt: end } },
        include: this.bookingInclude,
        orderBy: { startsAt: 'asc' },
      }),
      this.prisma.notification.count({
        where: { userId, salonId, readAt: null, channel: 'IN_APP' },
      }),
      this.prisma.staffSettlement.findFirst({
        where: { staffId: staff.id, salonId, status: { not: 'CANCELLED' } },
        select: {
          id: true,
          periodStart: true,
          periodEnd: true,
          status: true,
          netPayable: true,
          paidAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.timeOff.findFirst({
        where: { staffId: staff.id, endsAt: { gt: new Date() } },
        orderBy: { startsAt: 'asc' },
      }),
    ]);

    const completed = bookings.filter((booking) => booking.status === BookingStatus.COMPLETED);
    const estimatedCommission = completed.reduce((sum, booking) => {
      return (
        sum +
        booking.items.reduce((itemSum, item) => {
          const serviceRule = staff.services.find((rule) => rule.serviceId === item.serviceId);
          return itemSum + this.calculateCommission(item.price, staff, serviceRule);
        }, 0)
      );
    }, 0);
    const minutesBooked = bookings
      .filter(
        (booking) =>
          booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.NO_SHOW,
      )
      .reduce(
        (sum, booking) =>
          sum + Math.max(0, (booking.endsAt.getTime() - booking.startsAt.getTime()) / 60_000),
        0,
      );

    const current = bookings.find((booking) => booking.status === BookingStatus.IN_PROGRESS);
    const next = bookings.find(
      (booking) =>
        (booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) &&
        booking.endsAt > new Date(),
    );

    return {
      date,
      staff: this.serializeStaff(staff),
      summary: {
        total: bookings.length,
        pending: bookings.filter((booking) => booking.status === BookingStatus.PENDING).length,
        confirmed: bookings.filter((booking) => booking.status === BookingStatus.CONFIRMED).length,
        inProgress: bookings.filter((booking) => booking.status === BookingStatus.IN_PROGRESS)
          .length,
        completed: completed.length,
        noShow: bookings.filter((booking) => booking.status === BookingStatus.NO_SHOW).length,
        minutesBooked: Math.round(minutesBooked),
        estimatedCommission,
        unreadNotifications,
      },
      currentBookingId: current?.id ?? null,
      nextBookingId: next?.id ?? null,
      bookings,
      latestSettlement,
      nextTimeOff,
    };
  }

  async bookings(userId: string, query: StaffBookingQueryDto) {
    const staff = await this.requireMembership(userId, query.salonId);
    const { start, end } = this.parseRange(query.from, query.to, 62);
    return this.prisma.booking.findMany({
      where: {
        staffId: staff.id,
        salonId: query.salonId,
        startsAt: { gte: start, lt: end },
        status: query.status,
      },
      include: this.bookingInclude,
      orderBy: { startsAt: 'asc' },
    });
  }

  async updateBookingStatus(userId: string, bookingId: string, dto: StaffBookingStatusDto) {
    const staff = await this.requireMembership(userId, dto.salonId);
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, salonId: dto.salonId, staffId: staff.id },
      include: { salon: { select: { name: true } } },
    });
    if (!booking) throw new NotFoundException('رزرو در برنامه کاری شما یافت نشد');
    if (booking.status === dto.status) return booking;
    if (!STAFF_STATUS_TRANSITIONS[booking.status]?.includes(dto.status)) {
      throw new BadRequestException('این تغییر وضعیت در گردش کار کارمند مجاز نیست');
    }
    if (dto.status === BookingStatus.NO_SHOW && booking.startsAt > new Date()) {
      throw new BadRequestException('عدم مراجعه فقط پس از رسیدن زمان نوبت قابل ثبت است');
    }

    const labels: Partial<Record<BookingStatus, string>> = {
      [BookingStatus.CONFIRMED]: 'نوبت شما تأیید شد',
      [BookingStatus.IN_PROGRESS]: 'ارائه خدمت آغاز شد',
      [BookingStatus.COMPLETED]: 'خدمت شما تکمیل شد',
      [BookingStatus.NO_SHOW]: 'عدم مراجعه ثبت شد',
    };

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: dto.status,
          ...(dto.status === BookingStatus.CONFIRMED ? { confirmedAt: new Date() } : {}),
          ...(dto.status === BookingStatus.COMPLETED ? { completedAt: new Date() } : {}),
        },
        include: this.bookingInclude,
      });
      await tx.notification.create({
        data: {
          userId: booking.customerId,
          salonId: booking.salonId,
          bookingId: booking.id,
          channel: 'IN_APP',
          status: 'SENT',
          title: labels[dto.status],
          body: `${labels[dto.status]} — ${booking.salon.name}`,
          sentAt: new Date(),
          metadata: { bookingStatus: dto.status, actor: 'staff' },
        },
      });
      return updated;
    });
  }

  async schedule(userId: string, salonId: string) {
    const staff = await this.requireMembership(userId, salonId);
    const [ownHours, salonHours, timeOff] = await Promise.all([
      this.prisma.workingHour.findMany({
        where: { salonId, staffId: staff.id },
        orderBy: { dayOfWeek: 'asc' },
      }),
      this.prisma.workingHour.findMany({
        where: { salonId, staffId: null },
        orderBy: { dayOfWeek: 'asc' },
      }),
      this.prisma.timeOff.findMany({
        where: { staffId: staff.id, endsAt: { gt: new Date() } },
        orderBy: { startsAt: 'asc' },
      }),
    ]);
    return {
      hours: ownHours.length ? ownHours : salonHours.map((hour) => ({ ...hour, inherited: true })),
      usesSalonDefaults: ownHours.length === 0,
      timeOff,
    };
  }

  async updateSchedule(userId: string, dto: UpdateStaffScheduleDto) {
    const staff = await this.requireMembership(userId, dto.salonId);
    if (!dto.days.length) throw new BadRequestException('حداقل یک روز کاری باید ارسال شود');
    for (const day of dto.days) this.validateWorkingDay(day);

    await this.prisma.$transaction(async (tx) => {
      for (const day of dto.days) {
        await tx.workingHour.upsert({
          where: {
            salonId_staffId_dayOfWeek: {
              salonId: dto.salonId,
              staffId: staff.id,
              dayOfWeek: day.dayOfWeek,
            },
          },
          update: {
            isOpen: day.isOpen,
            openTime: day.openTime,
            closeTime: day.closeTime,
            breakStart: day.isOpen ? day.breakStart || null : null,
            breakEnd: day.isOpen ? day.breakEnd || null : null,
          },
          create: {
            salonId: dto.salonId,
            staffId: staff.id,
            dayOfWeek: day.dayOfWeek,
            isOpen: day.isOpen,
            openTime: day.openTime,
            closeTime: day.closeTime,
            breakStart: day.isOpen ? day.breakStart || null : null,
            breakEnd: day.isOpen ? day.breakEnd || null : null,
          },
        });
      }
    });
    return this.schedule(userId, dto.salonId);
  }

  async createTimeOff(userId: string, dto: CreateStaffTimeOffDto) {
    const staff = await this.requireMembership(userId, dto.salonId);
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    if (startsAt >= endsAt) throw new BadRequestException('پایان مرخصی باید پس از شروع آن باشد');
    if (endsAt <= new Date()) throw new BadRequestException('زمان مسدود باید مربوط به آینده باشد');
    if (endsAt.getTime() - startsAt.getTime() > 31 * 86_400_000) {
      throw new BadRequestException('هر بازه مرخصی نمی‌تواند بیشتر از ۳۱ روز باشد');
    }

    const [overlap, bookingConflict] = await Promise.all([
      this.prisma.timeOff.findFirst({
        where: { staffId: staff.id, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
      }),
      this.prisma.booking.findFirst({
        where: {
          staffId: staff.id,
          status: { in: ACTIVE_BOOKING_STATUSES },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
        select: { id: true, startsAt: true },
      }),
    ]);
    if (overlap) throw new BadRequestException('این بازه با زمان مسدود دیگری هم‌پوشانی دارد');
    if (bookingConflict) {
      throw new BadRequestException(
        'در این بازه نوبت فعال دارید؛ ابتدا با مدیر سالن برای جابه‌جایی آن هماهنگ کنید',
      );
    }
    return this.prisma.timeOff.create({
      data: {
        staffId: staff.id,
        startsAt,
        endsAt,
        reason: dto.reason?.trim() || 'زمان شخصی',
      },
    });
  }

  async deleteTimeOff(userId: string, salonId: string, timeOffId: string) {
    const staff = await this.requireMembership(userId, salonId);
    const timeOff = await this.prisma.timeOff.findFirst({
      where: { id: timeOffId, staffId: staff.id },
    });
    if (!timeOff) throw new NotFoundException('زمان مسدود یافت نشد');
    if (timeOff.startsAt <= new Date()) {
      throw new BadRequestException('زمان مسدود آغازشده قابل حذف نیست');
    }
    await this.prisma.timeOff.delete({ where: { id: timeOff.id } });
    return { deleted: true };
  }

  async settlements(userId: string, salonId: string) {
    const staff = await this.requireMembership(userId, salonId);
    return this.prisma.staffSettlement.findMany({
      where: { salonId, staffId: staff.id },
      select: {
        id: true,
        periodStart: true,
        periodEnd: true,
        status: true,
        grossRevenue: true,
        serviceCommission: true,
        baseSalaryAmount: true,
        bonusAmount: true,
        deductionAmount: true,
        netPayable: true,
        paymentMethod: true,
        paymentReference: true,
        approvedAt: true,
        paidAt: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async settlement(userId: string, salonId: string, settlementId: string) {
    const staff = await this.requireMembership(userId, salonId);
    const settlement = await this.prisma.staffSettlement.findFirst({
      where: { id: settlementId, salonId, staffId: staff.id },
      include: {
        items: { orderBy: { completedAt: 'asc' } },
        adjustments: { orderBy: { createdAt: 'asc' } },
        events: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!settlement) throw new NotFoundException('تسویه شخصی یافت نشد');
    return settlement;
  }

  async notifications(userId: string, salonId: string) {
    await this.requireMembership(userId, salonId);
    return this.prisma.notification.findMany({
      where: { userId, salonId, channel: 'IN_APP' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async readNotification(userId: string, salonId: string, notificationId: string) {
    await this.requireMembership(userId, salonId);
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId, salonId },
    });
    if (!notification) throw new NotFoundException('اعلان یافت نشد');
    return this.prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'READ', readAt: notification.readAt ?? new Date() },
    });
  }

  async readAllNotifications(userId: string, salonId: string) {
    await this.requireMembership(userId, salonId);
    const result = await this.prisma.notification.updateMany({
      where: { userId, salonId, channel: 'IN_APP', readAt: null },
      data: { status: 'READ', readAt: new Date() },
    });
    return { updated: result.count };
  }

  async profile(userId: string, salonId: string) {
    const staff = await this.requireMembership(userId, salonId);
    return this.serializeStaff(staff);
  }

  async updateProfile(userId: string, dto: UpdateStaffProfileDto) {
    const staff = await this.requireMembership(userId, dto.salonId);
    return this.prisma.staffProfile.update({
      where: { id: staff.id },
      data: {
        displayName: dto.displayName?.trim(),
        bio: dto.bio?.trim(),
        specialties: dto.specialties?.map((item) => item.trim()).filter(Boolean),
      },
      select: {
        id: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        status: true,
        specialties: true,
        salon: { select: { id: true, name: true, logoUrl: true, address: true } },
        services: {
          select: {
            commissionRate: true,
            fixedAmount: true,
            service: { select: { id: true, name: true, durationMinutes: true, price: true } },
          },
        },
      },
    });
  }

  private async requireMembership(userId: string, salonId: string) {
    const staff = await this.prisma.staffProfile.findFirst({
      where: {
        userId,
        salonId,
        status: { not: 'INACTIVE' },
        salon: { deletedAt: null, status: { not: 'CLOSED' } },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        salon: { select: { id: true, name: true, logoUrl: true, address: true, genderType: true } },
        services: {
          include: {
            service: { select: { id: true, name: true, durationMinutes: true, price: true } },
          },
        },
      },
    });
    if (!staff) throw new ForbiddenException('برای این سالن دسترسی فعال کارکنان ندارید');
    return staff;
  }

  private serializeStaff(staff: Awaited<ReturnType<StaffPortalService['requireMembership']>>) {
    return {
      id: staff.id,
      displayName: staff.displayName,
      bio: staff.bio,
      avatarUrl: staff.avatarUrl,
      status: staff.status,
      specialties: staff.specialties,
      compensationType: staff.compensationType,
      commissionRate: staff.commissionRate,
      fixedServiceAmount: staff.fixedServiceAmount,
      monthlySalary: staff.monthlySalary,
      user: staff.user,
      salon: staff.salon,
      services: staff.services,
    };
  }

  private parseDay(date: string) {
    try {
      return getIranDayBounds(date);
    } catch {
      throw new BadRequestException('تاریخ معتبر نیست');
    }
  }

  private parseRange(from: string, to: string, maxDays: number) {
    try {
      const start = getIranDayBounds(from).start;
      const end = getIranDayBounds(to).end;
      if (start >= end) throw new Error('INVALID_RANGE');
      if ((end.getTime() - start.getTime()) / 86_400_000 > maxDays) {
        throw new BadRequestException(`بازه تقویم نمی‌تواند بیشتر از ${maxDays} روز باشد`);
      }
      return { start, end };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('بازه زمانی معتبر نیست');
    }
  }

  private validateWorkingDay(day: UpdateStaffScheduleDto['days'][number]) {
    if (!day.isOpen) return;
    if (day.openTime >= day.closeTime) {
      throw new BadRequestException('ساعت پایان شیفت باید پس از شروع باشد');
    }
    const hasBreakStart = Boolean(day.breakStart);
    const hasBreakEnd = Boolean(day.breakEnd);
    if (hasBreakStart !== hasBreakEnd) {
      throw new BadRequestException('شروع و پایان استراحت باید با هم ثبت شوند');
    }
    if (
      day.breakStart &&
      day.breakEnd &&
      (day.breakStart <= day.openTime ||
        day.breakEnd >= day.closeTime ||
        day.breakStart >= day.breakEnd)
    ) {
      throw new BadRequestException('بازه استراحت باید داخل ساعات شیفت باشد');
    }
  }

  private calculateCommission(
    amount: number,
    staff: {
      compensationType: StaffCompensationType;
      commissionRate: number;
      fixedServiceAmount: number;
    },
    serviceRule?: { commissionRate: number | null; fixedAmount: number | null },
  ) {
    if (
      staff.compensationType === StaffCompensationType.PERCENTAGE ||
      staff.compensationType === StaffCompensationType.SALARY_PLUS_PERCENTAGE
    ) {
      return Math.round(amount * ((serviceRule?.commissionRate ?? staff.commissionRate) / 100));
    }
    if (staff.compensationType === StaffCompensationType.FIXED_PER_SERVICE) {
      return Math.round(serviceRule?.fixedAmount ?? staff.fixedServiceAmount);
    }
    return 0;
  }

  private todayInIran() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  private readonly bookingInclude = {
    customer: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
      },
    },
    items: {
      include: {
        service: { select: { id: true, name: true, durationMinutes: true } },
      },
    },
  } satisfies Prisma.BookingInclude;
}

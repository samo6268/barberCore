import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalonDto, UpdateSalonDto, WorkingHourDto } from './dto/salon.dto';
import {
  BookingStatus,
  DayOfWeek,
  SalonStatus,
  SubscriptionStatus,
  SubscriptionTier,
} from '@prisma/client';
import { getIranDayBounds } from '../../common/time/iran-time';

@Injectable()
export class SalonsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateSalonDto) {
    const slug = await this.generateSlug(dto.name);
    const salon = await this.prisma.salon.create({
      data: {
        ...dto,
        slug,
        ownerId,
        status: SalonStatus.PENDING_REVIEW,
        subscription: {
          create: {
            tier: SubscriptionTier.FREE,
            status: SubscriptionStatus.TRIALING,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
            trialEndsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
        },
      },
      include: { subscription: true },
    });

    // Seed default working hours (Sat–Thu 9am–9pm, Fri closed)
    const days: DayOfWeek[] = [
      'SATURDAY',
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
    ];
    await this.prisma.workingHour.createMany({
      data: days.map((day) => ({
        salonId: salon.id,
        dayOfWeek: day,
        openTime: '09:00',
        closeTime: '21:00',
        isOpen: day !== 'FRIDAY',
      })),
    });

    return salon;
  }

  async findMine(ownerId: string) {
    return this.prisma.salon.findMany({
      where: { ownerId, deletedAt: null },
      include: { subscription: true, _count: { select: { bookings: true, reviews: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async overview(salonId: string, ownerId: string, requestedDate?: string) {
    await this.assertOwner(salonId, ownerId);
    const date = requestedDate ?? this.todayInIran();
    let start: Date;
    let end: Date;
    try {
      ({ start, end } = getIranDayBounds(date));
    } catch {
      throw new BadRequestException('تاریخ نمای مدیریتی معتبر نیست');
    }
    const monthStart = getIranDayBounds(`${date.slice(0, 8)}01`).start;
    const activeStatuses = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.IN_PROGRESS,
    ];

    const [salon, todayBookings, monthCompleted, upcoming, staff, reviews] = await Promise.all([
      this.prisma.salon.findUnique({
        where: { id: salonId, deletedAt: null },
        include: {
          subscription: true,
          workingHours: { where: { staffId: null }, orderBy: { dayOfWeek: 'asc' } },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              services: { where: { isActive: true } },
              staffProfiles: { where: { status: 'ACTIVE' } },
            },
          },
        },
      }),
      this.prisma.booking.findMany({
        where: { salonId, startsAt: { gte: start, lt: end } },
        include: {
          customer: { select: { firstName: true, lastName: true, phone: true, avatarUrl: true } },
          staff: { select: { id: true, displayName: true, avatarUrl: true } },
          items: { include: { service: { select: { id: true, name: true } } } },
        },
        orderBy: { startsAt: 'asc' },
      }),
      this.prisma.booking.findMany({
        where: {
          salonId,
          status: BookingStatus.COMPLETED,
          completedAt: { gte: monthStart, lt: end },
        },
        select: { totalPrice: true },
      }),
      this.prisma.booking.findMany({
        where: { salonId, status: { in: activeStatuses }, startsAt: { gte: new Date() } },
        include: {
          customer: { select: { firstName: true, lastName: true } },
          staff: { select: { displayName: true } },
          items: { include: { service: { select: { name: true } } } },
        },
        orderBy: { startsAt: 'asc' },
        take: 5,
      }),
      this.prisma.staffProfile.findMany({
        where: { salonId, status: 'ACTIVE' },
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          specialties: true,
          _count: {
            select: { bookings: { where: { startsAt: { gte: start, lt: end } } } },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.review.findMany({
        where: { salonId, isVisible: true },
        include: {
          customer: { select: { firstName: true, lastName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);
    if (!salon) throw new NotFoundException('سالن یافت نشد');

    const statusCounts = Object.fromEntries(
      Object.values(BookingStatus).map((status) => [
        status,
        todayBookings.filter((booking) => booking.status === status).length,
      ]),
    );
    const completedToday = todayBookings.filter(
      (booking) => booking.status === BookingStatus.COMPLETED,
    );
    const setupChecks = [
      Boolean(salon.description),
      Boolean(salon.address && salon.phone),
      Boolean(salon.coverImageUrl || salon.logoUrl),
      salon._count.services > 0,
      salon._count.staffProfiles > 0,
      salon.workingHours.length > 0,
    ];

    return {
      salon,
      date,
      today: {
        total: todayBookings.length,
        revenue: completedToday.reduce((sum, booking) => sum + booking.totalPrice, 0),
        statusCounts,
        bookings: todayBookings,
      },
      month: {
        completed: monthCompleted.length,
        revenue: monthCompleted.reduce((sum, booking) => sum + booking.totalPrice, 0),
      },
      upcoming,
      staff,
      reviews,
      setup: {
        completed: setupChecks.filter(Boolean).length,
        total: setupChecks.length,
        percent: Math.round((setupChecks.filter(Boolean).length / setupChecks.length) * 100),
      },
    };
  }

  async findOne(id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id, deletedAt: null },
      include: {
        subscription: true,
        staffProfiles: {
          where: { status: 'ACTIVE' },
          include: { services: { include: { service: true } } },
        },
        services: { where: { isActive: true }, include: { category: true } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
    if (!salon) throw new NotFoundException('سالن یافت نشد');
    return salon;
  }

  async findBySlug(slug: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { slug, deletedAt: null },
      include: {
        staffProfiles: { where: { status: 'ACTIVE' } },
        services: { where: { isActive: true }, include: { category: true } },
        workingHours: true,
        media: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
    if (!salon) throw new NotFoundException('سالن یافت نشد');
    return salon;
  }

  async update(id: string, ownerId: string, dto: UpdateSalonDto) {
    await this.assertOwner(id, ownerId);
    return this.prisma.salon.update({ where: { id }, data: dto });
  }

  async updateWorkingHours(salonId: string, ownerId: string, hours: WorkingHourDto[]) {
    await this.assertOwner(salonId, ownerId);
    await this.prisma.workingHour.deleteMany({ where: { salonId, staffId: null } });
    await this.prisma.workingHour.createMany({
      data: hours.map((h) => ({
        salonId,
        dayOfWeek: h.dayOfWeek as DayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isOpen: h.isOpen ?? true,
        breakStart: h.breakStart,
        breakEnd: h.breakEnd,
      })),
    });
    return this.prisma.workingHour.findMany({ where: { salonId, staffId: null } });
  }

  async updateOnboardingStep(salonId: string, ownerId: string, step: number) {
    await this.assertOwner(salonId, ownerId);
    return this.prisma.salon.update({ where: { id: salonId }, data: { onboardingStep: step } });
  }

  private async assertOwner(salonId: string, ownerId: string) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) throw new NotFoundException('سالن یافت نشد');
    if (salon.ownerId !== ownerId) throw new ForbiddenException('دسترسی غیرمجاز');
    return salon;
  }

  private async generateSlug(name: string): Promise<string> {
    const base = name
      .replace(/\s+/g, '-')
      .replace(/[^\w؀-ۿ-]/g, '')
      .toLowerCase()
      .substring(0, 50);
    const slug = `${base}-${Math.random().toString(36).substring(2, 7)}`;
    const exists = await this.prisma.salon.findUnique({ where: { slug } });
    return exists ? `${slug}-${Date.now()}` : slug;
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
}

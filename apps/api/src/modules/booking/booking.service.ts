import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';
import { AvailabilityService } from './availability.service';
import { getIranDayBounds, parseIranDateTime } from '../../common/time/iran-time';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  salonId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  serviceIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @ApiProperty({ example: '2030-01-10' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string; // YYYY-MM-DD

  @ApiProperty({ example: '10:00' })
  @Matches(/^\d{2}:\d{2}$/)
  time: string; // HH:mm

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private availabilityService: AvailabilityService,
  ) {}

  async create(customerId: string, dto: CreateBookingDto) {
    if (
      !dto ||
      typeof dto.salonId !== 'string' ||
      !Array.isArray(dto.serviceIds) ||
      dto.serviceIds.some((id) => typeof id !== 'string' || !id.trim()) ||
      typeof dto.date !== 'string' ||
      typeof dto.time !== 'string'
    ) {
      throw new BadRequestException('اطلاعات رزرو کامل یا معتبر نیست');
    }

    const serviceIds = [...new Set(dto.serviceIds.map((id) => id.trim()))];
    if (!serviceIds.length || serviceIds.length !== dto.serviceIds.length) {
      throw new BadRequestException('خدمات انتخاب‌شده معتبر نیستند');
    }

    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds }, salonId: dto.salonId, isActive: true },
    });
    if (services.length !== serviceIds.length)
      throw new BadRequestException('خدمت انتخاب‌شده معتبر نیست');

    const startsAt = this.parseStartsAt(dto.date, dto.time);
    if (startsAt <= new Date()) throw new BadRequestException('زمان رزرو باید در آینده باشد');

    const availableSlots = await this.availabilityService.getAvailableSlots(
      dto.salonId,
      dto.date,
      serviceIds,
      dto.staffId,
    );
    const selectedSlot = availableSlots.find((slot) => slot.time === dto.time && slot.available);
    if (!selectedSlot) throw new BadRequestException('زمان انتخاب‌شده در دسترس نیست');

    const resolvedStaffId = dto.staffId ?? selectedSlot.staffId;
    if (resolvedStaffId) {
      const staff = await this.prisma.staffProfile.findFirst({
        where: { id: resolvedStaffId, salonId: dto.salonId, status: 'ACTIVE' },
        select: {
          services: { where: { serviceId: { in: serviceIds } }, select: { serviceId: true } },
        },
      });
      if (!staff || staff.services.length !== serviceIds.length) {
        throw new BadRequestException('آرایشگر انتخاب‌شده برای این خدمات معتبر نیست');
      }
    }

    const totalDuration = services.reduce((s, svc) => s + svc.durationMinutes, 0);
    const totalPrice = services.reduce((s, svc) => s + (svc.discountPrice ?? svc.price), 0);
    const endsAt = new Date(startsAt.getTime() + totalDuration * 60000);

    // Conflict check
    const conflict = await this.prisma.booking.findFirst({
      where: {
        salonId: dto.salonId,
        staffId: resolvedStaffId ?? null,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        OR: [{ startsAt: { lt: endsAt }, endsAt: { gt: startsAt } }],
      },
    });
    if (conflict) throw new BadRequestException('این زمان رزرو شده است');

    const booking = await this.prisma.booking.create({
      data: {
        salonId: dto.salonId,
        customerId,
        staffId: resolvedStaffId,
        status: BookingStatus.CONFIRMED,
        startsAt,
        endsAt,
        totalPrice,
        notes: dto.notes,
        items: {
          create: services.map((s) => ({
            serviceId: s.id,
            price: s.discountPrice ?? s.price,
            duration: s.durationMinutes,
          })),
        },
      },
      include: {
        items: { include: { service: true } },
        staff: true,
        salon: { select: { name: true, address: true, phone: true } },
      },
    });
    return booking;
  }

  async findMyBookings(customerId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { customerId },
        include: {
          items: { include: { service: true } },
          salon: { select: { name: true, logoUrl: true, address: true } },
          staff: { select: { displayName: true, avatarUrl: true } },
          review: { select: { id: true } },
        },
        orderBy: { startsAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where: { customerId } }),
    ]);
    return paginate(data, total, page, limit);
  }

  async findSalonBookings(salonId: string, ownerId: string, date?: string) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon || salon.ownerId !== ownerId) throw new ForbiddenException('دسترسی غیرمجاز');

    const where: Record<string, unknown> = { salonId };
    if (date) {
      try {
        const { start, end } = getIranDayBounds(date);
        where['startsAt'] = { gte: start, lt: end };
      } catch {
        throw new BadRequestException('تاریخ معتبر نیست');
      }
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        customer: { select: { firstName: true, lastName: true, phone: true, avatarUrl: true } },
        items: { include: { service: { select: { name: true } } } },
        staff: { select: { displayName: true } },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async cancel(id: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('رزرو یافت نشد');

    // Allow customer or salon owner to cancel
    const salon = await this.prisma.salon.findUnique({ where: { id: booking.salonId } });
    if (booking.customerId !== userId && salon?.ownerId !== userId)
      throw new ForbiddenException('دسترسی غیرمجاز');
    if (['COMPLETED', 'CANCELLED'].includes(booking.status))
      throw new BadRequestException('این رزرو قابل لغو نیست');

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: userId,
      },
    });
  }

  async updateStatus(id: string, ownerId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('رزرو یافت نشد');
    const salon = await this.prisma.salon.findUnique({ where: { id: booking.salonId } });
    if (salon?.ownerId !== ownerId) throw new ForbiddenException('دسترسی غیرمجاز');
    if (booking.status === status) return booking;

    const allowedTransitions: Partial<Record<BookingStatus, BookingStatus[]>> = {
      PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      CONFIRMED: [
        BookingStatus.IN_PROGRESS,
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
        BookingStatus.NO_SHOW,
      ],
      IN_PROGRESS: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    };
    if (!allowedTransitions[booking.status]?.includes(status)) {
      throw new BadRequestException('تغییر وضعیت رزرو مجاز نیست');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(status === BookingStatus.CONFIRMED ? { confirmedAt: new Date() } : {}),
        ...(status === BookingStatus.COMPLETED ? { completedAt: new Date() } : {}),
        ...(status === BookingStatus.CANCELLED
          ? {
              cancelledAt: new Date(),
              cancelledBy: ownerId,
              cancellationReason: 'لغو توسط سالن',
            }
          : {}),
      },
    });
  }

  private parseStartsAt(date: string, time: string): Date {
    try {
      return parseIranDateTime(date, time);
    } catch {
      throw new BadRequestException('تاریخ یا ساعت رزرو معتبر نیست');
    }
  }
}

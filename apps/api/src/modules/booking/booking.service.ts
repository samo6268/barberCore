import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

export class CreateBookingDto {
  salonId: string;
  serviceIds: string[];
  staffId?: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:mm
  notes?: string;
}

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateBookingDto) {
    const services = await this.prisma.service.findMany({
      where: { id: { in: dto.serviceIds }, salonId: dto.salonId, isActive: true },
    });
    if (services.length !== dto.serviceIds.length) throw new BadRequestException('خدمت انتخاب‌شده معتبر نیست');

    const totalDuration = services.reduce((s, svc) => s + svc.durationMinutes, 0);
    const totalPrice = services.reduce((s, svc) => s + (svc.discountPrice ?? svc.price), 0);

    const startsAt = new Date(`${dto.date}T${dto.time}:00Z`);
    const endsAt = new Date(startsAt.getTime() + totalDuration * 60000);

    // Conflict check
    const conflict = await this.prisma.booking.findFirst({
      where: {
        salonId: dto.salonId,
        staffId: dto.staffId || undefined,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        OR: [{ startsAt: { lt: endsAt }, endsAt: { gt: startsAt } }],
      },
    });
    if (conflict) throw new BadRequestException('این زمان رزرو شده است');

    const booking = await this.prisma.booking.create({
      data: {
        salonId: dto.salonId,
        customerId,
        staffId: dto.staffId,
        status: BookingStatus.CONFIRMED,
        startsAt,
        endsAt,
        totalPrice,
        notes: dto.notes,
        items: { create: services.map(s => ({ serviceId: s.id, price: s.discountPrice ?? s.price, duration: s.durationMinutes })) },
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
        include: { items: { include: { service: true } }, salon: { select: { name: true, logoUrl: true, address: true } }, staff: { select: { displayName: true, avatarUrl: true } } },
        orderBy: { startsAt: 'desc' },
        skip, take: limit,
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
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      where['startsAt'] = { gte: d, lt: next };
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
    if (booking.customerId !== userId && salon?.ownerId !== userId) throw new ForbiddenException('دسترسی غیرمجاز');
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) throw new BadRequestException('این رزرو قابل لغو نیست');

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED, cancellationReason: reason, cancelledAt: new Date(), cancelledBy: userId },
    });
  }

  async updateStatus(id: string, ownerId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('رزرو یافت نشد');
    const salon = await this.prisma.salon.findUnique({ where: { id: booking.salonId } });
    if (salon?.ownerId !== ownerId) throw new ForbiddenException('دسترسی غیرمجاز');
    return this.prisma.booking.update({ where: { id }, data: { status } });
  }
}

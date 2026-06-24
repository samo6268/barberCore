import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: { bookingId: string; rating: number; comment?: string }) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking) throw new NotFoundException('رزرو یافت نشد');
    if (booking.customerId !== customerId) throw new ForbiddenException('دسترسی غیرمجاز');
    if (booking.status !== 'COMPLETED') throw new BadRequestException('فقط برای رزروهای تکمیل‌شده می‌توانید نظر بدهید');

    const existing = await this.prisma.review.findUnique({ where: { bookingId: dto.bookingId } });
    if (existing) throw new BadRequestException('قبلاً نظر داده‌اید');

    const review = await this.prisma.review.create({
      data: { bookingId: dto.bookingId, salonId: booking.salonId, customerId, rating: dto.rating, comment: dto.comment },
    });

    // Update salon average rating
    const stats = await this.prisma.review.aggregate({ where: { salonId: booking.salonId, isVisible: true }, _avg: { rating: true }, _count: true });
    await this.prisma.salon.update({
      where: { id: booking.salonId },
      data: { rating: Math.round((stats._avg.rating || 0) * 10) / 10, reviewCount: stats._count },
    });

    return review;
  }

  async reply(id: string, ownerId: string, replyText: string) {
    const review = await this.prisma.review.findUnique({ where: { id }, include: { salon: true } });
    if (!review) throw new NotFoundException('نظر یافت نشد');
    if (review.salon.ownerId !== ownerId) throw new ForbiddenException('دسترسی غیرمجاز');
    return this.prisma.review.update({ where: { id }, data: { replyText, repliedAt: new Date() } });
  }

  async findBySalon(salonId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { salonId, isVisible: true },
        include: { customer: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      this.prisma.review.count({ where: { salonId, isVisible: true } }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}

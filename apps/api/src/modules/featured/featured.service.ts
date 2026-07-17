import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Zone definitions — fixed monthly price in IRR */
export const FEATURED_ZONES: Record<string, { name: string; priceIRR: number; maxSlots: number }> = {
  HOMEPAGE_HERO:    { name: 'هیرو صفحه اصلی',    priceIRR: 15_000_000, maxSlots: 3 },
  HOMEPAGE_GRID:    { name: 'گرید صفحه اصلی',    priceIRR: 8_000_000,  maxSlots: 6 },
  SEARCH_TOP:       { name: 'بالای نتایج جستجو', priceIRR: 5_000_000,  maxSlots: 5 },
  CATEGORY_BANNER:  { name: 'بنر دسته‌بندی',     priceIRR: 3_000_000,  maxSlots: 10 },
};

@Injectable()
export class FeaturedService {
  constructor(private readonly prisma: PrismaService) {}

  getZones() {
    return Object.entries(FEATURED_ZONES).map(([id, z]) => ({ id, ...z }));
  }

  async getAvailability(zone: string) {
    const def = FEATURED_ZONES[zone];
    if (!def) throw new BadRequestException(`Zone "${zone}" not found`);

    const active = await this.prisma.featuredSlot.count({
      where: { zone, status: 'ACTIVE', endsAt: { gt: new Date() } },
    });

    return {
      zone,
      ...def,
      activeSlots: active,
      availableSlots: def.maxSlots - active,
      isFull: active >= def.maxSlots,
    };
  }

  async bookSlot(dto: {
    salonId: string;
    zone: string;
    months: number;
  }) {
    const def = FEATURED_ZONES[dto.zone];
    if (!def) throw new BadRequestException(`Zone "${dto.zone}" not found`);

    const avail = await this.getAvailability(dto.zone);
    if (avail.isFull) {
      throw new BadRequestException(`Zone "${dto.zone}" is fully booked`);
    }

    const now      = new Date();
    const endsAt   = new Date(now);
    endsAt.setMonth(endsAt.getMonth() + dto.months);
    const totalIRR = def.priceIRR * dto.months;

    return this.prisma.featuredSlot.create({
      data: {
        salonId: dto.salonId,
        zone: dto.zone,
        startsAt: now,
        endsAt,
        totalPaidIRR: totalIRR,
        status: 'PENDING_PAYMENT',
      },
    });
  }

  async activateSlot(slotId: string) {
    const slot = await this.prisma.featuredSlot.findUnique({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('Slot not found');
    return this.prisma.featuredSlot.update({
      where: { id: slotId },
      data: { status: 'ACTIVE' },
    });
  }

  async getActiveSalonsByZone(zone: string) {
    return this.prisma.featuredSlot.findMany({
      where: { zone, status: 'ACTIVE', endsAt: { gt: new Date() } },
      include: {
        salon: {
          select: { id: true, name: true, slug: true, logoUrl: true, coverImageUrl: true, city: true },
        },
      },
      orderBy: { startsAt: 'asc' },
    });
  }
}

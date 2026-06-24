import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalonDto, UpdateSalonDto, WorkingHourDto } from './dto/salon.dto';
import { DayOfWeek, GenderType, SalonStatus, SubscriptionStatus, SubscriptionTier } from '@prisma/client';

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
    const days: DayOfWeek[] = ['SATURDAY','SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'];
    await this.prisma.workingHour.createMany({
      data: days.map(day => ({
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

  async findOne(id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id, deletedAt: null },
      include: {
        subscription: true,
        staffProfiles: { where: { status: 'ACTIVE' }, include: { services: { include: { service: true } } } },
        services: { where: { isActive: true }, include: { category: true } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' } },
        reviews: { take: 5, orderBy: { createdAt: 'desc' }, include: { customer: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
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
        reviews: { take: 10, orderBy: { createdAt: 'desc' }, include: { customer: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
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
      data: hours.map(h => ({
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
}

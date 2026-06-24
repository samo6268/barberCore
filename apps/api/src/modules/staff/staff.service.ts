import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class CreateStaffDto {
  userId?: string; displayName: string; bio?: string;
  specialties?: string[]; commissionRate?: number; sortOrder?: number;
}

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(salonId: string, ownerId: string, dto: CreateStaffDto) {
    await this.assertOwner(salonId, ownerId);
    // If no userId provided, use owner as placeholder (invite flow Phase 2)
    const userId = dto.userId || ownerId;
    return this.prisma.staffProfile.create({
      data: { salonId, userId, displayName: dto.displayName, bio: dto.bio,
        specialties: dto.specialties || [], commissionRate: dto.commissionRate || 0,
        sortOrder: dto.sortOrder || 0 },
      include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    });
  }

  async findBySalon(salonId: string) {
    return this.prisma.staffProfile.findMany({
      where: { salonId, status: 'ACTIVE' },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        services: { include: { service: { select: { id: true, name: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async update(id: string, salonId: string, ownerId: string, dto: Partial<CreateStaffDto>) {
    await this.assertOwner(salonId, ownerId);
    return this.prisma.staffProfile.update({
      where: { id },
      data: { displayName: dto.displayName, bio: dto.bio, specialties: dto.specialties,
              commissionRate: dto.commissionRate, sortOrder: dto.sortOrder },
    });
  }

  async assignServices(staffId: string, salonId: string, ownerId: string, serviceIds: string[]) {
    await this.assertOwner(salonId, ownerId);
    await this.prisma.staffService.deleteMany({ where: { staffId } });
    await this.prisma.staffService.createMany({
      data: serviceIds.map(serviceId => ({ staffId, serviceId })),
      skipDuplicates: true,
    });
    return this.prisma.staffProfile.findUnique({
      where: { id: staffId },
      include: { services: { include: { service: true } } },
    });
  }

  async remove(id: string, salonId: string, ownerId: string) {
    await this.assertOwner(salonId, ownerId);
    return this.prisma.staffProfile.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  private async assertOwner(salonId: string, ownerId: string) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) throw new NotFoundException('سالن یافت نشد');
    if (salon.ownerId !== ownerId) throw new ForbiddenException('دسترسی غیرمجاز');
  }
}

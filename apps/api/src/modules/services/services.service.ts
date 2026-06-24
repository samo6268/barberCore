import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class CreateServiceDto {
  name: string; description?: string; categoryId?: string;
  durationMinutes: number; price: number; discountPrice?: number;
  isOnlineBookable?: boolean; maxParallelBookings?: number; sortOrder?: number;
}

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(salonId: string, ownerId: string, dto: CreateServiceDto) {
    await this.assertOwner(salonId, ownerId);
    return this.prisma.service.create({ data: { ...dto, salonId }, include: { category: true } });
  }

  async findBySalon(salonId: string) {
    return this.prisma.service.findMany({
      where: { salonId, isActive: true },
      include: { category: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });
  }

  async update(id: string, salonId: string, ownerId: string, dto: Partial<CreateServiceDto>) {
    await this.assertOwner(salonId, ownerId);
    return this.prisma.service.update({ where: { id }, data: dto, include: { category: true } });
  }

  async remove(id: string, salonId: string, ownerId: string) {
    await this.assertOwner(salonId, ownerId);
    return this.prisma.service.update({ where: { id }, data: { isActive: false } });
  }

  async getCategories() {
    return this.prisma.serviceCategory.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  private async assertOwner(salonId: string, ownerId: string) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) throw new NotFoundException('سالن یافت نشد');
    if (salon.ownerId !== ownerId) throw new ForbiddenException('دسترسی غیرمجاز');
  }
}

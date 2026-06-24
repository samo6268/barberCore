import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, email: true, firstName: true, lastName: true, avatarUrl: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return user;
  }

  async updateProfile(userId: string, dto: { firstName?: string; lastName?: string; email?: string }) {
    return this.prisma.user.update({ where: { id: userId }, data: dto,
      select: { id: true, phone: true, email: true, firstName: true, lastName: true, avatarUrl: true } });
  }

  async becomeSalonOwner(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { role: 'SALON_OWNER' } });
  }
}

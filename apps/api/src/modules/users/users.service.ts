import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 50) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 50) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
}

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

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, id: { not: userId } },
        select: { id: true },
      });
      if (existing) throw new ConflictException('این ایمیل قبلاً استفاده شده است');
    }
    return this.prisma.user.update({ where: { id: userId }, data: dto,
      select: { id: true, phone: true, email: true, firstName: true, lastName: true, avatarUrl: true } });
  }

  async becomeSalonOwner(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { role: 'SALON_OWNER' } });
  }
}

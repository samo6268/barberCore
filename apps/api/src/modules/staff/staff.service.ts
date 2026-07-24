import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsMobilePhone,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';

export class CreateStaffDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() userId?: string;
  @ApiPropertyOptional() @IsOptional() @IsMobilePhone('fa-IR') phone?: string;
  @ApiProperty() @IsString() @Length(2, 100) displayName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) bio?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayUnique() @IsString({ each: true }) specialties?: string[];
  @ApiProperty({ type: [String] }) @IsArray() @ArrayUnique() @IsUUID('4', { each: true }) serviceIds?: string[];
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) commissionRate?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(salonId: string, ownerId: string, dto: CreateStaffDto) {
    await this.assertOwner(salonId, ownerId);
    const serviceIds = [...new Set(dto.serviceIds ?? [])];
    if (!serviceIds.length) {
      throw new BadRequestException('حداقل یک خدمت برای متخصص انتخاب کنید');
    }
    const serviceCount = await this.prisma.service.count({
      where: { id: { in: serviceIds }, salonId, isActive: true },
    });
    if (serviceCount !== serviceIds.length) {
      throw new BadRequestException('یک یا چند خدمت انتخاب‌شده معتبر نیست');
    }

    let userId = dto.userId;
    if (!userId) {
      const phone = dto.phone?.trim();
      if (!phone) throw new BadRequestException('شماره موبایل متخصص الزامی است');
      const names = dto.displayName.trim().split(/\s+/);
      const firstName = names.shift() || 'متخصص';
      const lastName = names.join(' ') || 'پرنگارین';
      const existingUser = await this.prisma.user.findUnique({ where: { phone } });
      const user =
        existingUser ??
        (await this.prisma.user.create({
          data: {
            phone,
            firstName,
            lastName,
            role: 'STAFF',
            isPhoneVerified: false,
          },
        }));
      userId = user.id;
    }

    const existingProfile = await this.prisma.staffProfile.findUnique({
      where: { userId_salonId: { userId, salonId } },
    });
    if (existingProfile) throw new ConflictException('این متخصص قبلاً به سالن اضافه شده است');

    const profile = await this.prisma.staffProfile.create({
      data: {
        salonId,
        userId,
        displayName: dto.displayName,
        bio: dto.bio,
        specialties: dto.specialties || [],
        commissionRate: dto.commissionRate || 0,
        sortOrder: dto.sortOrder || 0,
      },
    });
    await this.prisma.staffService.createMany({
      data: serviceIds.map((serviceId) => ({ staffId: profile.id, serviceId })),
      skipDuplicates: true,
    });
    return this.prisma.staffProfile.findUnique({
      where: { id: profile.id },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        services: { include: { service: { select: { id: true, name: true } } } },
      },
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

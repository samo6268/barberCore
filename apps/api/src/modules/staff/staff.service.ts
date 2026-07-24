import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StaffCompensationType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsEnum,
  IsMobilePhone,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
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
  @ApiPropertyOptional({ enum: StaffCompensationType })
  @IsOptional()
  @IsEnum(StaffCompensationType)
  compensationType?: StaffCompensationType;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) fixedServiceAmount?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) monthlySalary?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}

export class ServiceCompensationRuleDto {
  @ApiProperty() @IsUUID() serviceId: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) commissionRate?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) fixedAmount?: number;
}

export class UpdateStaffCompensationDto {
  @ApiProperty({ enum: StaffCompensationType })
  @IsEnum(StaffCompensationType)
  compensationType: StaffCompensationType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fixedServiceAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlySalary?: number;

  @ApiPropertyOptional({ type: [ServiceCompensationRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceCompensationRuleDto)
  serviceRules?: ServiceCompensationRuleDto[];
}

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
        compensationType: dto.compensationType,
        fixedServiceAmount: dto.fixedServiceAmount || 0,
        monthlySalary: dto.monthlySalary || 0,
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
      select: {
        id: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        specialties: true,
        status: true,
        sortOrder: true,
        services: { select: { service: { select: { id: true, name: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findManagementBySalon(salonId: string, ownerId: string) {
    await this.assertOwner(salonId, ownerId);
    return this.prisma.staffProfile.findMany({
      where: { salonId, status: { not: 'INACTIVE' } },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, phone: true } },
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
              commissionRate: dto.commissionRate, compensationType: dto.compensationType,
              fixedServiceAmount: dto.fixedServiceAmount, monthlySalary: dto.monthlySalary,
              sortOrder: dto.sortOrder },
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

  async updateCompensation(
    staffId: string,
    salonId: string,
    ownerId: string,
    dto: UpdateStaffCompensationDto,
  ) {
    await this.assertOwner(salonId, ownerId);
    const staff = await this.prisma.staffProfile.findFirst({
      where: { id: staffId, salonId, status: { not: 'INACTIVE' } },
      include: { services: true },
    });
    if (!staff) throw new NotFoundException('متخصص یافت نشد');

    const rules = dto.serviceRules ?? [];
    const assignedServiceIds = new Set(staff.services.map((item) => item.serviceId));
    if (rules.some((rule) => !assignedServiceIds.has(rule.serviceId))) {
      throw new BadRequestException('قاعده مالی فقط برای خدمات منتسب به متخصص قابل ثبت است');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.staffProfile.update({
        where: { id: staffId },
        data: {
          compensationType: dto.compensationType,
          commissionRate: dto.commissionRate ?? 0,
          fixedServiceAmount: dto.fixedServiceAmount ?? 0,
          monthlySalary: dto.monthlySalary ?? 0,
        },
      });
      await tx.staffService.updateMany({
        where: { staffId },
        data: { commissionRate: null, fixedAmount: null },
      });
      for (const rule of rules) {
        await tx.staffService.update({
          where: { staffId_serviceId: { staffId, serviceId: rule.serviceId } },
          data: {
            commissionRate: rule.commissionRate,
            fixedAmount: rule.fixedAmount,
          },
        });
      }
    });

    return this.prisma.staffProfile.findUnique({
      where: { id: staffId },
      include: {
        services: {
          include: { service: { select: { id: true, name: true } } },
        },
      },
    });
  }

  private async assertOwner(salonId: string, ownerId: string) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) throw new NotFoundException('سالن یافت نشد');
    if (salon.ownerId !== ownerId) throw new ForbiddenException('دسترسی غیرمجاز');
  }
}

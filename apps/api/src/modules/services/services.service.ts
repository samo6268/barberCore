import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
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

export class CreateServiceDto {
  @ApiProperty() @IsString() @Length(2, 100) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() categoryId?: string;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(5) @Max(1440) durationMinutes: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) discountPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isOnlineBookable?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) maxParallelBookings?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

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

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum, IsLatitude, IsLongitude, IsOptional, IsString, IsUrl, Length,
} from 'class-validator';
import { GenderType } from '@prisma/client';

export class CreateSalonDto {
  @ApiProperty() @IsString() @Length(2, 100) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: GenderType }) @IsOptional() @IsEnum(GenderType) genderType?: GenderType;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() province?: string;
  @ApiPropertyOptional() @IsOptional() @IsLatitude() latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsLongitude() longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() instagramHandle?: string;
}

export class UpdateSalonDto extends PartialType(CreateSalonDto) {}

export class WorkingHourDto {
  @ApiProperty() @IsString() dayOfWeek: string;
  @ApiProperty() @IsString() openTime: string;
  @ApiProperty() @IsString() closeTime: string;
  @ApiPropertyOptional() @IsOptional() isOpen?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() breakStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() breakEnd?: string;
}

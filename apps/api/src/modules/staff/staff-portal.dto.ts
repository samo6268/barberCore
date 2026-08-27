import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, DayOfWeek } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class StaffContextDto {
  @ApiProperty()
  @IsUUID()
  salonId: string;
}

export class StaffDayQueryDto extends StaffContextDto {
  @ApiPropertyOptional({ example: '2030-01-10' })
  @IsOptional()
  @Matches(DATE_PATTERN)
  date?: string;
}

export class StaffBookingQueryDto extends StaffContextDto {
  @ApiProperty({ example: '2030-01-01' })
  @Matches(DATE_PATTERN)
  from: string;

  @ApiProperty({ example: '2030-01-31' })
  @Matches(DATE_PATTERN)
  to: string;

  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}

export class StaffBookingStatusDto extends StaffContextDto {
  @ApiProperty({
    enum: [
      BookingStatus.CONFIRMED,
      BookingStatus.IN_PROGRESS,
      BookingStatus.COMPLETED,
      BookingStatus.NO_SHOW,
    ],
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}

export class StaffWorkingDayDto {
  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty()
  @IsBoolean()
  isOpen: boolean;

  @ApiProperty({ example: '09:00' })
  @Matches(TIME_PATTERN)
  openTime: string;

  @ApiProperty({ example: '18:00' })
  @Matches(TIME_PATTERN)
  closeTime: string;

  @ApiPropertyOptional({ example: '13:00' })
  @IsOptional()
  @Matches(TIME_PATTERN)
  breakStart?: string | null;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @Matches(TIME_PATTERN)
  breakEnd?: string | null;
}

export class UpdateStaffScheduleDto extends StaffContextDto {
  @ApiProperty({ type: [StaffWorkingDayDto] })
  @IsArray()
  @ArrayMaxSize(7)
  @ArrayUnique((day: StaffWorkingDayDto) => day.dayOfWeek)
  @ValidateNested({ each: true })
  @Type(() => StaffWorkingDayDto)
  days: StaffWorkingDayDto[];
}

export class CreateStaffTimeOffDto extends StaffContextDto {
  @ApiProperty()
  @IsDateString()
  startsAt: string;

  @ApiProperty()
  @IsDateString()
  endsAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  reason?: string;
}

export class UpdateStaffProfileDto extends StaffContextDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ArrayUnique()
  @IsString({ each: true })
  specialties?: string[];
}

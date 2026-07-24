import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SettlementStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class SettlementPeriodDto {
  @ApiProperty({ example: '2026-07-01' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from: string;

  @ApiProperty({ example: '2026-07-31' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to: string;
}

export class PreviewSettlementDto extends SettlementPeriodDto {
  @ApiProperty()
  @IsUUID()
  staffId: string;
}

export class CreateSettlementDto extends PreviewSettlementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonusAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  bonusDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deductionAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  deductionDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class SettlementListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @ApiPropertyOptional({ enum: SettlementStatus })
  @IsOptional()
  @IsEnum(SettlementStatus)
  status?: SettlementStatus;
}

export class UpdateSettlementStatusDto {
  @ApiProperty({ enum: [SettlementStatus.APPROVED, SettlementStatus.PAID, SettlementStatus.CANCELLED] })
  @IsEnum(SettlementStatus)
  status: SettlementStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  paymentReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

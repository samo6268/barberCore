import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class SendOtpDto {
  @ApiProperty({ example: '+989123456789' })
  @IsMobilePhone('fa-IR')
  phone: string;

  @ApiPropertyOptional({ enum: OtpPurpose, default: OtpPurpose.LOGIN })
  @IsOptional()
  @IsEnum(OtpPurpose)
  purpose?: OtpPurpose = OtpPurpose.LOGIN;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+989123456789' })
  @IsMobilePhone('fa-IR')
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiPropertyOptional({ enum: OtpPurpose })
  @IsOptional()
  @IsEnum(OtpPurpose)
  purpose?: OtpPurpose = OtpPurpose.LOGIN;
}

export class RegisterDto {
  @ApiProperty()
  @IsMobilePhone('fa-IR')
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otpCode: string;

  @ApiProperty()
  @IsString()
  @Length(1, 50)
  firstName: string;

  @ApiProperty()
  @IsString()
  @Length(1, 50)
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsStrongPassword({ minLength: 8 })
  password?: string;
}

export class LoginEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsStrongPassword({ minLength: 8 })
  newPassword: string;
}

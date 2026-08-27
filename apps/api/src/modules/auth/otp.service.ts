import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 5;
  private readonly RATE_LIMIT_MINUTES = 1;
  private readonly HASH_ROUNDS = 10;
  private readonly useFixedDevelopmentCode: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const isProduction = config.get('NODE_ENV') === 'production';
    const smsProvider = config.get('SMS_PROVIDER', isProduction ? 'kavenegar' : 'console');
    this.useFixedDevelopmentCode = !isProduction && smsProvider === 'console';
  }

  async createOtp(phone: string, purpose: OtpPurpose): Promise<string> {
    const recent = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        purpose,
        createdAt: { gte: new Date(Date.now() - this.RATE_LIMIT_MINUTES * 60 * 1000) },
      },
    });

    if (recent) {
      throw new HttpException(
        `لطفاً ${this.RATE_LIMIT_MINUTES} دقیقه صبر کنید`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.prisma.otpCode.updateMany({
      where: { phone, purpose, usedAt: null },
      data: { usedAt: new Date() },
    });

    const code = this.useFixedDevelopmentCode ? '123456' : this.generateCode();
    const codeHash = await bcrypt.hash(code, this.HASH_ROUNDS);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { phone, code: codeHash, purpose, expiresAt },
    });
    return code;
  }

  async validateOtp(phone: string, code: string, purpose: OtpPurpose): Promise<void> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, purpose, usedAt: null, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');

    if (otp.attempts >= this.MAX_ATTEMPTS) {
      throw new HttpException('تعداد تلاش‌ها بیش از حد مجاز است', HttpStatus.TOO_MANY_REQUESTS);
    }

    const isValid = await bcrypt.compare(code, otp.code);

    if (!isValid) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('کد تأیید نادرست است');
    }

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  }

  async invalidateOtp(phone: string, purpose: OtpPurpose): Promise<void> {
    await this.prisma.otpCode.updateMany({
      where: { phone, purpose, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  private generateCode(): string {
    return randomInt(100000, 1000000).toString();
  }
}

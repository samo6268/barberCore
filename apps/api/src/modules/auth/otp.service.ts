import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 5;
  private readonly RATE_LIMIT_MINUTES = 2;
  private readonly isDev: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.isDev = config.get('NODE_ENV') !== 'production';
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

    const code = this.isDev ? '123456' : this.generateCode();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.otpCode.create({ data: { phone, code, purpose, expiresAt } });
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

    if (otp.code !== code) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('کد تأیید نادرست است');
    }

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

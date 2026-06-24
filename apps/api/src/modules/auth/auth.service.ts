import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from './otp.service';
import { RegisterDto, LoginEmailDto } from './dto/auth.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private otpService: OtpService,
  ) {}

  async sendOtp(phone: string, purpose: OtpPurpose): Promise<{ message: string }> {
    const code = await this.otpService.createOtp(phone, purpose);

    // In production this calls SmsService — for now log to console in dev
    if (this.config.get('NODE_ENV') !== 'production') {
      console.log(`[OTP] ${phone} → ${code}`);
    }

    return { message: 'کد تأیید ارسال شد' };
  }

  async loginWithOtp(phone: string, code: string): Promise<TokenPair & { isNew: boolean }> {
    await this.otpService.validateOtp(phone, code, OtpPurpose.LOGIN);

    let user = await this.prisma.user.findUnique({ where: { phone } });
    const isNew = !user;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          firstName: 'کاربر',
          lastName: 'جدید',
          isPhoneVerified: true,
          role: UserRole.CUSTOMER,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), isPhoneVerified: true },
      });
    }

    const tokens = await this.generateTokens(user.id, user.role);
    return { ...tokens, isNew };
  }

  async register(dto: RegisterDto): Promise<TokenPair> {
    await this.otpService.validateOtp(dto.phone, dto.otpCode, OtpPurpose.REGISTER);

    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('این شماره قبلاً ثبت‌نام کرده است');

    if (dto.email) {
      const emailExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (emailExists) throw new ConflictException('این ایمیل قبلاً استفاده شده است');
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 12) : undefined;

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        isPhoneVerified: true,
        role: UserRole.CUSTOMER,
      },
    });

    return this.generateTokens(user.id, user.role);
  }

  async loginWithEmail(dto: LoginEmailDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('ایمیل یا رمز عبور نادرست');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('ایمیل یا رمز عبور نادرست');

    if (!user.isActive) throw new UnauthorizedException('حساب کاربری غیرفعال است');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user.id, user.role);
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('توکن نامعتبر است');
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('دسترسی مجاز نیست');

    // Rotate: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(user.id, user.role);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return user;
  }

  private async generateTokens(userId: string, role: UserRole): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshTokenValue = uuidv4();
    const refreshExpiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '30d');
    const expiresAt = new Date(Date.now() + this.parseDuration(refreshExpiresIn));

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenValue,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  private parseDuration(str: string): number {
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) return 30 * 24 * 3600 * 1000;
    const [, num, unit] = match;
    const n = parseInt(num, 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 3600 * 1000,
      d: 24 * 3600 * 1000,
    };
    return n * multipliers[unit];
  }
}

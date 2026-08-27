import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface KavenegarResponse {
  return: {
    status: number;
    message: string;
  };
  entries?: Array<{
    messageid: number;
    status: number;
    statustext: string;
  }>;
}

type SmsProvider = 'console' | 'kavenegar';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly sender: string;
  private readonly otpTemplate: string;
  private readonly provider: SmsProvider;
  private readonly isProduction: boolean;

  constructor(private config: ConfigService) {
    this.apiKey = config.get('KAVENEGAR_API_KEY', '');
    this.sender = config.get('KAVENEGAR_SENDER', '');
    this.otpTemplate = config.get('KAVENEGAR_OTP_TEMPLATE', 'parnegarinlogin');
    this.isProduction = config.get('NODE_ENV') === 'production';
    this.provider = config.get<SmsProvider>(
      'SMS_PROVIDER',
      this.isProduction ? 'kavenegar' : 'console',
    );
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    if (this.provider === 'console' && !this.isProduction) {
      this.logger.log(`[SMS-DEV] ${phone} → OTP: ${code}`);
      return;
    }

    this.ensureKavenegarConfigured();

    const body = new URLSearchParams({
      receptor: phone,
      token: code,
      template: this.otpTemplate,
      type: 'sms',
    });

    try {
      const response = await axios.post<KavenegarResponse>(
        `https://api.kavenegar.com/v1/${this.apiKey}/verify/lookup.json`,
        body.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10_000,
        },
      );

      if (response.data.return.status !== 200) {
        throw new Error(`Kavenegar status ${response.data.return.status}`);
      }
    } catch {
      this.logger.error(`OTP delivery failed for ${this.maskPhone(phone)}`);
      throw new ServiceUnavailableException(
        'ارسال کد تأیید موقتاً امکان‌پذیر نیست؛ لطفاً دوباره تلاش کنید',
      );
    }
  }

  async sendSms(receptor: string, message: string): Promise<void> {
    if (this.provider === 'console' && !this.isProduction) {
      this.logger.log(`[SMS-DEV] to=${receptor} msg=${message}`);
      return;
    }

    this.ensureKavenegarConfigured();

    if (!this.sender) {
      throw new ServiceUnavailableException('خط ارسال پیامک در سامانه تنظیم نشده است');
    }

    try {
      const body = new URLSearchParams({ receptor, sender: this.sender, message });
      await axios.post(
        `https://api.kavenegar.com/v1/${this.apiKey}/sms/send.json`,
        body.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10_000,
        },
      );
    } catch {
      this.logger.error(`SMS delivery failed for ${this.maskPhone(receptor)}`);
      throw new ServiceUnavailableException(
        'ارسال پیامک موقتاً امکان‌پذیر نیست؛ لطفاً دوباره تلاش کنید',
      );
    }
  }

  private ensureKavenegarConfigured(): void {
    if (this.provider !== 'kavenegar' || !this.apiKey) {
      this.logger.error('Kavenegar SMS provider is not configured');
      throw new ServiceUnavailableException('سرویس پیامک سامانه تنظیم نشده است');
    }
  }

  private maskPhone(phone: string): string {
    if (phone.length < 7) return '***';
    return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly sender: string;
  private readonly isDev: boolean;

  constructor(private config: ConfigService) {
    this.apiKey = config.get('KAVENEGAR_API_KEY', '');
    this.sender = config.get('KAVENEGAR_SENDER', '');
    this.isDev = config.get('NODE_ENV') !== 'production';
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    if (this.isDev) {
      this.logger.log(`[SMS-DEV] ${phone} → OTP: ${code}`);
      return;
    }
    await this.sendSms(phone, `کد ورود: ${code}`);
  }

  async sendSms(receptor: string, message: string): Promise<void> {
    if (this.isDev) {
      this.logger.log(`[SMS-DEV] to=${receptor} msg=${message}`);
      return;
    }

    if (!this.apiKey) {
      this.logger.warn('KAVENEGAR_API_KEY not configured');
      return;
    }

    try {
      await axios.post(
        `https://api.kavenegar.com/v1/${this.apiKey}/sms/send.json`,
        { receptor, sender: this.sender, message },
      );
    } catch (err) {
      this.logger.error(`SMS failed to ${receptor}`, err);
    }
  }
}

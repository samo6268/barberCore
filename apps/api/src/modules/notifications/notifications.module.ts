import { Module } from '@nestjs/common';
import { SmsModule } from './sms.module';
import { SmsService } from './sms.service';

@Module({
  imports: [SmsModule],
  providers: [SmsService],
  exports: [SmsModule, SmsService],
})
export class NotificationsModule {}

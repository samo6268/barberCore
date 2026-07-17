import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SalonsModule } from './modules/salons/salons.module';
import { ServicesModule } from './modules/services/services.module';
import { StaffModule } from './modules/staff/staff.module';
import { BookingModule } from './modules/booking/booking.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { AdvertisingModule } from './modules/advertising/advertising.module';
import { EducationModule } from './modules/education/education.module';
import { SuperAdminModule } from './modules/superadmin/superadmin.module';
import { StorageModule } from './modules/storage/storage.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { BoostModule } from './modules/boost/boost.module';
import { FeaturedModule } from './modules/featured/featured.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({ context: 'HTTP' }),
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long', ttl: 60000, limit: 300 },
    ]),
    EventEmitterModule.forRoot({ wildcard: true }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow<string>('REDIS_URL'),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SalonsModule,
    ServicesModule,
    StaffModule,
    BookingModule,
    NotificationsModule,
    MarketplaceModule,
    AdvertisingModule,
    EducationModule,
    SuperAdminModule,
    StorageModule,
    PaymentsModule,
    ReviewsModule,
    SubscriptionsModule,
    BoostModule,
    FeaturedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

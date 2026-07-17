import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlanGuard } from '../../common/guards/plan.guard';

@Module({
  imports: [PrismaModule],
  providers: [
    SubscriptionsService,
    { provide: APP_GUARD, useClass: PlanGuard },
  ],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}

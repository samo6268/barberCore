import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { Plan } from './plan.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/subscriptions')
export class SubscriptionsController {
  constructor(private readonly svc: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'All plan tiers with limits' })
  getPlans() {
    return this.svc.getPlansOverview();
  }

  @Get('salon/:salonId')
  @ApiOperation({ summary: 'Current plan for a salon' })
  getCurrent(@Param('salonId') salonId: string) {
    return this.svc.getCurrentPlan(salonId);
  }

  @Post('salon/:salonId/upgrade')
  @ApiOperation({ summary: 'Upgrade salon plan (admin/payment gateway callback)' })
  upgrade(
    @Param('salonId') salonId: string,
    @Body() body: { plan: Plan; months?: number },
  ) {
    return this.svc.upgradePlan(salonId, body.plan, body.months ?? 1);
  }
}

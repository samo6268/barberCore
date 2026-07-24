import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { Plan } from './plan.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly svc: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'All plan tiers with limits' })
  getPlans() {
    return this.svc.getPlansOverview();
  }

  @Get('salon/:salonId')
  @ApiOperation({ summary: 'Current plan for a salon' })
  getCurrent(@Param('salonId') salonId: string, @CurrentUser() user: JwtPayload) {
    return this.svc.getCurrentPlan(salonId, user);
  }

  @Post('salon/:salonId/upgrade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Upgrade salon plan (admin/payment gateway callback)' })
  upgrade(
    @Param('salonId') salonId: string,
    @Body() body: { plan: Plan; months?: number },
  ) {
    return this.svc.upgradePlan(salonId, body.plan, body.months ?? 1);
  }
}

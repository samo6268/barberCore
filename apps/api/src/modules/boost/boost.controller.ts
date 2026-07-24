import {
  Controller, Post, Get, Body, Param, Query, ParseIntPipe, DefaultValuePipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BoostService } from './boost.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('boost')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('boost')
export class BoostController {
  constructor(private readonly boostService: BoostService) {}

  @Post('attribution')
  @Roles('SALON_OWNER', 'SUPER_ADMIN')
  recordAttribution(
    @Body() dto: { salonId: string; bookingId: string; grossRevenueIRR: number },
  ) {
    return this.boostService.recordAttribution(dto);
  }

  @Get('salon/:salonId/stats')
  @Roles('SALON_OWNER', 'SUPER_ADMIN')
  getSalonStats(
    @Param('salonId') salonId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.boostService.getSalonBoostStats(salonId, days);
  }
}
